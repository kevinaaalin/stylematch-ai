import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resolveImageRevision } from "@/lib/workflowRevisions";

export function useRevisionHandoff(projects, onLoad) {
  const [params] = useSearchParams();
  const projectId = params.get("project");
  const revisionId = params.get("revision");
  const [error, setError] = useState("");
  const callback = useRef(onLoad);
  callback.current = onLoad;
  const handled = useRef("");
  useEffect(() => {
    const key = JSON.stringify([projectId, revisionId]);
    if (handled.current === key) return;
    handled.current = key;
    if (!revisionId) { setError(""); return; }
    const project = projects.find((item) => (item.project_id || item.id) === projectId);
    const revision = resolveImageRevision(project, revisionId);
    if (!revision) {
      setError("交接圖片不存在、不相容或不屬於指定專案，請重新選擇來源。");
      callback.current(null, null);
      return;
    }
    setError("");
    callback.current(project, revision);
  }, [projectId, revisionId, projects]);
  return error;
}
