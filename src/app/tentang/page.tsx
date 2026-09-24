'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  Sparkles,
  Camera,
  Truck,
  Users,
  FlaskConical,
  MapPin,
  Star,
  ArrowUpRight,
} from 'lucide-react';

const DIFFERENT = [
  {
    icon: <Camera className="w-5 h-5 text-[#f06a60]" />,
    title: 'Before & After QC Photos',
    desc: 'Setiap sepatu difoto kondisi awalnya. Lihat sendiri perbandingan before vs. after — transparan, tanpa drama.',
  },
  {
    icon: <Truck className="w-5 h-5 text-[#f06a60]" />,
    title: 'Free Pickup & Delivery',
    desc: 'Jaksel, Tangsel, Tangerang — jemput antar gratis tanpa minimum order. Booking, kurir datang ke rumah.',
  },
  {
    icon: <Users className="w-5 h-5 text-[#f06a60]" />,
    title: 'Experienced Technicians',
    desc: 'Bukan cuci mesin massal. Setiap sepatu dibersihkan manual oleh teknisi berpengalaman premium shoes care.',
  },
  {
    icon: <FlaskConical className="w-5 h-5 text-[#f06a60]" />,
    title: 'Premium Formulas',
    desc: 'Formula khusus yang aman untuk kulit, suede, canvas, nylon. Tanpa deterjen keras yang merusak.',
  },
];

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', label: 'Deep Clean' },
  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', label: 'AF1 White' },
  { src: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80', label: 'Leather Treat' },
  { src: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&auto=format&fit=crop&q=80', label: 'Suede Care' },
  { src: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', label: 'Sneakers' },
  { src: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&auto=format&fit=crop&q=80', label: 'Whitening' },
  { src: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80', label: 'Travel Bag' },
  { src: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&auto=format&fit=crop&q=80', label: 'Kids Pack' },
];

export default function TentangPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#0d1526]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SPLIT — foto kiri, headline raksasa kanan */}
        <section className="pt-2 sm:pt-3 pb-6 sm:pb-10">
          <div className="mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 items-stretch lg:h-[68vh] lg:min-h-[520px] lg:max-h-[720px]">
              {/* Foto */}
              <div className="rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] overflow-hidden relative shadow-xs h-[320px] sm:h-[400px] lg:h-full bg-[#f2ece5]">
                <img
                  src="https://images.unsplash.com/photo-1556906781-9a412961d28f?w=1400&auto=format&fit=crop&q=85"
                  alt="Teknisi Fice Shoes Care membersihkan sepatu"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7 flex items-center gap-2 text-white">
                  <MapPin className="w-4 h-4 text-[#f06a60] shrink-0" />
                  <p className="text-xs sm:text-sm font-bold">
                    Workshop Pondok Aren, Tangerang Selatan
                  </p>
                </div>
              </div>

              {/* Headline card */}
              <div className="rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] bg-[#f06a60] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center gap-6 sm:gap-8 shadow-xs">
                <span className="inline-flex w-fit items-center bg-white text-[#0d1526] text-[11px] sm:text-xs font-heading font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Tentang Kami
                </span>
                <h1 className="font-heading font-extrabold uppercase leading-[0.9] text-4xl sm:text-6xl lg:text-6xl xl:text-7xl">
                  Clean Shoes.
                  <br />
                  Fresh Steps.
                  <br />
                  Shoe Care Done by Humans Who Care.
                </h1>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-lg">
                  Fice Shoes Care lahir dari tangan teknisi premium shoes care Jakarta — cuci manual per pasang, foto QC transparan, dan gratis antar-jemput ke rumah Anda.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/order"
                    className="group inline-flex items-center gap-2 bg-[#0d1526] hover:bg-white hover:text-[#0d1526] text-white font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl transition-all active:scale-95"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/harga"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white hover:text-[#0d1526] text-white font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl transition-all"
                  >
                    See Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CERITA SINGKAT — tepat setelah hero */}
        <section className="py-16 sm:py-20 bg-[#fdf8f1]">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                  <Sparkles className="w-4 h-4 text-[#f06a60]" />
                  Our Story
                </div>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase text-[#0d1526] leading-tight">
                  From Premium Technician
                  <br />
                  <span className="text-[#f06a60]">To Our Own Business</span>
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
                  <p>
                    Fice Shoes Care tidak dibangun dari nol tanpa dasar. Akar kami berasal dari pengalaman langsung bekerja sebagai teknisi di premium shoes care di Jakarta — di mana standar kualitas, presisi proses, dan pertanggungjawaban atas setiap item pelanggan diuji setiap hari.
                  </p>
                  <p>
                    Kini, dengan website dan sistem tracking online, kami membawa kemudahan itu lebih jauh — pesan, lacak status, dan hubungi kami kapan saja, di mana saja.
                  </p>
                </div>
                <Link
                  href="/order"
                  className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-base sm:text-lg uppercase tracking-normal px-7 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ease-out active:scale-95"
                >
                  <span>Try Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="relative rounded-[32px] overflow-hidden h-[420px] sm:h-[520px] bg-[#f2ece5]">
                <img
                  src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&auto=format&fit=crop&q=85"
                  alt="Workshop Fice Shoes Care"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-[32px]" />
                <div className="absolute bottom-6 left-6 right-6 bg-[#0d1526]/80 backdrop-blur-md text-white px-6 py-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-[#f06a60] fill-[#f06a60]" />
                    <span className="font-heading font-bold text-sm">Workshop Kami di Bintaro</span>
                  </div>
                  <p className="text-xs text-neutral-400">Pondok Aren, Tangerang Selatan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KENAPA FICE BERBEDA */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase text-[#0d1526] mb-8 sm:mb-10">
              What Makes Us Different
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {DIFFERENT.map((item) => (
                <div
                  key={item.title}
                  className="bg-[#f2ece5] hover:bg-[#eae2d9] rounded-[24px] sm:rounded-[28px] p-7 sm:p-8 border border-black/[0.04] transition-colors space-y-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-[#000000]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
              {/* Tile foto */}
              <div className="rounded-[24px] sm:rounded-[28px] overflow-hidden relative min-h-[260px] sm:min-h-[300px]">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85"
                  alt="Hasil deep clean Fice Shoes Care"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2 text-white">
                  <Star className="w-4 h-4 text-[#f06a60] fill-[#f06a60] shrink-0" />
                  <p className="text-xs sm:text-sm font-bold">Hasil nyata, bukan stok foto</p>
                </div>
              </div>
              {/* Tile CTA cara kerja */}
              <Link
                href="/cara-kerja"
                className="group bg-[#0d1526] hover:bg-[#f06a60] rounded-[24px] sm:rounded-[28px] p-7 sm:p-8 transition-colors flex flex-col justify-between gap-6 min-h-[260px] sm:min-h-[300px]"
              >
                <ArrowUpRight className="w-8 h-8 text-white group-hover:rotate-45 transition-transform" />
                <div className="space-y-2">
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white uppercase">
                    Lihat Cara Kerja Kami
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    4 langkah dari booking sampai sepatu kembali bersih.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* GALERI GELAP */}
        <section className="bg-[#0d1526] rounded-[28px] sm:rounded-[36px] mx-3 sm:mx-6 lg:mx-8 xl:mx-10 mb-6 sm:mb-10 px-6 sm:px-12 lg:px-16 py-14 sm:py-20">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-[#f06a60] mb-4">
            Workshop Output
          </p>
          <h2 className="font-heading font-extrabold uppercase text-center text-white leading-[0.95] text-3xl sm:text-5xl lg:text-6xl max-w-4xl mx-auto mb-10 sm:mb-14">
            Real Results from Real Orders
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {GALLERY.map((g) => (
              <figure key={g.src} className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 h-44 sm:h-64 group">
                <img
                  src={g.src}
                  alt={`Hasil ${g.label} Fice Shoes Care`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <figcaption className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-xs font-heading font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  {g.label}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <Link
              href="/testimoni"
              className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-white hover:text-[#0d1526] text-white font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl transition-all active:scale-95"
            >
              <span>Lihat Testimoni</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
