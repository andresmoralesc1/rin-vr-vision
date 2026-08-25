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
    // Pair-wise color distinctness — guarantees visible material change on finish switch.
    // Substitutes for runtime browser verification (deferred to Piece 4 deploy smoke).
    expect(chrome.color.equals(matte.color)).toBe(false);
    expect(chrome.color.equals(silver.color)).toBe(false);
    expect(matte.color.equals(silver.color)).toBe(false);
  });
});