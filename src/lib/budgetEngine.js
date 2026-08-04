import { ANALYSIS_ENGINE_VERSION, clamp, round } from "./analysisSchema.js";

const gradeMultipliers = [
  { signals: ["高", "premium", "奢華"], value: 1.35, label: "高階材質" },
  { signals: ["經濟", "basic"], value: 0.82, label: "經濟材質" },
];

function selectedBudgetRange(value = "") {
  const numbers = String(value).match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  const isTenThousands = /萬/.test(String(value));
  if (numbers.length >= 2) return { low: numbers[0] * (isTenThousands ? 10000 : 1), high: numbers[1] * (isTenThousands ? 10000 : 1), source: "selected_range" };
  if (numbers.length === 1 && /以上|以[上]/.test(String(value))) return { low: numbers[0] * (isTenThousands ? 10000 : 1), high: numbers[0] * (isTenThousands ? 14000 : 1.4), source: "selected_floor" };
  if (numbers.length === 1 && /以下|以[下]/.test(String(value))) return { low: numbers[0] * (isTenThousands ? 6500 : 0.65), high: numbers[0] * (isTenThousands ? 10000 : 1), source: "selected_ceiling" };
  return null;
}

function materialFactor(materialGrade = "") {
  const text = String(materialGrade).toLowerCase();
  return gradeMultipliers.find((item) => item.signals.some((signal) => text.includes(signal))) || { value: 1, label: "標準材質" };
}

export class BudgetEngine {
  static analyze(project = {}) {
    const area = Math.max(1, Number(project.square_footage) || 25);
    const selected = selectedBudgetRange(project.budget_range);
    const grade = materialFactor(project.material_grade);
    const ageText = String(project.house_age || "");
    const oldHouse = /30|老屋/.test(ageText);
    const ageFactor = oldHouse ? 1.18 : 1;
    const basePerPing = 85000;
    const modeledLow = area * basePerPing * 0.82 * grade.value * ageFactor;
    const modeledHigh = area * basePerPing * 1.18 * grade.value * ageFactor;
    const low = Math.round((selected?.low || modeledLow) / 10000) * 10000;
    const high = Math.max(low, Math.round((selected?.high || modeledHigh) / 10000) * 10000);
    const midpoint = (low + high) / 2;
    const contingencyRate = oldHouse ? 0.15 : 0.1;
    const riskFlags = [];
    if (!project.square_footage) riskFlags.push({ level: "high", code: "AREA_MISSING", message: "未提供坪數，預算採 25 坪基準估算。" });
    if (!selected) riskFlags.push({ level: "medium", code: "BUDGET_RANGE_UNSTRUCTURED", message: "未取得明確預算上下限，改以坪數與材質等級估算。" });
    if (oldHouse) riskFlags.push({ level: "high", code: "OLD_HOUSE_ALLOWANCE", message: "屋齡較高，已提高基礎工程與不可預見項目係數。" });
    if ((project.reference_photo_count || project.proposal_media?.reference_photos?.length || 0) === 0) riskFlags.push({ level: "low", code: "REFERENCE_MISSING", message: "缺少參考圖片，材料與工法假設仍需設計師確認。" });
    return {
      engine_version: ANALYSIS_ENGINE_VERSION,
      currency: "TWD",
      estimated_range: { low, high },
      formatted_range: `NT$ ${Math.round(low / 10000)}–${Math.round(high / 10000)} 萬`,
      basis: selected?.source || "area_material_model",
      assumptions: {
        area_ping: area,
        base_per_ping: basePerPing,
        material_factor: grade.value,
        material_label: grade.label,
        age_factor: ageFactor,
        contingency_rate: contingencyRate,
      },
      contingency: round(midpoint * contingencyRate),
      confidence: round(clamp((project.square_footage ? 45 : 25) + (selected ? 35 : 10) + (project.material_grade ? 10 : 0), 0, 92)),
      risk_flags: riskFlags,
      disclaimer: "本結果為 deterministic MVP 區間估算，不等同正式報價；仍須依圖說、現場條件與廠商報價確認。",
    };
  }
}
