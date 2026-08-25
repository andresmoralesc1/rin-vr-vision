import { describe, it, expect } from 'vitest';
import { CATALOG, getRim, type RimModelId } from './catalog';

describe('catalog', () => {
  it('returns the matching rim from getRim', () => {
    const r = getRim('quaternius-5spoke');
    expect(r.id).toBe('quaternius-5spoke');
    expect(r.label).toBeTruthy();
    expect(r.glbUrl).toMatch(/^\/models\//);
  });

  it('falls back to the first entry on unknown id', () => {
    const r = getRim('does-not-exist');
    expect(r.id).toBe(CATALOG[0]!.id);
  });

  it('has unique ids and glbUrls across the catalog', () => {
    const ids = new Set<string>();
    const urls = new Set<string>();
    for (const r of CATALOG) {
      expect(ids.has(r.id)).toBe(false);
      expect(urls.has(r.glbUrl)).toBe(false);
      ids.add(r.id);
      urls.add(r.glbUrl);
    }
  });

  it('exposes a typed RimModelId union', () => {
    // Compile-time check that CATALOG[0].id is assignable to RimModelId.
    const id: RimModelId = CATALOG[0]!.id;
    expect(typeof id).toBe('string');
  });
});
