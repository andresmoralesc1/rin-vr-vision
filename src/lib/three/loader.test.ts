import { describe, it, expect } from 'vitest';
import { materialForFinish } from './materials';

describe('materialForFinish', () => {
  it('returns distinct materials per finish', () => {
    const chrome = materialForFinish('chrome');
    const matte = materialForFinish('matte-black');
    const silver = materialForFinish('silver');
    expect(chrome.metalness).toBe(1.0);
    expect(matte.roughness).toBeGreaterThan(0.5);
    expect(silver.metalness).toBeGreaterThan(0.5);
  });
});