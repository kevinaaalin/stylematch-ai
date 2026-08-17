import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";

const ImageMaskCanvas = forwardRef(function ImageMaskCanvas({ imageUrl, alt = "編輯來源圖片", enabled = true }, ref) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasMask, setHasMask] = useState(false);

  const pointFor = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (event.clientY - rect.top) * (canvasRef.current.height / rect.height),
    };
  };
  const start = (event) => {
    if (!enabled) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drawingRef.current = true;
    const point = pointFor(event);
    const context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.moveTo(point.x, point.y);
  };
  const draw = (event) => {
    if (!enabled || !drawingRef.current) return;
    const point = pointFor(event);
    const context = canvasRef.current.getContext("2d");
    context.lineTo(point.x, point.y);
    context.strokeStyle = "rgba(220, 38, 38, 0.58)";
    context.lineWidth = 34;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    setHasMask(true);
  };
  const stop = () => { drawingRef.current = false; };
  const clear = () => {
    canvasRef.current?.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasMask(false);
  };

  useImperativeHandle(ref, () => ({
    clear,
    hasMask: () => hasMask,
    getMaskDataUrl: () => hasMask ? canvasRef.current?.toDataURL("image/png") : null,
  }), [hasMask]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-stone-100">
      <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      <canvas ref={canvasRef} width="960" height="720" className={`absolute inset-0 h-full w-full touch-none ${enabled ? "cursor-crosshair" : "pointer-events-none"}`} onPointerDown={start} onPointerMove={draw} onPointerUp={stop} onPointerCancel={stop} onPointerLeave={stop} />
      {enabled && !hasMask && <span className="pointer-events-none absolute bottom-3 left-3 bg-white/90 px-2 py-1 text-xs text-stone-700 shadow-sm">直接塗選要修改的區域</span>}
    </div>
  );
});

export default ImageMaskCanvas;
