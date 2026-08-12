import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/slide?page=<n>
 *
 * Returns a fallback SVG slide placeholder for modules managed via Firebase Storage.
 * Presentation slide decks are uploaded and managed in Firebase Storage via Admin > Adjustments > Learn Editor.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = searchParams.get('page') || '1';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" fill="none">
    <rect width="1280" height="720" fill="#0f172a"/>
    <rect x="40" y="40" width="1200" height="640" rx="24" stroke="#334155" stroke-width="4"/>
    <text x="640" y="340" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="44" font-weight="900" text-anchor="middle">BrainTrade Training — Slide #${page}</text>
    <text x="640" y="410" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="20" font-weight="600" text-anchor="middle">Upload slide decks in Admin &gt; Adjustments &gt; Learn Editor</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
