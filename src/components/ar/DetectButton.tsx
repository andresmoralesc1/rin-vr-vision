'use client';
import dynamic from 'next/dynamic';
import { useState, type RefObject } from 'react';

// Lazy-load: the panel pulls in MediaPipe (~9 MB WASM + tflite). Only
// fetch when the user actually presses the button.
const WheelDetectorPanel = dynamic(() => import('./WheelDetectorPanel'), {
  ssr: false,
  loading: () => null,
});

type Props = { videoRef: RefObject<HTMLVideoElement | null> };

export function DetectButton({ videoRef }: Props) {
  const [active, setActive] = useState(false);
  return (
    <>
      <button
        onClick={() => setActive((a) => !a)}
        aria-pressed={active}
        aria-label="Detectar rueda automáticamente"
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          active
            ? 'bg-accent-warning text-black'
            : 'bg-white/10 text-text-primary hover:bg-white/20'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
        </svg>
        {active ? 'Deteniendo…' : 'Auto'}
      </button>
      {active && (
        <WheelDetectorPanel
          videoRef={videoRef}
          onAccepted={() => setActive(false)}
        />
      )}
    </>
  );
}
