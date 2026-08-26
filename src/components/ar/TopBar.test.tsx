import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('renders a back link to the landing page', () => {
    const { getByLabelText } = render(<TopBar videoRef={{ current: null }} onSettingsClick={() => {}} settingsOpen={false} />);
    const link = getByLabelText('Volver al inicio');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders a settings button that fires onSettingsClick', () => {
    const onClick = vi.fn();
    const { getByLabelText } = render(<TopBar videoRef={{ current: null }} onSettingsClick={onClick} settingsOpen={false} />);
    fireEvent.click(getByLabelText('Ajustes de calibración'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the auto-detect trigger', () => {
    const { getByLabelText } = render(<TopBar videoRef={{ current: null }} onSettingsClick={() => {}} settingsOpen={false} />);
    expect(getByLabelText('Detectar rueda automáticamente')).toBeInTheDocument();
  });

  it('settings button reflects aria-expanded from settingsOpen prop', () => {
    const { getByLabelText } = render(
      <TopBar videoRef={{ current: null }} onSettingsClick={() => {}} settingsOpen={false} />,
    );
    expect(getByLabelText('Ajustes de calibración')).toHaveAttribute('aria-expanded', 'false');
  });

  it('settings button has aria-haspopup=dialog', () => {
    const { getByLabelText } = render(
      <TopBar videoRef={{ current: null }} onSettingsClick={() => {}} settingsOpen={false} />,
    );
    expect(getByLabelText('Ajustes de calibración')).toHaveAttribute('aria-haspopup', 'dialog');
  });
});
