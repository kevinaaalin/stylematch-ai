import React, { useState } from "react";

export default function ImageDifferenceViewer({ beforeUrl, afterUrl }) {
  const [position, setPosition] = useState(50);
  if (!beforeUrl || !afterUrl) return null;
  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-stone-100">
        <img src={beforeUrl} alt="修改前" className="absolute inset-0 h-full w-full object-cover" />
        <img src={afterUrl} alt="修改後" className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }} />
        <span className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${position}%` }} />
        <span className="absolute left-2 top-2 bg-stone-950/80 px-2 py-1 text-xs text-white">修改後</span>
        <span className="absolute right-2 top-2 bg-stone-950/80 px-2 py-1 text-xs text-white">修改前</span>
      </div>
      <label className="block text-xs font-medium text-stone-600">前後比較
        <input className="mt-2 w-full accent-amber-600" type="range" min="0" max="100" value={position} onChange={(event) => setPosition(Number(event.target.value))} />
      </label>
    </div>
  );
}
