export const GEMINI_IMAGE_MODELS = Object.freeze({ standard: "gemini-3.1-flash-image", high: "gemini-3-pro-image" });

export function selectGeminiImageModel(quality = "standard", config = {}) {
  return ["high", "professional", "ultra"].includes(String(quality).toLowerCase())
    ? (config.highModel || GEMINI_IMAGE_MODELS.high)
    : (config.defaultModel || GEMINI_IMAGE_MODELS.standard);
}

const closestAspectRatio = (width, height) => [[1, 1], [4, 3], [3, 4], [16, 9], [9, 16], [3, 2], [2, 3], [21, 9]]
  .reduce((best, item) => Math.abs(item[0] / item[1] - width / height) < Math.abs(best[0] / best[1] - width / height) ? item : best).join(":");

function extractImage(payload) {
  const direct = (payload?.outputs || []).find((item) => item?.type === "image" && item?.data);
  const parts = payload?.candidates?.flatMap((candidate) => candidate?.content?.parts || []) || [];
  const inline = parts.find((part) => part?.inlineData?.data || part?.inline_data?.data);
  const data = direct?.data || inline?.inlineData?.data || inline?.inline_data?.data;
  if (!data) throw Object.assign(new Error("Gemini did not return an image."), { code: "GEMINI_IMAGE_MISSING" });
  return { bytes: Buffer.from(data, "base64"), mimeType: inline?.inlineData?.mimeType || inline?.inline_data?.mime_type || "image/png" };
}

export async function generateGeminiImage(options, dependencies = {}) {
  const apiKey = options.apiKey || process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error("Google Gemini Image is not configured."), { code: "GOOGLE_IMAGE_PROVIDER_NOT_CONFIGURED" });
  const model = selectGeminiImageModel(options.quality, options);
  const input = [{ type: "text", text: options.prompt }];
  for (const source of options.sourceImages || []) input.push({ type: "image", mime_type: source.mimeType, data: source.data.toString("base64") });
  const body = { model, input, response_format: { type: "image", mime_type: options.mimeType || "image/png", aspect_ratio: closestAspectRatio(options.width || 1024, options.height || 1024), image_size: Math.max(options.width || 1024, options.height || 1024) > 1536 ? "2K" : "1K" } };
  const response = await (dependencies.fetch || fetch)(`${options.baseUrl || "https://generativelanguage.googleapis.com/v1beta"}/interactions`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload?.error?.message || `Gemini image request failed (${response.status}).`), { code: "GEMINI_IMAGE_REQUEST_FAILED", status: response.status });
  return { ...extractImage(payload), provider: "google_gemini", model, synthid: true, requestContract: "gemini-interactions-single-image-v1" };
}

export async function generateGeminiImageBatch(options, dependencies = {}) {
  const results = [];
  for (let index = 0; index < Math.max(1, Number(options.count) || 1); index += 1) results.push(await generateGeminiImage({ ...options, prompt: typeof options.prompt === "function" ? options.prompt(index) : options.prompt }, dependencies));
  return results;
}
