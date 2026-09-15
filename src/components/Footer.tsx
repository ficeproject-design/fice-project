import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Clock, MessageSquare, ShieldCheck, ArrowUpRight, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#000000] text-[#fdf8f1] border-t border-black/10 mt-auto">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="space-y-2">
              <img
                src="/images/fice-logo-white.png"
                alt="Fice Shoes Care"
                className="h-12 sm:h-14 w-auto object-contain"
              />
              <span className="text-xs uppercase font-heading font-bold tracking-widest text-neutral-400 block">
                Premium Shoes &amp; Bag Spa
              </span>
            </div>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-sm">
              Layanan perawatan sepatu, tas, dan aksesoris profesional dengan komitmen{' '}
              <strong className="text-white">100% Free Antar-Jemput</strong> langsung ke depan pintu Anda. Dilengkapi dokumentasi foto QC Before &amp; After.
            </p>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#f06a60] font-heading font-bold bg-[#f06a60]/10 border border-[#f06a60]/30 px-4 py-2 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4 text-[#f06a60]" />
              Transparansi Foto QC Before &amp; After
            </div>
          </div>

          {/* Area Coverage Col */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading text-white font-black text-base uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#f06a60]" />
              Coverage Area
            </h4>
            <ul className="text-xs sm:text-sm text-neutral-400 space-y-3">
              <li className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
                  Kota Tangerang Selatan
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-400 pl-4 leading-relaxed">
                  Serpong, Serpong Utara, Ciputat, Ciputat Timur, Pamulang, Pondok Aren, Setu
                </p>
              </li>
              <li className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
                  Kota Tangerang
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-400 pl-4 leading-relaxed">
                  Ciledug, Cipondoh, Karang Tengah, Karawaci, Gading Serpong, Larangan
                </p>
              </li>
              <li className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-[#f06a60]"></span>
                  Jakarta Selatan
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-400 pl-4 leading-relaxed">
                  Cilandak, Jagakarsa, Kebayoran Baru, Kebayoran Lama, Mampang Prapatan, Pancoran, Pasar Minggu, Pesanggrahan, Tebet, Setiabudi
                </p>
              </li>
            </ul>
            <p className="text-xs text-neutral-500 pt-1">
              * Radius &le; 20 km bebas jumlah item. &gt; 20 km min. 3 item. Gratis ongkir!
            </p>
          </div>

          {/* Schedule & Cut-off Col */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading text-white font-black text-base uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f06a60]" />
              Jadwal &amp; Cut-Off
            </h4>
            <div className="text-sm text-neutral-400 space-y-2.5">
              <p>
                <strong className="text-white">Operasional:</strong> Setiap Hari 09.00 - 18.00 WIB
              </p>
              <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800 text-xs sm:text-sm">
                <p className="text-[#f06a60] font-heading font-black mb-1">Ketentuan Cut-Off 13.00:</p>
                <p className="text-neutral-300">
                  Order sebelum jam 13.00 WIB bisa dijemput hari yang sama. Di atas jam 13.00 dijemput esok harinya.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading text-white font-black text-base uppercase tracking-wider">
              Menu
            </h4>
            <ul className="text-sm text-neutral-400 space-y-2.5 font-medium">
              <li>
                <Link href="/order" className="hover:text-white transition-colors flex items-center gap-1.5">
                  Pesan Jemput
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#f06a60]" />
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  Lacak Resi
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/6281298765432"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f06a60] hover:underline font-bold inline-flex items-center gap-1.5 pt-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Fice Shoes Care. All rights reserved.</p>
          <p className="flex items-center gap-1 text-neutral-400">
            Dibuat untuk perawatan sepatu & tas terbaik di Jabodetabek.
          </p>
        </div>
      </div>
    </footer>
  );
}
