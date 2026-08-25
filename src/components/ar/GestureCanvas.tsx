'use client';
import { useRef, useCallback } from 'react';
import { useCalibration } from '@/lib/calibration/context';

type Point = { x: number; y: number };

export function GestureCanvas() {
  const { dispatch } = useCalibration();
  const last = useRef<Point | null>(null);
  const lastDist = useRef<number | null>(null);
  const lastAngle = useRef<number | null>(null);

  const onDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    last.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!last.current) return;
      if (e.pointerType === 'touch' && lastDist.current !== null) {
        return;
      }
      const dx = (e.clientX - last.current.x) / window.innerWidth;
      const dy = (e.clientY - last.current.y) / window.innerHeight;
      dispatch({ type: 'set', field: 'x', value: dx * 2 });
      dispatch({ type: 'set', field: 'y', value: -dy * 2 });
      last.current = { x: e.clientX, y: e.clientY };
    },
    [dispatch],
  );

  const onUp = useCallback(() => {
    last.current = null;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      dispatch({
        type: 'set',
        field: 'scale',
        value: Math.max(0.2, Math.min(2, 1 + delta)),
      });
    },
    [dispatch],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 2) return;
      const a = e.touches[0];
      const b = e.touches[1];
      if (!a || !b) return;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const angle = (Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180) / Math.PI;
      if (lastDist.current !== null) {
        const ratio = dist / lastDist.current;
        dispatch({ type: 'set', field: 'scale', value: Math.max(0.2, Math.min(2, ratio)) });
      }
      if (lastAngle.current !== null) {
        const delta = angle - lastAngle.current;
        dispatch({ type: 'set', field: 'yaw', value: delta });
      }
      lastDist.current = dist;
      lastAngle.current = angle;
    },
    [dispatch],
  );

  const onTouchEnd = useCallback(() => {
    lastDist.current = null;
    lastAngle.current = null;
  }, []);

  return (
    <div
      className="absolute inset-0 z-10 touch-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onWheel={onWheel}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );
}