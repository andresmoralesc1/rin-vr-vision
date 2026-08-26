'use client';
import { useEffect, type RefObject } from 'react';
import { useWheelDetector } from '@/lib/detect/useWheelDetector';
import { useCalibration } from '@/lib/calibration/context';

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /**
   * Fired when the panel is finished — either a successful detection
   * (after the autoCalibrate dispatch) or the user clicks the banner
   * cancel button. The parent should unmount the panel in response.
   */
  onDone?: () => void;
};

/**
 * Lazy-loaded panel that drives MediaPipe over the live `<video>`
 * stream. Surfaces a "Buscando rueda…" banner while detection is in
 * flight (loading or detecting), with an inline cancel button. On
 * accepted detection it converts the normalized anchor into
 * calibration coordinates and dispatches `autoCalibrate`, then asks
 * the parent to unmount us. Single-shot by design: re-running after
 * the car moves is a future feature.
 */
export default function WheelDetectorPanel({ videoRef, onDone }: Props) {
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
    onDone?.();
  }, [status, anchor, dispatch, onDone]);

  const showBanner = status === 'loading' || status === 'detecting';
  if (!showBanner) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute left-1/2 top-16 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-text-primary shadow-lg backdrop-blur"
    >
      <svg
        className="size-3 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Buscando rueda…
      <button
        type="button"
        onClick={onDone}
        aria-label="Cancelar detección"
        className="pointer-events-auto -mr-1 ml-1 inline-flex size-5 items-center justify-center rounded-full bg-white/10 text-text-primary transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}