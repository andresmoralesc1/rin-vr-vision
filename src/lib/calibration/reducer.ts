import type { Finish } from '@/lib/three/materials';

export type Calibration = {
  x: number;
  y: number;
  scale: number;
  pitch: number;
  yaw: number;
  roll: number;
  finish: Finish;
};

export const INITIAL_CALIBRATION: Calibration = {
  x: 0, y: 0, scale: 0.6, pitch: 0, yaw: 0, roll: 0, finish: 'chrome',
};

export type CalibrationAction =
  | { type: 'set'; field: keyof Omit<Calibration, 'finish'>; value: number }
  | { type: 'finish'; value: Finish }
  | { type: 'reset' }
  | { type: 'prefill'; partial: Partial<Calibration> };

export function calibrationReducer(state: Calibration, action: CalibrationAction): Calibration {
  switch (action.type) {
    case 'set': return { ...state, [action.field]: action.value };
    case 'finish': return { ...state, finish: action.value };
    case 'reset': return INITIAL_CALIBRATION;
    case 'prefill': return { ...state, ...action.partial };
    default: return state;
  }
}
