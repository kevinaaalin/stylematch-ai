const furniture = {
  '客廳': 'a full-size sofa, coffee table, area rug and lounge chair',
  'living room': 'a full-size sofa, coffee table, area rug and lounge chair',
  '客餐廳（開放式）': 'a sofa, coffee table, rug, dining table and dining chairs',
  '主臥室': 'a bed with bedding, bedside tables and wardrobe',
  '臥室': 'a bed with bedding, bedside tables and wardrobe',
  '餐廳': 'a dining table, dining chairs and sideboard',
};

export function photoDesignPolicy(mode, space) {
  const redesign = mode === '保留格局，重新設計家具與材質';
  const free = mode === '自由創意重新設計';
  return {
    denoise: redesign ? 0.85 : free ? 0.92 : 0.72,
    prompt: redesign || free
      ? `Fully furnished, occupied design layout with ${furniture[space] || 'functional furniture appropriate to this room'}. Clearly visible furniture in the foreground and midground. ${free ? 'Create a new interior layout.' : 'Keep the source camera viewpoint, walls, windows and doors; place furniture on the existing floor without blocking doors or circulation.'}`
      : 'Preserve the existing layout and main objects; refine finishes and lighting.',
    negative: redesign || free ? 'empty room, unfurnished room, bare room, missing furniture' : '',
  };
}
