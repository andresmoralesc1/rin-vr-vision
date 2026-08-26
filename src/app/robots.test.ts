import { describe, it, expect } from 'vitest';
import robots from './robots';

describe('robots.txt export', () => {
  it('allows all user agents on all paths', () => {
    const r = robots();
    expect(r.rules).toEqual({ userAgent: '*', allow: '/' });
  });

  it('points to the prod sitemap', () => {
    const r = robots();
    expect(r.sitemap).toBe('https://rin.andresmorales.com.co/sitemap.xml');
  });
});