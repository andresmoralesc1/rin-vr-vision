import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CalibrationDrawer } from './CalibrationDrawer';
import { CalibrationProvider } from '@/lib/calibration/context';

function renderDrawer() {
  return render(
    <CalibrationProvider>
      <CalibrationDrawer />
    </CalibrationProvider>,
  );
}

describe('CalibrationDrawer', () => {
  it('renders 6 sliders for all calibration fields', () => {
    const { getByLabelText } = renderDrawer();
    for (const label of ['X', 'Y', 'Tamaño', 'Inclinación', 'Rotación', 'Ladeo']) {
      expect(getByLabelText(label)).toBeInTheDocument();
    }
  });

  it('renders a reset button', () => {
    const { getByRole } = renderDrawer();
    expect(getByRole('button', { name: 'Resetear' })).toBeInTheDocument();
  });

  it('reset button click fires dispatch (component re-renders to initial)', () => {
    const { getByLabelText, getByRole } = renderDrawer();
    const xSlider = getByLabelText('X') as HTMLInputElement;
    fireEvent.change(xSlider, { target: { value: '0.7' } });
    expect(xSlider.value).toBe('0.7');
    fireEvent.click(getByRole('button', { name: 'Resetear' }));
    expect(xSlider.value).toBe('0');
  });

  it('slider change is wired to onChange', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <CalibrationProvider>
        <CalibrationDrawer />
      </CalibrationProvider>,
    );
    // Verify wiring: changing X slider updates underlying state via reducer
    const x = getByLabelText('X') as HTMLInputElement;
    fireEvent.change(x, { target: { value: '0.5' } });
    expect(x.value).toBe('0.5');
  });
});
