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
import { formatRupiah } from '@/lib/invoice';
import { COVERAGE_AREAS } from '@/lib/haversine';

const SERVICES_DATA = [
  // Shoes
  {
    category: 'shoes',
    categoryName: 'Sepatu',
    name: 'Deep Clean Shoes',
    desc: 'Pembersihan menyeluruh bagian luar, midsole, insole, outsole, dan tali sepatu.',
    price: 65000,
    duration: '2 - 3 Hari',
    popular: true,
    tag: 'Paling Populer',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'shoes',
    categoryName: 'Sepatu',
    name: 'Special Treatment - Suede',
    desc: 'Perawatan material khusus Suede & Nubuck dengan sabun khusus agar bulu tetap lembut.',
    price: 75000,
    duration: '3 Hari',
    popular: false,
    tag: 'Bahan Khusus',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'shoes',
    categoryName: 'Sepatu',
    name: 'Special Treatment - Leather',
    desc: 'Pembersihan & conditioning kulit asli/sintetis dengan wax anti-retak dan moisturizer.',
    price: 90000,
    duration: '3 Hari',
    popular: false,
    tag: 'Perawatan Kulit',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'shoes',
    categoryName: 'Sepatu',
    name: 'Little One Care (Kids Shoes)',
    desc: 'Pembersihan higienis khusus sepatu anak dengan formula ramah anak dan anti-bakteri.',
    price: 40000,
    duration: '2 - 3 Hari',
    popular: false,
    tag: 'Sepatu Anak',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'shoes',
    categoryName: 'Sepatu',
    name: 'Womens Care',
    desc: 'Deep clean untuk Heels, Wedges, dan Flat shoes dengan sabun pembersih lembut.',
    price: 45000,
    duration: '2 - 3 Hari',
    popular: false,
    tag: 'Heels & Flats',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
  },
  // Bags
  {
    category: 'bag',
    categoryName: 'Tas',
    name: 'Bag Deep Clean (Small)',
    desc: 'Pembersihan tas ukuran kecil (clutch, waist bag, mini sling bag).',
    price: 65000,
    duration: '3 - 4 Hari',
    popular: false,
    tag: 'Tas Kecil',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'bag',
    categoryName: 'Tas',
    name: 'Bag Deep Clean (Medium)',
    desc: 'Pembersihan tas ukuran sedang (backpack standar, shoulder bag, tote bag).',
    price: 85000,
    duration: '3 - 4 Hari',
    popular: true,
    tag: 'Tas Favorit',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'bag',
    categoryName: 'Tas',
    name: 'Bag Deep Clean (Large)',
    desc: 'Pembersihan tas ukuran besar (travel bag, duffel, backpack gunung, tote bag besar).',
    price: 110000,
    duration: '3 - 4 Hari',
    popular: false,
    tag: 'Tas Besar',
    image: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800&auto=format&fit=crop&q=80',
  },
  // Accessories
  {
    category: 'accessories',
    categoryName: 'Aksesoris',
    name: 'Hat, Wallet & Pouch Deep Clean',
    desc: 'Pembersihan menyeluruh untuk topi (snapback/baseball), dompet, atau pouch kosmetik/gadget.',
    price: 30000,
    duration: '2 - 3 Hari',
    popular: false,
    tag: 'Hemat',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
  },
];

