import { DatabaseSync, backup } from "node:sqlite";
import { join, resolve } from "node:path";
import { mkdirSync } from "node:fs";
const db = new DatabaseSync(resolve(process.argv[2]), { readOnly: true });
try {
  const counts = db.prepare("SELECT status,count(*) AS count FROM ai_image_tasks GROUP BY status").all();
  console.log(JSON.stringify({ imageTaskCounts: counts, integrity: db.prepare("PRAGMA quick_check").get() }));
  if (process.argv[3]) {
    const directory = resolve(process.argv[3]); mkdirSync(directory, { recursive: true });
    const destination = join(directory, `pre-direction-deploy-${Date.now()}.db`);
    await backup(db, destination); console.log(JSON.stringify({ backup: destination }));
  }
} finally { db.close(); }
