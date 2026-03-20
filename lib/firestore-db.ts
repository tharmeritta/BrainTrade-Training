/**
 * Firestore data layer (server-side, Admin SDK).
 * Mirrors the gcs.ts API so every route can swap the import with no other changes.
 *
 * Data model: each "collection" becomes a top-level Firestore collection.
 * Documents keyed by auto-generated UUID (fsAdd) or a caller-supplied key (fsSet / fsGet / fsDelete).
 */

import { getAdminDb } from '@/lib/firebase-admin';

// ── Add (auto-id) ──────────────────────────────────────────────────────────

export async function fsAdd<T extends object>(
  collection: string,
  data: T
): Promise<T & { id: string; timestamp: string }> {
  const db        = getAdminDb();
  const id        = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const record    = { id, timestamp, ...data };
  await db.collection(collection).doc(id).set(record);
  return record;
}

// ── Get all docs in a collection ───────────────────────────────────────────

export async function fsGetAll<T>(collection: string): Promise<T[]> {
  const db      = getAdminDb();
  const snap    = await db.collection(collection).get();
  return snap.docs.map(d => d.data() as T);
}

// ── Get a single doc by key ────────────────────────────────────────────────

export async function fsGet<T>(collection: string, id: string): Promise<T | null> {
  const db   = getAdminDb();
  const snap = await db.collection(collection).doc(id).get();
  return snap.exists ? (snap.data() as T) : null;
}

// ── Partial update (patch) ─────────────────────────────────────────────────

export async function fsUpdate<T extends object>(
  collection: string,
  id: string,
  patch: Partial<T>
): Promise<void> {
  const db = getAdminDb();
  await db.collection(collection).doc(id).update(patch as Record<string, unknown>);
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function fsDelete(collection: string, id: string): Promise<void> {
  try {
    const db = getAdminDb();
    await db.collection(collection).doc(id).delete();
  } catch {
    // Ignore — document may not exist
  }
}

// ── Upsert by deterministic key ────────────────────────────────────────────

export async function fsSet<T extends object>(
  collection: string,
  key: string,
  data: T
): Promise<T & { updatedAt: string }> {
  const db        = getAdminDb();
  const updatedAt = new Date().toISOString();
  const record    = { ...data, updatedAt };
  await db.collection(collection).doc(key).set(record);
  return record;
}
