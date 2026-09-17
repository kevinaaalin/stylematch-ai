import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveDeployment} from '../src/lib/deploymentConfig.js';
assert.deepEqual(resolveDeployment({pageOrigin:'http://127.0.0.1:4173'}),{apiOrigin:'http://127.0.0.1:4180',localCredentialsAllowed:true});
assert.deepEqual(resolveDeployment({pageOrigin:'https://stylematchai.com'}),{apiOrigin:'https://stylematchai.com',localCredentialsAllowed:false});
assert.equal(resolveDeployment({pageOrigin:'http://localhost:4173',apiOrigin:'https://api.example.test'}).localCredentialsAllowed,false);
for(const apiOrigin of ['http://api.example.test','http://127.0.0.1:4180','https://localhost','https://user:pass@api.example.test','https://api.example.test/path','https://api.example.test/?key=x','javascript:alert(1)','https://api.example.test/#key'])assert.throws(()=>resolveDeployment({pageOrigin:'https://stylematchai.com',apiOrigin}));
const files=['lib/aiImageTasks.js','lib/structuredSpaceApi.js','lib/localAdapters.js','lib/isafeApi.js','pages/AIGenerate.jsx'];
for(const file of files){const text=await readFile(new URL('../src/'+file,import.meta.url),'utf8');assert.ok(!text.includes('127.0.0.1:4180'));assert.ok(!text.includes('local-dev-headquarter'));assert.ok(text.includes('deploymentConfig'));}
console.log('PASS: centralized API origin, local compatibility, HTTPS public target and no development credentials to remote API. Formal authentication remains unimplemented.');
const previous=globalThis.location;
try{
 globalThis.location={origin:'https://stylematchai.com'};
 const remote=await import('../src/lib/deploymentConfig.js?public-guard');
 assert.equal(remote.API_ORIGIN,'https://stylematchai.com');
 assert.throws(()=>remote.localDevelopmentToken(),/阻擋開發身分/);
}finally{if(previous===undefined)delete globalThis.location;else globalThis.location=previous;}
