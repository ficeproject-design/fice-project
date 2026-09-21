'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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

const ITEMS_PER_PAGE = 4;

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
        {/* Hero */}
        <section className="pt-14 sm:pt-20 pb-10">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 text-center space-y-4">
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526] leading-[0.95]">
              Testimonials &amp; Real Results
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
              Setiap dokumentasi di bawah ini berasal dari pesanan yang benar-benar selesai di workshop kami: foto kondisi awal (Before), hasil akhir (After), dan ulasan pelanggan yang dikutip langsung dari chat.
            </p>
          </div>
        </section>

        {/* List hasil */}
        <section className="py-8 border-t border-black/[0.06] bg-white/40">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#0d1526] mb-6">
              Recent Work
            </h2>

            {loading ? (
              <div className="py-20 text-center text-neutral-500 text-sm space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#f06a60]" />
                <p>Loading results...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-300 mx-auto" />
                <p className="text-sm font-bold text-[#0d1526]">Failed to load testimonials.</p>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center gap-2 bg-[#0d1526] hover:bg-[#f06a60] text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-sm font-bold text-[#0d1526]">No results to display yet.</p>
                <p className="text-xs text-neutral-500">
                  Dokumentasi akan muncul di sini setelah pesanan dengan foto QC Before &amp; After selesai.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {paginatedItems.map((t) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-neutral-600 hover:bg-[#f2ece5] disabled:opacity-30 transition-all cursor-pointer"
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
                            ? 'bg-[#0d1526] text-white'
                            : 'border border-black/10 text-neutral-600 hover:bg-[#f2ece5]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-neutral-600 hover:bg-[#f2ece5] disabled:opacity-30 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
