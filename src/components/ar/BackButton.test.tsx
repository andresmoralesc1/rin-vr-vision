import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BackButton } from './BackButton';

describe('BackButton', () => {
  it('renders a link to the landing page with an accessible label', () => {
    const { getByRole } = render(<BackButton />);
    const link = getByRole('link', { name: 'Volver al inicio' });
    expect(link).toHaveAttribute('href', '/');
  });
});