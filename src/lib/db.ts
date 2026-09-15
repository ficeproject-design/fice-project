import fs from 'fs';
import path from 'path';
import {
  Service,
  Order,
  Customer,
  SystemSettings,
  QualityCheckPhoto,
  OrderStatus,
  PaymentStatus,
  PromoCode,
} from './types';
import { DEFAULT_WORKSHOP_COORDS } from './haversine';
import { generateInvoiceNumber, formatRupiah } from './invoice';

const DATA_FILE = path.join(process.cwd(), 'data', 'db.json');

interface DatabaseSchema {
  services: Service[];
  customers: Customer[];
  orders: Order[];
  settings: SystemSettings;
  promos?: PromoCode[];
}

const DEFAULT_SERVICES: Service[] = [
  // Shoes
  {
    id: 'srv-shoes-deepclean',
    category: 'shoes',
    name: 'Deep Clean Shoes',
    description: 'Pembersihan menyeluruh bagian luar, midsole, insole, outsole, dan tali sepatu.',
    estimatedDays: '2 - 3 Hari',
    price: 65000,
    popular: true,
  },
  {
    id: 'srv-shoes-suede',
    category: 'shoes',
    name: 'Special Treatment - Suede',
    description: 'Perawatan material khusus Suede & Nubuck dengan sabun khusus agar bulu halus tetap lembut dan tidak kaku.',
    estimatedDays: '3 Hari',
    price: 75000,
  },
  {
    id: 'srv-shoes-leather',
    category: 'shoes',
    name: 'Special Treatment - Leather / Kulit',
    description: 'Pembersihan dan conditioning kulit asli/sintetis untuk menjaga kelembapan serta mencegah kerutan dan pecah.',
    estimatedDays: '3 Hari',
    price: 90000,
  },
  {
    id: 'srv-shoes-kids',
    category: 'shoes',
    name: 'Little One Care (Kids Shoes)',
    description: 'Pembersihan higienis khusus sepatu anak dengan formula ramah anak dan anti-bakteri.',
    estimatedDays: '2 - 3 Hari',
    price: 40000,
  },
  {
    id: 'srv-shoes-womens',
    category: 'shoes',
    name: 'Womens Care',
    description: 'Deep clean khusus Heels, Wedges, dan Flat shoes.',
    estimatedDays: '2 - 3 Hari',
    price: 45000,
  },
  // Bags
  {
    id: 'srv-bag-small',
    category: 'bag',
    name: 'Bag Deep Clean (Small)',
    description: 'Pembersihan tas ukuran kecil (clutch, waist bag, mini sling bag).',
    estimatedDays: '3 - 4 Hari',
    price: 65000,
  },
  {
    id: 'srv-bag-medium',
    category: 'bag',
    name: 'Bag Deep Clean (Medium)',
    description: 'Pembersihan tas ukuran sedang (backpack standar, shoulder bag, tote bag).',
    estimatedDays: '3 - 4 Hari',
    price: 85000,
    popular: true,
  },
  {
    id: 'srv-bag-large',
    category: 'bag',
    name: 'Bag Deep Clean (Large)',
    description: 'Pembersihan tas ukuran besar (travel bag, duffel, backpack gunung, tote bag besar).',
    estimatedDays: '3 - 4 Hari',
    price: 110000,
  },
  // Accessories
  {
    id: 'srv-acc-deepclean',
    category: 'accessories',
    name: 'Hat, Wallet & Pouch Deep Clean',
    description: 'Pembersihan menyeluruh untuk topi (snapback/baseball), dompet, atau pouch kosmetik/gadget.',
    estimatedDays: '2 - 3 Hari',
    price: 30000,
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  workshopName: 'Fice Shoes Care',
  workshopAddress: 'Pondok Aren, Tangerang Selatan',
  workshopCity: 'Tangerang Selatan',
  workshopLat: DEFAULT_WORKSHOP_COORDS.lat,
  workshopLng: DEFAULT_WORKSHOP_COORDS.lng,
  adminPhone: '081298765432',
  freeRadiusKm: 20,
  minItemsBeyondRadius: 3,
  cutoffHour: 13,
  bankAccountInfo: 'BCA 8830-1234-5678 a.n. Fice Shoes Care',
};

// Seed initial demo data for realistic previews
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Dimas Prasetyo',
    phone: '081298765432',
    address: 'Jl. Kemang Timur No. 42, RT 03/RW 04',
    district: 'Mampang Prapatan',
    city: 'Jakarta Selatan',
    latitude: -6.2625,
    longitude: 106.8228,
    notes: 'Pagar abu-abu sebelah toko bunga',
    totalOrders: 2,
    lastOrderAt: '2026-09-12T10:00:00.000Z',
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'cust-2',
    name: 'Alya Safitri',
    phone: '081377889900',
    address: 'Cluster Foresta Blok B7 No. 15, BSD City',
    district: 'Serpong',
    city: 'Tangerang Selatan',
    latitude: -6.3015,
    longitude: 106.6542,
    notes: 'Dekat pos satpam gerbang utama',
    totalOrders: 1,
    lastOrderAt: '2026-09-13T11:30:00.000Z',
    createdAt: '2026-09-13T11:30:00.000Z',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    invoiceNumber: 'INV-202609-0001',
    customer: INITIAL_CUSTOMERS[0],
    items: [
      {
        id: 'item-1',
        serviceId: 'srv-shoes-deepclean',
        serviceName: 'Deep Clean Shoes',
        category: 'shoes',
        price: 65000,
        quantity: 2,
        itemNotes: 'Nike Air Jordan 1 Low & Adidas Samba Putih',
      },
      {
        id: 'item-2',
        serviceId: 'srv-acc-deepclean',
        serviceName: 'Hat, Wallet & Pouch Deep Clean',
        category: 'accessories',
        price: 30000,
        quantity: 1,
        itemNotes: 'Topi New Era Yankees Hitam',
      },
    ],
    pickupDate: '2026-09-12',
    pickupSlot: 'morning',
    status: 'COMPLETED',
    paymentModel: 'MODEL_B',
    paymentStatus: 'PAID',
    paymentMethod: 'QRIS',
    distanceKm: 12.4,
    pickupFee: 0,
    subtotal: 160000,
    totalAmount: 160000,
    qcPhotos: [
      {
        id: 'qc-1',
        type: 'BEFORE',
        photoUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
        notes: 'Midsole berdebu tebal dan outsole ada noda tanah kering.',
        createdAt: '2026-09-12T14:10:00.000Z',
      },
      {
        id: 'qc-2',
        type: 'AFTER',
        photoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        notes: 'Selesai deep clean, wangi bubblegum dan sudah kering sempurna.',
        createdAt: '2026-09-13T09:30:00.000Z',
      },
    ],
    notes: 'Tolong jemput sebelum jam 12 siang ya.',
    createdAt: '2026-09-12T08:30:00.000Z',
    updatedAt: '2026-09-13T10:00:00.000Z',
    paidAt: '2026-09-12T15:00:00.000Z',
  },
  {
    id: 'ord-102',
    invoiceNumber: 'INV-202609-0002',
    customer: INITIAL_CUSTOMERS[1],
    items: [
      {
        id: 'item-3',
        serviceId: 'srv-bag-medium',
        serviceName: 'Bag Deep Clean (Medium)',
        category: 'bag',
        price: 85000,
        quantity: 1,
        itemNotes: 'Tas Ransel Fjallraven Kanken Kuning',
      },
      {
        id: 'item-4',
        serviceId: 'srv-shoes-suede',
        serviceName: 'Special Treatment - Suede',
        category: 'shoes',
        price: 75000,
        quantity: 1,
        itemNotes: 'Vans Old Skool Suede Navy',
      },
    ],
    pickupDate: '2026-09-14',
    pickupSlot: 'morning',
    status: 'WAITING_PICKUP',
    paymentModel: 'MODEL_C',
    paymentStatus: 'UNPAID',
    paymentMethod: 'COD',
    distanceKm: 9.8,
    pickupFee: 0,
    subtotal: 160000,
    totalAmount: 160000,
    qcPhotos: [],
    notes: 'Taruh di titip satpam jika saya belum pulang kerja.',
    createdAt: '2026-09-13T11:30:00.000Z',
    updatedAt: '2026-09-13T11:30:00.000Z',
  },
];

