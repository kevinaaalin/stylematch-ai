export const STYLE_CATALOG_VERSION = "stylematch.style-catalog.v1";

const style = (id, name, aliases, summary, palette, materials, keywords, prompt) => ({
  id, name, aliases, summary, palette, materials, keywords, prompt,
  negative_prompt: "avoid distorted architecture, duplicated furniture, impossible circulation, warped doors and windows, text, logo, watermark, low resolution",
});

export const STYLE_CATALOG = [
  style("modern", "現代風", ["現代簡約", "現代主義"], "俐落線條、開放格局與機能整合。", ["白", "灰", "黑", "暖木色"], ["木皮", "石材", "玻璃", "金屬"], ["俐落", "開放", "機能", "簡潔"], "modern interior, clean lines, open layout, functional storage, neutral palette, warm wood accents"),
  style("scandinavian", "北歐風", ["北歐自然", "北歐簡約"], "自然採光、淺木色與舒適實用。", ["米白", "淺灰", "淺木色", "霧藍"], ["淺色木材", "棉麻", "羊毛", "霧面塗料"], ["自然光", "淺木", "舒適", "清爽"], "scandinavian interior, abundant daylight, pale wood, soft textiles, calm functional furniture"),
  style("minimalist", "極簡風", ["極簡主義", "簡約風"], "減法設計、純粹比例與隱藏收納。", ["白", "灰", "米色", "黑"], ["微水泥", "木皮", "玻璃", "霧面金屬"], ["留白", "純粹", "隱藏收納", "無裝飾"], "minimalist interior, precise proportions, seamless surfaces, concealed storage, restrained neutral colors"),
  style("industrial", "工業風", ["Loft風", "工業Loft"], "裸露結構、粗獷材質與深色金屬。", ["炭黑", "水泥灰", "鏽紅", "深木色"], ["清水模", "紅磚", "黑鐵", "舊木"], ["裸露管線", "粗獷", "黑鐵", "紅磚"], "industrial loft interior, exposed structure, concrete, black steel, aged timber, dramatic practical lighting"),
  style("cream", "奶油風", ["奶油系", "奶油極簡"], "柔和圓弧、低彩度暖色與包覆感。", ["奶油白", "燕麥色", "米杏", "淺棕"], ["藝術塗料", "淺木", "羊羔絨", "洞石"], ["柔和", "圓弧", "暖白", "療癒"], "cream style interior, warm ivory palette, soft curves, tactile fabrics, gentle diffused lighting"),
  style("light_luxury", "輕奢風", ["現代輕奢", "精品輕奢"], "精緻材質、金屬細節與克制華麗。", ["米白", "灰褐", "香檳金", "墨黑"], ["大理石", "皮革", "鍍鈦金屬", "絨布"], ["精緻", "精品", "金屬", "石材"], "light luxury interior, refined marble, champagne metal details, tailored furniture, elegant ambient lighting"),
  style("neoclassical", "新古典風", ["新古典主義", "現代古典"], "古典比例結合現代材質與生活機能。", ["象牙白", "暖灰", "深藍", "金色"], ["線板", "石材", "木皮", "金屬"], ["對稱", "線板", "優雅", "比例"], "neoclassical interior, balanced symmetry, elegant wall moulding, modern comfort, refined stone and brass"),
  style("british", "英式風格", ["英倫風", "英式古典"], "沉穩木作、格紋與典雅收藏氛圍。", ["墨綠", "酒紅", "深木色", "米色"], ["胡桃木", "皮革", "黃銅", "格紋織品"], ["英倫", "壁爐", "格紋", "書房"], "British interior, dark timber, leather, plaid textiles, classic library atmosphere, warm layered lighting"),
  style("chinese_classic", "中式古典風", ["傳統中式", "東方古典"], "中軸秩序、傳統木作與含蓄禮序。", ["深木色", "朱紅", "墨黑", "米白"], ["實木", "石材", "絲織", "黃銅"], ["中軸", "格柵", "榫卯", "含蓄"], "classical Chinese interior, axial symmetry, timber lattice, refined joinery, restrained cultural details"),
  style("european_classic", "歐式古典風", ["歐洲古典", "宮廷古典", "classic"], "對稱構圖、華美線腳與厚實層次。", ["象牙白", "金色", "酒紅", "深木色"], ["石材", "雕花木作", "絲絨", "水晶"], ["對稱", "雕花", "華麗", "古典"], "European classical interior, formal symmetry, ornate mouldings, carved wood, crystal lighting, rich textiles"),
  style("art_deco", "裝飾藝術風", ["Art Deco", "裝飾派藝術"], "幾何秩序、強烈對比與戲劇性奢華。", ["黑", "金", "祖母綠", "象牙白"], ["黃銅", "鏡面", "大理石", "絲絨"], ["幾何", "對比", "奢華", "拱形"], "Art Deco interior, bold geometry, black and brass contrast, polished stone, velvet, glamorous symmetry"),
  style("wabi_sabi", "侘寂風", ["侘寂", "Wabi-Sabi"], "不完美質感、自然痕跡與安靜留白。", ["土色", "灰褐", "米白", "炭灰"], ["土牆", "原木", "粗陶", "天然石"], ["質樸", "不完美", "歲月感", "留白"], "wabi-sabi interior, imperfect natural textures, earthen plaster, aged wood, quiet asymmetry, soft shadow"),
  style("new_oriental", "新東方風", ["現代東方", "新中式"], "東方意境以現代比例與簡練語彙呈現。", ["墨色", "米白", "茶褐", "黛綠"], ["木格柵", "石材", "金屬", "織品"], ["東方", "框景", "留白", "現代"], "new oriental interior, contemporary Asian restraint, framed views, timber screens, ink-inspired palette"),
  style("humanistic", "人文風", ["人文自然", "人文住宅"], "書卷氣、自然素材與生活收藏形成溫度。", ["暖白", "木色", "橄欖綠", "灰褐"], ["木材", "棉麻", "陶器", "手工磚"], ["書香", "收藏", "溫潤", "生活感"], "humanistic interior, warm timber, books and art collection, tactile craft, lived-in calm atmosphere"),
  style("japanese", "日式風", ["日式無印", "和風", "japandi"], "低矮尺度、自然木質與秩序收納。", ["米白", "原木色", "茶色", "灰綠"], ["原木", "榻榻米", "和紙", "石材"], ["無印", "低矮", "障子", "自然"], "Japanese interior, low furniture, natural timber, shoji-inspired screens, orderly storage, serene daylight"),
  style("tropical", "南洋風", ["熱帶風", "南洋度假風"], "熱帶植栽、通風感與自然編織材質。", ["棕櫚綠", "沙色", "柚木色", "白"], ["藤編", "柚木", "亞麻", "石材"], ["熱帶", "藤編", "植栽", "度假"], "tropical Southeast Asian interior, rattan, teak, lush greenery, breezy layout, resort-like natural light"),
  style("provence", "南法風", ["普羅旺斯風", "法式鄉村"], "柔和日光、自然舊化與浪漫田園氣息。", ["奶白", "薰衣草紫", "鼠尾草綠", "陶土色"], ["刷白木材", "石灰牆", "陶磚", "亞麻"], ["浪漫", "田園", "刷舊", "南法"], "Provence interior, sun-washed plaster, distressed wood, linen, muted lavender and sage, relaxed elegance"),
  style("country", "鄉村風", ["田園風", "美式鄉村"], "樸實木作、舒適織品與家庭聚會感。", ["奶白", "木色", "磚紅", "霧綠"], ["實木", "文化石", "棉麻", "陶磚"], ["溫馨", "木作", "田園", "家庭"], "country interior, warm solid wood, farmhouse details, comfortable textiles, welcoming family atmosphere"),
  style("american", "美式風格", ["美式風", "現代美式"], "大器比例、舒適家具與清楚空間層次。", ["暖白", "海軍藍", "灰褐", "胡桃木色"], ["木作線板", "皮革", "布藝", "石材"], ["大器", "舒適", "壁板", "開放"], "American style interior, generous proportions, upholstered furniture, wall panelling, open social layout"),
  style("bohemian", "波西米亞風", ["Boho", "波希米亞風"], "自由混搭、手工織品與濃厚旅行收藏感。", ["陶土紅", "芥末黃", "靛藍", "自然木色"], ["藤編", "流蘇織品", "手工地毯", "舊木"], ["自由", "混搭", "旅行", "圖騰"], "bohemian interior, layered artisan textiles, global patterns, rattan, plants, eclectic collected atmosphere"),
  style("biophilic", "綠意自然風", ["自然綠意風", "親自然設計"], "植栽、自然採光與內外景觀連結。", ["森林綠", "苔蘚綠", "木色", "岩灰"], ["原木", "天然石", "植栽", "亞麻"], ["綠意", "植栽", "自然光", "永續"], "biophilic interior, abundant greenery, natural daylight, timber and stone, indoor outdoor connection"),
  style("futurism", "未來主義風", ["未來風", "科技未來風"], "流線幾何、科技材質與情境光環境。", ["銀灰", "白", "黑", "電光藍"], ["金屬", "玻璃", "高光板", "智慧燈光"], ["科技", "流線", "智能", "情境光"], "futuristic interior, seamless flowing geometry, smart surfaces, metallic finishes, integrated dynamic lighting"),
  style("coastal", "海洋海岸風", ["海岸風", "海洋風"], "明亮通風、自然纖維與海岸色調。", ["白", "沙色", "海藍", "漂流木色"], ["漂流木", "藤編", "亞麻", "石灰塗料"], ["海岸", "通風", "沙色", "海藍"], "coastal interior, airy white space, sandy neutrals, ocean blue accents, linen and weathered wood"),
  style("moroccan", "中東摩洛哥風", ["摩洛哥風", "中東風"], "拱券、繁複圖紋與濃郁手工色彩。", ["靛藍", "赭紅", "金色", "沙色"], ["彩繪磁磚", "雕花金屬", "皮革", "灰泥"], ["拱門", "花磚", "異域", "手工"], "Moroccan interior, horseshoe arches, zellige tiles, carved metal lanterns, rich artisan colors"),
  style("resort_villa", "度假別墅風", ["Villa度假風", "度假宅風"], "寬闊開放、室內外連結與高舒適度。", ["沙色", "白", "木色", "植栽綠"], ["天然石", "柚木", "藤編", "亞麻"], ["度假", "開放", "景觀", "舒適"], "resort villa interior, expansive indoor outdoor living, natural stone and timber, relaxed luxury"),
  style("artistic_eclectic", "藝術混搭風", ["藝術混搭", "Eclectic風"], "以藝術品與跨風格家具建立個性秩序。", ["中性色", "藝術亮色", "黑", "木色"], ["藝術塗料", "木材", "金屬", "多樣織品"], ["藝術", "混搭", "個性", "收藏"], "artistic eclectic interior, curated art collection, mixed eras, controlled color accents, balanced expression"),
  style("chill", "Chill 輕鬆風", ["輕鬆咖啡風", "Chill風", "咖啡風"], "自在坐臥、柔和光線與輕社交咖啡氛圍。", ["燕麥色", "咖啡色", "霧綠", "暖灰"], ["木材", "棉麻", "藤編", "霧面金屬"], ["放鬆", "咖啡", "慵懶", "輕社交"], "chill relaxed interior, cafe-like warmth, casual lounge seating, soft ambient light, muted earthy palette"),
  style("boutique_hotel", "飯店精品風", ["酒店式公寓風", "精品飯店風", "Hotel Style"], "精品飯店般的層次照明、精緻細節與完整機能。", ["暖灰", "米色", "深木色", "香檳金"], ["石材", "木皮", "皮革", "鍍鈦金屬"], ["精品", "飯店", "層次照明", "精緻"], "boutique hotel interior, layered lighting, tailored joinery, premium stone and leather, polished hospitality"),
  style("retro", "復古風", ["懷舊風", "Vintage風"], "年代色彩、經典家具與懷舊細節再詮釋。", ["芥末黃", "橄欖綠", "磚紅", "胡桃木色"], ["胡桃木", "花磚", "黃銅", "復古玻璃"], ["懷舊", "年代", "經典家具", "復古"], "retro interior, mid-century silhouettes, walnut, nostalgic colors, vintage glass and brass details"),
  style("gallery", "藝術廊館風", ["藝廊風", "美術館風"], "留白展牆、精準光線與作品導向的空間秩序。", ["白", "灰", "黑", "原木色"], ["礦物塗料", "微水泥", "玻璃", "金屬"], ["藝廊", "展牆", "軌道燈", "留白"], "gallery-like interior, clean exhibition walls, precise track lighting, restrained materials, art-centered circulation"),
];

export const STYLE_KEYS = STYLE_CATALOG.map(({ id }) => id);
export const STYLE_LABELS = Object.fromEntries(STYLE_CATALOG.map(({ id, name }) => [id, name]));
const lookup = new Map();
STYLE_CATALOG.forEach((item) => [item.id, item.name, ...item.aliases].forEach((value) => lookup.set(String(value).trim().toLowerCase(), item.id)));

export function normalizeStyleId(value, fallback = "modern") {
  return value ? lookup.get(String(value).trim().toLowerCase()) || fallback : fallback;
}

export function getStyleById(value) {
  const id = normalizeStyleId(value);
  return STYLE_CATALOG.find((item) => item.id === id) || STYLE_CATALOG[0];
}
