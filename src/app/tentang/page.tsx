'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Users, Star, ArrowRight, BadgeCheck, Sparkles, Quote } from 'lucide-react';

export default function TentangPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#0d1526]">
      <Navbar />

      <main className="flex-1">

        {/* HERO SECTION */}
        <section className="pt-16 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                  <Sparkles className="w-4 h-4 text-[#f06a60]" />
                  Cerita di Balik Fice
                </div>
                <h1 className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl tracking-tight text-[#0d1526] leading-[0.9]">
                  Dari Passion<br />
                  <span className="text-[#f06a60]">Jadi Kepercayaan</span>
                </h1>
                <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl font-body">
                  Fice Shoes Care bukan sekadar jasa cuci sepatu. Ini adalah cerita tentang pengalaman,
                  keberanian, dan ikatan keluarga yang tumbuh menjadi bisnis berbasis kepercayaan.
                </p>
                <Link
                  href="/order"
                  className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-base sm:text-lg uppercase tracking-normal px-7 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 ease-out active:scale-95"
                >
                  <span>Pesan Sekarang</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="relative">
                <div className="rounded-[32px] overflow-hidden h-[420px] sm:h-[500px] bg-[#f2ece5]">
                  <img
                    src="https://images.unsplash.com/photo-1556906781-9a412961d28f?w=900&auto=format&fit=crop&q=85"
                    alt="Fice Shoes Care Workshop"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-[32px]" />
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl px-5 py-4 border border-black/[0.08] shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f06a60] flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-[#0d1526] text-base leading-tight">4.9 Rating Google</p>
                    <p className="text-xs text-neutral-500 font-body mt-0.5">Dipercaya ratusan pelanggan di Jaksel, Tangsel & Tangerang</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CERITA PENDIRI */}
        <section className="py-20 sm:py-24 bg-[#f2ece5]/50 border-t border-black/[0.05]">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                  <Quote className="w-3.5 h-3.5 text-[#f06a60]" />
                  Kisah Kami
                </div>
                <h2 className="font-heading font-bold text-4xl sm:text-5xl tracking-tight text-[#0d1526]">
                  Bagaimana Fice Lahir
                </h2>
                <div className="w-16 h-1.5 bg-[#f06a60] rounded-full" />
                <div className="rounded-[24px] overflow-hidden h-64 sm:h-80 bg-[#eae2d9]">
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=85"
                    alt="Sepatu bersih hasil cuci Fice"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8 font-body text-base sm:text-lg text-neutral-700 leading-relaxed">
                <div className="bg-white rounded-[24px] p-7 sm:p-9 border border-black/[0.06] shadow-xs space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#f06a60] flex items-center justify-center shrink-0">
                      <span className="text-white font-heading font-bold text-lg">01</span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-[#0d1526]">Lahir dari Pengalaman Industri yang Nyata</h3>
                  </div>
                  <p>
                    Fice Shoes Care bukan dibangun dari nol tanpa bekal. Fondasi kami berasal dari pengalaman
                    langsung bekerja sebagai teknisi di salah satu <em>shoes care</em> premium di Jakarta —
                    tempat di mana standar kualitas, ketelitian proses, dan tanggung jawab terhadap setiap
                    item pelanggan benar-benar diuji setiap harinya.
                  </p>
                  <p>
                    Pengalaman itu membentuk cara Fice bekerja: setiap sepatu yang masuk diperlakukan
                    dengan standar yang sama seperti milik sendiri.
                  </p>
                </div>

                <div className="bg-white rounded-[24px] p-7 sm:p-9 border border-black/[0.06] shadow-xs space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#0d1526] flex items-center justify-center shrink-0">
                      <span className="text-white font-heading font-bold text-lg">02</span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-[#0d1526]">Workshop Kecil, Standar yang Tidak Kecil</h3>
                  </div>
                  <p>
                    Fice memulai perjalanan dari sebuah workshop skala kecil — bukan karena keterbatasan,
                    tapi karena kami percaya bahwa kualitas tidak ditentukan oleh besarnya fasilitas,
                    melainkan oleh ketelitian proses dan integritas tim yang mengerjakannya.
                  </p>
                  <p>
                    Dari sana, Fice tumbuh perlahan dengan menjaga satu hal yang tidak pernah berubah:
                    setiap pelanggan diperlakukan secara personal, bukan sekadar nomor antrian.
                    Kepercayaan yang dibangun satu per satu itulah yang membawa Fice sampai hari ini.
                  </p>
                </div>

                <div className="bg-[#0d1526] rounded-[24px] p-7 sm:p-9 shadow-xs space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#f06a60] flex items-center justify-center shrink-0">
                      <span className="text-white font-heading font-bold text-lg">03</span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-white">Customer Relationship adalah Fondasi Kami</h3>
                  </div>
                  <p className="text-neutral-300">
                    Dari hari pertama, kami berpegang teguh pada satu prinsip: <strong className="text-white">hubungan dengan pelanggan
                    adalah segalanya</strong>. Bukan hanya transaksi jual-beli jasa, tapi relasi jangka panjang
                    yang dibangun di atas kepercayaan, komunikasi, dan hasil kerja yang bisa dipertanggungjawabkan.
                  </p>
                  <p className="text-neutral-300">
                    Dan kini, dengan lahirnya website Fice Shoes Care, kami ingin menghadirkan kemudahan itu
                    lebih jauh lagi — agar pelanggan bisa memesan, melacak status, dan berkomunikasi dengan
                    kami kapan saja dan di mana saja. Ini bukan sekadar upgrade teknologi; ini adalah
                    wujud nyata komitmen kami untuk terus bertumbuh bersama pelanggan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="py-20 sm:py-24 bg-[#fdf8f1]">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="text-center space-y-4 mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#edeaf6] text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#3b3a7a] border border-[#b8b4e8]/40">
                <Heart className="w-4 h-4 text-[#f06a60]" />
                Nilai-Nilai Kami
              </div>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526]">
                Yang Kami Pegang Teguh
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
              {[
                {
                  icon: <BadgeCheck className="w-7 h-7 text-[#f06a60]" />,
                  title: 'Pengalaman Nyata',
                  desc: 'Bukan belajar dari YouTube. Kami punya pengalaman langsung bekerja di shoes care premium sebelum membuka usaha sendiri. Setiap teknik yang kami terapkan sudah teruji.',
                },
                {
                  icon: <Users className="w-7 h-7 text-[#f06a60]" />,
                  title: 'Dedikasi & Kepercayaan',
                  desc: 'Fice dibangun di atas kepercayaan, bukan sekadar transaksi. Setiap order dijalankan dengan dedikasi penuh — karena reputasi yang baik lebih berharga dari sekedar omzet.',
                },
                {
                  icon: <Heart className="w-7 h-7 text-[#f06a60]" />,
                  title: 'Customer First',
                  desc: 'Kami tidak hanya mencuci sepatu, kami menjaga hubungan. Dari proses jemput, update status, hingga antar kembali — komunikasi aktif adalah standar pelayanan kami.',
                },
              ].map((v, i) => (
                <div key={i} className="bg-[#f2ece5] rounded-[28px] p-7 sm:p-8 border border-black/[0.04] hover:border-[#f06a60]/30 hover:shadow-xl transition-all duration-300 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xs">
                    {v.icon}
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-[#0d1526]">{v.title}</h3>
                  <p className="font-body text-sm sm:text-base text-neutral-600 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA */}
        <section className="py-20 sm:py-24 bg-[#0d1526]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-white/80 border border-white/15">
              <Sparkles className="w-4 h-4 text-[#f06a60]" />
              Siap Merawat Sepatu Anda?
            </div>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white">
              Percayakan Sepatu Anda<br />
              <span className="text-[#f06a60]">ke Tangan yang Tepat</span>
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 font-body leading-relaxed">
              Gratis antar-jemput untuk wilayah Jaksel, Tangsel & Tangerang. Pesan sebelum jam 13:00 untuk penjemputan hari ini.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/order" className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-white text-white hover:text-[#0d1526] font-heading font-bold text-base sm:text-lg uppercase tracking-normal px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-95">
                <span>Book Cleaning</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/#layanan" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-base sm:text-lg uppercase tracking-normal px-8 py-4 rounded-full border border-white/15 hover:border-white/30 transition-all duration-300">
                Lihat Layanan
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
