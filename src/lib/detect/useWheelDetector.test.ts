import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as detectorModule from './wheelDetector';

// Mock the MediaPipe-backed module so the hook never hits the network.
// detectWheel returns null (no car detected) — fine for testing the
// start()/stop() lifecycle without driving real detection.
vi.mock('./wheelDetector', () => ({
  loadDetector: vi.fn(async () => ({}) as unknown as Awaited<ReturnType<typeof detectorModule.loadDetector>>),
  detectWheel: vi.fn(() => null),
  disposeDetector: vi.fn(async () => {}),
}));

import { useWheelDetector } from './useWheelDetector';

const detectWheelSpy = vi.mocked(detectorModule.detectWheel);

function video() {
  const v = document.createElement('video');
  v.width = 100;
  v.height = 100;
  Object.defineProperty(v, 'videoWidth', { configurable: true, get: () => 100 });
  Object.defineProperty(v, 'videoHeight', { configurable: true, get: () => 100 });
  document.body.appendChild(v);
  return v;
}

describe('useWheelDetector — start() race guard', () => {
  beforeEach(() => {
    detectWheelSpy.mockClear();
  });

  it('start() called twice before the load resolves does not schedule two intervals', async () => {
    vi.useFakeTimers();
    try {
      const ref = { current: video() };
      const { result } = renderHook(() => useWheelDetector(ref));

      // Fire two start()s back-to-back. Both pass the tickRef.current
      // guard (it's null), but only the first should run the post-await
      // setInterval — the second must no-op.
      await act(async () => {
        const p1 = result.current.start();
        const p2 = result.current.start();
        await Promise.all([p1, p2]);
      });

      // Advance enough wall time for one interval's worth (200ms), then
      // a little more, and confirm we got one frame of detection
      // rather than two.
      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      // 1 frame expected (200ms interval). With the regression in
      // place, two intervals would mean 2 frames in 250ms.
      expect(detectWheelSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stop() called before the load resolves cancels the start in flight', async () => {
    vi.useFakeTimers();
    try {
      const ref = { current: video() };
      const { result } = renderHook(() => useWheelDetector(ref));

      // Start, then synchronously stop — startingRef flips back to
      // false mid-flight, so the await loadDetector() result should
      // bail without scheduling an interval.
      await act(async () => {
        const p = result.current.start();
        result.current.stop();
        await p;
      });

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(detectWheelSpy).not.toHaveBeenCalled();
      expect(result.current.status).toBe('idle');
    } finally {
      vi.useRealTimers();
    }
  });

  it('start() after stop() works as expected', async () => {
    vi.useFakeTimers();
    try {
      const ref = { current: video() };
      const { result } = renderHook(() => useWheelDetector(ref));

      await act(async () => {
        await result.current.start();
      });
      await act(async () => {
        result.current.stop();
      });
      detectWheelSpy.mockClear();

      await act(async () => {
        await result.current.start();
      });

      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      expect(detectWheelSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
