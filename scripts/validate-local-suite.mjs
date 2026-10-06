import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const suites = {
  core: ['runtime-identity', 'deployment-config', 'style-catalog', 'style-analysis', 'image-style-fallback', 'style-test-images', 'style-test-scoring', 'unified-image-tasks', 'tigi-knowledge-index', 'knowledge-chunks', 'photo-design-policy', 'proposal-image-completion', 'single-proposal-delivery', 'single-proposal-store', 'structured-space-errors'],
  workflow: ['project-floor-plans', 'workflow-revisions', 'asset-compatibility', 'revision-lineage', 'image-result-transaction', 'generated-image', 'proposal-versions', 'budget-scenario', 'budget-engine', 'image-task-ownership', 'proposal-context', 'proposal-delivery', 'proposal-space-coverage', 'awos-proposal-brief', 'space-photos', 'stylemix-workflow', 'design-proposal-workflow', 'reference-asset-registration', 'proposal-export-content'],
  browser: ['revision-handoff-browser', 'generation-billing-browser', 'panorama-browser'],
};
const group = process.argv[2] || 'local';
const selected = group === 'local' ? [...suites.core, ...suites.workflow, 'local-media-envelope', 'local-data-transfer', 'proposal-version-selection', 'proposal-delivery-status'] : suites[group];
if (!selected) throw new Error(`Unknown suite: ${group}`);
for (const name of selected) {
  console.log(`\n[local-suite] ${name}`);
  const result = spawnSync(process.execPath, [`scripts/validate-${name}.mjs`], { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`\nPASS: ${selected.length} ${group} validation scripts. This is not production acceptance.`);
