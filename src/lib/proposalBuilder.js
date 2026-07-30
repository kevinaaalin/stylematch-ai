const roomLabels = {
  floor_plan: "平面配置",
  living_room: "客廳",
  dining_room: "餐廳",
  kitchen: "廚房",
  master_bedroom: "主臥室",
  study_room: "書房",
  bedroom1: "臥室一",
  bedroom2: "臥室二",
  bathroom: "衛浴",
};

const materialDirections = [
  ["地坪", "霧面木紋地板、耐磨石英磚", "天然木皮地板、大板磚或石材", "公共空間重視耐磨與連續性，濕區優先採防滑材質。"],
  ["牆面", "低彩度乳膠漆、局部機能塗料", "礦物塗料、木皮或天然石材", "以主牆建立視覺焦點，其餘牆面保持安定留白。"],
  ["櫃體", "低甲醛系統板、耐磨美耐板", "天然木皮、烤漆與金屬細節", "依生活物件尺寸規劃收納，避免只追求表面造型。"],
  ["照明", "基礎照明搭配重點投射", "無主燈分層照明與情境控制", "建議使用 3000K 至 4000K 色溫，依空間機能分區。"],
  ["軟裝", "中性色織品與可替換活動家具", "訂製家具、天然織品與藝術陳設", "以少量跳色與材質層次延伸專案風格。"],
];

function allSpaceImages(project) {
  return Object.entries(project.proposal_media?.space_photos || {})
    .filter(([room]) => room !== "floor_plan")
    .flatMap(([room, images]) => images.map((url) => ({ room, label: roomLabels[room] || room, url })));
}

function inferConcept(project) {
  const atmosphere = project.atmosphere_description?.trim();
  return {
    title: atmosphere ? "從生活需求延伸的空間調性" : "明亮、安定且具生活彈性的居住場景",
    narrative: atmosphere
      ? `以「${atmosphere}」作為設計核心，透過材質、光線與收納比例，將偏好轉化為可執行的空間語彙。`
      : "以自然採光、清楚動線與耐用材料建立空間基礎，再用家具、織品與局部色彩形成個人化層次。",
    planning: `針對 ${project.room_layout || "既有格局"} 整理公共與私領域關係，優先確認主要動線、日常收納及採光通風條件。`,
    requirement: project.special_requirements?.trim() || "目前未提供額外特殊需求，後續可依家庭成員、收納量與設備清單深化。",
  };
}

export function buildProposal(project) {
  const references = project.proposal_media?.reference_photos || [];
  const spaces = allSpaceImages(project);
  const floorPlans = project.proposal_media?.space_photos?.floor_plan || [];
  const premium = String(project.material_grade || "").includes("高");
  return {
    id: project.project_id || project.id,
    caseCode: project.case_code || "SM-DRAFT",
    title: `${project.house_type || "住宅"}裝修規劃設計提案`,
    date: new Date(project.created_at || Date.now()).toLocaleDateString("zh-TW"),
    hero: references[0] || spaces[0]?.url || "",
    facts: [
      ["房屋類型", project.house_type || "待確認"],
      ["屋齡", project.house_age || "待確認"],
      ["坪數", project.square_footage ? `${project.square_footage} 坪` : "待確認"],
      ["格局", project.room_layout || "待確認"],
      ["預算範圍", project.budget_range || "待確認"],
      ["建材等級", project.material_grade || "待確認"],
    ],
    concept: inferConcept(project),
    references,
    floorPlans,
    spaces,
    materials: materialDirections.map(([category, standard, high, note]) => ({
      category,
      suggestion: premium ? high : standard,
      note,
    })),
    budgetNote: `本提案以「${project.budget_range || "預算待確認"}」作為初步規劃邊界。正式工程金額仍須依現場丈量、施工圖、材料樣品及分項估價確認。`,
    disclaimer: "本文件為裝修前期概念提案，不等同施工圖、工程估價單、簽證文件或正式契約。",
  };
}

export function buildSampleProject() {
  return {
    id: "sample-project",
    project_id: "sample-project",
    case_code: "SM-SAMPLE-0001",
    created_at: new Date().toISOString(),
    house_type: "透天住宅",
    house_age: "15-30年",
    square_footage: 42,
    room_layout: "4房2廳3衛",
    budget_range: "200-500萬",
    material_grade: "中高階",
    atmosphere_description: "溫潤自然、明亮通透，保留家人共享與安靜閱讀的空間",
    special_requirements: "重視收納、自然採光、長輩使用安全與容易維護的材料",
    proposal_media: {
      reference_photos: [
        "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=85",
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85",
      ],
      space_photos: {
        living_room: ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85"],
        dining_room: ["https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1400&q=85"],
      },
    },
  };
}
