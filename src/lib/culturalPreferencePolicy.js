import { STYLE_KEYS, normalizeDistribution } from './analysisSchema.js';

export const CULTURAL_POLICY_VERSION = 'cultural-preference-20260926-v1';

export function evaluateCulturalPreference(baseScores, input = {}) {
  const baseline = normalizeDistribution(baseScores);
  const active = input.consent === true && !input.revoked_at && input.verified === true;
  const signals = [];
  for (const [kind, cap] of [['bazi', 0.15], ['zodiac', 0.10]]) {
    const signal = input[kind];
    if (!active || !signal || signal.verified !== true || typeof signal.confidence !== 'number' || !Number.isFinite(signal.confidence) || signal.confidence <= 0 || signal.confidence > 1 || !signal.source_ref || !STYLE_KEYS.includes(signal.style_id)) continue;
    const requested = signal.weight ?? cap;
    if (typeof requested !== 'number' || !Number.isFinite(requested) || requested < 0) continue;
    signals.push({ kind, style_id: signal.style_id, weight: Math.min(requested, cap), confidence: signal.confidence, source_ref: signal.source_ref });
  }
  const weight = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const mixed = Object.fromEntries(baseline.map(item => [item.key, item.percentage * (1 - weight)]));
  for (const signal of signals) mixed[signal.style_id] += signal.weight * 100;
  const candidate = weight > 0 ? normalizeDistribution(mixed) : baseline;
  const reasons = [];
  if (weight > 0.15) reasons.push('CULTURAL_WEIGHT_OVER_15_PERCENT');
  if (weight > 0 && input.birth_time_uncertain === true) reasons.push('BIRTH_TIME_UNCERTAIN');
  if (weight > 0 && input.school_conflict === true) reasons.push('SCHOOL_CONFLICT');
  if (weight > 0 && candidate.slice(0, 2).some((item, index) => item.key !== baseline[index].key)) reasons.push('STYLE_RANK_CHANGED');
  const blocked = reasons.length > 0;
  return { policy_version: CULTURAL_POLICY_VERSION, eligible_weight: weight, applied_weight: blocked ? 0 : weight, signals, manual_review_required: blocked, review_reasons: reasons, status: blocked ? 'WAITING_APPROVAL' : 'READY', baseline, candidate, distribution: blocked ? baseline : candidate };
}