export const DEFAULT_PROMOS: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'FICEBARU',
    discountType: 'PERCENT',
    discountValue: 15,
    minOrderAmount: 65000,
    maxDiscount: 25000,
    validUntil: '2026-12-31',
    usageLimit: 100,
    usedCount: 8,
    isActive: true,
    description: 'Diskon 15% untuk pelanggan baru Fice Shoes Care (Maks. Rp 25.000, Min. Order Rp 65.000)',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'promo-2',
    code: 'BERSIH10K',
    discountType: 'FIXED',
    discountValue: 10000,
    minOrderAmount: 65000,
    validUntil: '2026-12-31',
    usageLimit: 50,
    usedCount: 14,
    isActive: true,
    description: 'Potongan langsung Rp 10.000 untuk deep clean sepatu & tas (Min. Order Rp 65.000)',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'promo-3',
    code: 'SUPERCARE',
    discountType: 'PERCENT',
    discountValue: 20,
    minOrderAmount: 120000,
    maxDiscount: 35000,
    validUntil: '2026-12-31',
    usageLimit: 30,
    usedCount: 5,
    isActive: true,
    description: 'Diskon 20% khusus perawatan 2 pasang sepatu atau lebih (Min. Order Rp 120.000)',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialDb: DatabaseSchema = {
        services: DEFAULT_SERVICES,
        customers: INITIAL_CUSTOMERS,
        orders: INITIAL_ORDERS,
        settings: DEFAULT_SETTINGS,
        promos: DEFAULT_PROMOS,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data) as DatabaseSchema;
    if (!parsed.promos) {
      parsed.promos = DEFAULT_PROMOS;
      writeDb(parsed);
    }
    return parsed;
  } catch (error) {
    console.error('Error reading database file:', error);
    return {
      services: DEFAULT_SERVICES,
      customers: INITIAL_CUSTOMERS,
      orders: INITIAL_ORDERS,
      settings: DEFAULT_SETTINGS,
      promos: DEFAULT_PROMOS,
    };
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// Service Methods
export function getServices(): Service[] {
  return readDb().services;
}

export function getServiceById(id: string): Service | undefined {
  return readDb().services.find((s) => s.id === id);
}

export function updateService(updated: Service): boolean {
  const db = readDb();
  const idx = db.services.findIndex((s) => s.id === updated.id);
  if (idx !== -1) {
    db.services[idx] = updated;
    writeDb(db);
    return true;
  }
  return false;
}

// Order Methods
export function getOrders(): Order[] {
  return readDb().orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): Order | undefined {
  return readDb().orders.find((o) => o.id === id);
}

export function getOrderByInvoice(invoiceNumber: string): Order | undefined {
  const clean = invoiceNumber.trim().toUpperCase();
  return readDb().orders.find(
    (o) => o.invoiceNumber.toUpperCase() === clean || o.id === invoiceNumber
  );
}

export function createOrder(
  newOrder: Omit<Order, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'qcPhotos'>
): Order {
  const db = readDb();
  const id = 'ord-' + Date.now();
  const invoiceNumber = generateInvoiceNumber(db.orders.length);
  const now = new Date().toISOString();

  // Save or update customer
  const existingCustIdx = db.customers.findIndex(
    (c) => c.phone === newOrder.customer.phone
  );
  let savedCustomer: Customer;
  if (existingCustIdx !== -1) {
    db.customers[existingCustIdx] = {
      ...db.customers[existingCustIdx],
      ...newOrder.customer,
      totalOrders: db.customers[existingCustIdx].totalOrders + 1,
      lastOrderAt: now,
    };
    savedCustomer = db.customers[existingCustIdx];
  } else {
    savedCustomer = {
      ...newOrder.customer,
      id: 'cust-' + Date.now(),
      totalOrders: 1,
      lastOrderAt: now,
      createdAt: now,
    };
    db.customers.push(savedCustomer);
  }

  const order: Order = {
    ...newOrder,
    id,
    invoiceNumber,
    customer: savedCustomer,
    qcPhotos: [],
    createdAt: now,
    updatedAt: now,
  };

  db.orders.unshift(order);

  // If order used promoCode, increment usage
  if (newOrder.promoCode) {
    const promo = (db.promos || []).find(
      (p) => p.code.toUpperCase() === newOrder.promoCode?.trim().toUpperCase()
    );
    if (promo) {
      promo.usedCount = (promo.usedCount || 0) + 1;
    }
  }

  writeDb(db);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const db = readDb();
  const order = db.orders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    return order;
  }
  return null;
}

