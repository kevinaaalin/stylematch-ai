import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { recentImageRevisions, revisionHandoffUrl } from "@/lib/workflowRevisions";
import NewWorkflowDraft from "@/components/ai/NewWorkflowDraft";

export default function RecentRevisionLauncher({ projects, target = "ReferenceCanvas", workflow = target, disabled = false }) {
  const items = useMemo(() => recentImageRevisions(projects), [projects]);
  const [selectedKey, setSelectedKey] = useState("");
  const selected = items.find((item) => item.key === selectedKey);
  const url = selected && revisionHandoffUrl(selected.project, selected.revision.revision_id, target);
  return <section className="space-y-3 border-y border-stone-200 py-4" aria-label="最近成果">
    <NewWorkflowDraft workflow={workflow} disabled={disabled} />
    <label className="block text-sm font-medium">最近成果
      <select className="mt-2 h-10 w-full min-w-0 rounded-md border border-stone-300 bg-white px-3" value={selected?.key || ""} disabled={disabled || !items.length} onChange={(event) => setSelectedKey(event.target.value)}>
        <option value="" disabled>{items.length ? "選擇專案成果" : "尚無可接續的圖片成果"}</option>
        {items.map(({ key, project, revision }) => <option key={key} value={key}>{project.project_name || project.name || project.project_id} · {revision.space || "空間"} · v{revision.version || 1}</option>)}
      </select>
    </label>
    {selected && <div className="flex min-w-0 flex-wrap items-center gap-3">
      <img src={selected.revision.image_url} alt={`${selected.revision.space || "空間"}成果預覽`} className="h-20 w-28 object-contain bg-stone-100" />
      <span className="text-sm">{selected.revision.status === "adopted" ? "已採用" : "候選版本"}</span>
      {url && !disabled && <Link to={url} className="inline-flex items-center gap-2 text-sm underline">{target === "AIGenerate" ? "載入生圖來源" : "開啟提案圖確認"}<ArrowRight className="h-4 w-4" /></Link>}
    </div>}
  </section>;
}
