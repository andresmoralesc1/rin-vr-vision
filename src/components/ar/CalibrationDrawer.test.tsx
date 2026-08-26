import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CalibrationDrawer } from './CalibrationDrawer';
import { CalibrationProvider } from '@/lib/calibration/context';

function renderDrawer(props: Partial<React.ComponentProps<typeof CalibrationDrawer>> = {}) {
  return render(
    <CalibrationProvider>
      <CalibrationDrawer open={true} onClose={() => {}} {...props} />
    </CalibrationProvider>,
  );
}

describe('CalibrationDrawer', () => {
  it('renders 6 sliders for all calibration fields when open', () => {
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
    const { getByLabelText } = renderDrawer();
    const x = getByLabelText('X') as HTMLInputElement;
    fireEvent.change(x, { target: { value: '0.5' } });
    expect(x.value).toBe('0.5');
  });

  it('marks the dialog as aria-hidden=false when open', () => {
    const { getByRole } = renderDrawer({ open: true });
    expect(getByRole('dialog')).toHaveAttribute('aria-hidden', 'false');
  });

  it('marks the dialog as aria-hidden=true when closed', () => {
    // Use queryByRole + container query because aria-hidden removes the
    // dialog from the accessibility tree, so getByRole would throw.
    const { queryByRole, container } = renderDrawer({ open: false });
    const dialog = queryByRole('dialog') ?? container.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onClose when the Listo button is clicked', () => {
    const onClose = vi.fn();
    const { getByRole } = renderDrawer({ onClose });
    fireEvent.click(getByRole('button', { name: 'Listo' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    const { getByLabelText } = renderDrawer({ onClose });
    fireEvent.click(getByLabelText('Cerrar ajustes'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focuses the first slider (X) when opened', () => {
    const { getByLabelText } = renderDrawer({ open: true });
    expect(getByLabelText('X')).toHaveFocus();
  });

  it('does not steal focus when closed', () => {
    renderDrawer({ open: false });
    // No input should be focused; jsdom leaves focus on body by default.
    expect(document.activeElement?.tagName).not.toBe('INPUT');
  });
});
