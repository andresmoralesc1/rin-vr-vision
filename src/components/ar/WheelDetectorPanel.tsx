'use client';
import { useEffect, type RefObject } from 'react';
import { useWheelDetector } from '@/lib/detect/useWheelDetector';
import { useCalibration } from '@/lib/calibration/context';

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Called when the first accepted anchor has been dispatched. */
  onAccepted?: () => void;
};

/**
 * Lazy-loaded panel that drives MediaPipe over the live `<video>`
 * stream. Invisible — the parent button owns all UI. On the first
 * accepted detection it converts the normalized anchor into
 * calibration coordinates and dispatches `autoCalibrate`, then asks
 * the parent to unmount us (single-shot by design: re-running after
 * the car moves is a future feature).
 */
export default function WheelDetectorPanel({ videoRef, onAccepted }: Props) {
  const { anchor, status, start, stop } = useWheelDetector(videoRef);
  const { dispatch } = useCalibration();

  useEffect(() => {
    void start();
    return () => stop();
  }, [start, stop]);

  useEffect(() => {
    if (status !== 'detected' || !anchor) return;
    // Normalize [0,1] → [-1,1] for x; invert y (frame Y is top-down,
    // gesture Y is bottom-up).
    const x = anchor.x * 2 - 1;
    const y = 1 - anchor.y * 2;
    // Radius is pixels / frameWidth (~0.05..0.5). Map into the
    // gesture's scale range (manual slider runs ~0.2..1.5).
    const scale = Math.max(0.2, Math.min(2.5, anchor.radius * 6));
    dispatch({ type: 'autoCalibrate', x, y, scale, confidence: anchor.confidence });
    onAccepted?.();
  }, [status, anchor, dispatch, onAccepted]);

  return null;
}
