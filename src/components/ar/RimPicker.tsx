'use client';
import { useCalibration } from '@/lib/calibration/context';
import { CATALOG } from '@/lib/rims/catalog';

export function RimPicker() {
  const { calibration, dispatch } = useCalibration();
  return (
    <div
      className="absolute bottom-32 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-bg-surface/90 p-2 backdrop-blur"
      aria-label="Elegir rin"
    >
      {CATALOG.map((r) => {
        const active = calibration.modelId === r.id;
        return (
          <button
            key={r.id}
            onClick={() => dispatch({ type: 'model', value: r.id })}
            aria-label={r.label}
            aria-pressed={active}
            data-style={r.style}
            className={`min-w-20 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
              active
                ? 'bg-accent-primary text-white ring-2 ring-accent-primary'
                : 'bg-white/5 text-text-primary hover:bg-white/10'
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
