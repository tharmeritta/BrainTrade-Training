import { Storage } from '@google-cloud/storage';

// ── Client ────────────────────────────────────────────────────────────────

let _storage: Storage | null = null;

function getStorage(): Storage {
  if (_storage) return _storage;
  _storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
      client_email: process.env.GCS_CLIENT_EMAIL!,
      private_key:  process.env.GCS_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    },
  });
  return _storage;
}

function bucket() {
  return getStorage().bucket(process.env.GCS_BUCKET_NAME!);
}

// ── Core helpers ──────────────────────────────────────────────────────────
// Each record is stored as its own JSON file: {collection}/{id}.json
// This avoids race conditions on concurrent writes.

export async function gcsAdd<T extends object>(
  collection: string,
  data: T
): Promise<T & { id: string; timestamp: string }> {
  const id        = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const record    = { id, timestamp, ...data };
  await bucket()
    .file(`${collection}/${id}.json`)
    .save(JSON.stringify(record), { contentType: 'application/json', resumable: false });
  return record;
}

export async function gcsGetAll<T>(collection: string): Promise<T[]> {
  try {
    const [files] = await bucket().getFiles({ prefix: `${collection}/` });
    if (files.length === 0) return [];
    const results = await Promise.all(
      files.map(f => f.download().then(([buf]) => JSON.parse(buf.toString()) as T))
    );
    return results;
  } catch {
    return [];
  }
}

export async function gcsGet<T>(collection: string, id: string): Promise<T | null> {
  try {
    const [buf] = await bucket().file(`${collection}/${id}.json`).download();
    return JSON.parse(buf.toString()) as T;
  } catch {
    return null;
  }
}

export async function gcsUpdate<T extends object>(
  collection: string,
  id: string,
  patch: Partial<T>
): Promise<void> {
  const file = bucket().file(`${collection}/${id}.json`);
  const [buf] = await file.download();
  const updated = { ...JSON.parse(buf.toString()), ...patch };
  await file.save(JSON.stringify(updated), { contentType: 'application/json', resumable: false });
}

export async function gcsDelete(collection: string, id: string): Promise<void> {
  await bucket().file(`${collection}/${id}.json`).delete();
}

// Upsert by a deterministic key (e.g. agentId) instead of a random UUID.
// Useful for records that should be updated in-place rather than appended.
export async function gcsSet<T extends object>(
  collection: string,
  key: string,
  data: T
): Promise<T & { updatedAt: string }> {
  const updatedAt = new Date().toISOString();
  const record    = { ...data, updatedAt };
  await bucket()
    .file(`${collection}/${key}.json`)
    .save(JSON.stringify(record), { contentType: 'application/json', resumable: false });
  return record;
}
