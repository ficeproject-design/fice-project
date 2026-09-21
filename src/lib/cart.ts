/** Persistent cart helpers — localStorage primary, sessionStorage as legacy fallback. */

export const CART_KEY = 'fice_cart';

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readCart(): Record<string, number> {
  try {
    if (typeof window === 'undefined') return {};
    // Primary: localStorage (survives refresh / new tab)
    const rawLocal = window.localStorage.getItem(CART_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal) as Record<string, number>;
      const clean: Record<string, number> = {};
      for (const [id, q] of Object.entries(parsed || {})) {
        const qty = Number(q);
        if (qty > 0) clean[id] = Math.min(50, Math.floor(qty));
      }
      if (Object.keys(clean).length > 0) return clean;
    }
    // Legacy fallback: sessionStorage (written by older builds)
    const rawSession = window.sessionStorage.getItem(CART_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession) as Record<string, number>;
      const clean: Record<string, number> = {};
      for (const [id, q] of Object.entries(parsed || {})) {
        const qty = Number(q);
        if (qty > 0) clean[id] = Math.min(50, Math.floor(qty));
      }
      if (Object.keys(clean).length > 0) {
        // Migrate to localStorage so it persists going forward
        try {
          window.localStorage.setItem(CART_KEY, JSON.stringify(clean));
        } catch {
          // ignore quota errors
        }
        return clean;
      }
    }
  } catch {
    // corrupted cart, treat as empty
  }
  return {};
}

export function writeCart(cart: Record<string, number>): void {
  const store = getStorage();
  if (!store) return;
  try {
    const clean: Record<string, number> = {};
    for (const [id, q] of Object.entries(cart || {})) {
      const qty = Number(q);
      if (qty > 0) clean[id] = Math.min(50, Math.floor(qty));
    }
    store.setItem(CART_KEY, JSON.stringify(clean));
    // Drop legacy copy to avoid double-source confusion
    try {
      window.sessionStorage.removeItem(CART_KEY);
    } catch {
      // ignore
    }
  } catch {
    // quota / private mode — checkout will still work from in-memory state
  }
}

export function clearCart(): void {
  try {
    window.localStorage.removeItem(CART_KEY);
  } catch {
    // ignore
  }
  try {
    window.sessionStorage.removeItem(CART_KEY);
  } catch {
    // ignore
  }
}
