import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    'https://astrocv.com';

  const pages = [
    '',
    '/ai-resume-templates',
    '/privacy',
    '/terms',
    '/cookies',
  ];

  const now = new Date();

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.6,
  }));
}
