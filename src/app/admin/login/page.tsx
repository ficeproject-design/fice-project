'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, LogIn, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password wajib diisi.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Login gagal. Coba lagi.');
        setLoading(false);
      }
    } catch {
      setError('Koneksi ke server gagal. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-7 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/images/fice-logo-white.png"
              alt="Fice Shoes Care"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[10px] text-[#f06a60] font-bold uppercase tracking-wider bg-[#f06a60]/10 px-2 py-0.5 rounded border border-[#f06a60]/20">
              Admin
            </span>
          </div>

          <h1 className="font-heading font-bold text-2xl text-white uppercase tracking-tight mb-1">
            Masuk Panel Admin
          </h1>
          <p className="text-xs text-neutral-400 mb-6">
            Area khusus pemilik workshop Fice Shoes Care.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Masukkan password admin"
                  className="w-full bg-black border border-neutral-800 focus:border-[#f06a60] text-white text-sm pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#f06a60] placeholder:text-neutral-400"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="text-xs text-[#f06a60] bg-[#f06a60]/10 border border-[#f06a60]/30 rounded-xl px-3.5 py-2.5"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#f06a60] hover:bg-[#d9564d] disabled:opacity-60 text-[#000000] font-heading font-bold text-base uppercase tracking-normal py-3 rounded-full transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Memeriksa...' : 'Masuk'}
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke website
          </Link>
        </div>
      </div>
    </div>
  );
}
