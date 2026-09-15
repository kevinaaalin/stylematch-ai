export const ASSET_TYPES = Object.freeze(["image", "sketch", "floor_plan", "panorama", "proposal", "style_profile", "budget_scenario", "material_set", "cost_item_set"]);

export function assetType(asset) {
  if (asset?.asset_type) return ASSET_TYPES.includes(asset.asset_type) ? asset.asset_type : null;
  const role = asset?.image_role || "";
  if (/panorama|equirectangular/.test(role)) return "panorama";
  if (role === "floor_plan") return "floor_plan";
  if (/sketch/.test(role)) return "sketch";
  return asset?.image_url ? "image" : null;
}

export function acceptsAsset(workflow, asset) {
  if (asset?.status === "archived") return false;
  const inputs = {
    AIGenerate: ["image", "sketch"], ReferenceCanvas: ["image", "sketch"],
    FloorPlanVisualizer: ["floor_plan"], PanoramaViewer: ["panorama"],
    ProposalReport: ["proposal"], BudgetScenarioEditor: ["budget_scenario", "cost_item_set"],
  };
  return Boolean(inputs[workflow]?.includes(assetType(asset)));
}
