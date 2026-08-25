'use client';
import { useCalibration } from '@/lib/calibration/context';
import type { Finish } from '@/lib/three/materials';

const FINISHES: { key: Finish; label: string; color: string }[] = [
  { key: 'chrome', label: 'Chrome', color: 'bg-gray-300' },
  { key: 'matte-black', label: 'Negro mate', color: 'bg-gray-800' },
  { key: 'silver', label: 'Plata', color: 'bg-gray-400' },
];

export function RimCarousel() {
  const { calibration, dispatch } = useCalibration();
  return (
    <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-bg-surface/90 p-2 backdrop-blur">
      {FINISHES.map((f) => (
        <button
          key={f.key}
          onClick={() => dispatch({ type: 'finish', value: f.key })}
          aria-label={f.label}
          aria-pressed={calibration.finish === f.key}
          className={`size-10 rounded-full ${f.color} ${calibration.finish === f.key ? 'ring-2 ring-accent-primary' : ''}`}
        />
      ))}
    </div>
  );
}
