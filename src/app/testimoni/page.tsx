'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Quote,
} from 'lucide-react';

interface Testimonial {
  id: string;
  firstName: string;
  area: string;
  services: string[];
  beforePhoto?: string;
  afterPhoto?: string;
  review?: string;
  completedAt: string;
}

export default function TestimoniPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (data.success) setItems(data.data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-14 sm:pt-20 pb-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526] leading-[0.95]">
              Testimoni &amp; Hasil Nyata
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
              Setiap dokumentasi di bawah diambil dari pesanan yang benar-benar selesai dikerjakan
              di workshop kami: foto kondisi awal (Before), hasil akhir (After), dan kalimat
              testimoni yang dikutip dari chat pelanggan.
            </p>
          </div>
        </section>

        {/* Nilai jual singkat, bukan klaim palsu */}
        <section className="pb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, t: 'Foto QC Asli', d: 'Dokumentasi before & after tiap pesanan.' },
              { icon: Sparkles, t: 'Dikerjakan Manual', d: 'Teknisi, bukan mesin cuci massal.' },
              { icon: Quote, t: 'Tanpa Testimoni Palsu', d: 'Hanya hasil dari order yang selesai.' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.t}
                  className="bg-white rounded-2xl p-5 border border-black/[0.08] flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#f2ece5] flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-[#f06a60]" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-[#0d1526] text-sm">{f.t}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{f.d}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* List hasil */}
        <section className="py-8 border-t border-black/[0.06] bg-white/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#0d1526] mb-6">
              Hasil Pengerjaan Terbaru
            </h2>

            {loading ? (
              <div className="py-20 text-center text-neutral-500 text-sm space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#f06a60]" />
                <p>Memuat hasil pengerjaan...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-300 mx-auto" />
                <p className="text-sm font-bold text-[#0d1526]">Gagal memuat testimoni.</p>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center gap-2 bg-[#0d1526] hover:bg-[#f06a60] text-white text-xs font-bold px-4 py-3 rounded-full transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Coba Lagi
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-sm font-bold text-[#0d1526]">Belum ada hasil yang bisa ditampilkan.</p>
                <p className="text-xs text-neutral-500">
                  Dokumentasi akan muncul di sini setelah pesanan dengan foto QC Before &amp; After selesai.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map((t) => (
                  <article
                    key={t.id}
                    className="bg-white rounded-3xl border border-black/[0.08] overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-0.5">
                      <figure className="relative">
                        <img
                          src={t.beforePhoto}
                          alt={`Kondisi awal pesanan ${t.firstName}`}
                          className="w-full h-48 sm:h-60 object-cover"
                          loading="lazy"
                        />
                        <figcaption className="absolute top-3 left-3 bg-black/80 text-amber-300 text-[10px] sm:text-xs font-heading font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                          Before
                        </figcaption>
                      </figure>
                      <figure className="relative">
                        <img
                          src={t.afterPhoto}
                          alt={`Hasil akhir pesanan ${t.firstName}`}
                          className="w-full h-48 sm:h-60 object-cover"
                          loading="lazy"
                        />
                        <figcaption className="absolute top-3 right-3 bg-[#f06a60] text-white text-[10px] sm:text-xs font-heading font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                          After
                        </figcaption>
                      </figure>
                    </div>

                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {t.services.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-bold bg-[#f2ece5] text-[#0d1526] px-2.5 py-1 rounded-full border border-black/[0.06]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      {t.review && (
                        <blockquote className="text-sm text-neutral-700 leading-relaxed border-l-2 border-[#f06a60] pl-3">
                          &ldquo;{t.review}&rdquo;
                        </blockquote>
                      )}
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-[#0d1526]">
                          {t.firstName}{' '}
                          <span className="font-normal text-neutral-500">
                            · {t.area}
                            {' · '}
                            {new Date(t.completedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#0d1526]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Sepatu Anda berikutnya?
            </h2>
            <p className="text-sm sm:text-base text-neutral-300">
              Lihat harga transparan lalu jadwalkan penjemputan gratis ke alamat Anda.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/harga"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f06a60] hover:bg-white text-[#000000] hover:text-[#0d1526] font-heading font-bold text-base uppercase tracking-normal px-8 py-4 rounded-full transition-all active:scale-95"
              >
                Lihat Harga
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/order"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/25 text-white font-heading font-bold text-base uppercase tracking-normal px-8 py-4 rounded-full hover:bg-white/10 transition-all"
              >
                Pesan Sekarang
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
