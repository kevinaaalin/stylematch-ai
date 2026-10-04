import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fuseStyleDNA, buildStyleMixPrompt } from '../src/lib/styleMixWorkflow.js';
import { runDesignProposalWorkflow } from '../src/lib/designProposalWorkflow.js';

const [workflow, inputPath, outputPath] = process.argv.slice(2);
if (!['stylemix', 'proposal'].includes(workflow) || !inputPath || !outputPath) {
  throw new Error('Usage: node scripts/run-design-workflow.mjs stylemix|proposal input.json output.json');
}
if (resolve(inputPath) === resolve(outputPath)) throw new Error('Output must not overwrite input');
const input = JSON.parse(await readFile(inputPath, 'utf8'));
let result;
if (workflow === 'stylemix') {
  const fusion = fuseStyleDNA(input);
  result = { fusion, generation_request: buildStyleMixPrompt(fusion, input.target) };
} else {
  if (!input.project?.project_id && !input.project?.id) throw new Error('Project ID required');
  if (!input.version_id) throw new Error('Explicit proposal version_id required');
  result = runDesignProposalWorkflow(input.project, { versionId: input.version_id, parentVersionId: input.parent_version_id, at: new Date().toISOString() });
}
await writeFile(outputPath, JSON.stringify(result, null, 2), { flag: 'wx' });
console.log(`Created ${workflow} candidate: ${outputPath}`);
