import assert from "node:assert/strict";
import test from "node:test";
import { ProjectAnalysisSchema } from "./analysisSchema.js";
import { BudgetEngine } from "./budgetEngine.js";
import { analyzeProject } from "./projectAnalysis.js";
import { StyleAnalysisEngine } from "./styleAnalysisEngine.js";

const project = {
  square_footage: 30,
  house_age: "15-30年",
  budget_range: "200-500萬",
  material_grade: "中高階",
  atmosphere_description: "喜歡北歐自然木質與簡約收納",
  proposal_media: { reference_photos: ["local://reference"] },
};

const styleTest = {
  test_score: { modern: 3, classic: 0, industrial: 0, scandinavian: 8, minimalist: 5, bohemian: 0, japandi: 2, coastal: 0 },
  completed_count: 30,
  total_images: 30,
};

test("StyleAnalysisEngine is deterministic and produces a 100 percent distribution", () => {
  const first = StyleAnalysisEngine.analyze({ project, styleTest });
  const second = StyleAnalysisEngine.analyze({ project, styleTest });
  assert.deepEqual(first, second);
  assert.equal(first.primary_style, "scandinavian");
  assert.equal(first.distribution.reduce((sum, item) => sum + item.percentage, 0), 100);
  assert.ok(first.confidence >= 60);
  assert.ok(first.reasons.length >= 2);
});

test("BudgetEngine returns the selected TWD interval and risk structure", () => {
  const result = BudgetEngine.analyze(project);
  assert.deepEqual(result.estimated_range, { low: 2000000, high: 5000000 });
  assert.equal(result.currency, "TWD");
  assert.ok(Array.isArray(result.risk_flags));
  assert.deepEqual(result, BudgetEngine.analyze(project));
});

test("shared ProjectAnalysisSchema accepts the composed engine output", () => {
  const result = analyzeProject(project, styleTest);
  assert.equal(ProjectAnalysisSchema.safeParse(result).success, true);
  assert.equal(result.deterministic, true);
});

test("cultural preference remains optional, deterministic, and capped at five percent", () => {
  const result = StyleAnalysisEngine.analyze({
    project: { ...project, cultural_preference_enabled: true, birth_date: "1990-10-10", zodiac_sign: "天秤座" },
    styleTest,
  });
  assert.equal(result.evidence.cultural_preference_weight, 0.05);
  assert.equal(result.evidence.zodiac_sign, "天秤座");
  assert.ok(result.reasons.some((reason) => reason.includes("5%")));
  assert.deepEqual(result, StyleAnalysisEngine.analyze({
    project: { ...project, cultural_preference_enabled: true, birth_date: "1990-10-10", zodiac_sign: "天秤座" },
    styleTest,
  }));
});
