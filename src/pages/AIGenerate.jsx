import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { localStore } from "@/lib/localStore";

const API_BASE = "http://127.0.0.1:4180/api/v1";
const styles = ["現代簡約", "日式無印", "北歐自然", "侘寂", "工業風", "現代奢華"];

const headers = (idempotencyKey) => ({
  "Content-Type": "application/json",
  Authorization: "Bearer local-dev-headquarter",
  "X-Tenant-Id": "tenant_local_tigi",
  "X-Organization-Id": "org_local_headquarter",
  "X-Purpose": "stylematch_design_recommendation_draft",
  "X-Consent-Ref": "consent_local_trial",
  "X-Trace-Id": `tr_stylematch_${Date.now()}`,
  "Idempotency-Key": idempotencyKey,
});

export default function AIGenerate() {
  const projects = useMemo(() => localStore.getAll().projects || [], []);
  const [projectId, setProjectId] = useState(projects[0]?.project_id || "");
  const [style, setStyle] = useState(styles[0]);
  const [space, setSpace] = useState("客廳");
  const [requirements, setRequirements] = useState("明亮、自然採光、收納充足，保留舒適動線");
  const [task, setTask] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const selectedProject = projects.find((item) => item.project_id === projectId);

  useEffect(() => {
    fetch(`${API_BASE}/ai/health`).then((response) => response.json()).then(setHealth).catch(() => setHealth({ comfyui: "offline" }));
  }, []);

  useEffect(() => {
    if (!task || !["queued", "running"].includes(task.status)) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/ai/image-tasks/${task.ai_task_id}`);
        const data = await response.json();
        setTask(data.task);
        if (data.task?.status === "failed") setError(data.task.error || "ComfyUI 生圖失敗");
      } catch (pollError) {
        setError(pollError.message);
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [task]);

  const generate = async () => {
    setError("");
    setTask(null);
    const prompt = `Professional interior design visualization of a ${space}, ${style} style, ${requirements}. Photorealistic, practical residential layout, natural materials, coherent lighting, wide angle, no people.`;
    try {
      const response = await fetch(`${API_BASE}/ai/image-tasks`, {
        method: "POST",
        headers: headers(`stylematch-image-${crypto.randomUUID()}`),
        body: JSON.stringify({ prompt, stylematch_project_id: selectedProject?.stylematch_project_id || projectId || null, case_code: selectedProject?.case_code || null, width: 1024, height: 768 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "無法建立生圖任務");
      setTask(data.task);
      setHealth((value) => ({ ...value, comfyui: "online" }));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const busy = task && ["queued", "running"].includes(task.status);

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900"><Sparkles className="h-4 w-4" />StyleMatch Design Recommendation Draft</div>
          <h1 className="text-3xl font-bold text-stone-950">AI 空間設計建議草案</h1>
          <p className="mt-2 text-stone-600">透過本地後端提交 ComfyUI 任務。輸出僅供設計討論，需由設計師人工審核。</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader><CardTitle className="text-lg">生成設定</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div><label className="mb-2 block text-sm font-medium">StyleMatch 專案</label><select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">未綁定測試專案</option>{projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.case_code || project.project_id}</option>)}</select></div>
              <div><label className="mb-2 block text-sm font-medium">空間</label><Input value={space} onChange={(event) => setSpace(event.target.value)} /></div>
              <div><label className="mb-2 block text-sm font-medium">設計風格</label><div className="grid grid-cols-2 gap-2">{styles.map((preset) => <Button key={preset} type="button" variant={style === preset ? "default" : "outline"} onClick={() => setStyle(preset)}>{preset}</Button>)}</div></div>
              <div><label className="mb-2 block text-sm font-medium">需求摘要</label><Textarea rows={4} value={requirements} onChange={(event) => setRequirements(event.target.value)} /></div>
              <Button className="w-full bg-amber-500 text-white hover:bg-amber-600" disabled={busy || health?.comfyui !== "online"} onClick={generate}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}{busy ? "ComfyUI 生成中" : "產生設計草案"}</Button>
              <div className={`flex items-center gap-2 text-sm ${health?.comfyui === "online" ? "text-emerald-700" : "text-rose-700"}`}>{health?.comfyui === "online" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}ComfyUI：{health?.comfyui === "online" ? "已連線" : "未連線（請先啟動 8188）"}</div>
              {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-stone-200 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ImagePlus className="h-5 w-5 text-amber-600" />AI 設計草案</CardTitle></CardHeader>
            <CardContent>
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-stone-200">
                {task?.status === "completed" ? <img src={`${task.image_url}?v=${task.updated_at}`} alt={`${space} ${style} AI 設計草案`} className="h-full w-full object-cover" /> : busy ? <div className="text-center text-stone-600"><Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin" /><p>正在本機生成設計草案</p></div> : <div className="text-center text-stone-500"><ImagePlus className="mx-auto mb-3 h-10 w-10" /><p>設定需求後產生第一張草案</p></div>}
              </div>
              <div className="mt-4 grid gap-2 text-sm text-stone-600 sm:grid-cols-2"><p>任務：{task?.ai_task_id || "尚未建立"}</p><p>狀態：{task?.status || "待命"}</p><p>模型：{task?.checkpoint || health?.checkpoint || "待偵測"}</p><p>Workflow：{task?.workflow_version || health?.workflow_version || "stylematch-sdxl-v1"}</p></div>
              <p className="mt-4 border-l-4 border-amber-400 pl-3 text-sm text-stone-700">AI 設計建議草案，非施工圖、契約附件或正式決策；發布或交付前需由設計師人工審核。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
