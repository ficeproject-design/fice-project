'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Order } from '@/lib/types';
import { OrderStatusBadge } from '@/components/StatusBadge';

function AdminOrdersContent({ initialQ }: { initialQ: string }) {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
    (async () => {
      await fetchOrders();
    })();
  }, []);

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
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] tracking-tight uppercase">
            Manajemen Antrean &amp; Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Klik baris pesanan untuk mengubah status, unggah foto QC, dan verifikasi pembayaran.
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
            <table className="w-full text-left text-xs min-w-[920px]">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-44 sticky left-0 bg-slate-50 z-20 border-r border-slate-200/70 shadow-[2px_0_4px_rgba(0,0,0,0.03)]">
                    Invoice &amp; Tanggal
                  </th>
                  <th className="py-3.5 px-4 min-w-[220px]">Pelanggan</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Item Layanan</th>
                  <th className="py-3.5 px-4 w-36">Jadwal Jemput</th>
                  <th className="py-3.5 px-4 w-44">Status Pengerjaan</th>
                  <th className="py-3.5 px-4 w-28 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      tabIndex={0}
                      aria-label={`Buka detail pesanan ${ord.invoiceNumber}`}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('a')) return;
                        router.push(`/admin/orders/${ord.id}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/admin/orders/${ord.id}`);
                        }
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#f06a60]"
                    >
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

                      {/* Customer */}
                      <td className="py-4 px-4 align-top min-w-[220px]">
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
                        <p className="text-[11px] text-slate-500 mt-1">
                          Kec. {ord.customer.district || '-'}, {ord.customer.city}
                        </p>
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
                                  &quot;{i.itemNotes}&quot;
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

                      {/* Status */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <OrderStatusBadge status={ord.status} />
                      </td>

                      {/* Detail */}
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 border border-slate-300 hover:border-[#f06a60] hover:text-[#f06a60] px-3.5 py-2.5 rounded-xl transition-colors"
                        >
                          Lihat Detail
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminOrdersWrapper() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  return <AdminOrdersContent key={q} initialQ={q} />;
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-400 text-xs space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#f06a60]" />
          <p>Memuat antrean pesanan...</p>
        </div>
      }
    >
      <AdminOrdersWrapper />
    </Suspense>
  );
}
