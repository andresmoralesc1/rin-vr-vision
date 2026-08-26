import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { CalibrationProvider, useCalibration } from './context';

describe('useCalibration', () => {
  it('returns the default calibration state inside a provider', () => {
    const { result } = renderHook(() => useCalibration(), { wrapper: CalibrationProvider });
    expect(result.current.calibration.x).toBe(0);
    expect(result.current.calibration.scale).toBe(0.6);
    expect(result.current.calibration.finish).toBe('chrome');
    expect(result.current.calibration.modelId).toBeTruthy();
  });

  it('exposes a working dispatch', () => {
    const { result } = renderHook(() => useCalibration(), { wrapper: CalibrationProvider });
    act(() => {
      result.current.dispatch({ type: 'finish', value: 'silver' });
    });
    expect(result.current.calibration.finish).toBe('silver');
  });

  it('throws when used outside a CalibrationProvider', () => {
    // Suppress the React error boundary log — this throw is expected.
    const consoleErr = console.error;
    console.error = () => {};
    expect(() => renderHook(() => useCalibration())).toThrow(/CalibrationProvider/);
    console.error = consoleErr;
  });
});