export function updatePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
  paymentMethod?: Order['paymentMethod']
): Order | null {
  const db = readDb();
  const order = db.orders.find((o) => o.id === id);
  if (order) {
    order.paymentStatus = paymentStatus;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (paymentStatus === 'PAID') {
      order.paidAt = new Date().toISOString();
    }
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    return order;
  }
  return null;
}

export function addQCPhoto(
  orderId: string,
  photo: { type: 'BEFORE' | 'AFTER'; photoUrl: string; notes?: string }
): Order | null {
  const db = readDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (order) {
    const qcPhoto: QualityCheckPhoto = {
      id: 'qc-' + Date.now(),
      type: photo.type,
      photoUrl: photo.photoUrl,
      notes: photo.notes,
      createdAt: new Date().toISOString(),
    };
    order.qcPhotos.push(qcPhoto);
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    return order;
  }
  return null;
}

// Customer CRM Methods
export function getCustomers(): Customer[] {
  return readDb().customers.sort(
    (a, b) =>
      new Date(b.lastOrderAt || b.createdAt).getTime() -
      new Date(a.lastOrderAt || a.createdAt).getTime()
  );
}

// Settings Methods
export function getSettings(): SystemSettings {
  return readDb().settings;
}

export function updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
  const db = readDb();
  db.settings = { ...db.settings, ...newSettings };
  writeDb(db);
  return db.settings;
}

