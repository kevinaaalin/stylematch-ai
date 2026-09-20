import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function verifyIdentity(actual, expected) {
  if (actual.schema_version !== 'StyleMatch.DirectionCompletion/1.1') throw new Error('API capability schema is missing or incompatible.');
  if (actual.source_sha256 !== expected.source) throw new Error('API process is stale. Back up data and review active tasks before restarting the unified API.');
  if (actual.storage_fingerprint !== expected.storage) throw new Error('API database differs from the configured canonical database. Do not start a second API.');
  if (actual.review_required !== true) throw new Error('Direction review safeguard is not enabled.');
}

export async function verifyRuntime() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  const database = process.env.ISAFE_DB_PATH || resolve(root, '../local-api/data/isafe.db');
  const response = await fetch('http://127.0.0.1:4180/api/v1/ai/direction-completion/schema', { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Unified API capability check failed (HTTP ${response.status}).`);
  verifyIdentity(await response.json(), {
    source: hash(readFileSync(resolve(root, 'local-api/server.mjs'))),
    storage: hash(database),
  });
  console.log('PASS: unified API source, canonical database and direction review safeguard match.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyRuntime().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
