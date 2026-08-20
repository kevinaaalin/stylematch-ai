import React, { useEffect, useMemo, useRef, useState } from "react";

function extentFor(space) {
  const points = [];
  for (const room of space?.rooms || []) for (const point of room.polygon || []) points.push(point);
  for (const wall of space?.walls || []) for (const point of [wall.start, wall.end]) if (Array.isArray(point)) points.push(point);
  if (!points.length) return { x: 0, y: 0, width: 5000, depth: 4000 };
  const xs = points.map((point) => Number(point[0])); const ys = points.map((point) => Number(point[1]));
  const x = Math.min(...xs); const y = Math.min(...ys);
  return { x, y, width: Math.max(1, Math.max(...xs) - x), depth: Math.max(1, Math.max(...ys) - y) };
}

export default function StructuredSpaceEditor({ snapshot, floorPlanUrl, onCommit, disabled }) {
  const canvasRef = useRef(null);
  const [rooms, setRooms] = useState(snapshot?.structured_space?.rooms || []);
  const [drag, setDrag] = useState(null);
  useEffect(() => setRooms(snapshot?.structured_space?.rooms || []), [snapshot?.snapshot_id]);
  const extent = useMemo(() => extentFor(snapshot?.structured_space), [snapshot]);
  const position = (point) => ({ left: `${((Number(point[0]) - extent.x) / extent.width) * 100}%`, top: `${((Number(point[1]) - extent.y) / extent.depth) * 100}%` });
  const toModel = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [Math.round(extent.x + ((event.clientX - rect.left) / rect.width) * extent.width), Math.round(extent.y + ((event.clientY - rect.top) / rect.height) * extent.depth)];
  };
  const move = (event) => {
    if (!drag || disabled) return;
    const point = toModel(event);
    setRooms((current) => current.map((room, roomIndex) => roomIndex === drag.roomIndex ? { ...room, polygon: room.polygon.map((item, pointIndex) => pointIndex === drag.pointIndex ? point : item) } : room));
  };
  const finish = () => {
    if (!drag) return;
    const room = rooms[drag.roomIndex];
    setDrag(null);
    onCommit?.({ entity_type: "rooms", entity_id: room.id, value: { ...room, polygon: room.polygon, source: "human_visual_correction" }, reason: "視覺拖曳校正房間邊界" });
  };
  const polygonPoints = (room) => (room.polygon || []).map((point) => `${((Number(point[0]) - extent.x) / extent.width) * 1000},${((Number(point[1]) - extent.y) / extent.depth) * 800}`).join(" ");
  return <div ref={canvasRef} className="relative aspect-[5/4] min-h-80 touch-none overflow-hidden border border-stone-300 bg-stone-100" onPointerMove={move} onPointerUp={finish} onPointerCancel={finish}>
    {floorPlanUrl && <img src={floorPlanUrl} alt="平面圖視覺校正底圖" className="absolute inset-0 h-full w-full object-contain opacity-35" />}
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 800" preserveAspectRatio="none">
      {(snapshot?.structured_space?.walls || []).map((wall) => Array.isArray(wall.start) && Array.isArray(wall.end) ? <line key={wall.id} x1={((wall.start[0] - extent.x) / extent.width) * 1000} y1={((wall.start[1] - extent.y) / extent.depth) * 800} x2={((wall.end[0] - extent.x) / extent.width) * 1000} y2={((wall.end[1] - extent.y) / extent.depth) * 800} stroke="#57534e" strokeWidth="5" /> : null)}
      {rooms.map((room) => <polygon key={room.id} points={polygonPoints(room)} fill="rgba(245,158,11,.12)" stroke="#d97706" strokeWidth="3" />)}
    </svg>
    {rooms.flatMap((room, roomIndex) => (room.polygon || []).map((point, pointIndex) => <button key={`${room.id}-${pointIndex}`} type="button" title={`${room.name || room.id} 邊界點 ${pointIndex + 1}`} disabled={disabled} className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full border-2 border-white bg-amber-600 shadow disabled:cursor-not-allowed" style={position(point)} onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); setDrag({ roomIndex, pointIndex }); }} />))}
    <div className="pointer-events-none absolute bottom-2 left-2 bg-stone-950/80 px-2 py-1 text-xs text-white">拖曳橘色控制點校正邊界，放開即建立新版本</div>
  </div>;
}
