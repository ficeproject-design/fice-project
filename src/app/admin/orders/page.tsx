'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Camera,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  MessageSquare,
  Printer,
  Edit3,
  X,
  Upload,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  MapPin,
  Copy,
  Check,
  Navigation,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types';
import { formatRupiah, createWhatsAppUrl } from '@/lib/invoice';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  PaymentModelBadge,
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper Google Maps URL
  const getGoogleMapsUrl = (lat?: number, lng?: number, fallbackAddress?: string) => {
    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress || '')}`;
  };

  // Helper Salin Informasi Alamat & Koordinat untuk Kurir
  const handleCopyAddress = (ord: Order) => {
    const mapsUrl = getGoogleMapsUrl(
      ord.customer.latitude,
      ord.customer.longitude,
      `${ord.customer.address}, ${ord.customer.city}`
    );
    const text =
      `*PENJEMPUTAN SEPATU - FICE SHOES CARE*\n` +
      `No. Invoice: ${ord.invoiceNumber}\n` +
      `Pelanggan: ${ord.customer.name} (${ord.customer.phone})\n` +
      `Jadwal: ${ord.pickupDate} (${ord.pickupSlot === 'morning' ? 'Slot Pagi 09-13' : 'Slot Siang 14-18'})\n` +
      `Alamat: ${ord.customer.address}, Kec. ${ord.customer.district || '-'}, ${ord.customer.city}\n` +
      (ord.customer.notes ? `Patokan: ${ord.customer.notes}\n` : '') +
      `Jarak Workshop: ${ord.distanceKm} km\n` +
      `Link Google Maps: ${mapsUrl}`;

    navigator.clipboard.writeText(text);
    setCopiedId(ord.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Modal State for updating order
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('WAITING_PICKUP');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'QRIS' | 'TRANSFER' | 'COD'>('QRIS');

  // QC Photo Upload State in Modal
  const [qcType, setQcType] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const [qcPhotoUrl, setQcPhotoUrl] = useState('');
  const [qcNotes, setQcNotes] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setNewPaymentMethod(order.paymentMethod || 'QRIS');
    setQcPhotoUrl('');
    setQcNotes('');
    setModalOpen(true);
  };

  // Save Status & Payment changes
  const handleSaveChanges = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      // 1. Update status
      if (newStatus !== selectedOrder.status) {
        await fetch(`/api/orders/${selectedOrder.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_status', status: newStatus }),
        });
      }

      // 2. Update payment
      if (
        newPaymentStatus !== selectedOrder.paymentStatus ||
        newPaymentMethod !== selectedOrder.paymentMethod
      ) {
        await fetch(`/api/orders/${selectedOrder.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_payment',
            paymentStatus: newPaymentStatus,
            paymentMethod: newPaymentMethod,
          }),
        });
      }

      await fetchOrders();
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving order updates:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Upload QC Photo handler (supports file upload via base64 or URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setQcPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddQCPhoto = async () => {
    if (!selectedOrder || !qcPhotoUrl) return;
    setIsUploadingPhoto(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_qc_photo',
          qcPhoto: {
            type: qcType,
            photoUrl: qcPhotoUrl,
            notes: qcNotes.trim() || undefined,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedOrder(json.data);
        setQcPhotoUrl('');
        setQcNotes('');
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error adding QC photo:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Filter and Search logic
  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchQuery =
      searchQuery === '' ||
      o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.phone.includes(searchQuery);

    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] tracking-tight">
            Manajemen Antrean &amp; Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ubah status pengerjaan, upload foto kondisi fisik awal/akhir (QC), dan verifikasi pembayaran.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer w-fit disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f06a60]' : 'text-slate-500'}`} />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Order</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] mt-0.5 block">{orders.length}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">Perlu Jemput</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-amber-600 mt-0.5 block">
              {orders.filter((o) => o.status === 'WAITING_PICKUP' || o.status === 'PICKING_UP').length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#f06a60] block">Sedang Dicuci</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-[#f06a60] mt-0.5 block">
              {orders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'IN_WORKSHOP').length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#fff2f0] flex items-center justify-center text-[#f06a60]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Selesai</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-emerald-600 mt-0.5 block">
              {orders.filter((o) => o.status === 'COMPLETED').length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Filter Tabs */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Invoice, Nama, atau No WA..."
            className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d1526] bg-slate-50/70"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'Semua', count: orders.length },
            {
              id: 'WAITING_PICKUP',
              label: 'Perlu Jemput',
              count: orders.filter((o) => o.status === 'WAITING_PICKUP' || o.status === 'PICKING_UP').length,
            },
            {
              id: 'IN_WORKSHOP',
              label: 'Di Workshop',
              count: orders.filter((o) => o.status === 'IN_WORKSHOP').length,
            },
            {
              id: 'IN_PROGRESS',
              label: 'Sedang Dicuci',
              count: orders.filter((o) => o.status === 'IN_PROGRESS').length,
            },
            {
              id: 'READY_TO_DELIVER',
              label: 'Siap Diantar',
              count: orders.filter((o) => o.status === 'READY_TO_DELIVER' || o.status === 'DELIVERING').length,
            },
            {
              id: 'COMPLETED',
              label: 'Selesai',
              count: orders.filter((o) => o.status === 'COMPLETED').length,
            },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0d1526] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#f06a60]" />
            <p>Memuat daftar antrean pesanan...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center text-slate-400 text-xs space-y-2">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Tidak ada pesanan ditemukan</p>
            <p className="text-[11px]">Coba ubah kata kunci pencarian atau filter status pesanan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1180px]">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-44 sticky left-0 bg-slate-50 z-20 border-r border-slate-200/70 shadow-[2px_0_4px_rgba(0,0,0,0.03)]">
                    Invoice &amp; Tanggal
                  </th>
                  <th className="py-3.5 px-4 min-w-[300px]">Pelanggan &amp; Lokasi Jemput</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Item Layanan</th>
                  <th className="py-3.5 px-4 w-36">Jadwal Jemput</th>
                  <th className="py-3.5 px-4 w-44">Total &amp; Bayar</th>
                  <th className="py-3.5 px-4 w-44">Status Pengerjaan</th>
                  <th className="py-3.5 px-4 w-24">QC Foto</th>
                  <th className="py-3.5 px-4 w-36 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((ord) => {
                  const waMsg = `Halo Kak *${ord.customer.name}*, update mengenai pesanan cuci sepatu *${ord.invoiceNumber}* di Fice Shoes Care. Status saat ini: *${ord.status}*. Cek link invoice & foto QC disini: http://localhost:3000/track/${ord.invoiceNumber}`;
                  const waUrl = createWhatsAppUrl(ord.customer.phone, waMsg);
                  const mapsUrl = getGoogleMapsUrl(
                    ord.customer.latitude,
                    ord.customer.longitude,
                    `${ord.customer.address}, ${ord.customer.district || ''}, ${ord.customer.city}`
                  );
                  const hasCoordinates = Boolean(ord.customer.latitude && ord.customer.longitude);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice & Date - Sticky Column */}
                      <td className="py-4 px-4 whitespace-nowrap align-top sticky left-0 bg-white z-10 border-r border-slate-200/70 shadow-[2px_0_4px_rgba(0,0,0,0.03)]">
                        <Link
                          href={`/track/${ord.invoiceNumber}`}
                          target="_blank"
                          className="font-mono font-bold text-sm text-[#0d1526] hover:text-[#f06a60] flex items-center gap-1 group"
                        >
                          <span>{ord.invoiceNumber}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#f06a60]" />
                        </Link>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Customer & Pickup Location */}
                      <td className="py-4 px-4 align-top min-w-[300px]">
                        <div className="space-y-1.5">
                          {/* Nama & Jarak */}
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 text-sm leading-tight">
                                {ord.customer.name}
                              </span>
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono shrink-0">
                                {ord.distanceKm} km
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                              {ord.customer.phone}
                            </span>
                          </div>

                          {/* Card Alamat Detail */}
                          <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                            <p className="font-semibold text-slate-900 leading-snug">
                              {ord.customer.address}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Kec. {ord.customer.district || '-'}, {ord.customer.city}
                            </p>

                            {/* Patokan Rumah jika diinput customer */}
                            {ord.customer.notes && (
                              <div className="text-[11px] text-amber-900 bg-amber-50/90 px-2 py-1 rounded-lg border border-amber-200/80 flex items-start gap-1 mt-1">
                                <span className="font-bold shrink-0">📍 Patokan:</span>
                                <span className="italic">{ord.customer.notes}</span>
                              </div>
                            )}

                            {/* Tombol Titik Maps & Salin Info */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#f06a60] hover:bg-[#d4534a] text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs group"
                                title="Buka titik koordinat penjemputan di Google Maps"
                              >
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>Titik Maps</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-80 group-hover:opacity-100" />
                              </a>

                              <button
                                type="button"
                                onClick={() => handleCopyAddress(ord)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                title="Salin rincian alamat dan titik penjemputan untuk kurir"
                              >
                                {copiedId === ord.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600">Tersalin!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-500" />
                                    <span>Salin Info</span>
                                  </>
                                )}
                              </button>

                              {hasCoordinates && (
                                <span className="text-[10px] text-slate-400 font-mono ml-auto">
                                  {Number(ord.customer.latitude).toFixed(3)}, {Number(ord.customer.longitude).toFixed(3)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          {ord.items.map((i, idx) => (
                            <div key={idx} className="text-xs">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                                  {i.quantity}x
                                </span>
                                <span>{i.serviceName}</span>
                              </div>
                              {i.itemNotes && (
                                <div className="text-[11px] text-slate-400 italic pl-6 line-clamp-1" title={i.itemNotes}>
                                  "{i.itemNotes}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ord.pickupDate}</span>
                        </div>
                        <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 mt-1">
                          {ord.pickupSlot === 'morning' ? 'Pagi (09 - 13)' : 'Siang (14 - 18)'}
                        </span>
                      </td>

                      {/* Total & Payment */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatRupiah(ord.totalAmount)}
                        </div>
                        {ord.promoCode && ord.discountAmount && ord.discountAmount > 0 && (
                          <div className="mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              🎟️ {ord.promoCode} (-{formatRupiah(ord.discountAmount)})
                            </span>
                          </div>
                        )}
                        <div className="mt-1 space-y-1">
                          <div>
                            <PaymentModelBadge model={ord.paymentModel} />
                          </div>
                          <div>
                            <PaymentStatusBadge status={ord.paymentStatus} />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <OrderStatusBadge status={ord.status} />
                      </td>

                      {/* QC Photo */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                            ord.qcPhotos.length > 0
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{ord.qcPhotos.length} Foto</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(ord)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0d1526] hover:bg-[#f06a60] px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Kelola &amp; QC</span>
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 inline-flex items-center justify-center text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors"
                            title="Chat WhatsApp Pelanggan"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL KELOLA ORDER & QC UPLOAD */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Kelola Pesanan:
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 font-mono">
                  {selectedOrder.invoiceNumber}
                </h2>
                <p className="text-xs text-slate-500">
                  Pelanggan: <strong>{selectedOrder.customer.name}</strong> ({selectedOrder.customer.phone})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DETAIL TITIK & ALAMAT PENJEMPUTAN */}
            <div className="bg-[#fff9f6] p-4 sm:p-5 rounded-2xl border border-[#f06a60]/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d1526] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#f06a60]" />
                  Titik &amp; Detail Penjemputan Kurir:
                </h3>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#f06a60]/10 text-[#f06a60] border border-[#f06a60]/20">
                  {selectedOrder.distanceKm} km dari Workshop Fice
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-[#f06a60]/15">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Alamat Lengkap:</span>
                  <p className="font-bold text-slate-900 leading-snug">{selectedOrder.customer.address}</p>
                  <p className="text-slate-500 text-[11px]">
                    Kec. {selectedOrder.customer.district || '-'}, {selectedOrder.customer.city}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Patokan Rumah / Lokasi:</span>
                  <p className="font-semibold text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/80">
                    {selectedOrder.customer.notes || 'Tidak ada catatan patokan khusus.'}
                  </p>
                  {selectedOrder.customer.latitude && selectedOrder.customer.longitude && (
                    <p className="text-[10px] text-slate-400 font-mono pt-0.5">
                      GPS: {selectedOrder.customer.latitude}, {selectedOrder.customer.longitude}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={getGoogleMapsUrl(
                    selectedOrder.customer.latitude,
                    selectedOrder.customer.longitude,
                    `${selectedOrder.customer.address}, ${selectedOrder.customer.city}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#d4534a] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Buka Navigasi Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyAddress(selectedOrder)}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {copiedId === selectedOrder.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Info Alamat Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin Info Kurir</span>
                    </>
                  )}
                </button>

                <a
                  href={createWhatsAppUrl(
                    selectedOrder.customer.phone,
                    `Halo Kak ${selectedOrder.customer.name}, kurir Fice Shoes Care siap menjemput sepatu di ${selectedOrder.customer.address}. Apakah titik lokasi di Google Maps sudah sesuai?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors sm:ml-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat WA Pelanggan</span>
                </a>
              </div>
            </div>

            {/* SECTION 1: UBAH STATUS ORDER */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                1. Update Status Pengerjaan Sepatu:
              </h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SECTION 2: UBAH STATUS PEMBAYARAN */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                2. Status Pembayaran (Total: {formatRupiah(selectedOrder.totalAmount)}):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Status Bayar:
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="UNPAID">🔴 BELUM LUNAS</option>
                    <option value="PAID">🟢 LUNAS / SUDAH BAYAR</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Metode Pembayaran:
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="QRIS">QRIS</option>
                    <option value="TRANSFER">Transfer Bank BCA</option>
                    <option value="COD">COD (Tunai ke Kurir)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD FOTO QC BEFORE & AFTER */}
            <div className="space-y-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-purple-700" />
                  3. Unggah Dokumentasi Foto QC:
                </h3>
                <span className="text-[11px] text-purple-700 font-semibold">
                  Tersimpan: {selectedOrder.qcPhotos.length} Foto
                </span>
              </div>

              {/* Form Upload */}
              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-purple-200">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setQcType('BEFORE')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      qcType === 'BEFORE'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Kondisi Awal (Before)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQcType('AFTER')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      qcType === 'AFTER'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Hasil Selesai (After)
                  </button>
                </div>

                {/* Upload from file or URL */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Pilih File Foto atau Masukkan URL Foto:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                    <input
                      type="url"
                      value={qcPhotoUrl}
                      onChange={(e) => setQcPhotoUrl(e.target.value)}
                      placeholder="Atau tempelkan URL gambar (https://...)"
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                {qcPhotoUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300">
                    <img src={qcPhotoUrl} alt="Preview QC" className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Catatan Kondisi Fisik Sepatu:
                  </label>
                  <input
                    type="text"
                    value={qcNotes}
                    onChange={(e) => setQcNotes(e.target.value)}
                    placeholder="Contoh: Sol bagian samping kanan sudah ada lecet sebelum dicuci."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddQCPhoto}
                  disabled={!qcPhotoUrl || isUploadingPhoto}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2 rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isUploadingPhoto ? 'Menyimpan Foto...' : 'Simpan Foto QC Ini'}
                </button>
              </div>

              {/* Gallery of Existing QC Photos */}
              {selectedOrder.qcPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {selectedOrder.qcPhotos.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl overflow-hidden border border-slate-200 bg-white text-[10px] space-y-1 p-1.5 shadow-xs"
                    >
                      <img src={p.photoUrl} alt="QC" className="w-full h-24 object-cover rounded-lg" />
                      <span
                        className={`inline-block font-bold px-1.5 py-0.5 rounded text-[9px] ${
                          p.type === 'BEFORE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.type}
                      </span>
                      {p.notes && <p className="text-slate-600 line-clamp-2">{p.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isUpdating}
                className="bg-[#0d1526] hover:bg-[#f06a60] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
