'use client';
import { useCamera } from '@/lib/camera/useCamera';
import { useCalibration } from '@/lib/calibration/context';

export function CameraStage() {
  const { status, stream, error, request } = useCamera();
  const { calibration } = useCalibration();

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {stream && (
        <video
          ref={(el) => { if (el && stream) el.srcObject = stream; }}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {status === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={request} className="bg-accent-primary px-6 py-3 rounded-md font-semibold">
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
          <p className="text-text-muted text-sm">Reactivá el permiso en los ajustes del navegador y reintentá.</p>
          {error && <p className="text-xs text-accent-danger">{error.message}</p>}
          <button onClick={request} className="bg-accent-primary px-6 py-3 rounded-md font-semibold">
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
        <div className="absolute bottom-4 left-4 right-4 bg-bg-surface/80 backdrop-blur p-2 rounded text-xs">
          pos: ({calibration.x.toFixed(2)}, {calibration.y.toFixed(2)}) · scale: {calibration.scale.toFixed(2)} · finish: {calibration.finish}
        </div>
      )}
    </div>
  );
}