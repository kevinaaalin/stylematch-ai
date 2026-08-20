export const VIEWSET_SCHEMA_VERSION = "StyleMatch.ViewSet/1.0";

const unique = (values = []) => [...new Set(values.filter(Boolean))].sort();
const overlapScore = (anchor, current) => {
  const expected = unique(anchor); const actual = new Set(current || []);
  if (!expected.length) return 100;
  return Math.round(expected.filter((item) => actual.has(item)).length / expected.length * 100);
};

export function validateViewSet(payload = {}) {
  const anchor = payload.anchor_state || {};
  const views = Array.isArray(payload.views) ? payload.views : [];
  const reports = views.map((view) => {
    const objectScore = overlapScore(anchor.object_ids, view.object_ids);
    const materialScore = overlapScore(anchor.material_ids, view.material_ids);
    const cameraValid = Boolean(view.camera_ref && Number.isFinite(Number(view.camera_ref.fov)) && Number(view.camera_ref.fov) > 0);
    const geometryValid = !anchor.structured_space_ref || view.structured_space_ref === anchor.structured_space_ref;
    const score = Math.round(objectScore * 0.4 + materialScore * 0.3 + (cameraValid ? 15 : 0) + (geometryValid ? 15 : 0));
    const issues = [
      ...(objectScore < 100 ? ["OBJECT_IDENTITY_DRIFT"] : []),
      ...(materialScore < 100 ? ["MATERIAL_IDENTITY_DRIFT"] : []),
      ...(!cameraValid ? ["CAMERA_CONTRACT_INVALID"] : []),
      ...(!geometryValid ? ["STRUCTURED_SPACE_MISMATCH"] : []),
    ];
    return { view_id: view.view_id, score, valid: issues.length === 0, issues };
  });
  const score = reports.length ? Math.round(reports.reduce((sum, item) => sum + item.score, 0) / reports.length) : 0;
  return { schema_version: VIEWSET_SCHEMA_VERSION, consistency_score: score, valid: reports.length > 0 && reports.every((item) => item.valid), view_reports: reports, regeneration_refs: reports.filter((item) => !item.valid).map((item) => item.view_id), selective_retry: true };
}
