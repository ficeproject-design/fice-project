/** Link Google Maps: koordinat kalau ada, kalau tidak pakai alamat. */
export function googleMapsUrl(
  lat?: number | null,
  lng?: number | null,
  fallbackAddress?: string
): string {
  if (lat != null && lng != null && lat !== 0 && lng !== 0) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress || '')}`;
}
