'use client';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
  detectWheel,
  disposeDetector,
  loadDetector,
  type WheelAnchor,
} from './wheelDetector';

export type DetectionStatus =
  | 'idle'
  | 'loading'
  | 'detecting'
  | 'detected'
  | 'not-found';

type Options = {
  /** Milliseconds between detection passes. Defaults to 200 (5 fps). */
  intervalMs?: number;
  /** Minimum score to accept; defaults to 0.4. */
  minConfidence?: number;
};

/**
 * Drives a MediaPipe ObjectDetector against a `<video>` element and
 * surfaces the most recent wheel anchor.
 *
 * Lifecycle:
 *   - `start()` lazily loads the detector (first call downloads WASM
 *     + tflite), then begins a `setInterval` poll loop.
 *   - `stop()` halts the loop and disposes the detector.
 *   - The hook disposes on unmount even if `stop()` wasn't called.
 */
export function useWheelDetector(videoRef: RefObject<HTMLVideoElement | null>, options: Options = {}) {
  const intervalMs = options.intervalMs ?? 200;
  const minConfidence = options.minConfidence ?? 0.4;

  const [anchor, setAnchor] = useState<WheelAnchor | null>(null);
  const [status, setStatus] = useState<DetectionStatus>('idle');

  const detectorRef = useRef<Awaited<ReturnType<typeof loadDetector>> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    if (tickRef.current) return; // already running
    setStatus('loading');
    try {
      const detector = await loadDetector();
      detectorRef.current = detector;
      setStatus('detecting');
      tickRef.current = setInterval(() => {
        const video = videoRef.current;
        if (!video) return;
        try {
          const found = detectWheel(detector, video);
          if (found && found.confidence >= minConfidence) {
            setAnchor(found);
            setStatus('detected');
          } else {
            setStatus('not-found');
          }
        } catch (err) {
          // Single-frame failure shouldn't kill the loop — just log.
          console.warn('detectWheel frame failed:', err);
        }
      }, intervalMs);
    } catch (err) {
      console.error('detector init failed:', err);
      setStatus('not-found');
    }
  }, [videoRef, intervalMs, minConfidence]);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      void disposeDetector();
    };
  }, []);

  return { anchor, status, start, stop };
}
