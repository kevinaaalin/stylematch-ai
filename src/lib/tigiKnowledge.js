const BASE_URL = import.meta.env.BASE_URL || "./";
const INDEX_URL = `${BASE_URL}tigi-corpus/knowledge-index.json`;

const stopWords = new Set(["the", "and", "for", "with", "from", "this", "that", "stylematch", "ai", "tigi", "twcid", "isafe"]);
let indexPromise;

function normalize(value) {
  return String(value || "").toLowerCase();
}

function tokenize(value) {
  const normalized = normalize(value).replace(/[^\p{L}\p{N}\s_-]+/gu, " ").replace(/[_-]+/g, " ");
  const latinTokens = normalized.match(/[a-z0-9]{2,}/g) || [];
  const cjkTokens = normalized.match(/[\u3400-\u9fff]{2,}/g) || [];
  const cjkPairs = cjkTokens.flatMap((token) =>
    Array.from({ length: Math.max(0, token.length - 1) }, (_, index) => token.slice(index, index + 2)),
  );
  return [...latinTokens, ...cjkTokens, ...cjkPairs].filter((token) => token.length > 1 && !stopWords.has(token));
}

function projectToQuery(project = {}) {
  return [
    project.case_code,
    project.house_type,
    project.house_age,
    project.room_layout,
    project.square_footage ? `${project.square_footage} 坪` : "",
    project.material_grade,
    project.budget_range,
    project.atmosphere_description,
    project.special_requirements,
    project.service_option,
    project.stage_status,
  ].filter(Boolean).join(" ");
}

function scoreChunk(chunk, queryTokens) {
  const haystack = normalize(`${chunk.title} ${chunk.heading} ${chunk.categoryLabel} ${chunk.text}`);
  const title = normalize(`${chunk.title} ${chunk.heading}`);
  return queryTokens.reduce((score, token) => score + (title.includes(token) ? 6 : 0) + (haystack.includes(token) ? 2 : 0), 0)
    + Math.max(0, 10 - Number(chunk.categoryOrder ?? Math.floor(Number(chunk.canonicalOrder || 0) / 1000))) * 0.05;
}

function recommendation(result) {
  const section = result.heading && result.heading !== result.title ? `「${result.heading}」` : result.title;
  return `建議參考 ${result.categoryLabel} 的 ${section}，並將相關要求轉成可驗證的專案交付項目。`;
}

export async function loadTigiKnowledgeIndex() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL).then(async (response) => {
      if (!response.ok) throw new Error(`無法載入 TIGI 索引（${response.status}）`);
      const index = await response.json();
      if (index.ragActiveVersion !== "R9.2" || index.activeBaseline !== true) throw new Error("Knowledge 索引不是目前唯一活動基線 R9.2，已停止查詢以避免舊版內容混入。");
      if (index.documents?.some((document) => document.baselineStatus !== "active" || document.releaseVersion !== "R9.2")) throw new Error("Knowledge 索引含有非活動版本來源，已停止查詢。");
      return index;
    });
  }
  return indexPromise;
}

export async function queryTigiKnowledge(query, options = {}) {
  const index = await loadTigiKnowledgeIndex();
  const queryTokens = [...new Set(tokenize(query))];
  const limit = options.limit || 5;
  if (!queryTokens.length) return { index, query, answer: "請輸入更具體的專案需求。", results: [] };

  const results = index.chunks
    .filter((chunk) => chunk.baselineStatus === "active" && chunk.releaseVersion === "R9.2")
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, queryTokens) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || Number(a.canonicalOrder || 0) - Number(b.canonicalOrder || 0) || Number(a.sectionOrder || 0) - Number(b.sectionOrder || 0))
    .slice(0, limit)
    .map((chunk) => ({
      ...chunk,
      sourceHref: new URL(chunk.sourceUrl, new URL(BASE_URL, window.location.href)).href,
      recommendation: recommendation(chunk),
      excerpt: chunk.text.length > 260 ? `${chunk.text.slice(0, 260)}…` : chunk.text,
    }));

  const answer = results.length
    ? ["TIGI Knowledge 建議：", ...results.slice(0, 3).map((item, indexValue) => `${indexValue + 1}. ${item.recommendation}`)].join("\n")
    : "目前索引中沒有足夠接近的內容，請補充空間、預算、材料或治理需求。";
  return { index, query, answer, results };
}

export function buildProjectKnowledgeQuery(project) {
  if (!project) return "";
  return projectToQuery(project);
}
