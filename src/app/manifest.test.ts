import { describe, it, expect } from 'vitest';
import manifest from './manifest';

describe('manifest.webmanifest export', () => {
  it('declares name + short_name', () => {
    const m = manifest();
    expect(m.name).toBe('Rin VR Vision');
    expect(m.short_name).toBe('Rin VR');
  });

  it('uses Spanish description', () => {
    const m = manifest();
    expect(m.description).toMatch(/AR/);
  });

  it('renders standalone and references an icon', () => {
    const m = manifest();
    expect(m.display).toBe('standalone');
    expect(m.icons).toBeDefined();
    expect(m.icons!.length).toBeGreaterThan(0);
  });

  it('theme_color and background_color are 6-digit hex', () => {
    const m = manifest();
    expect(m.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(m.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});