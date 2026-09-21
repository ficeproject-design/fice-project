'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  MapPin,
  Clock,
  Truck,
  Building2,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { SystemSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Workshop & Logika Antar-Jemput
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Aturan Logistik & Radius
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
                  setSettings({ ...settings, freeRadiusKm: parseFloat(e.target.value) || 20 })
                }
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Jarak $\le$ radius ini: Bebas order 1 atau 2 pasang.
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
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Jarak &gt; 20 km: Wajib minimal 3 item.
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
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Default: 13 (Pukul 13.00 WIB).
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: KOORDINAT & WORKSHOP INFO */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Titik Acuan Workshop (Rumah)
            </h2>
            <p className="text-xs text-slate-500">
              Koordinat ini menjadi titik pusat kalkulasi jarak ke alamat customer.
            </p>
          </div>

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
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono bg-white"
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
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono bg-white"
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
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* SECTION 3: INFORMASI BRAND & PEMBAYARAN */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Nama Brand & Kontak Admin
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
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
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
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
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
              placeholder="Contoh: BCA 6030611185 a.n. Fice Shoes Care"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
