'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
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

const ITEMS_PER_PAGE = 6;

export default function TestimoniPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SPLIT */}
        <section className="pt-2 sm:pt-3 pb-6 sm:pb-10">
          <div className="mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 items-stretch lg:h-[62vh] lg:min-h-[480px] lg:max-h-[660px]">
              <div className="rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] overflow-hidden relative shadow-xs h-[320px] sm:h-[400px] lg:h-full bg-[#f2ece5]">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&auto=format&fit=crop&q=85"
                  alt="Hasil deep clean Fice Shoes Care"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7 flex items-center gap-2 text-white">
                  <Star className="w-4 h-4 text-[#f06a60] fill-[#f06a60] shrink-0" />
                  <p className="text-xs sm:text-sm font-bold">
                    {items.length > 0
                      ? `${items.length} hasil terdokumentasi dari order nyata`
                      : 'Hasil terdokumentasi dari order nyata'}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] bg-[#f06a60] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center gap-6 sm:gap-8 shadow-xs">
                <span className="inline-flex w-fit items-center bg-white text-[#0d1526] text-[11px] sm:text-xs font-heading font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Testimoni
                </span>
                <h1 className="font-heading font-extrabold uppercase leading-[0.9] text-4xl sm:text-6xl lg:text-6xl xl:text-7xl">
                  Real Results.
                  <br />
                  Real Reviews.
                </h1>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-lg">
                  Setiap dokumentasi berasal dari pesanan yang benar-benar selesai: foto kondisi awal, hasil akhir, dan ulasan pelanggan.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/order"
                    className="group inline-flex items-center gap-2 bg-[#0d1526] hover:bg-white hover:text-[#0d1526] text-white font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl transition-all active:scale-95"
                  >
                    <span>Book Cleaning</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/harga"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white hover:text-[#0d1526] text-white font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl transition-all"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GALERI GELAP */}
        <section className="bg-[#0d1526] rounded-[28px] sm:rounded-[36px] mx-3 sm:mx-6 lg:mx-8 xl:mx-10 mb-6 sm:mb-10 px-6 sm:px-12 lg:px-16 py-14 sm:py-20">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-[#f06a60] mb-4">
            Recent Work
          </p>
          <h2 className="font-heading font-extrabold uppercase text-center text-white leading-[0.95] text-3xl sm:text-5xl lg:text-6xl max-w-4xl mx-auto mb-10 sm:mb-14">
            Before. After. Proven.
          </h2>

          {loading ? (
            <div className="py-20 text-center text-neutral-400 text-sm space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f06a60]" />
              <p>Loading results...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-[#f06a60] mx-auto" />
              <p className="text-sm font-bold text-white">Failed to load testimonials.</p>
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-white hover:text-[#0d1526] text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm font-bold text-white">No results to display yet.</p>
              <p className="text-xs text-neutral-400">
                Dokumentasi muncul setelah pesanan dengan foto QC Before &amp; After selesai.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {paginatedItems.map((t) => (
                  <article
                    key={t.id}
                    className="bg-white/[0.04] border border-white/10 rounded-[24px] sm:rounded-[28px] overflow-hidden flex flex-col hover:border-[#f06a60]/40 transition-colors"
                  >
                    <div className="grid grid-cols-2 gap-1 p-2.5 pb-0">
                      <figure className="relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-white/5">
                        {t.beforePhoto && (
                          <img
                            src={t.beforePhoto}
                            alt={`Kondisi awal pesanan ${t.firstName}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <figcaption className="absolute top-2.5 left-2.5 bg-black/80 text-amber-300 text-[10px] font-heading font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                          Before
                        </figcaption>
                      </figure>
                      <figure className="relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-white/5">
                        {t.afterPhoto && (
                          <img
                            src={t.afterPhoto}
                            alt={`Hasil akhir pesanan ${t.firstName}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <figcaption className="absolute top-2.5 right-2.5 bg-[#f06a60] text-white text-[10px] font-heading font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                          After
                        </figcaption>
                      </figure>
                    </div>
                    <div className="p-5 sm:p-6 pt-4 space-y-3 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {t.services.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-bold bg-white/10 text-neutral-200 px-2.5 py-1 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      {t.review && (
                        <blockquote className="text-xs sm:text-sm text-neutral-300 leading-relaxed border-l-2 border-[#f06a60] pl-3 line-clamp-4">
                          &ldquo;{t.review}&rdquo;
                        </blockquote>
                      )}
                      <p className="mt-auto pt-1 text-xs font-bold text-white">
                        {t.firstName}{' '}
                        <span className="font-normal text-neutral-400">
                          · {t.area}
                          {' · '}
                          {new Date(t.completedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 sm:mt-12">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-neutral-300 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-[#f06a60] text-white'
                          : 'border border-white/15 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-neutral-300 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
