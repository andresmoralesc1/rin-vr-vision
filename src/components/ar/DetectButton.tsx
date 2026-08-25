'use client';
import dynamic from 'next/dynamic';
import { useState, type RefObject } from 'react';

// Lazy-load: the panel pulls in MediaPipe (~9 MB WASM + tflite). Only
// fetch when the user actually presses the button.
const WheelDetectorPanel = dynamic(() => import('./WheelDetectorPanel'), {
  ssr: false,
  loading: () => null,
});

type Props = { videoRef: RefObject<HTMLVideoElement> };

export function DetectButton({ videoRef }: Props) {
  const [active, setActive] = useState(false);
  return (
    <div className="absolute bottom-44 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-bg-surface/90 p-2 backdrop-blur">
      <button
        onClick={() => setActive((a) => !a)}
        aria-pressed={active}
        className={`min-w-32 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
          active
            ? 'bg-accent-warning text-black'
            : 'bg-accent-primary text-white hover:bg-blue-500'
        }`}
      >
        {active ? 'Deteniendo…' : 'Detectar automáticamente'}
      </button>
      {active && (
        <WheelDetectorPanel
          videoRef={videoRef}
          onAccepted={() => setActive(false)}
        />
      )}
    </div>
  );
}
