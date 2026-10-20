// Sliding-window rate limiter per process.
// shortcut: state per proses, cukup untuk satu instance; pindah ke Redis saat multi-instance.

export interface HeaderBag {
  get(name: string): string | null;
}

/**
 * Ambil IP klien. `x-forwarded-for` diisi klien, jadi hanya entri TERAKHIR
 * (yang ditambahkan proxy kita) yang boleh dipercaya.
 * shortcut: butuh reverse proxy yang menambahkan XFF; tanpa proxy header bisa dipalsukan.
 */
export function clientIp(headers: HeaderBag): string {
  // Direct exposure means the header is attacker-controlled: fall back to one
  // shared bucket instead of handing out a free bypass per fake IP.
  if (process.env.TRUST_PROXY === '0') return 'unknown';
  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const parts = (headers.get('x-forwarded-for') || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : 'unknown';
}

export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  let lastSweep = 0;

  function sweep(now: number) {
    if (now - lastSweep < windowMs) return;
    lastSweep = now;
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(key);
    }
  }

  return {
    limited(key: string, now: number = Date.now()): boolean {
      sweep(now);
      const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return true;
      }
      recent.push(now);
      hits.set(key, recent);
      return false;
    },
    size(): number {
      return hits.size;
    },
  };
}
