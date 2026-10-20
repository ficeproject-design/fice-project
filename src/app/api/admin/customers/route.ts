import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, getSettings } from '@/lib/db';
import { buildSuggestedSellingMessage, createWhatsAppUrl } from '@/lib/invoice';

export async function GET(req: NextRequest) {
  try {
    const customers = getCustomers();
    const settings = getSettings();
    // Link absolut supaya bisa diklik dari WhatsApp (localhost tidak berguna di HP pelanggan).
    const origin = new URL(req.url).origin;

    // Attach pre-generated WhatsApp promo links for quick CRM marketing
    const enrichedCustomers = customers.map((c) => {
      const message = buildSuggestedSellingMessage(
        c.name,
        'Sepatu & Tas kesayangan',
        settings,
        origin
      );
      const waUrl = createWhatsAppUrl(c.phone, message);
      return {
        ...c,
        suggestedSellingMessage: message,
        waUrl,
      };
    });

    return NextResponse.json({ success: true, data: enrichedCustomers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat daftar pelanggan' },
      { status: 500 }
    );
  }
}
