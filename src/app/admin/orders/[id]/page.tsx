'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  MapPin,
  Navigation,
  Copy,
  Check,
  Camera,
  Upload,
  Trash2,
  CreditCard,
  Truck,
  Tag,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Quote,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types';
import { formatRupiah, createWhatsAppUrl } from '@/lib/invoice';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/StatusBadge';

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'WAITING_PICKUP', label: '1. Menunggu Penjemputan' },
  { value: 'PICKING_UP', label: '2. Kurir Menuju Lokasi' },
  { value: 'IN_WORKSHOP', label: '3. Tiba di Workshop' },
  { value: 'IN_PROGRESS', label: '4. Sedang Dikerjakan / Cuci' },
  { value: 'READY_TO_DELIVER', label: '5. Selesai & Siap Diantar' },
  { value: 'DELIVERING', label: '6. Kurir Mengantar Kembali' },
  { value: 'COMPLETED', label: '7. Pesanan Selesai' },
  { value: 'CANCELLED', label: 'X. Dibatalkan' },
];

const PIPELINE: OrderStatus[] = [
  'WAITING_PICKUP',
  'PICKING_UP',
  'IN_WORKSHOP',
  'IN_PROGRESS',
  'READY_TO_DELIVER',
  'DELIVERING',
  'COMPLETED',
];

