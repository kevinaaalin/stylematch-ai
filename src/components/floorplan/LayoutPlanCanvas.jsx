import React, { useMemo, useRef, useState } from "react";

function boundsFor(room) {
  if (room?.bounds) return room.bounds;
  const polygon = room?.polygon || [];
  if (polygon.length < 3) return { x: 0, y: 0, width: 5000, depth: 4000 };
  const xs = polygon.map((point) => Number(point[0])); const ys = polygon.map((point) => Number(point[1]));
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), depth: Math.max(...ys) - Math.min(...ys) };
}

export default function LayoutPlanCanvas({ rooms = [], placements = [], onPlacementChange }) {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const room = rooms[0];
  const bounds = useMemo(() => boundsFor(room), [room]);
  const scaleX = 100 / Math.max(1, Number(bounds.width)); const scaleY = 100 / Math.max(1, Number(bounds.depth));
  const beginDrag = (event, placement) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragging({ id: placement.id, offsetX: event.clientX - rect.left - (Number(placement.x) - Number(bounds.x)) * scaleX * rect.width / 100, offsetY: event.clientY - rect.top - (Number(placement.y) - Number(bounds.y)) * scaleY * rect.height / 100 });
  };
  const moveDrag = (event) => {
    if (!dragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const placement = placements.find((item) => item.id === dragging.id);
    if (!placement) return;
    const x = Number(bounds.x) + Math.max(0, Math.min(rect.width - Number(placement.width) * scaleX * rect.width / 100, event.clientX - rect.left - dragging.offsetX)) / rect.width * Number(bounds.width);
    const y = Number(bounds.y) + Math.max(0, Math.min(rect.height - Number(placement.depth) * scaleY * rect.height / 100, event.clientY - rect.top - dragging.offsetY)) / rect.height * Number(bounds.depth);
    onPlacementChange(placement.id, { x: Math.round(x), y: Math.round(y) });
  };
  return (
    <div ref={canvasRef} className="relative aspect-[5/4] min-h-72 overflow-hidden border border-stone-300 bg-white touch-none" onPointerMove={moveDrag} onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)}>
      <div className="pointer-events-none absolute inset-3 border-2 border-stone-700"><span className="absolute left-2 top-2 text-xs font-medium text-stone-600">{room?.name || "空間"} · {Math.round(bounds.width)} × {Math.round(bounds.depth)} mm</span></div>
      {placements.map((placement) => <button key={placement.id} type="button" title="拖曳調整位置" onPointerDown={(event) => beginDrag(event, placement)} className={`absolute grid cursor-grab place-items-center overflow-hidden border px-1 text-center text-xs font-medium active:cursor-grabbing ${dragging?.id === placement.id ? "z-10 border-amber-700 bg-amber-200" : "border-amber-500 bg-amber-100"}`} style={{ left: `${(Number(placement.x) - Number(bounds.x)) * scaleX}%`, top: `${(Number(placement.y) - Number(bounds.y)) * scaleY}%`, width: `${Math.max(5, Number(placement.width) * scaleX)}%`, height: `${Math.max(5, Number(placement.depth) * scaleY)}%` }}>{placement.name || placement.id}</button>)}
    </div>
  );
}
