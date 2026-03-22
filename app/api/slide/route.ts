import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/slide?id=<presentationId>&page=<n>&v=<cacheKey>
 *
 * Proxies a Google Slides PNG export so we can bust the browser cache
 * via the `v` query param without passing unknown params to Google
 * (which causes Google to reject the request).
 *
 * - Without `v`: response is cached by the browser for 1 hour.
 * - With `v`:    response is not cached (no-store), forcing a fresh fetch
 *                from Google every time until the cacheKey is removed.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const page = searchParams.get('page');
  const v = searchParams.get('v'); // cache-bust key — consumed here, never sent to Google

  if (!id || !page) {
    return new NextResponse('Missing id or page', { status: 400 });
  }

  const googleUrl = `https://docs.google.com/presentation/d/${id}/export/png?pageid=p${page}`;

  try {
    const upstream = await fetch(googleUrl, {
      // When cache-busting, bypass Next.js / CDN data cache on the server side too
      cache: v ? 'no-store' : 'force-cache',
    });

    if (!upstream.ok) {
      return new NextResponse('Upstream error', { status: upstream.status });
    }

    const buffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('content-type') ?? 'image/png';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        // With v: tell browser not to cache so next refresh with same v still hits server
        // Without v: cache for 1 hour in browser + CDN
        'Cache-Control': v ? 'no-store' : 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch slide', { status: 502 });
  }
}
