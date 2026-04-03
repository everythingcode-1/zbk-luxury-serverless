import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const ALLOWED_HOSTS = new Set([
  'elfsightcdn.com',
  'universe-static.elfsightcdn.com',
  'phosphor.utils.elfsightcdn.com',
  'static.elfsight.com',
  'storage.elfsight.com',
  'service-reviews-ultimate.elfsight.com',
  'core.service.elfsight.com',
]);

function buildCacheControl() {
  return 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ host: string; path: string[] }> }
) {
  const { host, path } = await params;

  if (!host || !ALLOWED_HOSTS.has(host)) {
    return new Response('Forbidden host', {
      status: 403,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }

  const pathname = Array.isArray(path) ? path.join('/') : String(path ?? '');
  const upstreamUrl = `https://${host}/${pathname}${req.nextUrl.search}`;

  const upstreamRes = await fetch(upstreamUrl, {
    headers: {
      accept: req.headers.get('accept') ?? '*/*',
      'accept-language': req.headers.get('accept-language') ?? 'en-US,en;q=0.9',
      'user-agent': req.headers.get('user-agent') ?? 'Mozilla/5.0',
    },
    // Cache on the server side too (Next.js fetch cache)
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  const contentType = upstreamRes.headers.get('content-type') ?? undefined;

  const body = await upstreamRes.arrayBuffer();

  const headers = new Headers();
  if (contentType) headers.set('content-type', contentType);

  headers.set('Cache-Control', buildCacheControl());

  return new Response(body, {
    status: upstreamRes.status,
    headers,
  });
}
