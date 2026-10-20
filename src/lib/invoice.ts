// Invoice and WhatsApp message generator utilities
import type { SystemSettings } from './types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateInvoiceNumber(_existingCount: number = 0): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  // Uniqueness: base36 timestamp slice + 3 random alphanumerics.
  // Ignores order count so deletes / concurrent creates can't collide.
  const timePart = Date.now().toString(36).toUpperCase().slice(-3);
  const randPart = Math.random()
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3)
    .padEnd(3, 'X');
  return `INV-${year}${month}-${timePart}${randPart}`;
}

/**
 * Creates WhatsApp click-to-chat URL with encoded text.
 */
export function createWhatsAppUrl(phone: string, message: string): string {
  // Normalize Indonesian phone number (e.g. 0812... -> 62812...)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Message template for Suggested Selling / CRM Follow up to repeat customers.
 */
export function buildSuggestedSellingMessage(
  customerName: string,
  lastService: string = 'Sepatu kesayangan',
  settings: SystemSettings,
  baseUrl: string = ''
): string {
  return `Halo Kak *${customerName}*! 👋
Semoga harinya menyenangkan! 

Sudah beberapa waktu sejak perawatan terakhir untuk *${lastService}* Kakak di *${settings.workshopName}*. 

Apakah sepatu atau tas Kakak sudah mulai kotor dan butuh dicuci lagi? Kami masih menyediakan layanan *100% FREE ANTAR-JEMPUT* untuk area Jaksel, Tangsel, dan Tangerang loh! 🛵✨

Kakak bisa langsung jadwalkan penjemputan baru melalui link ini ya:
👉 ${baseUrl}/order

Jika ada pertanyaan, langsung balas chat ini ya Kak! Terima kasih 🙏👟`;
}
