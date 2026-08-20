import React, { useState } from "react";
import { Box, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { captureSketchUpScene, createSketchUpRenderRoundTrip, createSketchUpSession } from "@/lib/structuredSpaceApi";

export default function ExternalToolConnectorPanel({ projectId, structuredSpaceRef }) {
  const [externalProjectRef, setExternalProjectRef] = useState("sketchup-local-project");
  const [sceneRef, setSceneRef] = useState("Scene 1");
  const [viewportRef, setViewportRef] = useState("local://viewport/scene-1.png");
  const [connection, setConnection] = useState(null);
  const [scene, setScene] = useState(null);
  const [renderTask, setRenderTask] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const openSession = async () => {
    setBusy("session"); setMessage("");
    try { setConnection(await createSketchUpSession(projectId, { external_project_ref: externalProjectRef, metadata: { source: "local_workspace" } })); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const captureScene = async () => {
    setBusy("scene"); setMessage("");
    try {
      setScene(await captureSketchUpScene(connection.connection_id, { external_scene_ref: sceneRef, viewport_ref: viewportRef, camera: { position: [4, 3, 2.8], target: [0, 0, 1.2], fov: 60, eye_height: 1.6 }, structured_space_ref: structuredSpaceRef || null, material_refs: [] }));
    } catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };
  const roundTrip = async () => {
    setBusy("render"); setMessage("");
    try { setRenderTask(await createSketchUpRenderRoundTrip(connection.connection_id, scene.scene_id)); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(""); }
  };

  return (
    <div className="mt-5 border-t border-stone-200 pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-semibold"><Box className="h-4 w-4" />SketchUp 本機 Connector</h3><p className="mt-1 text-xs text-stone-600">SketchUp 2023 可從「Extensions → StyleMatch AI」送出 Scene，或在此建立同一份本機交換紀錄。</p></div><Badge variant="outline">EDT-01 · local native</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2"><Input value={externalProjectRef} onChange={(event) => setExternalProjectRef(event.target.value)} placeholder="外部專案識別" /><Button className="w-full" variant="outline" onClick={openSession} disabled={!projectId || !externalProjectRef.trim() || busy === "session"}>{busy === "session" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}建立本地 Session</Button>{connection && <p className="break-all text-xs text-emerald-700"><CheckCircle2 className="mr-1 inline h-3 w-3" />{connection.connection_id}</p>}</div>
        <div className="space-y-2"><Input value={sceneRef} onChange={(event) => setSceneRef(event.target.value)} placeholder="Scene 名稱" /><Input value={viewportRef} onChange={(event) => setViewportRef(event.target.value)} placeholder="Viewport 圖片引用" /><Button className="w-full" variant="outline" onClick={captureScene} disabled={!connection || !sceneRef.trim() || busy === "scene"}><Camera className="mr-2 h-4 w-4" />保存 Scene + Camera</Button>{scene && <p className="break-all text-xs text-emerald-700">{scene.scene_id} · {scene.checksum.slice(0, 12)}</p>}</div>
        <div className="space-y-2"><Button className="w-full" onClick={roundTrip} disabled={!scene || busy === "render"}>{busy === "render" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}建立 Render Round-trip</Button>{renderTask && <div className="border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"><p className="font-medium">{renderTask.status}</p><p className="mt-1 break-all">{renderTask.render_task_id}</p><p className="mt-1">治理狀態變更：否</p></div>}</div>
      </div>
      {message && <p className="mt-3 text-sm text-rose-700">{message}</p>}
    </div>
  );
}
