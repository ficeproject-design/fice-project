# Fice Shoes Care

Web order jasa cuci dan perawatan sepatu, tas, dan aksesori dengan free antar-jemput. Berisi landing page, wizard order pelanggan, pelacakan pesanan, dan panel admin (order, CRM pelanggan, promo, pengaturan workshop).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Leaflet (peta pemilihan titik jemput)
- Database: file JSON di `data/db.json`, diakses lewat `src/lib/db.ts`. Bukan untuk multi-instance.

## Menjalankan

```bash
npm ci
cp .env.example .env.local   # isi ADMIN_PASSWORD dan AUTH_SECRET
npm run dev
```

- Website: http://localhost:3000
- Panel admin: http://localhost:3000/admin (login pakai `ADMIN_PASSWORD`)
- Test murni (haversine/phone/invoice): `npm test`

## Catatan keamanan & runtime

- `data/db.json` dan `data/uploads/` di-gitignore; `db.json` dibuat otomatis (seed demo) saat first run. Backup manual folder `data/`.
- Foto QC disimpan sebagai file di `data/uploads/`, disajikan lewat `/api/uploads/[id]` (bukan base64 di db).
- `GET /api/orders` (daftar penuh) khusus admin; pelacakan publik hanya per invoice via `/api/orders/[id]` — nomor invoice efektif sebagai kunci akses, jangan di-share publik.
- Login admin & pembuatan order dibatasi rate-limit in-memory (per proses, sesuai asumsi instance tunggal).

## Struktur

```
src/
  app/
    page.tsx            Landing
    order/              Wizard pemesanan
    track/              Cek status via nomor invoice
    tentang/            Profil
    admin/              Panel admin (dashboard, orders, customers, promos, settings)
    api/                Route handlers
  components/           Navbar, Footer, MapPicker, StatusBadge
  lib/                  db.ts (JSON store), haversine.ts (radius jemput), invoice.ts, types.ts, auth.ts
  proxy.ts              Gerbang auth admin (runs sebelum request)
data/db.json            Semua data: services, customers, orders, promos, settings
```

## Catatan deploy

`data/db.json` ditulis lewat filesystem, jadi butuh instance tunggal dengan disk persisten (bukan serverless). Untuk scale: migrasi ke SQLite/Postgres, interface `src/lib/db.ts` tinggal diganti.
