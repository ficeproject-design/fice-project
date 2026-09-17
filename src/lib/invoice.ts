// Invoice and WhatsApp message generator utilities
import { Order, SystemSettings } from './types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateInvoiceNumber(existingCount: number = 0): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const sequence = String(existingCount + 1).padStart(4, '0');
  return `INV-${year}${month}-${sequence}`;
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
 * Message template sent to customer upon order creation / confirmation.
 */
export function buildOrderConfirmationMessage(
  order: Order,
  settings: SystemSettings,
  baseUrl: string = 'http://localhost:3000'
): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.serviceName} (${item.quantity}x) - ${formatRupiah(
          item.price * item.quantity
        )}${item.itemNotes ? `\n   Catatan: ${item.itemNotes}` : ''}`
    )
    .join('\n');

  const paymentText = settings.bankAccountInfo
    ? `Transfer Bank. Tagihan terbit setelah sepatu diverifikasi di workshop. Rekening: ${settings.bankAccountInfo}`
    : 'Transfer Bank ke rekening resmi Fice Shoes Care. Tagihan terbit setelah sepatu diverifikasi di workshop.';

  const promoText =
    order.promoCode && order.discountAmount && order.discountAmount > 0
      ? `\n🎟️ *Diskon Promo (${order.promoCode}):* -${formatRupiah(order.discountAmount)}`
      : '';

  return `Halo Kak *${order.customer.name}*! 👋
Terima kasih telah memesan layanan di *${settings.workshopName}*.

Berikut rincian pesanan Anda:
━━━━━━━━━━━━━━━━━━━━
📄 *No. Invoice:* ${order.invoiceNumber}
📅 *Jadwal Jemput:* ${order.pickupDate} (${order.pickupSlot === 'morning' ? 'Slot Pagi 09.00-13.00' : 'Slot Siang/Sore 14.00-18.00'})
📍 *Alamat Jemput:* ${order.customer.address}, ${order.customer.district}, ${order.customer.city}
🛵 *Biaya Antar-Jemput:* GRATIS (Radius ${order.distanceKm} km)

📦 *Rincian Item:*
${itemsText}${promoText}

💰 *Total Pembayaran:* *${formatRupiah(order.totalAmount)}*
💳 *Metode Bayar:* ${paymentText}
━━━━━━━━━━━━━━━━━━━━

🔎 *Lacak Status & Cek Invoice:*
${baseUrl}/track/${order.invoiceNumber}

Kurir kami akan menghubungi Kakak saat hendak menuju lokasi penjemputan. Terima kasih! 🙏👟`;
}

/**
 * Message template for Suggested Selling / CRM Follow up to repeat customers.
 */
export function buildSuggestedSellingMessage(
  customerName: string,
  lastService: string = 'Sepatu kesayangan',
  settings: SystemSettings
): string {
  return `Halo Kak *${customerName}*! 👋
Semoga harinya menyenangkan! 

Sudah beberapa waktu sejak perawatan terakhir untuk *${lastService}* Kakak di *${settings.workshopName}*. 

Apakah sepatu atau tas Kakak sudah mulai kotor dan butuh dicuci lagi? Kami masih menyediakan layanan *100% FREE ANTAR-JEMPUT* untuk area Jaksel, Tangsel, dan Tangerang loh! 🛵✨

Kakak bisa langsung jadwalkan penjemputan baru melalui link ini ya:
👉 http://localhost:3000/order

Jika ada pertanyaan, langsung balas chat ini ya Kak! Terima kasih 🙏👟`;
}
