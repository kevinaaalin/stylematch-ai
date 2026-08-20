import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

let pannellumLoader;

function loadPannellum() {
  if (window.pannellum) return Promise.resolve(window.pannellum);
  if (pannellumLoader) return pannellumLoader;

  pannellumLoader = new Promise((resolve, reject) => {
    if (!document.getElementById("pannellum-local-css")) {
      const stylesheet = document.createElement("link");
      stylesheet.id = "pannellum-local-css";
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/vendor/pannellum/pannellum.css";
      document.head.appendChild(stylesheet);
    }

    const existingScript = document.getElementById("pannellum-local-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.pannellum), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "pannellum-local-script";
    script.src = "/vendor/pannellum/pannellum.js";
    script.async = true;
    script.addEventListener("load", () => resolve(window.pannellum), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  return pannellumLoader;
}

export default function PanoramaViewer({
  imageUrl,
  title,
  initialLongitude = 0,
  initialLatitude = 0,
  initialFov = 100,
  minFov = 35,
  maxFov = 120,
}) {
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let disposed = false;
    let instance;

    setLoading(true);
    setError("");

    loadPannellum()
      .then((pannellum) => {
        if (disposed || !containerRef.current || !pannellum) return;

        instance = pannellum.viewer(containerRef.current, {
          type: "equirectangular",
          panorama: imageUrl,
          autoLoad: true,
          pitch: initialLatitude,
          yaw: initialLongitude,
          hfov: initialFov,
          minHfov: minFov,
          maxHfov: maxFov,
          showZoomCtrl: false,
          showFullscreenCtrl: false,
          keyboardZoom: true,
          compass: false,
          backgroundColor: [17, 19, 15],
        });
        instanceRef.current = instance;
        instance.on("load", () => {
          if (!disposed) setLoading(false);
        });
        instance.on("error", () => {
          if (!disposed) {
            setLoading(false);
            setError("環景載入失敗，請重新整理後再試。");
          }
        });
      })
      .catch(() => {
        if (!disposed) {
          setLoading(false);
          setError("互動檢視器載入失敗。");
        }
      });

    const resizeViewer = () => instanceRef.current?.resize();
    document.addEventListener("fullscreenchange", resizeViewer);

    return () => {
      disposed = true;
      document.removeEventListener("fullscreenchange", resizeViewer);
      instanceRef.current = null;
      instance?.destroy();
    };
  }, [imageUrl, initialFov, initialLatitude, initialLongitude, maxFov, minFov]);

  const changeZoom = (amount) => {
    const instance = instanceRef.current;
    if (!instance) return;
    instance.setHfov(Math.max(minFov, Math.min(maxFov, instance.getHfov() + amount)), 250);
  };

  const resetView = () => {
    instanceRef.current?.lookAt(initialLatitude, initialLongitude, initialFov, 400);
  };

  const enterFullscreen = async () => {
    if (!viewerRef.current?.requestFullscreen) return;
    await viewerRef.current.requestFullscreen();
  };

  return (
    <div ref={viewerRef} className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[#11130f]">
      <div ref={containerRef} className="h-full w-full" aria-label={title} />

      <p className="pointer-events-none absolute left-16 top-5 rounded bg-stone-950/60 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
        {title}
      </p>
      <p className="pointer-events-none absolute right-4 top-5 hidden rounded bg-stone-950/45 px-3 py-1.5 text-xs text-white backdrop-blur-sm sm:block">
        拖曳觀看，滾輪縮放
      </p>

      <div className="absolute left-3 top-3 flex flex-col gap-1 rounded-md bg-white/90 p-1 shadow backdrop-blur">
        <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-950 hover:bg-stone-200" onClick={() => changeZoom(-10)} title="放大">
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-950 hover:bg-stone-200" onClick={() => changeZoom(10)} title="縮小">
          <Minus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-950 hover:bg-stone-200" onClick={resetView} title="重設視角">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-950 hover:bg-stone-200" onClick={enterFullscreen} title="全螢幕">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {loading && <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#11130f] text-sm text-white/70">正在載入空間</div>}
      {error && <div className="absolute inset-0 grid place-items-center bg-[#11130f] p-6 text-center text-sm text-rose-200">{error}</div>}
    </div>
  );
}
