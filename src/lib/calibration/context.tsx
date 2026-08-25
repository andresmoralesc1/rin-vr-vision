'use client';
import { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
  calibrationReducer,
  INITIAL_CALIBRATION,
  type Calibration,
  type CalibrationAction,
} from './reducer';

type Ctx = { calibration: Calibration; dispatch: React.Dispatch<CalibrationAction> };
const CalibrationCtx = createContext<Ctx | null>(null);

export function CalibrationProvider({ children }: { children: React.ReactNode }) {
  const [calibration, dispatch] = useReducer(calibrationReducer, INITIAL_CALIBRATION);
  return <CalibrationCtx.Provider value={{ calibration, dispatch }}>{children}</CalibrationCtx.Provider>;
}

export function useCalibration() {
  const ctx = useContext(CalibrationCtx);
  if (!ctx) throw new Error('useCalibration must be used within CalibrationProvider');
  return ctx;
}
