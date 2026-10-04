export const STYLE_MIX_VERSION = 'stylemix-candidate-v1';
export const MIX_DIMENSIONS = ['color', 'texture', 'material', 'shape', 'geometry', 'line', 'pattern', 'proportion', 'composition', 'lighting', 'surface', 'detail', 'mood', 'era', 'semantic'];

function ratio(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) throw new Error('Weight must be a number between 0 and 1');
  return value;
}

function validateSource(source) {
  if (!source?.id || !source?.source_ref || !source?.dimensions) throw new Error('Source ID, provenance and dimensions are required');
  for (const [key, item] of Object.entries(source.dimensions)) {
    if (!MIX_DIMENSIONS.includes(key) || typeof item.value !== 'string' || !item.value.trim()) throw new Error('Invalid DNA dimension');
    ratio(item.confidence);
  }
}

export function fuseStyleDNA({ a, b, globalWeight = 0.5, dimensionWeights = {} }) {
  validateSource(a);
  validateSource(b);
  ratio(globalWeight);
  for (const [key, value] of Object.entries(dimensionWeights)) {
    if (!MIX_DIMENSIONS.includes(key)) throw new Error('Unknown dimension weight');
    ratio(value);
  }
  const dimensions = Object.fromEntries(MIX_DIMENSIONS.map((key) => {
    const weight = dimensionWeights[key] ?? globalWeight;
    const contributions = [[a, weight], [b, 1 - weight]].flatMap(([source, share]) => {
      const item = source.dimensions[key];
      return item && share > 0 ? [{ value: item.value, weight: share, confidence: item.confidence, human_confirmed: source.human_confirmed === true, requires_human_confirmation: source.requires_human_confirmation === true, source_ref: source.source_ref, source_id: source.id }] : [];
    });
    return [key, { contributions, confidence: contributions.reduce((sum, item) => sum + item.weight * item.confidence, 0), requires_review: contributions.length === 0 || contributions.some((item) => item.confidence < 0.6) }];
  }));
  return { workflow_version: STYLE_MIX_VERSION, status: 'candidate', parents: [a.id, b.id], global_weight: globalWeight, dimension_weights: { ...dimensionWeights }, dimensions, human_confirmation_required: true, governance_state_changed: false };
}

export function buildStyleMixPrompt(fusion, target, space = '') {
  const targets = { interior: 'interior space', furniture: 'sofa', appliance: 'refrigerator', fashion: 'jacket', sculpture: 'sculpture' };
  if (!Object.hasOwn(targets, target)) throw new Error('Unsupported target');
  if (Object.values(fusion.dimensions).some(dimension => dimension.contributions.some(item => item.requires_human_confirmation && !item.human_confirmed))) throw new Error('Image descriptions require human confirmation');
  const traits = Object.entries(fusion.dimensions).flatMap(([key, dimension]) => dimension.contributions.filter((item) => item.human_confirmed || item.confidence >= 0.6).map((item) => `${key}: ${item.value} (requested share ${Math.round(item.weight * 100)}%)`));
  if (!traits.length) throw new Error('No sufficiently confident visual dimensions');
  const roomNames = { '客廳': 'living room with sofa and seating, no bed', '餐廳': 'dining room', '廚房': 'kitchen', '主臥': 'master bedroom', '主臥室': 'master bedroom', '書房': 'study room', '浴室': 'bathroom' };
  const purpose = typeof space === 'string' ? space.trim().slice(0, 120) : '';
  return { target, prompt: `Design a ${targets[target]}.${purpose ? ` Required space or object: ${roomNames[purpose] || purpose}.` : ''} Translate visual traits, not source objects. Preserve target function and recognizable proportions. ${traits.join('; ')}`, conditioning_weights: null, calibration_required: true, generation_status: 'not_started' };
}
