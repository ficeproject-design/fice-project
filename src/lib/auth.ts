const enc = new TextEncoder()

export const AUTH_COOKIE = 'fice_admin'
export const SESSION_TTL_SECONDS = 12 * 60 * 60

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD
  if (!s) throw new Error('AUTH_SECRET or ADMIN_PASSWORD is not set')
  return s
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000
  return `${exp}.${await hmacHex(secret(), String(exp))}`
}

// Revocation list in-memory: efektif selama 1 proses (asumsi deploy = instance tunggal,
// sama seperti db.json). Upgrade path: simpan revocation di DB saat migrasi SQLite.
const revoked = new Map<string, number>() // token -> exp(ms)

export function revokeSessionToken(token: string | undefined | null): void {
  if (!token) return
  const exp = Number(token.split('.')[0])
  if (Number.isFinite(exp)) revoked.set(token, exp)
}

function pruneRevoked(): void {
  const now = Date.now()
  for (const [token, exp] of revoked) {
    if (exp < now) revoked.delete(token)
  }
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  if (revoked.has(token)) return false
  const [expStr, sig] = token.split('.')
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Date.now()) {
    pruneRevoked()
    return false
  }
  try {
    return safeEqual(await hmacHex(secret(), expStr), sig)
  } catch {
    return false
  }
}

export async function checkPassword(candidate: unknown): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || typeof candidate !== 'string') return false
  return safeEqual(await hmacHex('pw', candidate), await hmacHex('pw', expected))
}
