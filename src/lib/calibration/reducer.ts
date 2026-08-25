import type { Finish } from '@/lib/three/materials';
import type { RimModelId } from '@/lib/rims/catalog';

export type Calibration = {
  x: number;
  y: number;
  scale: number;
  pitch: number;
  yaw: number;
  roll: number;
  finish: Finish;
  /** Catalog id of the currently-loaded GLB. See `@/lib/rims/catalog`. */
  modelId: RimModelId;
};

export const INITIAL_CALIBRATION: Calibration = {
  x: 0,
  y: 0,
  scale: 0.6,
  pitch: 0,
  yaw: 0,
  roll: 0,
  finish: 'chrome',
  modelId: 'quaternius-5spoke',
};

export type CalibrationAction =
  | { type: 'set'; field: keyof Omit<Calibration, 'finish' | 'modelId'>; value: number }
  | { type: 'finish'; value: Finish }
  | { type: 'model'; value: RimModelId }
  | { type: 'reset' }
  | { type: 'prefill'; partial: Partial<Calibration> }
  /**
   * Result of an auto-detect pass on the camera frame. The detector
   * returns the wheel position + size already mapped to the same
   * coordinate system the gestures use ([-1, 1] for x/y, multiplier
   * for scale), so this action simply prefills the relevant fields.
   * `confidence` is 0..1; UI can decide whether to discard low values.
   */
  | { type: 'autoCalibrate'; x: number; y: number; scale: number; confidence: number };

export function calibrationReducer(state: Calibration, action: CalibrationAction): Calibration {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'finish':
      return { ...state, finish: action.value };
    case 'model':
      return { ...state, modelId: action.value };
    case 'reset':
      return INITIAL_CALIBRATION;
    case 'prefill':
      return { ...state, ...action.partial };
    case 'autoCalibrate':
      return { ...state, x: action.x, y: action.y, scale: action.scale };
    default:
      return state;
  }
}
