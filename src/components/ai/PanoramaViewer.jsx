import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PanoramaViewer({ imageUrl, title }) {
  const containerRef = useRef(null);
  const cameraRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imageUrl) return undefined;

    setError("");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1100);
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1);
    let material;
    let mesh;
    let disposed = false;

    new THREE.TextureLoader().load(
      imageUrl,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        material = new THREE.MeshBasicMaterial({ map: texture });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      },
      undefined,
      () => setError("環景圖載入失敗，請確認圖片格式或重新產生。")
    );

    let longitude = 0;
    let latitude = 0;
    let pointerDown = false;
    let startX = 0;
    let startY = 0;
    let startLongitude = 0;
    let startLatitude = 0;
    let animationFrame;

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const onPointerDown = (event) => {
      pointerDown = true;
      startX = event.clientX;
      startY = event.clientY;
      startLongitude = longitude;
      startLatitude = latitude;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!pointerDown) return;
      longitude = startLongitude + (startX - event.clientX) * 0.12;
      latitude = Math.max(-80, Math.min(80, startLatitude + (event.clientY - startY) * 0.12));
    };

    const onPointerUp = () => {
      pointerDown = false;
    };

    const onWheel = (event) => {
      event.preventDefault();
      camera.fov = Math.max(35, Math.min(90, camera.fov + event.deltaY * 0.04));
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      const phi = THREE.MathUtils.degToRad(90 - latitude);
      const theta = THREE.MathUtils.degToRad(longitude);
      camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    resize();
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      geometry.dispose();
      material?.map?.dispose();
      material?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [imageUrl]);

  const changeZoom = (amount) => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.fov = Math.max(35, Math.min(90, camera.fov + amount));
    camera.updateProjectionMatrix();
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.fov = 70;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const enterFullscreen = () => containerRef.current?.requestFullscreen?.();

  return (
    <div className="relative h-[clamp(320px,58vh,640px)] w-full overflow-hidden rounded-md bg-stone-950">
      <div ref={containerRef} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" aria-label={title} />
      <div className="absolute bottom-3 right-3 flex gap-1 rounded-md bg-stone-950/75 p-1 backdrop-blur">
        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/15 hover:text-white" onClick={() => changeZoom(-8)} title="放大"><Plus className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/15 hover:text-white" onClick={() => changeZoom(8)} title="縮小"><Minus className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/15 hover:text-white" onClick={resetView} title="重設視角"><RotateCcw className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/15 hover:text-white" onClick={enterFullscreen} title="全螢幕"><Maximize2 className="h-4 w-4" /></Button>
      </div>
      <p className="absolute bottom-3 left-3 rounded bg-stone-950/75 px-2 py-1 text-xs text-white">拖曳環視 · 滾輪縮放</p>
      {error && <div className="absolute inset-0 grid place-items-center bg-stone-950/90 p-6 text-center text-sm text-rose-200">{error}</div>}
    </div>
  );
}
