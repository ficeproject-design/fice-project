import React from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

const PAGE_LINKS = [
  { label: 'Harga', href: '/harga' },
  { label: 'Tentang', href: '/tentang' },
  { label: 'Testimoni', href: '/testimoni' },
  { label: 'Lacak Pesanan', href: '/track' },
  { label: 'Book Pickup', href: '/order' },
];

const SERVICE_LINKS = [
  { label: 'Deep Clean Shoes', href: '/harga#shoes' },
  { label: 'Suede & Nubuck', href: '/harga#shoes' },
  { label: 'Leather / Kulit', href: '/harga#shoes' },
  { label: 'Kids Shoes', href: '/harga#shoes' },
  { label: 'Womens Care', href: '/harga#shoes' },
  { label: 'Bag Deep Clean', href: '/harga#bags' },
  { label: 'Hat & Accessories', href: '/harga#accessories' },
];

const BOTTOM_LINKS = [
  { label: 'Admin', href: '/admin' },
  { label: 'WhatsApp', href: 'https://wa.me/628161885553', external: true },
  { label: 'Instagram', href: 'https://instagram.com/ficeshoescare', external: true },
];

export default function Footer() {
  return (
    <>
      {/* CTA Section — above footer */}
      <section className="px-4 sm:px-6 lg:px-8 xl:px-10 pb-4">
        <div className="bg-[#f06a60] rounded-3xl px-8 py-20 sm:px-16 sm:py-28 text-center">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white uppercase leading-[0.95] max-w-3xl mx-auto">
            Ready for Your Next Pair?
          </h2>
          <p className="text-sm sm:text-base text-white/80 mt-5 max-w-lg mx-auto leading-relaxed">
            Lihat harga transparan dan jadwalkan penjemputan gratis ke alamat Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/harga"
              className="inline-flex items-center justify-center bg-white hover:bg-[#0d1526] text-[#0d1526] hover:text-white font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95"
            >
              BOOK CLEANING
            </Link>
            <Link
              href="/harga"
              className="inline-flex items-center justify-center bg-white/20 hover:bg-white text-white hover:text-[#0d1526] font-heading font-bold text-sm sm:text-base uppercase tracking-normal px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95"
            >
              VIEW PRICING
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#fdf8f1] mt-auto">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 pb-6">
        {/* Rounded container with 3 columns + giant brand name */}
        <div className="bg-[#f2ece5] rounded-3xl p-8 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Contact */}
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  Address
                </p>
                <p className="font-semibold text-base sm:text-lg text-[#0d1526] leading-snug">
                  Fice Shoes Care
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Pondok Aren, Tangerang Selatan
                </p>
                <p className="text-sm text-neutral-600">
                  Banten, Indonesia
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  Phone
                </p>
                <a
                  href="https://wa.me/628161885553"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-base sm:text-lg text-[#0d1526] hover:text-[#f06a60] transition-colors"
                >
                  0816-1885-553
                </a>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  Email
                </p>
                <a
                  href="mailto:hello@ficeshoescare.id"
                  className="font-semibold text-base sm:text-lg text-[#0d1526] hover:text-[#f06a60] transition-colors"
                >
                  hello@ficeshoescare.id
                </a>
              </div>
            </div>

            {/* Right: Pages + Services side by side */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-5">
                  Pages
                </p>
                <ul className="space-y-3">
                  {PAGE_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm sm:text-base text-black font-medium hover:text-[#f06a60] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-5">
                  Services
                </p>
                <ul className="space-y-3">
                  {SERVICE_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm sm:text-base text-black font-medium hover:text-[#f06a60] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Giant brand name inside the card */}
          <div className="mt-10 pt-8 border-t border-black/[0.06] overflow-hidden">
              <h2
                className="text-[11vw] sm:text-[10vw] md:text-[9.5vw] leading-[0.85] text-[#000000] tracking-tight uppercase select-none text-center whitespace-nowrap"
                style={{ fontFamily: "'Bugaki', sans-serif", fontStyle: 'normal' }}
              >
                Fice Shoescare<span className="text-[#f06a60]">.</span>
              </h2>
          </div>

          {/* Bottom bar inside the card */}
          <div className="mt-8 pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-neutral-500 gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              {BOTTOM_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="hover:text-black transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span>&copy; {new Date().getFullYear()} Fice Shoes Care</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/628161885553"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f06a60] transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/ficeshoescare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f06a60] transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
