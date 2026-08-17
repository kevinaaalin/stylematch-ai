export function scoreStyleRatings(allRatings, styleKeys) {
  const details = Object.fromEntries(styleKeys.map((key) => [key, {
    total: 0,
    count: 0,
    average: 0,
    five_star_count: 0,
    four_star_count: 0,
  }]));

  allRatings.forEach((item) => {
    const points = Number(item.rating);
    if (!Number.isInteger(points) || points < 1 || points > 5) return;
    item.styles.forEach((styleKey) => {
      const style = details[styleKey];
      if (!style) return;
      style.total += points;
      style.count += 1;
      if (points === 5) style.five_star_count += 1;
      if (points === 4) style.four_star_count += 1;
      style.average = Number((style.total / style.count).toFixed(2));
    });
  });

  const ranked = Object.entries(details)
    .filter(([, detail]) => detail.count > 0)
    .sort(([keyA, a], [keyB, b]) => (
      b.total - a.total
      || b.average - a.average
      || b.five_star_count - a.five_star_count
      || b.four_star_count - a.four_star_count
      || keyA.localeCompare(keyB)
    ));

  return {
    scores: Object.fromEntries(Object.entries(details).map(([key, detail]) => [key, detail.total])),
    details,
    ranked_style_ids: ranked.map(([key]) => key),
    primary_style: ranked[0]?.[0] || styleKeys[0],
    secondary_style: ranked[1]?.[0] || null,
  };
}
