'use client';
import { Slider } from '@/components/ui/Slider';
import { useCalibration } from '@/lib/calibration/context';

const FIELDS = [
  { key: 'x', label: 'X', min: -1, max: 1, step: 0.01 },
  { key: 'y', label: 'Y', min: -1, max: 1, step: 0.01 },
  { key: 'scale', label: 'Tamaño', min: 0.2, max: 2, step: 0.01 },
  { key: 'pitch', label: 'Inclinación', min: -90, max: 90, step: 1 },
  { key: 'yaw', label: 'Rotación', min: -180, max: 180, step: 1 },
  { key: 'roll', label: 'Ladeo', min: -90, max: 90, step: 1 },
] as const;

type Props = { open: boolean; onClose: () => void };

export function CalibrationDrawer({ open, onClose }: Props) {
  const { calibration, dispatch } = useCalibration();
  return (
    <>
      {/* Backdrop — dismiss the sheet on tap */}
      <button
        type="button"
        aria-label="Cerrar ajustes"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        role="dialog"
        aria-label="Ajustes de calibración"
        aria-hidden={!open}
        className={`absolute inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md rounded-t-2xl border-t border-white/10 bg-bg-surface p-5 shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Calibración fina
        </h2>
        <div className="space-y-3">
          {FIELDS.map((f) => (
            <Slider
              key={f.key}
              label={f.label}
              value={calibration[f.key]}
              min={f.min}
              max={f.max}
              step={f.step}
              onChange={(v) => dispatch({ type: 'set', field: f.key, value: v })}
            />
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => dispatch({ type: 'reset' })}
            className="flex-1 rounded-lg border border-white/20 bg-bg-primary py-2 text-sm font-medium hover:bg-white/5"
          >
            Resetear
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-accent-primary py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Listo
          </button>
        </div>
      </div>
    </>
  );
}
