/**
 * Browser-side localStorage cache for critical agent data.
 *
 * Purpose: if the Cloud Run server resets and is temporarily unreachable,
 * the browser still has the last-known progress and active session data
 * so the user can continue without losing their place.
 *
 * Usage pattern:
 *   1. After every successful API write, call the matching `save*` function.
 *   2. On load, call `get*` — use the cached value as a fallback when the
 *      server returns null or the fetch fails.
 */

const PREFIX = 'bt_';

function key(name: string): string {
  return `${PREFIX}${name}`;
}

function save(name: string, value: unknown): void {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // localStorage may be full or unavailable — silently ignore
  }
}

function load<T>(name: string): T | null {
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function remove(name: string): void {
  try {
    localStorage.removeItem(key(name));
  } catch { /* ignore */ }
}

// ── Agent progress ─────────────────────────────────────────────────────────

export interface CachedProgress {
  agentId: string;
  agentName: string;
  pitchCompletedLevels: number[];
  evalCompletedLevels: number[];
  evalSavedLevel: number | null;
  updatedAt?: string;
}

export function saveProgress(agentId: string, data: CachedProgress): void {
  save(`progress_${agentId}`, data);
}

export function getProgress(agentId: string): CachedProgress | null {
  return load<CachedProgress>(`progress_${agentId}`);
}

// ── Active pitch session ───────────────────────────────────────────────────

export interface CachedPitchSession {
  agentId: string;
  sessionId: string;
  level: 1 | 2 | 3;
  messages: { role: string; content: string }[];
  savedAt: number;
}

export function savePitchSession(agentId: string, data: CachedPitchSession): void {
  save(`pitch_active_${agentId}`, data);
}

export function getPitchSession(agentId: string): CachedPitchSession | null {
  return load<CachedPitchSession>(`pitch_active_${agentId}`);
}

export function clearPitchSession(agentId: string): void {
  remove(`pitch_active_${agentId}`);
}

// ── Active AI-eval session ─────────────────────────────────────────────────

export interface CachedEvalSession {
  agentId: string;
  sessionId: string;
  level: 1 | 2 | 3 | 4;
  messages: { role: string; content: string }[];
  savedAt: number;
}

export function saveEvalSession(agentId: string, data: CachedEvalSession): void {
  save(`aiev_active_${agentId}`, data);
}

export function getEvalSession(agentId: string): CachedEvalSession | null {
  return load<CachedEvalSession>(`aiev_active_${agentId}`);
}

export function clearEvalSession(agentId: string): void {
  remove(`aiev_active_${agentId}`);
}
