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
// In-memory cache for discovered Google Slides object IDs per presentation
const slideIdCache = new Map<string, string[]>();

async function getSlideIds(presentationId: string): Promise<string[]> {
  if (slideIdCache.has(presentationId)) {
    return slideIdCache.get(presentationId)!;
  }
  try {
    const htmlRes = await fetch(`https://docs.google.com/presentation/d/${presentationId}/embed`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      cache: 'force-cache',
    });
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const regex = /\["([a-zA-Z0-9_-]+)",\d+,"",\[\],\[\],\[\],\[\],\[\[\],false,1000\]/g;
      const discovered: string[] = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        discovered.push(match[1]);
      }
      if (discovered.length > 0) {
        slideIdCache.set(presentationId, discovered);
        return discovered;
      }
    }
  } catch (err) {
    console.warn(`[SlideProxy] Failed to auto-detect slide IDs for ${presentationId}:`, err);
  }
  return [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const page = searchParams.get('page');
  const v = searchParams.get('v'); // cache-bust key — consumed here, never sent to Google

  if (!id || !page) {
    return new NextResponse('Missing id or page', { status: 400 });
  }

  const pageNum = parseInt(page, 10);
  const slideIds = await getSlideIds(id);
  const targetPageId = (pageNum >= 1 && slideIds[pageNum - 1])
    ? slideIds[pageNum - 1]
    : `p${page}`;

  const googleUrl = `https://docs.google.com/presentation/d/${id}/export/png?pageid=${targetPageId}`;

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
