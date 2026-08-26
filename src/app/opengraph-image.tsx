import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Rin VR Vision — Probá rines en AR desde tu celular.';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#3B82F6',
            color: 'white',
            fontSize: 64,
            fontWeight: 700,
            borderRadius: 24,
            marginBottom: 32,
          }}
        >
          R
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>
          Rin VR Vision
        </div>
        <div style={{ fontSize: 32, color: '#9ca3af' }}>
          Probá rines en AR desde tu celular.
        </div>
      </div>
    ),
    { ...size },
  );
}
