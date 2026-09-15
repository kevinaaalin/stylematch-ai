import React, { useState } from "react";
import { Save } from "lucide-react";
import { localStore } from "@/lib/localStore";

export default function ProposalContextEditor({ project, disabled }) {
  const [values, setValues] = useState(() => ({ square_footage: project.square_footage || "", room_layout: project.room_layout || "", budget_range: project.budget_range || "", primary_style: project.primary_style || project.preferred_style || "" }));
  const [message, setMessage] = useState("");
  return <details className="border-y border-stone-200 py-4"><summary className="cursor-pointer font-medium">提案基本資料</summary>
    <form className="mt-4 space-y-3" onSubmit={(event) => {
      event.preventDefault();
      try { localStore.saveProposalContext(project.project_id, values); setMessage("提案資料已儲存，既有提案快照未變更。"); }
      catch (error) { setMessage(error.message); }
    }}>
      <div className="grid gap-3 sm:grid-cols-2">{[["square_footage", "室內坪數"], ["room_layout", "空間配置"], ["budget_range", "預算範圍"], ["primary_style", "設計風格"]].map(([field, label]) => <label key={field} className="block text-sm">{label}<input className="mt-1 w-full rounded border p-2" required disabled={disabled} type={field === "square_footage" ? "number" : "text"} min="0.01" step="0.01" maxLength={500} value={values[field]} onChange={(event) => setValues({ ...values, [field]: event.target.value })} /></label>)}</div>
      <button disabled={disabled} type="submit" className="inline-flex items-center gap-2 border px-3 py-2 text-sm"><Save className="h-4 w-4" />儲存提案資料</button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </form>
  </details>;
}
