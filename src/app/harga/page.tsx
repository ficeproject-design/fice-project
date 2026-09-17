'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceCatalog from '@/components/ServiceCatalog';

export default function HargaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
      <Navbar />

      <main className="flex-1">
        <section className="pt-14 sm:pt-20 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#0d1526] leading-[0.95]">
              Harga Layanan
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mt-3 leading-relaxed">
              Tarif per item, dikerjakan manual oleh teknisi kami. Pilih layanan, atur jumlahnya,
              lalu lanjut ke checkout. Free antar-jemput area Jakarta Selatan, Tangerang Selatan,
              dan Tangerang.
            </p>
          </div>
        </section>

        <section className="pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <ServiceCatalog />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
