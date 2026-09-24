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
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase text-[#0d1526] leading-[0.95]">
              Service Pricing
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mt-3 leading-relaxed">
              Per-item pricing, hand-cleaned by our technicians. Choose a service, adjust quantities,
              then proceed to checkout. Free pickup & delivery for Jakarta Selatan, Tangerang Selatan,
              and Tangerang.
            </p>
          </div>
        </section>

        <section className="pb-10">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <ServiceCatalog />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
