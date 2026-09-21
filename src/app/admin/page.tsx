'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Users,
  AlertCircle,
} from 'lucide-react';
import { formatRupiah } from '@/lib/invoice';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Order } from '@/lib/types';

interface RevenueSummary {
  totalRevenue: number;
  pendingRevenue: number;
  paidOrdersCount: number;
  totalOrdersCount: number;
  totalItemsCount: number;
  statusCounts: {
    waitingPickup: number;
    inWorkshop: number;
    readyToDeliver: number;
    completed: number;
  };
  recentOrders: Order[];
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch('/api/admin/revenue');
        const json = await res.json();
        if (json.success) {
          setSummary(json.data);
        }
      } catch (err) {
        console.error('Error loading revenue summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Memuat data dashboard & rekap pendapatan...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="py-20 text-center text-rose-600 text-sm">
        Gagal memuat rekap pendapatan.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard & Rekap Pendapatan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau arus kas pendapatan, antrean cuci sepatu, dan statistik operasional.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all w-fit"
        >
          <ShoppingBag className="w-4 h-4" />
          Kelola Semua Order ({summary.totalOrdersCount})
        </Link>
      </div>

      {/* REKAP PENDAPATAN & KEUANGAN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Omset Lunas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Omset (Lunas)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block tracking-tight">
              {formatRupiah(summary.totalRevenue)}
            </span>
            <span className="text-xs text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Dari {summary.paidOrdersCount} transaksi selesai/lunas
            </span>
          </div>
        </div>

        {/* Pending Pembayaran */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Menunggu Pembayaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-700 block tracking-tight">
              {formatRupiah(summary.pendingRevenue)}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Nilai pesanan yang belum dibayar pelanggan
            </span>
          </div>
        </div>

        {/* Total Sepatu/Tas Selesai */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Barang Selesai Dicuci
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-purple-700 block tracking-tight">
              {summary.totalItemsCount} Pasang/Item
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Dari pesanan yang sudah tuntas
            </span>
          </div>
        </div>

        {/* Total Order Diterima */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Seluruh Order
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block tracking-tight">
              {summary.totalOrdersCount} Pesanan
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Lifetime booking sejak dibuka
            </span>
          </div>
        </div>
      </div>

      {/* ANTREAN KERJA OPERASIONAL */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Antrean Kerja Operasional Hari Ini</h3>
            <p className="text-xs text-slate-500">Status pengerjaan fisik sepatu dan tugas kurir.</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
          >
            Lihat Detail Antrean <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Perlu Dijemput
            </span>
            <span className="text-2xl font-extrabold text-amber-900">
              {summary.statusCounts.waitingPickup}
            </span>
            <span className="text-[10px] text-amber-700 block">Kurir belum berangkat</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              Di Workshop / Dicuci
            </span>
            <span className="text-2xl font-extrabold text-purple-900">
              {summary.statusCounts.inWorkshop}
            </span>
            <span className="text-[10px] text-purple-700 block">Sedang treatment & QC</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Siap / Sedang Diantar
            </span>
            <span className="text-2xl font-extrabold text-blue-900">
              {summary.statusCounts.readyToDeliver}
            </span>
            <span className="text-[10px] text-blue-700 block">Selesai cuci & on the way</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Pesanan Selesai
            </span>
            <span className="text-2xl font-extrabold text-emerald-900">
              {summary.statusCounts.completed}
            </span>
            <span className="text-[10px] text-emerald-700 block">Sudah diterima customer</span>
          </div>
        </div>
      </div>

      {/* TABEL ORDER TERBARU */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Pesanan Terbaru Masuk</h3>
            <p className="text-xs text-slate-500">5 transaksi terakhir yang tercatat di sistem.</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Buka Semua & Ubah Status →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Invoice</th>
                <th className="pb-3">Pelanggan</th>
                <th className="pb-3">Wilayah & Jarak</th>
                <th className="pb-3">Jadwal Jemput</th>
                <th className="pb-3">Total Biaya</th>
                <th className="pb-3">Status Cuci</th>
                <th className="pb-3">Status Bayar</th>
                <th className="pb-3 pr-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {summary.recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pl-2 font-mono font-bold text-slate-900">
                    {ord.invoiceNumber}
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-900 block">{ord.customer.name}</span>
                    <span className="text-[11px] text-slate-400">{ord.customer.phone}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="block font-medium">{ord.customer.city}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {ord.distanceKm} km
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="block font-medium">{ord.pickupDate}</span>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {ord.pickupSlot === 'morning' ? 'Pagi (09-13)' : 'Siang (14-18)'}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-slate-900">
                    {formatRupiah(ord.totalAmount)}
                  </td>
                  <td className="py-3.5">
                    <OrderStatusBadge status={ord.status} />
                  </td>
                  <td className="py-3.5">
                    <PaymentStatusBadge status={ord.paymentStatus} />
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#0d1526] hover:bg-[#f06a60] px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Kelola
                      </Link>
                      <Link
                        href={`/track/${ord.invoiceNumber}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                      >
                        Resi
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
