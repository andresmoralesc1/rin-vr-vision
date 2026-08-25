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
 *   - `stop()` halts the loop AND cancels an in-flight load, so a
 *     second `start()` mid-load can't leak a duplicate interval.
 *   - The hook disposes on unmount even if `stop()` wasn't called.
 */
export function useWheelDetector(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: Options = {},
) {
  const intervalMs = options.intervalMs ?? 200;
  const minConfidence = options.minConfidence ?? 0.4;

  const [anchor, setAnchor] = useState<WheelAnchor | null>(null);
  const [status, setStatus] = useState<DetectionStatus>('idle');

  const detectorRef = useRef<Awaited<ReturnType<typeof loadDetector>> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // True only between start() passing the guard and the setInterval
  // being scheduled (or the load throwing). A second `start()` while
  // the WASM/model is still downloading returns early via this guard
  // — without it, both calls would schedule their own interval and
  // the first reference would be overwritten, leaking an interval.
  const startingRef = useRef(false);

  const stop = useCallback(() => {
    startingRef.current = false;
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    if (tickRef.current || startingRef.current) return;
    startingRef.current = true;
    setStatus('loading');
    try {
      const detector = await loadDetector();
      // stop() may have fired while we awaited the load — bail without
      // scheduling an interval.
      if (!startingRef.current) return;
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
    } finally {
      startingRef.current = false;
    }
  }, [videoRef, intervalMs, minConfidence]);

  useEffect(() => {
    return () => {
      startingRef.current = false;
      if (tickRef.current) clearInterval(tickRef.current);
      void disposeDetector();
    };
  }, []);

  return { anchor, status, start, stop };
}
