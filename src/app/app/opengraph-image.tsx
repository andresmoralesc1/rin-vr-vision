import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Rin VR Vision — Apuntá la cámara y elegí tu próximo rin.';

export default async function AppOgImage() {
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
        <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 16 }}>
          Probador AR
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#9ca3af',
            maxWidth: 900,
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          Apuntá la cámara y elegí tu próximo rin.
        </div>
      </div>
    ),
    { ...size },
  );
}
