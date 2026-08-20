import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releaseRoot = path.resolve(appRoot, "..", "TIGI_4_Technical_Masters_20260820_R9_2_Consolidated");
const publicRoot = path.join(appRoot, "public", "tigi-corpus");
const isafePublicRoot = path.resolve(appRoot, "..", "github_isafe2_website_work", "tigi-corpus");
const sourcesRoot = path.join(publicRoot, "sources", "r9_2");
const canonicalReadingOrder = ["engineering-master", "sbir-master", "business-plan-master", "white-paper-master"];
const releaseId = "TIGI-GOVERNANCE-20260820-R9.2-CONSOLIDATED";
const archivedPredecessors = ["R8", "R9", "R9.1"];

const normalizeText = (value) => String(value || "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
const titleFromMarkdown = (markdown, fileName) => markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || fileName.replace(/\.md$/i, "").replace(/[_-]+/g, " ");
const headingsFromMarkdown = (markdown) => Array.from(markdown.matchAll(/^#{1,4}\s+(.+)$/gm)).map((match) => normalizeText(match[1])).filter(Boolean).slice(0, 60);
const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");

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
  const fileNames = (await readdir(releaseRoot)).filter((name) => /^0[1-4]_.*R9_2_Consolidated\.md$/i.test(name)).sort();
  if (fileNames.length !== 4) throw new Error(`Expected four R9.2 master Markdown files, found ${fileNames.length}`);
  await rm(publicRoot, { recursive: true, force: true });
  await mkdir(sourcesRoot, { recursive: true });
  const documents = []; const chunks = [];
  for (const [fileOrder, fileName] of fileNames.entries()) {
    const markdown = await readFile(path.join(releaseRoot, fileName), "utf8");
    const sourceSha256 = createHash("sha256").update(markdown).digest("hex");
    const title = titleFromMarkdown(markdown, fileName);
    const category = canonicalReadingOrder[fileOrder];
    const sourceUrl = `tigi-corpus/sources/r9_2/${fileName}.html`;
    const documentId = `TIGI_R9_2/${fileName}`;
    await copyFile(path.join(releaseRoot, fileName), path.join(sourcesRoot, fileName));
    await writeFile(path.join(sourcesRoot, `${fileName}.html`), `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{margin:0;background:#f5f5f4;color:#1c1917;font-family:system-ui,sans-serif}main{max-width:980px;margin:auto;padding:32px 24px}header{border-bottom:1px solid #d6d3d1;padding-bottom:16px}h1{font-size:24px}p{color:#57534e}pre{margin-top:24px;white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.7 ui-monospace,monospace}</style></head><body><main><header><h1>${escapeHtml(title)}</h1><p>TIGI R9.2 Consolidated · Approved Specification Baseline / Candidate Implementation</p></header><pre>${escapeHtml(markdown)}</pre></main></body></html>`, "utf8");
    documents.push({ id: documentId, category, categoryLabel: category, title, fileName, path: `${path.basename(releaseRoot)}/${fileName}`, sourceUrl, baselineStatus: "active", releaseVersion: "R9.2", sourceSha256, canonicalOrder: fileOrder, categoryOrder: fileOrder, fileOrder, length: markdown.length, headings: headingsFromMarkdown(markdown) });
    chunks.push(...splitIntoChunks(markdown, title).map((chunk) => ({ id: `${documentId}#${chunk.sectionIndex}-${chunk.chunkIndex}`, documentId, category, categoryLabel: category, title, heading: chunk.heading, text: chunk.text, sourceUrl, path: `${path.basename(releaseRoot)}/${fileName}`, baselineStatus: "active", releaseVersion: "R9.2", sourceSha256, canonicalOrder: fileOrder, sectionOrder: chunk.sectionIndex, chunkOrder: chunk.chunkIndex })));
  }
  const generatedAt = new Date().toISOString();
  const manifest = { releaseId, corpusVersion: "9.2", activeBaseline: true, ragActiveVersion: "R9.2", archivedPredecessors, generatedAt, networkDependency: false, canonicalReadingOrder, documentCount: documents.length, chunkCount: chunks.length, releaseStatus: "Approved Specification Baseline / Candidate Implementation", phase0RepositoryAuditRequired: true, finalOfficialAllowed: false, stateContractVersion: "20260722_R5_2", patentVersion: "V7_LOCKED" };
  const index = { version: "9.2", generatedAt, corpus: "TIGI R9.2 Consolidated Technical Masters", releaseVersion: "20260820_R9_2_Consolidated", ...manifest, sourceRoot: path.basename(releaseRoot), manifestUrl: "tigi-corpus/release-manifest.json", documents, chunks };
  await writeFile(path.join(publicRoot, "knowledge-index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  await writeFile(path.join(publicRoot, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await rm(isafePublicRoot, { recursive: true, force: true });
  await cp(publicRoot, isafePublicRoot, { recursive: true });
  console.log(`Built TIGI R9.2 index: ${documents.length} documents, ${chunks.length} chunks`);
}

build().catch((error) => { console.error(error); process.exit(1); });
