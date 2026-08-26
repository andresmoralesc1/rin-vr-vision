import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders a <button> by default', () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('renders a <a> via next/link when href is provided', () => {
    render(<Button href="/app">Probar AR</Button>);
    const link = screen.getByRole('link', { name: 'Probar AR' });
    expect(link).toHaveAttribute('href', '/app');
  });

  it('applies variant + size classes', () => {
    const { container } = render(
      <Button size="hero" variant="secondary">
        Demo
      </Button>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/rounded-xl/);
    expect(el.className).toMatch(/bg-white\/5/);
  });

  it('forwards className so consumers can add layout overrides', () => {
    render(
      <Button className="hidden px-4 md:inline-block">
        Probar
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Probar' });
    expect(btn.className).toMatch(/hidden/);
    expect(btn.className).toMatch(/md:inline-block/);
  });

  it('uses type="submit" when overridden', () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'submit');
  });
});
