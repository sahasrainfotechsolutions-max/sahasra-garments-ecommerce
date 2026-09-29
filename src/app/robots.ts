import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://sahasrafashion.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/account/*', '/api/*'],
      },
    ],
    sitemap: `${storeUrl}/sitemap.xml`,
  };
}
