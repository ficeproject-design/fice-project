'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  PaymentModelBadge,
} from '@/components/StatusBadge';
import {
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  Share2,
  CheckCircle2,
  Camera,
  AlertCircle,
  Sparkles,
  Phone,
  ArrowLeft,
  Building2,
  Clock,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { formatRupiah, createWhatsAppUrl } from '@/lib/invoice';

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; desc: string }> = [
  {
    key: 'WAITING_PICKUP',
    label: 'Menunggu Jemput',
    desc: 'Kurir menyiapkan rute penjemputan',
  },
  {
    key: 'PICKING_UP',
    label: 'Kurir Menuju Lokasi',
    desc: 'Kurir dalam perjalanan menjemput sepatu',
  },
  {
    key: 'IN_WORKSHOP',
    label: 'Tiba di Workshop',
    desc: 'Pengecekan fisik dan upload foto kondisi awal (QC)',
  },
  {
    key: 'IN_PROGRESS',
    label: 'Proses Cuci / Treatment',
    desc: 'Sepatu sedang dibersihkan dan dikeringkan',
  },
  {
    key: 'READY_TO_DELIVER',
    label: 'Siap Diantar',
    desc: 'Pencucian selesai & QC akhir lolos',
  },
  {
    key: 'DELIVERING',
    label: 'Kurir Mengantar',
    desc: 'Sepatu dalam perjalanan kembali ke alamat Anda',
  },
  {
    key: 'COMPLETED',
    label: 'Pesanan Selesai',
    desc: 'Sepatu telah diterima dalam kondisi bersih',
  },
];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const justOrdered = searchParams.get('just_ordered') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${resolvedParams.id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.error || 'Pesanan tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Gagal memuat informasi pesanan.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 text-neutral-500 text-sm">
          Memuat data pesanan...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 uppercase">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {error || 'Nomor invoice yang Anda cari tidak terdaftar dalam sistem.'}
          </p>
          <div className="pt-2">
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#000000] hover:bg-[#f06a60] px-5 py-2.5 rounded-full transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Cari Ulang Resi
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const beforePhotos = order.qcPhotos.filter((p) => p.type === 'BEFORE');
  const afterPhotos = order.qcPhotos.filter((p) => p.type === 'AFTER');

  const waShareText = `Halo kak kurir/admin Fice Shoes Care, ini pesanan saya nomor *${order.invoiceNumber}* atas nama *${order.customer.name}*. Saya ingin menanyakan status penjemputan/pengantaran. Terima kasih! Link: ${typeof window !== 'undefined' ? window.location.href : ''}`;
  const waShareUrl = createWhatsAppUrl('081298765432', waShareText);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Just Ordered Banner */}
          {justOrdered && (
            <div className="p-6 bg-[#000000] text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-[#f06a60]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#f06a60] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl uppercase">
                    Pesanan Anda Berhasil Dibuat!
                  </h2>
                  <p className="text-xs text-neutral-300">
                    Kurir Fice Shoes Care akan segera menghubungi via WhatsApp untuk konfirmasi penjemputan.
                  </p>
                </div>
              </div>
              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-white hover:text-black text-white font-bold text-xs px-5 py-3 rounded-full shadow-xs transition-all shrink-0"
              >
                <Share2 className="w-4 h-4" />
                Konfirmasi ke WhatsApp
              </a>
            </div>
          )}

          {/* Invoice Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-neutral-400 uppercase">
                  Invoice:
                </span>
                <span className="font-heading font-bold text-xl sm:text-2xl text-[#000000] font-mono">
                  {order.invoiceNumber}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-neutral-500">
                Dibuat pada:{' '}
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-black/10 hover:bg-[#f2ece5] text-[#000000] text-xs font-bold transition-all"
                title="Cetak Invoice / Simpan PDF"
              >
                <Printer className="w-4 h-4" />
                Cetak Nota
              </button>

              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#000000] hover:bg-[#f06a60] text-white text-xs font-bold shadow-xs transition-all"
              >
                <Share2 className="w-4 h-4" />
                Chat Admin
              </a>
            </div>
          </div>

          {/* LIVE STATUS STEPPER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-lg uppercase">
                  Pelacakan Status Pesanan
                </h3>
                <p className="text-xs text-neutral-500">
                  Perjalanan perawatan fisik sepatu Anda di workshop Fice Shoes Care.
                </p>
              </div>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-black/10 ml-3 sm:ml-4">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="relative group">
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#f06a60] text-white ring-4 ring-[#f06a60]/20 shadow-sm'
                          : isPassed
                          ? 'bg-[#000000] text-white'
                          : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-heading font-bold text-sm ${
                            isCurrent
                              ? 'text-[#f06a60]'
                              : isPassed
                              ? 'text-slate-900'
                              : 'text-neutral-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#f06a60]/10 text-[#f06a60] font-bold px-2 py-0.5 rounded-full uppercase">
                            Sedang Berlangsung
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DOKUMENTASI FOTO QC (BEFORE & AFTER) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f2ece5] text-[#000000] flex items-center justify-center">
                  <Camera className="w-5 h-5 text-[#f06a60]" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-slate-900 text-lg uppercase">
                    Dokumentasi Kondisi Fisik Sepatu (QC)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Bukti foto fisik saat sepatu tiba di workshop dan setelah selesai dicuci.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#000000] bg-[#f2ece5] px-3 py-1 rounded-full">
                {order.qcPhotos.length} Foto Tersimpan
              </span>
            </div>

            {order.qcPhotos.length === 0 ? (
              <div className="p-8 text-center bg-[#fdf8f1] rounded-3xl border border-dashed border-black/10 space-y-2">
                <Camera className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="text-xs font-bold text-neutral-800">
                  Belum Ada Foto QC yang Diunggah
                </p>
                <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                  Teknisi kami akan mengambil dan mengunggah foto kondisi fisik saat sepatu tiba di workshop.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Before */}
                <div className="space-y-3">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Foto Kondisi Awal (Before)
                  </span>
                  {beforePhotos.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">Belum ada foto Before.</p>
                  ) : (
                    beforePhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="rounded-2xl overflow-hidden border border-black/10 bg-neutral-50"
                      >
                        <img
                          src={photo.photoUrl}
                          alt="QC Before"
                          className="w-full h-52 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-3 text-xs space-y-1">
                          {photo.notes && (
                            <p className="text-neutral-800 font-medium">{photo.notes}</p>
                          )}
                          <span className="text-[10px] text-neutral-400 block">
                            Diambil: {new Date(photo.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* After */}
                <div className="space-y-3">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-white bg-[#000000] px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
                    Foto Hasil Cuci (After)
                  </span>
                  {afterPhotos.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">
                      Foto After akan tampil saat proses pengerjaan selesai.
                    </p>
                  ) : (
                    afterPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="rounded-2xl overflow-hidden border border-black/10 bg-neutral-50"
                      >
                        <img
                          src={photo.photoUrl}
                          alt="QC After"
                          className="w-full h-52 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-3 text-xs space-y-1">
                          {photo.notes && (
                            <p className="text-neutral-800 font-medium">{photo.notes}</p>
                          )}
                          <span className="text-[10px] text-neutral-400 block">
                            Diambil: {new Date(photo.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ITEM BREAKDOWN & ALAMAT */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-xs space-y-4">
              <h3 className="font-heading font-extrabold text-slate-900 text-base uppercase border-b border-black/[0.06] pb-3">
                Rincian Barang & Layanan
              </h3>

              <div className="divide-y divide-black/[0.06]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-heading font-bold text-slate-900">
                        {item.serviceName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.quantity}x @ {formatRupiah(item.price)}
                      </p>
                      {item.itemNotes && (
                        <p className="text-[11px] text-[#f06a60] bg-[#f06a60]/10 px-2 py-0.5 rounded-md inline-block mt-1 font-medium">
                          Catatan: {item.itemNotes}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-heading font-bold text-slate-900 shrink-0">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-black/[0.08] space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal Perawatan:</span>
                  <span className="font-bold">{formatRupiah(order.subtotal)}</span>
                </div>
                {order.promoCode && order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Diskon Promo ({order.promoCode}):
                    </span>
                    <span>-{formatRupiah(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#f06a60] font-bold">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Biaya Antar-Jemput ({order.distanceKm} km):
                  </span>
                  <span className="bg-[#f06a60]/10 text-[#f06a60] px-2 py-0.5 rounded-full">
                    100% GRATIS
                  </span>
                </div>
                <div className="flex justify-between text-base font-heading font-bold text-slate-900 pt-2 border-t border-black/[0.08]">
                  <span>Total Tagihan:</span>
                  <span className="text-[#f06a60]">{formatRupiah(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-xs space-y-4">
                <h3 className="font-heading font-extrabold text-slate-900 text-base uppercase border-b border-black/[0.06] pb-3">
                  Informasi Antar-Jemput
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-[#f06a60] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900">Jadwal Penjemputan:</strong>
                      <span className="text-neutral-600">
                        {order.pickupDate} (
                        {order.pickupSlot === 'morning'
                          ? 'Slot Pagi 09.00 - 13.00'
                          : 'Slot Siang 14.00 - 18.00'}
                        )
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#f06a60] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900">Alamat Pelanggan:</strong>
                      <span className="text-neutral-600">
                        {order.customer.name} ({order.customer.phone})<br />
                        {order.customer.address}, {order.customer.district}, {order.customer.city}
                      </span>
                      {order.customer.notes && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 mt-1 italic w-fit">
                          📍 Patokan: {order.customer.notes}
                        </p>
                      )}
                      <a
                        href={
                          order.customer.latitude && order.customer.longitude
                            ? `https://www.google.com/maps/search/?api=1&query=${order.customer.latitude},${order.customer.longitude}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.customer.address}, ${order.customer.city}`)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f06a60] hover:text-[#d4534a] bg-[#f06a60]/10 hover:bg-[#f06a60]/20 px-3 py-1 rounded-full transition-colors mt-2 w-fit border border-[#f06a60]/20"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Buka Titik Penjemputan di Google Maps</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2 border-t border-black/[0.06]">
                    <CreditCard className="w-4 h-4 text-[#f06a60] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900">Model Pembayaran:</strong>
                      <div className="mt-1">
                        <PaymentModelBadge model={order.paymentModel} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {order.paymentStatus === 'UNPAID' && (
                <div className="bg-[#000000] text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-3 border-2 border-[#f06a60]">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-sm text-[#f06a60] uppercase">
                      Instruksi Pembayaran
                    </h4>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30">
                      Menunggu Pembayaran
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Transfer ke rekening resmi Fice Shoes Care atau bayar COD saat kurir mengantar:
                  </p>
                  <div className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 text-xs font-mono space-y-1">
                    <div className="text-neutral-400">Bank Central Asia (BCA)</div>
                    <div className="text-white font-bold text-sm tracking-wider">
                      8830-1234-5678
                    </div>
                    <div className="text-neutral-400 text-[11px]">a.n. Fice Shoes Care</div>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Kirimkan bukti transfer via WhatsApp ke admin untuk verifikasi instan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
