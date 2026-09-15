import { NextResponse } from 'next/server';
import { getRevenueSummary } from '@/lib/db';

export async function GET() {
  try {
    const summary = getRevenueSummary();
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat rekap pendapatan' },
      { status: 500 }
    );
  }
}
