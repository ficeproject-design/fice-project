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
import { cleanPhoneDigits, normalizeIdPhone } from './phone';

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
    longDescription:
      'Layanan cuci menyeluruh untuk sneakers harian Anda. Setiap bagian dibersihkan satu per satu: sisi luar (upper), garis midsole, sol dalam (insole), sol luar (outsole), hingga tali sepatu yang dicuci terpisah. Cocok untuk perawatan rutin agar sepatu kesayangan tetap bersih dan nyaman dipakai.',
    estimatedDays: '2 - 3 Hari',
    price: 65000,
    popular: true,
  },
  {
    id: 'srv-shoes-suede',
    category: 'shoes',
    name: 'Special Treatment - Suede',
    description: 'Perawatan material khusus Suede & Nubuck dengan sabun khusus agar bulu halus tetap lembut dan tidak kaku.',
    longDescription:
      'Suede dan nubuck butuh penanganan khusus karena bulunya mudah kaku dan berubah warna bila dicuci sembarangan. Kami memakai sabun khusus suede dan teknik kering yang menjaga bulu tetap lembut dan warna tetap rata. Ideal untuk sneakers dan boots berbahan suede kesayangan Anda.',
    estimatedDays: '3 Hari',
    price: 75000,
  },
  {
    id: 'srv-shoes-leather',
    category: 'shoes',
    name: 'Special Treatment - Leather / Kulit',
    description: 'Pembersihan dan conditioning kulit asli/sintetis untuk menjaga kelembapan serta mencegah kerutan dan pecah.',
    longDescription:
      'Sepatu kulit, asli maupun sintetis, dibersihkan lalu diberi conditioning agar kelembabannya terjaga. Perawatan ini membantu mencegah kerutan dini dan permukaan yang pecah-pecah. Direkomendasikan untuk dress shoes, boots kulit, dan sneakers premium berbahan kulit.',
    estimatedDays: '3 Hari',
    price: 90000,
    popular: true,
  },
  {
    id: 'srv-shoes-kids',
    category: 'shoes',
    name: 'Little One Care (Kids Shoes)',
    description: 'Pembersihan higienis khusus sepatu anak dengan formula ramah anak dan anti-bakteri.',
    longDescription:
      'Sepatu anak cepat kotor karena dipakai aktif setiap hari. Layanan ini memakai formula ramah anak dan anti-bakteri agar sepatu bersih higienis dan aman dipakai kembali. Pilihan praktis untuk sepatu sekolah dan sepatu main.',
    estimatedDays: '2 - 3 Hari',
    price: 40000,
  },
  {
    id: 'srv-shoes-womens',
    category: 'shoes',
    name: 'Womens Care',
    description: 'Deep clean khusus Heels, Wedges, dan Flat shoes.',
    longDescription:
      'Model wanita seperti heels, wedges, dan flat shoes punya bentuk dan material yang butuh ketelitian ekstra. Kami membersihkan setiap lekuknya dengan hati-hati, termasuk hak dan sol yang sering terlewat. Sepatu kembali bersih tanpa merusak bentuk aslinya.',
    estimatedDays: '2 - 3 Hari',
    price: 45000,
  },
  // Bags
  {
    id: 'srv-bag-small',
    category: 'bag',
    name: 'Bag Deep Clean (Small)',
    description: 'Pembersihan tas ukuran kecil (clutch, waist bag, mini sling bag).',
    longDescription:
      'Clutch, waist bag, dan mini sling bag dibersihkan menyeluruh luar dan dalam. Ukurannya yang kecil justru butuh ketelitian karena banyak detail seperti resleting, kantong kecil, dan jahitan tepi. Tas kecil favorit Anda kembali bersih dan siap dipakai.',
    estimatedDays: '3 - 4 Hari',
    price: 65000,
  },
  {
    id: 'srv-bag-medium',
    category: 'bag',
    name: 'Bag Deep Clean (Medium)',
    description: 'Pembersihan tas ukuran sedang (backpack standar, shoulder bag, tote bag).',
    longDescription:
      'Ransel harian, shoulder bag, dan tote bag menampung debu dan noda dari pemakaian setiap hari. Kami membersihkan seluruh permukaan, bagian dalam, tali, dan aksennya satu per satu. Cocok untuk tas kerja, tas kuliah, dan tas traveling ringan.',
    estimatedDays: '3 - 4 Hari',
    price: 85000,
    popular: true,
  },
  {
    id: 'srv-bag-large',
    category: 'bag',
    name: 'Bag Deep Clean (Large)',
    description: 'Pembersihan tas ukuran besar (travel bag, duffel, backpack gunung, tote bag besar).',
    longDescription:
      'Travel bag, duffel, dan carrier gunung berukuran besar dan sering terpapar debu perjalanan. Kami membersihkan seluruh bagiannya termasuk kompartemen dalam dan tali ransel yang tebal. Tas besar Anda kembali segar dan siap untuk perjalanan berikutnya.',
    estimatedDays: '3 - 4 Hari',
    price: 110000,
  },
  // Accessories
  {
    id: 'srv-acc-deepclean',
    category: 'accessories',
    name: 'Hat, Wallet & Pouch Deep Clean',
    description: 'Pembersihan menyeluruh untuk topi (snapback/baseball), dompet, atau pouch kosmetik/gadget.',
    longDescription:
      'Topi yang sering dipakai menumpuk keringat dan debu di bagian dalam. Dompet dan pouch pun menampung kotoran dari tangan dan saku. Kami membersihkan menyeluruh bagian luar dan dalam agar aksesori Anda kembali bersih dan nyaman dipakai sehari-hari.',
    estimatedDays: '2 - 3 Hari',
    price: 30000,
    popular: true,
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  workshopName: 'Fice Shoes Care',
  workshopAddress: 'Pondok Aren, Tangerang Selatan',
  workshopCity: 'Tangerang Selatan',
  workshopLat: DEFAULT_WORKSHOP_COORDS.lat,
  workshopLng: DEFAULT_WORKSHOP_COORDS.lng,
  adminPhone: '08161885553',
  freeRadiusKm: 15,
  minItemsBeyondRadius: 3,
  cutoffHour: 13,
  bankAccountInfo: 'BCA 6030611185 a.n. Fice Shoes Care',
};

