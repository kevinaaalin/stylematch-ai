import { proposalExportPages } from './proposalExportContent.js';
import { fetchTaskImage } from './aiTaskImage.js';

async function imageData(url) {
  const parsed = new URL(url, window.location.href);
  if (!['http:', 'https:', 'data:'].includes(parsed.protocol)) throw new Error('不支援的圖片來源。');
  let blob;
  if (/^\/api\/v1\/ai\/image-tasks\/[^/]+\/image$/.test(parsed.pathname)) blob = await fetchTaskImage(parsed.href);
  else {
    const response = await fetch(parsed.href, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`圖片讀取失敗：HTTP ${response.status}`);
    blob = await response.blob();
  }
  if (!blob.type.startsWith('image/') || blob.size > 30 * 1024 * 1024) throw new Error('圖片格式或容量不符。');
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height, element: canvas };
  } finally { bitmap.close(); }
}

function fit(image, width, height) {
  const ratio = Math.min(width / image.width, height / image.height);
  return { width: image.width * ratio, height: image.height * ratio };
}

export async function exportFrozenProposal(documentData, format) {
  if (!['docx', 'pptx', 'pdf'].includes(format)) throw new Error('不支援的匯出格式。');
  const pages = proposalExportPages(documentData);
  const cache = new Map();
  for (const page of pages) {
    if (page.image && !cache.has(page.image)) cache.set(page.image, await imageData(page.image));
  }
  const footer = index => `${documentData.version_id} | ${index + 1}/${pages.length} | DRAFT`;
  if (format === 'docx') {
    const { Document, Packer, Paragraph, TextRun, ImageRun, PageBreak } = await import('docx');
    const children = [];
    pages.forEach((page, index) => {
      if (index) children.push(new Paragraph({ children: [new PageBreak()] }));
      children.push(new Paragraph({ children: [new TextRun({ text: page.title, bold: true, size: 36 })], spacing: { after: 240 } }));
      for (const line of page.lines) children.push(new Paragraph({ children: [new TextRun({ text: line, size: 22 })], spacing: { after: 100 } }));
      if (page.image) {
        const image = cache.get(page.image);
        children.push(new Paragraph({ children: [new ImageRun({ type: 'png', data: image.data.split(',')[1], transformation: fit(image, 560, 620) })] }));
      }
      children.push(new Paragraph({ children: [new TextRun({ text: footer(index), size: 16, color: '666666' })], spacing: { before: 240 } }));
    });
    return Packer.toBlob(new Document({ styles: { default: { document: { run: { font: 'Microsoft JhengHei' } } } }, sections: [{ properties: {}, children }] }));
  }
  if (format === 'pptx') {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const deck = new PptxGenJS();
    deck.layout = 'LAYOUT_WIDE'; deck.author = 'StyleMatch AI'; deck.subject = documentData.version_id;
    pages.forEach((page, index) => {
      const slide = deck.addSlide();
      slide.addText(page.title, { x: 0.65, y: 0.35, w: 12, h: 0.65, fontFace: 'Microsoft JhengHei', fontSize: 24, bold: true });
      slide.addText(page.lines.join('\n'), { x: 0.65, y: 1.15, w: 12, h: page.image ? 0.75 : 5.6, fontFace: 'Microsoft JhengHei', fontSize: 17, breakLine: false, valign: 'top', margin: 0, lineSpacingMultiple: 1.05 });
      if (page.image) {
        const image = cache.get(page.image); const size = fit(image, 11.8, 4.7);
        slide.addImage({ data: image.data, x: (13.333 - size.width) / 2, y: 1.95, w: size.width, h: size.height });
      }
      slide.addText(footer(index), { x: 0.65, y: 7.05, w: 12, h: 0.25, fontSize: 9, color: '666666', margin: 0 });
    });
    return deck.write({ outputType: 'blob' });
  }
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  await document.fonts.ready;
  pages.forEach((page, index) => {
    const canvas = document.createElement('canvas'); canvas.width = 1240; canvas.height = 1754;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#161616'; ctx.font = 'bold 38px "Microsoft JhengHei", sans-serif';
    ctx.fillText(page.title, 85, 115, 1070);
    ctx.font = '26px "Microsoft JhengHei", sans-serif';
    page.lines.forEach((line, i) => ctx.fillText(line, 85, 210 + i * 65, 1070));
    if (page.image) {
      const image = cache.get(page.image); const size = fit(image, 1070, 1160);
      ctx.drawImage(image.element, (1240 - size.width) / 2, 310, size.width, size.height);
    }
    ctx.font = '18px sans-serif'; ctx.fillText(footer(index), 85, 1675, 1070);
    if (index) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, 210, 297);
  });
  return pdf.output('blob');
}
