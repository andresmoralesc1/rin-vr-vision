import { describe, it, expect } from 'vitest';
import { materialForFinish, makeChrome, makeMatteBlack, makeSilver } from './materials';

describe('materials', () => {
  it('makeChrome returns a metallic, low-roughness PBR material', () => {
    const m = makeChrome();
    expect(m.metalness).toBe(1.0);
    expect(m.roughness).toBeLessThan(0.1);
  });

  it('makeMatteBlack is high-roughness and not fully metallic', () => {
    const m = makeMatteBlack();
    expect(m.metalness).toBeLessThan(0.5);
    expect(m.roughness).toBeGreaterThan(0.5);
  });

  it('makeSilver is metallic and lower-roughness than matte black', () => {
    const m = makeSilver();
    expect(m.metalness).toBeGreaterThan(0.5);
    expect(m.roughness).toBeLessThan(makeMatteBlack().roughness);
  });

  it('the three finishes use distinct base colors', () => {
    // Locks visual identity — if any finish color is changed
    // accidentally, the carousel swatches and the rendered wheel will
    // diverge.
    const colors = new Set([
      makeChrome().color.getHexString(),
      makeMatteBlack().color.getHexString(),
      makeSilver().color.getHexString(),
    ]);
    expect(colors.size).toBe(3);
  });

  it('materialForFinish returns a material with the same PBR profile as the factory', () => {
    // materialForFinish returns a fresh instance per call (so the
    // R3F scene graph can own it independently), so we compare on
    // properties, not reference.
    const chrome = materialForFinish('chrome');
    const ref = makeChrome();
    expect(chrome.metalness).toBe(ref.metalness);
    expect(chrome.roughness).toBe(ref.roughness);
    expect(chrome.color.getHexString()).toBe(ref.color.getHexString());
  });

  it('materialForFinish produces distinct materials for each finish', () => {
    // Sanity check that the switch is wired for all three branches.
    expect(materialForFinish('chrome').metalness).not.toBe(materialForFinish('matte-black').metalness);
    expect(materialForFinish('chrome').color.getHexString()).not.toBe(materialForFinish('silver').color.getHexString());
  });
});
