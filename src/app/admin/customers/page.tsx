'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  ShoppingBag,
  Clock,
  Calendar,
  Sparkles,
  ExternalLink,
  MapPin,
  HeartHandshake,
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

  useEffect(() => {
    async function loadCustomers() {
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
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Database Pelanggan & CRM WhatsApp
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar nomor WhatsApp pelanggan yang otomatis tersimpan untuk penawaran cuci kembali (*Suggested Selling*).
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>{customers.length} Kontak Pelanggan Tersimpan</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama pelanggan, no. WA, atau kota..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Customers List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Memuat data pelanggan...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Belum ada data pelanggan yang sesuai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 pl-4">Nama Pelanggan</th>
                  <th className="py-3.5">Nomor WhatsApp</th>
                  <th className="py-3.5">Alamat & Wilayah</th>
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
                      <span className="text-[11px] text-slate-400 block">
                        Kec. {cust.district}
                      </span>
                      {cust.notes && (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 block w-fit mt-1 italic">
                          📍 {cust.notes}
                        </span>
                      )}
                      <a
                        href={
                          cust.latitude && cust.longitude
                            ? `https://www.google.com/maps/search/?api=1&query=${cust.latitude},${cust.longitude}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cust.address}, ${cust.city}`)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f06a60] hover:text-[#d4534a] bg-[#f06a60]/10 hover:bg-[#f06a60]/20 px-2 py-0.5 rounded transition-colors mt-1 w-fit"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Buka Maps</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    </td>

                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                        <ShoppingBag className="w-3 h-3 text-emerald-600" />
                        {cust.totalOrders} Kali
                      </span>
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
