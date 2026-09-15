export const MAX_SPACE_PHOTOS = 4;
export function assertSpacePhotoCount(space, count) {
  if (space !== "floor_plan" && count > MAX_SPACE_PHOTOS) throw new Error("每個空間最多上傳 4 張照片，請先移除照片或減少本次選取數量。");
}
export function projectSpacePhotos(project, roomKeys) {
  const media = project?.proposal_media?.space_photos || {};
  return roomKeys.flatMap((room) => (media[room] || []).map((url, index) => ({ room, index, url, key: `${room}:${index}` })));
}
export function sourcePhotoResults(project, photo) {
  return (project?.reference_revisions || []).filter((revision) => revision.source_photo_room === photo.room
    && revision.source_image_url === photo.url && revision.source_task_id);
}
export function assertPhotoResultSource(project, data) {
  if (!data.source_photo_room) return;
  if (!(project.proposal_media?.space_photos?.[data.source_photo_room] || []).includes(data.source_image_url)) {
    throw new Error("生成成果的原始照片不屬於此專案空間，請重新選擇來源。");
  }
}
