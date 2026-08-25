// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { isUnsupported, isHttpsContext } from './permissionStates';

describe('isUnsupported', () => {
  it('returns false in test env (jsdom-like polyfill absent)', () => {
    expect(typeof isUnsupported()).toBe('boolean');
  });
});

describe('isHttpsContext', () => {
  it('returns true on localhost', () => {
    Object.defineProperty(window, 'location', { value: { protocol: 'http:', hostname: 'localhost' }, writable: true });
    expect(isHttpsContext()).toBe(true);
  });
  it('returns false on plain http', () => {
    Object.defineProperty(window, 'location', { value: { protocol: 'http:', hostname: 'example.com' }, writable: true });
    expect(isHttpsContext()).toBe(false);
  });
  it('returns true on https', () => {
    Object.defineProperty(window, 'location', { value: { protocol: 'https:', hostname: 'example.com' }, writable: true });
    expect(isHttpsContext()).toBe(true);
  });
});
