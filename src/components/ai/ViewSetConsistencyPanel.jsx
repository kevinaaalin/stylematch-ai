import React, { useState } from "react";
import { CheckCircle2, Images, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveLocalArtifact, createLocalArtifact, validateViewSet } from "@/lib/structuredSpaceApi";

const directions = ["north", "east", "south", "west"];
export default function ViewSetConsistencyPanel({ projectId, structuredSpaceRef }) {
  const [objectIds, setObjectIds] = useState("sofa,tv-console");
  const [materialIds, setMaterialIds] = useState("oak,white-wall");
  const [driftView, setDriftView] = useState("");
  const [report, setReport] = useState(null);
  const [artifact, setArtifact] = useState(null);
  const [busy, setBusy] = useState("");
  const ids = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);
  const run = async () => {
    setBusy("validate");
    try {
      const objects = ids(objectIds); const materials = ids(materialIds);
      const result = await validateViewSet({ anchor_state: { object_ids: objects, material_ids: materials, structured_space_ref: structuredSpaceRef }, views: directions.map((viewId) => ({ view_id: viewId, object_ids: viewId === driftView ? objects.slice(1) : objects, material_ids: materials, structured_space_ref: structuredSpaceRef, camera_ref: { fov: 60 } })) });
      setReport(result); setArtifact(null);
    } finally { setBusy(""); }
  };
  const save = async () => {
    setBusy("save");
    try { setArtifact(await createLocalArtifact(projectId, "viewset", { logical_artifact_id: "primary-viewset", label: "四方向一致性視圖集", local_ref: `local://viewsets/${projectId}/primary.json`, metadata: { anchor_state: { object_ids: ids(objectIds), material_ids: ids(materialIds), structured_space_ref: structuredSpaceRef }, consistency_report: report } })); }
    finally { setBusy(""); }
  };
  const approve = async () => { setBusy("approve"); try { setArtifact(await approveLocalArtifact(artifact.artifact_id, artifact.revision)); } finally { setBusy(""); } };
  return <div className="mt-5 border-t border-stone-200 pt-5"><div className="mb-3 flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-sm font-semibold"><Images className="h-4 w-4" />四方向／360 一致性</h3><p className="mt-1 text-xs text-stone-600">Anchor State、逐視角檢查與局部重試清單。</p></div><Badge variant="outline">MVC-01</Badge></div><div className="grid gap-3 lg:grid-cols-3"><Input value={objectIds} onChange={(e) => setObjectIds(e.target.value)} placeholder="家具 identity，以逗號分隔" /><Input value={materialIds} onChange={(e) => setMaterialIds(e.target.value)} placeholder="材質 identity，以逗號分隔" /><select className="h-10 border border-stone-300 bg-white px-3 text-sm" value={driftView} onChange={(e) => setDriftView(e.target.value)}><option value="">無模擬漂移</option>{directions.map((item) => <option key={item} value={item}>{item} 模擬漂移</option>)}</select></div><Button className="mt-3" variant="outline" onClick={run} disabled={!structuredSpaceRef || busy === "validate"}>{busy === "validate" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}執行一致性檢查</Button>{report && <div className="mt-3 border border-stone-200 bg-white p-3 text-sm"><div className="flex items-center justify-between"><strong>一致性 {report.consistency_score} 分</strong><Badge className={report.valid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>{report.valid ? "通過" : "需局部重試"}</Badge></div><p className="mt-2 text-xs text-stone-600">重試視角：{report.regeneration_refs.join(", ") || "無"}</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={save} disabled={!report.valid || busy === "save"}>建立候選 ViewSet</Button>{report.regeneration_refs.length > 0 && <Button size="sm" variant="outline" onClick={() => setDriftView("")}><RefreshCw className="mr-2 h-4 w-4" />只重試失敗視角</Button>}{artifact?.status === "candidate" && <Button size="sm" variant="outline" onClick={approve}>人工核准</Button>}</div>{artifact && <p className="mt-2 text-xs text-emerald-700">ViewSet v{artifact.revision} · {artifact.status}</p>}</div>}</div>;
}
