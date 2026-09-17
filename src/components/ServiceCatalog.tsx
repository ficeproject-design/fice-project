'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Trash2,
  Clock,
} from 'lucide-react';
import { Service, ServiceCategory } from '@/lib/types';
import { formatRupiah } from '@/lib/invoice';

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  shoes: 'Sepatu',
  bag: 'Tas',
  accessories: 'Topi & Aksesori',
};

type Cart = Record<string, number>;

export default function ServiceCatalog() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [category, setCategory] = useState<'all' | ServiceCategory>('all');
  const [cart, setCart] = useState<Cart>({});

  const loadServices = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const raw = sessionStorage.getItem('fice_cart');
        if (raw) {
          sessionStorage.removeItem('fice_cart');
          const saved = JSON.parse(raw) as Record<string, number>;
          const next: Cart = {};
          for (const [id, q] of Object.entries(saved)) {
            const qty = Number(q);
            if (qty > 0) next[id] = Math.min(50, Math.floor(qty));
          }
          if (Object.keys(next).length > 0) setCart(next);
        }
      } catch {
        // cart rusak, mulai dari kosong
      }
      await loadServices();
    })();
  }, []);

  const setQty = (id: string, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(50, qty);
      return next;
    });
  };

  const shown = services.filter((s) => category === 'all' || s.category === category);
  const itemsCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const subtotal = services.reduce((s, srv) => s + (cart[srv.id] || 0) * srv.price, 0);

  const handleCheckout = () => {
    sessionStorage.setItem('fice_cart', JSON.stringify(cart));
    router.push('/order');
  };

  return (
    <>
      {/* Filter kategori */}
      <div
        className="flex flex-wrap items-center gap-1.5 bg-[#f5f3f0] p-1.5 rounded-full border border-black/[0.06] shadow-sm w-fit mb-8"
        role="group"
        aria-label="Filter kategori layanan"
      >
        {(['all', 'shoes', 'bag', 'accessories'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`px-5 sm:px-7 py-3 rounded-full text-sm font-heading font-bold uppercase tracking-normal transition-all duration-200 cursor-pointer ${
              category === c
                ? 'bg-[#0d1526] text-white shadow-sm'
                : 'text-[#0d1526]/70 hover:text-[#0d1526] hover:bg-black/[0.06]'
            }`}
          >
            {c === 'all' ? 'Semua' : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center text-neutral-500 text-sm space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#f06a60]" />
          <p>Memuat daftar layanan...</p>
        </div>
      ) : loadError ? (
        <div className="py-24 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-300 mx-auto" />
          <p className="text-sm font-bold text-[#0d1526]">Gagal memuat daftar layanan.</p>
          <button
            type="button"
            onClick={loadServices}
            className="inline-flex items-center gap-2 bg-[#0d1526] hover:bg-[#f06a60] text-white text-xs font-bold px-4 py-3 rounded-full transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      ) : shown.length === 0 ? (
        <div className="py-24 text-center space-y-2">
          <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-sm font-bold text-[#0d1526]">Belum ada layanan di kategori ini.</p>
          <p className="text-xs text-neutral-500">
            Pilih kategori lain, atau hubungi admin untuk layanan khusus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {shown.map((srv) => {
            const qty = cart[srv.id] || 0;
            return (
              <div
                key={srv.id}
                className="bg-white rounded-[28px] p-5 sm:p-6 border border-black/[0.08] hover:border-[#f06a60]/60 transition-colors flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-500">
                      {CATEGORY_LABELS[srv.category]}
                    </span>
                    {srv.popular && (
                      <span className="bg-[#f06a60] text-white text-[10px] font-heading font-black uppercase px-2.5 py-1 rounded-full">
                        Populer
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#0d1526] leading-tight">
                    {srv.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {srv.description}
                  </p>
                  <p className="text-[11px] text-slate-500 inline-flex items-center gap-1 pt-1">
                    <Clock className="w-3.5 h-3.5 text-[#f06a60]" />
                    Perkiraan selesai {srv.estimatedDays}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-black/[0.06] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
                      Tarif / item
                    </span>
                    <span className="font-heading font-black text-xl text-[#f06a60]">
                      {formatRupiah(srv.price)}
                    </span>
                  </div>

                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => setQty(srv.id, 1)}
                      className="inline-flex items-center gap-1.5 bg-[#0d1526] hover:bg-[#f06a60] text-white font-bold text-xs px-4 min-h-[44px] rounded-full transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah
                    </button>
                  ) : (
                    <div
                      className="inline-flex items-center gap-1 bg-[#f2ece5] border border-black/10 rounded-full p-1"
                      role="group"
                      aria-label={`Jumlah ${srv.name}`}
                    >
                      <button
                        type="button"
                        onClick={() => setQty(srv.id, qty - 1)}
                        aria-label={`Kurangi ${srv.name}`}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-white border border-black/10 hover:border-[#f06a60] hover:text-[#f06a60] transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-mono font-black text-sm text-[#0d1526]" aria-live="polite">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(srv.id, qty + 1)}
                        aria-label={`Tambah ${srv.name}`}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-[#0d1526] text-white hover:bg-[#f06a60] transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spacer agar konten tidak tertutup bilah saat cart terisi */}
      {itemsCount > 0 && <div className="h-20" aria-hidden="true" />}

      {/* Bilah keranjang */}
      {itemsCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-black/10 bg-[#fdf8f1]/98 backdrop-blur-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#0d1526] text-white flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4.5 h-4.5 text-[#f06a60]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 leading-tight">
                  {itemsCount} item dipilih · gratis antar-jemput
                </p>
                <p className="font-heading font-black text-base sm:text-lg text-[#0d1526] leading-tight truncate">
                  {formatRupiah(subtotal)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCart({})}
              aria-label="Kosongkan pilihan"
              className="ml-auto w-11 h-11 inline-flex items-center justify-center rounded-full border border-black/10 text-slate-500 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#000000] hover:text-white text-[#000000] font-heading font-bold text-sm uppercase tracking-normal px-5 sm:px-7 min-h-[44px] rounded-full shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Lanjut ke Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
