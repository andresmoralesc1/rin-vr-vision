import type { ReactNode } from 'react';
import { CalibrationProvider } from '@/lib/calibration/context';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <CalibrationProvider>{children}</CalibrationProvider>;
}
