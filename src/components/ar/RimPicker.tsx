'use client';
import { useCalibration } from '@/lib/calibration/context';
import { CATALOG } from '@/lib/rims/catalog';

/**
 * Renders one button per catalog entry. Sits inside the bottom-sheet
 * wrapper in CameraStage — positioning is owned by the parent so we
 * don't fight for the same z-stack as the rest of the chrome.
 */
export function RimPicker() {
  const { calibration, dispatch } = useCalibration();
  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label="Elegir rin">
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
