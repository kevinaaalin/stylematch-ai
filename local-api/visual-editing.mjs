export const VISUAL_EDITING_SCHEMA_VERSION = "StyleMatch.VisualEditOperation/1.0";

export const VISUAL_EDITING_INTENTS = Object.freeze({
  "VE-01": { key: "redesign_space", label: "重新設計空間", sourceRequired: true },
  "VE-02": { key: "furnish_empty_room", label: "布置空房間", sourceRequired: true },
  "VE-03": { key: "restyle_room", label: "房間換新風格", sourceRequired: true },
  "VE-04": { key: "replace_furniture", label: "替換家具", sourceRequired: true, regionRequired: true },
  "VE-05": { key: "remove_furniture", label: "移除家具", sourceRequired: true, regionRequired: true },
  "VE-06": { key: "edit_wall", label: "新牆面", sourceRequired: true, regionRequired: true },
  "VE-07": { key: "edit_floor", label: "新地板", sourceRequired: true, regionRequired: true },
  "VE-08": { key: "masked_edit", label: "局部 Mask 修改", sourceRequired: true, regionRequired: true },
  "VE-09": { key: "apply_reference", label: "參考圖片套用", sourceRequired: true, referenceRequired: true },
  "VE-10": { key: "sketch_to_render", label: "草圖或線稿轉視覺化", sourceRequired: true },
});

const INTENT_BY_KEY = new Map(Object.entries(VISUAL_EDITING_INTENTS).flatMap(([id, intent]) => [
  [id.toLowerCase(), { id, ...intent }],
  [intent.key, { id, ...intent }],
]));

export function normalizeVisualEditOperation(operation = {}, sourceMediaUrls = []) {
  const requested = String(operation.intent_id || operation.intent || "").trim().toLowerCase();
  if (!requested) return operation;
  const intent = INTENT_BY_KEY.get(requested);
  if (!intent) {
    const error = new Error("Unsupported visual editing intent.");
    error.code = "VISUAL_EDIT_INTENT_INVALID";
    error.details = { supported_intents: Object.keys(VISUAL_EDITING_INTENTS) };
    throw error;
  }

  const sourceRefs = [...new Set((sourceMediaUrls || []).filter(Boolean))];
  const maskRef = operation.mask_ref || null;
  const semanticRegion = operation.semantic_region || null;
  const referenceAssetIds = [...new Set((operation.reference_asset_ids || []).filter(Boolean))];
  if (intent.sourceRequired && sourceRefs.length === 0) throw contractError("Visual editing requires a source image.", "VISUAL_EDIT_SOURCE_REQUIRED");
  if (intent.regionRequired && !maskRef && !semanticRegion) throw contractError("This visual editing intent requires a mask or semantic region.", "VISUAL_EDIT_REGION_REQUIRED");
  if (intent.referenceRequired && referenceAssetIds.length === 0 && sourceRefs.length < 2) throw contractError("Reference application requires a reference asset or second source image.", "VISUAL_EDIT_REFERENCE_REQUIRED");

  return {
    schema_version: VISUAL_EDITING_SCHEMA_VERSION,
    intent_id: intent.id,
    intent: intent.key,
    label: intent.label,
    source_asset_id: operation.source_asset_id || null,
    structured_space_ref: operation.structured_space_ref || null,
    mask_ref: maskRef,
    semantic_region: semanticRegion,
    instruction: String(operation.instruction || "").trim(),
    style_dna: operation.style_dna || null,
    reference_asset_ids: referenceAssetIds,
    preserve_constraints: [...new Set((operation.preserve_constraints || []).filter(Boolean))],
    parent_asset_id: operation.parent_asset_id || null,
    reversible: true,
  };
}

function contractError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}
