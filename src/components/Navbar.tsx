'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setServicesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 180);
  };

  return (
    <>
      {/* Announcement Banner — NOT sticky, scroll away like Sparkles */}
      <div className="bg-[#f06a60] text-white text-xs font-bold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="bg-[#000000] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
          FREE PICKUP
        </span>
        <span>100% Free Pickup & Delivery — Jaksel, Tangsel & Tangerang</span>
        <span className="text-white/60 hidden sm:inline">&bull;</span>
        <Link
          href="/harga"
          className="underline hover:text-[#000000] transition-colors font-extrabold text-white hidden sm:inline-flex items-center gap-1"
        >
          Book before 1 PM for same-day pickup
          <ArrowRight className="w-3.5 h-3.5 inline" />
        </Link>
      </div>

      <header className="sticky top-0 z-50 bg-[#fdf8f1]/95 backdrop-blur-md transition-all relative">
        <nav className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-18 sm:h-20 flex items-center justify-between">
        {/* Left Side: Logo + Nav Links directly grouped together on the exact optical axis */}
        <div className="flex items-center gap-7 lg:gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <img
              src="/images/fice-logo.png"
              alt="Fice Shoes Care"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
            />
          </Link>

          {/* Desktop Navigation Links directly beside Logo in Bricolage Grotesque (Refined Size) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[15.5px] lg:text-[16.5px] font-body font-bold text-[#000000] tracking-tight">
            {/* Services Dropdown Trigger */}
            <div
              className="relative py-2 flex items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-[#f06a60] transition-colors cursor-pointer font-body font-bold text-[15.5px] lg:text-[16.5px] tracking-tight leading-none"
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#000000] opacity-60 transition-transform duration-200 ${
                    servicesOpen ? 'rotate-180 text-[#f06a60] opacity-100' : ''
                  }`}
                />
              </button>
            </div>

            <Link
              href="/tentang"
              className="hover:text-[#f06a60] transition-colors leading-none"
            >
              About
            </Link>
            <Link
              href="/harga"
              className="hover:text-[#f06a60] transition-colors leading-none"
            >
              Pricing
            </Link>
            <Link
              href="/testimoni"
              className="hover:text-[#f06a60] transition-colors leading-none"
            >
              Testimonials
            </Link>
            <Link
              href="/#cara-kerja"
              className="hover:text-[#f06a60] transition-colors leading-none"
            >
              How It Works
            </Link>
            <Link
              href="/track"
              className="hover:text-[#f06a60] transition-colors flex items-center gap-1.5 leading-none"
            >
              <Search className="w-3.5 h-3.5 opacity-70" />
              <span>Track Order</span>
            </Link>
          </div>
        </div>

        {/* Right CTA Button: Hero Button Font Style (font-heading font-bold, 19px, tracking-normal, spacious padding) */}
        <div className="hidden md:flex items-center">
          <Link
            href="/harga"
            className="group relative inline-flex items-center justify-center bg-[#f06a60] hover:bg-[#000000] text-[#000000] hover:text-white text-base sm:text-lg lg:text-[19px] font-heading font-bold tracking-normal uppercase px-5 sm:px-6 py-2 sm:py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ease-out active:scale-95 overflow-hidden"
          >
            <span className="transition-colors duration-300">BOOK CLEANING</span>
            <span className="max-w-0 opacity-0 -translate-x-2 group-hover:max-w-6 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2.5 transition-all duration-300 ease-out inline-flex items-center overflow-hidden">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/harga"
            className="bg-[#f06a60] text-white text-xs sm:text-sm font-heading font-bold tracking-normal uppercase px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl"
          >
            Book
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#000000] rounded-xl hover:bg-[#f2ece5]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* FULL-WIDTH SERVICES MEGAMENU DROPDOWN MATCHING SPARKLES */}
      {servicesOpen && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute left-0 top-full w-full bg-[#fdf8f1] border-t border-b border-black/10 shadow-2xl z-50 py-8 lg:py-10 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Left Column: SERVICES Tag + Clean Text List */}
              <div className="col-span-5 flex flex-col justify-between pr-4">
                <div>

                  <div className="flex flex-col space-y-2.5">
                    <Link
                      href="/harga"
                      onClick={() => setServicesOpen(false)}
                      className="text-xl sm:text-2xl font-body font-bold tracking-tight text-[#000000] hover:text-[#f06a60] transition-colors"
                    >
                      Deep Clean Shoes
                    </Link>
                    <Link
                      href="/harga"
                      onClick={() => setServicesOpen(false)}
                      className="text-xl sm:text-2xl font-body font-bold tracking-tight text-[#000000] hover:text-[#f06a60] transition-colors"
                    >
                      Special Treatment Suede
                    </Link>
                    <Link
                      href="/harga"
                      onClick={() => setServicesOpen(false)}
                      className="text-xl sm:text-2xl font-body font-bold tracking-tight text-[#000000] hover:text-[#f06a60] transition-colors"
                    >
                      Special Treatment Leather
                    </Link>
                    <Link
                      href="/harga"
                      onClick={() => setServicesOpen(false)}
                      className="text-xl sm:text-2xl font-body font-bold tracking-tight text-[#000000] hover:text-[#f06a60] transition-colors"
                    >
                      Little One Care (Kids Shoes)
                    </Link>
                    <Link
                      href="/harga"
                      onClick={() => setServicesOpen(false)}
                      className="text-xl sm:text-2xl font-body font-bold tracking-tight text-[#000000] hover:text-[#f06a60] transition-colors"
                    >
                      Womens Care (Heels &amp; Flats)
                    </Link>
                    <Link
                      href="/harga"
                      onClick={() => setServicesOpen(false)}
                      className="text-xl sm:text-2xl font-body font-bold tracking-tight text-[#000000] hover:text-[#f06a60] transition-colors"
                    >
                      Bag Deep Clean
                    </Link>
                    <Link
                      href="/harga"
                      onClick={() => setServicesOpen(false)}
                      className="text-xl sm:text-2xl font-body font-bold tracking-tight text-[#000000] hover:text-[#f06a60] transition-colors"
                    >
                      Hat, Wallet &amp; Pouch Care
                    </Link>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href="/harga"
                    onClick={() => setServicesOpen(false)}
                    className="inline-flex items-center gap-2 text-sm sm:text-base font-heading font-bold tracking-normal uppercase px-6 py-3 rounded-2xl bg-[#f2ece5] hover:bg-[#000000] text-[#000000] hover:text-white transition-all group"
                  >
                    EXPLORE ALL SERVICES
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 3 Editorial Visual Cards */}
              <div className="col-span-7 grid grid-cols-3 gap-4">
                {/* Card 1: Deep Cleaning */}
                <Link
                  href="/harga"
                  onClick={() => setServicesOpen(false)}
                  className="group relative aspect-[3/4] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 block"
                >
                  <img
                    src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&auto=format&fit=crop&q=80"
                    alt="Deep Cleaning"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                    <span className="font-heading font-black text-2xl sm:text-3xl lg:text-[32px] text-white tracking-tight uppercase leading-[0.9] block">
                      DEEP<br />CLEANING
                    </span>
                  </div>
                </Link>

                {/* Card 2: Special Treatment */}
                <Link
                  href="/harga"
                  onClick={() => setServicesOpen(false)}
                  className="group relative aspect-[3/4] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 block"
                >
                  <img
                    src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=700&auto=format&fit=crop&q=80"
                    alt="Special Treatment"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                    <span className="font-heading font-black text-2xl sm:text-3xl lg:text-[32px] text-white tracking-tight uppercase leading-[0.9] block">
                      SPECIAL<br />TREATMENT
                    </span>
                  </div>
                </Link>

                {/* Card 3: Bag & Cap Care */}
                <Link
                  href="/harga"
                  onClick={() => setServicesOpen(false)}
                  className="group relative aspect-[3/4] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 block"
                >
                  <img
                    src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&auto=format&fit=crop&q=80"
                    alt="Bag & Cap Care"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                    <span className="font-heading font-black text-2xl sm:text-3xl lg:text-[32px] text-white tracking-tight uppercase leading-[0.9] block">
                      BAG &amp; CAP<br />CARE
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#fdf8f1] border-b border-black/10 px-5 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-2 text-sm font-bold text-neutral-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-2xl hover:bg-[#f2ece5]"
            >
              Home
            </Link>
            <Link
              href="/harga"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-2xl hover:bg-[#f2ece5]"
            >
              Services & Pricing
            </Link>
            <Link
              href="/testimoni"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-2xl hover:bg-[#f2ece5]"
            >
              Testimonials
            </Link>
            <Link
              href="/#cara-kerja"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-2xl hover:bg-[#f2ece5]"
            >
              How It Works
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-2xl hover:bg-[#f2ece5] flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#f06a60]" />
              Track Order
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/harga"
              onClick={() => setMobileMenuOpen(false)}
              className="group w-full flex items-center justify-center bg-[#f06a60] hover:bg-[#000000] text-[#000000] hover:text-white font-heading font-bold py-4 rounded-2xl shadow-md text-base sm:text-lg lg:text-[19px] uppercase tracking-normal transition-all duration-300 active:scale-95 overflow-hidden"
            >
              <span className="transition-colors duration-300">BOOK CLEANING</span>
              <span className="max-w-0 opacity-0 -translate-x-2 group-hover:max-w-6 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2.5 transition-all duration-300 ease-out inline-flex items-center overflow-hidden">
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
