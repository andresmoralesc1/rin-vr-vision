import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';

describe('sitemap export', () => {
  it('lists the four public routes under the prod domain', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url).sort();
    expect(urls).toEqual([
      'https://rin.andresmorales.com.co/',
      'https://rin.andresmorales.com.co/app',
      'https://rin.andresmorales.com.co/contacto',
      'https://rin.andresmorales.com.co/nosotros',
    ]);
  });

  it('every entry has a lastModified Date', () => {
    const entries = sitemap();
    for (const e of entries) {
      expect(e.lastModified).toBeInstanceOf(Date);
    }
  });

  it('landing has highest priority', () => {
    const entries = sitemap();
    const landing = entries.find((e) => e.url.endsWith('/'));
    expect(landing?.priority).toBe(1);
    expect(landing?.changeFrequency).toBe('weekly');
  });
});
