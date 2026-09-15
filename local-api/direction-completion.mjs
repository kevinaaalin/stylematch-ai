export const DIRECTIONS = ["front", "right", "back", "left"];
export function validateDirectionCompletion(capture) {
  const concept = capture?.input_mode === "concept_direction_completion";
  if (!concept && capture?.input_mode !== "partial_direction_completion") throw new Error("Invalid direction completion mode");
  if (capture.shared_center_confirmed !== true) throw new Error("請確認照片屬於同一空間與共同拍攝中心。");
  const views = capture.ordered_sources;
  if (!Array.isArray(views) || (concept ? views.length !== 0 || capture.concept_only_confirmed !== true : views.length < 1 || views.length > 4)) throw new Error("照片補生成需要 1–4 個方向；零照片需確認純概念設計。");
  if (new Set(views.map((view) => view.id)).size !== views.length || new Set(views.map((view) => view.media_url)).size !== views.length) throw new Error("方向與來源照片不得重複。");
  for (const view of views) if (!DIRECTIONS.includes(view.id) || view.yaw !== DIRECTIONS.indexOf(view.id) * 90 || typeof view.media_url !== "string" || !view.media_url) throw new Error("方向與角度不一致。");
  const fov = Number(capture.horizontal_fov_degrees);
  if (!Number.isFinite(fov) || fov <= 90 || fov >= 180) throw new Error("水平視角須介於 90 與 180 度以保留重疊。");
  return views;
}
