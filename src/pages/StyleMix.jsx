import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Loader2 } from 'lucide-react';
import { STYLE_CATALOG } from '@/data/styleCatalog';
import { fuseStyleDNA, buildStyleMixPrompt, MIX_DIMENSIONS } from '@/lib/styleMixWorkflow';
import StyleMixImageSource from '@/components/StyleMixImageSource';
import { createAndWaitForImageTask } from '@/lib/aiImageTasks';
import { requireBusinessPlan } from '@/lib/planAccess';
import { Button } from '@/components/ui/button';
import { localStore } from '@/lib/localStore';

function catalogSource(id) {
  const style = STYLE_CATALOG.find(item => item.id === id);
  return { id, source_ref: `styleCatalog:${id}`, dimensions: {
    color: { value: style.palette.join(', '), confidence: 1 },
    material: { value: style.materials.join(', '), confidence: 1 },
    mood: { value: style.keywords.join(', '), confidence: 1 },
  } };
}

export default function StyleMix() {
  const [a, setA] = useState(STYLE_CATALOG[0].id);
  const [b, setB] = useState(STYLE_CATALOG[1].id);
  const [weight, setWeight] = useState(70);
  const [target, setTarget] = useState('interior');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [database, setDatabase] = useState(() => localStore.getAll());
  const [projectId, setProjectId] = useState('');
  const [space, setSpace] = useState('客廳');
  const [imageMode, setImageMode] = useState(false);
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dimensionWeights, setDimensionWeights] = useState({});
  useEffect(() => localStore.subscribe(() => setDatabase(localStore.getAll())), []);
  const project = database.projects.find(item => item.project_id === projectId);
  async function generate() {
    setError('');
    try {
      requireBusinessPlan('StyleMix');
      if (!project) throw new Error('請選擇儲存成果的專案。');
      if (!space.trim()) throw new Error('請填寫空間或物件名稱。');
      if (database.point_balance < 5) throw new Error('點數不足，需要 5 點。');
      setBusy(true);
      if (analyzing || (imageMode && (!imageA || !imageB))) throw new Error('請先完成兩張圖片的分析。');
      const fusion = fuseStyleDNA({ a: imageMode ? imageA : catalogSource(a), b: imageMode ? imageB : catalogSource(b), globalWeight: weight / 100, dimensionWeights });
      const request = buildStyleMixPrompt(fusion, target, space);
      const output = await createAndWaitForImageTask({ project, prompt: request.prompt, outputType: 'reference', purpose: 'stylemix_candidate', compactPreview: true, operation: { workflow_version: fusion.workflow_version, fusion, target } });
      setResult({ ...output, fusion, projectId, saved: false });
      const { revision } = await localStore.commitGeneratedRevision(projectId, {
        image_url: output.url, image_role: 'ai_revision', space: space.trim(),
        source_task_id: output.task.ai_task_id, task_status: output.task.status,
        original_image_url: output.source_url, preview_encoding: 'jpeg-1280-q86',
        workflow_version: fusion.workflow_version, generation_source: output.generation_source,
        authoritative: output.authoritative, prompt: request.prompt,
        stylemix: { fusion, target, sources: imageMode ? [imageA, imageB] : [catalogSource(a), catalogSource(b)], conditioning_weights: request.conditioning_weights },
      }, { type: 'stylemix_generation', cost: 5, detail: 'StyleMix', idempotencyKey: `stylemix-${output.task.ai_task_id}` });
      setResult({ ...output, fusion, projectId, revision, saved: true });
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-5xl px-4 py-8">
    <h1 className="text-2xl font-bold">StyleMix 風格混搭</h1>
    <p className="mt-2 text-sm text-stone-600">{imageMode ? '圖片候選模式' : '風格庫候選模式'} · 比例為提示詞權重，非圖像混合精度保證</p>
    <fieldset disabled={busy || analyzing} className="mt-6 grid gap-5 border-y py-6 sm:grid-cols-2">
      <label className="flex gap-2 sm:col-span-2"><input type="checkbox" checked={imageMode} onChange={event => setImageMode(event.target.checked)} />使用圖片 A／B</label>
      {imageMode && <><StyleMixImageSource label="A" source={imageA} onChange={setImageA} onBusy={setAnalyzing} /><StyleMixImageSource label="B" source={imageB} onChange={setImageB} onBusy={setAnalyzing} /></>}
      <label className="grid gap-2">專案<select aria-label="專案" value={projectId} onChange={event => setProjectId(event.target.value)} className="min-w-0 rounded border p-2"><option value="">選擇專案</option>{database.projects.map(item => <option key={item.project_id} value={item.project_id}>{item.project_name || item.name}</option>)}</select></label>
      <label className="grid gap-2">空間或物件<input value={space} onChange={event => setSpace(event.target.value)} className="min-w-0 rounded border p-2" /></label>
      {!imageMode && [[a, setA, '風格 A'], [b, setB, '風格 B']].map(([value, setter, label]) => <label key={label} className="grid gap-2">{label}<select value={value} onChange={event => setter(event.target.value)} className="min-w-0 rounded border p-2">{STYLE_CATALOG.map(style => <option key={style.id} value={style.id}>{style.name}</option>)}</select></label>)}
      <label className="grid gap-2">A {weight}% / B {100 - weight}%<input aria-label="風格 A 比例" type="range" min="0" max="100" value={weight} onChange={event => setWeight(Number(event.target.value))} /></label>
      <details className="sm:col-span-2"><summary>逐項混搭比例</summary>{MIX_DIMENSIONS.map(key => <label key={key} className="mt-2 grid gap-1">{key} · A {Math.round((dimensionWeights[key] ?? weight / 100) * 100)}%<input type="range" min="0" max="100" value={(dimensionWeights[key] ?? weight / 100) * 100} onChange={event => setDimensionWeights(previous => ({ ...previous, [key]: Number(event.target.value) / 100 }))} /></label>)}</details>
      <label className="grid gap-2">設計目標<select value={target} onChange={event => setTarget(event.target.value)} className="rounded border p-2">{Object.entries({ interior:'室內空間', furniture:'沙發', appliance:'家電', fashion:'服裝', sculpture:'雕塑' }).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    </fieldset>
    <Button className="mt-5" disabled={busy} onClick={generate}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}產生候選圖</Button>
    <Link to={projectId ? `/ReferenceCanvas?project=${encodeURIComponent(projectId)}` : '/ReferenceCanvas'} className="ml-5 underline">提案圖確認</Link>
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {result && <figure className="mt-6"><img className="aspect-[4/3] w-full object-contain" src={result.url} alt="StyleMix 生成候選" /><figcaption className="mt-2 text-sm">{result.saved ? `已保存 v${result.revision.version} · 尚未人工核准` : '已生成，但尚未保存至專案'}</figcaption><a href={result.url} target="_blank" rel="noopener noreferrer" className="underline">開啟生成圖片</a></figure>}
  </main>;
}
