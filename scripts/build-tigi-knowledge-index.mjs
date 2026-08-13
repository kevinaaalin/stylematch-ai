import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const isafeWebsiteRoot = path.resolve(appRoot, "..", "github_isafe2_website_work");
const releaseVersion = "20260813_R8_StyleMatch_iSAFE_Integrated";
const releaseId = "TIGI-GOVERNANCE-20260813-R8-SM-ISAFE";
const releaseLabel = "R8 StyleMatch AI / iSAFE 2.0 Integrated";
const r72Root = path.resolve(appRoot, "..", "analysis_output", "TIGI_4_Technical_Masters_20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated");
const r8Root = path.resolve(appRoot, "..", "analysis_output", "TIGI_4_Technical_Masters_20260813_R8_StyleMatch_iSAFE_Integrated");
const publicRoot = path.join(isafeWebsiteRoot, "tigi-corpus");
const repositorySourcesRoot = path.join(publicRoot, "sources");
const sources = [
  [r72Root, "01_TIGI_Engineering_Master_20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated.md", "R7.2 四母本（R8 前版）"],
  [r72Root, "02_SBIR_Final_Submission_Master_20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated.md", "R7.2 四母本（R8 前版）"],
  [r72Root, "03_TIGI_Business_Plan_Master_20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated.md", "R7.2 四母本（R8 前版）"],
  [r72Root, "04_TIGI_White_Paper_Master_20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated.md", "R7.2 四母本（R8 前版）"],
  [r8Root, "README.md", releaseLabel],
  [r8Root, "R8_API_Data_Contract_Annex.md", releaseLabel],
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
  for (const [order, [sourceRoot, fileName, categoryLabel]] of sources.entries()) {
    const externalSourcePath = path.join(sourceRoot, fileName);
    const repositorySourcePath = path.join(repositorySourcesRoot, fileName);
    const sourcePath = existsSync(externalSourcePath) ? externalSourcePath : repositorySourcePath;
    if (!existsSync(sourcePath)) throw new Error(`R8 knowledge source missing: ${sourcePath}`);
    const markdown = await readFile(sourcePath, "utf8");
    const title = titleFromMarkdown(markdown, fileName);
    const documentId = `releases/${releaseVersion}/${fileName}`;
    const sourceUrl = `tigi-corpus/sources/${fileName}`;
    if (path.resolve(sourcePath) !== path.resolve(repositorySourcePath)) {
      await copyFileIfChanged(sourcePath, repositorySourcePath);
    }
    documents.push({ id: documentId, category: "r8-integrated", categoryLabel, title, fileName, path: `analysis_output/${releaseVersion}/${fileName}`, sourceUrl, order, length: markdown.length, headings: headingsFromMarkdown(markdown) });
    chunks.push(...splitIntoChunks(markdown, title).map((chunk) => ({ id: `${documentId}#${chunk.sectionIndex}-${chunk.chunkIndex}`, documentId, category: "r8-integrated", categoryLabel, title, heading: chunk.heading, text: chunk.text, sourceUrl, path: `analysis_output/${releaseVersion}/${fileName}`, order: chunk.sectionIndex })));
  }
  const index = { version: "4.0", generatedAt: new Date().toISOString(), corpus: "TIGI 20260813 R8 StyleMatch AI / iSAFE 2.0 Integrated", releaseVersion, releaseId, releaseStatus: "IMPLEMENTATION_QA_BASELINE", finalOfficialAllowed: false, stateContractVersion: "20260722_R5_2", sourceRoot: `analysis_output/${releaseVersion}`, manifestUrl: "tigi-corpus/sources/release-manifest.json", documentCount: documents.length, chunkCount: chunks.length, documents, chunks };
  await writeFile(path.join(publicRoot, "knowledge-index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  await copyFileIfChanged(path.join(r8Root, "release-manifest.json"), path.join(repositorySourcesRoot, "release-manifest.json"));
  console.log(`Built TIGI R8 knowledge index: ${documents.length} documents, ${chunks.length} chunks`);
}

async function copyFileIfChanged(sourcePath, destinationPath) {
  const source = await readFile(sourcePath, "utf8");
  if (existsSync(destinationPath) && await readFile(destinationPath, "utf8") === source) return;
  await writeFile(destinationPath, source, "utf8");
}

build().catch((error) => { console.error(error); process.exit(1); });
