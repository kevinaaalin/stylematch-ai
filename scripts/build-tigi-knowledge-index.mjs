import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const releaseId = "20260730_R7_Implementation_Integrated";
const releaseLabel = "R7 Implementation Integrated";
const externalReleaseRoot = process.env.TIGI_R7_SOURCE_ROOT
  ? path.resolve(process.env.TIGI_R7_SOURCE_ROOT)
  : path.resolve(appRoot, "..", "analysis_output", "TIGI_4_Technical_Masters_20260730_R7_Implementation_Integrated");
const publicRoot = path.join(appRoot, "public", "tigi-corpus");
const repositorySourcesRoot = path.join(publicRoot, "sources");
const sourceNames = [
  "01_TIGI_Engineering_Master_20260730_R7_Implementation_Integrated.md",
  "02_SBIR_Final_Submission_Master_20260730_R7_Implementation_Integrated.md",
  "03_TIGI_Business_Plan_Master_20260730_R7_Implementation_Integrated.md",
  "04_TIGI_White_Paper_Master_20260730_R7_Implementation_Integrated.md",
  "StyleMatch_R7_API_Data_Contract_Annex_20260803.md",
  "StyleMatch_R7_Program_Audit_20260803.md",
];

const normalizeText = (value) => String(value || "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
const titleFromMarkdown = (markdown, fileName) => markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || fileName.replace(/\.md$/i, "").replace(/[_-]+/g, " ");
const headingsFromMarkdown = (markdown) => Array.from(markdown.matchAll(/^#{1,4}\s+(.+)$/gm)).map((match) => normalizeText(match[1])).filter(Boolean).slice(0, 20);

function splitIntoChunks(markdown, fallbackTitle) {
  const sections = [];
  let current = { heading: fallbackTitle, body: [] };
  for (const line of markdown.split("\n")) {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading && current.body.join("\n").trim()) {
      sections.push(current);
      current = { heading: normalizeText(heading[1]), body: [] };
    } else current.body.push(line);
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
  const sourcesRoot = path.join(publicRoot, "sources");
  await mkdir(sourcesRoot, { recursive: true });
  const documents = []; const chunks = [];
  for (const [order, fileName] of sourceNames.entries()) {
    const externalSourcePath = path.join(externalReleaseRoot, fileName);
    const repositorySourcePath = path.join(repositorySourcesRoot, fileName);
    const sourcePath = existsSync(externalSourcePath) ? externalSourcePath : repositorySourcePath;
    if (!existsSync(sourcePath)) throw new Error(`R7 knowledge source missing: ${sourcePath}`);
    const markdown = await readFile(sourcePath, "utf8");
    const title = titleFromMarkdown(markdown, fileName);
    const documentId = `releases/${releaseId}/${fileName}`;
    const sourceUrl = `tigi-corpus/sources/${fileName}`;
    if (path.resolve(sourcePath) !== path.resolve(repositorySourcePath)) {
      await copyFileIfChanged(sourcePath, repositorySourcePath);
    }
    documents.push({ id: documentId, category: "r7-implementation", categoryLabel: releaseLabel, title, fileName, path: `analysis_output/${releaseId}/${fileName}`, sourceUrl, order, length: markdown.length, headings: headingsFromMarkdown(markdown) });
    chunks.push(...splitIntoChunks(markdown, title).map((chunk) => ({ id: `${documentId}#${chunk.sectionIndex}-${chunk.chunkIndex}`, documentId, category: "r7-implementation", categoryLabel: releaseLabel, title, heading: chunk.heading, text: chunk.text, sourceUrl, path: `analysis_output/${releaseId}/${fileName}`, order: chunk.sectionIndex })));
  }
  const index = { version: "3.0", generatedAt: new Date().toISOString(), corpus: "TIGI 20260730 R7 Implementation Integrated", releaseId, releaseStatus: "IMPLEMENTATION_INTEGRATED_BASELINE", finalOfficialAllowed: false, sourceRoot: `analysis_output/${releaseId}`, documentCount: documents.length, chunkCount: chunks.length, documents, chunks };
  await writeFile(path.join(publicRoot, "knowledge-index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(`Built TIGI R7 knowledge index: ${documents.length} documents, ${chunks.length} chunks`);
}

async function copyFileIfChanged(sourcePath, destinationPath) {
  const source = await readFile(sourcePath, "utf8");
  if (existsSync(destinationPath) && await readFile(destinationPath, "utf8") === source) return;
  await writeFile(destinationPath, source, "utf8");
}

build().catch((error) => { console.error(error); process.exit(1); });
