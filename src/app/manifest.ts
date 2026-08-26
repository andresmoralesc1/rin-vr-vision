import type { MetadataRoute } from 'next';
import { tokens } from '@/lib/design-tokens';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rin VR Vision',
    short_name: 'Rin VR',
    description: 'Probá rines en AR desde tu celular.',
    theme_color: tokens.colors.accent.primary,
    background_color: tokens.colors.bg.primary,
    display: 'standalone',
    icons: [
      { src: '/icon', sizes: 'any', type: 'image/png', purpose: 'any' },
    ],
  };
}