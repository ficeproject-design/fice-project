'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, PackageCheck, AlertCircle, ArrowRight, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { isValidPhone } from '@/lib/phone';
import { Order } from '@/lib/types';
import { OrderStatusBadge } from '@/components/StatusBadge';

export default function TrackSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<Order[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    setMatches(null);
    if (!clean) {
      setError('Masukkan nomor invoice atau nomor WhatsApp');
      return;
    }

    if (clean.toUpperCase().startsWith('INV-') || clean.startsWith('ord-')) {
      router.push(`/track/${clean.toUpperCase()}`);
      return;
    }

    if (isValidPhone(clean)) {
      setSearching(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/orders/by-phone?phone=${encodeURIComponent(clean)}`
        );
        const data = await res.json();
        if (!data.success || !data.data?.length) {
          setError(data.error || 'Tidak ada pesanan untuk nomor ini.');
          return;
        }
        const orders = data.data as Order[];
        if (orders.length === 1) {
          router.push(`/track/${orders[0].invoiceNumber}`);
          return;
        }
        setMatches(orders);
      } catch {
        setError('Gagal mencari pesanan. Coba lagi.');
      } finally {
        setSearching(false);
      }
      return;
    }

    setError('Masukkan nomor invoice (cth: INV-202609-0001) atau nomor WhatsApp (cth: 081234567890).');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-black/[0.08] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#f2ece5] text-[#000000] flex items-center justify-center mx-auto">
              <Search className="w-7 h-7 text-[#f06a60]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f06a60]">
                Live Status Tracker
              </span>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0d1526] tracking-tight uppercase">
                Track Your Shoe Status
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Pantau penjemputan, dokumentasi foto fisik QC di workshop, hingga pengantaran kembali ke rumah Anda.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                  Invoice or WhatsApp Number:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (error) setError(null);
                      if (matches) setMatches(null);
                    }}
                    placeholder="e.g. INV-202609-0001 or 081211110001"
                    className="w-full text-sm pl-11 pr-4 py-3.5 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-white"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-4" />
                </div>
                {error && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full bg-[#f06a60] hover:bg-[#000000] text-white font-heading font-bold text-base sm:text-lg tracking-normal uppercase py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 overflow-hidden disabled:opacity-60"
              >
                <PackageCheck className="w-5 h-5" />
                <span>{searching ? 'Mencari...' : 'Track Now'}</span>
              </button>
            </form>

            {matches && matches.length > 1 && (
              <div className="text-left space-y-3 pt-2">
                <p className="text-xs font-bold text-neutral-700">
                  Ditemukan {matches.length} pesanan untuk nomor ini. Pilih yang ingin dilacak:
                </p>
                <ul className="space-y-2">
                  {matches.map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`/track/${o.invoiceNumber}`}
                        className="flex items-center justify-between gap-3 bg-[#fdf8f1] hover:bg-[#f2ece5] border border-black/[0.08] rounded-2xl px-4 py-3 transition-colors"
                      >
                        <span className="min-w-0">
                          <span className="font-mono font-bold text-sm text-[#0d1526] block truncate">
                            {o.invoiceNumber}
                          </span>
                          <span className="text-[11px] text-neutral-500 block">
                            {new Date(o.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            · {o.items.reduce((s, i) => s + i.quantity, 0)} item
                          </span>
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          <OrderStatusBadge status={o.status} />
                          <ArrowRight className="w-4 h-4 text-neutral-400" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-black/[0.06] text-xs text-neutral-500">
              <p className="flex items-start justify-center gap-1.5">
                <ReceiptText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#f06a60]" />
                <span>
                  Simpan nomor invoice Anda. Nomor invoice dipakai untuk tracking status kapan saja.
                </span>
              </p>
              <p className="mt-2">
                Belum pesan cuci sepatu & tas?{' '}
                <Link href="/order" className="text-[#f06a60] font-bold hover:underline">
                  Pesan Antar-Jemput Gratis Disini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
