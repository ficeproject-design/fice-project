'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  MapPin,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Customer } from '@/lib/types';

interface EnrichedCustomer extends Customer {
  suggestedSellingMessage: string;
  waUrl: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<EnrichedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadCustomers();
    })();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const repeatCount = customers.filter((c) => c.totalOrders > 1).length;
  const newCount = customers.filter((c) => c.totalOrders <= 1).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] tracking-tight uppercase">
            Database Pelanggan &amp; CRM WhatsApp
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar nomor WhatsApp pelanggan yang otomatis tersimpan untuk penawaran cuci kembali (*Suggested Selling*).
          </p>
        </div>

        <button
          onClick={loadCustomers}
          disabled={loading}
          className="inline-flex items-center gap-2 text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all shadow-2xs cursor-pointer w-fit disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f06a60]' : 'text-slate-500'}`} />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Kontak</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] mt-0.5 block">{customers.length}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Repeat Order (&gt;1x)</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-emerald-600 mt-0.5 block">
              {repeatCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">Pelanggan Baru (1x)</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-blue-600 mt-0.5 block">
              {newCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pelanggan, no. WA, kecamatan, atau kota..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d1526] bg-slate-50/70"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
        </span>
      </div>

      {/* Customers List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Memuat data pelanggan...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Belum ada data pelanggan yang sesuai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 pl-4">Nama Pelanggan</th>
                  <th className="py-3.5">Nomor WhatsApp</th>
                  <th className="py-3.5">Alamat &amp; Wilayah</th>
                  <th className="py-3.5">Total Order</th>
                  <th className="py-3.5">Order Terakhir</th>
                  <th className="py-3.5 pr-4 text-right">Follow-up / Suggested Selling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 pl-4 font-bold text-slate-900">
                      {cust.name}
                    </td>

                    <td className="py-4 font-mono font-semibold text-emerald-800">
                      {cust.phone}
                    </td>

                    <td className="py-4 max-w-xs">
                      <span className="font-bold block text-slate-900">{cust.city}</span>
                      <span className="text-xs text-slate-700 block font-medium">
                        {cust.address}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Kec. {cust.district}
                      </span>
                      {cust.notes && (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                          <span>Patokan: {cust.notes}</span>
                        </span>
                      )}
                      <div>
                        <a
                          href={
                            cust.latitude && cust.longitude
                              ? `https://www.google.com/maps/search/?api=1&query=${cust.latitude},${cust.longitude}`
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cust.address}, ${cust.city}`)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f06a60] hover:text-[#d4534a] bg-[#f06a60]/10 hover:bg-[#f06a60]/20 px-2 py-0.5 rounded transition-colors mt-1.5 w-fit"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Buka Maps</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4">
                      <Link
                        href={`/admin/orders?q=${encodeURIComponent(cust.phone)}`}
                        className="inline-flex items-center gap-1 font-bold bg-slate-100 hover:bg-[#0d1526] text-slate-800 hover:text-white px-2.5 py-1 rounded-lg transition-colors group"
                        title={`Buka riwayat order ${cust.name}`}
                      >
                        <ShoppingBag className="w-3 h-3 text-[#f06a60] group-hover:text-white" />
                        <span>{cust.totalOrders} Kali</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>

                    <td className="py-4">
                      <span className="text-slate-600 font-medium">
                        {cust.lastOrderAt
                          ? new Date(cust.lastOrderAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </td>

                    <td className="py-4 pr-4 text-right">
                      <a
                        href={cust.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all"
                        title="Kirim pesan promosi cuci kembali ke WhatsApp pelanggan"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat Promo WA
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tips Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 space-y-2">
        <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          Strategi Meningkatkan Repeat Order (*Suggested Selling*):
        </h4>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Pelanggan sepatu umumnya mencuci sepatu setiap 3–5 minggu sekali. Dengan mengklik tombol <strong>Chat Promo WA</strong> di atas, sistem telah otomatis merangkai pesan sapaan ramah yang menyertakan pengingat layanan 100% Free Antar-Jemput beserta tautan langsung untuk membuat order baru!
        </p>
      </div>
    </div>
  );
}
