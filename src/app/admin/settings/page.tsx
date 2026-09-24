'use client';

import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Truck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Save,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { SystemSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success) {
          setSettings(json.data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotice('Browser Anda tidak mendukung deteksi lokasi otomatis.');
      return;
    }
    setLocating(true);
    setGpsNotice(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                workshopLat: Math.round(pos.coords.latitude * 1000000) / 1000000,
                workshopLng: Math.round(pos.coords.longitude * 1000000) / 1000000,
              }
            : prev
        );
        setLocating(false);
        setGpsNotice('Koordinat GPS berhasil disinkronkan dari perangkat Anda!');
        setTimeout(() => setGpsNotice(null), 3500);
      },
      () => {
        setLocating(false);
        setGpsNotice('Gagal membaca lokasi. Pastikan izin akses GPS/lokasi sudah diizinkan.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setError(json.error || 'Gagal menyimpan pengaturan');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-xs">Memuat pengaturan...</div>;
  }

  if (!settings) {
    return <div className="py-20 text-center text-rose-500 text-xs">Pengaturan tidak ditemukan.</div>;
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${settings.workshopLat},${settings.workshopLng}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] tracking-tight uppercase">
          Pengaturan Workshop &amp; Logika Antar-Jemput
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Sesuaikan koordinat rumah/workshop Anda, batas radius free antar-jemput, dan jam cut-off.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan berhasil disimpan dan langsung diterapkan ke seluruh sistem!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: LOGIKA LOGISTIK */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold uppercase text-[#0d1526] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#f06a60]" />
              Aturan Logistik &amp; Radius
            </h2>
            <p className="text-xs text-slate-500">
              Parameter yang menentukan gratis antar-jemput dan batasan kuota.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Batas Radius Free (km):
              </label>
              <input
                type="number"
                value={settings.freeRadiusKm}
                onChange={(e) =>
                  setSettings({ ...settings, freeRadiusKm: parseFloat(e.target.value) || 15 })
                }
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Jarak ≤ radius ini: Bebas order 1 atau 2 pasang.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Syarat Min. Item Luar Radius:
              </label>
              <input
                type="number"
                value={settings.minItemsBeyondRadius}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minItemsBeyondRadius: parseInt(e.target.value, 10) || 3,
                  })
                }
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Jarak &gt; {settings.freeRadiusKm} km: Wajib minimal {settings.minItemsBeyondRadius} item.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Jam Cut-Off Penjemputan (WIB):
              </label>
              <input
                type="number"
                value={settings.cutoffHour}
                onChange={(e) =>
                  setSettings({ ...settings, cutoffHour: parseInt(e.target.value, 10) || 13 })
                }
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Default: 13 (Pukul 13.00 WIB).
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: KOORDINAT & WORKSHOP INFO */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold uppercase text-[#0d1526] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#f06a60]" />
                Titik Acuan Workshop (Rumah)
              </h2>
              <p className="text-xs text-slate-500">
                Koordinat ini menjadi titik pusat kalkulasi jarak ke alamat customer.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGetGpsLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f2ece5] text-[#0d1526] hover:bg-[#e8dfd5] border border-black/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Navigation className={`w-3.5 h-3.5 text-[#f06a60] ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Mendeteksi...' : 'Pakai Lokasi GPS Saat Ini'}</span>
              </button>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#f06a60] border border-slate-200 hover:border-[#f06a60] transition-colors"
                title="Buka titik koordinat workshop di Google Maps"
              >
                <span>Cek di Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {gpsNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{gpsNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Latitude Workshop:
              </label>
              <input
                type="number"
                step="any"
                value={settings.workshopLat}
                onChange={(e) =>
                  setSettings({ ...settings, workshopLat: parseFloat(e.target.value) || 0 })
                }
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Longitude Workshop:
              </label>
              <input
                type="number"
                step="any"
                value={settings.workshopLng}
                onChange={(e) =>
                  setSettings({ ...settings, workshopLng: parseFloat(e.target.value) || 0 })
                }
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Alamat Workshop Lengkap:
            </label>
            <input
              type="text"
              value={settings.workshopAddress}
              onChange={(e) => setSettings({ ...settings, workshopAddress: e.target.value })}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
            />
          </div>
        </div>

        {/* SECTION 3: INFORMASI BRAND & PEMBAYARAN */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold uppercase text-[#0d1526] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#f06a60]" />
              Nama Brand &amp; Kontak Admin
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Usaha / Brand:
              </label>
              <input
                type="text"
                value={settings.workshopName}
                onChange={(e) => setSettings({ ...settings, workshopName: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nomor WhatsApp Admin:
              </label>
              <input
                type="text"
                value={settings.adminPhone}
                onChange={(e) => setSettings({ ...settings, adminPhone: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Informasi Rekening Bank untuk Invoice:
            </label>
            <input
              type="text"
              value={settings.bankAccountInfo}
              onChange={(e) => setSettings({ ...settings, bankAccountInfo: e.target.value })}
              placeholder="Contoh: BCA 8830-1234-5678 a.n. Fice Shoes Care"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#0d1526] text-white font-heading font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
