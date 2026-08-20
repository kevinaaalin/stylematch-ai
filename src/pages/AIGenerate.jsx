import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  Cuboid,
  CreditCard,
  Crown,
  Download,
  Eye,
  FileImage,
  ImagePlus,
  Layers3,
  Loader2,
  Orbit,
  Upload,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import PanoramaViewer from "@/components/ai/PanoramaViewer";
import { styleImages } from "@/components/styletest/styleImageData";
import { localStore } from "@/lib/localStore";
import { isBusinessPlan, PLAN_CHANGE_EVENT, readActivePlan, requireBusinessPlan } from "@/lib/planAccess";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { STYLE_CATALOG, getStyleById, normalizeStyleId } from "@/data/styleCatalog";
import { analyzeImageStyleFallback } from "@/lib/imageStyleFallback";

const API_BASE = "http://127.0.0.1:4180/api/v1";
const AI_TASK_SESSION_KEY = "stylematch_ai_current_task_v1";
const IMAGE_GENERATION_COST = 10;
const PANORAMA_GENERATION_COST = 15;
const stylePresets = STYLE_CATALOG.map(({ name }) => name);
const roomPresets = ["客廳", "餐廳", "客餐廳（開放式）", "主臥室", "次臥室", "書房", "廚房", "衛浴", "辦公室", "商業空間", "接待／門市", "其他"];
const inputTypeOptions = ["空間實景照片", "3D 設計圖／場景", "手繪草圖", "平面配置圖", "無圖片，純文字生成"];
const creativeModeOptions = ["維持格局與主要物件", "保留格局，重新設計家具與材質", "保留主要物件，調整風格與照明", "自由創意重新設計"];
const lightingOptions = ["自然光", "自然光＋室內燈具", "明亮均勻照明", "溫暖情境照明", "商業展示照明", "維持原圖光線"];
const materialOptions = ["不指定", "自然木質", "石材與金屬", "清水模與灰泥", "玻璃與霧面金屬", "織品與藤編", "維持原圖材質"];
const colorOptions = ["不指定", "米白與暖灰", "大地色系", "黑白灰", "自然木色", "低飽和莫蘭迪", "品牌識別色", "維持原圖色彩"];
const panoramaCaptureDirections = [
  { id: "front", label: "前方 0°", yaw: 0 },
  { id: "right", label: "右方 90°", yaw: 90 },
  { id: "back", label: "後方 180°", yaw: 180 },
  { id: "left", label: "左方 270°", yaw: 270 },
];
const roomMediaKeys = {
  客廳: ["living_room"],
  餐廳: ["dining_room"],
  "客餐廳（開放式）": ["living_room", "dining_room"],
  主臥室: ["master_bedroom"],
  次臥室: ["bedroom1", "bedroom2"],
  書房: ["study", "bedroom1"],
  廚房: ["kitchen"],
  衛浴: ["bathroom"],
  辦公室: ["office"],
  商業空間: ["commercial_space"],
  "接待／門市": ["reception", "commercial_space"],
  其他: [],
};
const roomStyleOffsets = { 客廳: 0, 餐廳: 1, "客餐廳（開放式）": 0, 主臥室: 2, 次臥室: 3, 書房: 4, 廚房: 5, 衛浴: 6, 辦公室: 1, 商業空間: 5, "接待／門市": 0, 其他: 7 };
const readableTraditionalChineseError = (value, fallback) => {
  const message = typeof value === "string" ? value.trim() : "";
  const hasChinese = /[\u3400-\u9fff]/u.test(message);
  const hasEncodingArtifacts = /�|ï¿½|Ã|Â|æ|ç|嚙|銝|鈭|憭|蝣|閬|隞|餈/u.test(message);
  return message && hasChinese && !hasEncodingArtifacts ? message : fallback;
};

const requestHeaders = (idempotencyKey, purpose, caseAuthorization = "*") => ({
  "Content-Type": "application/json",
  Authorization: "Bearer local-dev-headquarter",
  "X-Tenant-Id": "tenant_local_tigi",
  "X-Organization-Id": "org_local_headquarter",
  "X-Purpose": purpose,
  "X-Consent-Ref": "consent_local_trial",
  "X-Trace-Id": `tr_stylematch_${Date.now()}`,
  "X-Server-Role": "headquarter",
  "X-Case-Role": "owner",
  "X-Case-Authorization": caseAuthorization,
  "Idempotency-Key": idempotencyKey,
});

