'use client';
import { useRef, useState } from 'react';
import { useCamera } from '@/lib/camera/useCamera';
import { isHttpsContext } from '@/lib/camera/permissionStates';
import { CalibrationDrawer } from '@/components/ar/CalibrationDrawer';
import { GestureCanvas } from '@/components/ar/GestureCanvas';
import { GestureHints } from '@/components/ar/GestureHints';
import { RimCarousel } from '@/components/ar/RimCarousel';
import { RimPicker } from '@/components/ar/RimPicker';
import { TopBar } from '@/components/ar/TopBar';

export function CameraStage({ children }: { children?: React.ReactNode }) {
  const { status, stream, error, request } = useCamera();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {!isHttpsContext() && (
        <div className="bg-accent-warning sticky top-0 z-50 px-4 py-2 text-center text-sm text-black">
          Cámara requiere HTTPS. Abrí:{' '}
          <a href="https://rin.andresmorales.com.co/app" className="font-semibold underline">
            rin.andresmorales.com.co/app
          </a>
        </div>
      )}
      {stream && (
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el && stream) el.srcObject = stream;
          }}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 size-full object-cover"
        />
      )}

      {status === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={request} className="rounded-md bg-accent-primary px-6 py-3 font-semibold">
            Iniciar cámara
          </button>
        </div>
      )}

      {status === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
          Pidiendo permiso…
        </div>
      )}

      {status === 'denied' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-text-primary">Permiso de cámara denegado.</p>
          <p className="text-sm text-text-muted">Reactivá el permiso en los ajustes del navegador y reintentá.</p>
          {error && <p className="text-accent-danger text-xs">{error.message}</p>}
          <button onClick={request} className="rounded-md bg-accent-primary px-6 py-3 font-semibold">
            Reintentar
          </button>
        </div>
      )}

      {status === 'unsupported' && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <p className="text-text-primary">Tu navegador no soporta cámara. Probá Chrome o Safari.</p>
        </div>
      )}

      {status === 'granted' && (
        <>
          {/* Gesture layer sits above the video but below all UI controls. */}
          <GestureCanvas />
          {children}

          <TopBar videoRef={videoRef} onSettingsClick={() => setSettingsOpen(true)} />

          {/* Bottom sheet — model + finish in one rounded panel. */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 mx-auto flex max-w-md flex-col items-stretch gap-2 rounded-2xl border border-white/10 bg-bg-surface/90 p-2 shadow-2xl backdrop-blur">
            <div className="pointer-events-auto">
              <RimPicker />
            </div>
            <div className="mx-2 h-px bg-white/10" aria-hidden="true" />
            <div className="pointer-events-auto">
              <RimCarousel />
            </div>
          </div>

          <GestureHints />

          <CalibrationDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
      )}
    </div>
  );
}
