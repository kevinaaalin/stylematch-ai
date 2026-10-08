import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { encodeLocalDatabase, decodeLocalDatabase } from '../src/lib/localMediaEnvelope.js';
import { mergeProposalHistory } from '../src/lib/proposalHistoryMerge.js';

const memory = new Map();
let failWrites = false;
const backups = [];
let failBackup = false;
let afterBackup;
globalThis.testSaveImportBackup = async backup => {
  if (failBackup) throw new Error('Backup unavailable');
  backups.push(structuredClone(backup));
  afterBackup?.();
};
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
const bundle = await build({ entryPoints: ['src/lib/localStore.js'], absWorkingDir: fileURLToPath(new URL('../', import.meta.url)), bundle: true, write: false, format: 'esm', platform: 'node', define: { 'import.meta.env': '{}' }, alias: { '@': './src' }, plugins: [{ name: 'backup-test', setup(build) { build.onLoad({ filter: /importBackup\.js$/ }, () => ({ contents: 'export const saveImportBackup = backup => globalThis.testSaveImportBackup(backup);' })); } }] });
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
const result = await localStore.importData(encodeLocalDatabase(incoming));
assert.equal(result.collections.projects.updated, 1);
assert.equal(localStore.getAll().projects[0].project_name, 'Newer project');
assert.equal(localStore.getAll().point_balance, 80);
assert.deepEqual(backups.at(-1), result.backup);
assert.equal((await localStore.importData(JSON.stringify(exported))).collections.projects.skipped, 1);
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
await localStore.importData(withHistory);
const frozenBefore = memory.get('stylematch_local_mvp_v1');
withHistory.database.projects[0].proposal_versions[0].version = 99;
await assert.rejects(() => localStore.importData(withHistory), /內容衝突/);
assert.equal(memory.get('stylematch_local_mvp_v1'), frozenBefore);
memory.set('stylematch_local_mvp_v1', before);
await assert.rejects(() => localStore.importData('{"unrelated":true}'));
await assert.rejects(() => localStore.importData('{bad json'));
assert.equal(memory.get('stylematch_local_mvp_v1'), before);
const backupBefore = memory.get('stylematch_local_mvp_import_backup_v1');
await assert.rejects(() => localStore.importData(exported, { mode: 'unknown' }), /匯入方式/);
await assert.rejects(() => localStore.importData({ ...exported, format: 'unknown' }), /備份格式/);
await assert.rejects(() => localStore.importData({ ...exported, export_version: 99 }), /備份版本/);
await assert.rejects(() => localStore.importData({ ...exported.database, storage_schema_version: 99 }), /資料版本較新/);
for (const corrupt of ['{broken', JSON.stringify({ projects: [] }), JSON.stringify({ ...base, storage_schema_version: 99 })]) {
  memory.set('stylematch_local_mvp_v1', corrupt);
  await assert.rejects(() => localStore.importData(compact), /既有資料無法安全讀取/);
  assert.equal(memory.get('stylematch_local_mvp_v1'), corrupt);
  assert.equal(memory.get('stylematch_local_mvp_import_backup_v1'), backupBefore);
}
memory.set('stylematch_local_mvp_v1', before);
failWrites = true;
await assert.rejects(() => localStore.importData(compact));
assert.equal(memory.get('stylematch_local_mvp_v1'), before);
failWrites = false;
failBackup = true;
await assert.rejects(() => localStore.importData(compact), /Backup unavailable/);
assert.equal(memory.get('stylematch_local_mvp_v1'), before);
failBackup = false;
afterBackup = () => memory.set('stylematch_local_mvp_v1', 'concurrent change');
await assert.rejects(() => localStore.importData(compact), /其他操作更新/);
assert.equal(memory.get('stylematch_local_mvp_v1'), 'concurrent change');
delete globalThis.testSaveImportBackup;
console.log('PASS compact and legacy transfers, newer merge, balance preservation, backup decode, invalid input and quota rollback');
