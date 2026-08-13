import { getStyleById } from "../data/styleCatalog.js";

export const analyzeStyleFeatures = ({ brightness, saturation, warmth, edgeDensity }) => {
  const scores = {
    modern: 1 + edgeDensity * 2,
    minimalist: 1 + brightness * 1.5 - saturation,
    scandinavian: 1 + brightness + warmth * 0.5,
    cream: 1 + brightness + warmth - saturation * 0.5,
    industrial: 1 + (1 - brightness) + edgeDensity,
    wabi_sabi: 1 + warmth + (1 - saturation),
    japanese: 1 + warmth * 0.7 + (1 - saturation),
    light_luxury: 1 + edgeDensity + saturation * 0.3,
    coastal: 1 + brightness + saturation * 0.4 - warmth * 0.2,
    chill: 1 + warmth + (1 - edgeDensity) * 0.4,
    boutique_hotel: 1 + (1 - brightness) * 0.5 + edgeDensity,
    bohemian: 1 + saturation + warmth * 0.4,
  };
  const ranked = Object.entries(scores).sort(([, a], [, b]) => b - a).slice(0, 3);
  const total = ranked.reduce((sum, [, score]) => sum + score, 0);
  return {
    confidence: Math.min(35, Math.round(18 + Math.abs(ranked[0][1] - ranked[1][1]) * 12)),
    candidates: ranked.map(([id, score]) => ({ id, name: getStyleById(id).name, percentage: Math.round(score / total * 100) })),
  };
};

export async function analyzeImageStyleFallback(file) {
  const bitmap = await createImageBitmap(file);
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(bitmap, 0, 0, size, size);
  bitmap.close();
  const { data } = context.getImageData(0, 0, size, size);
  let light = 0;
  let saturation = 0;
  let warmth = 0;
  let edges = 0;
  let previous = null;
  const pixels = data.length / 4;
  for (let index = 0; index < data.length; index += 4) {
    const r = data[index] / 255;
    const g = data[index + 1] / 255;
    const b = data[index + 2] / 255;
    const maximum = Math.max(r, g, b);
    const minimum = Math.min(r, g, b);
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
    light += luminance;
    saturation += maximum ? (maximum - minimum) / maximum : 0;
    warmth += Math.max(-1, Math.min(1, r - b));
    if (previous !== null && Math.abs(luminance - previous) > 0.18) edges += 1;
    previous = luminance;
  }
  const features = {
    brightness: light / pixels,
    saturation: saturation / pixels,
    warmth: (warmth / pixels + 1) / 2,
    edgeDensity: edges / pixels,
  };
  const result = analyzeStyleFeatures(features);
  return {
    method: "offline_color_geometry_heuristic_v1",
    confidence: result.confidence,
    requires_confirmation: true,
    disclaimer: "目前未安裝CLIP Vision模型；候選僅依色彩、明暗與邊緣密度推估，不代表完整風格辨識。",
    features,
    candidates: result.candidates,
  };
}