const SWAP_LOCATIONS = [
  'JAKSEL',
  'TANGERANG',
  'TANGSEL',
  'BINTARO',
  'BSD CITY',
];

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<'all' | 'shoes' | 'bag' | 'accessories'>('all');
  const [trackQuery, setTrackQuery] = useState('');
  const [locationIndex, setLocationIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [coverageModalOpen, setCoverageModalOpen] = useState(false);

  // Rotating location text effect matching Sparkles template
  useEffect(() => {
    const timer = setInterval(() => {
      setLocationIndex((prev) => (prev + 1) % SWAP_LOCATIONS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const filteredServices =
    activeCategory === 'all'
      ? SERVICES_DATA
      : SERVICES_DATA.filter((s) => s.category === activeCategory);

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
        <section className="pt-2 sm:pt-4 pb-8 sm:pb-12">
          <div className="max-w-[1760px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 space-y-3 sm:space-y-4">

            {/* Announcement Banner — hanya di hero, tidak sticky */}
            <div className="bg-[#f06a60] text-white text-xs font-bold py-2.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 rounded-2xl shadow-xs">
              <span className="bg-[#000000] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                FREE PICKUP
              </span>
              <span>100% Free Antar-Jemput Jaksel, Tangsel & Tangerang</span>
              <span className="text-white/60 hidden sm:inline">•</span>
              <Link
                href="/order"
                className="underline hover:text-[#000000] transition-colors font-extrabold text-white hidden sm:inline-flex items-center gap-1"
              >
                Pesan sebelum jam 13:00 untuk jemput hari ini
                <ArrowRight className="w-3.5 h-3.5 inline" />
              </Link>
            </div>

            {/* The 2 Large Split Cards - Equal Height Dominating Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 items-stretch lg:h-[82vh] lg:min-h-[660px] lg:max-h-[860px]">
              
              {/* LEFT CARD: Deep Dark Card with Giant Bold Headline */}
              <div className="bg-[#0d1526] text-white rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between shadow-xs h-full">
                {/* Top Rating Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-colors">
                    <span className="w-5 h-5 rounded-full bg-white text-[#0d1526] flex items-center justify-center font-black text-[11px]">
                      G
                    </span>
                    <span>4.9 ON GOOGLE</span>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-colors">
                    <span className="w-5 h-5 rounded-full bg-[#f06a60] text-white flex items-center justify-center font-black text-[10px]">
                      ★
                    </span>
                    <span>100% FREE JEMPUT</span>
                  </div>
                </div>

                {/* Giant Headline All-Caps matching Sparkles reference */}
                <div className="my-auto py-6 sm:py-8 space-y-0">
                  <h1 className="font-heading font-bold text-5xl sm:text-7xl lg:text-[76px] xl:text-[96px] 2xl:text-[106px] leading-[0.88] sm:leading-[0.86] tracking-tight uppercase">
                    <span className="block">CLEANING</span>
                    <span className="block">FOR BUSY</span>
                    <span className="block">PEOPLE IN</span>
                    <span className="block text-[#f06a60] transition-all duration-300">
                      {SWAP_LOCATIONS[locationIndex]}
                    </span>
                  </h1>
                </div>

                {/* Bottom Action Buttons inside the dark card */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Link
                    href="/order"
                    className="group relative inline-flex items-center justify-center bg-[#f06a60] hover:bg-white text-[#000000] font-heading font-bold text-base sm:text-lg lg:text-[19px] xl:text-[20px] tracking-normal uppercase px-6 sm:px-7 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-out active:scale-95 overflow-hidden"
                  >
                    <span className="transition-colors duration-300">BOOK YOUR CLEANING</span>
                    <span className="max-w-0 opacity-0 -translate-x-2 group-hover:max-w-6 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2.5 transition-all duration-300 ease-out inline-flex items-center overflow-hidden">
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </span>
                  </Link>

                  <Link
                    href="#layanan"
                    className="group relative inline-flex items-center justify-center bg-white/10 hover:bg-white text-white hover:text-[#000000] font-heading font-bold text-base sm:text-lg lg:text-[19px] xl:text-[20px] tracking-normal uppercase px-6 sm:px-7 py-3.5 sm:py-4 rounded-full border border-white/15 hover:border-white transition-all duration-300 ease-out overflow-hidden"
                  >
                    <span className="transition-colors duration-300">SEE PRICING</span>
                    <span className="max-w-0 opacity-0 -translate-x-2 group-hover:max-w-6 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2 transition-all duration-300 ease-out inline-flex items-center overflow-hidden">
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* RIGHT CARD: Image Showcase Card */}
              <div className="rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] overflow-hidden relative shadow-xs h-[420px] sm:h-[500px] lg:h-full bg-[#f2ece5]">
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
                  <span className="text-[#f06a60] font-extrabold">Jaksel • Tangsel • Tangerang</span>
                </div>
              </div>
            </div>

            {/* SPARKLES SUPPORT TILES GRID (4 HORIZONTAL CARDS) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 pt-1 sm:pt-2">
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
                  <h4 className="font-heading font-bold text-2xl sm:text-3xl text-[#0d1526] tracking-tight leading-none">
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
                  <h4 className="font-heading font-bold text-2xl sm:text-3xl text-[#0d1526] tracking-tight leading-none">
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
                  <h4 className="font-heading font-bold text-2xl sm:text-3xl text-[#0d1526] tracking-tight leading-none">
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
                  <h4 className="font-heading font-bold text-2xl sm:text-3xl text-[#0d1526] tracking-tight leading-none">
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
              100% FREE ANTAR-JEMPUT
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              DOKUMENTASI FOTO QC BEFORE & AFTER
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
              BAYAR SETELAH SELESAI / COD
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
              100% FREE ANTAR-JEMPUT
            </span>
          </div>
        </div>

        {/* SECTION "WHAT WE CLEAN" / SERVICES */}
        <section id="layanan" className="py-20 sm:py-24 bg-[#fdf8f1] scroll-mt-12">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                  <Sparkles className="w-4 h-4 text-[#f06a60]" />
                  What We Clean • Spesialis Perawatan
                </div>
                <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                  Layanan & Harga Transparan
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
                  Setiap sepatu dan tas dikerjakan manual oleh teknisi berpengalaman dengan formula premium tanpa detergen keras.
                </p>
              </div>

              {/* Category Tabs Pill (Sparkles-inspired: warm container, navy active) */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#f5f3f0] p-1.5 rounded-full border border-black/[0.06] shadow-sm">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-7 sm:px-8 py-3.5 rounded-full text-sm sm:text-base font-heading font-bold uppercase tracking-normal transition-all duration-200 cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-[#0d1526] text-white shadow-sm'
                      : 'text-[#0d1526]/70 hover:text-[#0d1526] hover:bg-black/[0.06]'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveCategory('shoes')}
                  className={`px-7 sm:px-8 py-3.5 rounded-full text-sm sm:text-base font-heading font-bold uppercase tracking-normal transition-all duration-200 cursor-pointer ${
                    activeCategory === 'shoes'
                      ? 'bg-[#0d1526] text-white shadow-sm'
                      : 'text-[#0d1526]/70 hover:text-[#0d1526] hover:bg-black/[0.06]'
                  }`}
                >
                  Sepatu
                </button>
                <button
                  onClick={() => setActiveCategory('bag')}
                  className={`px-7 sm:px-8 py-3.5 rounded-full text-sm sm:text-base font-heading font-bold uppercase tracking-normal transition-all duration-200 cursor-pointer ${
                    activeCategory === 'bag'
                      ? 'bg-[#0d1526] text-white shadow-sm'
                      : 'text-[#0d1526]/70 hover:text-[#0d1526] hover:bg-black/[0.06]'
                  }`}
                >
                  Tas
                </button>
                <button
                  onClick={() => setActiveCategory('accessories')}
                  className={`px-7 sm:px-8 py-3.5 rounded-full text-sm sm:text-base font-heading font-bold uppercase tracking-normal transition-all duration-200 cursor-pointer ${
                    activeCategory === 'accessories'
                      ? 'bg-[#0d1526] text-white shadow-sm'
                      : 'text-[#0d1526]/70 hover:text-[#0d1526] hover:bg-black/[0.06]'
                  }`}
                >
                  Topi &amp; Aksesoris
                </button>
              </div>
            </div>

            {/* Grid Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              {filteredServices.map((srv, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border border-black/[0.08] hover:border-[#f06a60] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="relative h-56 sm:h-64 rounded-[22px] overflow-hidden bg-neutral-100">
                      <img
                        src={srv.image}
                        alt={srv.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {srv.popular && (
                        <span className="absolute top-3.5 left-3.5 bg-[#f06a60] text-white text-xs font-heading font-black uppercase px-3 py-1.5 rounded-full shadow-xs">
                          {srv.tag}
                        </span>
                      )}
                      <span className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-xs text-[#000000] text-xs font-bold px-3 py-1.5 rounded-full border border-black/10">
                        {srv.duration}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs uppercase font-heading font-bold tracking-wider text-[#0d1526]/50">
                        {srv.categoryName}
                      </span>
                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#0d1526] leading-tight">
                        {srv.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed min-h-[44px]">
                        {srv.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-black/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 block font-bold uppercase tracking-wider">Tarif</span>
                      <span className="font-heading font-black text-2xl sm:text-3xl text-[#f06a60]">
                        {formatRupiah(srv.price)}
                      </span>
                    </div>

                    <Link
                      href="/order"
                      className="group/btn relative inline-flex items-center justify-center bg-[#000000] hover:bg-[#f06a60] text-white hover:text-[#000000] font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-7 sm:px-8 py-3.5 rounded-full shadow-xs hover:shadow-md transition-all duration-300 ease-out active:scale-95 overflow-hidden"
                    >
                      <span className="transition-colors duration-300">Pesan</span>
                      <span className="max-w-0 opacity-0 -translate-x-2 group-hover/btn:max-w-6 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 group-hover/btn:ml-2 transition-all duration-300 ease-out inline-flex items-center overflow-hidden">
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION CARA KERJA / 4 LANGKAH MUDAH */}
        <section id="cara-kerja" className="py-20 sm:py-24 bg-[#fdf8f1] border-y border-black/[0.06] scroll-mt-12">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-xs sm:text-sm font-heading font-bold uppercase tracking-wider bg-[#f2ece5] text-[#f06a60] border border-[#f06a60]/20 px-4 py-1.5 rounded-full">
                Sangat Praktis &amp; Bebas Repot
              </span>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                Bagaimana Cara Kerjanya?
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
                Hanya butuh 2 menit untuk pesan, kurir kami yang menjemput dan mengantar kembali ke pintu rumah Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              <div className="bg-[#f2ece5] hover:bg-[#eae2d9] p-8 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-black/[0.04] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#000000] text-white font-heading font-black text-2xl flex items-center justify-center shadow-xs">
                  01
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#000000]">Booking Online</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Pilih layanan yang diinginkan, tentukan titik lokasi pada peta interaktif, dan pilih slot jadwal penjemputan.
                  </p>
                </div>
              </div>

              <div className="bg-[#f2ece5] hover:bg-[#eae2d9] p-8 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-black/[0.04] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#f06a60] text-white font-heading font-black text-2xl flex items-center justify-center shadow-xs">
                  02
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#000000]">Kurir Jemput Barang</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Kurir kami akan menghubungi Anda via WhatsApp dan mengambil sepatu/tas di alamat Anda tanpa biaya ongkir.
                  </p>
                </div>
              </div>

              <div className="bg-[#f2ece5] hover:bg-[#eae2d9] p-8 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-black/[0.04] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#000000] text-white font-heading font-black text-2xl flex items-center justify-center shadow-xs">
                  03
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#000000]">QC Foto &amp; Treatment</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Tiba di workshop, tim kami mengambil foto fisik kondisi awal (*Before*) dan mencuci sesuai standar material.
                  </p>
                </div>
              </div>

              <div className="bg-[#f2ece5] hover:bg-[#eae2d9] p-8 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-black/[0.04] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#f06a60] text-white font-heading font-black text-2xl flex items-center justify-center shadow-xs">
                  04
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#000000]">Antar &amp; Bayar</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Sepatu selesai dicuci, foto QC After diunggah, diantar kembali, dan Anda bayar dengan nyaman (Transfer/QRIS/COD).
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
                    Garansi Transparansi 100%
                  </div>
                  <h2 className="font-heading font-bold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
                    Setiap Sepatu Difoto Kondisinya (QC Before &amp; After)
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
                    Tidak perlu cemas! Saat sepatu tiba di workshop Fice Shoes Care, kurir &amp; teknisi kami mengambil foto kondisi awal (sol, upper, tali) dan mencatat jika ada lecet bawaan. Foto dapat Anda cek langsung di halaman resi tracking Anda.
                  </p>

                  <div className="space-y-3 text-xs sm:text-sm text-neutral-300 pt-2">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#f06a60] shrink-0" />
                      <span>Menghindari komplain cacat bawaan sebelum dicuci.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#f06a60] shrink-0" />
                      <span>Pelanggan bisa melihat perbandingan kinclong sebelum vs sesudah.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#f06a60] shrink-0" />
                      <span>Invoice resmi terbit otomatis dan bisa dicetak atau dibagikan ke WA.</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/order"
                      className="group relative inline-flex items-center justify-center bg-[#f06a60] hover:bg-white text-[#000000] font-heading font-bold text-base sm:text-lg lg:text-[19px] xl:text-[20px] tracking-normal uppercase px-8 sm:px-10 py-4 sm:py-4.5 rounded-full transition-all duration-300 ease-out shadow-md hover:shadow-lg active:scale-95 overflow-hidden"
                    >
                      <span className="transition-colors duration-300">Coba Layanan Sekarang</span>
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
                        Kondisi Awal (Before)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-neutral-400 italic px-1">
                      Debu tebal dan noda tanah pada midsole &amp; outsole.
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
                        Hasil Cuci (After)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-neutral-200 font-semibold px-1">
                      Kering sempurna, wangi segar, dan bersih higienis!
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
                  <p className="text-xs text-neutral-500 font-body mt-0.5">Lebih awet dengan perawatan rutin</p>
                </div>
                <div className="absolute bottom-6 right-6 bg-[#0d1526] rounded-2xl px-5 py-4 shadow-lg">
                  <p className="font-heading font-bold text-2xl text-white">Rp 65rb</p>
                  <p className="text-xs text-neutral-400 font-body mt-0.5">vs beli sepatu baru jutaan</p>
                </div>
              </div>

              {/* Right: Content */}
              <div className="order-1 lg:order-2 space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                    <ShieldCheck className="w-4 h-4 text-[#f06a60]" />
                    Kenapa Penting?
                  </div>
                  <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                    Kenapa Harus Merawat Sepatu?
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-body">
                    Sepatu bukan sekadar pelindung kaki — ia adalah bagian dari penampilan, 
                    investasi, dan ekspresi diri Anda. Tanpa perawatan rutin, usia sepatu 
                    bisa berkurang drastis, material rusak, dan tampilannya cepat kusam.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Memperpanjang Usia Sepatu',
                      desc: 'Debu, keringat, dan kotoran yang menumpuk merusak material dari dalam. Perawatan rutin bisa memperpanjang umur sepatu hingga 3× lebih lama.',
                    },
                    {
                      title: 'Menjaga Nilai & Penampilan',
                      desc: 'Sepatu bersih dan terawat meningkatkan kepercayaan diri. Untuk sneaker koleksi, perawatan bahkan menjaga nilai jual kembali tetap tinggi.',
                    },
                    {
                      title: 'Mencegah Bau & Bakteri',
                      desc: 'Insole yang lembab adalah sarang bakteri dan jamur. Cuci berkala memastikan sepatu Anda higienis dan nyaman dipakai setiap hari.',
                    },
                    {
                      title: 'Hemat Lebih Banyak',
                      desc: 'Merawat jauh lebih murah daripada membeli baru. Satu kali cuci di Fice mulai Rp 65.000 — jauh lebih hemat dari mengganti sepatu seharga ratusan ribu.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 bg-[#f2ece5] rounded-2xl p-5 border border-black/[0.04]">
                      <div className="w-9 h-9 rounded-xl bg-[#f06a60] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-base sm:text-lg text-[#0d1526]">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-neutral-600 font-body leading-relaxed mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/order"
                  className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-base sm:text-lg uppercase tracking-normal px-7 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 ease-out active:scale-95"
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
              <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">
                Informasi penting seputar layanan antar-jemput dan sistem operasional Fice Shoes Care.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'Apakah benar layanan antar-jemput ini 100% Gratis?',
                  a: 'Ya, betul! Untuk lokasi dalam radius ≤ 20 km dari workshop kami di Bintaro (Tangerang Selatan), layanan antar-jemput gratis berlaku tanpa batas minimal (1 atau 2 pasang tetap gratis). Untuk jarak di atas 20 km (selama masih dalam area Jakarta Selatan, Tangsel, dan Tangerang), gratis antar-jemput berlaku dengan minimal order 3 pasang/item.',
                },
                {
                  q: 'Daerah mana saja yang masuk coverage area antar-jemput?',
                  a: 'Coverage kami mencakup 3 wilayah: (1) Kota Tangerang Selatan: Serpong, Serpong Utara, Ciputat, Ciputat Timur, Pamulang, Pondok Aren, Setu. (2) Kota Tangerang: Ciledug, Cipondoh, Karang Tengah, Karawaci, Gading Serpong, Larangan. (3) Jakarta Selatan: Cilandak, Jagakarsa, Kebayoran Baru, Kebayoran Lama, Mampang Prapatan, Pancoran, Pasar Minggu, Pesanggrahan, Tebet, Setiabudi.',
                },
                {
                  q: 'Kapan sepatu saya dijemput jika memesan lewat dari jam 13:00?',
                  a: 'Jika Anda membuat pesanan sebelum pukul 13.00 WIB, kurir kami bisa menjemput di hari yang sama (slot sore 14.00–18.00). Jika pemesanan dilakukan setelah pukul 13.00 WIB, jadwal penjemputan paling cepat adalah esok hari (H+1) agar rute kurir tetap teratur dan aman.',
                },
                {
                  q: 'Kapan saya harus membayar pesanan saya?',
                  a: 'Anda bisa memilih Model B (bayar via QRIS/Transfer setelah sepatu tiba di workshop dan diverifikasi kondisinya oleh admin) atau Model C (bayar setelah proses cuci selesai sebelum diantar kembali, atau bayar tunai/COD langsung ke kurir saat barang tiba).',
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
                    <span className="flex items-center gap-3 font-heading font-bold text-lg sm:text-xl text-[#0d1526]">
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
                    Area Layanan Antar-Jemput
                  </div>
                  <h3 className="font-heading font-bold text-3xl sm:text-4xl text-[#0d1526] tracking-tight">
                    Coverage Daerah Fice
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 font-body">
                    Fice Shoes Care melayani antar-jemput gratis untuk 3 wilayah berikut:
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
                  <strong className="text-[#0d1526] block mb-1">Ketentuan Gratis Ongkir:</strong>
                  Radius &le; 20 km dari workshop Bintaro bebas minimal jumlah sepatu (1 pasang pun tetap gratis!). Jarak &gt; 20 km gratis dengan minimal order 3 pasang/item.
                </div>

                <div className="pt-1">
                  <Link
                    href="/order"
                    onClick={() => setCoverageModalOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-base uppercase py-3.5 rounded-2xl transition-colors shadow-sm"
                  >
                    <span>Pesan Antar-Jemput Sekarang</span>
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
