import { MetadataRoute } from 'next';

const BASE_URL = 'https://roadmap.tools.startvest.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // AI-readable markdown version
    {
      url: `${BASE_URL}/.md`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];
}
