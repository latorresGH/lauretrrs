/**
 * Rate limiter en memoria (sliding window) para endpoints sensibles a spam.
 * Vale para un proceso Node de larga vida; en serverless con instancias frías
 * es "best effort" ya que la memoria no persiste entre invocaciones.
 */

const BURST_WINDOW_MS = 60_000; // 1 minuto
const MAX_PER_BURST_WINDOW = 2;

const LONG_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 horas
const MAX_PER_LONG_WINDOW = 5;

// Evita crecimiento indefinido del Map si el proceso queda mucho tiempo vivo.
const MAX_TRACKED_KEYS = 5000;

const hits = new Map<string, number[]>();

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();

  if (!hits.has(key) && hits.size >= MAX_TRACKED_KEYS) {
    hits.clear();
  }

  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < LONG_WINDOW_MS);

  const burst = timestamps.filter((t) => now - t < BURST_WINDOW_MS);
  if (burst.length >= MAX_PER_BURST_WINDOW) {
    hits.set(key, timestamps);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((BURST_WINDOW_MS - (now - burst[0])) / 1000),
    };
  }

  if (timestamps.length >= MAX_PER_LONG_WINDOW) {
    hits.set(key, timestamps);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((LONG_WINDOW_MS - (now - timestamps[0])) / 1000),
    };
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}
