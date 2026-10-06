import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { encodeLocalDatabase, decodeLocalDatabase } from '../src/lib/localMediaEnvelope.js';
import { mergeProposalHistory } from '../src/lib/proposalHistoryMerge.js';

const memory = new Map();
let failWrites = false;
globalThis.window = {
  location: { origin: 'http://127.0.0.1:4173' },
  localStorage: {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => {
      if (failWrites) throw new DOMException('Storage full', 'QuotaExceededError');
      memory.set(key, value);
    },
  },
  dispatchEvent() {},
};
const bundle = await build({ entryPoints: ['src/lib/localStore.js'], absWorkingDir: fileURLToPath(new URL('../', import.meta.url)), bundle: true, write: false, format: 'esm', platform: 'node', define: { 'import.meta.env': '{}' }, alias: { '@': './src' } });
const { localStore } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const image = `data:image/png;base64,${'a'.repeat(10000)}`;
const base = { storage_schema_version: 4, projects: [{ project_id: 'p', id: 'p', updated_at: '2026-10-01', reference_revisions: [{ image_url: image }] }], styleTests: [], point_balance: 80, point_ledger: [], jobs: [], notifications: [], auditLogs: [], isafeCases: [] };
memory.set('stylematch_local_mvp_v1', encodeLocalDatabase(base));
const exported = localStore.exportData();
const compact = encodeLocalDatabase(exported);
assert.deepEqual(decodeLocalDatabase(compact), exported);
const incoming = structuredClone(exported);
incoming.database.projects[0].updated_at = '2026-10-06';
incoming.database.projects[0].project_name = 'Newer project';
const result = localStore.importData(encodeLocalDatabase(incoming));
assert.equal(result.collections.projects.updated, 1);
assert.equal(localStore.getAll().projects[0].project_name, 'Newer project');
assert.equal(localStore.getAll().point_balance, 80);
assert.deepEqual(decodeLocalDatabase(memory.get('stylematch_local_mvp_import_backup_v1')), result.backup);
assert.equal(localStore.importData(JSON.stringify(exported)).collections.projects.skipped, 1);
const before = memory.get('stylematch_local_mvp_v1');
const v1 = { version_id: 'v1', version: 1, project_snapshot: { project_id: 'p' } };
const v2 = { version_id: 'v2', version: 2, project_snapshot: { project_id: 'p' } };
const old = { proposal_versions: [v1] };
const newer = { proposal_versions: [v2], project_name: 'New' };
const joined = mergeProposalHistory(old, newer, newer);
assert.deepEqual(joined.proposal_versions, [v2, v1]);
assert.deepEqual(old.proposal_versions, [v1]);
assert.equal(mergeProposalHistory(joined, old, joined).proposal_versions.length, 2);
assert.equal(mergeProposalHistory(old, { proposal_versions: [{ project_snapshot: { project_id: 'p' }, version: 1, version_id: 'v1' }] }, old).proposal_versions.length, 1);
assert.throws(() => mergeProposalHistory(old, { proposal_versions: [{ ...v1, version: 9 }] }, old), /內容衝突/);
const withHistory = localStore.exportData();
withHistory.database.projects[0].proposal_versions = [v1];
withHistory.database.projects[0].updated_at = '2026-10-07';
localStore.importData(withHistory);
const frozenBefore = memory.get('stylematch_local_mvp_v1');
withHistory.database.projects[0].proposal_versions[0].version = 99;
assert.throws(() => localStore.importData(withHistory), /內容衝突/);
assert.equal(memory.get('stylematch_local_mvp_v1'), frozenBefore);
memory.set('stylematch_local_mvp_v1', before);
assert.throws(() => localStore.importData('{"unrelated":true}'));
assert.throws(() => localStore.importData('{bad json'));
assert.equal(memory.get('stylematch_local_mvp_v1'), before);
failWrites = true;
assert.throws(() => localStore.importData(compact));
assert.equal(memory.get('stylematch_local_mvp_v1'), before);
console.log('PASS compact and legacy transfers, newer merge, balance preservation, backup decode, invalid input and quota rollback');
