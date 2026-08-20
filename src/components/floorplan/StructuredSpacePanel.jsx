import React, { useEffect, useState } from "react";
import { AlertTriangle, Armchair, CheckCircle2, Database, FileCheck2, History, Loader2, PackageCheck, Pencil, Plus, RefreshCw, ScanLine, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { approveAsset, approveAutoLayout, approveLocalArtifact, approveProposalSnapshot, approveStructuredSpace, buildGovernanceHandoffV2, correctStructuredSpace, createApprovedAsset, createCaseCreationProposal, createLocalArtifact, createProposalSnapshot, createStructuredSpace, decideCaseCreationProposal, executeCaseCreationProposal, generateAutoLayoutCandidates, listApprovedAssets, listAutoLayouts, listGovernanceHandoffsV2, listLocalArtifacts, listProposalSnapshots, listStructuredSpaces, parseFloorplan, receiveGovernanceHandoffV2, validateAutoLayout } from "@/lib/structuredSpaceApi";
import LayoutPlanCanvas from "@/components/floorplan/LayoutPlanCanvas";
import { createFurniturePlacement, FURNITURE_CATALOG } from "@/data/furnitureCatalog";
import ExternalToolConnectorPanel from "@/components/floorplan/ExternalToolConnectorPanel";
import ViewSetConsistencyPanel from "@/components/ai/ViewSetConsistencyPanel";
import MaterialProductPanel from "@/components/floorplan/MaterialProductPanel";
import StructuredSpaceEditor from "@/components/floorplan/StructuredSpaceEditor";

const ENTITY_OPTIONS = [
  { value: "rooms", label: "房間" },
  { value: "walls", label: "牆面" },
  { value: "openings", label: "門窗開口" },
  { value: "dimensions", label: "尺寸" },
];

export default function StructuredSpacePanel({ projectId, project, floorPlanUrl }) {
  const [roomName, setRoomName] = useState("客餐廳");
  const [confidence, setConfidence] = useState(70);
  const [roomPolygon, setRoomPolygon] = useState("0,0 5000,0 5000,4000 0,4000");
  const [openingClearance, setOpeningClearance] = useState(900);
  const [circulationWidth, setCirculationWidth] = useState(900);
  const [mmPerPixel, setMmPerPixel] = useState(10);
  const [snapshots, setSnapshots] = useState([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [entityType, setEntityType] = useState("rooms");
  const [entityId, setEntityId] = useState("");
  const [entityName, setEntityName] = useState("");
  const [entityValue, setEntityValue] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [layouts, setLayouts] = useState([]);
  const [placements, setPlacements] = useState([{ id: "sofa-1", room_id: "room-1", x: 1000, y: 1000, width: 1800, depth: 900, rotation: 0 }]);
  const [layoutSuggestions, setLayoutSuggestions] = useState([]);
  const [catalogItemId, setCatalogItemId] = useState(FURNITURE_CATALOG[0].id);
  const [handoffs, setHandoffs] = useState([]);
  const [handoffAssumption, setHandoffAssumption] = useState("");
  const [handoffRisk, setHandoffRisk] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantContact, setApplicantContact] = useState("");
  const [assets, setAssets] = useState([]);
  const [assetLabel, setAssetLabel] = useState("設計成果");
  const [assetRef, setAssetRef] = useState("");
  const [artifactKind, setArtifactKind] = useState("viewset");
  const [artifactLabel, setArtifactLabel] = useState("核准視圖集");
  const [artifactRef, setArtifactRef] = useState("");
  const [localArtifacts, setLocalArtifacts] = useState([]);
  const [proposalSnapshots, setProposalSnapshots] = useState([]);

  const refresh = async () => {
    if (!projectId) return setSnapshots([]);
    setBusy("load");
    try {
      const [spaceResult, layoutResult, handoffResult, assetResult, proposalResult, viewsetResult, materialResult, sceneResult] = await Promise.all([listStructuredSpaces(projectId), listAutoLayouts(projectId), listGovernanceHandoffsV2(projectId), listApprovedAssets(projectId), listProposalSnapshots(projectId), listLocalArtifacts(projectId, "viewset"), listLocalArtifacts(projectId, "material_selection"), listLocalArtifacts(projectId, "external_scene")]);
      setSnapshots(spaceResult.snapshots || []); setLayouts(layoutResult.layouts || []); setHandoffs(handoffResult.handoffs || []); setAssets(assetResult.assets || []); setProposalSnapshots(proposalResult.proposals || []); setLocalArtifacts([...(viewsetResult.artifacts || []), ...(materialResult.artifacts || []), ...(sceneResult.artifacts || [])]); setMessage("");
    }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  useEffect(() => { refresh(); }, [projectId]);

  const createSnapshot = async () => {
    setBusy("create");
    try {
      const polygon = roomPolygon.trim().split(/\s+/).map((pair) => pair.split(",").map(Number));
      if (polygon.length < 3 || polygon.some((point) => point.length !== 2 || point.some((value) => !Number.isFinite(value)))) throw new Error("多邊形至少需要三組有效的 x,y 座標。");
      await createStructuredSpace(projectId, {
        floorplan_version: floorPlanUrl || `local-floorplan-${Date.now()}`,
        confidence: Number(confidence) / 100,
        units: "mm",
        rooms: [{ id: "room-1", name: roomName, polygon, source: "human_seed", confidence: Number(confidence) / 100 }],
        walls: [], openings: [], dimensions: [], fixtures: [], furniture: [], zones: [],
        clearance_profiles: { opening_depth_mm: Number(openingClearance), circulation_width_mm: Number(circulationWidth) },
        circulation_graph: { nodes: [], edges: [] },
      });
      setMessage("已建立候選空間快照，尚未核准。新增校正時會建立新版本，不覆蓋舊資料。");
      await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const parseUploadedFloorplan = async () => {
    if (!floorPlanUrl || !projectId) return;
    setBusy("parse");
    try {
      const parsed = await parseFloorplan(projectId, {
        floorplan_ref: floorPlanUrl,
        hints: { primary_room_name: roomName || "待確認空間", units: "mm", mm_per_pixel: Number(mmPerPixel) || 10 },
      });
      setMessage(`本機解析已建立版本 ${parsed.revision}，辨識 ${parsed.structured_space.rooms.length} 個空間、${parsed.structured_space.walls.length} 條主要牆線、${parsed.structured_space.openings.length} 個開口候選，信心 ${Math.round(parsed.confidence * 100)}%；請人工校正後再核准。`);
      await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const approve = async (snapshot) => {
    setBusy(snapshot.snapshot_id);
    try { await approveStructuredSpace(snapshot.snapshot_id, snapshot.revision); setMessage(`版本 ${snapshot.revision} 已由人工核准。`); await refresh(); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const correct = async () => {
    if (!latest || !entityId.trim()) return;
    setBusy("correct");
    const numericValue = entityValue.trim() === "" ? null : Number(entityValue);
    try {
      await correctStructuredSpace(latest.snapshot_id, {
        expected_revision: latest.revision,
        entity_type: entityType,
        entity_id: entityId.trim(),
        operation: "upsert",
        value: {
          ...(entityName.trim() ? { name: entityName.trim() } : {}),
          ...(Number.isFinite(numericValue) ? { measured_value: numericValue } : {}),
          source: "human_correction",
        },
        reason: correctionReason.trim() || "人工校正",
      });
      setMessage(`已建立版本 ${latest.revision + 1}；原版本保持不變，新版本等待核准。`);
      setEntityId(""); setEntityName(""); setEntityValue(""); setCorrectionReason("");
      await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const commitVisualCorrection = async ({ entity_type, entity_id, value, reason }) => {
    if (!latest) return;
    setBusy("visual-correction");
    try {
      await correctStructuredSpace(latest.snapshot_id, { expected_revision: latest.revision, entity_type, entity_id, operation: "upsert", value, reason });
      setMessage(`視覺校正已建立版本 ${latest.revision + 1}；請確認後再核准。`);
      await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const layoutContext = () => ({
    requirements: project?.requirements || project?.form_data || {},
    style_dna: project?.analysis?.style || { primary_style: project?.primary_style, secondary_style: project?.secondary_style },
    family_profile: project?.family_profile || { household_size: project?.household_size, accessibility_required: Boolean(project?.accessibility_required) },
    budget: project?.analysis?.budget || { total: Number(project?.budget_total || 0), budget_range: project?.budget_range || "" },
    must_have: Array.isArray(project?.must_have) ? project.must_have : [],
    avoid: Array.isArray(project?.avoid) ? project.avoid : [],
  });

  const validateLayout = async () => {
    if (!latest) return;
    setBusy("layout");
    try {
      const result = await validateAutoLayout(projectId, {
        structured_space_ref: latest.snapshot_id,
        placements: placements.map((item) => ({ ...item, x: Number(item.x), y: Number(item.y), width: Number(item.width), depth: Number(item.depth), rotation: Number(item.rotation || 0) })),
        context: layoutContext(),
      });
      const hardCount = result.validation.hard_violations.length;
      setMessage(hardCount ? `配置未通過：發現 ${hardCount} 項硬性衝突。` : `配置通過幾何規則；${result.conceptual ? "來源空間尚未核准，目前仍是概念配置。" : "來源空間已核准。"}`);
      await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const suggestLayouts = async () => {
    if (!latest) return;
    setBusy("layout-suggest");
    try {
      const result = await generateAutoLayoutCandidates(projectId, {
        structured_space_ref: latest.snapshot_id,
        placements: placements.map((item) => ({ ...item, x: Number(item.x), y: Number(item.y), width: Number(item.width), depth: Number(item.depth), rotation: Number(item.rotation || 0) })),
        context: layoutContext(),
      });
      setLayoutSuggestions(result.candidates || []);
      setMessage(`已產生 ${result.candidates?.length || 0} 個確定性候選；選定後仍須重新驗證。`);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const applyLayoutSuggestion = (candidate) => {
    setPlacements(candidate.placements);
    setLayoutSuggestions((current) => current.map((item) => ({ ...item, selected: item.candidate_id === candidate.candidate_id })));
    setMessage(`已套用「${candidate.label}」，請按配置檢查建立可核准 revision。`);
  };

  const updatePlacement = (index, key, value) => setPlacements((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const addPlacement = () => setPlacements((current) => [...current, { id: `item-${current.length + 1}`, room_id: "room-1", x: 1000, y: 1000, width: 800, depth: 800, rotation: 0 }]);
  const addCatalogPlacement = () => setPlacements((current) => [...current, createFurniturePlacement(catalogItemId, current.length + 1, latest?.structured_space.rooms[0]?.id || "room-1")]);
  const movePlacement = (placementId, values) => setPlacements((current) => current.map((item) => item.id === placementId ? { ...item, ...values } : item));
  const removePlacement = (index) => setPlacements((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const approveLayout = async (layout) => {
    setBusy(`approve-${layout.layout_id}`);
    try { await approveAutoLayout(layout.layout_id, layout.revision); setMessage(`配置版本 ${layout.revision} 已核准。`); await refresh(); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const latest = snapshots[0];
  const approvedSpace = snapshots.find((snapshot) => snapshot.status === "approved");
  const approvedLayout = layouts.find((layout) => layout.status === "approved" && layout.structured_space_ref === approvedSpace?.snapshot_id);
  const approvedProposal = proposalSnapshots.find((proposalSnapshot) => proposalSnapshot.status === "approved" && proposalSnapshot.structured_space_ref === approvedSpace?.snapshot_id && proposalSnapshot.approved_layout_ref === approvedLayout?.layout_id);
  const createDesignProposal = async () => {
    if (!approvedSpace || !approvedLayout) return;
    setBusy("proposal-snapshot");
    try {
      await createProposalSnapshot(projectId, {
        structured_space_ref: approvedSpace.snapshot_id,
        approved_layout_ref: approvedLayout.layout_id,
        requirements: project?.requirements || project?.form_data || { project_name: project?.project_name || project?.name || projectId, special_requirements: project?.special_requirements || "" },
        style_dna: project?.analysis?.style || { primary_style: project?.primary_style || "待確認", secondary_style: project?.secondary_style || "" },
        budget: project?.analysis?.budget || { budget_range: project?.budget_range || "待確認", currency: "TWD" },
        confirmed_reference_set: assets.filter((asset) => asset.status === "approved").map((asset) => ({ id: asset.asset_id, revision: asset.revision, checksum: asset.checksum })),
        assumptions: handoffAssumption.trim() ? [handoffAssumption.trim()] : [],
        unresolved_risks: handoffRisk.trim() ? [handoffRisk.trim()] : [],
      });
      setMessage("已封存 AI 設計提案候選版本；核准後才能建立 Handoff V2。");
      await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const approveDesignProposal = async (proposalSnapshot) => {
    setBusy(`proposal-${proposalSnapshot.proposal_snapshot_id}`);
    try { await approveProposalSnapshot(proposalSnapshot.proposal_snapshot_id, proposalSnapshot.revision); setMessage(`AI 設計提案版本 ${proposalSnapshot.revision} 已核准並鎖定。`); await refresh(); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const buildHandoff = async () => {
    if (!approvedSpace || !approvedLayout || !approvedProposal) return;
    setBusy("handoff-v2");
    try {
      const result = await buildGovernanceHandoffV2(projectId, {
        structured_space_ref: approvedSpace.snapshot_id,
        approved_layout_ref: approvedLayout.layout_id,
        approved_proposal_ref: approvedProposal.proposal_snapshot_id,
        structured_space_checksum: approvedSpace.checksum,
        layout_checksum: approvedLayout.checksum,
        assumptions: handoffAssumption.trim() ? [handoffAssumption.trim()] : [],
        unresolved_risks: handoffRisk.trim() ? [handoffRisk.trim()] : [],
      });
      setMessage(`Handoff V2 ${result.handoff_id} 已準備完成；尚未進入 iSAFE Gate。`);
      setHandoffAssumption(""); setHandoffRisk(""); await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const receiveHandoff = async (handoff) => {
    setBusy(`receive-${handoff.handoff_id}`);
    try {
      const result = await receiveGovernanceHandoffV2(handoff.handoff_id, handoff.manifest_checksum);
      setMessage(`iSAFE 已收件，Receipt ${result.receipt.receipt_id}；尚未建立案件或 Gate decision。`);
      await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const proposeCaseCreation = async (handoff) => {
    setBusy(`propose-${handoff.handoff_id}`);
    try {
      const proposal = await createCaseCreationProposal(handoff.handoff_id, { title: `iSAFE intake for ${projectId}`, applicant_name: applicantName, contact: applicantContact });
      setMessage(`案件建立提案 ${proposal.proposal_id} 已送交人工審查；尚未建立案件。`); await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const decideProposal = async (proposal, decision) => {
    setBusy(`decision-${proposal.proposal_id}`);
    try {
      await decideCaseCreationProposal(proposal.proposal_id, { expected_version: proposal.version, decision, rationale: decision === "approved_for_case_creation" ? "已核對交接資產與未解風險，同意進入獨立案件建立步驟" : "退回補正交接內容" });
      setMessage(decision === "approved_for_case_creation" ? "提案已核准，但案件仍未建立。" : "提案已退回。"); await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const executeProposal = async (proposal) => {
    setBusy(`execute-${proposal.proposal_id}`);
    try {
      const result = await executeCaseCreationProposal(proposal.proposal_id, proposal.version);
      setMessage(`iSAFE 案件 ${result.case.isafe_case_id} 已建立於 INTAKE_pending；治理尚未開始。`); await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const registerAsset = async () => {
    setBusy("asset-create");
    try { await createApprovedAsset(projectId, { asset_type: "image", label: assetLabel, local_ref: assetRef, metadata: { source: "local_reference" } }); setAssetRef(""); setMessage("本地資產已建立為候選版本。"); await refresh(); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const approveRegisteredAsset = async (asset) => {
    setBusy(`asset-${asset.asset_id}`);
    try { await approveAsset(asset.asset_id, asset.revision); setMessage(`資產版本 ${asset.revision} 已核准，可納入下一份 Handoff V2。`); await refresh(); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const registerLocalArtifact = async () => {
    setBusy("artifact-create");
    try { await createLocalArtifact(projectId, artifactKind, { label: artifactLabel, local_ref: artifactRef, metadata: { source: "local_registry" } }); setArtifactRef(""); setMessage("已建立本地候選資料，人工核准後才會加入 Handoff V2。"); await refresh(); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  const approveRegisteredArtifact = async (artifact) => {
    setBusy(`artifact-${artifact.artifact_id}`);
    try { await approveLocalArtifact(artifact.artifact_id, artifact.revision); setMessage("本地資料版本已核准，後續交接將自動引用此版本。"); await refresh(); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  return (
    <section className="border-y border-stone-200 bg-stone-50 py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="flex items-center gap-2 text-lg font-semibold"><Database className="h-5 w-5" />空間資料快照</h2><p className="mt-1 text-sm text-stone-600">將平面圖轉成可版本管理的房間、牆面、開口與動線資料。</p></div>
        <div className="flex items-center gap-2"><Badge variant="outline">SS-01 Candidate</Badge><Button size="icon" variant="ghost" title="重新整理" onClick={refresh} disabled={!projectId || busy === "load"}>{busy === "load" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</Button></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3"><label className="block text-sm font-medium">主要空間名稱<Input className="mt-1" value={roomName} onChange={(event) => setRoomName(event.target.value)} /></label><label className="block text-sm font-medium">房間多邊形座標<textarea className="mt-1 min-h-20 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm" value={roomPolygon} onChange={(event) => setRoomPolygon(event.target.value)} /></label><div className="grid grid-cols-3 gap-2"><label className="text-xs font-medium">估計 mm／pixel<Input className="mt-1" type="number" min="0.1" step="0.1" value={mmPerPixel} onChange={(event) => setMmPerPixel(event.target.value)} /></label><label className="text-xs font-medium">開口淨空 mm<Input className="mt-1" type="number" min="1" value={openingClearance} onChange={(event) => setOpeningClearance(event.target.value)} /></label><label className="text-xs font-medium">動線寬度 mm<Input className="mt-1" type="number" min="1" value={circulationWidth} onChange={(event) => setCirculationWidth(event.target.value)} /></label></div><label className="block text-sm font-medium">人工輸入信心 {confidence}%<input className="mt-2 w-full accent-emerald-600" type="range" min="0" max="100" value={confidence} onChange={(event) => setConfidence(event.target.value)} /></label><div className="flex flex-wrap gap-2"><Button onClick={parseUploadedFloorplan} disabled={!projectId || !floorPlanUrl || busy === "parse"}>{busy === "parse" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}解析已上傳平面圖</Button><Button variant="outline" onClick={createSnapshot} disabled={!projectId || !roomName.trim() || busy === "create"}>{busy === "create" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}人工建立</Button></div><p className="flex gap-2 text-xs leading-5 text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />本機影像解析信心最高 72%；開口只辨識為候選，門窗分類與推定尺寸仍須人工確認，不會自動核准或改變 iSAFE 狀態。</p></div>
        <Card className="rounded-md"><CardHeader><CardTitle className="text-base">最新版本</CardTitle></CardHeader><CardContent>{latest ? <div className="space-y-2 text-sm"><div className="flex items-center justify-between"><span>版本 {latest.revision}</span><Badge className={latest.status === "approved" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>{latest.status === "approved" ? "已核准" : "候選"}</Badge></div><p>空間 {latest.structured_space.rooms.length} · 牆線 {latest.structured_space.walls.length} · 開口候選 {latest.structured_space.openings.length} · 尺寸 {latest.structured_space.dimensions.length} · 信心 {Math.round((latest.confidence || 0) * 100)}%</p><p>來源：{latest.parser?.mode === "local_vision" ? "本機圖面幾何解析" : latest.parser?.mode === "offline_fallback" ? "離線低信心 fallback" : latest.parser?.adapter === "human_correction" ? "人工校正" : "人工輸入"}</p><p className="text-xs text-stone-600">座標：{latest.structured_space.coordinate_system}　來源資產：{latest.structured_space.source_assets?.length || 0}</p>{latest.structured_space.openings.slice(0, 3).map((opening) => <p key={opening.id} className="text-xs text-stone-600">{opening.id}：未分類開口，推定寬 {opening.width_mm} mm</p>)}{latest.structured_space.dimensions.slice(0, 4).map((dimension) => <p key={dimension.id} className="text-xs text-stone-600">{dimension.kind === "inferred_width" ? "推定寬度" : "推定深度"}：{dimension.measured_value} mm</p>)}{latest.parser?.warnings?.map((warning) => <p key={warning} className="text-xs text-amber-800">{warning}</p>)}{latest.requires_confirmation && <p className="font-medium text-amber-800">需要人工確認</p>}<p className="break-all text-xs text-stone-500">Checksum: {latest.checksum}</p>{latest.status !== "approved" && <Button variant="outline" onClick={() => approve(latest)} disabled={busy === latest.snapshot_id}>{busy === latest.snapshot_id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}人工核准此版本</Button>}</div> : <p className="text-sm text-stone-500">尚無空間快照。</p>}</CardContent></Card>
      </div>
      {latest && latest.structured_space.rooms.some((room) => Array.isArray(room.polygon) && room.polygon.length >= 3) && <div className="mt-5 border-t border-stone-200 pt-5"><div className="mb-3"><h3 className="flex items-center gap-2 text-sm font-semibold"><Pencil className="h-4 w-4" />視覺邊界校正</h3><p className="mt-1 text-xs text-stone-600">拖曳控制點修正房間多邊形；每次放開都建立新的候選 revision，不覆蓋原解析資料。</p></div><StructuredSpaceEditor snapshot={latest} floorPlanUrl={floorPlanUrl} onCommit={commitVisualCorrection} disabled={busy === "visual-correction"} /></div>}
      {latest && <div className="mt-5 grid gap-4 border-t border-stone-200 pt-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3"><h3 className="flex items-center gap-2 text-sm font-semibold"><Pencil className="h-4 w-4" />建立校正版</h3><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">實體類型<select className="mt-1 h-10 w-full rounded-md border border-stone-300 bg-white px-3" value={entityType} onChange={(event) => setEntityType(event.target.value)}>{ENTITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="text-sm font-medium">實體 ID<Input className="mt-1" placeholder="例如 room-living" value={entityId} onChange={(event) => setEntityId(event.target.value)} /></label><label className="text-sm font-medium">名稱<Input className="mt-1" placeholder="例如 客餐廳" value={entityName} onChange={(event) => setEntityName(event.target.value)} /></label><label className="text-sm font-medium">量測值<Input className="mt-1" type="number" placeholder="選填" value={entityValue} onChange={(event) => setEntityValue(event.target.value)} /></label></div><label className="block text-sm font-medium">校正理由<Input className="mt-1" placeholder="例如 已核對圖面尺寸標註" value={correctionReason} onChange={(event) => setCorrectionReason(event.target.value)} /></label><Button variant="outline" onClick={correct} disabled={!entityId.trim() || busy === "correct"}>{busy === "correct" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}儲存為新版本</Button></div>
        <div><h3 className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4" />修訂歷程</h3><div className="mt-3 divide-y divide-stone-200 border-y border-stone-200">{snapshots.slice(0, 5).map((snapshot) => <div key={snapshot.snapshot_id} className="flex items-center justify-between gap-3 py-2 text-sm"><span>版本 {snapshot.revision} · {snapshot.structured_space.rooms.length} 個空間</span><span className="text-stone-500">{snapshot.status === "approved" ? "已核准" : snapshot.status === "superseded" ? "已取代" : "候選"}</span></div>)}</div></div>
      </div>}
      {latest && <div className="mt-5 border-t border-stone-200 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-sm font-semibold">Auto Layout 候選比較</h3><p className="mt-1 text-xs text-stone-600">候選只供比較；套用後仍須通過幾何規則才能建立可核准版本。</p></div>
          <Button size="sm" variant="outline" onClick={suggestLayouts} disabled={busy === "layout-suggest" || !placements.length}>{busy === "layout-suggest" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}產生 3 個候選</Button>
        </div>
        {layoutSuggestions.length > 0 && <div className="mt-3 grid gap-3 md:grid-cols-3">{layoutSuggestions.map((candidate) => <div key={candidate.candidate_id} className={`border p-3 text-sm ${candidate.selected ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white"}`}><div className="flex items-center justify-between gap-2"><strong>#{candidate.rank} {candidate.label}</strong><Badge className={candidate.validation.valid ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>{candidate.score} 分</Badge></div><p className="mt-2 text-xs leading-5 text-stone-600">{candidate.rationale}</p><p className="mt-2 text-xs text-stone-600">功能 {candidate.score_components?.functional ?? candidate.validation.score} · 風格 {candidate.score_components?.style ?? 0} · 預算 {candidate.score_components?.budget ?? 0} · 家庭 {candidate.score_components?.household ?? 0}</p><p className="mt-1 text-xs text-stone-500">硬性衝突 {candidate.validation.hard_violations.length} · 缺少必需項 {candidate.preference?.missing_must_have?.length || 0} · 禁用項 {candidate.preference?.present_avoid?.length || 0}</p><Button className="mt-3 w-full" size="sm" variant={candidate.selected ? "default" : "outline"} onClick={() => applyLayoutSuggestion(candidate)}>{candidate.selected ? "已套用" : "套用候選"}</Button></div>)}</div>}
      </div>}
      {latest && <div className="mt-5 grid gap-4 border-t border-stone-200 pt-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div><h3 className="text-sm font-semibold">家具尺度目錄</h3><p className="mt-1 text-xs leading-5 text-stone-600">採用本地 canonical envelope；拖曳只改位置，不會改家具實際尺度。</p></div>
          <select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={catalogItemId} onChange={(event) => setCatalogItemId(event.target.value)}>{FURNITURE_CATALOG.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.width} × {item.depth} mm</option>)}</select>
          <Button className="w-full" variant="outline" onClick={addCatalogPlacement}><Plus className="mr-2 h-4 w-4" />加入配置</Button>
          <p className="text-xs text-stone-500">目前 {placements.length} 件家具。拖曳後請執行下方配置檢查。</p>
        </div>
        <LayoutPlanCanvas rooms={latest.structured_space.rooms} placements={placements} onPlacementChange={movePlacement} />
      </div>}
      {latest && <div className="mt-5 border-t border-stone-200 pt-5"><div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><Armchair className="h-4 w-4" />Layout Studio · 確定性驗證</h3><Badge variant="outline">AL-01 Candidate</Badge></div><div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><div className="space-y-3"><div className="flex justify-end"><Button size="sm" variant="outline" onClick={addPlacement}><Plus className="mr-2 h-4 w-4" />新增家具</Button></div>{placements.map((item, index) => <div key={`${index}-${item.id}`} className="grid gap-2 border-t border-stone-200 pt-3 sm:grid-cols-4"><label className="text-xs font-medium">家具 ID<Input className="mt-1" value={item.id} onChange={(event) => updatePlacement(index, "id", event.target.value)} /></label><label className="text-xs font-medium">房間 ID<Input className="mt-1" value={item.room_id} onChange={(event) => updatePlacement(index, "room_id", event.target.value)} /></label><label className="text-xs font-medium">X<Input className="mt-1" type="number" value={item.x} onChange={(event) => updatePlacement(index, "x", event.target.value)} /></label><label className="text-xs font-medium">Y<Input className="mt-1" type="number" value={item.y} onChange={(event) => updatePlacement(index, "y", event.target.value)} /></label><label className="text-xs font-medium">寬 mm<Input className="mt-1" type="number" value={item.width} onChange={(event) => updatePlacement(index, "width", event.target.value)} /></label><label className="text-xs font-medium">深 mm<Input className="mt-1" type="number" value={item.depth} onChange={(event) => updatePlacement(index, "depth", event.target.value)} /></label><label className="text-xs font-medium">旋轉角度<Input className="mt-1" type="number" value={item.rotation} onChange={(event) => updatePlacement(index, "rotation", event.target.value)} /></label><div className="flex items-end"><Button size="icon" variant="ghost" title="移除家具" onClick={() => removePlacement(index)} disabled={placements.length === 1}><Trash2 className="h-4 w-4" /></Button></div></div>)}<Button className="w-full" onClick={validateLayout} disabled={busy === "layout"}>{busy === "layout" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}檢查 {placements.length} 件家具</Button></div><div className="border-y border-stone-200">{layouts.length ? layouts.slice(0, 4).map((layout) => { const newestRevision = Math.max(...layouts.map((item) => item.revision)); return <div key={layout.layout_id} className="border-b border-stone-200 py-3 text-sm last:border-b-0"><div className="flex items-center justify-between"><span>配置版本 {layout.revision} · {layout.score} 分</span><Badge className={layout.status === "approved" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : layout.validation.valid ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>{layout.status === "approved" ? "已核准" : layout.validation.valid ? "通過" : "有衝突"}</Badge></div><p className="mt-1 text-stone-600">家具 {layout.placements.length} · 硬性衝突 {layout.validation.hard_violations.length} · 警告 {layout.validation.warnings.length}{layout.conceptual ? " · 概念配置" : ""}</p>{layout.validation.hard_violations.slice(0, 2).map((violation, violationIndex) => <p key={`${layout.layout_id}-${violationIndex}`} className="mt-1 text-xs text-red-700">{violation.code}</p>)}{layout.status === "valid" && !layout.conceptual && layout.revision === newestRevision && <Button className="mt-2" size="sm" variant="outline" onClick={() => approveLayout(layout)} disabled={busy === `approve-${layout.layout_id}`}><CheckCircle2 className="mr-2 h-4 w-4" />核准此配置</Button>}</div>; }) : <p className="py-4 text-sm text-stone-500">尚無配置檢查紀錄。</p>}</div></div></div>}
      <ExternalToolConnectorPanel projectId={projectId} structuredSpaceRef={approvedSpace?.snapshot_id || latest?.snapshot_id} />
      <ViewSetConsistencyPanel projectId={projectId} structuredSpaceRef={approvedSpace?.snapshot_id || latest?.snapshot_id} />
      <MaterialProductPanel projectId={projectId} />
      <div className="mt-5 border-t border-stone-200 pt-5">
        <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><FileCheck2 className="h-4 w-4" />Approved Asset Registry</h3><Badge variant="outline">Local only</Badge></div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]"><div className="space-y-2"><Input placeholder="資產名稱" value={assetLabel} onChange={(event) => setAssetLabel(event.target.value)} /><Input placeholder="本機或站內路徑，例如 /uploads/design-v1.png" value={assetRef} onChange={(event) => setAssetRef(event.target.value)} /><Button variant="outline" onClick={registerAsset} disabled={!projectId || !assetRef.trim() || busy === "asset-create"}>建立候選資產</Button></div><div className="border-y border-stone-200">{assets.length ? assets.slice(0, 4).map((asset) => <div key={asset.asset_id} className="flex items-center justify-between gap-3 border-b border-stone-200 py-2 text-sm last:border-b-0"><div className="min-w-0"><p className="truncate font-medium">{asset.label} · v{asset.revision}</p><p className="truncate text-xs text-stone-500">{asset.local_ref}</p></div>{asset.status === "candidate" ? <Button size="sm" variant="outline" onClick={() => approveRegisteredAsset(asset)}>核准</Button> : <Badge className={asset.status === "approved" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-stone-200 text-stone-700 hover:bg-stone-200"}>{asset.status === "approved" ? "已核准" : "已取代"}</Badge>}</div>) : <p className="py-4 text-sm text-stone-500">尚無本地資產。</p>}</div></div>
      </div>
      <div className="mt-5 border-t border-stone-200 pt-5">
        <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><FileCheck2 className="h-4 w-4" />交接資料 Registry</h3><Badge variant="outline">Offline-first</Badge></div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-2"><select className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm" value={artifactKind} onChange={(event) => setArtifactKind(event.target.value)}><option value="viewset">核准視圖集</option><option value="material_selection">材料選擇表</option><option value="external_scene">外部場景引用</option></select><Input placeholder="資料名稱" value={artifactLabel} onChange={(event) => setArtifactLabel(event.target.value)} /><Input placeholder="本機或站內路徑" value={artifactRef} onChange={(event) => setArtifactRef(event.target.value)} /><Button variant="outline" onClick={registerLocalArtifact} disabled={!projectId || !artifactRef.trim() || busy === "artifact-create"}>建立候選資料</Button><p className="text-xs text-stone-600">外部場景只保存本地引用，不會啟動或連線外部軟體。</p></div>
          <div className="border-y border-stone-200">{localArtifacts.length ? localArtifacts.slice(0, 6).map((artifact) => <div key={artifact.artifact_id} className="flex items-center justify-between gap-3 border-b border-stone-200 py-2 text-sm last:border-b-0"><div className="min-w-0"><p className="truncate font-medium">{artifact.label} · v{artifact.revision}</p><p className="truncate text-xs text-stone-500">{artifact.artifact_kind} · {artifact.local_ref}</p></div>{artifact.status === "candidate" ? <Button size="sm" variant="outline" onClick={() => approveRegisteredArtifact(artifact)} disabled={busy === `artifact-${artifact.artifact_id}`}>核准</Button> : <Badge className={artifact.status === "approved" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-stone-200 text-stone-700 hover:bg-stone-200"}>{artifact.status === "approved" ? "已核准" : "已取代"}</Badge>}</div>) : <p className="py-4 text-sm text-stone-500">尚無交接資料。</p>}</div>
        </div>
      </div>
      <div className="mt-5 border-t border-stone-200 pt-5">
        <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><FileCheck2 className="h-4 w-4" />AI 設計提案版本</h3><Badge variant="outline">Immutable snapshot</Badge></div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div><p className="text-sm leading-6 text-stone-600">封存案件需求、Style DNA、預算、參考資產，以及已核准的空間與配置。建立新版本不會覆蓋舊版本。</p><Button className="mt-3" variant="outline" onClick={createDesignProposal} disabled={!approvedSpace || !approvedLayout || busy === "proposal-snapshot"}>{busy === "proposal-snapshot" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}建立提案候選版本</Button>{(!approvedSpace || !approvedLayout) && <p className="mt-2 text-xs text-amber-800">需要先核准 StructuredSpace 與同來源 Layout。</p>}</div>
          <div className="border-y border-stone-200">{proposalSnapshots.length ? proposalSnapshots.slice(0, 4).map((proposalSnapshot) => <div key={proposalSnapshot.proposal_snapshot_id} className="flex items-center justify-between gap-3 border-b border-stone-200 py-3 text-sm last:border-b-0"><div className="min-w-0"><p className="font-medium">提案版本 {proposalSnapshot.revision}</p><p className="truncate text-xs text-stone-500">{proposalSnapshot.checksum}</p></div>{proposalSnapshot.status === "candidate" ? <Button size="sm" onClick={() => approveDesignProposal(proposalSnapshot)} disabled={busy === `proposal-${proposalSnapshot.proposal_snapshot_id}`}>核准並鎖定</Button> : <Badge className={proposalSnapshot.status === "approved" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-stone-200 text-stone-700 hover:bg-stone-200"}>{proposalSnapshot.status === "approved" ? "已核准" : "已取代"}</Badge>}</div>) : <p className="py-4 text-sm text-stone-500">尚無正式提案版本。</p>}</div>
        </div>
      </div>
      <div className="mt-5 border-t border-stone-200 pt-5">
        <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><PackageCheck className="h-4 w-4" />Governance Handoff V2</h3><Badge variant="outline">Intake boundary</Badge></div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3"><label className="block text-sm font-medium">交接假設<Input className="mt-1" placeholder="例如 家具採購不在本次範圍" value={handoffAssumption} onChange={(event) => setHandoffAssumption(event.target.value)} /></label><label className="block text-sm font-medium">未解風險<Input className="mt-1" placeholder="例如 現場尺寸仍需複量" value={handoffRisk} onChange={(event) => setHandoffRisk(event.target.value)} /></label><Button onClick={buildHandoff} disabled={!approvedSpace || !approvedLayout || !approvedProposal || busy === "handoff-v2"}>{busy === "handoff-v2" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}建立不可變交接清單</Button>{(!approvedSpace || !approvedLayout || !approvedProposal) && <p className="text-xs text-amber-800">需要核准 StructuredSpace、同來源 Layout 與 AI 設計提案版本。</p>}<div className="border-t border-stone-200 pt-3"><p className="mb-2 text-sm font-medium">案件建立提案資料</p><div className="grid gap-2 sm:grid-cols-2"><Input placeholder="申請人" value={applicantName} onChange={(event) => setApplicantName(event.target.value)} /><Input placeholder="聯絡方式" value={applicantContact} onChange={(event) => setApplicantContact(event.target.value)} /></div></div><p className="text-xs text-stone-600">收件與提案核准都不會建立案件或推進 R5.2 Gate。</p></div>
          <div className="border-y border-stone-200">{handoffs.length ? handoffs.slice(0, 3).map((handoff) => {
            const proposal = handoff.case_creation_proposal;
            return <div key={handoff.handoff_id} className="border-b border-stone-200 py-3 text-sm last:border-b-0">
              <div className="flex items-center justify-between gap-2"><span className="truncate font-medium">{handoff.handoff_id}</span><Badge className={handoff.status === "intake_received" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-blue-100 text-blue-800 hover:bg-blue-100"}>{handoff.status === "intake_received" ? "iSAFE 已收件" : "待 iSAFE 收件"}</Badge></div>
              <p className="mt-1 break-all text-xs text-stone-500">{handoff.manifest_checksum}</p><p className="mt-1 text-xs text-stone-600">假設 {handoff.assumptions.length} · 未解風險 {handoff.unresolved_risks.length}</p>
              {handoff.status === "ready_for_intake" && <Button className="mt-2" size="sm" variant="outline" onClick={() => receiveHandoff(handoff)} disabled={busy === `receive-${handoff.handoff_id}`}><PackageCheck className="mr-2 h-4 w-4" />送交 iSAFE 收件</Button>}
              {handoff.receipt && <div className="mt-2 border-l-2 border-emerald-500 pl-2 text-xs text-stone-600"><p>Receipt: {handoff.receipt.receipt_id}</p><p className="break-all">{handoff.receipt.receipt_checksum}</p><p>{proposal?.status === "executed" ? "案件已建立 · Gate 未決定" : "案件未建立 · Gate 未決定"}</p></div>}
              {handoff.receipt && !proposal && <Button className="mt-2" size="sm" variant="outline" onClick={() => proposeCaseCreation(handoff)} disabled={!applicantName.trim() || !applicantContact.trim() || busy === `propose-${handoff.handoff_id}`}>建立案件建立提案</Button>}
              {proposal && <div className="mt-2 border-l-2 border-amber-500 pl-2 text-xs"><p>Proposal: {proposal.proposal_id}</p><p>狀態：{proposal.status}</p><p className="font-medium">{proposal.status === "executed" ? `案件 ${proposal.execution?.isafe_case_id} 已建立於 INTAKE_pending` : "案件仍未建立"}</p>{proposal.status === "executed" && proposal.execution?.workspace_url && <a className="mt-2 inline-flex h-8 items-center border border-stone-300 bg-white px-3 font-medium text-stone-800 hover:bg-stone-50" href={proposal.execution.workspace_url}>開啟 iSAFE 案件工作區</a>}{proposal.status === "pending_review" && <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => decideProposal(proposal, "approved_for_case_creation")}>核准提案</Button><Button size="sm" variant="outline" onClick={() => decideProposal(proposal, "rejected")}>退回</Button></div>}{proposal.status === "approved_for_case_creation" && <Button className="mt-2" size="sm" onClick={() => executeProposal(proposal)} disabled={busy === `execute-${proposal.proposal_id}`}>明確建立 iSAFE 案件</Button>}</div>}
            </div>;
          }) : <p className="py-4 text-sm text-stone-500">尚無 Handoff V2。</p>}</div>
        </div>
      </div>
      {message && <p className="mt-3 text-sm text-stone-700">{message}</p>}
    </section>
  );
}
