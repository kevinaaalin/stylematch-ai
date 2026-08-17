import React, { useEffect, useRef, useState } from "react";
import { Camera, Coins, Crown, Eraser, ImagePlus, Layers3, Loader2, Upload, Wand2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GenerateImage, UploadFile } from "@/lib/localAdapters";
import { createAndWaitForImageTask } from "@/lib/aiImageTasks";
import { localStore } from "@/lib/localStore";
import { isBusinessPlan, PLAN_CHANGE_EVENT, readActivePlan, requireBusinessPlan } from "@/lib/planAccess";
import { createPageUrl } from "@/utils";
import StructuredSpacePanel from "@/components/floorplan/StructuredSpacePanel";

const POINT_COSTS = { birdseye: 10, redraw: 5, room: 10 };

export default function FloorPlanVisualizer() {
  const [searchParams] = useSearchParams();
  const [database, setDatabase] = useState(() => localStore.getAll());
  const projects = database.projects || [];
  const [projectId, setProjectId] = useState(searchParams.get("project") || projects[0]?.project_id || "");
  const [floorPlanUrl, setFloorPlanUrl] = useState("");
  const [area, setArea] = useState("");
  const [scale, setScale] = useState("");
  const [height, setHeight] = useState("280");
  const [beamNotes, setBeamNotes] = useState("");
  const [style, setStyle] = useState("現代簡約");
  const [birdseyeUrl, setBirdseyeUrl] = useState("");
  const [redrawInstruction, setRedrawInstruction] = useState("");
  const [cameraPoint, setCameraPoint] = useState({ x: 50, y: 55 });
  const [direction, setDirection] = useState(0);
  const [fov, setFov] = useState(60);
  const [roomUrl, setRoomUrl] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [planId, setPlanId] = useState(readActivePlan);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const project = projects.find((item) => item.project_id === projectId || item.id === projectId);

  const generateUnified = async ({ prompt, outputType, purpose, sourceMediaUrls, operation }) => {
    try {
      return await createAndWaitForImageTask({ project, prompt, outputType, purpose, sourceMediaUrls, operation });
    } catch (apiError) {
      const fallback = await GenerateImage({ prompt });
      return { url: fallback.url, task: null, generation_source: "local_sdk_fallback", authoritative: false, fallback_reason: apiError.message };
    }
  };

  const saveGeneratedRevision = (generated, imageRole, prompt, detail = {}) => {
    if (!project) return;
    localStore.saveReferenceRevision(project.project_id, {
      image_url: generated.url, image_role: imageRole, prompt,
      source_task_id: generated.task?.ai_task_id || null,
      workflow_version: generated.task?.workflow_version || null,
      checkpoint: generated.task?.checkpoint || null,
      seed: generated.task?.seed ?? null,
      generation_source: generated.generation_source,
      authoritative: generated.authoritative,
      fallback_reason: generated.fallback_reason || null,
      ...detail,
    });
  };

  useEffect(() => localStore.subscribe(() => setDatabase(localStore.getAll())), []);
  useEffect(() => {
    const refreshPlan = () => setPlanId(readActivePlan());
    window.addEventListener(PLAN_CHANGE_EVENT, refreshPlan);
    window.addEventListener("storage", refreshPlan);
    return () => { window.removeEventListener(PLAN_CHANGE_EVENT, refreshPlan); window.removeEventListener("storage", refreshPlan); };
  }, []);

  const charge = (type, cost, detail) => localStore.consumePoints(projectId, {
    type,
    cost,
    detail,
    idempotencyKey: `${type}-${projectId}-${crypto.randomUUID()}`,
  });

  const uploadFloorPlan = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy("upload");
    try { const result = await UploadFile({ file }); setFloorPlanUrl(result.file_url); setMessage("平面圖已載入，請補充比例與高度資料後進行分析。"); }
    finally { setBusy(""); event.target.value = ""; }
  };

  const generateBirdseye = async () => {
    if (!floorPlanUrl) return setMessage("請先上傳平面圖。");
    try { requireBusinessPlan("鳥瞰圖生成"); } catch (error) { return setMessage(error.message); }
    setBusy("birdseye");
    const prompt = `${style}住宅，依平面配置生成全屋等角鳥瞰概念圖，約${area || "未提供"}坪，層高${height}公分，保留空間分區與動線。`;
    try { const result = await generateUnified({ prompt, outputType: "floorplan_birdseye", purpose: "stylematch_floorplan_birdseye", sourceMediaUrls: [floorPlanUrl], operation: { area, scale, height, beam_notes: beamNotes, style } }); const payment = charge("floorplan_birdseye", POINT_COSTS.birdseye, "平面圖鳥瞰生成"); setBirdseyeUrl(result.url); saveGeneratedRevision(result, "floorplan_birdseye", prompt, { source_image_url: floorPlanUrl }); setMessage(`鳥瞰概念圖已生成，扣除 ${POINT_COSTS.birdseye} 點，餘額 ${payment.balance} 點。`); } catch (error) { setMessage(error.message); } finally { setBusy(""); }
  };

  const canvasPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvasRef.current.width / rect.width), y: (event.clientY - rect.top) * (canvasRef.current.height / rect.height) };
  };
  const startMask = (event) => { drawingRef.current = true; const ctx = canvasRef.current.getContext("2d"); const point = canvasPoint(event); ctx.beginPath(); ctx.moveTo(point.x, point.y); };
  const drawMask = (event) => { if (!drawingRef.current) return; const ctx = canvasRef.current.getContext("2d"); const point = canvasPoint(event); ctx.lineTo(point.x, point.y); ctx.strokeStyle = "rgba(220,38,38,.58)"; ctx.lineWidth = 26; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); };
  const stopMask = () => { drawingRef.current = false; };
  const clearMask = () => canvasRef.current?.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  const redrawRegion = async () => {
    if (!birdseyeUrl || !redrawInstruction.trim()) return setMessage("請先生成鳥瞰圖、圈選區域並輸入修正指示。");
    try { requireBusinessPlan("遮罩區域重繪"); } catch (error) { return setMessage(error.message); }
    setBusy("redraw");
    try { const prompt = `${style}全屋鳥瞰圖，僅修改遮罩區域：${redrawInstruction}，其餘格局、家具與視角保持不變。`; const maskDataUrl = canvasRef.current?.toDataURL("image/png") || null; const result = await generateUnified({ prompt, outputType: "floorplan_region_redraw", purpose: "stylematch_floorplan_region_redraw", sourceMediaUrls: [birdseyeUrl, maskDataUrl], operation: { instruction: redrawInstruction, style } }); const payment = charge("floorplan_region_redraw", POINT_COSTS.redraw, "遮罩區域重繪"); setBirdseyeUrl(result.url); saveGeneratedRevision(result, "floorplan_region_redraw", prompt, { source_image_url: birdseyeUrl, instruction: redrawInstruction }); clearMask(); setMessage(`局部重繪完成，扣除 ${POINT_COSTS.redraw} 點，餘額 ${payment.balance} 點。`); } catch (error) { setMessage(error.message); } finally { setBusy(""); }
  };

  const setCamera = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCameraPoint({ x: Math.round(((event.clientX - rect.left) / rect.width) * 100), y: Math.round(((event.clientY - rect.top) / rect.height) * 100) });
  };
  const generateRoom = async () => {
    try { requireBusinessPlan("指定視角空間生成"); } catch (error) { return setMessage(error.message); }
    setBusy("room");
    try { const prompt = `${style}住宅單空間室內概念參考圖，相機位於平面圖 ${cameraPoint.x}%,${cameraPoint.y}%，朝向${direction}度，水平視角${fov}度。`; const result = await generateUnified({ prompt, outputType: "floorplan_room_view", purpose: "stylematch_floorplan_room_view", sourceMediaUrls: [floorPlanUrl, birdseyeUrl], operation: { camera_point: cameraPoint, direction, fov, style } }); const payment = charge("floorplan_room_view", POINT_COSTS.room, "指定視角空間生成"); setRoomUrl(result.url); saveGeneratedRevision(result, "floorplan_room_view", prompt, { source_image_url: birdseyeUrl || floorPlanUrl, viewpoint: { camera_point: cameraPoint, direction, fov } }); setMessage(`指定視角空間圖已生成，扣除 ${POINT_COSTS.room} 點，餘額 ${payment.balance} 點。`); } catch (error) { setMessage(error.message); } finally { setBusy(""); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header><Badge variant="outline">平面圖驅動空間提案引擎</Badge><h1 className="mt-3 flex items-center gap-2 text-3xl font-bold"><Layers3 className="h-7 w-7" />平面圖 AI 視覺化</h1><p className="mt-2 text-stone-600">解析平面圖、生成鳥瞰概念圖、遮罩區域重繪，再指定相機位置與 FOV 產生空間參考圖。</p></header>
      <Alert><AlertDescription>本工具輸出為 AI 概念提案，不是施工圖或精準 3D 模型；尺寸、樑位與可施工性仍須由專業人員確認。</AlertDescription></Alert>
      <div className="flex flex-wrap items-center gap-3 border border-stone-200 bg-white p-4 text-sm"><Badge className={isBusinessPlan(planId) ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-stone-200 text-stone-700 hover:bg-stone-200"}>{isBusinessPlan(planId) ? "商業方案已啟用" : "需升級商業方案"}</Badge><span className="text-stone-600"><Coins className="mr-1 inline h-4 w-4" />鳥瞰 {POINT_COSTS.birdseye} 點／局部重繪 {POINT_COSTS.redraw} 點／指定視角 {POINT_COSTS.room} 點</span>{!isBusinessPlan(planId) && <Button asChild size="sm" variant="outline"><Link to={createPageUrl("PricingPlans")}><Crown className="mr-2 h-4 w-4" />升級商業方案</Link></Button>}</div>
      <label className="block max-w-xl text-sm font-medium">專案<select className="mt-2 h-10 w-full rounded-md border border-stone-300 bg-white px-3" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">請選擇專案</option>{projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.case_code} - {project.project_name || project.name || "未命名專案"}</option>)}</select></label>

      <Tabs defaultValue="upload" className="space-y-5"><TabsList className="h-auto flex-wrap justify-start"><TabsTrigger value="upload">1 上傳與分析</TabsTrigger><TabsTrigger value="birdseye">2 鳥瞰與區域重繪</TabsTrigger><TabsTrigger value="camera">3 指定視角</TabsTrigger></TabsList>
        <TabsContent value="upload"><div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="rounded-md"><CardHeader><CardTitle>平面圖來源</CardTitle></CardHeader><CardContent><label className="grid min-h-80 cursor-pointer place-items-center overflow-hidden border border-dashed border-stone-300 bg-stone-100">{floorPlanUrl ? <img src={floorPlanUrl} alt="上傳的平面圖" className="max-h-[520px] w-full object-contain" /> : <span className="text-center text-sm text-stone-600"><Upload className="mx-auto mb-2 h-7 w-7" />上傳 JPG、PNG 或 PDF 平面圖</span>}<input className="sr-only" type="file" accept="image/*,.pdf" onChange={uploadFloorPlan} /></label></CardContent></Card>
          <Card className="rounded-md"><CardHeader><CardTitle>可選校正資料</CardTitle></CardHeader><CardContent className="space-y-4"><label className="text-sm font-medium">室內坪數<Input className="mt-2" value={area} onChange={(e) => setArea(e.target.value)} /></label><label className="text-sm font-medium">比例尺<Input className="mt-2" placeholder="例如 1:50" value={scale} onChange={(e) => setScale(e.target.value)} /></label><label className="text-sm font-medium">天花完成面 FH（cm）<Input className="mt-2" type="number" value={height} onChange={(e) => setHeight(e.target.value)} /></label><label className="text-sm font-medium">樑位 BH／UBH 與其他備註<Textarea className="mt-2" value={beamNotes} onChange={(e) => setBeamNotes(e.target.value)} /></label><Button className="w-full" disabled={!floorPlanUrl || busy === "upload"} onClick={() => setMessage("平面圖分析草稿已建立；請至下一步選擇風格生成鳥瞰圖。")}>建立分析草稿</Button></CardContent></Card>
        </div></TabsContent>
        <TabsContent value="birdseye"><div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <Card className="rounded-md"><CardHeader><CardTitle>鳥瞰圖與遮罩</CardTitle></CardHeader><CardContent>{birdseyeUrl ? <div className="relative aspect-[4/3] overflow-hidden bg-stone-100"><img src={birdseyeUrl} alt="全屋鳥瞰概念圖" className="h-full w-full object-cover" /><canvas ref={canvasRef} width="960" height="720" className="absolute inset-0 h-full w-full cursor-crosshair touch-none" onPointerDown={startMask} onPointerMove={drawMask} onPointerUp={stopMask} onPointerLeave={stopMask} /></div> : <div className="grid aspect-[4/3] place-items-center bg-stone-100 text-stone-500"><ImagePlus className="mb-2 h-8 w-8" />尚未生成鳥瞰圖</div>}</CardContent></Card>
          <Card className="rounded-md"><CardHeader><CardTitle>生成與局部修正</CardTitle></CardHeader><CardContent className="space-y-4"><label className="text-sm font-medium">設計風格<Input className="mt-2" value={style} onChange={(e) => setStyle(e.target.value)} /></label><Button className="w-full" onClick={generateBirdseye} disabled={busy === "birdseye" || !isBusinessPlan(planId) || !projectId}>{busy === "birdseye" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}生成／更換鳥瞰風格（{POINT_COSTS.birdseye} 點）</Button><div className="border-t pt-4"><div className="flex items-center justify-between"><span className="text-sm font-medium">遮罩區域重繪</span><Button variant="ghost" size="sm" onClick={clearMask}><Eraser className="mr-2 h-4 w-4" />清除</Button></div><Textarea className="mt-2" placeholder="例如：將圈選區域改為開放式中島廚房" value={redrawInstruction} onChange={(e) => setRedrawInstruction(e.target.value)} /><Button variant="outline" className="mt-3 w-full" onClick={redrawRegion} disabled={busy === "redraw" || !isBusinessPlan(planId) || !projectId}>局部重繪（{POINT_COSTS.redraw} 點）</Button></div></CardContent></Card>
        </div></TabsContent>
        <TabsContent value="camera"><div className="grid gap-5 lg:grid-cols-[1fr_350px]">
          <Card className="rounded-md"><CardHeader><CardTitle>相機位置</CardTitle></CardHeader><CardContent><button type="button" onClick={setCamera} className="relative block aspect-[4/3] w-full overflow-hidden bg-stone-100 text-left">{floorPlanUrl ? <img src={floorPlanUrl} alt="選擇相機位置的平面圖" className="h-full w-full object-contain" /> : <span className="grid h-full place-items-center text-stone-500">請先上傳平面圖</span>}<span className="absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-red-600 text-white shadow" style={{ left: `${cameraPoint.x}%`, top: `${cameraPoint.y}%` }}><Camera className="h-4 w-4" /></span></button>{roomUrl && <img src={roomUrl} alt="指定視角空間參考圖" className="mt-4 aspect-video w-full object-cover" />}</CardContent></Card>
          <Card className="rounded-md"><CardHeader><CardTitle>視角設定</CardTitle></CardHeader><CardContent className="space-y-5"><label className="block text-sm font-medium">朝向 {direction}°<input className="mt-2 w-full accent-amber-500" type="range" min="0" max="359" value={direction} onChange={(e) => setDirection(Number(e.target.value))} /></label><label className="block text-sm font-medium">水平 FOV {fov}°<input className="mt-2 w-full accent-amber-500" type="range" min="35" max="90" value={fov} onChange={(e) => setFov(Number(e.target.value))} /></label><p className="text-xs leading-5 text-stone-500">在左側平面圖點選相機位置；60° 為預設參考視角。</p><Button className="w-full" onClick={generateRoom} disabled={!floorPlanUrl || busy === "room" || !isBusinessPlan(planId) || !projectId}>{busy === "room" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}生成空間參考圖（{POINT_COSTS.room} 點）</Button></CardContent></Card>
        </div></TabsContent>
      </Tabs>
      <StructuredSpacePanel projectId={projectId} floorPlanUrl={floorPlanUrl} />
      {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}
    </div>
  );
}
