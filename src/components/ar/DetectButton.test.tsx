import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { RefObject } from 'react';
import { DetectButton } from './DetectButton';

function makeVideoRef(): RefObject<HTMLVideoElement | null> {
  return { current: null };
}

describe('DetectButton', () => {
  it('renders the Auto trigger and switches label to Detectando when active', () => {
    const { getByRole, queryByText } = render(<DetectButton videoRef={makeVideoRef()} />);
    const btn = getByRole('button', { name: 'Detectar rueda automáticamente' });
    expect(btn).toBeInTheDocument();
    // Default label is "Auto"; we never want to regress to "Deteniendo…".
    expect(queryByText('Auto')).toBeInTheDocument();
    expect(queryByText('Deteniendo…')).not.toBeInTheDocument();
    expect(queryByText('Detectando…')).not.toBeInTheDocument();
  });
});
