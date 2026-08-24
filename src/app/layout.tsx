import type { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata = { title: 'Rin VR Vision', description: 'WebAR rim visualizer' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
