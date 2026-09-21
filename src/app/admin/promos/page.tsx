'use client';

import React, { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Ticket,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Trash2,
  Edit3,
  RefreshCw,
  Percent,
  Coins,
  AlertCircle,
  X,
  Check,
  Copy,
} from 'lucide-react';
import { PromoCode, PromoDiscountType } from '@/lib/types';
import { formatRupiah } from '@/lib/invoice';

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<PromoDiscountType>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number | ''>(15);
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>(65000);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>(25000);
  const [validUntil, setValidUntil] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch promos. setLoading(true) sengaja tidak di sini supaya effect
  // tidak memanggil setState secara sinkron (rule react-hooks/set-state-in-effect).
  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos');
      const json = await res.json();
      if (json.success) {
        setPromos(json.data);
      }
    } catch (err) {
      console.error('Error fetching promos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchPromos();
    })();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setCode('');
    setDiscountType('PERCENT');
    setDiscountValue(10);
    setMinOrderAmount(65000);
    setMaxDiscount(20000);
    setValidUntil('');
    setUsageLimit('');
    setDescription('');
    setIsActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (promo: PromoCode) => {
    setIsEditing(true);
    setEditingId(promo.id);
    setCode(promo.code);
    setDiscountType(promo.discountType);
    setDiscountValue(promo.discountValue);
    setMinOrderAmount(promo.minOrderAmount ?? '');
    setMaxDiscount(promo.maxDiscount ?? '');
    setValidUntil(promo.validUntil ?? '');
    setUsageLimit(promo.usageLimit ?? '');
    setDescription(promo.description ?? '');
    setIsActive(promo.isActive);
    setFormError(null);
    setModalOpen(true);
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: promo.id,
          isActive: !promo.isActive,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPromos((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (err) {
      console.error('Error toggling promo status:', err);
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kode promo "${codeName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/promos?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setPromos((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(json.error || 'Gagal menghapus kode promo');
      }
    } catch (err) {
      console.error('Error deleting promo:', err);
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim()) {
      setFormError('Kode promo wajib diisi.');
      return;
    }

    if (!discountValue || Number(discountValue) <= 0) {
      setFormError('Nilai diskon harus lebih dari 0.');
      return;
    }

    if (discountType === 'PERCENT' && Number(discountValue) > 100) {
      setFormError('Diskon persentase tidak boleh melebihi 100%.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        maxDiscount: discountType === 'PERCENT' && maxDiscount ? Number(maxDiscount) : undefined,
        validUntil: validUntil || undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        description: description.trim() || undefined,
        isActive,
      };

      let res;
      if (isEditing && editingId) {
        res = await fetch('/api/admin/promos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        res = await fetch('/api/admin/promos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan kode promo.');
      }

      await fetchPromos();
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = (promoCode: string) => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(promoCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredPromos = promos.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = promos.filter((p) => p.isActive).length;
  const totalUsedCount = promos.reduce((sum, p) => sum + (p.usedCount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f06a60]/10 text-[#f06a60] text-xs font-bold border border-[#f06a60]/20 mb-1.5">
            <Tag className="w-3.5 h-3.5" />
            Promo &amp; Diskon
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] tracking-tight">
            Manajemen Kode Promo &amp; Diskon
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Buat dan kelola voucher potongan harga (persentase % atau nominal Rp) untuk meningkatkan konversi pemesanan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchPromos}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f06a60]' : 'text-slate-500'}`} />
            <span>Muat Ulang</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 text-xs bg-[#f06a60] hover:bg-[#0d1526] text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kode Promo Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Voucher</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-[#0d1526] mt-0.5 block">{promos.length}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Voucher Aktif</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-emerald-600 mt-0.5 block">{activeCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#f06a60] block">Total Digunakan</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-[#f06a60] mt-0.5 block">{totalUsedCount}x</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#fff2f0] flex items-center justify-center text-[#f06a60]">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">Tipe Diskon</span>
            <span className="text-xs font-bold text-slate-700 mt-1 block">
              % Persen &amp; Rp Nominal
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode promo atau deskripsi..."
            className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d1526] bg-slate-50/70"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          Menampilkan {filteredPromos.length} dari {promos.length} kode
        </span>
      </div>

      {/* Promos Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#f06a60]" />
            <p>Memuat daftar kode promo...</p>
          </div>
        ) : filteredPromos.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs space-y-3">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Belum ada kode promo ditemukan</p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 text-xs bg-[#f06a60] text-white px-4 py-2 rounded-xl font-bold cursor-pointer hover:bg-[#0d1526] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Kode Promo Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-48">Kode Promo</th>
                  <th className="py-3.5 px-4 w-48">Tipe &amp; Nilai Diskon</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Syarat &amp; Ketentuan</th>
                  <th className="py-3.5 px-4 w-36">Pemakaian</th>
                  <th className="py-3.5 px-4 w-32">Status</th>
                  <th className="py-3.5 px-4 w-36 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPromos.map((p) => {
                  const isExpired = p.validUntil ? new Date() > new Date(`${p.validUntil}T23:59:59`) : false;
                  const isExhausted = p.usageLimit ? p.usedCount >= p.usageLimit : false;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Kode Promo */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#0d1526] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {p.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(p.code)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded"
                            title="Salin Kode Promo"
                          >
                            {copiedCode === p.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </td>

                      {/* Tipe & Nilai Diskon */}
                      <td className="py-4 px-4 align-top">
                        {p.discountType === 'PERCENT' ? (
                          <div>
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-1 text-[#f06a60]">
                              <Percent className="w-3.5 h-3.5" /> Diskon {p.discountValue}%
                            </span>
                            {p.maxDiscount && (
                              <span className="text-[11px] text-slate-500 block mt-0.5">
                                Maks. {formatRupiah(p.maxDiscount)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-1 text-emerald-700">
                              <Coins className="w-3.5 h-3.5" /> {formatRupiah(p.discountValue)}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 uppercase font-semibold">
                              Potongan Tetap
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Syarat & Ketentuan */}
                      <td className="py-4 px-4 align-top space-y-1">
                        <div className="text-slate-700 font-medium">
                          Min. Order: <strong>{p.minOrderAmount ? formatRupiah(p.minOrderAmount) : 'Tanpa Minimal'}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {p.validUntil
                              ? `Berlaku s/d ${new Date(p.validUntil).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}`
                              : 'Tidak Ada Batas Waktu'}
                          </span>
                        </div>
                        {isExpired && (
                          <span className="inline-block text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Kadaluarsa
                          </span>
                        )}
                      </td>

                      {/* Pemakaian */}
                      <td className="py-4 px-4 align-top">
                        <span className="font-bold text-slate-900 block text-xs">
                          {p.usedCount} {p.usageLimit ? `/ ${p.usageLimit}` : ''} kali
                        </span>
                        {isExhausted ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            Kuota Habis
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block">
                            {p.usageLimit ? `Sisa ${p.usageLimit - p.usedCount} kuota` : 'Kuota tidak terbatas'}
                          </span>
                        )}
                      </td>

                      {/* Status Aktif */}
                      <td className="py-4 px-4 align-top">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                          />
                          <span>{p.isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                            title="Edit Kode Promo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.code)}
                            className="p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            title="Hapus Kode Promo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT KODE PROMO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-heading font-bold text-slate-900">
                  {isEditing ? 'Edit Kode Promo' : 'Tambah Kode Promo Baru'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isEditing
                    ? 'Perbarui rincian, diskon, dan kuota voucher.'
                    : 'Tentukan kode unik, tipe potongan harga, dan syarat berlaku.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
              {/* Kode Promo */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Kode Promo (Uppercase) *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: FICEBARU, BERSIH20"
                  className="w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d1526] uppercase"
                />
              </div>

              {/* Tipe Diskon Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Tipe Potongan Diskon *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENT')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      discountType === 'PERCENT'
                        ? 'bg-[#0d1526] text-white border-[#0d1526]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    Persentase (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FIXED')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      discountType === 'FIXED'
                        ? 'bg-[#0d1526] text-white border-[#0d1526]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    Potongan Tetap (Rp)
                  </button>
                </div>
              </div>

              {/* Nilai Diskon & Maksimal Potongan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {discountType === 'PERCENT' ? 'Nilai Persen (%) *' : 'Nominal Potongan (Rp) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={discountType === 'PERCENT' ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={discountType === 'PERCENT' ? 'Contoh: 15' : 'Contoh: 15000'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d1526] font-semibold"
                  />
                </div>

                {discountType === 'PERCENT' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Maksimal Diskon (Rp, Opsional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Contoh: 25000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d1526]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Minimal Order (Rp, Opsional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Contoh: 65000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d1526]"
                    />
                  </div>
                )}
              </div>

              {discountType === 'PERCENT' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Minimal Belanja / Order (Rp, Opsional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 65000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d1526]"
                  />
                </div>
              )}

              {/* Kuota & Tanggal Kadaluarsa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Batas Kuota Pemakaian (Opsional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Kosongkan jika unlimited"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d1526]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Berlaku Sampai Tanggal (Opsional)
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d1526]"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Deskripsi / Catatan Promo (Opsional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Diskon khusus pelanggan baru Fice Shoes Care"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d1526]"
                />
              </div>

              {/* Status Aktif Switch */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#f06a60] focus:ring-[#f06a60] cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-slate-800 cursor-pointer">
                  Aktifkan kode promo ini langsung
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#0d1526] hover:bg-[#f06a60] text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Kode Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
