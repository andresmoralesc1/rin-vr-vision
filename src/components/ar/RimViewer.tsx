'use client';
import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { loadRim } from '@/lib/three/loader';
import { materialForFinish } from '@/lib/three/materials';
import { useCalibration } from '@/lib/calibration/context';
import { getRim } from '@/lib/rims/catalog';

function Rim({ modelId }: { modelId: string }) {
  const ref = useRef<Group>(null);
  const { calibration } = useCalibration();
  const model = getRim(modelId);
  const url = model.glbUrl;

  useEffect(() => {
    let cancelled = false;
    loadRim(url).then((g) => {
      if (cancelled || !ref.current) return;
      ref.current.clear();
      g.traverse((o) => {
        if ((o as unknown as { isMesh?: boolean }).isMesh) {
          (o as unknown as { material: unknown }).material = materialForFinish(calibration.finish);
        }
      });
      ref.current.add(g);
    });
    return () => {
      cancelled = true;
    };
  }, [url, calibration.finish]);

  useFrame(() => {
    if (!ref.current) return;
    // Multiply by model.defaultScale so swapping between rines of
    // different native scales doesn't visibly jump in size. The
    // gesture's `scale` stays a unit-less multiplier on top of that.
    const s = calibration.scale * model.defaultScale;
    ref.current.position.set(calibration.x * 2, -calibration.y * 2, 0);
    ref.current.scale.setScalar(s);
    ref.current.rotation.set(
      (calibration.pitch * Math.PI) / 180,
      (calibration.yaw * Math.PI) / 180,
      (calibration.roll * Math.PI) / 180,
    );
  });

  return <group ref={ref} />;
}

export function RimViewer() {
  const { calibration } = useCalibration();
  return (
    <Canvas
      className="absolute inset-0 pointer-events-none"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Rim modelId={calibration.modelId} />
    </Canvas>
  );
}
