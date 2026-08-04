import React, { useEffect, useMemo, useState } from "react";
import { Check, Coins, ImagePlus, Layers3, Loader2, Upload, Wand2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GenerateImage, UploadFile } from "@/lib/localAdapters";
import { localStore } from "@/lib/localStore";
import { createPageUrl } from "@/utils";

const PROPOSAL_COST = 30;

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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const project = projects.find((item) => item.project_id === projectId || item.id === projectId);
  const revisions = useMemo(() => project?.reference_revisions || [], [project]);
  const activeRevision = revisions.find((item) => item.revision_id === activeRevisionId) || revisions[0];
  const confirmedSet = (project?.confirmed_reference_sets || []).find(
    (item) => item.confirmed_reference_set_id === project?.active_confirmed_reference_set_id
  );

  useEffect(() => localStore.subscribe(() => setDatabase(localStore.getAll())), []);
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
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); event.target.value = ""; }
  };

  const generateRevision = async () => {
    if (!project) return;
    clearStatus(); setBusy(true);
    try {
      const prompt = `${project.primary_style || project.preferred_style || "現代簡約"} ${space}室內設計。修改要求：${instruction || "維持原需求並提升空間完整度"}`;
      const { url } = await GenerateImage({ prompt });
      const revision = localStore.saveReferenceRevision(project.project_id, {
        image_url: url,
        source_image_url: activeRevision?.image_url || null,
        image_role: "ai_revision",
        instruction,
        prompt,
        space,
      });
      setActiveRevisionId(revision.revision_id);
      setMessage(`已產生 ${space} v${revision.version}，尚未採用。`);
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  const confirmSelection = () => {
    clearStatus();
    try {
      const result = localStore.confirmReferenceSet(project.project_id, selectedRevisionIds);
      setMessage(`已鎖定參考圖組 v${result.version}；後續修改會另建新版本，不覆寫本次確認。`);
    } catch (requestError) { setError(requestError.message); }
  };

  const generateProposal = () => {
    clearStatus();
    try {
      const result = localStore.generateProposalWithPoints(project.project_id, {
        idempotencyKey: `proposal-${project.project_id}-${project.active_confirmed_reference_set_id}`,
        cost: PROPOSAL_COST,
      });
      setMessage(result.reused ? "此參考圖組已生成過提案，未重複扣點。" : `正式提案已生成，扣除 ${PROPOSAL_COST} 點。`);
    } catch (requestError) { setError(requestError.message); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-amber-700">設計參考圖確認</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-bold"><Layers3 className="h-7 w-7" />自由畫布</h1><p className="mt-2 text-stone-600">修改參考圖片、比較版本並選定正式提案要採用的圖片。</p></div>
        <div className="flex items-center gap-3"><Badge variant="secondary" className="px-3 py-2"><Coins className="mr-2 h-4 w-4" />可用 {database.point_balance ?? 0} 點</Badge>{project?.proposal_generation?.status === "completed" && <Button asChild><Link to={`${createPageUrl("ProposalReport")}?project=${project.project_id}`}>查看正式提案</Link></Button>}</div>
      </div>

      <Card><CardContent className="grid gap-4 p-5 sm:grid-cols-2"><label className="text-sm font-medium">專案<select className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3" value={projectId} onChange={(event) => { setProjectId(event.target.value); setSelectedRevisionIds([]); }}><option value="">請選擇專案</option>{projects.map((item) => <option key={item.project_id} value={item.project_id}>{item.case_code}－{item.project_name || item.name || "未命名專案"}</option>)}</select></label><label className="text-sm font-medium">空間<Input className="mt-2" value={space} onChange={(event) => setSpace(event.target.value)} /></label></CardContent></Card>

      {!project ? <Alert><AlertDescription>請先完成需求表並建立專案。</AlertDescription></Alert> : (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr_330px]">
          <Card><CardHeader><CardTitle className="text-lg">圖片版本</CardTitle></CardHeader><CardContent className="space-y-3"><label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-stone-300 p-3 text-sm font-medium hover:bg-stone-50"><Upload className="mr-2 h-4 w-4" />上傳參考圖片<input className="sr-only" type="file" accept="image/*" onChange={uploadImage} /></label>{revisions.length ? revisions.map((revision) => <button key={revision.revision_id} type="button" onClick={() => setActiveRevisionId(revision.revision_id)} className={`w-full rounded-md border p-2 text-left ${activeRevision?.revision_id === revision.revision_id ? "border-amber-500 bg-amber-50" : "border-stone-200"}`}><img src={revision.image_url} alt={`${revision.space} v${revision.version}`} className="h-24 w-full rounded object-cover" /><span className="mt-2 flex justify-between text-xs"><span>{revision.space} v{revision.version}</span><span>{revision.status === "adopted" ? "已採用" : "候選"}</span></span></button>) : <div className="rounded-md bg-stone-100 p-5 text-center text-sm text-stone-500"><ImagePlus className="mx-auto mb-2 h-7 w-7" />請先由 AI 生成或上傳圖片</div>}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-lg">修改參考圖片</CardTitle></CardHeader><CardContent>{activeRevision ? <><div className="overflow-hidden rounded-lg bg-stone-100"><img src={activeRevision.image_url} alt="目前參考版本" className="aspect-[4/3] w-full object-cover" /></div><Button type="button" variant={selectedRevisionIds.includes(activeRevision.revision_id) ? "default" : "outline"} className="mt-4 w-full" onClick={() => toggleRevision(activeRevision.revision_id)}><Check className="mr-2 h-4 w-4" />{selectedRevisionIds.includes(activeRevision.revision_id) ? "已選為採用圖片" : "選為採用圖片"}</Button></> : <div className="grid aspect-[4/3] place-items-center rounded-lg bg-stone-100 text-stone-500">尚無圖片</div>}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-lg">確認與生成</CardTitle></CardHeader><CardContent className="space-y-4"><label className="text-sm font-medium">修改指示<Textarea className="mt-2 min-h-28" placeholder="例如：沙發改為米白色，保留原本格局與採光。" value={instruction} onChange={(event) => setInstruction(event.target.value)} /></label><Button type="button" variant="outline" className="w-full" disabled={busy} onClick={generateRevision}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}產生修改版本</Button><div className="border-t pt-4"><p className="text-sm text-stone-600">已選 {selectedRevisionIds.length} 張。確認後建立不可覆寫的參考圖組版本。</p><Button type="button" className="mt-3 w-full bg-amber-500 text-white hover:bg-amber-600" disabled={!selectedRevisionIds.length} onClick={confirmSelection}>確定採用圖片</Button></div><div className="rounded-md bg-stone-100 p-3 text-xs leading-5 text-stone-600">正式生成費用：{PROPOSAL_COST} 點。成功才扣點；同一確認版本重試不重複扣點，失敗不留扣點交易。</div><Button type="button" className="w-full bg-stone-900 text-white hover:bg-stone-800" disabled={!confirmedSet} onClick={generateProposal}><Coins className="mr-2 h-4 w-4" />扣點並生成正式提案</Button>{message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}</CardContent></Card>
        </div>
      )}
    </div>
  );
}
