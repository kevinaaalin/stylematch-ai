import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

const [action, sourceArg, targetArg] = process.argv.slice(2);
if (!["backup", "restore"].includes(action) || !sourceArg || !targetArg) {
  console.error("Usage: node backup-restore.mjs <backup|restore> <source> <target>"); process.exit(2);
}
const source = resolve(sourceArg); const target = resolve(targetArg);
mkdirSync(dirname(target), { recursive: true }); copyFileSync(source, target);
const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const sourceSha256 = digest(source); const targetSha256 = digest(target);
if (sourceSha256 !== targetSha256) throw new Error("Backup/restore checksum mismatch.");
console.log(JSON.stringify({ action, source, target, sha256: targetSha256, verified: true }, null, 2));

