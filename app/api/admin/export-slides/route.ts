import { NextRequest, NextResponse } from 'next/server';
import { inflateRawSync } from 'zlib';
import { requireAdmin } from '@/lib/session';
import { getAdminDb, getAdminStorage } from '@/lib/firebase-admin';
import { COURSE_MODULES, type CourseLang } from '@/lib/courses';

export const maxDuration = 120;

// ── Minimal ZIP reader (no external deps) ────────────────────────────────────
// Parses the ZIP central directory to reliably locate and decompress PNG entries.

// Remove ZipEntry and extractPngsFromZip as we will fetch PNGs individually

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { moduleId, lang } = await req.json() as { moduleId: string; lang: CourseLang };
  if (!moduleId || !lang) {
    return NextResponse.json({ error: 'moduleId and lang required' }, { status: 400 });
  }

  const db = getAdminDb();

  let modules: any = null;
  try {
    const doc = await db.collection('module_config').doc('learn').get();
    if (doc.exists) modules = doc.data()?.modules ?? null;
  } catch {}

  const mod = modules?.[moduleId] ?? COURSE_MODULES[moduleId];
  if (!mod) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

  const { presentationId, totalSlides } = mod.presentations[lang] as { presentationId: string; totalSlides: number };
  console.log(`[ExportSlides] Starting export for ${moduleId} (${lang}). ID: ${presentationId}, totalSlides: ${totalSlides}`);
  
  if (!presentationId) return NextResponse.json({ error: 'No presentation ID configured' }, { status: 400 });
  if (!totalSlides) return NextResponse.json({ error: 'Total slides count not configured' }, { status: 400 });

  // 1. Try to auto-detect slide IDs from the public presentation HTML
  let discoveredIds: string[] = [];
  try {
    console.log(`[ExportSlides] Attempting to auto-detect slide IDs for ${presentationId}...`);
    const htmlRes = await fetch(`https://docs.google.com/presentation/d/${presentationId}/embed`, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      // Look for the docData pattern: ["id", index, "", [], [], [], [], [[], false, 1000]]
      const regex = /\["([a-zA-Z0-9_-]+)",\d+,"",\[\],\[\],\[\],\[\],\[\[\],false,1000\]/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        discoveredIds.push(match[1]);
      }
      console.log(`[ExportSlides] Detected ${discoveredIds.length} slide IDs: ${discoveredIds.slice(0, 3).join(', ')}...`);
    }
  } catch (err) {
    console.warn(`[ExportSlides] Auto-detection failed:`, err);
  }

  // If auto-detection found the right number (or any), use them. Otherwise fall back to p1, p2...
  const finalIds: string[] = discoveredIds.length >= totalSlides 
    ? discoveredIds.slice(0, totalSlides) 
    : Array.from({ length: totalSlides }, (_, i) => `p${i + 1}`);

  if (discoveredIds.length > 0 && discoveredIds.length < totalSlides) {
    console.warn(`[ExportSlides] Only detected ${discoveredIds.length} IDs but expected ${totalSlides}. Falling back to p1...`);
  }

  // Fetch each slide individually as a PNG (ZIP export is unsupported for public Slides)
  const bucket = getAdminStorage();
  const slideUrls: string[] = [];

  for (let i = 0; i < totalSlides; i++) {
    const pageId = finalIds[i];
    const displayIndex = i + 1;
    const pngUrl = `https://docs.google.com/presentation/d/${presentationId}/export/png?pageid=${pageId}`;
    console.log(`[ExportSlides] Fetching slide ${displayIndex}/${totalSlides} (ID: ${pageId}): ${pngUrl}`);
    const pngRes = await fetch(pngUrl, { cache: 'no-store' });

    if (!pngRes.ok) {
      console.error(`[ExportSlides] Failed to fetch slide ${displayIndex} (ID: ${pageId}): HTTP ${pngRes.status}`);
      return NextResponse.json({
        error: `Failed to fetch slide ${displayIndex} (ID: ${pageId}): HTTP ${pngRes.status}. Check presentation sharing settings and slide count.`,
      }, { status: 502 });
    }

    const pngBuffer = Buffer.from(await pngRes.arrayBuffer());
    const filePath = `slides/${moduleId}/${lang}/${displayIndex}.png`;
    const file = bucket.file(filePath);
    await file.save(pngBuffer, { contentType: 'image/png', resumable: false });
    await file.makePublic();
    slideUrls.push(`https://storage.googleapis.com/${bucket.name}/${filePath}`);
    console.log(`[ExportSlides] Saved slide ${displayIndex} to storage.`);
  }

  // Persist storage URLs to Firestore
  const updatedMod = {
    ...mod,
    presentations: {
      ...mod.presentations,
      [lang]: { ...mod.presentations[lang], slideUrls },
    },
  };

  await db.collection('module_config').doc('learn').set(
    { modules: { ...(modules ?? {}), [moduleId]: updatedMod } },
    { merge: true }
  );

  return NextResponse.json({ success: true, count: slideUrls.length, slideUrls });
}
