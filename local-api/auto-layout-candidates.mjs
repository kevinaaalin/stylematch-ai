const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function roomBounds(room) {
  if (room?.bounds && ["x", "y", "width", "depth"].every((key) => Number.isFinite(Number(room.bounds[key])))) return room.bounds;
  if (!Array.isArray(room?.polygon) || room.polygon.length < 3) return null;
  const xs = room.polygon.map((point) => number(point[0]));
  const ys = room.polygon.map((point) => number(point[1]));
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), depth: Math.max(...ys) - Math.min(...ys) };
}

function placeFromCorner(items, bounds, corner, margin) {
  let cursor = margin;
  return items.map((item) => {
    const width = number(item.width, 800); const depth = number(item.depth, 800);
    const x = corner.includes("right") ? number(bounds.x) + number(bounds.width) - width - margin : number(bounds.x) + margin;
    const y = corner.includes("bottom") ? number(bounds.y) + number(bounds.depth) - depth - cursor : number(bounds.y) + cursor;
    cursor += depth + margin;
    return { ...item, x: Math.round(x), y: Math.round(y), width, depth, rotation: number(item.rotation) };
  });
}

function preferenceScore(items, context) {
  const mustHave = new Set((context?.must_have || []).map(String));
  const avoid = new Set((context?.avoid || []).map(String));
  const available = new Set(items.flatMap((item) => [item.id, item.catalog_id, item.category, ...(item.tags || [])].filter(Boolean).map(String)));
  const missingMustHave = [...mustHave].filter((value) => !available.has(value));
  const presentAvoid = [...avoid].filter((value) => available.has(value));
  const preferredStyles = new Set([context?.style_dna?.primary_style, context?.style_dna?.secondary_style, ...(context?.style_dna?.tags || [])].filter(Boolean).map(String));
  const styled = items.filter((item) => (item.style_tags || item.tags || []).some((tag) => preferredStyles.has(String(tag)))).length;
  const estimatedCost = items.reduce((sum, item) => sum + number(item.estimated_cost), 0);
  const budgetLimit = number(context?.budget?.design_allocation || context?.budget?.total);
  return {
    missing_must_have: missingMustHave,
    present_avoid: presentAvoid,
    style_match: items.length ? Math.round((styled / items.length) * 100) : 50,
    estimated_cost: estimatedCost,
    budget_limit: budgetLimit || null,
    budget_fit: !budgetLimit || estimatedCost <= budgetLimit ? 100 : Math.max(0, Math.round((budgetLimit / estimatedCost) * 100)),
  };
}

export function generateAutoLayoutCandidates(structuredSpace, placements, validate, context = {}) {
  const source = Array.isArray(placements) ? placements : [];
  const rooms = new Map((structuredSpace?.rooms || []).map((room) => [room.id, room]));
  const grouped = new Map();
  for (const item of source) grouped.set(item.room_id, [...(grouped.get(item.room_id) || []), item]);
  const strategies = [
    { id: "balanced", label: "均衡配置", corner: "top-left", margin: 450, rationale: "保留中央活動區，家具由主要牆角依序配置。" },
    { id: "circulation_first", label: "動線優先", corner: "top-right", margin: 700, rationale: "提高牆邊退縮，優先保留入口與主要通行帶。" },
    { id: "compact", label: "緊湊配置", corner: "bottom-left", margin: 250, rationale: "縮短家具間距，保留較大的連續可用區域。" },
  ];
  return strategies.map((strategy) => {
    const candidatePlacements = [];
    for (const [roomId, items] of grouped) {
      const bounds = roomBounds(rooms.get(roomId));
      candidatePlacements.push(...(bounds ? placeFromCorner(items, bounds, strategy.corner, strategy.margin) : items));
    }
    const validation = validate(structuredSpace, candidatePlacements, context);
    const preference = preferenceScore(candidatePlacements, context);
    const functionalScore = validation.score;
    const strategyFit = context?.family_profile?.accessibility_required
      ? (strategy.id === "circulation_first" ? 100 : strategy.id === "balanced" ? 70 : 55)
      : strategy.id === "balanced" ? 90 : 80;
    const score = Math.round(functionalScore * 0.55 + preference.style_match * 0.2 + preference.budget_fit * 0.15 + strategyFit * 0.1);
    return { candidate_id: strategy.id, label: strategy.label, rationale: strategy.rationale, placements: candidatePlacements, validation, preference, score,
      score_components: { functional: functionalScore, style: preference.style_match, budget: preference.budget_fit, household: strategyFit }, context_version: "AL01-context-1.0" };
  }).sort((left, right) => right.score - left.score || left.candidate_id.localeCompare(right.candidate_id)).map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}
