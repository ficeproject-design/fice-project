import type { Service } from './types';

/** Grup tampilan layanan: beberapa Service bisa jadi varian ukuran dari satu layanan. */
export interface ServiceGroup {
  /** Kunci grup: variantGroup kalau ada, kalau tidak pakai service id. */
  key: string;
  /** Service representatif untuk render kartu (yang populer, atau termurah). */
  primary: Service;
  /** Semua varian di grup ini, urut harga menaik. Panjang 1 untuk layanan biasa. */
  variants: Service[];
  /** True kalau grup ini benar-benar punya >1 varian. */
  isVariantGroup: boolean;
}

/**
 * Gabungkan service dengan variantGroup sama menjadi satu entri tampilan.
 * Urutan grup mengikuti kemunculan pertama; varian di dalam grup urut harga menaik.
 * Service tanpa variantGroup tetap muncul sebagai grup tunggal.
 */
export function groupServices(services: Service[]): ServiceGroup[] {
  const groups: ServiceGroup[] = [];
  const indexByKey = new Map<string, number>();

  for (const s of services) {
    const key = s.variantGroup || s.id;
    const existing = indexByKey.get(key);
    if (existing === undefined) {
      indexByKey.set(key, groups.length);
      groups.push({
        key,
        primary: s,
        variants: [s],
        isVariantGroup: Boolean(s.variantGroup),
      });
    } else {
      groups[existing].variants.push(s);
    }
  }

  for (const g of groups) {
    if (g.variants.length > 1) {
      g.variants.sort((a, b) => a.price - b.price);
      // Primary = varian populer (biar harga yang tampil paling relevan), fallback termurah.
      g.primary = g.variants.find((v) => v.popular) || g.variants[0];
    }
  }

  return groups;
}

/** Semua varian dari grup yang sama dengan service ini (termasuk dirinya), urut harga menaik. */
export function getVariants(services: Service[], service: Service): Service[] {
  if (!service.variantGroup) return [service];
  const siblings = services.filter((s) => s.variantGroup === service.variantGroup);
  if (siblings.length === 0) return [service];
  return siblings.sort((a, b) => a.price - b.price);
}

/** Rentang harga grup untuk tampilan kartu gabungan. */
export function priceRange(variants: Service[]): { min: number; max: number; hasRange: boolean } {
  if (variants.length === 0) return { min: 0, max: 0, hasRange: false };
  let min = variants[0].price;
  let max = variants[0].price;
  for (const v of variants) {
    if (v.price < min) min = v.price;
    if (v.price > max) max = v.price;
  }
  return { min, max, hasRange: min !== max };
}

/** Nama layanan lengkap dengan label varian, mis. "Bag Deep Clean (Medium)". */
export function displayName(s: Service): string {
  return s.variantLabel ? `${s.name} (${s.variantLabel})` : s.name;
}

/** Deskripsi generik untuk kartu gabungan varian (fallback ke deskripsi primary). */
export function groupDescription(g: ServiceGroup): string {
  return g.primary.groupDescription || g.primary.description;
}
