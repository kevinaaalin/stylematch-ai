export const proposalBriefFields = ['square_footage','house_age','house_type','room_layout','budget_range','material_grade','atmosphere_description','special_requirements','primary_style','preferred_style'];
const fail = () => { throw new Error('提案交接檔格式、來源識別或完整性不符，請重新匯出。'); };
const exact = (value, keys) => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !keys.includes(key))) fail();
};
export function normalizeProposalBrief(value) {
  exact(value, proposalBriefFields);
  if (!Number.isFinite(value.square_footage) || value.square_footage <= 0 || value.square_footage > 10000) fail();
  const result = {square_footage:value.square_footage};
  for (const key of proposalBriefFields.slice(1)) if (value[key] !== undefined) {
    if (typeof value[key] !== 'string' || value[key].length > 4000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value[key])) fail();
    result[key] = value[key];
  }
  return result;
}
function payload(value) {
  exact(value, ['schema_version','source','brief','sha256']);
  if (value.schema_version !== 'stylematch.awos-proposal-brief.v1') fail();
  exact(value.source, ['system','project_ref','version_ref']);
  if (value.source.system !== 'StyleMatchAI') fail();
  for (const key of ['project_ref','version_ref']) if (typeof value.source[key] !== 'string' || !value.source[key].trim() || value.source[key].length > 200) fail();
  return {schema_version:value.schema_version,source:{system:'StyleMatchAI',project_ref:value.source.project_ref,version_ref:value.source.version_ref},brief:normalizeProposalBrief(value.brief)};
}
async function digest(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
}
function bounded(value) {
  if (new TextEncoder().encode(JSON.stringify(value,null,2)).byteLength > 65536) fail();
  return value;
}
export async function createProposalBrief(project, versionRef = 'current-unfrozen', primaryStyle) {
  const brief = Object.fromEntries(proposalBriefFields.filter(key=>project[key] !== undefined).map(key=>[key,project[key]]));
  if (!brief.primary_style && primaryStyle) brief.primary_style = primaryStyle;
  const value = payload({schema_version:'stylematch.awos-proposal-brief.v1',source:{system:'StyleMatchAI',project_ref:project.project_id || project.id,version_ref:versionRef},brief});
  return bounded({...value,sha256:await digest(value)});
}
export async function validateProposalBrief(value) {
  const clean = payload(value);
  if (typeof value.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.sha256) || await digest(clean) !== value.sha256) fail();
  return bounded({...clean,sha256:value.sha256});
}
