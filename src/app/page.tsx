'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Truck,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Search,
  MapPin,
  Camera,
  CreditCard,
  Layers,
  ChevronRight,
  HelpCircle,
  Star,
  Phone,
  MessageSquare,
  BadgeCheck,
  Check,
  Calendar,
  Mail,
  Smartphone,
  X,
} from 'lucide-react';
import { COVERAGE_AREAS } from '@/lib/haversine';
import { formatRupiah } from '@/lib/invoice';
import type { Service } from '@/lib/types';

const SWAP_LOCATIONS = [
  'JAKSEL',
  'TANGERANG',
  'TANGSEL',
  'BINTARO',
  'BSD CITY',
];

const SERVICE_IMAGES: Record<string, string> = {
  'srv-shoes-deepclean':
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
  'srv-shoes-leather':
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop',
  'srv-bag-medium':
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  'srv-shoes-suede':
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop',
  'srv-acc-deepclean':
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  fallback:
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
};

export default function HomePage() {
  const router = useRouter();
  const [trackQuery, setTrackQuery] = useState('');
  const [locationIndex, setLocationIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [coverageModalOpen, setCoverageModalOpen] = useState(false);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
          const all = data.data as Service[];
          const popular = all.filter((s) => s.popular);
          const rest = all.filter((s) => !s.popular);
          setFeaturedServices([...popular, ...rest].slice(0, 4));
        }
      } catch {
        // gagal load, section highlight tetap aman tampil kosong
      }
    })();
  }, []);

  // Rotating location text effect matching Sparkles template
  useEffect(() => {
    const timer = setInterval(() => {
      setLocationIndex((prev) => (prev + 1) % SWAP_LOCATIONS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    router.push(`/track/${trackQuery.trim()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION - EXACT SPARKLES TWO-CARD SPLIT LAYOUT */}
        <section className="pt-2 sm:pt-3 pb-6 sm:pb-10">
          <div className="max-w-[1760px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 space-y-2 sm:space-y-3">

            {/* The 2 Large Split Cards - Equal Height Dominating Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch lg:h-[68vh] lg:min-h-[520px] lg:max-h-[720px] lg:gap-3">
              
              {/* IMAGE CARD — mobile: first (on top), desktop: right side */}
              <div className="order-1 lg:order-2 rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] overflow-hidden relative shadow-xs h-[320px] sm:h-[400px] lg:h-full bg-[#f2ece5]">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&auto=format&fit=crop&q=85"
                  alt="Shoes Care Detailing"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating pill badge */}
                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 flex items-center justify-between text-white text-xs sm:text-sm font-bold bg-black/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f06a60] animate-pulse"></span>
                    <span>Fice Shoes Care Workshop</span>
                  </div>
                  <span className="text-[#f06a60] font-extrabold hidden sm:inline">Jaksel • Tangsel • Tangerang</span>
                </div>
              </div>

              {/* DARK CARD — mobile: second (overlaps image), desktop: left side */}
              <div className="order-2 lg:order-1 bg-[#0d1526] text-white rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] p-5 sm:p-8 lg:p-12 xl:p-14 flex flex-col justify-between shadow-xs h-full -mt-16 sm:-mt-20 lg:mt-0 relative z-10">
                {/* Top Rating Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-wide transition-colors">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#f06a60] text-white flex items-center justify-center font-black text-[9px] sm:text-[10px]">
                      ★
                    </span>
                    <span>100% FREE PICKUP</span>
                  </div>
                </div>

                {/* Giant Headline All-Caps matching Sparkles reference */}
                <div className="my-auto py-3 sm:py-6 space-y-0">
                  <h1 className="font-heading font-black text-[32px] sm:text-6xl lg:text-[64px] xl:text-[80px] 2xl:text-[92px] leading-[0.88] sm:leading-[0.86] tracking-tight uppercase">
                    <span className="block">CLEANING</span>
                    <span className="block">FOR BUSY</span>
                    <span className="block">PEOPLE IN</span>
                    <span className="block text-[#f06a60] transition-all duration-300">
                      {SWAP_LOCATIONS[locationIndex]}
                    </span>
                  </h1>
                </div>

                {/* Bottom Action Buttons inside the dark card */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <Link
                    href="/order"
                    className="group relative inline-flex items-center justify-center bg-[#f06a60] hover:bg-white text-[#000000] font-heading font-bold text-sm sm:text-lg lg:text-[19px] xl:text-[20px] tracking-normal uppercase px-5 sm:px-7 py-3 sm:py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ease-out active:scale-95 overflow-hidden"
                  >
                    <span className="transition-colors duration-300">BOOK YOUR CLEANING</span>
                    <span className="max-w-0 opacity-0 -translate-x-2 group-hover:max-w-6 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2.5 transition-all duration-300 ease-out inline-flex items-center overflow-hidden">
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </span>
                  </Link>

                  <Link
                    href="#layanan"
                    className="group relative inline-flex items-center justify-center bg-white/10 hover:bg-white text-white hover:text-[#000000] font-heading font-bold text-sm sm:text-lg lg:text-[19px] xl:text-[20px] tracking-normal uppercase px-5 sm:px-7 py-3 sm:py-4 rounded-2xl border border-white/15 hover:border-white transition-all duration-300 ease-out overflow-hidden"
                  >
                    <span className="transition-colors duration-300">SEE PRICING</span>
                    <span className="max-w-0 opacity-0 -translate-x-2 group-hover:max-w-6 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2 transition-all duration-300 ease-out inline-flex items-center overflow-hidden">
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* SPARKLES SUPPORT TILES GRID (4 HORIZONTAL CARDS) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 pt-4 sm:pt-6">
              {/* Tile 1: Phone / WhatsApp */}
              <a
                href="https://wa.me/628161885553"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#f2ece5] hover:bg-[#eae2d9] p-6 sm:p-7 rounded-[24px] sm:rounded-[30px] border border-black/[0.04] transition-all flex items-center gap-4 group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white flex items-center justify-center text-[#0d1526] shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Phone className="w-7 h-7 text-[#0d1526]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-heading font-bold text-base sm:text-lg text-[#0d1526] tracking-tight leading-none">
                    Phone
                  </h4>
                  <p className="text-sm sm:text-base text-neutral-600 truncate mt-1.5 font-body">
                    +62 816-1885-553
                  </p>
                </div>
              </a>

              {/* Tile 2: Email */}
              <a
                href="mailto:fice.shoescare@gmail.com"
                className="bg-[#f2ece5] hover:bg-[#eae2d9] p-6 sm:p-7 rounded-[24px] sm:rounded-[30px] border border-black/[0.04] transition-all flex items-center gap-4 group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white flex items-center justify-center text-[#0d1526] shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Mail className="w-7 h-7 text-[#0d1526]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-heading font-bold text-base sm:text-lg text-[#0d1526] tracking-tight leading-none">
                    Email
                  </h4>
                  <p className="text-sm sm:text-base text-neutral-600 truncate mt-1.5 font-body">
                    fice.shoescare@gmail.com
                  </p>
                </div>
              </a>

              {/* Tile 3: Free Pickup & Delivery */}
              <button
                type="button"
                onClick={() => setCoverageModalOpen(true)}
                className="bg-[#f2ece5] hover:bg-[#eae2d9] p-6 sm:p-7 rounded-[24px] sm:rounded-[30px] border border-black/[0.04] transition-all flex items-center gap-4 text-left group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white flex items-center justify-center text-[#0d1526] shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Truck className="w-7 h-7 text-[#f06a60]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-heading font-bold text-base sm:text-lg text-[#0d1526] tracking-tight leading-none">
                    Free Pickup &amp; Delivery
                  </h4>
                  <p className="text-sm sm:text-base text-neutral-600 truncate mt-1.5 font-body flex items-center gap-1.5">
                    <span>Jaksel, Tangsel &amp; Tangerang</span>
                    <span className="text-xs text-[#f06a60] font-bold underline decoration-dotted">Lihat Area</span>
                  </p>
                </div>
              </button>

              {/* Tile 4: Jam Operasional */}
              <div className="bg-[#f2ece5] p-6 sm:p-7 rounded-[24px] sm:rounded-[30px] border border-black/[0.04] flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white flex items-center justify-center text-[#0d1526] shrink-0 shadow-2xs">
                  <Clock className="w-7 h-7 text-[#f06a60]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-heading font-bold text-base sm:text-lg text-[#0d1526] tracking-tight leading-none">
                    Jam Operasional
                  </h4>
                  <p className="text-sm sm:text-base text-neutral-600 truncate mt-1.5 font-body">
                    Setiap Hari, 08:00 – 20:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE CONTINUOUS SCROLLING TICKER */}
        <div className="bg-[#000000] text-white py-3.5 overflow-hidden border-y border-neutral-900">
          <div className="animate-marquee flex items-center gap-8 text-xs sm:text-sm font-heading font-bold uppercase tracking-widest whitespace-nowrap">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              DEEP CLEAN SHOES
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              SPECIAL SUEDE & LEATHER TREATMENT
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              BAG & BACKPACK CLEANING
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              100% FREE PICKUP &amp; DELIVERY
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              PHOTO QC DOCUMENTATION — BEFORE &amp; AFTER
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              PAY AFTER ARRIVAL AT WORKSHOP
            </span>
            {/* Loop duplicate */}
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              DEEP CLEAN SHOES
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              SPECIAL SUEDE & LEATHER TREATMENT
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              BAG & BACKPACK CLEANING
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              100% FREE PICKUP &amp; DELIVERY
            </span>
          </div>
        </div>

        {/* SECTION "WHAT WE CLEAN" / SERVICES */}
        <section id="layanan" className="py-20 sm:py-24 bg-[#fdf8f1] scroll-mt-12">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="space-y-3 mb-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                <Sparkles className="w-4 h-4 text-[#f06a60]" />
                What We Clean • Premium Care Specialist
              </div>
              <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                What We Clean
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Setiap sepatu dan tas dibersihkan secara manual oleh teknisi berpengalaman menggunakan formula premium — tanpa deterjen keras.
              </p>
            </div>

            {featuredServices.length > 0 && (
              <div className="overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
                <div className="animate-carousel flex gap-4 sm:gap-5 w-max">
                  {[...featuredServices, ...featuredServices].map((srv, i) => (
                    <Link
                      key={`${srv.id}-${i}`}
                      href={`/harga/${srv.id}`}
                      className="group relative flex-none w-[260px] sm:w-[300px] lg:w-[340px] h-[380px] sm:h-[420px] rounded-[28px] overflow-hidden"
                    >
                      <img
                        src={SERVICE_IMAGES[srv.id] || SERVICE_IMAGES.fallback}
                        alt={srv.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end">
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-heading font-bold tracking-wider text-white/70">
                            {srv.category === 'shoes'
                              ? 'Sepatu'
                              : srv.category === 'bag'
                                ? 'Tas'
                                : 'Topi & Aksesori'}
                          </span>
                          <h3 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white uppercase leading-[0.95] tracking-tight">
                            {srv.name}
                          </h3>
                          <div className="flex items-center justify-between gap-3 pt-2">
                            <span className="font-heading font-black text-lg text-[#f06a60]">
                              {formatRupiah(srv.price)}
                            </span>
                            <span className="text-[11px] text-white/60 inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {srv.estimatedDays}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <p className="text-xs text-neutral-500">
                Filter berdasarkan kategori, atur jumlah, dan checkout di halaman harga.
              </p>
              <Link
                href="/harga"
                className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-[#000000] hover:text-white font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl shadow-sm transition-all duration-300 active:scale-95"
              >
                View All Services &amp; Pricing
                <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION CARA KERJA / 4 LANGKAH MUDAH */}
        <section id="cara-kerja" className="py-20 sm:py-24 bg-[#fdf8f1] border-y border-black/[0.06] scroll-mt-12">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-xs sm:text-sm font-heading font-bold uppercase tracking-wider bg-[#f2ece5] text-[#f06a60] border border-[#f06a60]/20 px-4 py-1.5 rounded-full">
                Super Easy &amp; Hassle-Free
              </span>
              <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                How It Works
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
                Cukup 2 menit untuk booking — kurir kami jemput dan antar langsung ke rumah Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              <div className="bg-[#f2ece5] hover:bg-[#eae2d9] p-8 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-black/[0.04] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#000000] text-white font-heading font-black text-2xl flex items-center justify-center shadow-xs">
                  01
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-[#000000]">Booking Online</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Pilih layanan Anda, tandai lokasi di peta interaktif, dan pilih jadwal penjemputan yang diinginkan.
                  </p>
                </div>
              </div>

              <div className="bg-[#f2ece5] hover:bg-[#eae2d9] p-8 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-black/[0.04] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#f06a60] text-white font-heading font-black text-2xl flex items-center justify-center shadow-xs">
                  02
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-[#000000]">Courier Picks Up</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Kurir kami menghubungi Anda via WhatsApp dan menjemput sepatu/tas Anda — sepenuhnya gratis.
                  </p>
                </div>
              </div>

              <div className="bg-[#f2ece5] hover:bg-[#eae2d9] p-8 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-black/[0.04] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#000000] text-white font-heading font-black text-2xl flex items-center justify-center shadow-xs">
                  03
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-[#000000]">QC Photo &amp; Treatment</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Di workshop kami, kami foto kondisi awal (Before) dan membersihkan sesuai standar material.
                  </p>
                </div>
              </div>

              <div className="bg-[#f2ece5] hover:bg-[#eae2d9] p-8 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-black/[0.04] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#f06a60] text-white font-heading font-black text-2xl flex items-center justify-center shadow-xs">
                  04
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-[#000000]">Delivered Back</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Sepatu dibersihkan, foto QC After diunggah, lalu dikembalikan ke alamat Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION QC SHOWCASE */}
        <section id="tentang" className="py-20 sm:py-24 bg-[#fdf8f1]">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="bg-[#000000] rounded-[32px] sm:rounded-[40px] text-white p-8 sm:p-14 lg:p-16 overflow-hidden relative shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-[#f06a60] text-white text-xs sm:text-sm font-heading font-bold uppercase px-4 py-1.5 rounded-full">
                    <Camera className="w-4 h-4" />
                    100% Transparency Guarantee
                  </div>
                  <h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
                    Every Shoe Gets Photo-QC&apos;d (Before &amp; After)
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
                    Tenang! Saat sepatu Anda tiba di workshop kami, kurir dan teknisi kami memotret kondisi awal (sol, upper, tali) dan mencatat goresan yang sudah ada sebelumnya. Anda bisa melihat fotonya langsung di halaman tracking pesanan Anda.
                  </p>

                  <div className="space-y-3 text-xs sm:text-sm text-neutral-300 pt-2">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#f06a60] shrink-0" />
                      <span>Mencegah sengketa terhadap kerusakan yang sudah ada sebelumnya.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#f06a60] shrink-0" />
                      <span>Lihat sendiri perbandingan before vs. after-nya.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#f06a60] shrink-0" />
                      <span>Invoice resmi otomatis dibuat — bisa dicetak atau dibagikan via WhatsApp.</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/order"
                       className="group relative inline-flex items-center justify-center bg-[#f06a60] hover:bg-white text-[#000000] font-heading font-bold text-base sm:text-lg lg:text-[19px] xl:text-[20px] tracking-normal uppercase px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl transition-all duration-300 ease-out shadow-md hover:shadow-lg active:scale-95 overflow-hidden"
                    >
                      <span className="transition-colors duration-300">Try Our Service</span>
                      <span className="max-w-0 opacity-0 -translate-x-2 group-hover:max-w-6 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2.5 transition-all duration-300 ease-out inline-flex items-center overflow-hidden">
                        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Visual Before & After Mock (Side-by-side Kiri Kanan, Scaled Up) */}
                <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-7">
                  <div className="bg-neutral-900 p-4 sm:p-5 lg:p-6 rounded-[28px] sm:rounded-[36px] border border-neutral-800 space-y-3 sm:space-y-4">
                    <div className="relative h-72 sm:h-96 md:h-[420px] lg:h-[480px] xl:h-[520px] rounded-[20px] sm:rounded-[26px] overflow-hidden bg-neutral-800">
                      <img
                        src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&auto=format&fit=crop&q=85"
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-4 left-4 bg-[#000000]/90 backdrop-blur-md text-amber-400 text-xs sm:text-sm font-heading font-bold px-4 py-2 rounded-xl border border-amber-400/30 uppercase tracking-wide shadow-md">
                        Initial Condition (Before)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-neutral-400 italic px-1">
                      Debu dan kotoran tebal di midsole &amp; outsole.
                    </p>
                  </div>

                  <div className="bg-neutral-900 p-4 sm:p-5 lg:p-6 rounded-[28px] sm:rounded-[36px] border border-neutral-800 space-y-3 sm:space-y-4">
                    <div className="relative h-72 sm:h-96 md:h-[420px] lg:h-[480px] xl:h-[520px] rounded-[20px] sm:rounded-[26px] overflow-hidden bg-neutral-800">
                      <img
                        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=85"
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-4 left-4 bg-[#f06a60] text-white text-xs sm:text-sm font-heading font-bold px-4 py-2 rounded-xl uppercase tracking-wide shadow-md">
                        Cleaned (After)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-neutral-200 font-semibold px-1">
                      Kering sempurna, aroma segar, dan higienis bersih!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: KENAPA HARUS MERAWAT SEPATU */}
        <section className="py-20 sm:py-24 bg-[#fdf8f1] border-t border-black/[0.05]">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: Image */}
              <div className="relative order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[32px] overflow-hidden h-[420px] sm:h-[520px] bg-[#f2ece5]">
                  <img
                    src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop&q=85"
                    alt="Perawatan sepatu oleh teknisi Fice"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating stat */}
                <div className="absolute top-6 left-6 bg-white rounded-2xl px-5 py-4 border border-black/[0.07] shadow-lg">
                  <p className="font-heading font-bold text-3xl text-[#f06a60]">3×</p>
                  <p className="text-xs text-neutral-500 font-body mt-0.5">Tahan 3× lebih lama dengan perawatan rutin</p>
                </div>
                <div className="absolute bottom-6 right-6 bg-[#0d1526] rounded-2xl px-5 py-4 shadow-lg">
                  <p className="font-heading font-bold text-2xl text-white">Rp 65k</p>
                  <p className="text-xs text-neutral-400 font-body mt-0.5">dibanding beli baru dengan harga jutaan</p>
                </div>
              </div>

              {/* Right: Content */}
              <div className="order-1 lg:order-2 space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                    <ShieldCheck className="w-4 h-4 text-[#f06a60]" />
                    Why It Matters
                  </div>
                  <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                    Why Should You Care for Your Shoes?
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-body">
                    Sepatu bukan sekadar pelindung kaki — mereka adalah bagian dari gaya Anda, 
                    investasi, dan ekspresi diri Anda. Tanpa perawatan rutin, usia sepatu menurun drastis, 
                    material cepat rusak, dan kilau pun hilang.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Extends Shoe Lifespan',
                      desc: 'Debu, keringat, dan kotoran menumpuk serta merusak material dari dalam. Perawatan rutin dapat memperpanjang umur sepatu hingga 3× lebih lama.',
                    },
                    {
                      title: 'Maintains Value & Appearance',
                      desc: 'Sepatu yang bersih dan terawat meningkatkan kepercayaan diri. Untuk sneaker koleksi, perawatan yang tepat menjaga nilai jual kembali.',
                    },
                    {
                      title: 'Prevents Odor & Bacteria',
                      desc: 'Insole yang lembab menjadi tempat berkembang biak bakteri dan jamur. Pembersihan rutin menjaga sepatu Anda tetap higienis dan nyaman setiap hari.',
                    },
                    {
                      title: 'Saves You More',
                      desc: 'Perawatan jauh lebih murah daripada membeli baru. Satu kali cuci di Fice mulai dari Rp 65.000 — sebagian kecil dari harga sepatu baru.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 bg-[#f2ece5] rounded-2xl p-5 border border-black/[0.04]">
                      <div className="w-9 h-9 rounded-xl bg-[#f06a60] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-base sm:text-lg text-[#0d1526]">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-neutral-600 font-body leading-relaxed mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/order"
                   className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-base sm:text-lg uppercase tracking-normal px-7 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ease-out active:scale-95"
                >
                  <span>Rawat Sepatu Sekarang</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 sm:py-24 bg-[#f2ece5]/40 border-t border-black/[0.06]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <span className="text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#f06a60]">FAQ</span>
              <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">
                Informasi penting tentang layanan jemput antar kami dan bagaimana Fice Shoes Care beroperasi.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'Is the pickup & delivery really 100% free?',
                  a: 'Ya! Dalam radius 20 km dari workshop kami di Bintaro (Tangerang Selatan), jemput antar gratis berlaku tanpa minimum order (bahkan 1 pasang pun gratis). Di luar 20 km (masih dalam Jaksel, Tangsel, dan Tangerang), jemput antar gratis dengan minimum 3 pasang/barang.',
                },
                {
                  q: 'Which areas are covered for free pickup & delivery?',
                  a: 'Cakupan kami meliputi 3 wilayah: (1) Kota Tangerang Selatan: Serpong, Serpong Utara, Ciputat, Ciputat Timur, Pamulang, Pondok Aren, Setu. (2) Kota Tangerang: Ciledug, Cipondoh, Karang Tengah, Karawaci, Gading Serpong, Larangan. (3) Jakarta Selatan: Cilandak, Jagakarsa, Kebayoran Baru, Kebayoran Lama, Mampang Prapatan, Pancoran, Pasar Minggu, Pesanggrahan, Tebet, Setiabudi.',
                },
                {
                  q: 'What if I order after 1 PM — when will my shoes be picked up?',
                  a: 'Pesanan yang dibuat sebelum pukul 13:00 WIB bisa dijemput hari yang sama (slot sore 14:00–18:00). Pesanan yang dibuat setelah pukul 13:00 akan dijadwalkan hari berikutnya (H+1) agar rute kurir tetap efisien dan tepat waktu.',
                },
                {
                  q: 'When do I need to pay for my order?',
                  a: 'Pembayaran dilakukan satu kali via transfer bank, setelah sepatu Anda tiba di workshop kami dan kondisi fisik diverifikasi melalui foto QC awal. Invoice resmi muncul di halaman tracking pesanan Anda beserta detail rekening tujuan.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[24px] sm:rounded-[28px] border border-black/[0.08] shadow-xs overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-7 sm:p-8 text-left cursor-pointer group"
                  >
                    <span className="flex items-center gap-3 font-heading font-extrabold text-lg sm:text-xl text-[#0d1526]">
                      <HelpCircle className="w-5 h-5 text-[#f06a60] shrink-0" />
                      {item.q}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-300 ${
                        openFaq === i ? 'rotate-90 text-[#f06a60]' : 'group-hover:text-[#f06a60]'
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-7 sm:px-8 pb-7 sm:pb-8 pt-0">
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pl-8 border-t border-black/[0.05] pt-5">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODAL COVERAGE AREA */}
        {coverageModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setCoverageModalOpen(false)}
          >
            <div
              className="bg-[#fdf8f1] rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-black/10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setCoverageModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#0d1526] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edeaf6] text-xs font-heading font-bold uppercase tracking-wider text-[#3b3a7a]">
                    <MapPin className="w-3.5 h-3.5 text-[#f06a60]" />
                    Pickup & Delivery Coverage
                  </div>
                  <h3 className="font-heading font-black text-3xl sm:text-4xl text-[#0d1526] tracking-tight">
                    Areas We Serve
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 font-body">
                    Jemput antar gratis ke seluruh 3 wilayah ini:
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Kota Tangerang Selatan */}
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] space-y-3">
                    <div className="flex items-center gap-2 font-heading font-bold text-lg text-[#0d1526]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f06a60]"></span>
                      1. Kota Tangerang Selatan
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                      {COVERAGE_AREAS['Kota Tangerang Selatan'].map((k) => (
                        <span key={k} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#f2ece5] text-[#0d1526]">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Kota Tangerang */}
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] space-y-3">
                    <div className="flex items-center gap-2 font-heading font-bold text-lg text-[#0d1526]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f06a60]"></span>
                      2. Kota Tangerang
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                      {COVERAGE_AREAS['Kota Tangerang'].map((k) => (
                        <span key={k} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#f2ece5] text-[#0d1526]">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Jakarta Selatan */}
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] space-y-3">
                    <div className="flex items-center gap-2 font-heading font-bold text-lg text-[#0d1526]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f06a60]"></span>
                      3. Jakarta Selatan
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                      {COVERAGE_AREAS['Jakarta Selatan'].map((k) => (
                        <span key={k} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#f2ece5] text-[#0d1526]">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#f2ece5] rounded-2xl text-xs text-neutral-600 font-body">
                  <strong className="text-[#0d1526] block mb-1">Syarat Gratis Pengiriman:</strong>
                  Dalam radius 20 km dari workshop Bintaro kami — tanpa minimum order (bahkan 1 pasang pun gratis!). Di luar 20 km — gratis dengan minimum 3 pasang/barang.
                </div>

                <div className="pt-1">
                  <Link
                    href="/order"
                    onClick={() => setCoverageModalOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-base uppercase py-3.5 rounded-2xl transition-colors shadow-sm"
                  >
                    <span>Book Pickup & Delivery Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
