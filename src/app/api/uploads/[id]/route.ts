import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');
const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const SAFE_NAME = /^[a-z0-9._-]{1,80}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!SAFE_NAME.test(id)) {
    return NextResponse.json({ success: false, error: 'Nama file tidak valid' }, { status: 400 });
  }
  const file = path.join(UPLOADS_DIR, id);
  if (!file.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(file)) {
    return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 404 });
  }
  const ext = path.extname(id).toLowerCase();
  const type = TYPES[ext];
  if (!type) {
    return NextResponse.json({ success: false, error: 'Tipe file tidak didukung' }, { status: 404 });
  }
  return new NextResponse(fs.readFileSync(file), {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
