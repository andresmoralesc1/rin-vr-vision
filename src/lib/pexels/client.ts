import type { PexelsPhoto, PexelsSearchResponse } from './types';

const PEXELS_BASE = 'https://api.pexels.com/v1';

export async function searchWheels(query: string, perPage = 12): Promise<PexelsPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error('PEXELS_API_KEY not set');

  const url = `${PEXELS_BASE}/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    next: { revalidate: 3600 }, // 1h cache
  });
  if (!res.ok) throw new Error(`Pexels API ${res.status}`);
  const data = (await res.json()) as PexelsSearchResponse;
  return data.photos;
}
