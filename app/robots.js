import { siteUrl } from '@/lib/utils';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: siteUrl() + '/sitemap.xml',
    host: siteUrl(),
  };
}
