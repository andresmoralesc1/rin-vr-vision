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

  it('swaps model on model action', () => {
    const next = calibrationReducer(INITIAL_CALIBRATION, { type: 'model', value: 'quaternius-5spoke' });
    expect(next.modelId).toBe('quaternius-5spoke');
    // Other fields untouched — calibration survives the swap so the
    // user's manual tuning isn't blown away when they browse rims.
    expect(next.x).toBe(INITIAL_CALIBRATION.x);
    expect(next.finish).toBe(INITIAL_CALIBRATION.finish);
  });

  it('resets to initial including default modelId', () => {
    const dirty = { ...INITIAL_CALIBRATION, x: 0.7, scale: 1.2, modelId: 'quaternius-5spoke' as const };
    const next = calibrationReducer(dirty, { type: 'reset' });
    expect(next).toEqual(INITIAL_CALIBRATION);
    expect(next.modelId).toBe('quaternius-5spoke');
  });

  it('prefills partial without overwriting unspecified fields', () => {
    const next = calibrationReducer(INITIAL_CALIBRATION, { type: 'prefill', partial: { x: 0.3, scale: 0.8 } });
    expect(next.x).toBe(0.3);
    expect(next.scale).toBe(0.8);
    expect(next.y).toBe(INITIAL_CALIBRATION.y);
  });

  it('prefills can change modelId', () => {
    const next = calibrationReducer(INITIAL_CALIBRATION, {
      type: 'prefill',
      partial: { modelId: 'quaternius-5spoke' },
    });
    expect(next.modelId).toBe('quaternius-5spoke');
  });

  it('autoCalibrate sets x/y/scale and preserves finish + pitch/yaw/roll', () => {
    const start = { ...INITIAL_CALIBRATION, pitch: 12, yaw: -7, finish: 'silver' as const };
    const next = calibrationReducer(start, {
      type: 'autoCalibrate',
      x: 0.4,
      y: -0.2,
      scale: 1.1,
      confidence: 0.87,
    });
    expect(next.x).toBe(0.4);
    expect(next.y).toBe(-0.2);
    expect(next.scale).toBe(1.1);
    expect(next.pitch).toBe(12);
    expect(next.yaw).toBe(-7);
    expect(next.finish).toBe('silver');
  });

  it('default calibration has a valid modelId', () => {
    expect(INITIAL_CALIBRATION.modelId).toBeTruthy();
  });
});
