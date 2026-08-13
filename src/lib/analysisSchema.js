import { z } from "zod";
import { STYLE_KEYS, STYLE_LABELS, normalizeStyleId } from "../data/styleCatalog.js";

export const ANALYSIS_SCHEMA_VERSION = "stylematch.analysis.v2";
export const ANALYSIS_ENGINE_VERSION = "deterministic-30style-2026.08";

export { STYLE_KEYS, STYLE_LABELS };
const LEGACY_STYLE_IDS = { classic: "european_classic", japandi: "japanese" };

export const StyleDistributionItemSchema = z.object({
  key: z.enum(STYLE_KEYS),
  label: z.string().min(1),
  percentage: z.number().min(0).max(100),
});

export const StyleAnalysisSchema = z.object({
  engine_version: z.string().min(1),
  primary_style: z.enum(STYLE_KEYS),
  primary_style_label: z.string().min(1),
  secondary_style: z.enum(STYLE_KEYS).nullable(),
  secondary_style_label: z.string().nullable(),
  distribution: z.array(StyleDistributionItemSchema).length(STYLE_KEYS.length),
  confidence: z.number().min(0).max(100),
  confidence_level: z.enum(["low", "medium", "high"]),
  reasons: z.array(z.string().min(1)).min(1),
  evidence: z.object({
    source: z.enum(["style_test", "project_requirements"]),
    completed: z.number(),
    total: z.number(),
    cultural_preference_weight: z.number().min(0).max(0.05),
    zodiac_sign: z.string().nullable(),
  }),
});

export const BudgetAnalysisSchema = z.object({
  engine_version: z.string().min(1),
  currency: z.literal("TWD"),
  estimated_range: z.object({ low: z.number().nonnegative(), high: z.number().nonnegative() }),
  formatted_range: z.string().min(1),
  basis: z.string().min(1),
  assumptions: z.record(z.union([z.string(), z.number(), z.boolean()])),
  contingency: z.number().nonnegative(),
  confidence: z.number().min(0).max(100),
  risk_flags: z.array(z.object({ level: z.enum(["low", "medium", "high"]), code: z.string(), message: z.string() })),
  disclaimer: z.string().min(1),
});

export const ProjectAnalysisSchema = z.object({
  schema_version: z.literal(ANALYSIS_SCHEMA_VERSION),
  engine_version: z.literal(ANALYSIS_ENGINE_VERSION),
  deterministic: z.literal(true),
  style: StyleAnalysisSchema,
  budget: BudgetAnalysisSchema,
});

export function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

export function normalizeDistribution(scores = {}) {
  const migrated = {};
  Object.entries(scores).forEach(([rawKey, score]) => {
    const key = LEGACY_STYLE_IDS[rawKey] || normalizeStyleId(rawKey);
    migrated[key] = (migrated[key] || 0) + Math.max(0, Number(score) || 0);
  });
  const positive = STYLE_KEYS.map((key) => [key, migrated[key] || 0]);
  const total = positive.reduce((sum, [, score]) => sum + score, 0);
  const source = total > 0 ? positive : STYLE_KEYS.map((key) => [key, key === "modern" ? 1 : 0]);
  const denominator = source.reduce((sum, [, score]) => sum + score, 0) || 1;
  const rounded = source
    .map(([key, score]) => ({
    key,
    label: STYLE_LABELS[key],
    percentage: round((score / denominator) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage || a.key.localeCompare(b.key));
  const delta = 100 - rounded.reduce((sum, item) => sum + item.percentage, 0);
  if (rounded.length) rounded[0].percentage += delta;
  return rounded;
}

export function createProjectAnalysis({ style, budget }) {
  return ProjectAnalysisSchema.parse({
    schema_version: ANALYSIS_SCHEMA_VERSION,
    engine_version: ANALYSIS_ENGINE_VERSION,
    deterministic: true,
    style,
    budget,
  });
}

export function isProjectAnalysis(value) {
  return ProjectAnalysisSchema.safeParse(value).success;
}
