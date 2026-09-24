'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  CalendarCheck,
  Truck,
  Camera,
  PackageCheck,
  MapPin,
  Clock,
  CreditCard,
  Search,
  MessageSquare,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface Settings {
  freeRadiusKm: number;
  minItemsBeyondRadius: number;
  cutoffHour: number;
  workshopCity: string;
}

const DEFAULTS: Settings = {
  freeRadiusKm: 15,
  minItemsBeyondRadius: 3,
  cutoffHour: 13,
  workshopCity: 'Tangerang Selatan',
};

export default function CaraKerjaPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success) {
          setSettings({
            freeRadiusKm: Number(data.data.freeRadiusKm) || DEFAULTS.freeRadiusKm,
            minItemsBeyondRadius: Number(data.data.minItemsBeyondRadius) || DEFAULTS.minItemsBeyondRadius,
            cutoffHour: Number(data.data.cutoffHour) || DEFAULTS.cutoffHour,
            workshopCity: data.data.workshopCity || DEFAULTS.workshopCity,
          });
        }
      } catch {
        // pakai default, halaman tetap tampil benar
      }
    })();
  }, []);

  const steps = [
    {
      num: '01',
      icon: <CalendarCheck className="w-6 h-6 text-white" />,
      title: 'Booking Online (±2 menit)',
      desc: 'Pilih layanan cuci sepatu, tas, atau aksesori di halaman order. Tandai titik jemput di peta interaktif, pilih tanggal & slot (Pagi 09.00–13.00 atau Siang/Sore 14.00–18.00), lalu submit. Nomor invoice langsung terbit.',
      points: [
        `Radius ≤ ${settings.freeRadiusKm} km: gratis antar-jemput tanpa minimum order.`,
        `Di luar radius: gratis dengan minimal ${settings.minItemsBeyondRadius} item.`,
        `Booking sebelum jam ${String(settings.cutoffHour).padStart(2, '0')}.00 masih bisa dijemput hari yang sama (slot siang/sore).`,
      ],
    },
    {
      num: '02',
      icon: <Truck className="w-6 h-6 text-white" />,
      title: 'Kurir Jemput ke Rumah',
      desc: 'Kurir kami menghubungi Anda via WhatsApp saat menuju lokasi, lalu menjemput sepatu/tas sesuai jadwal. 100% gratis, tidak ada biaya antar-jemput, dekat maupun jauh (selama syarat area terpenuhi).',
      points: [
        'Konfirmasi via WhatsApp sebelum kurir berangkat.',
        'Cukup siapkan barang di titik yang ditandai di peta.',
        'Patokan rumah (catatan landmark) membantu kurir menemukan lokasi.',
      ],
    },
    {
      num: '03',
      icon: <Camera className="w-6 h-6 text-white" />,
      title: 'QC Foto & Treatment',
      desc: 'Setiba di workshop, setiap barang difoto kondisi awalnya (sol, upper, tali) dan dicatat bila ada goresan bawaan. Lalu dibersihkan manual oleh teknisi sesuai materialnya: kulit, suede, canvas, nylon. Hasil akhirnya difoto lagi.',
      points: [
        'Foto Before & After bisa dipantau live di halaman tracking.',
        'Mencegah sengketa atas kerusakan yang sudah ada sebelumnya.',
        'Estimasi pengerjaan 2–4 hari tergantung layanan (tertera di katalog harga).',
      ],
    },
    {
      num: '04',
      icon: <PackageCheck className="w-6 h-6 text-white" />,
      title: 'Diantar Kembali + Bayar',
      desc: 'Barang bersih dikirim balik ke alamat Anda, gratis. Pembayaran via transfer setelah sepatu tiba & diverifikasi di workshop, atau COD saat pengantaran. Invoice resmi tersedia dan bisa dicetak atau dibagikan via WhatsApp.',
      points: [
        'Tagihan terbit setelah verifikasi di workshop, bukan di muka.',
        'Lacak status kapan saja lewat nomor invoice di halaman Track.',
        'Puas? Tinggalkan ulasan. Testimoni Anda tampil di halaman Testimoni.',
      ],
    },
  ];

  const infos = [
    {
      icon: <MapPin className="w-5 h-5 text-[#f06a60]" />,
      title: 'Area Layanan',
      desc: `Jakarta Selatan, ${settings.workshopCity}, dan Tangerang. Cek titik Anda di peta saat booking untuk kepastian radius.`,
    },
    {
      icon: <Clock className="w-5 h-5 text-[#f06a60]" />,
      title: 'Jadwal Jemput',
      desc: 'Slot Pagi 09.00–13.00 dan Siang/Sore 14.00–18.00, setiap hari. Booking sebelum cut-off bisa dijemput hari yang sama.',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-[#f06a60]" />,
      title: 'Pembayaran',
      desc: 'Transfer (QRIS/bank) setelah verifikasi workshop, atau COD. Tanpa DP, tanpa biaya jemput.',
    },
    {
      icon: <Search className="w-5 h-5 text-[#f06a60]" />,
      title: 'Tracking Live',
      desc: 'Setiap status (menunggu jemput, di workshop, dicuci, siap antar, selesai) terpantau via nomor invoice.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#f06a60]" />,
      title: 'Garansi Transparansi',
      desc: 'Foto kondisi awal melindungi kedua belah pihak. Ada masalah? Komplain via WhatsApp dengan bukti foto QC.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-[#f06a60]" />,
      title: 'Update via WhatsApp',
      desc: 'Konfirmasi jemput, tagihan, dan status penting dikirim ke WhatsApp Anda otomatis oleh admin/kurir.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-14 sm:pt-20 pb-12 sm:pb-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 text-center space-y-5">
            <span className="inline-block text-xs sm:text-sm font-heading font-bold uppercase tracking-wider bg-[#f2ece5] text-[#f06a60] border border-[#f06a60]/20 px-4 py-1.5 rounded-full">
              Super Easy &amp; Hassle-Free
            </span>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase text-[#0d1526] leading-[0.95]">
              How It Works
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
              Dari booking sampai sepatu kembali bersih, 4 langkah sederhana dan semua gratis antar-jemput.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                href="/order"
                className="group inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl transition-all active:scale-95"
              >
                <span>Book Pickup</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/harga"
                className="inline-flex items-center gap-2 bg-[#f2ece5] hover:bg-[#eae2d9] text-[#0d1526] font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-7 py-3.5 rounded-2xl border border-black/[0.06] transition-all"
              >
                Lihat Harga
              </Link>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="pb-16 sm:pb-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
              <div className="space-y-3">
                <span className="inline-block text-xs sm:text-sm font-heading font-bold uppercase tracking-wider bg-[#f2ece5] text-[#f06a60] border border-[#f06a60]/20 px-4 py-1.5 rounded-full">
                  Booking sampai Selesai
                </span>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase text-[#0d1526] leading-[0.95]">
                  Empat Langkah, Nol Ribet
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xs sm:text-right">
                Setiap langkah gratis antar-jemput. Anda cukup booking sekali, sisanya kami yang jalan.
              </p>
            </div>

            <ol className="relative space-y-5 sm:space-y-6">
              <div
                aria-hidden="true"
                className="absolute left-7 top-7 bottom-7 w-px bg-gradient-to-b from-[#f06a60] via-black/15 to-transparent hidden sm:block"
              />
                {steps.map((s, i) => {
                  const featured = i === 0;
                  return (
                    <li key={s.num} className="relative sm:pl-20">
                      <div
                        aria-hidden="true"
                        className={`hidden sm:flex absolute left-0 top-0 w-14 h-14 rounded-2xl items-center justify-center shadow-xs ${
                          i % 2 === 0 ? 'bg-[#000000]' : 'bg-[#f06a60]'
                        }`}
                      >
                        {s.icon}
                      </div>
                      <article
                        className={`rounded-[28px] sm:rounded-[32px] border p-7 sm:p-10 ${
                          featured
                            ? 'bg-[#0d1526] text-white border-[#0d1526]'
                            : 'bg-white border-black/[0.07]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-1.5">
                            <p className="font-heading font-black text-sm text-[#f06a60] tracking-widest">
                              LANGKAH {s.num}
                            </p>
                            <h3
                              className={`font-heading font-extrabold text-2xl sm:text-3xl uppercase leading-tight ${
                                featured ? 'text-white' : 'text-[#0d1526]'
                              }`}
                            >
                              {s.title}
                            </h3>
                          </div>
                          <span
                            aria-hidden="true"
                            className={`hidden sm:block font-heading font-black text-6xl lg:text-7xl leading-none select-none shrink-0 ${
                              featured ? 'text-white/10' : 'text-black/[0.06]'
                            }`}
                          >
                            {s.num}
                          </span>
                        </div>
                        <p
                          className={`mt-4 text-sm sm:text-base leading-relaxed ${
                            featured ? 'text-white/80' : 'text-neutral-600'
                          }`}
                        >
                          {s.desc}
                        </p>
                        <ul className="mt-4 space-y-2">
                          {s.points.map((p) => (
                            <li
                              key={p}
                              className="flex items-start gap-2.5 text-xs sm:text-sm"
                            >
                              <span
                                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                  featured
                                    ? 'bg-[#f06a60]/25 text-[#f06a60]'
                                    : 'bg-[#f06a60]/15 text-[#f06a60]'
                                }`}
                              >
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </span>
                              <span className={featured ? 'text-white/85' : 'text-neutral-700'}>
                                {p}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {i === 0 && (
                          <Link
                            href="/order"
                            className="mt-5 inline-flex items-center gap-2 bg-[#f06a60] hover:bg-white text-white hover:text-[#0d1526] font-heading font-bold text-sm uppercase px-6 py-3 rounded-2xl transition-all active:scale-95"
                          >
                            Mulai booking sekarang
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                        {i === 2 && (
                          <Link
                            href="/testimoni"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f06a60] hover:text-[#0d1526] transition-colors"
                          >
                            Lihat hasil QC pelanggan
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                        {i === steps.length - 1 && (
                          <Link
                            href="/track"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f06a60] hover:text-[#0d1526] transition-colors"
                          >
                            Lacak pesanan Anda
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </article>
                    </li>
                  );
                })}
            </ol>
          </div>
        </section>

        {/* Info grid */}
        <section className="pb-20 sm:pb-24">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase text-[#0d1526] text-center mb-10">
              Info Praktis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {infos.map((info) => (
                <div
                  key={info.title}
                  className="bg-[#f2ece5] hover:bg-[#eae2d9] p-7 sm:p-8 rounded-[28px] border border-black/[0.04] transition-colors space-y-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center">
                    {info.icon}
                  </div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-[#000000]">{info.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{info.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
