export function splitIntoChunks(markdown, fallbackTitle, limit = 1200) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid chunk limit');
  const sections = [];
  let current = { heading: fallbackTitle, body: [] };
  for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      if (current.body.join('\n').trim()) sections.push(current);
      current = { heading: heading[1].trim(), body: [] };
    } else current.body.push(line);
  }
  if (current.body.join('\n').trim()) sections.push(current);
  return sections.flatMap((section, sectionIndex) => {
    // Slice Unicode code points, never truncate a long paragraph or split a surrogate pair.
    const points = Array.from(section.body.join('\n').trim());
    const chunks = [];
    for (let offset = 0; offset < points.length; offset += limit) {
      chunks.push({ heading: section.heading, sectionIndex, chunkIndex: chunks.length, text: points.slice(offset, offset + limit).join('') });
    }
    return chunks;
  });
}
