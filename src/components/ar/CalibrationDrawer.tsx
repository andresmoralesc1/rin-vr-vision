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

export function CalibrationDrawer() {
  const { calibration, dispatch } = useCalibration();
  return (
    <div className="absolute right-4 top-4 z-20 w-72 space-y-3 rounded-lg border border-white/10 bg-bg-surface/90 p-4 backdrop-blur">
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
      <button
        onClick={() => dispatch({ type: 'reset' })}
        className="w-full rounded border border-white/20 bg-bg-primary py-2 text-sm"
      >
        Resetear
      </button>
    </div>
  );
}
