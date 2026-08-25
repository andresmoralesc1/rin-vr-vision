'use client';
import { useRef } from 'react';
import { useCamera } from '@/lib/camera/useCamera';
import { isHttpsContext } from '@/lib/camera/permissionStates';
import { useCalibration } from '@/lib/calibration/context';
import { CalibrationDrawer } from '@/components/ar/CalibrationDrawer';
import { DetectButton } from '@/components/ar/DetectButton';
import { GestureCanvas } from '@/components/ar/GestureCanvas';
import { RimCarousel } from '@/components/ar/RimCarousel';
import { RimPicker } from '@/components/ar/RimPicker';

export function CameraStage({ children }: { children?: React.ReactNode }) {
  const { status, stream, error, request } = useCamera();
  const { calibration } = useCalibration();
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
          <GestureCanvas />
          {children}
          <CalibrationDrawer />
          <DetectButton videoRef={videoRef} />
          <RimPicker />
          <RimCarousel />
          <div className="absolute inset-x-4 bottom-4 rounded bg-bg-surface/80 p-2 text-xs backdrop-blur">
            pos: ({calibration.x.toFixed(2)}, {calibration.y.toFixed(2)}) · scale: {calibration.scale.toFixed(2)} · finish: {calibration.finish} · model: {calibration.modelId}
          </div>
        </>
      )}
    </div>
  );
}
