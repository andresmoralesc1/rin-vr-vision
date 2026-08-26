import type { MetadataRoute } from 'next';

const BASE = 'https://rin.andresmorales.com.co';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/app`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/nosotros`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
