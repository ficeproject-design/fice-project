'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Truck,
  Camera,
  RefreshCw,
  AlertCircle,
  Plus,
  Minus,
  FileText,
} from 'lucide-react';
import { formatRupiah } from '@/lib/invoice';
import { readCart, writeCart } from '@/lib/cart';
import type { Service } from '@/lib/types';

const SERVICE_IMAGES: Record<string, string> = {
  'srv-shoes-deepclean':
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&auto=format&fit=crop&q=85',
  'srv-shoes-suede':
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1400&auto=format&fit=crop&q=85',
  'srv-shoes-leather':
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1400&auto=format&fit=crop&q=85',
  'srv-shoes-kids':
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1400&auto=format&fit=crop&q=85',
  'srv-shoes-womens':
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1400&auto=format&fit=crop&q=85',
  'srv-bag-small':
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1400&auto=format&fit=crop&q=85',
  'srv-bag-medium':
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1400&auto=format&fit=crop&q=85',
  'srv-bag-large':
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1400&auto=format&fit=crop&q=85',
  'srv-acc-deepclean':
    'https://images.unsplash.com/photo-1556906781-9a412961d28f?w=1400&auto=format&fit=crop&q=85',
  fallback:
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1400&auto=format&fit=crop&q=85',
};

const CATEGORY_LABELS: Record<string, string> = {
  shoes: 'Sepatu',
  bag: 'Tas',
  accessories: 'Topi & Aksesori',
};

const WHATS_INCLUDED: Record<string, string[]> = {
  shoes: [
    'Pembersihan bagian luar (upper) menyeluruh',
    'Pembersihan midsole & outsole',
    'Pembersihan insole dan bagian dalam',
    'Pembersihan tali sepatu',
    'Deodorasi anti-bau',
    'Foto QC Before & After',
  ],
  bag: [
    'Pembersihan seluruh permukaan tas',
    'Pembersihan bagian dalam',
    'Pembersihan tali & aksen',
    'Conditioning untuk material kulit',
    'Deodorasi anti-bau',
    'Foto QC Before & After',
  ],
  accessories: [
    'Pembersihan menyeluruh seluruh permukaan',
    'Pembersihan bagian dalam & saku',
    'Deodorasi anti-bau',
    'Foto QC Before & After',
  ],
};

