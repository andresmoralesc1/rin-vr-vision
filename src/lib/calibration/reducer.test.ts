import { describe, it, expect } from 'vitest';
import { calibrationReducer, INITIAL_CALIBRATION } from './reducer';

describe('calibrationReducer', () => {
  it('updates x on set', () => {
    const next = calibrationReducer(INITIAL_CALIBRATION, { type: 'set', field: 'x', value: 0.5 });
    expect(next.x).toBe(0.5);
  });

  it('updates finish on finish action', () => {
    const next = calibrationReducer(INITIAL_CALIBRATION, { type: 'finish', value: 'matte-black' });
    expect(next.finish).toBe('matte-black');
  });

  it('resets to initial', () => {
    const dirty = { ...INITIAL_CALIBRATION, x: 0.7, scale: 1.2 };
    const next = calibrationReducer(dirty, { type: 'reset' });
    expect(next).toEqual(INITIAL_CALIBRATION);
  });

  it('prefills partial without overwriting unspecified fields', () => {
    const next = calibrationReducer(INITIAL_CALIBRATION, { type: 'prefill', partial: { x: 0.3, scale: 0.8 } });
    expect(next.x).toBe(0.3);
    expect(next.scale).toBe(0.8);
    expect(next.y).toBe(INITIAL_CALIBRATION.y);
  });
});
