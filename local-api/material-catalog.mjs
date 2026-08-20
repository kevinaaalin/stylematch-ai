export const MATERIAL_CATALOG_VERSION = "StyleMatch.MaterialProductCatalog/1.0";
export const MATERIAL_CATALOG = Object.freeze([
  { id: "mat-oak-natural", type: "material", name: "自然橡木皮", category: "wood", finish: "matte", style_tags: ["japandi", "scandinavian", "modern"], unit: "m2", price_ref: 3200, dimensions: { thickness_mm: 6 }, provider: "stylematch_curated", availability_state: "estimated" },
  { id: "mat-terrazzo-light", type: "material", name: "淺色磨石子", category: "floor", finish: "honed", style_tags: ["modern", "minimal"], unit: "m2", price_ref: 4800, dimensions: { thickness_mm: 15 }, provider: "stylematch_curated", availability_state: "estimated" },
  { id: "mat-wall-white", type: "material", name: "低彩度白色塗料", category: "wall", finish: "eggshell", style_tags: ["minimal", "modern", "scandinavian"], unit: "m2", price_ref: 850, dimensions: {}, provider: "stylematch_curated", availability_state: "estimated" },
  { id: "prd-sofa-neutral", type: "product", name: "中性色三人沙發", category: "seating", finish: "fabric", style_tags: ["modern", "japandi"], unit: "item", price_ref: 42000, dimensions: { width_mm: 2100, depth_mm: 900, height_mm: 780 }, provider: "stylematch_curated", availability_state: "unknown" },
]);

export function searchCatalog({ query = "", category, style_tag } = {}) {
  const needle = String(query).trim().toLowerCase();
  return MATERIAL_CATALOG.filter((item) => (!needle || `${item.id} ${item.name} ${item.category}`.toLowerCase().includes(needle)) && (!category || item.category === category) && (!style_tag || item.style_tags.includes(style_tag))).map((item) => ({ ...item, catalog_version: MATERIAL_CATALOG_VERSION, price_timestamp: "2026-08-17T00:00:00+08:00", source: "StyleMatch local curated catalog", license: "internal_reference", price_state: "estimated" }));
}

export function mapBudget(selections = [], budget = 0) {
  const rows = selections.map((selection) => {
    const item = MATERIAL_CATALOG.find((entry) => entry.id === selection.catalog_id);
    if (!item) return { catalog_id: selection.catalog_id, status: "unknown", subtotal: null };
    const quantity = Math.max(0, Number(selection.quantity) || 0);
    return { catalog_id: item.id, name: item.name, quantity, unit: item.unit, unit_price: item.price_ref, subtotal: Math.round(quantity * item.price_ref), price_state: "estimated" };
  });
  const total = rows.reduce((sum, row) => sum + (row.subtotal || 0), 0);
  return { catalog_version: MATERIAL_CATALOG_VERSION, rows, estimated_total: total, budget: Number(budget) || 0, remaining: (Number(budget) || 0) - total, within_budget: total <= (Number(budget) || 0), snapshot: true };
}
