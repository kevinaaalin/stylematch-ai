// Capture at a fixed desktop width regardless of the reader's mobile viewport.
// Tall sections continue onto additional A4 pages, never squeeze or crop content.
export async function captureProposalPdf(report, { html2canvas, jsPDF }) {
  const container = document.createElement("div");
  container.style.cssText = "position:absolute;left:-10000px;top:0;width:794px;pointer-events:none;";
  const clone = report.cloneNode(true);
  clone.className = "";
  container.appendChild(clone);
  document.body.appendChild(container);
  try {
    await document.fonts.ready;
    await Promise.all([...clone.querySelectorAll("img")].map((image) => new Promise((resolve, reject) => {
      const done = () => { clearTimeout(timer); image.onload = null; image.onerror = null; image.naturalWidth ? resolve() : reject(new Error("IMAGE_UNAVAILABLE")); };
      const timer = setTimeout(() => reject(new Error("IMAGE_TIMEOUT")), 15000);
      image.onload = done;
      image.onerror = done;
      if (image.complete) done();
    })));
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    let count = 0;
    for (const page of clone.querySelectorAll(".proposal-page")) {
      page.style.width = "794px";
      page.style.maxWidth = "none";
      page.style.minHeight = "1047px";
      page.style.height = "auto";
      page.style.padding = "56px";
      page.style.boxShadow = "none";
      // Bound browser canvas memory; do not silently omit oversized content.
      if (page.scrollHeight > 15000) throw new Error("SECTION_TOO_LARGE");
      page.dataset.pdfCapture = "active";
      let regions = [];
      // Measure in html2canvas's desktop clone, not the mobile document.
      const canvas = await html2canvas(page, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff", logging: false, windowWidth: 1280,
        onclone(documentClone) {
          const target = documentClone.querySelector('[data-pdf-capture="active"]');
          // html2canvas does not reliably implement CSS object-fit on <img>.
          // Equivalent contained backgrounds preserve the whole plan/photo.
          for (const image of target.querySelectorAll("img")) {
            const rect = image.getBoundingClientRect();
            const replacement = documentClone.createElement("div");
            replacement.dataset.pdfImage = "true";
            replacement.style.width = `${rect.width}px`;
            replacement.style.height = `${rect.height}px`;
            replacement.style.backgroundImage = `url(${JSON.stringify(image.src)})`;
            replacement.style.backgroundSize = "contain";
            replacement.style.backgroundPosition = "center";
            replacement.style.backgroundRepeat = "no-repeat";
            image.replaceWith(replacement);
          }
          const bounds = target.getBoundingClientRect();
          const rects = [...target.querySelectorAll("[data-pdf-image]")].map((element) => element.getBoundingClientRect());
          const walker = documentClone.createTreeWalker(target, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent.trim()) continue;
            const range = documentClone.createRange();
            range.selectNodeContents(walker.currentNode);
            rects.push(...range.getClientRects());
          }
          regions = rects.map((rect) => [(rect.top - bounds.top) / bounds.width, (rect.bottom - bounds.top) / bounds.width]);
        },
      });
      delete page.dataset.pdfCapture;
      const sliceHeight = Math.ceil(canvas.width * 277 / 210);
      const intervals = regions.map(([start, end]) => [Math.floor(start * canvas.width), Math.ceil(end * canvas.width)]);
      for (let offset = 0; offset < canvas.height;) {
        let end = Math.min(offset + sliceHeight, canvas.height);
        if (end < canvas.height) {
          for (let pass = 0; pass < intervals.length; pass++) {
            const crossing = intervals.filter(([start, bottom]) => start < end && bottom > end && start > offset);
            if (!crossing.length) break;
            const candidate = Math.min(...crossing.map(([start]) => start));
            if (candidate - offset < sliceHeight / 3) break;
            end = candidate;
          }
        }
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = end - offset;
        slice.getContext("2d").drawImage(canvas, 0, offset, slice.width, slice.height, 0, 0, slice.width, slice.height);
        if (count++) pdf.addPage();
        pdf.addImage(slice.toDataURL("image/jpeg", 0.95), "JPEG", 0, 10, 210, Math.min(277, slice.height * 210 / slice.width), undefined, "FAST");
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(`StyleMatch AI | ${count}`, 200, 293, { align: "right" });
        offset = end;
        slice.width = slice.height = 0;
      }
      canvas.width = canvas.height = 0;
    }
    return pdf.output("blob");
  } finally {
    container.remove();
  }
}
