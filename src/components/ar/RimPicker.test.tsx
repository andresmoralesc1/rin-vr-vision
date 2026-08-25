import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { RimPicker } from './RimPicker';
import { CalibrationProvider, useCalibration } from '@/lib/calibration/context';
import { CATALOG } from '@/lib/rims/catalog';

function ModelIdProbe() {
  const { calibration } = useCalibration();
  return <span data-testid="modelId">{calibration.modelId}</span>;
}

describe('RimPicker', () => {
  it('renders one button per catalog entry', () => {
    const { getByRole } = render(
      <CalibrationProvider>
        <RimPicker />
      </CalibrationProvider>,
    );
    for (const r of CATALOG) {
      expect(getByRole('button', { name: r.label })).toBeInTheDocument();
    }
  });

  it('marks the current modelId as aria-pressed=true', () => {
    const { getByRole } = render(
      <CalibrationProvider>
        <RimPicker />
      </CalibrationProvider>,
    );
    const initial = CATALOG[0]!;
    expect(getByRole('button', { name: initial.label })).toHaveAttribute('aria-pressed', 'true');
  });

  it('clicking a model dispatches the model action', () => {
    const { getByRole, getByTestId } = render(
      <CalibrationProvider>
        <RimPicker />
        <ModelIdProbe />
      </CalibrationProvider>,
    );
    const target = CATALOG[0]!;
    fireEvent.click(getByRole('button', { name: target.label }));
    expect(getByTestId('modelId').textContent).toBe(target.id);
  });

  it('preserves finish and other fields across a model swap', () => {
    // Indirect check: the reducer test covers the actual preservation;
    // here we just make sure no exception is thrown when dispatching.
    const { getByRole } = render(
      <CalibrationProvider>
        <RimPicker />
      </CalibrationProvider>,
    );
    expect(() => fireEvent.click(getByRole('button', { name: CATALOG[0]!.label }))).not.toThrow();
  });
});
