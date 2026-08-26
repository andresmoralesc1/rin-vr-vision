import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CalibrationProvider } from '@/lib/calibration/context';

export const metadata: Metadata = {
  title: 'Rin VR Vision · Probador AR de rines',
  description:
    'Apuntá la cámara a tu auto, elegí entre varios rines y previsualizá el acabado en realidad aumentada. Sin descargas.',
  openGraph: {
    title: 'Rin VR Vision · Probador AR de rines',
    description: 'Apuntá la cámara y elegí tu próximo rin.',
    type: 'website',
    locale: 'es_CO',
    url: 'https://rin.andresmorales.com.co/app',
    siteName: 'Rin VR Vision',
  },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return <CalibrationProvider>{children}</CalibrationProvider>;
}
