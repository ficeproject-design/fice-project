'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Camera,
  Truck,
  CheckCircle2,
  MapPin,
  Clock,
  Star,
} from 'lucide-react';

const WHY_CHOOSE = [
  {
    num: '01',
    title: 'Before & After QC Photos',
    desc: 'Setiap sepatu yang masuk difoto kondisi awalnya. Anda bisa lihat sendiri perbandingan before vs. after-nya — transparan, tanpa drama.',
  },
  {
    num: '02',
    title: 'Free Pickup & Delivery',
    desc: 'Jaksel, Tangsel, Tangerang — jemput antar gratis tanpa minimum order. Cukup booking, kurir datang ke rumah Anda.',
  },
  {
    num: '03',
    title: 'Experienced Technicians',
    desc: 'Bukan cuci mesin massal. Setiap sepatu dibersihkan manual oleh teknisi yang sudah berpengalaman di premium shoes care.',
  },
  {
    num: '04',
    title: 'Premium Formulas',
    desc: 'Kami gunakan formula khusus yang aman untuk semua material — kulit, suede, canvas, nylon. Tanpa deterjen keras yang merusak.',
  },
];

const STEPS = [
  {
    icon: <Sparkles className="w-6 h-6 text-[#f06a60]" />,
    title: 'Book Online',
    desc: 'Pilih layanan, tentukan jadwal jemput, dan checkout dalam 2 menit.',
  },
  {
    icon: <Truck className="w-6 h-6 text-[#f06a60]" />,
    title: 'Courier Picks Up',
    desc: 'Kurir kami datang ke rumah Anda, jemput sepatu — gratis, tanpa ribet.',
  },
  {
    icon: <Camera className="w-6 h-6 text-[#f06a60]" />,
    title: 'Cleaned at Workshop',
    desc: 'Sepatu difoto kondisi awal, dibersihkan oleh teknisi, lalu difoto hasil akhir.',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-[#f06a60]" />,
    title: 'Delivered Back',
    desc: 'Sepatu bersih, foto QC ter-upload, lalu dikirim balik ke alamat Anda.',
  },
];



export default function TentangPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#0d1526]">
      <Navbar />

      <main className="flex-1">

        {/* HERO */}
        <section className="pt-14 sm:pt-20 pb-12 sm:pb-16">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                  <MapPin className="w-4 h-4 text-[#f06a60]" />
                  Jaksel &middot; Tangsel &middot; Tangerang
                </div>
                <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-[#0d1526] leading-[0.9]">
                  Clean Shoes,<br />
                  <span className="text-[#f06a60]">Happy You.</span>
                </h1>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl font-body">
                  Fice Shoes Care adalah layanan cuci sepatu profesional dengan jemput antar gratis, foto QC transparan, dan teknisi berpengalaman — langsung dari workshop kami di Bintaro.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/order"
                    className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-base sm:text-lg uppercase tracking-normal px-7 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ease-out active:scale-95"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/harga"
                    className="inline-flex items-center gap-2 bg-[#f2ece5] hover:bg-[#eae2d9] text-[#0d1526] font-heading font-bold text-base sm:text-lg uppercase tracking-normal px-7 py-3.5 rounded-2xl border border-black/[0.06] transition-all duration-300"
                  >
                    See Pricing
                  </Link>
                </div>
              </div>

              <div className="relative rounded-[32px] overflow-hidden h-[420px] sm:h-[500px] bg-[#f2ece5]">
                <img
                  src="https://images.unsplash.com/photo-1556906781-9a412961d28f?w=900&auto=format&fit=crop&q=85"
                  alt="Fice Shoes Care Workshop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-[32px]" />
              </div>
            </div>
          </div>
        </section>



        {/* KENAPA PILIH FICE */}
        <section className="py-20 sm:py-24 bg-[#fdf8f1]">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="text-center space-y-3 mb-14 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                <ShieldCheck className="w-4 h-4 text-[#f06a60]" />
                Why Fice?
              </div>
              <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                Not Just Another Shoe Cleaning
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Kami beda dari tempat cuci sepatu lainnya. Ini alasan kenapa ribuan pelanggan mempercayakan sepatu mereka ke Fice.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {WHY_CHOOSE.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[28px] p-7 sm:p-8 border border-black/[0.06] hover:border-[#f06a60]/30 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0d1526] flex items-center justify-center shrink-0 group-hover:bg-[#f06a60] transition-colors duration-300">
                      <span className="font-heading font-black text-white text-lg">{item.num}</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-heading font-black text-xl sm:text-2xl text-[#0d1526]">{item.title}</h3>
                      <p className="text-sm sm:text-base text-neutral-600 font-body leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROSES KERJA */}
        <section className="py-20 sm:py-24 bg-[#f2ece5]/50 border-t border-black/[0.05]">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="text-center space-y-3 mb-14 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                <Clock className="w-4 h-4 text-[#f06a60]" />
                How It Works
              </div>
              <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                Just 4 Steps
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Dari booking sampai sepatu bersih kembali ke tangan Anda — semuanya serba mudah dan transparan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[28px] p-7 sm:p-8 border border-black/[0.06] text-center space-y-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#fdf8f1] flex items-center justify-center mx-auto border border-[#f06a60]/20">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-[#0d1526] mb-2">{step.title}</h3>
                    <p className="text-sm text-neutral-600 font-body leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CERITA SINGKAT */}
        <section className="py-20 sm:py-24 bg-[#fdf8f1] border-t border-black/[0.05]">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative rounded-[32px] overflow-hidden h-[420px] sm:h-[520px] bg-[#f2ece5]">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85"
                  alt="Workshop Fice Shoes Care"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-[32px]" />
                <div className="absolute bottom-6 left-6 right-6 bg-[#0d1526]/80 backdrop-blur-md text-white px-6 py-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-[#f06a60] fill-[#f06a60]" />
                    <span className="font-heading font-bold text-sm">Workshop Kami di Bintaro</span>
                  </div>
                  <p className="text-xs text-neutral-400">Jl. Bintaro Utama, Tangerang Selatan</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                  <Sparkles className="w-4 h-4 text-[#f06a60]" />
                  Our Story
                </div>
                <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0d1526] leading-tight">
                  From Premium Technician<br />
                  <span className="text-[#f06a60]">To Our Own Business</span>
                </h2>
                <div className="space-y-4 font-body text-sm sm:text-base text-neutral-600 leading-relaxed">
                  <p>
                    Fice Shoes Care tidak dibangun dari nol tanpa dasar. Akar kami berasal dari pengalaman langsung bekerja sebagai teknisi di premium shoes care di Jakarta — di mana standar kualitas, presisi proses, dan pertanggungjawaban atas setiap item pelanggan diuji setiap hari.
                  </p>
                  <p>
                    Pengalaman itu membentuk cara Fice bekerja: setiap sepatu yang masuk diperlakukan dengan standar yang sama seperti milik kami sendiri. Dari situ, kami berkembang perlahan sambil menjaga satu hal tetap sama — setiap pelanggan diperlakukan secara personal, bukan sekadar nomor antrean.
                  </p>
                  <p>
                    Kini, dengan website dan sistem tracking online, kami ingin membawa kemudahan itu lebih jauh — agar Anda bisa memesan, melacak status, dan berkomunikasi dengan kami kapan saja, di mana saja.
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
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
