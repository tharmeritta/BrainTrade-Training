/**
 * Lightweight Request Deduplicator and Cache for Next.js Client.
 * Reduces RAM and Network usage by preventing redundant fetches.
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<any>>();
const pending = new Map<string, Promise<any>>();

const TTL = 60 * 1000; // 1 minute cache

export async function fetchWithCache<T>(url: string, options?: RequestInit): Promise<T> {
  const method = options?.method || 'GET';
  
  // Only cache GET requests
  if (method !== 'GET') {
    return fetch(url, options).then(r => r.json());
  }

  const now = Date.now();
  const entry = cache.get(url);

  // 1. Return from cache if fresh
  if (entry && (now - entry.timestamp < TTL)) {
    return entry.data;
  }

  // 2. Return pending promise if already fetching
  if (pending.has(url)) {
    return pending.get(url);
  }

  // 3. Perform the fetch
  const promise = fetch(url, options)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
      const data = await res.json();
      cache.set(url, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => {
      pending.delete(url);
    });

  pending.set(url, promise);
  return promise;
}

/**
 * Force clear the cache for a specific URL (useful after updates).
 */
export function invalidateCache(url: string) {
  cache.delete(url);
}
