/**
 * Browser-side localStorage cache for critical agent data.
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

export interface LocalCache {
  agentId: string;
  agentName: string;
  evalCompletedLevels: number[];
  learnedModules: string[];
  updatedAt?: string;
}

export function saveProgress(agentId: string, data: LocalCache): void {
  save(`progress_${agentId}`, data);
}

export function getProgress(agentId: string): LocalCache | null {
  return load<LocalCache>(`progress_${agentId}`);
}

// ── Active evaluation session ──────────────────────────────────────────────

export interface CachedEvalSession {
  agentId: string;
  level: number;
  messages: any[];
  timestamp: string;
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
