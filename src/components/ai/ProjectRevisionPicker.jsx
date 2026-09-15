import React from "react";
import { imageRevisions, revisionHandoffUrl } from "@/lib/workflowRevisions";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ProjectRevisionPicker({ project, value, onSelect, disabled = false, target }) {
  const revisions = imageRevisions(project);
  const handoff = revisionHandoffUrl(project, value, target);
  return (
    <div className="space-y-2">
    <label className="block text-sm font-medium">已存圖片版本
      <select
        className="mt-2 h-10 w-full rounded-md border border-stone-300 bg-white px-3"
        value={revisions.some((item) => item.revision_id === value) ? value : ""}
        disabled={disabled || !revisions.length}
        onChange={(event) => {
          const revision = revisions.find((item) => item.revision_id === event.target.value);
          if (revision) onSelect(revision);
        }}
      >
        <option value="" disabled>{revisions.length ? "選擇既有圖片版本" : "尚無相容圖片版本"}</option>
        {revisions.map((item) => <option key={item.revision_id} value={item.revision_id}>{item.space || "空間"} · v{item.version || 1} · {item.status || "candidate"}</option>)}
      </select>
    </label>
    {handoff && !disabled && <Link className="inline-flex items-center gap-2 text-sm underline" to={handoff}>{target === "AIGenerate" ? "接續 AI 生圖" : "接續提案圖確認"}<ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}
