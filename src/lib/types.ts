export type ServiceCategory = 'shoes' | 'bag' | 'accessories';

export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  estimatedDays: string;
  price: number;
  icon?: string;
  popular?: boolean;
}

export type OrderStatus =
  | 'WAITING_PICKUP'    // Menunggu Penjemputan oleh kurir
  | 'PICKING_UP'        // Kurir sedang menuju lokasi
  | 'IN_WORKSHOP'       // Sepatu telah tiba di workshop
  | 'IN_PROGRESS'       // Sedang dalam proses cuci / treatment
  | 'READY_TO_DELIVER'  // Selesai dicuci, siap diantar
  | 'DELIVERING'        // Kurir sedang mengantar kembali ke pelanggan
  | 'COMPLETED'         // Selesai diterima oleh pelanggan
  | 'CANCELLED';        // Dibatalkan

export type PaymentModel = 
  | 'MODEL_B' // Bayar setelah sepatu tiba & diverifikasi di workshop
  | 'MODEL_C'; // Bayar setelah pengerjaan selesai / COD saat antar

export type PaymentStatus = 'UNPAID' | 'PAID';

export type PaymentMethod = 'QRIS' | 'TRANSFER' | 'COD';

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  price: number;
  quantity: number;
  itemNotes?: string; // e.g. "Nike Dunk Low Panda - size 42"
}

export interface QualityCheckPhoto {
  id: string;
  type: 'BEFORE' | 'AFTER';
  photoUrl: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string; // WhatsApp
  address: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  notes?: string; // Patokan rumah (misal: "Pagar hitam depan pos ronda")
  totalOrders: number;
  lastOrderAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  invoiceNumber: string; // e.g. "INV-202609-001"
  customer: Customer;
  items: OrderItem[];
  pickupDate: string; // YYYY-MM-DD
  pickupSlot: 'morning' | 'afternoon'; // 'morning' (09.00 - 13.00), 'afternoon' (14.00 - 18.00)
  status: OrderStatus;
  paymentModel: PaymentModel;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  distanceKm: number;
  pickupFee: number; // Always 0 (Free pickup & delivery branding)
  subtotal: number;
  promoCode?: string; // Kode promo yang digunakan (e.g. "FICEBARU")
  discountAmount?: number; // Nominal diskon yang didapatkan
  totalAmount: number;
  qcPhotos: QualityCheckPhoto[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export type PromoDiscountType = 'PERCENT' | 'FIXED';

export interface PromoCode {
  id: string;
  code: string; // Kode unik uppercase (e.g. "FICEBARU")
  discountType: PromoDiscountType; // 'PERCENT' (diskon %) atau 'FIXED' (potongan nominal Rp)
  discountValue: number; // Nilai diskon (contoh: 15 untuk 15% atau 10000 untuk Rp 10.000)
  minOrderAmount?: number; // Minimal subtotal order untuk menggunakan promo
  maxDiscount?: number; // Maksimal nominal diskon jika bertipe persentase
  validUntil?: string; // Tanggal batas promo berakhir (YYYY-MM-DD)
  usageLimit?: number; // Batas total penggunaan kode promo
  usedCount: number; // Jumlah yang sudah digunakan
  isActive: boolean; // Status aktif / non-aktif
  description?: string; // Keterangan promo
  createdAt: string;
}

export interface SystemSettings {
  workshopName: string;
  workshopAddress: string;
  workshopCity: string;
  workshopLat: number;
  workshopLng: number;
  adminPhone: string; // WhatsApp number
  freeRadiusKm: number; // default: 20
  minItemsBeyondRadius: number; // default: 3
  cutoffHour: number; // default: 13
  qrisImageUrl?: string;
  bankAccountInfo?: string;
}
