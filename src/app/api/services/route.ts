import { NextResponse } from 'next/server';
import { getServices } from '@/lib/db';

export async function GET() {
  try {
    const services = getServices();
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat katalog layanan' },
      { status: 500 }
    );
  }
}
