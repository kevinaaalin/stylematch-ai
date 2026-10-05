import React, { useState } from "react";
import { Save } from "lucide-react";
import { localStore } from "@/lib/localStore";

const spaceOptions = { living_room: '客廳', dining_room: '餐廳', bedroom1: '臥室一', bedroom2: '臥室二', bedroom3: '臥室三', bedroom4: '臥室四', kitchen: '廚房', bathroom1: '衛浴一', bathroom2: '衛浴二', balcony: '陽台' };

export default function ProposalContextEditor({ project, disabled }) {
  const [values, setValues] = useState(() => ({ project_name: project.project_name || project.name || "", square_footage: project.square_footage || "", room_layout: project.room_layout || "", budget_range: project.budget_range || "", primary_style: project.primary_style || project.preferred_style || "" }));
  const [message, setMessage] = useState("");
  const [spaceKeys, setSpaceKeys] = useState(() => Object.keys(project.proposal_media?.space_photos || {}).filter(key => key !== 'floor_plan'));
  return <details className="border-y border-stone-200 py-4"><summary className="cursor-pointer font-medium">提案基本資料</summary>
    <form className="mt-4 space-y-3" onSubmit={(event) => {
      event.preventDefault();
      try { localStore.saveProposalContext(project.project_id, { ...values, space_keys: spaceKeys }); setMessage("提案資料已儲存，既有提案快照未變更。"); }
      catch (error) { setMessage(error.message); }
    }}>
      <div className="grid gap-3 sm:grid-cols-2">{[["project_name", "專案名稱"], ["square_footage", "室內坪數"], ["room_layout", "空間配置"], ["budget_range", "預算範圍"], ["primary_style", "設計風格"]].map(([field, label]) => <label key={field} className="block text-sm">{label}<input className="mt-1 w-full rounded border p-2" required disabled={disabled} type={field === "square_footage" ? "number" : "text"} min="0.01" step="0.01" maxLength={500} value={values[field]} onChange={(event) => setValues({ ...values, [field]: event.target.value })} /></label>)}</div>
      <fieldset disabled={disabled} className="grid gap-2 sm:grid-cols-3"><legend className="mb-2 font-medium">提案空間（已選 {spaceKeys.length} 個）</legend>{[...new Set([...Object.keys(spaceOptions), ...spaceKeys])].map(key => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={spaceKeys.includes(key)} onChange={event => setSpaceKeys(event.target.checked ? [...spaceKeys, key] : spaceKeys.filter(item => item !== key))} />{spaceOptions[key] || key}</label>)}</fieldset>
      <button disabled={disabled} type="submit" className="inline-flex items-center gap-2 border px-3 py-2 text-sm"><Save className="h-4 w-4" />儲存提案資料</button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </form>
  </details>;
}