// Revenue and Analytics
export function getRevenueSummary() {
  const orders = getOrders();
  
  // Paid revenue only (selesai / paid)
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Unpaid pending
  const pendingOrders = orders.filter(
    (o) => o.paymentStatus === 'UNPAID' && o.status !== 'CANCELLED'
  );
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Status counts
  const statusCounts = {
    waitingPickup: orders.filter((o) => o.status === 'WAITING_PICKUP').length,
    inWorkshop: orders.filter((o) => o.status === 'IN_WORKSHOP' || o.status === 'IN_PROGRESS').length,
    readyToDeliver: orders.filter((o) => o.status === 'READY_TO_DELIVER' || o.status === 'DELIVERING').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
  };

  // Total items cleaned
  const totalItemsCount = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  return {
    totalRevenue,
    pendingRevenue,
    paidOrdersCount: paidOrders.length,
    totalOrdersCount: orders.length,
    totalItemsCount,
    statusCounts,
    recentOrders: orders.slice(0, 5),
  };
}

// Promo Code Methods
export function getPromos(): PromoCode[] {
  return (readDb().promos || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPromoById(id: string): PromoCode | undefined {
  return (readDb().promos || []).find((p) => p.id === id);
}

export function getPromoByCode(rawCode: string): PromoCode | undefined {
  const code = rawCode.trim().toUpperCase();
  return (readDb().promos || []).find((p) => p.code.toUpperCase() === code);
}

export function createPromo(
  data: Omit<PromoCode, 'id' | 'usedCount' | 'createdAt'>
): PromoCode {
  const db = readDb();
  const id = 'promo-' + Date.now();
  const now = new Date().toISOString();

  const newPromo: PromoCode = {
    ...data,
    id,
    code: data.code.trim().toUpperCase(),
    usedCount: 0,
    createdAt: now,
  };

  db.promos = db.promos || [];
  db.promos.unshift(newPromo);
  writeDb(db);
  return newPromo;
}

export function updatePromo(id: string, data: Partial<PromoCode>): PromoCode | null {
  const db = readDb();
  db.promos = db.promos || [];
  const idx = db.promos.findIndex((p) => p.id === id);
  if (idx !== -1) {
    if (data.code) {
      data.code = data.code.trim().toUpperCase();
    }
    db.promos[idx] = { ...db.promos[idx], ...data };
    writeDb(db);
    return db.promos[idx];
  }
  return null;
}

export function deletePromo(id: string): boolean {
  const db = readDb();
  db.promos = db.promos || [];
  const idx = db.promos.findIndex((p) => p.id === id);
  if (idx !== -1) {
    db.promos.splice(idx, 1);
    writeDb(db);
    return true;
  }
  return false;
}

export function validatePromoCode(
  rawCode: string,
  subtotal: number
): {
  valid: boolean;
  message?: string;
  discountAmount?: number;
  promo?: PromoCode;
} {
  const code = rawCode.trim().toUpperCase();
  const db = readDb();
  const promo = (db.promos || []).find((p) => p.code.toUpperCase() === code);

  if (!promo) {
    return {
      valid: false,
      message: 'Kode promo tidak ditemukan. Mohon periksa kembali kode Anda.',
    };
  }

  if (!promo.isActive) {
    return {
      valid: false,
      message: 'Kode promo ini sedang tidak aktif.',
    };
  }

  // Check expiration date
  if (promo.validUntil) {
    const expiry = new Date(promo.validUntil);
    expiry.setHours(23, 59, 59, 999);
    if (new Date() > expiry) {
      return {
        valid: false,
        message: `Masa berlaku kode promo ini telah berakhir pada ${new Date(promo.validUntil).toLocaleDateString('id-ID')}.`,
      };
    }
  }

  // Check usage limit
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return {
      valid: false,
      message: 'Kuota penggunaan kode promo ini sudah habis.',
    };
  }

  // Check min order amount
  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
    return {
      valid: false,
      message: `Kode promo ini membutuhkan minimal belanja ${formatRupiah(promo.minOrderAmount)} (Total saat ini: ${formatRupiah(subtotal)}).`,
    };
  }

  // Calculate discount
  let discountAmount = 0;
  if (promo.discountType === 'PERCENT') {
    discountAmount = Math.round((subtotal * promo.discountValue) / 100);
    if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
      discountAmount = promo.maxDiscount;
    }
  } else {
    // FIXED
    discountAmount = Math.min(promo.discountValue, subtotal);
  }

  return {
    valid: true,
    discountAmount,
    promo,
    message: `Kode ${promo.code} berhasil digunakan! Anda hemat ${formatRupiah(discountAmount)}.`,
  };
}

export function incrementPromoUsage(rawCode: string): void {
  const code = rawCode.trim().toUpperCase();
  const db = readDb();
  const promo = (db.promos || []).find((p) => p.code.toUpperCase() === code);
  if (promo) {
    promo.usedCount = (promo.usedCount || 0) + 1;
    writeDb(db);
  }
}
