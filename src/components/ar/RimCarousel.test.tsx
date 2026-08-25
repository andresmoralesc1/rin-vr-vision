import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { RimCarousel } from './RimCarousel';
import { CalibrationProvider, useCalibration } from '@/lib/calibration/context';

function renderCarousel() {
  return render(
    <CalibrationProvider>
      <RimCarousel />
    </CalibrationProvider>,
  );
}

function FinishProbe() {
  const { calibration } = useCalibration();
  return <span data-testid="finish">{calibration.finish}</span>;
}

describe('RimCarousel', () => {
  it('renders 3 finish buttons with aria labels', () => {
    const { getByRole } = renderCarousel();
    expect(getByRole('button', { name: 'Chrome' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Negro mate' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Plata' })).toBeInTheDocument();
  });

  it('marks the current finish as aria-pressed=true and others false', () => {
    const { getByRole } = renderCarousel();
    expect(getByRole('button', { name: 'Chrome' })).toHaveAttribute('aria-pressed', 'true');
    expect(getByRole('button', { name: 'Negro mate' })).toHaveAttribute('aria-pressed', 'false');
    expect(getByRole('button', { name: 'Plata' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking a finish button dispatches the finish action', () => {
    const { getByRole, getByTestId } = render(
      <CalibrationProvider>
        <RimCarousel />
        <FinishProbe />
      </CalibrationProvider>,
    );
    expect(getByTestId('finish').textContent).toBe('chrome');
    fireEvent.click(getByRole('button', { name: 'Plata' }));
    expect(getByTestId('finish').textContent).toBe('silver');
    fireEvent.click(getByRole('button', { name: 'Negro mate' }));
    expect(getByTestId('finish').textContent).toBe('matte-black');
  });
});
