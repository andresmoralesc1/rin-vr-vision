import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import ErrorBoundary from './error';

function Bomb(): JSX.Element {
  throw new Error('boom-from-child');
}

describe('/app error boundary', () => {
  it('renders fallback UI when a child throws', () => {
    // Silence React's expected error log during the throw.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { getByRole, getByText } = render(
      <ErrorBoundary error={new Error('boom')} reset={() => {}}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(getByRole('alert')).toBeInTheDocument();
    expect(getByText(/Algo explot/i)).toBeInTheDocument();
  });

  it('renders Reintentar and Ir al inicio buttons', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();
    const { getByRole } = render(
      <ErrorBoundary error={new Error('boom')} reset={reset}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/');
  });

  it('Reintentar calls reset()', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();
    const { getByRole } = render(
      <ErrorBoundary error={new Error('boom')} reset={reset}>
        <Bomb />
      </ErrorBoundary>,
    );
    fireEvent.click(getByRole('button', { name: 'Reintentar' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
