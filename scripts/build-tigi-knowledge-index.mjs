import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const releaseId = "20260714_R4";
const masterName = "TIGI_R4_Consolidated_Master_20260714_R4.md";
const manifestName = "TIGI_Official_Edition_20260714_R4_manifest.md";
const latestRoot = path.resolve(appRoot, "..", "tigi_latest");
const versionRoot = path.resolve(appRoot, "..", "tigi_versions", releaseId);
const publicRoot = path.join(appRoot, "public", "tigi-corpus");

function normalizeText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function titleFromMarkdown(markdown, fileName) {
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) return normalizeText(heading[1]);
  return fileName.replace(/^\d+_/, "").replace(/\.md$/i, "").replace(/[_-]+/g, " ");
}

function headingsFromMarkdown(markdown) {
  return Array.from(markdown.matchAll(/^#{1,4}\s+(.+)$/gm))
    .map((match) => normalizeText(match[1]))
    .filter(Boolean)
    .slice(0, 12);
}

function splitIntoChunks(markdown, fallbackTitle) {
  const lines = markdown.split("\n");
  const sections = [];
  let current = { heading: fallbackTitle, body: [] };

  for (const line of lines) {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading && current.body.join("\n").trim()) {
      sections.push(current);
      current = { heading: normalizeText(heading[1]), body: [] };
      continue;
    }
    current.body.push(line);
  }
  if (current.body.join("\n").trim()) sections.push(current);

  return sections.flatMap((section, sectionIndex) => {
    const paragraphs = normalizeText(section.body.join("\n"))
      .split(/\n\s*\n/)
      .map(normalizeText)
      .filter(Boolean);

    const merged = [];
    let buffer = "";
    for (const paragraph of paragraphs) {
      if ((buffer + " " + paragraph).length > 1200 && buffer) {
        merged.push(buffer);
        buffer = paragraph;
      } else {
        buffer = `${buffer} ${paragraph}`.trim();
      }
    }
    if (buffer) merged.push(buffer);

    return merged.map((text, chunkIndex) => ({
      heading: section.heading || fallbackTitle,
      sectionIndex,
      chunkIndex,
      text: text.slice(0, 1400),
    }));
  });
}

async function build() {
  const latestMasterPath = path.join(latestRoot, masterName);
  const latestManifestPath = path.join(latestRoot, manifestName);
  const repoMasterPath = path.join(publicRoot, "sources", masterName);
  const repoManifestPath = path.join(publicRoot, "sources", manifestName);
  const hasExternalSources = existsSync(latestMasterPath) && existsSync(latestManifestPath);
  const masterSourcePath = hasExternalSources ? latestMasterPath : repoMasterPath;
  const manifestSourcePath = hasExternalSources ? latestManifestPath : repoManifestPath;
  const master = await readFile(masterSourcePath, "utf8");
  const manifest = await readFile(manifestSourcePath, "utf8");

  if (hasExternalSources) {
    const archivedMaster = await readFile(path.join(versionRoot, masterName), "utf8");
    const archivedManifest = await readFile(path.join(versionRoot, manifestName), "utf8");
    if (master !== archivedMaster || manifest !== archivedManifest) {
      throw new Error("TIGI July 14 R4 latest/archive sources do not match");
    }
  }

  const title = titleFromMarkdown(master, masterName);
  const documentId = `releases/${releaseId}/${masterName}`;
  const sourceUrl = `tigi-corpus/sources/${masterName}`;
  const manifestUrl = `tigi-corpus/sources/${manifestName}`;
  const documents = [{
    id: documentId,
    category: "consolidated-r4",
    categoryLabel: "July 14 R4 Consolidated",
    title,
    fileName: masterName,
    path: `tigi_latest/${masterName}`,
    archivePath: `tigi_versions/${releaseId}/${masterName}`,
    sourceUrl,
    manifestUrl,
    order: 0,
    length: master.length,
    headings: headingsFromMarkdown(master),
  }];
  const chunks = splitIntoChunks(master, title).map((chunk) => ({
    id: `${documentId}#${chunk.sectionIndex}-${chunk.chunkIndex}`,
    documentId,
    category: "consolidated-r4",
    categoryLabel: "July 14 R4 Consolidated",
    title,
    heading: chunk.heading,
    text: chunk.text,
    sourceUrl,
    path: `tigi_latest/${masterName}`,
    order: chunk.sectionIndex,
  }));

  const index = {
    version: "2.0",
    generatedAt: new Date().toISOString(),
    corpus: "TIGI Official Edition 20260714 R4 Consolidated",
    releaseId,
    sourceRoot: "tigi_latest",
    archiveRoot: `tigi_versions/${releaseId}`,
    manifestUrl,
    documentCount: documents.length,
    chunkCount: chunks.length,
    documents,
    chunks,
  };

  const sourcesRoot = path.join(publicRoot, "sources");
  await mkdir(sourcesRoot, { recursive: true });
  if (hasExternalSources) {
    await copyFileIfChanged(latestMasterPath, path.join(sourcesRoot, masterName));
    await copyFileIfChanged(latestManifestPath, path.join(sourcesRoot, manifestName));
  }
  await writeFileIfChanged(path.join(publicRoot, "knowledge-index.json"), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`Built TIGI knowledge index: ${documents.length} documents, ${chunks.length} chunks`);
}

async function copyFileIfChanged(sourcePath, destinationPath) {
  const source = await readFile(sourcePath, "utf8");
  if (existsSync(destinationPath)) {
    const destination = await readFile(destinationPath, "utf8");
    if (source === destination) return;
  }
  await copyFile(sourcePath, destinationPath);
}

async function writeFileIfChanged(destinationPath, content) {
  if (existsSync(destinationPath)) {
    const destination = await readFile(destinationPath, "utf8");
    if (destination === content) return;
    if (path.basename(destinationPath) === "knowledge-index.json" && sameKnowledgeIndex(destination, content)) return;
  }
  await writeFile(destinationPath, content, "utf8");
}

function sameKnowledgeIndex(left, right) {
  try {
    const leftJson = JSON.parse(left);
    const rightJson = JSON.parse(right);
    delete leftJson.generatedAt;
    delete rightJson.generatedAt;
    return JSON.stringify(leftJson) === JSON.stringify(rightJson);
  } catch {
    return false;
  }
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
