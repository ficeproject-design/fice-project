// Utility for calculating geographical distance using the Haversine formula
// and validating business rules (radius 15 km jalan, coverage area, cut-off time).

// Faktor koreksi garis lurus -> estimasi jarak jalan raya (dalam kota 1,2-1,5x).
// Dipakai agar threshold radius terasa adil dibanding Google Maps.
export const ROAD_DISTANCE_FACTOR = 1.3;

export const COVERAGE_AREAS = {
  'Kota Tangerang Selatan': [
    'Serpong',
    'Serpong Utara',
    'Ciputat',
    'Ciputat Timur',
    'Pamulang',
    'Pondok Aren',
    'Setu',
  ],
  'Kota Tangerang': [
    'Ciledug',
    'Cipondoh',
    'Karang Tengah',
    'Karawaci',
    'Gading Serpong',
    'Larangan',
  ],
  'Jakarta Selatan': [
    'Cilandak',
    'Jagakarsa',
    'Kebayoran Baru',
    'Kebayoran Lama',
    'Mampang Prapatan',
    'Pancoran',
    'Pasar Minggu',
    'Pesanggrahan',
    'Tebet',
    'Setiabudi',
  ],
} as const;

export const COVERAGE_CITIES = [
  'Kota Tangerang Selatan',
  'Kota Tangerang',
  'Jakarta Selatan',
] as const;

export type CoverageCity = (typeof COVERAGE_CITIES)[number];

// Default Workshop Location: Pondok Aren, Tangerang Selatan (Rumah MJ SXB)
export const DEFAULT_WORKSHOP_COORDS = {
  lat: -6.256672393399018,
  lng: 106.72384418262801,
  address: 'Pondok Aren, Tangerang Selatan',
};

// Batas viewport peta: fokus ke area layanan saja
// (Tangsel, Kota Tangerang, Jaksel). Di luar ini user tak bisa pan/zoom-out.
export const SERVICE_BOUNDS = {
  southWest: [-6.45, 106.55] as [number, number],
  northEast: [-6.1, 106.95] as [number, number],
};

/**
 * Calculates straight-line distance in kilometers between two latitude/longitude points.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place (e.g. 14.5 km)
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Estimasi jarak jalan raya = haversine x faktor koreksi (1 desimal). */
export function estimateRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return Math.round(calculateDistanceKm(lat1, lon1, lat2, lon2) * ROAD_DISTANCE_FACTOR * 10) / 10;
}

export interface EligibilityResult {
  allowed: boolean;
  distanceKm: number;
  pickupFee: number;
  message: string;
  isBeyondRadius: boolean;
  missingItemsCount?: number;
}

/**
 * Evaluates whether an order meets the Free Pickup & Delivery conditions.
 * Jarak = estimasi jalan raya (haversine x faktor koreksi).
 * - Radius <= 15 km: FREE for any number of items (1, 2, 3+)
 * - Radius > 15 km (in coverage zone): FREE with minimum 3 items. If < 3, requires adding more items.
 */
export function checkOrderEligibility(
  customerLat: number,
  customerLng: number,
  totalItemsCount: number,
  workshopLat: number = DEFAULT_WORKSHOP_COORDS.lat,
  workshopLng: number = DEFAULT_WORKSHOP_COORDS.lng,
  freeRadiusKm: number = 15,
  minItemsBeyondRadius: number = 3
): EligibilityResult {
  const distanceKm = estimateRoadDistanceKm(
    workshopLat,
    workshopLng,
    customerLat,
    customerLng
  );

  const isBeyondRadius = distanceKm > freeRadiusKm;

  if (isBeyondRadius) {
    if (totalItemsCount < minItemsBeyondRadius) {
      const missing = minItemsBeyondRadius - totalItemsCount;
      return {
        allowed: false,
        distanceKm,
        pickupFee: 0,
        isBeyondRadius: true,
        missingItemsCount: missing,
        message: `Jarak Anda ${distanceKm} km (> ${freeRadiusKm} km). Layanan antar-jemput gratis berlaku dengan minimal ${minItemsBeyondRadius} item. Tambahkan ${missing} item lagi di keranjang Anda.`,
      };
    }

    return {
      allowed: true,
      distanceKm,
      pickupFee: 0,
      isBeyondRadius: true,
      message: `Jarak Anda ${distanceKm} km (> ${freeRadiusKm} km). Syarat minimal ${minItemsBeyondRadius} item terpenuhi. Layanan Antar-Jemput 100% GRATIS!`,
    };
  }

  // <= radius: Free for any quantity
  return {
    allowed: true,
    distanceKm,
    pickupFee: 0,
    isBeyondRadius: false,
    message: `Jarak Anda ${distanceKm} km (dalam radius ${freeRadiusKm} km). Layanan Antar-Jemput 100% GRATIS tanpa syarat minimal order!`,
  };
}

/**
 * Returns available pickup dates based on the 13:00 WIB cut-off rule.
 * If current time is >= 13:00, the earliest pickup date is tomorrow (H+1).
 * If < 13:00, today is selectable for afternoon pickup slot.
 */
export function getAvailablePickupDates(cutoffHour: number = 13): {
  date: string;
  label: string;
  isToday: boolean;
  availableSlots: Array<'morning' | 'afternoon'>;
}[] {
  const now = new Date();
  const currentHour = now.getHours();
  const isPastCutoff = currentHour >= cutoffHour;

  const dates = [];
  const startIndex = isPastCutoff ? 1 : 0; // if past cutoff, skip today (0) and start from tomorrow (1)

  for (let i = startIndex; i < startIndex + 7; i++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + i);

    const isToday = i === 0;
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Available slots: if today, only afternoon slot is available
    const availableSlots: Array<'morning' | 'afternoon'> = isToday
      ? ['afternoon']
      : ['morning', 'afternoon'];

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    let label = `${dayNames[targetDate.getDay()]}, ${targetDate.getDate()} ${monthNames[targetDate.getMonth()]}`;
    if (isToday) {
      label = `Hari Ini (${label})`;
    } else if (i === 1) {
      label = `Besok (${label})`;
    }

    dates.push({
      date: dateStr,
      label,
      isToday,
      availableSlots,
    });
  }

  return dates;
}
