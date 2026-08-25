'use client';
import { useCalibration } from '@/lib/calibration/context';
import type { Finish } from '@/lib/three/materials';

const FINISHES: { key: Finish; label: string; color: string }[] = [
  { key: 'chrome', label: 'Chrome', color: 'bg-gray-300' },
  { key: 'matte-black', label: 'Negro mate', color: 'bg-gray-800' },
  { key: 'silver', label: 'Plata', color: 'bg-gray-400' },
];

/**
 * Render selector for the 3 PBR finishes. Sits inside the bottom-sheet
 * wrapper in CameraStage — positioning is owned by the parent.
 */
export function RimCarousel() {
  const { calibration, dispatch } = useCalibration();
  return (
    <div className="flex justify-center gap-2" role="radiogroup" aria-label="Acabado">
      {FINISHES.map((f) => (
        <button
          key={f.key}
          onClick={() => dispatch({ type: 'finish', value: f.key })}
          aria-label={f.label}
          aria-pressed={calibration.finish === f.key}
          className={`size-10 rounded-full ${f.color} ${
            calibration.finish === f.key ? 'ring-2 ring-accent-primary' : ''
          }`}
        />
      ))}
    </div>
  );
}
