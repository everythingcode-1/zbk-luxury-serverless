import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zbktransportservices.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/*.json',
          '/api/blog/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/test-auth',
          '/test-login',
          '/admin-test',
          '/admin-simple',
          '/admin-direct',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
