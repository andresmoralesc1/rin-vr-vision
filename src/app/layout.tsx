import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Rin VR Vision · Probá rines en AR',
    template: '%s',
  },
  description: 'Visualizá acabados de rines (chrome, negro mate, plata) sobre tu auto en realidad aumentada. Sin descargas.',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Rin VR Vision',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">{children}</body>
    </html>
  );
}
