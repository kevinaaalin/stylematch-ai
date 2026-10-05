// Store repeated inline media once while preserving the full logical snapshots.
export function encodeLocalDatabase(database) {
  const media = [];
  const indexes = new Map();
  const data = JSON.parse(JSON.stringify(database, (_key, value) => {
    if (typeof value !== 'string' || !value.startsWith('data:image/')) return value;
    if (!indexes.has(value)) { indexes.set(value, media.length); media.push(value); }
    return { __stylematch_inline_media_v1: indexes.get(value) };
  }));
  return JSON.stringify({ format: 'stylematch-media-envelope-v1', media, data });
}

export function decodeLocalDatabase(raw) {
  const parsed = JSON.parse(raw);
  if (parsed?.format !== 'stylematch-media-envelope-v1') return parsed;
  if (!Array.isArray(parsed.media) || !parsed.data) throw new Error('Invalid local media envelope');
  return JSON.parse(JSON.stringify(parsed.data), (_key, value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 1 || !('__stylematch_inline_media_v1' in value)) return value;
    const index = value.__stylematch_inline_media_v1;
    if (!Number.isInteger(index) || index < 0 || typeof parsed.media[index] !== 'string') throw new Error('Missing local media');
    return parsed.media[index];
  });
}
