/**
 * MediaPipe-based wheel detector.
 *
 * Pipeline (browser-only):
 *   1. `loadDetector()` resolves the WASM runtime + downloads the
 *      EfficientDet-Lite0 model once, then caches the detector.
 *   2. `detectWheel(detector, video)` runs the detector on the current
 *      `<video>` frame and returns the most likely wheel anchor.
 *
 * EfficientDet does not have a `wheel` class — we look for `car` and
 * apply a simple geometric heuristic to estimate the wheel position
 * inside the car bounding box (bottom quadrant of the bbox). This is
 * good enough for an initial anchor; the user can drag/pinch to
 * refine afterwards.
 *
 * Bundle: lazy-loaded via `next/dynamic` from `WheelDetectorPanel` so
 * the WASM + tflite (~9 MB) only downloads when the user opens the
 * detector, not on first paint of `/app`.
 */

import {
  FilesetResolver,
  ObjectDetector,
  type Detection,
} from '@mediapipe/tasks-vision';

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite';

/** Normalized wheel position in the camera frame (0..1 each axis). */
export type WheelAnchor = {
  x: number;
  y: number;
  /** Approximate radius in normalized units (relative to frame width). */
  radius: number;
  /** 0..1 detector confidence. UI can drop below 0.3. */
  confidence: number;
  source: 'detected' | 'fallback';
};

let cachedDetector: ObjectDetector | null = null;
let cachedPromise: Promise<ObjectDetector> | null = null;

export async function loadDetector(): Promise<ObjectDetector> {
  if (cachedDetector) return cachedDetector;
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
    const detector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL },
      scoreThreshold: 0.4,
      runningMode: 'VIDEO',
    });
    cachedDetector = detector;
    return detector;
  })();

  return cachedPromise;
}

/** Free WASM/model memory. Safe to call multiple times. */
export async function disposeDetector(): Promise<void> {
  if (cachedDetector) {
    cachedDetector.close();
    cachedDetector = null;
  }
  cachedPromise = null;
}

/**
 * Find the best `car` detection above the score threshold, then
 * project a wheel anchor into the bottom-front quadrant of its bbox.
 *
 * Returns `null` when no car is visible — caller is expected to leave
 * the calibration untouched and surface a "no se detectó auto" hint.
 */
export function detectWheel(detector: ObjectDetector, video: HTMLVideoElement): WheelAnchor | null {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (width === 0 || height === 0) return null;

  const result = detector.detectForVideo(video, performance.now());
  const car = pickBestCar(result.detections);
  if (!car) return null;

  const bbox = car.boundingBox;
  if (!bbox) return null;

  // Heuristic: the front wheel sits in the lower-front portion of the
  // visible car silhouette. For a left-facing car that is the bottom
  // LEFT quadrant; for right-facing, bottom RIGHT. Without an
  // orientation signal we default to the bottom-center and let the
  // user nudge.
  // ponytail: orientation detection deferred — user can drag. Add when
  // we ship a "front wheel" / "rear wheel" toggle.
  const cx = bbox.originX + bbox.width * 0.5;
  const cy = bbox.originY + bbox.height * 0.78;
  const radius = Math.min(bbox.width, bbox.height) * 0.22;

  return {
    x: cx / width,
    y: cy / height,
    radius: radius / width,
    confidence: bestCarScore(car),
    source: 'detected',
  };
}

function pickBestCar(detections: Detection[]): Detection | null {
  let best: Detection | null = null;
  for (const d of detections) {
    const isCar = d.categories?.some((c) => c.categoryName === 'car');
    if (!isCar) continue;
    const score = bestCarScore(d);
    if (!best || score > bestCarScore(best)) best = d;
  }
  return best;
}

function bestCarScore(d: Detection): number {
  const cat = d.categories?.find((c) => c.categoryName === 'car');
  return cat?.score ?? 0;
}
