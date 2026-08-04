import { createProjectAnalysis, isProjectAnalysis } from "./analysisSchema.js";
import { BudgetEngine } from "./budgetEngine.js";
import { StyleAnalysisEngine } from "./styleAnalysisEngine.js";

export function analyzeProject(project = {}, styleTest = null) {
  return createProjectAnalysis({
    style: StyleAnalysisEngine.analyze({ project, styleTest }),
    budget: BudgetEngine.analyze(project),
  });
}

export function ensureProjectAnalysis(project = {}, styleTest = null) {
  return isProjectAnalysis(project.analysis) ? project.analysis : analyzeProject(project, styleTest);
}
