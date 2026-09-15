// Re-reading a stored project must not erase the compacted media or its counts.
const safeUrls = (urls) => (Array.isArray(urls) ? urls : []).filter((url) => typeof url === "string"
  && /^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|blob:|\/(?!\/)|\.\/)/i.test(url));
export function compactProjectMedia(data) {
  const { space_photos, reference_photos, ...projectFields } = data;
  const spaces = space_photos ?? data.proposal_media?.space_photos ?? {};
  const references = reference_photos ?? data.proposal_media?.reference_photos ?? [];
  const summary = Object.fromEntries(Object.entries(spaces).map(([room, photos]) => [room, Array.isArray(photos) ? photos.length : 0]));
  return {
    ...projectFields,
    photo_summary: space_photos === undefined ? data.photo_summary ?? summary : summary,
    total_photo_count: space_photos === undefined ? data.total_photo_count ?? Object.values(summary).reduce((a, b) => a + b, 0) : Object.values(summary).reduce((a, b) => a + b, 0),
    reference_photo_count: reference_photos === undefined ? data.reference_photo_count ?? references.length : references.length,
    proposal_media: { space_photos: Object.fromEntries(Object.entries(spaces).map(([room, photos]) => [room, safeUrls(photos)])), reference_photos: safeUrls(references) },
  };
}
