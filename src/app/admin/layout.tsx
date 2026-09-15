'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  ArrowUpRight,
  Sparkles,
  Truck,
  TrendingUp,
  Store,
  Tag,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard & Pendapatan',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Antrean & Order',
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      name: 'Customer CRM (WA)',
      href: '/admin/customers',
      icon: Users,
    },
    {
      name: 'Kode Promo & Diskon',
      href: '/admin/promos',
      icon: Tag,
    },
    {
      name: 'Pengaturan Workshop',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdf8f1] text-[#000000]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#000000] text-neutral-300 border-r border-neutral-900 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <img
              src="/images/fice-logo-white.png"
              alt="Fice Shoes Care"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[10px] text-[#f06a60] font-bold uppercase tracking-wider block bg-[#f06a60]/10 px-2 py-0.5 rounded border border-[#f06a60]/20">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 mb-2">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#f06a60] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Storefront Link */}
        <div className="p-4 border-t border-neutral-900 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#f06a60]" />
              Buka Web Utama
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/order"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full bg-[#f06a60]/20 hover:bg-[#f06a60] text-[#f06a60] hover:text-white border border-[#f06a60]/40 font-bold py-2.5 px-3 rounded-full text-xs transition-all"
          >
            <Truck className="w-3.5 h-3.5" />
            + Buat Order Baru
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
