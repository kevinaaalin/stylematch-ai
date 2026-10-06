import { proposalImageProvenance } from './proposalImageProvenance.js';

const labels = {
  title: '主題', narrative: '設計說明', planning: '空間規劃', requirement: '特殊需求',
  keywords: '風格重點', palette: '配色', materials: '材質', prompt: '生成描述',
  id: '識別碼', name: '方案', ratio: '比例', description: '說明', tradeoff: '取捨', recommended: '建議採用',
  category: '項目', suggestion: '建議', note: '備註', engine_version: '估算版本', currency: '幣別',
  estimated_range: '估算區間', low: '下限', high: '上限', formatted_range: '預算', basis: '依據',
  assumptions: '估算假設', area_ping: '坪數', base_per_ping: '每坪基準', material_factor: '材質係數',
  material_label: '材質等級', age_factor: '屋齡係數', contingency_rate: '預備金比例', contingency: '預備金',
  confidence: '信心指標', risk_flags: '風險提示', level: '等級', code: '代碼', message: '說明', disclaimer: '限制',
};

function lines(value, prefix = '') {
  if (value == null || value === '') return [];
  if (typeof value === 'boolean') return [`${prefix}${value ? '是' : '否'}`];
  if (Array.isArray(value)) return value.flatMap(item => lines(item, prefix));
  if (typeof value === 'object') return Object.entries(value).flatMap(([key, item]) => lines(item, `${prefix}${labels[key] || key}：`));
  return [`${prefix}${value}`];
}

// Every renderer consumes the same bounded pages; no renderer rebuilds analysis.
export function proposalExportPages(document) {
  if (document?.schema_version !== 'proposal-document-v1' || !document.version_id || !document.proposal || !document.delivery) {
    throw new Error('缺少凍結提案版本。');
  }
  const p = document.proposal;
  const sections = [
    [p.title, [`${p.caseCode} / ${document.version_id}`, `建立時間：${document.created_at}`, '提案草稿，非施工或工程核准文件', p.disclaimer]],
    ['案件需求', (p.facts || []).map(pair => pair.join('：'))],
    ['設計概念', lines(p.concept)],
    ['風格與材料方向', lines(p.toneManner)],
    ['設計方案', lines(p.designOptions)],
    ['材料建議', lines(p.materials)],
    ['預算分析', [p.budgetNote, ...lines(p.analysis?.budget)]],
    ['待確認事項', document.delivery.pending || []],
  ];
  const pages = [];
  for (const [title, paragraphs] of sections) {
    const wrapped = paragraphs.filter(Boolean).flatMap(text => {
      const chars = Array.from(String(text));
      return Array.from({ length: Math.ceil(chars.length / 38) }, (_, i) => chars.slice(i * 38, (i + 1) * 38).join(''));
    });
    for (let i = 0; i < Math.max(1, wrapped.length); i += 16) {
      pages.push({ title, lines: wrapped.slice(i, i + 16) });
    }
  }
  const images = [
    ...(document.delivery.adopted || []).map(image => ({ title: `${image.status === 'candidate' ? '候選參考圖片' : '採用圖片'} ${image.space || ''}`, url: image.image_url, ref: `${image.revision_id} / v${image.version || ''}`, provenance: proposalImageProvenance(image) })),
    ...(p.floorPlans || []).map((url, i) => ({ title: '平面圖', url, ref: `floorplan-${i + 1}` })),
    ...(p.references || []).map((url, i) => ({ title: '喜好參考圖片', url, ref: `reference-${i + 1}` })),
  ];
  for (const image of images) {
    if (!image.url) throw new Error('圖片來源不完整。');
    pages.push({ title: image.title, lines: [image.ref, image.provenance].filter(Boolean), image: image.url });
  }
  return pages;
}