function getGoogleMapsUrl(lat?: number, lng?: number, fallbackAddress?: string) {
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress || '')}`;
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const [draftStatus, setDraftStatus] = useState<OrderStatus>('WAITING_PICKUP');
  const [draftPayStatus, setDraftPayStatus] = useState<PaymentStatus>('UNPAID');

  const [qcType, setQcType] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const [qcPhotoUrl, setQcPhotoUrl] = useState('');
  const [qcNotes, setQcNotes] = useState('');
  const [draftReview, setDraftReview] = useState('');

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        setDraftStatus(json.data.status);
        setDraftPayStatus(json.data.paymentStatus);
        setDraftReview(json.data.customerReview || '');
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadOrder();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const showFeedback = (kind: 'ok' | 'err', text: string) => {
    setFeedback({ kind, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const patch = async (body: Record<string, unknown>, okText: string) => {
    if (!order) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        setDraftStatus(json.data.status);
        setDraftPayStatus(json.data.paymentStatus);
        setDraftReview(json.data.customerReview || '');
        showFeedback('ok', okText);
      } else {
        showFeedback('err', json.error || 'Gagal menyimpan perubahan.');
      }
    } catch {
      showFeedback('err', 'Koneksi ke server gagal. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddQCPhoto = async () => {
    if (!qcPhotoUrl.trim()) return;
    await patch(
      {
        action: 'add_qc_photo',
        qcPhoto: {
          type: qcType,
          photoUrl: qcPhotoUrl.trim(),
          notes: qcNotes.trim() || undefined,
        },
      },
      `Foto QC ${qcType === 'BEFORE' ? 'kondisi awal' : 'hasil akhir'} tersimpan.`
    );
    setQcPhotoUrl('');
    setQcNotes('');
  };

  const handleRemoveQCPhoto = async (photoId: string) => {
    if (!window.confirm('Hapus foto QC ini? Tindakan tidak bisa dibatalkan.')) return;
    await patch({ action: 'remove_qc_photo', photoId }, 'Foto QC dihapus.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setQcPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCopyAddress = () => {
    if (!order) return;
    const mapsUrl = getGoogleMapsUrl(
      order.customer.latitude,
      order.customer.longitude,
      `${order.customer.address}, ${order.customer.city}`
    );
    const text =
      `*PENJEMPUTAN - FICE SHOES CARE*\n` +
      `No. Invoice: ${order.invoiceNumber}\n` +
      `Pelanggan: ${order.customer.name} (${order.customer.phone})\n` +
      `Jadwal: ${order.pickupDate} (${order.pickupSlot === 'morning' ? 'Slot Pagi 09-13' : 'Slot Siang 14-18'})\n` +
      `Alamat: ${order.customer.address}, Kec. ${order.customer.district || '-'}, ${order.customer.city}\n` +
      (order.customer.notes ? `Patokan: ${order.customer.notes}\n` : '') +
      `Jarak Workshop: ${order.distanceKm} km\n` +
      `Link Google Maps: ${mapsUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs space-y-2">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#f06a60]" />
        <p>Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order || notFound) {
    return (
      <div className="py-24 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="font-bold text-slate-700 text-sm">Pesanan tidak ditemukan</p>
        <p className="text-xs text-slate-500">
          Invoice mungkin sudah dihapus, atau tautan tidak benar.
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0d1526] hover:bg-[#f06a60] text-white px-4 py-3 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Daftar Order
        </Link>
      </div>
    );
  }

  const idx = PIPELINE.indexOf(order.status);
  const nextStatus = order.status !== 'CANCELLED' && idx >= 0 && idx < PIPELINE.length - 1
    ? PIPELINE[idx + 1]
    : null;
  const nextLabel = nextStatus
    ? STATUS_OPTIONS.find((o) => o.value === nextStatus)?.label?.replace(/^\d+\.\s*/, '')
    : null;
  const waUrl = createWhatsAppUrl(
    order.customer.phone,
    `Halo Kak ${order.customer.name}, update pesanan *${order.invoiceNumber}* di Fice Shoes Care. Rincian dan foto QC bisa dicek di sini: /track/${order.invoiceNumber}`
  );

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Back + header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#f06a60] transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Order
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadOrder}
            disabled={busy}
            className="inline-flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Muat Ulang
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-3 rounded-xl transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            Chat WhatsApp
          </a>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center gap-2 text-xs font-bold px-4 py-3 rounded-xl border ${
            feedback.kind === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.kind === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {feedback.text}
        </div>
      )}

      {/* Order header card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Detail Pesanan
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] font-mono tracking-tight mt-0.5">
              {order.invoiceNumber}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              <strong className="text-slate-900">{order.customer.name}</strong>{' '}
              <span className="font-mono text-xs">({order.customer.phone})</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
            <a
              href={getGoogleMapsUrl(
                order.customer.latitude,
                order.customer.longitude,
                `${order.customer.address}, ${order.customer.city}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-600 hover:text-[#f06a60] border border-slate-200 hover:border-[#f06a60] px-3 py-2 rounded-xl inline-flex items-center gap-1 transition-colors"
            >
              Peta Lokasi
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Pipeline progress (focal: posisi antrean saat ini) */}
        {order.status !== 'CANCELLED' && idx >= 0 && (
          <ol className="flex items-center gap-1 overflow-x-auto pb-1" aria-label="Progres pengerjaan">
            {PIPELINE.map((step, i) => {
              const done = i <= idx;
              const current = i === idx;
              const opt = STATUS_OPTIONS.find((o) => o.value === step);
              return (
                <li key={step} className="flex items-center gap-1 min-w-fit">
                  <button
                    type="button"
                    onClick={() => setDraftStatus(step)}
                    title={opt?.label}
                    className={`text-[10px] font-bold px-2.5 py-2 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                      current
                        ? 'bg-[#f06a60] text-white border-[#f06a60] shadow-xs'
                        : done
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {i + 1}. {opt?.label.replace(/^\d+\.\s*/, '')}
                  </button>
                  {i < PIPELINE.length - 1 && <span className="text-slate-300">/</span>}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 items-start">
        {/* LEFT: kelola */}
        <div className="lg:col-span-3 space-y-5">
          {/* Status */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              Status Pengerjaan
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value as OrderStatus)}
                className="flex-1 text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Pilih status pengerjaan"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  patch({ action: 'update_status', status: draftStatus }, 'Status pesanan diperbarui.')
                }
                disabled={busy || draftStatus === order.status}
                className="bg-[#0d1526] hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan Status
              </button>
            </div>
            {nextStatus && nextLabel && (
              <button
                type="button"
                onClick={() =>
                  patch({ action: 'update_status', status: nextStatus }, `Status maju ke: ${nextLabel}.`)
                }
                disabled={busy}
                className="w-full bg-[#f06a60] hover:bg-[#d4534a] disabled:opacity-40 text-white font-heading font-bold text-sm uppercase tracking-normal px-5 py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                Lanjut ke: {nextLabel}
              </button>
            )}
          </section>

          {/* Pembayaran */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Pembayaran (Total {formatRupiah(order.totalAmount)})
            </h2>
            <div>
              <label
                htmlFor="pay-status"
                className="text-[11px] font-bold text-slate-500 block mb-1"
              >
                Status Bayar
              </label>
              <select
                id="pay-status"
                value={draftPayStatus}
                onChange={(e) => setDraftPayStatus(e.target.value as PaymentStatus)}
                className="w-full text-xs px-3 py-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="UNPAID">Belum Lunas</option>
                <option value="PAID">Lunas / Sudah Bayar</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500">
              Metode pembayaran: <strong className="text-slate-700">Transfer Bank BCA</strong> (rekening tampil di halaman lacak pelanggan).
            </p>
            <button
              type="button"
              onClick={() =>
                patch(
                  {
                    action: 'update_payment',
                    paymentStatus: draftPayStatus,
                    paymentMethod: 'TRANSFER',
                  },
                  'Data pembayaran diperbarui.'
                )
              }
              disabled={busy || draftPayStatus === order.paymentStatus}
              className="bg-[#0d1526] hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Pembayaran
            </button>
          </section>

          {/* Testimoni Pelanggan */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Quote className="w-4 h-4 text-emerald-600" />
              Testimoni Pelanggan
            </h2>
            <p className="text-[11px] text-slate-500">
              Salin kalimat review asli dari chat WhatsApp pelanggan. Tampil di halaman Testimoni
              bila pesanan sudah selesai dan punya foto QC lengkap.
            </p>
            <textarea
              value={draftReview}
              onChange={(e) => setDraftReview(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Contoh: sepatunya balik kayak baru, kurirnya ramah dan tepat waktu."
              aria-label="Kalimat testimoni pelanggan"
              className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-mono text-slate-500">{draftReview.length}/300</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    patch({ action: 'update_review', review: '' }, 'Testimoni dihapus.')
                  }
                  disabled={busy || !order.customerReview}
                  className="text-xs font-bold text-slate-600 hover:text-rose-700 border border-slate-200 px-4 py-3 rounded-xl transition-colors disabled:opacity-40"
                >
                  Hapus Review
                </button>
                <button
                  type="button"
                  onClick={() =>
                    patch({ action: 'update_review', review: draftReview }, 'Testimoni tersimpan.')
                  }
                  disabled={busy || draftReview === (order.customerReview || '')}
                  className="bg-[#0d1526] hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Testimoni
                </button>
              </div>
            </div>
          </section>

          {/* QC Foto */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-700" />
                Dokumentasi Foto QC
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {order.qcPhotos.length} foto tersimpan
                </span>
                <Link
                  href={`/admin/qc?invoice=${encodeURIComponent(order.invoiceNumber)}`}
                  className="text-[11px] font-bold text-[#f06a60] hover:text-[#d4534a] transition-colors inline-flex items-center gap-1"
                >
                  Buka di Galeri
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Form upload */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex gap-2" role="group" aria-label="Jenis foto QC">
                <button
                  type="button"
                  onClick={() => setQcType('BEFORE')}
                  aria-pressed={qcType === 'BEFORE'}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    qcType === 'BEFORE'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                  }`}
                >
                  Kondisi Awal (Before)
                </button>
                <button
                  type="button"
                  onClick={() => setQcType('AFTER')}
                  aria-pressed={qcType === 'AFTER'}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    qcType === 'AFTER'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                  }`}
                >
                  Hasil Selesai (After)
                </button>
              </div>

              <label className="block text-center text-xs font-bold text-slate-700 bg-white border border-dashed border-slate-300 hover:border-[#f06a60] px-3.5 py-4 rounded-xl cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-purple-700 inline mr-1.5" />
                Pilih File Foto (JPG/PNG/WebP)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>

              {qcPhotoUrl && (
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2">
                  <img
                    src={qcPhotoUrl}
                    alt="Preview foto QC"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <span className="text-[11px] text-slate-500">
                    Pratinjau file siap disimpan.
                  </span>
                </div>
              )}

              <input
                type="text"
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                placeholder="Catatan kondisi fisik, misal: sol kanan lecet sebelum dicuci"
                aria-label="Catatan kondisi fisik"
                className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddQCPhoto}
                disabled={!qcPhotoUrl.trim() || busy}
                className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold text-xs py-3 rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                {busy ? 'Menyimpan Foto...' : 'Simpan Foto QC Ini'}
              </button>
            </div>

            {/* Gallery */}
            {order.qcPhotos.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 py-4 text-center">
                Belum ada foto QC. Unggah kondisi awal (before) saat barang tiba di workshop,
                dan hasil akhir (after) sebelum diantar kembali.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {order.qcPhotos.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl overflow-hidden border border-slate-200 bg-white text-[10px] space-y-1.5 p-2"
                  >
                    <a
                      href={p.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buka foto ukuran penuh"
                      className="block rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <img
                        src={p.photoUrl}
                        alt={`Foto QC ${p.type}`}
                        className="w-full h-24 object-cover rounded-xl hover:scale-[1.02] transition-transform"
                      />
                    </a>
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                          p.type === 'BEFORE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.type}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQCPhoto(p.id)}
                        disabled={busy}
                        className="text-slate-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-40"
                        aria-label={`Hapus foto QC ${p.type} ${new Date(p.createdAt).toLocaleDateString('id-ID')}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {p.notes && <p className="text-slate-600 line-clamp-2">{p.notes}</p>}
                    <p className="text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: ringkasan */}
        <div className="lg:col-span-2 space-y-5">
          {/* Lokasi jemput */}
          <section className="bg-[#fff9f6] p-5 rounded-3xl border border-[#f06a60]/30 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0d1526] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#f06a60]" />
                Titik Jemput Kurir
              </h2>
              <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-[#f06a60]/10 text-[#c2453c] border border-[#f06a60]/20 whitespace-nowrap">
                {order.distanceKm} km
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 leading-snug">{order.customer.address}</p>
              <p className="text-slate-600 text-[11px]">
                Kec. {order.customer.district || '-'}, {order.customer.city}
              </p>
              <p className="text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/80">
                {order.customer.notes
                  ? `Patokan: ${order.customer.notes}`
                  : 'Tidak ada catatan patokan dari pelanggan.'}
              </p>
              {order.customer.latitude && order.customer.longitude && (
                <p className="text-[10px] text-slate-500 font-mono pt-0.5">
                  GPS: {order.customer.latitude}, {order.customer.longitude}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={getGoogleMapsUrl(
                  order.customer.latitude,
                  order.customer.longitude,
                  `${order.customer.address}, ${order.customer.city}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#f06a60] hover:bg-[#d4534a] text-white font-bold text-xs px-3.5 py-3 rounded-xl transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Buka Navigasi
              </a>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-3 rounded-xl transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    Salin Info Kurir
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Item & biaya */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-600" />
              Item &amp; Rincian Biaya
            </h2>
            <ul className="space-y-2 text-xs">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      {i.quantity}x {i.serviceName}
                    </p>
                    {i.itemNotes && (
                      <p className="text-[11px] text-slate-500 italic">{i.itemNotes}</p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatRupiah(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="text-xs space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd className="font-mono">{formatRupiah(order.subtotal)}</dd>
              </div>
              {order.discountAmount && order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Diskon {order.promoCode}</dt>
                  <dd className="font-mono">-{formatRupiah(order.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <dt>Antar-Jemput</dt>
                <dd className="font-mono">GRATIS</dd>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <dt>Total</dt>
                <dd className="font-mono">{formatRupiah(order.totalAmount)}</dd>
              </div>
            </dl>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              Jemput {order.pickupDate}, slot{' '}
              {order.pickupSlot === 'morning' ? 'Pagi (09.00-13.00)' : 'Siang (14.00-18.00)'}.
              {order.notes && (
                <>
                  {' '}
                  Catatan pelanggan: <em>{order.notes}</em>
                </>
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
