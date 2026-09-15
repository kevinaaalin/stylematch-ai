import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { localStore } from "@/lib/localStore";

export default function NewWorkflowDraft({ workflow, disabled = false }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  return <form className="space-y-2 border-b border-stone-200 pb-4" onSubmit={(event) => {
    event.preventDefault();
    if (disabled || creating) return;
    setCreating(true);
    try {
      const project = localStore.createWorkflowProject({ name, workflow });
      navigate(`/${workflow}?${new URLSearchParams({ project: project.project_id })}`);
      // The same route may already be mounted; remount its project context.
      window.location.reload();
    } catch (requestError) { setError(requestError.message); setCreating(false); }
  }}>
    <label className="block text-sm font-medium">新工具草稿名稱<input className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3" value={name} maxLength={120} required disabled={disabled || creating} onChange={(event) => setName(event.target.value)} /></label>
    <button type="submit" className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm disabled:opacity-50" disabled={disabled || creating || !name.trim()}><Plus className="h-4 w-4" />建立工具草稿</button>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </form>;
}
