import { NextResponse } from 'next/server';
import { getTestimonialShowcase } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: getTestimonialShowcase() });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat testimoni' },
      { status: 500 }
    );
  }
}
