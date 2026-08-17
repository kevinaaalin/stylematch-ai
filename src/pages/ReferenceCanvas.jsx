import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Coins, Crown, Eraser, ImagePlus, Layers3, Loader2, RotateCcw, ScanSearch, Upload, Wand2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GenerateImage, UploadFile } from "@/lib/localAdapters";
import { createAndWaitForImageTask } from "@/lib/aiImageTasks";
import { approveAsset, createApprovedAsset } from "@/lib/structuredSpaceApi";
import { visualEditingIntent } from "@/lib/visualEditing";
import VisualEditingIntentControls from "@/components/ai/VisualEditingIntentControls";
import ImageMaskCanvas from "@/components/ai/ImageMaskCanvas";
import ImageDifferenceViewer from "@/components/ai/ImageDifferenceViewer";
import { localStore } from "@/lib/localStore";
import { isBusinessPlan, PLAN_CHANGE_EVENT, readActivePlan } from "@/lib/planAccess";
import { createPageUrl } from "@/utils";

const PROPOSAL_COST = 30;
const REVISION_COST = 5;

export default function ReferenceCanvas() {
  const [searchParams] = useSearchParams();
  const [database, setDatabase] = useState(() => localStore.getAll());
  const projects = database.projects || [];
  const requestedProjectId = searchParams.get("project");
  const [projectId, setProjectId] = useState(requestedProjectId || projects[0]?.project_id || "");
  const [activeRevisionId, setActiveRevisionId] = useState("");
  const [selectedRevisionIds, setSelectedRevisionIds] = useState([]);
  const [space, setSpace] = useState("客廳");
  const [instruction, setInstruction] = useState("");
  const [visualIntentId, setVisualIntentId] = useState("VE-01");
  const [semanticRegion, setSemanticRegion] = useState("");
  const [referenceAssetIds, setReferenceAssetIds] = useState("");
  const [assetCandidate, setAssetCandidate] = useState(null);
  const [showDifference, setShowDifference] = useState(false);
  const maskCanvasRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [planId, setPlanId] = useState(readActivePlan);

  const project = projects.find((item) => item.project_id === projectId || item.id === projectId);
  const revisions = useMemo(() => project?.reference_revisions || [], [project]);
  const activeRevision = revisions.find((item) => item.revision_id === activeRevisionId) || revisions[0];
  const confirmedSet = (project?.confirmed_reference_sets || []).find(
    (item) => item.confirmed_reference_set_id === project?.active_confirmed_reference_set_id
  );

  useEffect(() => localStore.subscribe(() => setDatabase(localStore.getAll())), []);
  useEffect(() => {
    const refreshPlan = () => setPlanId(readActivePlan());
    window.addEventListener(PLAN_CHANGE_EVENT, refreshPlan);
    window.addEventListener("storage", refreshPlan);
    return () => { window.removeEventListener(PLAN_CHANGE_EVENT, refreshPlan); window.removeEventListener("storage", refreshPlan); };
  }, []);
  useEffect(() => {
    if (projects.length && !projects.some((item) => item.project_id === projectId || item.id === projectId)) {
      setProjectId(projects[0].project_id);
    }
  }, [projectId, projects]);
  useEffect(() => {
    if (revisions.length && !revisions.some((item) => item.revision_id === activeRevisionId)) {
      setActiveRevisionId(revisions[0].revision_id);
    }
  }, [activeRevisionId, revisions]);

  const clearStatus = () => { setMessage(""); setError(""); };
  const toggleRevision = (revisionId) => setSelectedRevisionIds((current) => (
    current.includes(revisionId) ? current.filter((id) => id !== revisionId) : [...current, revisionId]
  ));

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !project) return;
    clearStatus(); setBusy(true);
    try {
      const { file_url } = await UploadFile({ file });
      const revision = localStore.saveReferenceRevision(project.project_id, { image_url: file_url, image_role: "uploaded_reference", space });
      setActiveRevisionId(revision.revision_id);
      setMessage("參考圖片已加入版本清單。");
    } catch { setError("參考圖片上傳失敗，請確認檔案格式後再試。"); }
    finally { setBusy(false); event.target.value = ""; }
  };

  const generateRevision = async () => {
    if (!project) return;
    if (!isBusinessPlan(planId)) return setError("候選圖片改版僅提供商業方案使用，請先升級商業方案。");
    clearStatus(); setBusy(true);
    try {
      const visualIntent = visualEditingIntent(visualIntentId);
      const maskDataUrl = maskCanvasRef.current?.getMaskDataUrl() || null;
      if (visualIntent.regionRequired && !semanticRegion.trim() && !maskDataUrl) throw new Error("請塗選圖片區域，或填寫要修改的家具與空間區域。");
      const parsedReferenceAssetIds = referenceAssetIds.split(",").map((item) => item.trim()).filter(Boolean);
      if (visualIntent.referenceRequired && parsedReferenceAssetIds.length === 0) throw new Error("請填寫至少一筆參考資產 ID。");
      const prompt = `${project.primary_style || project.preferred_style || "現代簡約"} ${space}室內設計。編輯方式：${visualIntent.label}。修改要求：${instruction || "維持原需求並提升空間完整度"}`;
      let generated;
      try {
        generated = await createAndWaitForImageTask({
          project,
          prompt,
          outputType: "reference_image_revision",
          purpose: "stylematch_reference_image_revision",
          sourceMediaUrls: [activeRevision?.image_url, maskDataUrl].filter(Boolean),
          operation: {
            intent_id: visualIntent.id,
            instruction,
            source_asset_id: activeRevision?.asset_id || null,
            source_revision_id: activeRevision?.revision_id || null,
            semantic_region: semanticRegion.trim() || null,
            mask_ref: maskDataUrl,
            reference_asset_ids: parsedReferenceAssetIds,
            preserve_constraints: ["walls", "openings", "circulation"],
            parent_asset_id: activeRevision?.asset_id || null,
            space,
          },
        });
      } catch (apiError) {
        const fallback = await GenerateImage({ prompt });
        generated = { url: fallback.url, task: null, generation_source: "local_sdk_fallback", authoritative: false, fallback_reason: apiError.message };
      }
      const payment = localStore.consumePoints(project.project_id, {
        type: "reference_image_revision",
        cost: REVISION_COST,
        detail: "提案候選圖片改版",
        idempotencyKey: `reference-revision-${project.project_id}-${crypto.randomUUID()}`,
      });
      const revision = localStore.saveReferenceRevision(project.project_id, {
        image_url: generated.url,
        source_image_url: activeRevision?.image_url || null,
        image_role: "ai_revision",
        instruction,
        prompt,
        space,
        source_task_id: generated.task?.ai_task_id || null,
        workflow_version: generated.task?.workflow_version || null,
        checkpoint: generated.task?.checkpoint || null,
        seed: generated.task?.seed ?? null,
        generation_source: generated.generation_source,
        authoritative: generated.authoritative,
        fallback_reason: generated.fallback_reason || null,
        visual_edit_intent: visualIntent.id,
      });
      const candidate = await createApprovedAsset(project.project_id, {
        logical_asset_id: `reference-${space}`,
        asset_type: "image",
        label: `${space} ${visualIntent.label} v${revision.version}`,
        local_ref: generated.url,
        metadata: {
          visual_edit_intent: visualIntent.id,
          operation: generated.task?.operation || null,
          source_task_id: generated.task?.ai_task_id || null,
          local_revision_id: revision.revision_id,
          authoritative: generated.authoritative,
        },
      });
      setAssetCandidate(candidate);
      setShowDifference(true);
      maskCanvasRef.current?.clear();
      setActiveRevisionId(revision.revision_id);
      setMessage(`已產生 ${space} v${revision.version}，扣除 ${REVISION_COST} 點，餘額 ${payment.balance} 點。`);
    } catch (requestError) { setError(requestError.message || "AI 修改版本產生失敗，請稍後再試。"); }
    finally { setBusy(false); }
  };

  const approveCandidate = async () => {
    if (!assetCandidate) return;
    clearStatus(); setBusy(true);
    try {
      const approved = await approveAsset(assetCandidate.asset_id, assetCandidate.revision);
      setAssetCandidate(approved);
      setMessage(`資產版本 v${approved.revision} 已人工核准，可供提案引用。`);
    } catch (requestError) { setError(requestError.message || "資產核准失敗，請重新整理後再試。"); }
    finally { setBusy(false); }
  };

  const revertToSource = async () => {
    if (!project || !activeRevision?.source_image_url) return;
    clearStatus(); setBusy(true);
    try {
      const revision = localStore.saveReferenceRevision(project.project_id, {
        image_url: activeRevision.source_image_url,
        source_image_url: activeRevision.image_url,
        image_role: "reverted_revision",
        instruction: `回退自 ${activeRevision.revision_id}`,
        space: activeRevision.space || space,
        generation_source: "local_revision_history",
        authoritative: true,
      });
      const candidate = await createApprovedAsset(project.project_id, {
        logical_asset_id: `reference-${activeRevision.space || space}`,
        asset_type: "image",
        label: `${activeRevision.space || space} 回退版本 v${revision.version}`,
        local_ref: revision.image_url,
        metadata: { edit_operation: "revert", reverted_from_revision_id: activeRevision.revision_id, local_revision_id: revision.revision_id },
      });
      setActiveRevisionId(revision.revision_id);
      setAssetCandidate(candidate);
      setShowDifference(false);
      setMessage(`已建立回退候選版本 v${revision.version}，原版本仍完整保留。`);
    } catch (requestError) { setError(requestError.message || "建立回退版本失敗。"); }
    finally { setBusy(false); }
  };

  const confirmSelection = () => {
    clearStatus();
    try {
      const result = localStore.confirmReferenceSet(project.project_id, selectedRevisionIds);
      setMessage(`已鎖定參考圖組 v${result.version}；後續修改會另建新版本，不覆寫本次確認。`);
    } catch (requestError) { setError(requestError.message || "參考圖組確認失敗，請重新選擇圖片後再試。"); }
  };

  const generateProposal = () => {
    clearStatus();
    try {
      const result = localStore.generateProposalWithPoints(project.project_id, {
        idempotencyKey: `proposal-${project.project_id}-${project.active_confirmed_reference_set_id}`,
        cost: PROPOSAL_COST,
      });
      setMessage(result.reused ? "此參考圖組已生成過提案，未重複扣點。" : `正式提案已生成，扣除 ${PROPOSAL_COST} 點。`);
    } catch (requestError) { setError(requestError.message || "正式提案產生失敗，點數不會被扣除，請稍後再試。"); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-amber-700">設計參考圖定稿</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-bold"><Layers3 className="h-7 w-7" />提案圖確認</h1><p className="mt-2 text-stone-600">管理圖片版本、比較候選並鎖定正式提案採用圖組；遮罩與區域重繪請至平面圖 AI 視覺化。</p></div>
        <div className="flex flex-wrap items-center gap-3"><Badge variant="secondary" className="px-3 py-2"><Coins className="mr-2 h-4 w-4" />可用 {database.point_balance ?? 0} 點</Badge><Badge className={isBusinessPlan(planId) ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-stone-200 text-stone-700 hover:bg-stone-200"}>{isBusinessPlan(planId) ? "商業方案已啟用" : "非商業方案"}</Badge>{project?.proposal_generation?.status === "completed" && <Button asChild><Link to={`${createPageUrl("ProposalReport")}?project=${project.project_id}`}>查看正式提案</Link></Button>}</div>
      </div>

      <Card><CardContent className="grid gap-4 p-5 sm:grid-cols-2"><label className="text-sm font-medium">專案<select className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3" value={projectId} onChange={(event) => { setProjectId(event.target.value); setSelectedRevisionIds([]); }}><option value="">請選擇專案</option>{projects.map((item) => <option key={item.project_id} value={item.project_id}>{item.case_code}－{item.project_name || item.name || "未命名專案"}</option>)}</select></label><label className="text-sm font-medium">空間<Input className="mt-2" value={space} onChange={(event) => setSpace(event.target.value)} /></label></CardContent></Card>

      {!project ? <Alert><AlertDescription>請先完成需求表並建立專案。</AlertDescription></Alert> : (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr_330px]">
          <Card><CardHeader><CardTitle className="text-lg">圖片版本</CardTitle></CardHeader><CardContent className="space-y-3"><label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-stone-300 p-3 text-sm font-medium hover:bg-stone-50"><Upload className="mr-2 h-4 w-4" />上傳參考圖片<input className="sr-only" type="file" accept="image/*" onChange={uploadImage} /></label>{revisions.length ? revisions.map((revision) => <button key={revision.revision_id} type="button" onClick={() => setActiveRevisionId(revision.revision_id)} className={`w-full rounded-md border p-2 text-left ${activeRevision?.revision_id === revision.revision_id ? "border-amber-500 bg-amber-50" : "border-stone-200"}`}><img src={revision.image_url} alt={`${revision.space} v${revision.version}`} className="h-24 w-full rounded object-cover" /><span className="mt-2 flex justify-between text-xs"><span>{revision.space} v{revision.version}</span><span>{revision.status === "adopted" ? "已採用" : "候選"}</span></span></button>) : <div className="rounded-md bg-stone-100 p-5 text-center text-sm text-stone-500"><ImagePlus className="mx-auto mb-2 h-7 w-7" />請先由 AI 生成或上傳圖片</div>}</CardContent></Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">版本預覽與採用</CardTitle></CardHeader>
            <CardContent>
              {activeRevision ? <>
                {showDifference && activeRevision.source_image_url
                  ? <ImageDifferenceViewer beforeUrl={activeRevision.source_image_url} afterUrl={activeRevision.image_url} />
                  : <ImageMaskCanvas ref={maskCanvasRef} imageUrl={activeRevision.image_url} enabled />}
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <Button type="button" size="sm" variant="outline" onClick={() => maskCanvasRef.current?.clear()}><Eraser className="mr-2 h-4 w-4" />清除 Mask</Button>
                  <Button type="button" size="sm" variant="outline" disabled={!activeRevision.source_image_url} onClick={() => setShowDifference((value) => !value)}><ScanSearch className="mr-2 h-4 w-4" />{showDifference ? "返回圈選" : "前後比較"}</Button>
                  <Button type="button" size="sm" variant="outline" disabled={!activeRevision.source_image_url || busy} onClick={revertToSource}><RotateCcw className="mr-2 h-4 w-4" />建立回退版</Button>
                </div>
                <Button type="button" variant={selectedRevisionIds.includes(activeRevision.revision_id) ? "default" : "outline"} className="mt-4 w-full" onClick={() => toggleRevision(activeRevision.revision_id)}><Check className="mr-2 h-4 w-4" />{selectedRevisionIds.includes(activeRevision.revision_id) ? "已選為採用圖片" : "選為採用圖片"}</Button>
              </> : <div className="grid aspect-[4/3] place-items-center rounded-lg bg-stone-100 text-stone-500">尚無圖片</div>}
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle className="text-lg">確認與生成</CardTitle></CardHeader><CardContent className="space-y-4"><VisualEditingIntentControls intentId={visualIntentId} onIntentChange={setVisualIntentId} semanticRegion={semanticRegion} onSemanticRegionChange={setSemanticRegion} referenceAssetIds={referenceAssetIds} onReferenceAssetIdsChange={setReferenceAssetIds} /><label className="text-sm font-medium">文字版本指示<Textarea className="mt-2 min-h-28" placeholder="例如：建立較明亮的提案候選版本；保留格局與採光。" value={instruction} onChange={(event) => setInstruction(event.target.value)} /></label><Button type="button" variant="outline" className="w-full" disabled={busy || !isBusinessPlan(planId) || !activeRevision} onClick={generateRevision}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}產生候選版本（{REVISION_COST} 點）</Button>{assetCandidate && <div className="border border-stone-200 bg-stone-50 p-3 text-sm"><div className="flex items-center justify-between gap-3"><span>Asset v{assetCandidate.revision}</span><Badge className={assetCandidate.status === "approved" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{assetCandidate.status === "approved" ? "已核准" : "候選"}</Badge></div>{assetCandidate.status !== "approved" && <Button type="button" size="sm" className="mt-3 w-full" disabled={busy} onClick={approveCandidate}><Check className="mr-2 h-4 w-4" />人工核准資產版本</Button>}</div>}<div className="border-t pt-4"><p className="text-sm text-stone-600">已選 {selectedRevisionIds.length} 張。確認後建立不可覆寫的參考圖組版本。</p><Button type="button" className="mt-3 w-full bg-amber-500 text-white hover:bg-amber-600" disabled={!selectedRevisionIds.length} onClick={confirmSelection}>確定採用圖片</Button></div><div className="rounded-md bg-stone-100 p-3 text-xs leading-5 text-stone-600">候選圖片改版 {REVISION_COST} 點；正式圖像提案 {PROPOSAL_COST} 點。所有扣點功能僅限商業方案，成功才扣點。</div>{!isBusinessPlan(planId) && <Button asChild variant="outline" className="w-full"><Link to={createPageUrl("PricingPlans")}><Crown className="mr-2 h-4 w-4" />升級商業方案</Link></Button>}<Button type="button" className="w-full bg-stone-900 text-white hover:bg-stone-800" disabled={!confirmedSet || !isBusinessPlan(planId)} onClick={generateProposal}><Coins className="mr-2 h-4 w-4" />商業方案：扣點生成正式圖像提案</Button>{message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}</CardContent></Card>
        </div>
      )}
    </div>
  );
}
