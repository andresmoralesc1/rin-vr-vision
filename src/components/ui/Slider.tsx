'use client';
import type { Ref } from 'react';
type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  inputRef?: Ref<HTMLInputElement>;
};
export function Slider({ label, value, min, max, step, onChange, inputRef }: Props) {
  return (
    <label className="block">
      <span className="text-xs text-text-muted">{label}</span>
      <input
        ref={inputRef}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-accent-primary"
      />
      <span className="text-xs">{value.toFixed(step >= 1 ? 0 : 2)}</span>
    </label>
  );
}
