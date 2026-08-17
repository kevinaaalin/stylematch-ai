export const VISUAL_EDITING_INTENTS = [
  { id: "VE-01", key: "redesign_space", label: "重新設計空間", description: "保留主要空間結構，重整整體設計。" },
  { id: "VE-02", key: "furnish_empty_room", label: "布置空房間", description: "依尺度與風格加入家具。" },
  { id: "VE-03", key: "restyle_room", label: "房間換新風格", description: "套用 Style DNA 或指定參考風格。" },
  { id: "VE-04", key: "replace_furniture", label: "替換家具", description: "替換 Mask 或語意區域內的家具。", regionRequired: true },
  { id: "VE-05", key: "remove_furniture", label: "移除家具", description: "移除指定家具並補齊背景。", regionRequired: true },
  { id: "VE-06", key: "edit_wall", label: "新牆面", description: "修改指定牆面的材質、色彩或造型。", regionRequired: true },
  { id: "VE-07", key: "edit_floor", label: "新地板", description: "修改地坪材質、方向或色調。", regionRequired: true },
  { id: "VE-08", key: "masked_edit", label: "局部 Mask 修改", description: "只修改選定區域。", regionRequired: true },
  { id: "VE-09", key: "apply_reference", label: "參考圖片套用", description: "以另一張參考圖約束風格與材質。", referenceRequired: true },
  { id: "VE-10", key: "sketch_to_render", label: "草圖轉視覺化", description: "將草圖或線稿轉為空間方案。" },
];

export const visualEditingIntent = (intentId) => VISUAL_EDITING_INTENTS.find((item) => item.id === intentId) || VISUAL_EDITING_INTENTS[0];