// Seed initial demo data for realistic previews
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Dimas Prasetyo',
    phone: '081211110001',
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
  {
    id: 'cust-3',
    name: 'Rizky Aditya',
    phone: '085712345678',
    address: 'Jl. Bintaro Utama Sektor 3A No. 8',
    district: 'Pondok Aren',
    city: 'Tangerang Selatan',
    latitude: -6.2850,
    longitude: 106.6930,
    notes: 'Rumah cat abu-abu pagar besi',
    totalOrders: 1,
    lastOrderAt: '2026-09-10T09:00:00.000Z',
    createdAt: '2026-09-08T14:00:00.000Z',
  },
  {
    id: 'cust-4',
    name: 'Maya Putri',
    phone: '081298765432',
    address: 'Jl. Kemang Selatan XII No. 22',
    district: 'Mampang Prapatan',
    city: 'Jakarta Selatan',
    latitude: -6.2480,
    longitude: 106.8130,
    notes: 'Sebelah minimarket Indomaret',
    totalOrders: 1,
    lastOrderAt: '2026-09-11T14:00:00.000Z',
    createdAt: '2026-09-09T16:00:00.000Z',
  },
  {
    id: 'cust-5',
    name: 'Fajar Nugroho',
    phone: '082145678901',
    address: 'Cluster Duta Mas Blok E12 No. 3, Gading Serpong',
    district: 'Curug',
    city: 'Tangerang',
    latitude: -6.2310,
    longitude: 106.6120,
    notes: 'Pagar hijau depan gang',
    totalOrders: 1,
    lastOrderAt: '2026-09-15T10:00:00.000Z',
    createdAt: '2026-09-14T08:00:00.000Z',
  },
  {
    id: 'cust-6',
    name: 'Siti Nurhaliza',
    phone: '085612349876',
    address: 'Jl. Ciputat Raya No. 99, Pamulang',
    district: 'Pamulang',
    city: 'Tangerang Selatan',
    latitude: -6.3450,
    longitude: 106.7450,
    notes: 'Rumah warna krem dekat SDN 01',
    totalOrders: 1,
    lastOrderAt: '2026-09-16T11:00:00.000Z',
    createdAt: '2026-09-15T07:00:00.000Z',
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
  {
    id: 'ord-103',
    invoiceNumber: 'INV-202609-0003',
    customer: INITIAL_CUSTOMERS[2],
    items: [
      {
        id: 'item-5',
        serviceId: 'srv-shoes-leather',
        serviceName: 'Special Treatment - Leather / Kulit',
        category: 'shoes',
        price: 90000,
        quantity: 1,
        itemNotes: 'Dr. Martens 1460 Black Leather',
      },
      {
        id: 'item-6',
        serviceId: 'srv-bag-small',
        serviceName: 'Bag Deep Clean (Small)',
        category: 'bag',
        price: 65000,
        quantity: 1,
        itemNotes: 'Tas Selempang Zara Hitam',
      },
    ],
    pickupDate: '2026-09-10',
    pickupSlot: 'afternoon',
    status: 'COMPLETED',
    paymentModel: 'MODEL_B',
    paymentStatus: 'PAID',
    paymentMethod: 'TRANSFER',
    distanceKm: 3.2,
    pickupFee: 0,
    subtotal: 155000,
    totalAmount: 155000,
    qcPhotos: [
      {
        id: 'qc-3',
        type: 'BEFORE',
        photoUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
        notes: 'Kulit Dr. Martens kering dan ada goresan ringan di toe box.',
        createdAt: '2026-09-10T15:20:00.000Z',
      },
      {
        id: 'qc-4',
        type: 'AFTER',
        photoUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&auto=format&fit=crop&q=80',
        notes: 'Kulit sudah conditioning, kilap alami pulih dan goresan pudar.',
        createdAt: '2026-09-11T10:00:00.000Z',
      },
    ],
    notes: 'Tolong careful ya, ini sepatu favorit.',
    createdAt: '2026-09-08T14:00:00.000Z',
    updatedAt: '2026-09-11T11:00:00.000Z',
    paidAt: '2026-09-10T16:00:00.000Z',
    customerReview: 'Dr. Martens saya seperti baru lagi! Prosesnya cepat dan documentation QC-nya sangat detail. Recommended banget.',
  },
  {
    id: 'ord-104',
    invoiceNumber: 'INV-202609-0004',
    customer: INITIAL_CUSTOMERS[3],
    items: [
      {
        id: 'item-7',
        serviceId: 'srv-shoes-deepclean',
        serviceName: 'Deep Clean Shoes',
        category: 'shoes',
        price: 65000,
        quantity: 2,
        itemNotes: 'Nike Air Force 1 White & Converse Chuck 70',
      },
    ],
    pickupDate: '2026-09-11',
    pickupSlot: 'morning',
    status: 'COMPLETED',
    paymentModel: 'MODEL_B',
    paymentStatus: 'PAID',
    paymentMethod: 'QRIS',
    distanceKm: 8.5,
    pickupFee: 0,
    subtotal: 130000,
    totalAmount: 130000,
    qcPhotos: [
      {
        id: 'qc-5',
        type: 'BEFORE',
        photoUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
        notes: 'Sepatu putih sudah menguning dan sol kotor parah.',
        createdAt: '2026-09-11T10:15:00.000Z',
      },
      {
        id: 'qc-6',
        type: 'AFTER',
        photoUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&auto=format&fit=crop&q=80',
        notes: 'Putih kembali cerah, sol bersih dan wangi segar.',
        createdAt: '2026-09-12T09:00:00.000Z',
      },
    ],
    notes: '',
    createdAt: '2026-09-09T16:00:00.000Z',
    updatedAt: '2026-09-12T10:00:00.000Z',
    paidAt: '2026-09-11T11:00:00.000Z',
    customerReview: 'Gila sih, Air Force 1 yang udah kuning jadi putih kinclong lagi! Next time mau coba treatment sepatu suede juga.',
  },
  {
    id: 'ord-105',
    invoiceNumber: 'INV-202609-0005',
    customer: INITIAL_CUSTOMERS[4],
    items: [
      {
        id: 'item-8',
        serviceId: 'srv-shoes-suede',
        serviceName: 'Special Treatment - Suede',
        category: 'shoes',
        price: 75000,
        quantity: 1,
        itemNotes: 'New Balance 574 Suede Grey',
      },
      {
        id: 'item-9',
        serviceId: 'srv-bag-large',
        serviceName: 'Bag Deep Clean (Large)',
        category: 'bag',
        price: 110000,
        quantity: 1,
        itemNotes: 'Tas Travel Eiger 40L',
      },
    ],
    pickupDate: '2026-09-15',
    pickupSlot: 'afternoon',
    status: 'COMPLETED',
    paymentModel: 'MODEL_B',
    paymentStatus: 'PAID',
    paymentMethod: 'TRANSFER',
    distanceKm: 15.3,
    pickupFee: 0,
    subtotal: 185000,
    totalAmount: 185000,
    qcPhotos: [
      {
        id: 'qc-7',
        type: 'BEFORE',
        photoUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&auto=format&fit=crop&q=80',
        notes: 'Suede sudah pudar dan ada noda air di bagian heel. Tas travel kotor debu.',
        createdAt: '2026-09-15T15:00:00.000Z',
      },
      {
        id: 'qc-8',
        type: 'AFTER',
        photoUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
        notes: 'Suede pulih warnanya, noda hilang. Tas travel bersih seperti baru.',
        createdAt: '2026-09-16T14:00:00.000Z',
      },
    ],
    notes: 'Sepatu ini mau dipakai weekend, mohon diprioritaskan.',
    createdAt: '2026-09-14T08:00:00.000Z',
    updatedAt: '2026-09-16T15:00:00.000Z',
    paidAt: '2026-09-15T16:00:00.000Z',
    customerReview: 'Warna suede NB 574 saya balik normal, noda air yang membandel hilang total. Tas Eiger juga kinclong. Mantap!',
  },
  {
    id: 'ord-106',
    invoiceNumber: 'INV-202609-0006',
    customer: INITIAL_CUSTOMERS[5],
    items: [
      {
        id: 'item-10',
        serviceId: 'srv-shoes-kids',
        serviceName: 'Little One Care (Kids Shoes)',
        category: 'shoes',
        price: 40000,
        quantity: 3,
        itemNotes: 'Skechers Kids, Sepatu Sekolah Nike, Crocs Anak',
      },
    ],
    pickupDate: '2026-09-16',
    pickupSlot: 'morning',
    status: 'COMPLETED',
    paymentModel: 'MODEL_B',
    paymentStatus: 'PAID',
    paymentMethod: 'QRIS',
    distanceKm: 6.7,
    pickupFee: 0,
    subtotal: 120000,
    totalAmount: 120000,
    qcPhotos: [
      {
        id: 'qc-9',
        type: 'BEFORE',
        photoUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&auto=format&fit=crop&q=80',
        notes: '3 sepatu anak kotor parah, ada bekas cat dan noda makanan.',
        createdAt: '2026-09-16T09:30:00.000Z',
      },
      {
        id: 'qc-10',
        type: 'AFTER',
        photoUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&auto=format&fit=crop&q=80',
        notes: 'Semua sepatu bersih, noda cat hilang, wangi dan higienis.',
        createdAt: '2026-09-17T10:00:00.000Z',
      },
    ],
    notes: 'Anak saya aktif banget, sepatunya kotor setiap hari hehe.',
    createdAt: '2026-09-15T07:00:00.000Z',
    updatedAt: '2026-09-17T11:00:00.000Z',
    paidAt: '2026-09-16T10:00:00.000Z',
    customerReview: '3 sepatu anak saya yang super kotor jadi bersih semua! Anti bakterinya juga penting banget buat sepatu anak. Pasti langganan.',
  },
  {
    id: 'ord-107',
    invoiceNumber: 'INV-202609-0007',
    customer: INITIAL_CUSTOMERS[3],
    items: [
      {
        id: 'item-11',
        serviceId: 'srv-shoes-womens',
        serviceName: 'Womens Care',
        category: 'shoes',
        price: 45000,
        quantity: 1,
        itemNotes: 'Charles & Keith Heels Nude',
      },
      {
        id: 'item-12',
        serviceId: 'srv-bag-small',
        serviceName: 'Bag Deep Clean (Small)',
        category: 'bag',
        price: 65000,
        quantity: 1,
        itemNotes: 'Clutch Zara Gold',
      },
    ],
    pickupDate: '2026-09-18',
    pickupSlot: 'afternoon',
    status: 'COMPLETED',
    paymentModel: 'MODEL_B',
    paymentStatus: 'PAID',
    paymentMethod: 'TRANSFER',
    distanceKm: 8.5,
    pickupFee: 0,
    subtotal: 110000,
    totalAmount: 110000,
    qcPhotos: [
      {
        id: 'qc-11',
        type: 'BEFORE',
        photoUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
        notes: 'Heels berdebu dan ada noda di bagian strap. Clutch kusam.',
        createdAt: '2026-09-18T15:00:00.000Z',
      },
      {
        id: 'qc-12',
        type: 'AFTER',
        photoUrl: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&auto=format&fit=crop&q=80',
        notes: 'Heels kinclong, strap bersih. Clutch gold kembali menyala.',
        createdAt: '2026-09-19T11:00:00.000Z',
      },
    ],
    notes: 'Mau dipakai untuk kondangan Sabtu ini.',
    createdAt: '2026-09-17T09:00:00.000Z',
    updatedAt: '2026-09-19T12:00:00.000Z',
    paidAt: '2026-09-18T17:00:00.000Z',
    customerReview: 'Heels kondangan saya balik mulus, clutch juga kayak baru! Pengerjaannya cepat, adminnya ramah banget.',
  },
  {
    id: 'ord-108',
    invoiceNumber: 'INV-202609-0008',
    customer: INITIAL_CUSTOMERS[5],
    items: [
      {
        id: 'item-13',
        serviceId: 'srv-shoes-kids',
        serviceName: 'Little One Care (Kids Shoes)',
        category: 'shoes',
        price: 40000,
        quantity: 2,
        itemNotes: 'Sepatu Sekolah Bata & Sandal Gunung Anak',
      },
    ],
    pickupDate: '2026-09-19',
    pickupSlot: 'morning',
    status: 'COMPLETED',
    paymentModel: 'MODEL_B',
    paymentStatus: 'PAID',
    paymentMethod: 'QRIS',
    distanceKm: 6.7,
    pickupFee: 0,
    subtotal: 80000,
    totalAmount: 80000,
    qcPhotos: [
      {
        id: 'qc-13',
        type: 'BEFORE',
        photoUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&auto=format&fit=crop&q=80',
        notes: 'Sepatu sekolah penuh noda lumpur dan bau.',
        createdAt: '2026-09-19T10:00:00.000Z',
      },
      {
        id: 'qc-14',
        type: 'AFTER',
        photoUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
        notes: 'Bersih total, wangi segar, siap dipakai sekolah Senin.',
        createdAt: '2026-09-20T09:00:00.000Z',
      },
    ],
    notes: '',
    createdAt: '2026-09-18T08:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    paidAt: '2026-09-19T12:00:00.000Z',
    customerReview: 'Sepatu sekolah anak yang bau lumpur jadi wangi dan bersih! Kurirnya juga tepat waktu banget.',
  },
  {
    id: 'ord-109',
    invoiceNumber: 'INV-202609-0009',
    customer: INITIAL_CUSTOMERS[2],
    items: [
      {
        id: 'item-14',
        serviceId: 'srv-bag-large',
        serviceName: 'Bag Deep Clean (Large)',
        category: 'bag',
        price: 110000,
        quantity: 1,
        itemNotes: 'Duffel Bag Adidas Hitam',
      },
      {
        id: 'item-15',
        serviceId: 'srv-shoes-suede',
        serviceName: 'Special Treatment - Suede',
        category: 'shoes',
        price: 75000,
        quantity: 1,
        itemNotes: 'Clarks Desert Boot Suede Coklat',
      },
    ],
    pickupDate: '2026-09-20',
    pickupSlot: 'morning',
    status: 'COMPLETED',
    paymentModel: 'MODEL_B',
    paymentStatus: 'PAID',
    paymentMethod: 'TRANSFER',
    distanceKm: 3.2,
    pickupFee: 0,
    subtotal: 185000,
    totalAmount: 185000,
    qcPhotos: [
      {
        id: 'qc-15',
        type: 'BEFORE',
        photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        notes: 'Duffel bag bau apek dan bernoda. Suede Clarks kaku dan pudar.',
        createdAt: '2026-09-20T10:30:00.000Z',
      },
      {
        id: 'qc-16',
        type: 'AFTER',
        photoUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
        notes: 'Tas wangi dan bersih. Suede lembut dan warnanya hidup lagi.',
        createdAt: '2026-09-21T13:00:00.000Z',
      },
    ],
    notes: 'Tas buat mudik minggu depan.',
    createdAt: '2026-09-19T15:00:00.000Z',
    updatedAt: '2026-09-21T14:00:00.000Z',
    paidAt: '2026-09-20T16:00:00.000Z',
    customerReview: 'Duffel yang bau apek jadi wangi, Clarks suede saya lentur lagi! Worth it banget plus gratis antar-jemput.',
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
    usageLimitPerCustomer: 1,
    usedBy: [],
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
  if (!fs.existsSync(DATA_FILE)) {
    const initialDb: DatabaseSchema = {
      services: DEFAULT_SERVICES,
      customers: INITIAL_CUSTOMERS,
      orders: INITIAL_ORDERS,
      settings: DEFAULT_SETTINGS,
      promos: DEFAULT_PROMOS,
    };
    writeDb(initialDb);
    return initialDb;
  }
  // ponytail: korrupt = error keras, bukan fallback seed (fallback = data asli tertimpa demo).
  // Upgrade path: SQLite dengan constraint + transaction saat migrasi DB.
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  const parsed = JSON.parse(data) as DatabaseSchema;
  if (!parsed.promos) {
    parsed.promos = DEFAULT_PROMOS;
    writeDb(parsed);
  }
  return parsed;
}

function writeDb(data: DatabaseSchema): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DATA_FILE);
}