function UploadField({ label, hint, preview, onChange }) {
  return (
    <label className="block rounded-md border border-dashed border-stone-300 bg-white p-3 transition hover:border-amber-500">
      <span className="flex items-center gap-2 text-sm font-medium text-stone-800"><Upload className="h-4 w-4" />{label}</span>
      <span className="mt-1 block text-xs text-stone-500">{hint}</span>
      <input className="sr-only" type="file" accept="image/*" onChange={onChange} />
      {preview && <img src={preview} alt={`${label}預覽`} className="mt-3 h-24 w-full rounded object-cover" />}
    </label>
  );
}

function StatusPill({ online }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${online ? "text-emerald-700" : "text-rose-700"}`}>
      {online ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      ComfyUI：{online ? "已連線" : "未連線，請先啟動 8188"}
    </div>
  );
}

function proposalImagesFor(project, room, styleKey) {
  if (!project) return [];
  const roomKeys = roomMediaKeys[room] || [];
  const proposalSpaces = project.design_proposal?.spaces
    || project.proposal_media?.design_proposal
    || project.proposal_images_by_room
    || {};
  const directRoomImages = roomKeys
    .flatMap((key) => proposalSpaces[key]?.images || proposalSpaces[key] || [])
    .filter(Boolean);
  if (directRoomImages.length) return [...new Set(directRoomImages)].slice(0, 6);

  const generated = project.proposal_images || project.generated_images || project.design_images || [];
  if (generated.length) {
    const start = roomStyleOffsets[room] % generated.length;
    const count = room === "客餐廳（開放式）" ? 4 : 3;
    return Array.from({ length: Math.min(count, generated.length) }, (_, index) => generated[(start + index) % generated.length]).filter(Boolean);
  }

  const candidates = styleImages.filter((image) => image.style.includes(styleKey));
  const library = candidates.length ? candidates : styleImages;
  const start = roomStyleOffsets[room] % library.length;
  const count = room === "客餐廳（開放式）" ? 4 : 3;
  return Array.from({ length: Math.min(count, library.length) }, (_, index) => library[(start + index) % library.length]?.src).filter(Boolean);
}

function collectProjectMedia(project, room, proposalImages) {
  if (!project) return { floorPlan: "", roomImages: [], referenceImages: [], all: [] };
  const media = project.proposal_media || {};
  const spacePhotos = media.space_photos || project.space_photos || {};
  const roomImages = (roomMediaKeys[room] || [])
    .flatMap((key) => spacePhotos[key] || [])
    .filter(Boolean);
  const floorPlan = spacePhotos.floor_plan?.[0] || project.floor_plan_url || "";
  const referenceImages = [...new Set(proposalImages.filter(Boolean))];
  return {
    floorPlan,
    roomImages,
    referenceImages,
    all: [...new Set([floorPlan, ...roomImages, ...referenceImages].filter(Boolean))],
  };
}

function projectRequirements(project) {
  if (!project) return "自然採光、動線清楚、材質一致，保留實際住宅尺度。";
  return [
    project.atmosphere_description,
    project.special_requirements,
    project.room_layout && `格局：${project.room_layout}`,
    project.material_grade && `材質等級：${project.material_grade}`,
    project.budget_range && `預算範圍：${project.budget_range}`,
  ].filter(Boolean).join("；") || "自然採光、動線清楚、材質一致，保留實際住宅尺度。";
}

export default function AIGenerate() {
  const [searchParams] = useSearchParams();
  const [database, setDatabase] = useState(() => localStore.getAll());
  const projects = database.projects || [];
  const styleTests = database.styleTests || [];
  const [projectId, setProjectId] = useState(searchParams.get("project") || projects[0]?.project_id || "");
  const [mode, setMode] = useState("image");
  const [style, setStyle] = useState(stylePresets[0]);
  const [space, setSpace] = useState(roomPresets[0]);
  const [requirements, setRequirements] = useState("自然採光、動線清楚、材質一致，保留實際住宅尺度。");
  const [inputType, setInputType] = useState(inputTypeOptions[0]);
  const [creativeMode, setCreativeMode] = useState(creativeModeOptions[0]);
  const [lighting, setLighting] = useState(lightingOptions[0]);
  const [material, setMaterial] = useState(materialOptions[0]);
  const [colorPalette, setColorPalette] = useState(colorOptions[0]);
  const [sourceImage, setSourceImage] = useState("");
  const [panoramaSources, setPanoramaSources] = useState({ front: "", right: "", back: "", left: "" });
  const [imageStyleAnalysis, setImageStyleAnalysis] = useState(null);
  const [roomSize, setRoomSize] = useState({ length: "5.2", width: "4.0", clearHeight: "2.8" });
  const [heightNotes, setHeightNotes] = useState("FH 280 cm；如有樑位請依平面圖 BH／UBH 標示。");
  const [viewpoint, setViewpoint] = useState("空間中央，視線高度 150 cm");
  const [task, setTask] = useState(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem(AI_TASK_SESSION_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [entitlement, setEntitlement] = useState(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentInfoOpen, setPaymentInfoOpen] = useState(false);
  const [floorPlan, setFloorPlan] = useState("");
  const [uploadedPanorama, setUploadedPanorama] = useState("");
  const [planId, setPlanId] = useState(readActivePlan);
  const selectedProject = projects.find((item) => item.project_id === projectId);
  const projectStyleTest = styleTests.find((test) => test.user_email && test.user_email === selectedProject?.user_email);
  const projectStyleKey = selectedProject?.primary_style
    || projectStyleTest?.primary_style
    || normalizeStyleId(style)
    || "modern";
  const projectProposalImages = useMemo(
    () => proposalImagesFor(selectedProject, space, projectStyleKey),
    [selectedProject, space, projectStyleKey]
  );
  const importedMedia = useMemo(
    () => collectProjectMedia(selectedProject, space, projectProposalImages),
    [selectedProject, space, projectProposalImages]
  );

  useEffect(() => {
    const refresh = () => setDatabase(localStore.getAll());
    return localStore.subscribe(refresh);
  }, []);

  useEffect(() => {
    const refreshPlan = () => setPlanId(readActivePlan());
    window.addEventListener(PLAN_CHANGE_EVENT, refreshPlan);
    window.addEventListener("storage", refreshPlan);
    return () => { window.removeEventListener(PLAN_CHANGE_EVENT, refreshPlan); window.removeEventListener("storage", refreshPlan); };
  }, []);

  useEffect(() => {
    if (!projects.length) return;
    if (!projects.some((project) => project.project_id === projectId)) {
      setProjectId(projects[0].project_id);
    }
  }, [projectId, projects]);

  useEffect(() => {
    fetch(`${API_BASE}/ai/health`)
      .then((response) => response.json())
      .then(setHealth)
      .catch(() => setHealth({ comfyui: "offline" }));
  }, []);

  useEffect(() => {
    if (task) window.sessionStorage.setItem(AI_TASK_SESSION_KEY, JSON.stringify(task));
    else window.sessionStorage.removeItem(AI_TASK_SESSION_KEY);
  }, [task]);

  useEffect(() => {
    if (!selectedProject) return;
    const projectStyle = selectedProject.primary_style
      || projectStyleTest?.primary_style
      || selectedProject.preferred_style
      || selectedProject.style;
    const matchedStyle = getStyleById(projectStyle).name;
    setStyle(matchedStyle);
    setRequirements(projectRequirements(selectedProject));
    setFloorPlan(importedMedia.floorPlan);
  }, [selectedProject, projectStyleTest?.primary_style, importedMedia.floorPlan]);

  useEffect(() => {
    if (!task || !["queued", "running"].includes(task.status)) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/ai/image-tasks/${task.ai_task_id}`, {
          headers: requestHeaders(`stylematch-status-${task.ai_task_id}`, "stylematch_ai_task_status", selectedProject?.case_code || "*"),
        });
        const data = await response.json();
        setTask(data.task);
        if (data.task?.status === "failed") {
          setError(readableTraditionalChineseError(data.task.error, "AI 圖片生成失敗，請稍後再試。"));
        }
      } catch (pollError) {
        setError(readableTraditionalChineseError(pollError.message, "無法取得 AI 圖片生成進度，請確認服務連線後再試。"));
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [selectedProject?.case_code, task]);

  useEffect(() => {
    if (task?.status !== "completed") {
      setEntitlement(null);
      return;
    }
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");
    const suffix = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
    setPaymentBusy(true);
    fetch(`${API_BASE}/ai/image-tasks/${task.ai_task_id}/download-entitlement${suffix}`, {
      headers: requestHeaders(`stylematch-entitlement-${task.ai_task_id}`, "stylematch_download_entitlement", selectedProject?.case_code || "*"),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(readableTraditionalChineseError(data.message, "無法確認付款與下載權限，請稍後再試。"));
        setEntitlement(data.entitlement);
        if (sessionId) window.history.replaceState({}, "", `${window.location.pathname}#/AIGenerate`);
      })
      .catch((requestError) => setError(readableTraditionalChineseError(requestError.message, "無法確認付款與下載權限，請稍後再試。")))
      .finally(() => setPaymentBusy(false));
  }, [task?.ai_task_id, task?.status]);

  const fileHandler = (setter) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const sourceImageHandler = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageStyleAnalysis(null);
    const reader = new FileReader();
    reader.onload = () => setSourceImage(String(reader.result || ""));
    reader.readAsDataURL(file);
    try {
      setImageStyleAnalysis(await analyzeImageStyleFallback(file));
    } catch {
      setImageStyleAnalysis({ confidence: 0, requires_confirmation: true, candidates: [], disclaimer: "無法讀取此圖片的本地特徵，請手動選擇設計風格。" });
    }
  };

  const panoramaSourceHandler = (directionId) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPanoramaSources((current) => ({ ...current, [directionId]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    setError("");
    setTask(null);
    const panorama = mode === "panorama";
    try {
      requireBusinessPlan(panorama ? "360° 環景生成" : "空間創意彩現");
      if (!selectedProject) throw new Error("請先選擇 StyleMatch 專案。");
    } catch (accessError) {
      setError(accessError.message);
      return;
    }
    const panoramaSourceEntries = panoramaCaptureDirections.map((direction) => ({
      ...direction,
      media_url: panoramaSources[direction.id],
    }));
    if (panorama && panoramaSourceEntries.some((entry) => !entry.media_url)) {
      setError("請依序上傳前、右、後、左四個方向的空間照片，再生成 360° 環景圖。");
      return;
    }
    const openPlanNote = space === "客餐廳（開放式）"
      ? "The living and dining zones are one continuous open-plan room. Preserve a single shared ceiling, floor, wall openings, circulation axis and coherent furniture scale across both zones."
      : "";
    const geometry = `${roomSize.length}m x ${roomSize.width}m, clear height ${roomSize.clearHeight}m. ${heightNotes}`;
    const controlledDesign = `Input type: ${inputType}. Creative mode: ${creativeMode}. Lighting: ${lighting}. Material: ${material}. Color palette: ${colorPalette}.`;
    const selectedStyleProfile = getStyleById(style);
    const styleDirection = `${selectedStyleProfile.prompt}. Preferred palette: ${selectedStyleProfile.palette.join(", ")}. Preferred materials: ${selectedStyleProfile.materials.join(", ")}.`;
    const prompt = panorama
      ? `Create one seamless 360-degree equirectangular panorama of one ${space}, ${style} interior from four ordered source photos: front 0 degrees, right 90 degrees, back 180 degrees, and left 270 degrees. Calibrate the shared camera center and horizon before perspective-to-ERP projection; stitch geometry first, then fill only missing ceiling or floor regions and inpaint seams. ${styleDirection} ${openPlanNote} ${controlledDesign} Room geometry: ${geometry}. Camera: ${viewpoint}. ${requirements}. Preserve wall openings, furniture identity, scale, material and lighting consistency around the entire room. Photorealistic architectural visualization, exact 2:1 projection, no people, no text, no duplicated furniture, seamless left and right edges.`
      : `Professional interior design visualization of a ${space}, ${style} style. ${styleDirection} ${openPlanNote} ${controlledDesign} ${requirements}. Room geometry: ${geometry}. Photorealistic, practical layout, coherent lighting, wide angle, no people.`;

    try {
      const response = await fetch(`${API_BASE}/ai/image-tasks`, {
        method: "POST",
        headers: requestHeaders(
          `stylematch-${panorama ? "panorama" : "image"}-${crypto.randomUUID()}`,
          panorama ? "stylematch_single_room_panorama_draft" : "stylematch_design_recommendation_draft",
          selectedProject?.case_code || "*"
        ),
        body: JSON.stringify({
          prompt,
          negative_prompt: selectedStyleProfile.negative_prompt,
          style_id: selectedStyleProfile.id,
          style_catalog_version: "stylematch.style-catalog.v1",
          stylematch_project_id: selectedProject?.stylematch_project_id || projectId || null,
          case_code: selectedProject?.case_code || null,
          width: panorama ? 1536 : 1024,
          height: panorama ? 768 : 768,
          output_type: panorama ? "equirectangular_2_1" : "perspective_draft",
          proposal_scope: "stylematch_pre_match_concept",
          room: space,
          room_geometry: { ...roomSize, height_notes: heightNotes },
          viewpoint,
          source_media_urls: [...new Set((panorama ? panoramaSourceEntries.map((entry) => entry.media_url) : [
            ...importedMedia.referenceImages,
            sourceImage,
            floorPlan,
            ...importedMedia.all,
          ]).filter(Boolean))],
          source_media_count: [...new Set((panorama ? panoramaSourceEntries.map((entry) => entry.media_url) : [
            ...importedMedia.referenceImages,
            sourceImage,
            floorPlan,
            ...importedMedia.all,
          ]).filter(Boolean))].length,
          source_content: {
            atmosphere_description: selectedProject?.atmosphere_description || null,
            special_requirements: selectedProject?.special_requirements || null,
            room_layout: selectedProject?.room_layout || null,
            material_grade: selectedProject?.material_grade || null,
            primary_style: selectedProject?.primary_style || null,
            input_type: inputType,
            creative_mode: creativeMode,
            lighting,
            material,
            color_palette: colorPalette,
            panorama_capture: panorama ? {
              input_mode: "four_direction_photos",
              ordered_sources: panoramaSourceEntries,
              processing_order: [
                "camera_calibration",
                "perspective_to_equirectangular_projection",
                "four_direction_stitching",
                "missing_area_fill",
                "seam_inpainting",
              ],
              output_projection: "equirectangular_2_1",
            } : null,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(readableTraditionalChineseError(data.message, "無法建立 AI 圖片生成任務，請稍後再試。"));
      localStore.consumePoints(selectedProject.project_id, {
        type: panorama ? "space_panorama_generation" : "space_image_generation",
        cost: panorama ? PANORAMA_GENERATION_COST : IMAGE_GENERATION_COST,
        detail: panorama ? "單一空間 360° 環景生成" : "單張空間創意彩現",
        idempotencyKey: `ai-task-${data.task.ai_task_id}`,
      });
      setTask(data.task);
      setHealth((value) => ({ ...value, comfyui: "online" }));
    } catch (requestError) {
      setError(readableTraditionalChineseError(requestError.message, "無法建立 AI 圖片生成任務，請確認服務連線後再試。"));
    }
  };

  const busy = task && ["queued", "running"].includes(task.status);
  const generatedImage = task?.status === "completed" ? `${task.image_url}?v=${task.updated_at}` : "";
  const panoramaImage = uploadedPanorama || (mode === "panorama" ? generatedImage : "");
  const downloadableImage = mode === "panorama" ? panoramaImage : generatedImage;

  useEffect(() => {
    if (!selectedProject || !generatedImage || !task?.ai_task_id) return;
    const alreadySaved = (selectedProject.reference_revisions || []).some((item) => item.source_task_id === task.ai_task_id);
    if (alreadySaved) return;
    localStore.saveReferenceRevision(selectedProject.project_id, {
      image_url: generatedImage,
      image_role: mode === "panorama" ? "ai_panorama" : "ai_reference",
      prompt: task.prompt || "",
      source_task_id: task.ai_task_id,
      space,
    });
  }, [generatedImage, mode, selectedProject, space, task?.ai_task_id, task?.prompt]);

  const downloadResult = async () => {
    if (!downloadableImage || !task?.ai_task_id || !entitlement?.download_unlocked) return;
    const filename = `StyleMatch-${selectedProject?.case_code || "proposal"}-${space}-${mode === "panorama" ? "360-panorama" : "design-draft"}.png`;
    try {
      const response = await fetch(`${API_BASE}/ai/image-tasks/${task.ai_task_id}/download`, {
        headers: requestHeaders(`stylematch-download-${task.ai_task_id}`, "stylematch_paid_file_download", selectedProject?.case_code || "*"),
      });
      if (!response.ok) throw new Error("下載失敗");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("下載失敗，請確認付款與下載權限後再試一次。");
    }
  };

  const openPayment = async () => {
    if (task?.status !== "completed") return;
    setError("");
    setPaymentBusy(true);
    try {
      const response = await fetch(`${API_BASE}/ai/image-tasks/${task.ai_task_id}/checkout-session`, {
        method: "POST",
        headers: requestHeaders(`stylematch-checkout-${task.ai_task_id}`, "stylematch_download_checkout", selectedProject?.case_code || "*"),
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(readableTraditionalChineseError(data.message, "無法建立安全付款頁面，請稍後再試。"));
      if (data.entitlement?.download_unlocked) {
        setEntitlement(data.entitlement);
        return;
      }
      if (!data.checkout_url) throw new Error("付款服務未回傳結帳頁面網址。");
      window.location.assign(data.checkout_url);
    } catch (requestError) {
      setError(readableTraditionalChineseError(requestError.message, "無法開啟安全付款頁面，請稍後再試。"));
    } finally {
      setPaymentBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-7">
      <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
        <header className="border-b border-stone-200 pb-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900"><Wand2 className="h-4 w-4" />StyleMatch AI 設計提案工作室</span>
            <span className="rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-600">StyleMatch AI v8.2.0 · TIGI R9.1 Candidate</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-950">AI 空間設計與 360° 環景</h1>
          <p className="mt-2 max-w-3xl text-stone-600">沿用 StyleMatch 專案資料，產生單張空間創意彩現或單一空間 360°×180° 環景提案。</p>
        </header>

        <div className="flex flex-wrap items-center gap-3 border border-stone-200 bg-white p-4 text-sm">
          <span className={`rounded-md px-3 py-1.5 font-medium ${isBusinessPlan(planId) ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>{isBusinessPlan(planId) ? "商業方案已啟用" : "需升級商業方案"}</span>
          <span className="text-stone-600"><Coins className="mr-1 inline h-4 w-4" />空間彩現 {IMAGE_GENERATION_COST} 點／360° 環景 {PANORAMA_GENERATION_COST} 點</span>
          {!isBusinessPlan(planId) && <Button asChild size="sm" variant="outline"><Link to={createPageUrl("PricingPlans")}><Crown className="mr-2 h-4 w-4" />升級商業方案</Link></Button>}
        </div>

        <Tabs value={mode} onValueChange={(value) => { setMode(value); setTask(null); setError(""); }}>
          <TabsList className="grid h-auto w-full max-w-md grid-cols-2">
            <TabsTrigger value="image" className="gap-2 py-2"><ImagePlus className="h-4 w-4" />單張空間創意彩現</TabsTrigger>
            <TabsTrigger value="panorama" className="gap-2 py-2"><Orbit className="h-4 w-4" />單一空間 360°</TabsTrigger>
          </TabsList>

          <div className="mt-5 grid gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
            <Card className="border-stone-200 shadow-sm">
              <CardHeader><CardTitle className="text-lg">提案輸入</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">StyleMatch 專案</label>
                  <select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
                    <option value="">未連結專案</option>
                    {projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.case_code || project.project_id}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">單一空間</label>
                  <select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={space} onChange={(event) => setSpace(event.target.value)}>
                    {roomPresets.map((room) => <option key={room}>{room}</option>)}
                  </select>
                </div>

                {mode === "panorama" ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">四方向空間照片</p>
                        <p className="mt-1 text-xs leading-5 text-stone-600">站在同一位置、同一相機高度，依前、右、後、左順序拍攝，相鄰畫面需保留重疊區域。</p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-amber-800">{Object.values(panoramaSources).filter(Boolean).length}/4</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {panoramaCaptureDirections.map((direction) => (
                        <UploadField
                          key={direction.id}
                          label={direction.label}
                          hint="JPG、PNG、WebP"
                          preview={panoramaSources[direction.id]}
                          onChange={panoramaSourceHandler(direction.id)}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-amber-900">系統會先校正與投影，再接合四方向照片並修補缺口與接縫；不是把四張照片當成切換選項。手機錄影與掃描資料之後也會轉成相同方向影格後進入此流程。</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3">
                    <UploadField label="自行上傳空間圖片（或 3D 設計圖）" hint="JPG、PNG、WebP；建議 16:9 或 4:3，避免過度裁切" preview={sourceImage} onChange={sourceImageHandler} />
                    {imageStyleAnalysis && (
                      <div className="mt-3 border border-amber-200 bg-amber-50 p-3 text-xs text-stone-700">
                        <p className="font-semibold text-stone-900">圖片風格候選｜低信心 {imageStyleAnalysis.confidence}%</p>
                        <p className="mt-1 leading-5">{imageStyleAnalysis.disclaimer}</p>
                        <div className="mt-2 flex flex-wrap gap-2">{imageStyleAnalysis.candidates.map((candidate) => <button type="button" key={candidate.id} onClick={() => setStyle(candidate.name)} className="border border-amber-300 bg-white px-2 py-1 hover:border-amber-600">{candidate.name} {candidate.percentage}%</button>)}</div>
                      </div>
                    )}
                    <p className="mt-2 text-xs leading-5 text-amber-900">上傳圖片會作為構圖與空間關係參考；若選擇「維持格局」，系統應優先保留牆體、開口與主要物件位置。</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div><label className="mb-2 block text-sm font-medium">輸入類型</label><select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={inputType} onChange={(event) => setInputType(event.target.value)}>{inputTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div><label className="mb-2 block text-sm font-medium">創意模式</label><select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={creativeMode} onChange={(event) => setCreativeMode(event.target.value)}>{creativeModeOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div><label className="mb-2 block text-sm font-medium">風格分類</label><select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={style} onChange={(event) => setStyle(event.target.value)}>{stylePresets.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div><label className="mb-2 block text-sm font-medium">照明選項</label><select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={lighting} onChange={(event) => setLighting(event.target.value)}>{lightingOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div><label className="mb-2 block text-sm font-medium">材質（選填）</label><select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={material} onChange={(event) => setMaterial(event.target.value)}>{materialOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div><label className="mb-2 block text-sm font-medium">顏色（選填）</label><select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={colorPalette} onChange={(event) => setColorPalette(event.target.value)}>{colorOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
                </div>

                <TabsContent value="panorama" className="m-0 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="mb-1 block text-xs text-stone-600">長度 m</label><Input value={roomSize.length} onChange={(event) => setRoomSize((value) => ({ ...value, length: event.target.value }))} /></div>
                    <div><label className="mb-1 block text-xs text-stone-600">寬度 m</label><Input value={roomSize.width} onChange={(event) => setRoomSize((value) => ({ ...value, width: event.target.value }))} /></div>
                    <div><label className="mb-1 block text-xs text-stone-600">淨高 m</label><Input value={roomSize.clearHeight} onChange={(event) => setRoomSize((value) => ({ ...value, clearHeight: event.target.value }))} /></div>
                  </div>
                  <div><label className="mb-2 block text-sm font-medium">高度與樑位</label><Textarea rows={2} value={heightNotes} onChange={(event) => setHeightNotes(event.target.value)} /></div>
                  <div><label className="mb-2 block text-sm font-medium">觀看點</label><Input value={viewpoint} onChange={(event) => setViewpoint(event.target.value)} /></div>
                </TabsContent>

                <div><label className="mb-2 block text-sm font-medium">設計需求（補充說明）</label><Textarea rows={4} maxLength={2000} placeholder="描述下拉選單無法涵蓋的細節，例如必須保留的物件、收納、動線或品牌需求。" value={requirements} onChange={(event) => setRequirements(event.target.value)} /><p className="mt-1 text-right text-xs text-stone-500">{requirements.length}/2000</p></div>

                <TabsContent value="panorama" className="m-0 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <UploadField label="平面配置圖" hint="尺寸、BH／UBH／FH 標示" preview={floorPlan} onChange={fileHandler(setFloorPlan)} />
                  <div className="rounded-md border border-stone-200 bg-white p-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-stone-800"><FileImage className="h-4 w-4" />提案參考圖</span>
                    <span className="mt-1 block text-xs text-stone-500">依專案風格與「{space}」自動選取，不需手動輸入</span>
                    {importedMedia.referenceImages.length ? (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {importedMedia.referenceImages.map((imageUrl, index) => (
                          <img key={imageUrl} src={imageUrl} alt={`${space}設計提案風格參考 ${index + 1}`} className="h-24 w-full rounded object-cover" />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 grid h-40 place-items-center rounded bg-stone-100 text-xs text-stone-500">專案尚無此空間的提案圖</div>
                    )}
                  </div>
                </TabsContent>
                {mode === "panorama" && selectedProject && (
                  <div className={`rounded-md border p-3 text-sm ${importedMedia.all.length ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                    <p className="font-medium">{importedMedia.all.length ? `已從專案自動導入 ${importedMedia.all.length} 張來源圖片` : "此舊專案沒有可還原的來源圖片"}</p>
                    <p className="mt-1 text-xs leading-5">{importedMedia.all.length ? "風格、需求、平面圖及所選空間圖片會隨任務送出。" : "舊資料只保存照片數量；可在上方重新選圖，之後建立的新專案會保存可用的提案圖片。"}</p>
                  </div>
                )}

                <Button className="w-full bg-amber-500 text-white hover:bg-amber-600" disabled={busy || health?.comfyui !== "online" || !isBusinessPlan(planId) || !selectedProject || (mode === "panorama" && Object.values(panoramaSources).some((image) => !image))} onClick={generate}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : mode === "panorama" ? <Orbit className="mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  {busy ? "ComfyUI 生成中" : mode === "panorama" ? `產生 2:1 環景草案（${PANORAMA_GENERATION_COST} 點）` : `產生空間創意彩現（${IMAGE_GENERATION_COST} 點）`}
                </Button>
                <StatusPill online={health?.comfyui === "online"} />
                {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="overflow-hidden border-stone-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">{mode === "panorama" ? <Orbit className="h-5 w-5 text-amber-600" /> : <ImagePlus className="h-5 w-5 text-amber-600" />}{mode === "panorama" ? "360° 環景預覽" : "單張空間創意彩現"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {mode === "panorama" ? (
                    panoramaImage ? <PanoramaViewer imageUrl={panoramaImage} title={`${space} ${style} 360° 環景`} /> : (
                      <div className="flex h-[clamp(320px,58vh,640px)] items-center justify-center rounded-md bg-stone-200 text-center text-stone-500">
                        {busy ? <div><Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin" /><p>正在建立 2:1 環景草案</p></div> : <div><Orbit className="mx-auto mb-3 h-10 w-10" /><p>設定單一空間後產生環景草案</p></div>}
                      </div>
                    )
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-stone-200">
                      {generatedImage ? <img src={generatedImage} alt={`${space} ${style} 空間創意彩現`} className="h-full w-full object-cover" /> : busy ? <div className="text-center text-stone-600"><Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin" /><p>正在生成空間創意彩現</p></div> : <div className="text-center text-stone-500"><ImagePlus className="mx-auto mb-3 h-10 w-10" /><p>設定條件後產生第一張創意彩現</p></div>}
                    </div>
                  )}

                  {mode === "panorama" && (
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800">
                      <FileImage className="h-4 w-4" />載入既有 2:1 環景圖測試播放器
                      <input type="file" accept="image/*" className="sr-only" onChange={fileHandler(setUploadedPanorama)} />
                    </label>
                  )}

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Button type="button" variant="outline" disabled={!downloadableImage || !entitlement?.download_unlocked} onClick={downloadResult}>
                      <Download className="mr-2 h-4 w-4" />{entitlement?.download_unlocked ? "下載檔案" : "付費後解鎖下載"}
                    </Button>
                    <Button type="button" disabled={task?.status !== "completed" || paymentBusy || entitlement?.download_unlocked} className="bg-stone-900 text-white hover:bg-stone-800" onClick={() => setPaymentInfoOpen((value) => !value)}>
                      {paymentBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : entitlement?.download_unlocked ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <CreditCard className="mr-2 h-4 w-4" />}
                      {entitlement?.download_unlocked ? "付款完成" : paymentBusy ? "確認付款狀態" : "付費下載說明"}
                    </Button>
                  </div>
                  {paymentInfoOpen && !entitlement?.download_unlocked && (
                    <div className="mt-3 border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-stone-700">
                      <p className="font-semibold text-stone-900">正式檔案下載規則</p>
                      <p className="mt-1 leading-6">畫面預覽免費；正式圖片檔須完成單次付款。付款由 Stripe Checkout 處理，後端確認成功後才會解鎖此任務的下載權限。</p>
                      <Button type="button" size="sm" className="mt-3 bg-amber-600 text-white hover:bg-amber-700" disabled={paymentBusy} onClick={openPayment}>
                        {paymentBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}前往安全付款
                      </Button>
                    </div>
                  )}
                  {task?.status === "completed" && !entitlement?.download_unlocked && (
                    <p className="mt-2 text-xs text-stone-500">預覽不受影響；下載檔案必須經付款服務確認後解鎖。</p>
                  )}
                  {task?.quality_report && (
                    <div className={`mt-3 border-l-4 p-4 text-sm ${task.quality_report.technical_status === "passed" ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"}`}>
                      <p className="font-semibold text-stone-900">圖片技術檢核：{task.quality_report.technical_status === "passed" ? "通過" : "未通過"}</p>
                      <p className="mt-1 leading-6 text-stone-600">尺寸／格式檢查完成；風格、格局、家具變形、動線與材質照明仍須人工逐項確認。</p>
                    </div>
                  )}
                  {task?.status === "completed" && selectedProject && (
                    <Button asChild type="button" className="mt-3 w-full bg-amber-500 text-white hover:bg-amber-600">
                      <Link to={`${createPageUrl("ReferenceCanvas")}?project=${selectedProject.project_id}`}><Layers3 className="mr-2 h-4 w-4" />進入提案圖確認</Link>
                    </Button>
                  )}

                  <div className="mt-4 grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
                    <p>任務：{task?.ai_task_id || "尚未建立"}</p>
                    <p>狀態：{task?.status || "待命"}</p>
                    <p>模型：{task?.checkpoint || health?.checkpoint || "待偵測"}</p>
                    <p>輸出：{mode === "panorama" ? "1536×768 2:1 預覽" : "1024×768 創意彩現"}</p>
                    <p>Seed：{task?.seed ?? "建立任務後產生"}</p>
                    <p>Workflow：{task?.workflow_version || health?.workflow_version || "待偵測"}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="border-l-2 border-amber-500 bg-white p-4"><Cuboid className="mb-2 h-5 w-5 text-amber-700" /><p className="font-medium text-stone-900">空間母模</p><p className="mt-1 text-xs leading-5 text-stone-600">尺寸與高度已納入任務；精準牆體與家具定位仍需 Blender 建模服務。</p></div>
                <div className="border-l-2 border-teal-600 bg-white p-4"><Eye className="mb-2 h-5 w-5 text-teal-700" /><p className="font-medium text-stone-900">一致性約束</p><p className="mt-1 text-xs leading-5 text-stone-600">同一空間共用設定；接縫、極點與跨視角一致性需專用 ComfyUI workflow。</p></div>
                <div className="border-l-2 border-stone-500 bg-white p-4"><AlertCircle className="mb-2 h-5 w-5 text-stone-700" /><p className="font-medium text-stone-900">治理邊界</p><p className="mt-1 text-xs leading-5 text-stone-600">成果僅供 StyleMatch 前期討論，不是施工圖、合約或 iSAFE 正式紀錄。</p></div>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
