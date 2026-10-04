import {
  ANALYSIS_ENGINE_VERSION,
  STYLE_KEYS,
  STYLE_LABELS,
  clamp,
  round,
} from "./analysisSchema.js";
import { STYLE_CATALOG, normalizeStyleId } from "../data/styleCatalog.js";
import { evaluateCulturalPreference } from './culturalPreferencePolicy.js';

const keywordSignals = Object.fromEntries(STYLE_CATALOG.map((style) => [
  style.id,
  [...style.aliases, style.name, ...style.keywords, ...style.materials, ...style.palette]
    .map((value) => String(value).toLowerCase()),
]));

function scoreFromText(project = {}) {
  const text = [project.atmosphere_description, project.special_requirements, project.preferred_style, project.style]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return Object.fromEntries(STYLE_KEYS.map((key) => [
    key,
    keywordSignals[key].reduce((score, keyword) => score + (text.includes(keyword) ? 2 : 0), 0),
  ]));
}

export class StyleAnalysisEngine {
  static analyze({ project = {}, styleTest = null } = {}) {
    const testScores = styleTest?.test_score && typeof styleTest.test_score === "object"
      ? styleTest.test_score
      : null;
    const scores = { ...(testScores || scoreFromText(project)) };
    const explicitStyle = project.primary_style || project.preferred_style || project.style;
    if (explicitStyle) {
      const explicitId = normalizeStyleId(explicitStyle);
      const maximum = Math.max(1, ...Object.values(scores).map(Number));
      scores[explicitId] = (Number(scores[explicitId]) || 0) + maximum * 2;
    }
    const culture = evaluateCulturalPreference(scores, project.cultural_preference_enabled ? project.cultural_preference : {});
    const distribution = culture.distribution;
    const evidenceCount = Number(styleTest?.completed_count) || 0;
    const evidenceTotal = Number(styleTest?.total_images) || 0;
    const coverage = evidenceTotal > 0 ? evidenceCount / evidenceTotal : 0;
    const margin = (distribution[0]?.percentage || 0) - (distribution[1]?.percentage || 0);
    const textHasSignals = Object.values(scores).some((score) => Number(score) > 0);
    const confidence = styleTest
      ? round(clamp(45 + coverage * 40 + margin * 0.3, 0, 98))
      : round(clamp((textHasSignals ? 42 : 25) + margin * 0.25, 0, 75));
    const primary = distribution[0];
    const secondary = distribution[1];
    const reasons = [
      styleTest
        ? `依 ${evidenceCount}/${evidenceTotal || evidenceCount} 張風格評分計算。`
        : "目前依需求文字中的風格、材質與氛圍關鍵訊號計算。",
      `主要風格為${primary.label}（${primary.percentage}%），與次要風格相差 ${Math.max(0, margin)} 個百分點。`,
      confidence < 60
        ? "信心尚低，建議補做風格測試或增加參考圖片。"
        : `次要偏好為${secondary.label}，可作為材質與軟裝的搭配方向。`,
    ];
    if (culture.eligible_weight) reasons.push(`文化偏好候選權重 ${Math.round(culture.eligible_weight * 100)}%；${culture.manual_review_required ? '須人工覆核，尚未套用' : '僅作設計偏好參考'}，不作命理或風水判定。`);
    return {
      engine_version: `${ANALYSIS_ENGINE_VERSION}+${culture.policy_version}`,
      primary_style: primary.key,
      primary_style_label: STYLE_LABELS[primary.key],
      secondary_style: secondary?.key || null,
      secondary_style_label: secondary?.label || null,
      distribution,
      confidence,
      confidence_level: confidence >= 80 ? "high" : confidence >= 60 ? "medium" : "low",
      reasons,
      cultural_policy: culture,
      evidence: {
        source: styleTest ? "style_test" : "project_requirements",
        completed: evidenceCount,
        total: evidenceTotal,
        cultural_preference_weight: culture.applied_weight,
        zodiac_sign: null,
      },
    };
  }
}