// Service Methods
// ponytail: db.json lama tidak punya longDescription (seed sekali saat file dibuat),
// jadi merge dari DEFAULT_SERVICES saat baca, tanpa menimpa data yang sudah ada.
function withLongDescription(s: Service): Service {
  if (s.longDescription) return s;
  const fallback = DEFAULT_SERVICES.find((d) => d.id === s.id);
  return fallback?.longDescription ? { ...s, longDescription: fallback.longDescription } : s;
}

export function getServices(): Service[] {
  return readDb().services.map(withLongDescription);
}

export function getServiceById(id: string): Service | undefined {
  const found = readDb().services.find((s) => s.id === id);
  return found ? withLongDescription(found) : undefined;
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

// Lookup publik untuk tracking via nomor HP: cocok PERSIS (bukan sebagian)
// setelah normalisasi 0…/62…, urut terbaru dulu.
export function getOrdersByPhone(rawPhone: string): Order[] {
  const key = normalizeIdPhone(rawPhone);
  if (!key) return [];
  return readDb()
    .orders.filter((o) => normalizeIdPhone(o.customer.phone) === key)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createOrder(
  newOrder: Omit<Order, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'qcPhotos'>
): Order {
  const db = readDb();
  const id =
    'ord-' +
    Date.now() +
    '-' +
    Math.random().toString(36).slice(2, 6);
  let invoiceNumber = generateInvoiceNumber(db.orders.length);
  // Guard against the (extremely unlikely) random collision
  let guard = 0;
  while (db.orders.some((o) => o.invoiceNumber === invoiceNumber) && guard < 5) {
    invoiceNumber = generateInvoiceNumber(db.orders.length);
    guard += 1;
  }
  const now = new Date().toISOString();

  // Save or update customer (match by cleaned digits so 0812… / 62812… / 0812-… unify)
  const incomingDigits = cleanPhoneDigits(newOrder.customer.phone);
  const existingCustIdx = db.customers.findIndex(
    (c) => cleanPhoneDigits(c.phone) === incomingDigits
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

  // If order used promoCode, increment usage + record phone for per-customer cap
  if (newOrder.promoCode) {
    const promo = (db.promos || []).find(
      (p) => p.code.toUpperCase() === newOrder.promoCode?.trim().toUpperCase()
    );
    if (promo) {
      promo.usedCount = (promo.usedCount || 0) + 1;
      const phoneKey = normalizeIdPhone(savedCustomer.phone);
      if (phoneKey) {
        promo.usedBy = promo.usedBy || [];
        if (!promo.usedBy.includes(phoneKey)) promo.usedBy.push(phoneKey);
      }
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

// QC photos disimpan sebagai file (bukan base64 inline) supaya db.json tetap kecil.
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');
const QC_ALLOWED_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

function saveDataUrlAsFile(dataUrl: string): string {
  const m = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!m) throw new Error('Format foto tidak valid (harus data URL base64)');
  const ext = QC_ALLOWED_EXT[m[1].toLowerCase()];
  if (!ext) throw new Error('Tipe foto harus PNG/JPEG/WebP');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length === 0 || buf.length > 5 * 1024 * 1024) {
    throw new Error('Ukuran foto 0 - 5 MB');
  }
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const name = `qc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, name), buf);
  return `/api/uploads/${name}`;
}

export function addQCPhoto(
  orderId: string,
  photo: { type: 'BEFORE' | 'AFTER'; photoUrl: string; notes?: string }
): Order | null {
  const storedUrl = photo.photoUrl.startsWith('data:')
    ? saveDataUrlAsFile(photo.photoUrl)
    : photo.photoUrl;
  const db = readDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (order) {
    const qcPhoto: QualityCheckPhoto = {
      id: 'qc-' + Date.now(),
      type: photo.type,
      photoUrl: storedUrl,
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

export function deleteQCPhoto(orderId: string, photoId: string): Order | null {
  const db = readDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;
  const removed = order.qcPhotos.find((p) => p.id === photoId);
  const before = order.qcPhotos.length;
  order.qcPhotos = order.qcPhotos.filter((p) => p.id !== photoId);
  if (order.qcPhotos.length !== before) {
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    if (removed && removed.photoUrl.startsWith('/api/uploads/')) {
      const file = path.basename(removed.photoUrl);
      try {
        fs.unlinkSync(path.join(UPLOADS_DIR, file));
      } catch {
        // file sudah hilang: biarkan, metadata tetap konsisten
      }
    }
  }
  return order;
}

// Customer CRM Methods
export function getCustomers(): Customer[] {
  return readDb().customers.sort(
    (a, b) =>
      new Date(b.lastOrderAt || b.createdAt).getTime() -
      new Date(a.lastOrderAt || a.createdAt).getTime()
  );
}

export interface TestimonialShowcase {
  id: string;
  firstName: string;
  area: string;
  services: string[];
  beforePhoto?: string;
  afterPhoto?: string;
  review?: string;
  completedAt: string;
}

// Only real completed orders with both QC photos, anonymized (first name + district)
export function getTestimonialShowcase(): TestimonialShowcase[] {
  return readDb()
    .orders.filter((o) => o.status === 'COMPLETED')
    .map((o) => {
      const before = [...o.qcPhotos].reverse().find((p) => p.type === 'BEFORE');
      const after = [...o.qcPhotos].reverse().find((p) => p.type === 'AFTER');
      return {
        id: o.id,
        firstName: o.customer.name.trim().split(/\s+/)[0],
        area: o.customer.district || o.customer.city,
        services: o.items.map((i) => `${i.quantity}x ${i.serviceName}`),
        beforePhoto: before?.photoUrl,
        afterPhoto: after?.photoUrl,
        review: o.customerReview,
        completedAt: o.updatedAt,
      };
    })
    .filter((t) => t.beforePhoto && t.afterPhoto)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

export function updateCustomerReview(id: string, review: string): Order | null {
  const db = readDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return null;
  const clean = review.trim().slice(0, 300);
  order.customerReview = clean.length > 0 ? clean : undefined;
  writeDb(db);
  return order;
}

// Settings Methods
export function getSettings(): SystemSettings {
  return readDb().settings;
}

const SETTING_KEYS: (keyof SystemSettings)[] = [
  'workshopName', 'workshopAddress', 'workshopCity', 'workshopLat', 'workshopLng',
  'adminPhone', 'freeRadiusKm', 'minItemsBeyondRadius', 'cutoffHour',
  'qrisImageUrl', 'bankAccountInfo',
];
const NUMERIC_SETTINGS: (keyof SystemSettings)[] = [
  'workshopLat', 'workshopLng', 'freeRadiusKm', 'minItemsBeyondRadius', 'cutoffHour',
];

export function updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
  // Whitelist key + tipe: body API tidak bisa nyuntik field asing ke db.
  const clean: Partial<SystemSettings> = {};
  for (const key of SETTING_KEYS) {
    const value = (newSettings as Record<string, unknown>)[key];
    if (value === undefined) continue;
    if (NUMERIC_SETTINGS.includes(key)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        (clean as Record<string, number>)[key] = value;
      }
    } else if (typeof value === 'string') {
      (clean as Record<string, string>)[key] = value.trim().slice(0, 500);
    }
  }
  const db = readDb();
  db.settings = { ...db.settings, ...clean };
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
  subtotal: number,
  phone?: string
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

  // Check per-customer limit (e.g. promo khusus pelanggan baru, 1x per nomor WA)
  if (promo.usageLimitPerCustomer && phone) {
    const key = normalizeIdPhone(phone);
    const alreadyUsed = key !== '' && (promo.usedBy || []).includes(key);
    if (alreadyUsed) {
      return {
        valid: false,
        message: `Nomor Anda sudah pernah memakai kode ${promo.code}. Promo ini maksimal ${promo.usageLimitPerCustomer}x per pelanggan.`,
      };
    }
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
