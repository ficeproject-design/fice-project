'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Camera,
  Search,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Download,
} from 'lucide-react';
import { Order, QualityCheckPhoto } from '@/lib/types';

type PhotoFilter = 'ALL' | 'BEFORE' | 'AFTER';

function extOf(url: string): string {
  if (url.startsWith('data:image/png')) return 'png';
  if (url.startsWith('data:image/webp')) return 'webp';
  if (url.startsWith('data:')) return 'jpg';
  const m = url.split('?')[0].match(/\.(png|jpe?g|webp|gif)$/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function QcGallery() {
  const searchParams = useSearchParams();
  const invoiceParam = searchParams.get('invoice');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PhotoFilter>('ALL');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      } else {
        setError('Gagal memuat data pesanan dari server.');
      }
    } catch {
      setError('Koneksi ke server gagal. Periksa lalu muat ulang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadOrders();
    })();
  }, []);

  const qcOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders
      .filter((o) => o.qcPhotos.length > 0)
      .filter(
        (o) =>
          !q ||
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
      )
      .map((o) => ({
        order: o,
        photos: o.qcPhotos.filter((p) => filter === 'ALL' || p.type === filter),
      }))
      .filter((g) => g.photos.length > 0);
  }, [orders, searchQuery, filter]);

  const flat: Array<{ photo: QualityCheckPhoto; order: Order }> = useMemo(
    () => qcOrders.flatMap((g) => g.photos.map((p) => ({ photo: p, order: g.order }))),
    [qcOrders]
  );

  const downloadOne = async (photo: QualityCheckPhoto, order: Order, n: number) => {
    const filename = `${order.invoiceNumber}-${photo.type.toLowerCase()}-${n}.${extOf(photo.photoUrl)}`;
    try {
      const res = await fetch(photo.photoUrl);
      if (!res.ok) throw new Error('bad response');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      triggerDownload(url, filename);
      URL.revokeObjectURL(url);
    } catch {
      window.open(photo.photoUrl, '_blank');
    }
  };

  const downloadAllOfOrder = async (order: Order, photos: QualityCheckPhoto[]) => {
    setDownloading(order.invoiceNumber);
    for (let i = 0; i < photos.length; i++) {
      await downloadOne(photos[i], order, i + 1);
      await new Promise((r) => setTimeout(r, 350));
    }
    setDownloading(null);
  };

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((i) => (i === null || flat.length === 0 ? i : (i + 1) % flat.length));
      if (e.key === 'ArrowLeft')
        setLightbox((i) => (i === null || flat.length === 0 ? i : (i - 1 + flat.length) % flat.length));
    };
    window.addEventListener('keydown', onKey);
    lightboxRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, flat.length]);

  useEffect(() => {
    if (!invoiceParam || loading) return;
    const el = document.getElementById(`qc-${invoiceParam}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#qc-${invoiceParam}`);
    }
  }, [invoiceParam, loading, qcOrders.length]);

  const totalPhotos = flat.length;
  const current = lightbox !== null ? flat[lightbox] : null;

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs space-y-2">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#f06a60]" />
        <p>Memuat galeri dokumentasi foto QC...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">{error}</p>
        <button
          type="button"
          onClick={loadOrders}
          className="inline-flex items-center gap-2 bg-[#0d1526] hover:bg-[#f06a60] text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] tracking-tight uppercase">
            Galeri Dokumentasi Foto QC
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Semua foto kondisi awal dan hasil akhir setiap pesanan. Klik foto untuk memperbesar.
          </p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="inline-flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl transition-colors shadow-xs w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Muat Ulang Data
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Invoice, Nama, atau No WA..."
            aria-label="Cari pesanan"
            className="w-full text-xs pl-9 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d1526] bg-slate-50/70"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-700 p-1"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0" role="group" aria-label="Filter jenis foto">
          {(['ALL', 'BEFORE', 'AFTER'] as PhotoFilter[]).map((f) => {
            const count =
              f === 'ALL'
                ? orders.reduce((s, o) => s + o.qcPhotos.length, 0)
                : orders.reduce((s, o) => s + o.qcPhotos.filter((p) => p.type === f).length, 0);
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#0d1526] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span>{f === 'ALL' ? 'Semua' : f === 'BEFORE' ? 'Kondisi Awal' : 'Hasil Akhir'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {qcOrders.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <Camera className="w-8 h-8 text-slate-300 mx-auto" />
          {totalPhotos === 0 && orders.every((o) => o.qcPhotos.length === 0) ? (
            <>
              <p className="text-sm font-bold text-slate-700">Belum ada foto QC tersimpan</p>
              <p className="text-xs text-slate-500">
                Unggah foto kondisi awal saat barang tiba di workshop melalui halaman detail pesanan.
              </p>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 bg-[#0d1526] hover:bg-[#f06a60] text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors"
              >
                Buka Daftar Order
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-700">Tidak ada hasil yang cocok</p>
              <p className="text-xs text-slate-500">
                Coba ubah kata kunci pencarian atau ganti filter jenis foto.
              </p>
            </>
          )}
        </div>
      )}

      {qcOrders.map(({ order, photos }) => {
        const beforeCount = order.qcPhotos.filter((p) => p.type === 'BEFORE').length;
        const afterCount = order.qcPhotos.filter((p) => p.type === 'AFTER').length;
        return (
          <section
            key={order.id}
            id={`qc-${order.invoiceNumber}`}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 scroll-mt-6 transition-shadow target:border-[#f06a60] target:ring-2 target:ring-[#f06a60]/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-mono font-bold text-sm text-[#0d1526] hover:text-[#f06a60] transition-colors"
                >
                  {order.invoiceNumber}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">
                  <strong className="text-slate-700">{order.customer.name}</strong>
                  {' · Jemput '}
                  {order.pickupDate}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                {beforeCount > 0 && (
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                    {beforeCount} Before
                  </span>
                )}
                {afterCount > 0 && (
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {afterCount} After
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => downloadAllOfOrder(order, photos)}
                  disabled={downloading !== null}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:border-[#f06a60] hover:text-[#f06a60] transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label={`Unduh semua foto QC ${order.invoiceNumber}`}
                >
                  <Download className="w-3 h-3" />
                  {downloading === order.invoiceNumber
                    ? `Mengunduh ${photos.length}...`
                    : `Unduh Semua (${photos.length})`}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((p) => {
                const flatIdx = flat.findIndex((f) => f.photo.id === p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLightbox(flatIdx)}
                    aria-label={`Perbesar foto ${p.type === 'BEFORE' ? 'kondisi awal' : 'hasil akhir'} ${order.invoiceNumber}`}
                    className="group text-left rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f06a60] cursor-pointer"
                  >
                    <img
                      src={p.photoUrl}
                      alt={`Foto QC ${p.type} ${order.invoiceNumber}`}
                      className="w-full h-36 sm:h-40 object-cover group-hover:scale-[1.02] transition-transform"
                      loading="lazy"
                    />
                    <div className="p-2.5 space-y-1">
                      <span
                        className={`inline-block font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wide ${
                          p.type === 'BEFORE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.type === 'BEFORE' ? 'Kondisi Awal' : 'Hasil Akhir'}
                      </span>
                      {p.notes && <p className="text-[11px] text-slate-600 line-clamp-2">{p.notes}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Lightbox */}
      {current && (
        <div
          ref={lightboxRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto QC ${current.photo.type} pesanan ${current.order.invoiceNumber}`}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col focus:outline-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(null);
          }}
        >
          <div className="flex items-center justify-between gap-3 p-4 sm:p-5 text-white shrink-0">
            <div className="min-w-0">
              <p className="font-mono font-bold text-sm truncate">{current.order.invoiceNumber}</p>
              <p className="text-[11px] text-white/70 truncate">
                {current.order.customer.name}
                {' · '}
                {current.photo.type === 'BEFORE' ? 'Kondisi Awal' : 'Hasil Akhir'}
                {' · '}
                {new Date(current.photo.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-white/70">
                {(lightbox ?? 0) + 1} dari {totalPhotos}
              </span>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Tutup galeri foto"
                className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 px-4 pb-2 flex items-center justify-center">
            <img
              src={current.photo.photoUrl}
              alt={`Foto QC ${current.photo.type} ${current.order.invoiceNumber}`}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setLightbox((i) => (i === null || flat.length === 0 ? i : (i - 1 + flat.length) % flat.length))}
              aria-label="Foto sebelumnya"
              className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-[#f06a60] text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setLightbox((i) => (i === null || flat.length === 0 ? i : (i + 1) % flat.length))}
              aria-label="Foto berikutnya"
              className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-[#f06a60] text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => downloadOne(current.photo, current.order, (lightbox ?? 0) + 1)}
              aria-label="Unduh foto ini"
              title="Unduh foto ini"
              className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-[#f06a60] text-white transition-colors cursor-pointer"
            >
              <Download className="w-5 h-5" />
            </button>
            <p className="text-xs text-white/80 leading-snug min-w-0">
              {current.photo.notes || 'Tanpa catatan kondisi fisik.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminQcPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-500 text-xs">Memuat galeri...</div>
      }
    >
      <QcGallery />
    </Suspense>
  );
}