const RELATED_IMAGES: Record<string, string> = {
  'srv-shoes-deepclean':
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
  'srv-shoes-suede':
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&auto=format&fit=crop&q=80',
  'srv-shoes-leather':
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80',
  'srv-shoes-kids':
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&auto=format&fit=crop&q=80',
  'srv-shoes-womens':
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&auto=format&fit=crop&q=80',
  'srv-bag-small':
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80',
  'srv-bag-medium':
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
  'srv-bag-large':
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
  'srv-acc-deepclean':
    'https://images.unsplash.com/photo-1556906781-9a412961d28f?w=400&auto=format&fit=crop&q=80',
  fallback:
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80',
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [service, setService] = useState<Service | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState(1);

  const handleAddAndOrder = () => {
    if (!service) return;
    const cart = readCart();
    cart[service.id] = Math.min(50, (cart[service.id] || 0) + qty);
    writeCart(cart);
    router.push('/order');
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
          const all = data.data as Service[];
          setAllServices(all);
          const found = all.find((s) => s.id === id);
          if (found) setService(found);
          else setError(true);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdf8f1]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f06a60]" />
            <p className="text-sm text-neutral-500">Memuat detail layanan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdf8f1]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-300 mx-auto" />
            <h1 className="font-heading font-extrabold text-2xl text-[#0d1526] uppercase">Layanan Tidak Ditemukan</h1>
            <p className="text-sm text-neutral-500">Layanan yang Anda cari tidak tersedia.</p>
            <Link
              href="/harga"
              className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-sm uppercase px-6 py-3 rounded-2xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Harga
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = SERVICE_IMAGES[service.id] || SERVICE_IMAGES.fallback;
  const included = WHATS_INCLUDED[service.category] || WHATS_INCLUDED.shoes;
  const related = allServices
    .filter((s) => s.category === service.category && s.id !== service.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#0d1526]">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="pt-4 sm:pt-6 pb-2">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
              <Link href="/" className="hover:text-[#0d1526] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/harga" className="hover:text-[#0d1526] transition-colors">Services & Pricing</Link>
              <span>/</span>
              <span className="text-[#0d1526] font-medium">{service.name}</span>
            </nav>
          </div>
        </section>

        {/* HERO: Image + Info Side by Side */}
        <section className="pb-12 sm:pb-16">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

              {/* LEFT: Large Image */}
              <div className="rounded-[32px] overflow-hidden bg-[#f2ece5] aspect-[4/3] lg:aspect-auto lg:h-[520px]">
                <img
                  src={imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* RIGHT: Service Info */}
              <div className="space-y-6 lg:sticky lg:top-28">
                {/* Category + Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase font-heading font-bold tracking-wider text-[#f06a60] bg-[#f06a60]/10 px-3 py-1 rounded-full border border-[#f06a60]/20">
                    {CATEGORY_LABELS[service.category]}
                  </span>
                  {service.popular && (
                    <span className="bg-[#f06a60] text-white text-[10px] font-heading font-black uppercase px-2.5 py-1 rounded-full">
                      Populer
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase text-[#0d1526] leading-tight">
                  {service.name}
                </h1>

                {/* Price + Duration */}
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Harga / item</p>
                    <p className="font-heading font-black text-4xl sm:text-5xl text-[#f06a60]">
                      {formatRupiah(service.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f2ece5] px-4 py-2.5 rounded-2xl border border-black/[0.04]">
                    <Clock className="w-5 h-5 text-[#f06a60]" />
                    <div>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Estimasi</p>
                      <p className="text-sm font-heading font-bold text-[#0d1526]">{service.estimatedDays}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-base text-neutral-600 leading-relaxed font-body max-w-xl">
                  {service.description}
                </p>

                {/* Qty + CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="inline-flex items-center gap-3 bg-white border border-black/10 rounded-2xl px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="w-9 h-9 rounded-full border border-black/20 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 transition-all cursor-pointer"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-heading font-bold text-lg text-[#0d1526]">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(50, q + 1))}
                      className="w-9 h-9 rounded-full bg-[#0d1526] hover:bg-[#f06a60] text-white flex items-center justify-center transition-all cursor-pointer"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAndOrder}
                    className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    <span>Pesan Sekarang</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Link
                    href="/harga"
                    className="inline-flex items-center gap-2 bg-[#f2ece5] hover:bg-[#eae2d9] text-[#0d1526] font-heading font-bold text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl border border-black/[0.06] transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Semua Layanan
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <ShieldCheck className="w-4 h-4 text-[#f06a60]" />
                    <span>Garansi Puas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Camera className="w-4 h-4 text-[#f06a60]" />
                    <span>Foto QC Before & After</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Truck className="w-4 h-4 text-[#f06a60]" />
                    <span>Gratis Antar Jemput</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DESKRIPSI LAYANAN */}
        <section className="py-12 sm:py-16 bg-[#fdf8f1] border-t border-black/[0.06]">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                <FileText className="w-4 h-4 text-[#f06a60]" />
                Deskripsi Layanan
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl uppercase text-[#0d1526]">
                Tentang {service.name}
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-body">
                {service.longDescription || service.description}
              </p>
            </div>
          </div>
        </section>

        {/* WHAT'S INCLUDED */}
        <section className="py-12 sm:py-16 bg-white border-t border-black/[0.06]">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                  <Sparkles className="w-4 h-4 text-[#f06a60]" />
                  Yang Anda Dapatkan
                </div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl uppercase text-[#0d1526]">
                  Apa Saja yang Termasuk?
                </h2>
                <ul className="space-y-3">
                  {included.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#f06a60] shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-neutral-600 font-body">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                  <ShieldCheck className="w-4 h-4 text-[#f06a60]" />
                  Proses Kerja
                </div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl uppercase text-[#0d1526]">
                  Bagaimana Prosesnya?
                </h2>
                <div className="space-y-4">
                  {[
                    { step: '01', title: 'Booking & Pickup', desc: 'Pilih layanan ini, checkout, dan kurir kami menjemput sepatu/tas Anda — gratis.' },
                    { step: '02', title: 'Foto QC Awal', desc: 'Kondisi awal difoto dan didokumentasikan. Anda bisa cek di halaman tracking.' },
                    { step: '03', title: 'Proses Pembersihan', desc: 'Teknisi kami membersihkan dengan formula premium sesuai material.' },
                    { step: '04', title: 'Foto QC Akhir & Pengiriman', desc: 'Hasil akhir difoto, lalu dikirim kembali ke alamat Anda.' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#f06a60] flex items-center justify-center shrink-0">
                        <span className="font-heading font-black text-white text-sm">{s.step}</span>
                      </div>
                      <div>
                        <p className="font-heading font-bold text-sm text-[#0d1526]">{s.title}</p>
                        <p className="text-xs text-neutral-500 font-body mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RELATED SERVICES */}
        {related.length > 0 && (
          <section className="py-12 sm:py-16 bg-[#fdf8f1] border-t border-black/[0.06]">
            <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
              <div className="space-y-3 mb-8">
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl uppercase text-[#0d1526]">
                  Layanan Sejenis
                </h2>
                <p className="text-sm text-neutral-500">
                  Lihat layanan lainnya di kategori yang sama.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {related.map((srv) => (
                  <Link
                    key={srv.id}
                    href={`/harga/${srv.id}`}
                    className="group bg-white rounded-[28px] overflow-hidden border border-black/[0.06] hover:border-[#f06a60]/40 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="h-48 sm:h-56 overflow-hidden">
                      <img
                        src={RELATED_IMAGES[srv.id] || RELATED_IMAGES.fallback}
                        alt={srv.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 sm:p-6 space-y-2">
                      <span className="text-[10px] uppercase font-heading font-bold tracking-wider text-[#f06a60]">
                        {CATEGORY_LABELS[srv.category]}
                      </span>
                      <h3 className="font-heading font-bold text-lg sm:text-xl text-[#0d1526]">{srv.name}</h3>
                      <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 font-body">{srv.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-heading font-black text-lg text-[#f06a60]">{formatRupiah(srv.price)}</span>
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {srv.estimatedDays}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
