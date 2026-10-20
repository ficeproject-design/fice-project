// Validasi input order: satu tempat untuk aturan yang juga dipakai UI.
import { COVERAGE_CITIES, checkOrderEligibility } from './haversine.ts';
import { isValidPhone, PHONE_HINT } from './phone.ts';
import type { Customer, OrderItem, Service } from './types.ts';

export const MAX_ORDER_ITEMS = 20;
export const MAX_ITEM_QTY = 50;
/** Batas keras jarak pickup; freeRadiusKm hanya mengatur syarat gratis. */
export const MAX_PICKUP_DISTANCE_KM = 40;

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

type OrderSettings = {
  workshopLat: number;
  workshopLng: number;
  freeRadiusKm: number;
  minItemsBeyondRadius: number;
  cutoffHour?: number;
};

export type OrderInput = {
  customer: Omit<Customer, 'id' | 'totalOrders' | 'lastOrderAt' | 'createdAt'>;
  items: OrderItem[];
  pickupDate: string;
  pickupSlot: 'morning' | 'afternoon';
  notes?: string;
  promoCode?: string;
  distanceKm: number;
};

type Failure = { ok: false; status: number; error: string };

function fail(error: string, status = 400): Failure {
  return { ok: false, status, error };
}

function wibDateString(now: Date): string {
  const wib = new Date(now.getTime() + WIB_OFFSET_MS);
  return `${wib.getUTCFullYear()}-${String(wib.getUTCMonth() + 1).padStart(2, '0')}-${String(
    wib.getUTCDate()
  ).padStart(2, '0')}`;
}

function wibHour(now: Date): number {
  return new Date(now.getTime() + WIB_OFFSET_MS).getUTCHours();
}

export function validateOrderInput(
  body: Record<string, unknown>,
  services: Service[],
  settings: OrderSettings,
  now: Date = new Date()
): { ok: true; value: OrderInput } | Failure {
  const customer = body.customer as Record<string, unknown> | undefined;
  const rawItems = body.items;

  if (!customer || typeof customer !== 'object') return fail('Data pelanggan wajib diisi');
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return fail('Item layanan wajib diisi');
  }
  if (rawItems.length > MAX_ORDER_ITEMS) {
    return fail(`Maksimal ${MAX_ORDER_ITEMS} layanan per pesanan`);
  }

  if (
    typeof customer.name !== 'string' || !customer.name.trim() ||
    typeof customer.phone !== 'string' || !customer.phone.trim() ||
    typeof customer.address !== 'string' || !customer.address.trim() ||
    typeof customer.latitude !== 'number' || !Number.isFinite(customer.latitude) ||
    typeof customer.longitude !== 'number' || !Number.isFinite(customer.longitude)
  ) {
    return fail('Data pelanggan tidak lengkap');
  }
  if (!isValidPhone(customer.phone)) return fail(PHONE_HINT);

  const city = typeof customer.city === 'string' ? customer.city.trim() : '';
  if (!(COVERAGE_CITIES as readonly string[]).includes(city)) {
    return fail('Kota Anda di luar area layanan kami (Jaksel, Tangsel, Tangerang).');
  }

  // Prices come from the catalog, never from the client
  const items: OrderItem[] = [];
  for (let i = 0; i < rawItems.length; i++) {
    const raw = rawItems[i] as Record<string, unknown> | null;
    if (!raw || typeof raw !== 'object') return fail('Item layanan tidak valid');
    const svc = services.find((s) => s.id === raw.serviceId);
    if (!svc) return fail(`Layanan tidak ditemukan: ${String(raw.serviceId)}`);
    const qty = Number(raw.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_ITEM_QTY) {
      return fail(`Jumlah tiap layanan harus antara 1 - ${MAX_ITEM_QTY}`);
    }
    items.push({
      id: `item-${now.getTime()}-${i}`,
      serviceId: svc.id,
      serviceName: svc.name,
      category: svc.category,
      price: svc.price,
      quantity: qty,
      itemNotes:
        typeof raw.itemNotes === 'string' ? raw.itemNotes.trim().slice(0, 200) : undefined,
    });
  }

  const pickupDate = typeof body.pickupDate === 'string' ? body.pickupDate.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
    return fail('Tanggal jemput tidak valid (format YYYY-MM-DD)');
  }
  const today = wibDateString(now);
  if (pickupDate < today) return fail('Tanggal jemput sudah lewat');
  if (pickupDate === today && wibHour(now) >= (settings.cutoffHour ?? 13)) {
    return fail('Sudah melewati batas waktu pesan hari ini. Pilih tanggal besok atau setelahnya.');
  }

  const pickupSlot = body.pickupSlot;
  if (pickupSlot !== 'morning' && pickupSlot !== 'afternoon') {
    return fail('Slot jemput harus pagi atau siang');
  }
  // Slot pagi 09.00-13.00: untuk hari ini hanya slot siang yang masih bisa dipesan.
  if (pickupDate === today && pickupSlot === 'morning') {
    return fail('Slot pagi hari ini sudah lewat. Pilih slot siang atau tanggal berikutnya.');
  }

  let promoCode: string | undefined;
  if (body.promoCode !== undefined && body.promoCode !== null && body.promoCode !== '') {
    if (typeof body.promoCode !== 'string') return fail('Kode promo tidak valid');
    promoCode = body.promoCode.trim().slice(0, 40).toUpperCase() || undefined;
  }

  if (customer.latitude === settings.workshopLat && customer.longitude === settings.workshopLng) {
    return fail('Titik peta masih di workshop. Geser pin merah ke lokasi rumah Anda sebelum memesan.');
  }

  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const eligibility = checkOrderEligibility(
    customer.latitude,
    customer.longitude,
    totalItemsCount,
    settings.workshopLat,
    settings.workshopLng,
    settings.freeRadiusKm,
    settings.minItemsBeyondRadius
  );
  if (eligibility.distanceKm > MAX_PICKUP_DISTANCE_KM) {
    return fail(
      `Alamat Anda ${eligibility.distanceKm} km dari workshop, di luar jangkauan layanan (maks ${MAX_PICKUP_DISTANCE_KM} km).`
    );
  }
  if (!eligibility.allowed) return fail(eligibility.message);

  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : undefined;

  return {
    ok: true,
    value: {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim().slice(0, 300),
        district: typeof customer.district === 'string' ? customer.district.trim().slice(0, 100) : '',
        city,
        latitude: customer.latitude,
        longitude: customer.longitude,
        notes:
          typeof customer.notes === 'string' ? customer.notes.trim().slice(0, 300) : undefined,
      },
      items,
      pickupDate,
      pickupSlot,
      notes,
      promoCode,
      distanceKm: eligibility.distanceKm,
    },
  };
}
