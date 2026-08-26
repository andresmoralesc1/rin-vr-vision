import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GestureHints } from './GestureHints';

describe('GestureHints', () => {
  it('renders the three gesture labels', () => {
    const { getByText } = render(<GestureHints />);
    expect(getByText(/arrastrá/)).toBeInTheDocument();
    expect(getByText(/pellizcá/)).toBeInTheDocument();
    expect(getByText('girá')).toBeInTheDocument();
  });
});
