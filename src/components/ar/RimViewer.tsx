'use client';
import { useEffect, useRef } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { loadRim } from '@/lib/three/loader';
import { materialForFinish } from '@/lib/three/materials';
import { useCalibration } from '@/lib/calibration/context';

export function RimViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<Group | null>(null);
  const { calibration } = useCalibration();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 3);

    scene.add(new AmbientLight(0xffffff, 0.6));
    const dir = new DirectionalLight(0xffffff, 1.2);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    const root = new Group();
    scene.add(root);
    rootRef.current = root;

    let cancelled = false;
    loadRim('/models/rim-chrome.glb').then((g) => {
      if (cancelled) return;
      g.traverse((o) => {
        if ((o as Mesh).isMesh) {
          (o as Mesh).material = materialForFinish(calibration.finish);
        }
      });
      root.add(g);
    });
    // ponytail: load-once; finish is re-applied via separate effect on change.

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas.parentElement ?? canvas;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
    };
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.position.set(calibration.x * 2, -calibration.y * 2, 0);
    root.scale.setScalar(calibration.scale);
    root.rotation.set(
      (calibration.pitch * Math.PI) / 180,
      (calibration.yaw * Math.PI) / 180,
      (calibration.roll * Math.PI) / 180,
    );
  }, [calibration.x, calibration.y, calibration.scale, calibration.pitch, calibration.yaw, calibration.roll]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mat = materialForFinish(calibration.finish);
    root.traverse((o) => {
      if ((o as Mesh).isMesh) (o as Mesh).material = mat;
    });
  }, [calibration.finish]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
