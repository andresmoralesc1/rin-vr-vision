import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('searchWheels', () => {
  beforeEach(() => {
    process.env.PEXELS_API_KEY = 'test-key';
    vi.resetAllMocks();
  });

  it('returns photos from Pexels API', async () => {
    const mockPhotos = [{ id: 1, photographer: 'X', src: { large: 'y' }, alt: 'wheel' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ photos: mockPhotos, page: 1, per_page: 12, total_results: 1 }),
    }) as unknown as typeof fetch;

    const { searchWheels } = await import('./client');
    const result = await searchWheels('car wheel');
    expect(result).toEqual(mockPhotos);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('query=car%20wheel'),
      expect.objectContaining({ headers: { Authorization: 'test-key' } })
    );
  });

  it('throws if PEXELS_API_KEY missing', async () => {
    delete process.env.PEXELS_API_KEY;
    // @ts-expect-error query-string suffix forces fresh module instance (vitest)
    const { searchWheels } = await import('./client?missing');
    await expect(searchWheels('test')).rejects.toThrow('PEXELS_API_KEY');
  });

  it('throws on API error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    // @ts-expect-error query-string suffix forces fresh module instance (vitest)
    const { searchWheels } = await import('./client?error');
    await expect(searchWheels('test')).rejects.toThrow('500');
  });
});
