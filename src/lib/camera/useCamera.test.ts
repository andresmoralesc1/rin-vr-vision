import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCamera } from './useCamera';

const mockStream = { getTracks: () => [] } as unknown as MediaStream;

beforeEach(() => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn() },
    writable: true,
    configurable: true,
  });
});

describe('useCamera', () => {
  it('starts at idle', () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current.status).toBe('idle');
  });

  it('transitions to granted on success', async () => {
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream);
    const { result } = renderHook(() => useCamera());
    await act(async () => { await result.current.request(); });
    expect(result.current.status).toBe('granted');
    expect(result.current.stream).toBe(mockStream);
  });

  it('transitions to denied on error', async () => {
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('denied'));
    const { result } = renderHook(() => useCamera());
    await act(async () => { await result.current.request(); });
    expect(result.current.status).toBe('denied');
    expect(result.current.error?.message).toBe('denied');
  });
});