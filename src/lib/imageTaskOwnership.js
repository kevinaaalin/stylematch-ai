export function imageTaskBelongsToProject(task, project) {
  const id = project?.stylematch_project_id || project?.project_id;
  return Boolean(id && task?.stylematch_project_id === id);
}
