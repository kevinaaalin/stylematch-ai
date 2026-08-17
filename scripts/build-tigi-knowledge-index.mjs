import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const corpusRoot = path.resolve(appRoot, "..", "tigi_engineering_corpus_v1_0");
const docsRoot = path.join(corpusRoot, "docs");
const publicRoot = path.join(appRoot, "public", "tigi-corpus");
const isafePublicRoot = path.resolve(appRoot, "..", "github_isafe2_website_work", "tigi-corpus");
const sourcesRoot = path.join(publicRoot, "sources");
const canonicalReadingOrder = ["foundation", "brs", "sad", "tgs", "sdd", "dds", "openapi", "implementation-spec", "platform-spec", "pep"];
const releaseId = "TIGI-ENGINEERING-CORPUS-V1.0-CANONICAL";

const normalizeText = (value) => String(value || "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
const titleFromMarkdown = (markdown, fileName) => markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || fileName.replace(/\.md$/i, "").replace(/[_-]+/g, " ");
const headingsFromMarkdown = (markdown) => Array.from(markdown.matchAll(/^#{1,4}\s+(.+)$/gm)).map((match) => normalizeText(match[1])).filter(Boolean).slice(0, 30);
const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function splitIntoChunks(markdown, fallbackTitle) {
  const sections = []; let current = { heading: fallbackTitle, body: [] };
  for (const line of markdown.split("\n")) {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading && current.body.join("\n").trim()) { sections.push(current); current = { heading: normalizeText(heading[1]), body: [] }; }
    else if (heading) current.heading = normalizeText(heading[1]);
    else current.body.push(line);
  }
  if (current.body.join("\n").trim()) sections.push(current);
  return sections.flatMap((section, sectionIndex) => {
    const paragraphs = section.body.join("\n").split(/\n\s*\n/).map(normalizeText).filter(Boolean);
    const chunks = []; let buffer = "";
    for (const paragraph of paragraphs) {
      if (`${buffer} ${paragraph}`.length > 1200 && buffer) { chunks.push(buffer); buffer = paragraph; }
      else buffer = `${buffer} ${paragraph}`.trim();
    }
    if (buffer) chunks.push(buffer);
    return chunks.map((text, chunkIndex) => ({ heading: section.heading, sectionIndex, chunkIndex, text: text.slice(0, 1400) }));
  });
}

async function build() {
  await rm(publicRoot, { recursive: true, force: true });
  await mkdir(sourcesRoot, { recursive: true });
  const documents = []; const chunks = [];
  for (const [categoryOrder, category] of canonicalReadingOrder.entries()) {
    const categoryRoot = path.join(docsRoot, category);
    let fileNames = [];
    try { fileNames = (await readdir(categoryRoot)).filter((name) => name.toLowerCase().endsWith(".md")).sort((a, b) => a.localeCompare(b, "zh-Hant")); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    for (const [fileOrder, fileName] of fileNames.entries()) {
      const sourcePath = path.join(categoryRoot, fileName);
      const markdown = await readFile(sourcePath, "utf8");
      const title = titleFromMarkdown(markdown, fileName);
      const relativePath = `docs/${category}/${fileName}`;
      const sourceViewName = `${fileName}.html`;
      const sourceUrl = `tigi-corpus/sources/${category}/${sourceViewName}`;
      const documentId = `tigi_engineering_corpus_v1_0/${relativePath}`;
      const canonicalOrder = categoryOrder * 1000 + fileOrder;
      await mkdir(path.join(sourcesRoot, category), { recursive: true });
      await copyFile(sourcePath, path.join(sourcesRoot, category, fileName));
      await writeFile(path.join(sourcesRoot, category, sourceViewName), `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{margin:0;background:#f5f5f4;color:#1c1917;font-family:system-ui,sans-serif}main{max-width:980px;margin:auto;padding:32px 24px}header{border-bottom:1px solid #d6d3d1;padding-bottom:16px}h1{font-size:24px}p{color:#57534e}pre{margin-top:24px;white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.7 ui-monospace,monospace}</style></head><body><main><header><h1>${escapeHtml(title)}</h1><p>${escapeHtml(`TIGI Engineering Corpus v1.0 · ${relativePath}`)}</p></header><pre>${escapeHtml(markdown)}</pre></main></body></html>`, "utf8");
      documents.push({ id: documentId, category, categoryLabel: category, title, fileName, path: `tigi_engineering_corpus_v1_0/${relativePath}`, sourceUrl, canonicalOrder, categoryOrder, fileOrder, length: markdown.length, headings: headingsFromMarkdown(markdown) });
      chunks.push(...splitIntoChunks(markdown, title).map((chunk) => ({ id: `${documentId}#${chunk.sectionIndex}-${chunk.chunkIndex}`, documentId, category, categoryLabel: category, title, heading: chunk.heading, text: chunk.text, sourceUrl, path: `tigi_engineering_corpus_v1_0/${relativePath}`, canonicalOrder, sectionOrder: chunk.sectionIndex, chunkOrder: chunk.chunkIndex })));
    }
  }
  const generatedAt = new Date().toISOString();
  const manifest = { releaseId, corpusVersion: "1.0", generatedAt, networkDependency: false, canonicalReadingOrder, documentCount: documents.length, chunkCount: chunks.length };
  const index = { version: "5.0", generatedAt, corpus: "TIGI Engineering Corpus v1.0", releaseVersion: "tigi_engineering_corpus_v1_0", releaseId, releaseStatus: "LOCAL_KNOWLEDGE_PLACEHOLDER", finalOfficialAllowed: false, stateContractVersion: "20260722_R5_2", sourceRoot: "tigi_engineering_corpus_v1_0/docs", manifestUrl: "tigi-corpus/release-manifest.json", networkDependency: false, canonicalReadingOrder, documentCount: documents.length, chunkCount: chunks.length, documents, chunks };
  await writeFile(path.join(publicRoot, "knowledge-index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  await writeFile(path.join(publicRoot, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await rm(isafePublicRoot, { recursive: true, force: true });
  await cp(publicRoot, isafePublicRoot, { recursive: true });
  console.log(`Built canonical TIGI v1.0 index: ${documents.length} documents, ${chunks.length} chunks`);
}

build().catch((error) => { console.error(error); process.exit(1); });
