'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  Plus,
  Minus,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Banknote,
  ShieldCheck,
  Sparkles,
  Info,
  Clock,
  Tag,
  Ticket,
  X,
} from 'lucide-react';
import {
  COVERAGE_CITIES,
  COVERAGE_AREAS,
  checkOrderEligibility,
  getAvailablePickupDates,
  DEFAULT_WORKSHOP_COORDS,
} from '@/lib/haversine';
import { formatRupiah } from '@/lib/invoice';
import { Service } from '@/lib/types';

// Dynamic import for Leaflet map picker
const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-3xl bg-[#f2ece5] border border-black/10 flex items-center justify-center text-neutral-500 text-xs">
      Memuat Peta Interaktif...
    </div>
  ),
});

interface SelectedItem {
  serviceId: string;
  serviceName: string;
  category: any;
  price: number;
  quantity: number;
  itemNotes: string;
}

export default function OrderPage() {
  const router = useRouter();

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Step 1: Items Selection
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'shoes' | 'bag' | 'accessories'>('all');
  const [fromCatalog, setFromCatalog] = useState(false);
  const [editingItems, setEditingItems] = useState(false);

  // Step 2: Customer & Location
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState<string>('Kota Tangerang Selatan');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [addressNotes, setAddressNotes] = useState('');
  const [latitude, setLatitude] = useState(DEFAULT_WORKSHOP_COORDS.lat);
  const [longitude, setLongitude] = useState(DEFAULT_WORKSHOP_COORDS.lng);
  const [distanceKm, setDistanceKm] = useState(0);

  // Step 3: Schedule
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'afternoon'>('afternoon');

  // Step 4: Catatan pesanan
  const [orderNotes, setOrderNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
          setServices(data.data);
          try {
            const raw = sessionStorage.getItem('fice_cart');
            if (raw) {
              sessionStorage.removeItem('fice_cart');
              const prefill = JSON.parse(raw) as Record<string, number>;
              const items: Record<string, SelectedItem> = {};
              for (const s of data.data as Service[]) {
                const qty = Number(prefill[s.id]) || 0;
                if (qty > 0) {
                  items[s.id] = {
                    serviceId: s.id,
                    serviceName: s.name,
                    category: s.category,
                    price: s.price,
                    quantity: Math.min(50, Math.floor(qty)),
                    itemNotes: '',
                  };
                }
              }
              if (Object.keys(items).length > 0) {
                setSelectedItems(items);
                setFromCatalog(true);
              }
            }
          } catch {
            // cart prefill rusak, abaikan saja
          }
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();

    const dates = getAvailablePickupDates(13);
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].date);
      setSelectedSlot(dates[0].availableSlots[0]);
    }
  }, []);

  const handleQuantityChange = (service: Service, delta: number) => {
    setSelectedItems((prev) => {
      const existing = prev[service.id];
      const newQty = (existing?.quantity || 0) + delta;

      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[service.id];
        return copy;
      }

      return {
        ...prev,
        [service.id]: {
          serviceId: service.id,
          serviceName: service.name,
          category: service.category,
          price: service.price,
          quantity: newQty,
          itemNotes: existing?.itemNotes || '',
        },
      };
    });
  };

  const handleItemNotesChange = (serviceId: string, notes: string) => {
    setSelectedItems((prev) => {
      if (!prev[serviceId]) return prev;
      return {
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          itemNotes: notes,
        },
      };
    });
  };

  const selectedItemsArray = Object.values(selectedItems);
  const totalItemsCount = selectedItemsArray.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = selectedItemsArray.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Promo Code States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    setPromoSuccess(null);

    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          subtotal,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setPromoError(json.message || 'Kode promo tidak valid.');
        setAppliedPromo(null);
      } else {
        setAppliedPromo({
          code: json.data.code,
          discountAmount: json.data.discountAmount,
          description: json.data.description,
        });
        setPromoSuccess(json.data.message || 'Kode promo berhasil digunakan!');
        setPromoCodeInput(json.data.code);
      }
    } catch (err) {
      setPromoError('Gagal memvalidasi kode promo. Coba lagi.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoSuccess(null);
    setPromoError(null);
  };

  const filteredServices = services.filter((s) => {
    if (categoryFilter === 'all') return true;
    return s.category === categoryFilter;
  });

  const eligibility = checkOrderEligibility(latitude, longitude, totalItemsCount);

  const canProceedStep1 = totalItemsCount > 0;
  const canProceedStep2 =
    customerName.trim() !== '' &&
    customerPhone.trim().length >= 9 &&
    address.trim() !== '' &&
    district.trim() !== '' &&
    eligibility.allowed;

  const handleLocationChange = (lat: number, lng: number, dist: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setDistanceKm(dist);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: address.trim(),
          district: district.trim(),
          city,
          latitude,
          longitude,
          notes: addressNotes.trim(),
        },
        items: selectedItemsArray,
        pickupDate: selectedDate,
        pickupSlot: selectedSlot,
        promoCode: appliedPromo?.code,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        notes: orderNotes.trim(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengirim pesanan');
      }

      router.push(`/track/${json.data.invoiceNumber}?just_ordered=true`);
    } catch (err: any) {
      console.error('Order submission error:', err);
      setSubmitError(err.message || 'Terjadi kesalahan sistem. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f1] text-[#000000]">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Title */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f06a60]/10 text-[#f06a60] text-xs font-bold border border-[#f06a60]/30 mb-2">
                <Truck className="w-3.5 h-3.5" />
                100% Free Antar-Jemput
              </div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-[#0d1526] tracking-tight">
                Pemesanan Antar-Jemput
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Fice Shoes Care menjemput sepatu & tas kotor Anda langsung ke alamat rumah.
              </p>
            </div>

            {totalItemsCount > 0 && (
              <div className="bg-white border border-black/10 px-5 py-3 rounded-2xl shadow-xs text-right">
                <span className="text-[11px] text-neutral-400 block font-bold uppercase">
                  {totalItemsCount} Item Dipilih
                </span>
                <span className="font-heading font-bold text-xl sm:text-2xl text-[#f06a60]">
                  {formatRupiah(subtotal)}
                </span>
              </div>
            )}
          </div>

          {/* Stepper Wizard Bar - Sparkles Pill Layout */}
          <div className="bg-[#f2ece5]/70 rounded-full p-1.5 border border-black/[0.08] mb-8 shadow-xs">
            <div className="grid grid-cols-4 gap-1 text-center text-xs">
              <div
                className={`py-2.5 px-2 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all ${
                  currentStep === 1
                    ? 'bg-[#000000] text-white shadow-xs'
                    : currentStep > 1
                    ? 'bg-white text-[#f06a60]'
                    : 'text-neutral-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                  1
                </span>
                <span className="hidden sm:inline">Pilih Layanan</span>
              </div>

              <div
                className={`py-2.5 px-2 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all ${
                  currentStep === 2
                    ? 'bg-[#000000] text-white shadow-xs'
                    : currentStep > 2
                    ? 'bg-white text-[#f06a60]'
                    : 'text-neutral-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                  2
                </span>
                <span className="hidden sm:inline">Lokasi & Peta</span>
              </div>

              <div
                className={`py-2.5 px-2 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all ${
                  currentStep === 3
                    ? 'bg-[#000000] text-white shadow-xs'
                    : currentStep > 3
                    ? 'bg-white text-[#f06a60]'
                    : 'text-neutral-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                  3
                </span>
                <span className="hidden sm:inline">Jadwal Jemput</span>
              </div>

              <div
                className={`py-2.5 px-2 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all ${
                  currentStep === 4
                    ? 'bg-[#000000] text-white shadow-xs'
                    : 'text-neutral-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                  4
                </span>
                <span className="hidden sm:inline">Pembayaran</span>
              </div>
            </div>
          </div>

          {/* STEP 1 (KERANJANG DARI HALAMAN HARGA): RINGKASAN SAJA */}
          {currentStep === 1 && fromCatalog && !editingItems && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.08] shadow-sm space-y-6">
                <div className="border-b border-black/[0.06] pb-4">
                  <h2 className="font-heading font-bold text-[#0d1526] text-xl sm:text-2xl tracking-tight">
                    Ringkasan Item Pilihan Anda
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Diteruskan dari halaman Harga. Lanjutkan ke data penjemputan, atau ubah pilihan bila perlu.
                  </p>
                </div>

                <ul className="divide-y divide-black/[0.06]">
                  {selectedItemsArray.map((item) => (
                    <li key={item.serviceId} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-[#0d1526] text-sm">
                          {item.quantity}x {item.serviceName}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {formatRupiah(item.price)} / item
                        </p>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#0d1526] shrink-0">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-black/[0.08] pt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-600">Subtotal</span>
                  <span className="font-heading font-black text-2xl text-[#f06a60]">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const cart: Record<string, number> = {};
                      for (const it of selectedItemsArray) cart[it.serviceId] = it.quantity;
                      sessionStorage.setItem('fice_cart', JSON.stringify(cart));
                      router.push('/harga');
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-black/15 text-[#0d1526] font-bold text-sm px-6 py-4 rounded-full hover:bg-[#f2ece5] transition-colors"
                  >
                    Ubah Pilihan di Halaman Harga
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 group relative inline-flex items-center justify-center gap-2 bg-[#f06a60] hover:bg-[#000000] text-[#000000] hover:text-white font-heading font-bold text-base uppercase tracking-normal px-8 py-4 rounded-full transition-all duration-300 active:scale-95 overflow-hidden"
                  >
                    <span className="transition-colors duration-300">Lanjut ke Lokasi &amp; Peta</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: PILIH LAYANAN */}
          {currentStep === 1 && (!fromCatalog || editingItems) && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.08] shadow-sm space-y-6">
                <div className="border-b border-black/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading font-bold text-[#0d1526] text-xl sm:text-2xl tracking-tight">
                      Pilih Item yang Ingin Dicuci
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Klik tanda plus (+) untuk menambah kuantitas sepatu, tas, atau topi.
                    </p>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-[#f2ece5]/70 p-1.5 rounded-2xl border border-black/[0.06] self-start sm:self-auto">
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'shoes', label: 'Sepatu' },
                      { id: 'bag', label: 'Tas' },
                      { id: 'accessories', label: 'Aksesoris' },
                    ].map((cat) => {
                      const isActive = categoryFilter === cat.id;
                      const count = Object.values(selectedItems)
                        .filter((item) => cat.id === 'all' || item.category === cat.id)
                        .reduce((sum, item) => sum + item.quantity, 0);

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryFilter(cat.id as any)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#0d1526] text-white shadow-xs'
                              : 'text-neutral-600 hover:text-[#0d1526] hover:bg-white/60'
                          }`}
                        >
                          <span>{cat.label}</span>
                          {count > 0 && (
                            <span
                              className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                                isActive ? 'bg-[#f06a60] text-white' : 'bg-[#0d1526] text-white'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {loadingServices ? (
                  <div className="py-12 text-center text-neutral-400 text-xs">
                    Memuat katalog layanan...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredServices.map((srv) => {
                      const qty = selectedItems[srv.id]?.quantity || 0;
                      return (
                        <div
                          key={srv.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                            qty > 0
                              ? 'border-[#f06a60] bg-[#fff8f8] ring-1 ring-[#f06a60]/20'
                              : 'border-black/[0.08] hover:border-black/20 bg-white'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 bg-[#f2ece5] px-2.5 py-0.5 rounded-full">
                                {srv.category}
                              </span>
                              <span className="text-[11px] text-neutral-500 font-medium">
                                ⏱ {srv.estimatedDays}
                              </span>
                            </div>
                            <h3 className="font-heading font-bold text-[#0d1526] text-base sm:text-lg leading-tight">
                              {srv.name}
                            </h3>
                            <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                              {srv.description}
                            </p>
                          </div>

                          <div className="pt-3 mt-3 border-t border-black/[0.05] flex items-center justify-between gap-3">
                            <div className="text-sm font-heading font-bold text-[#f06a60]">
                              {formatRupiah(srv.price)} <span className="text-neutral-400 text-xs font-normal font-body">/ item</span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(srv, -1)}
                                disabled={qty === 0}
                                className="w-9 h-9 rounded-full border border-black/20 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-25 transition-all cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center font-heading font-bold text-base text-[#0d1526]">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(srv, 1)}
                                className="w-9 h-9 rounded-full bg-[#0d1526] hover:bg-[#f06a60] text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Notes per item */}
                          {qty > 0 && (
                            <div className="mt-3 pt-3 border-t border-black/[0.06]">
                              <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                                Catatan Khusus Sepatu / Warna / Ukuran:
                              </label>
                              <input
                                type="text"
                                value={selectedItems[srv.id]?.itemNotes || ''}
                                onChange={(e) => handleItemNotesChange(srv.id, e.target.value)}
                                placeholder="Contoh: Nike Dunk Low Panda size 42, sol sedikit menguning"
                                className="w-full text-xs px-3 py-2 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-[#f06a60]"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-black/[0.08] shadow-xs">
                <div>
                  <span className="text-xs text-neutral-400 block font-bold uppercase">
                    Subtotal Pesanan:
                  </span>
                  <span className="font-heading font-bold text-2xl text-[#000000]">
                    {formatRupiah(subtotal)}
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    ({totalItemsCount} item dipilih)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingItems(false);
                    setCurrentStep(2);
                  }}
                  disabled={!canProceedStep1}
                  className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#000000] text-white font-heading font-bold text-base sm:text-[18px] tracking-normal uppercase px-8 py-4 rounded-full disabled:opacity-40 transition-all shadow-md active:scale-98"
                >
                  <span>Lanjut ke Alamat</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOKASI & ALAMAT */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.08] shadow-sm space-y-6">
                <div className="border-b border-black/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="font-heading font-bold text-[#0d1526] text-xl sm:text-2xl tracking-tight">
                      Alamat & Titik Penjemputan
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Tentukan koordinat titik rumah Anda agar kurir dapat menjemput tepat waktu.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-[#f06a60]/10 text-[#f06a60] border border-[#f06a60]/30 w-fit">
                    Radius 20 km Free
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Nama Lengkap Anda *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Dimas Prasetyo"
                      className="w-full text-sm px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Nomor WhatsApp Aktif * (untuk koordinasi kurir)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full text-sm px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Kota / Wilayah Layanan *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setDistrict('');
                      }}
                      className="w-full text-sm px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-white font-medium"
                    >
                      {COVERAGE_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Kecamatan *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-sm px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-white font-medium"
                    >
                      <option value="">-- Pilih Kecamatan --</option>
                      {COVERAGE_AREAS[city as keyof typeof COVERAGE_AREAS]?.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Alamat Lengkap (Jalan, No. Rumah, RT/RW, Cluster) *
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Contoh: Jl. Maleo Blok JB 3 No. 12, Sektor 9 Bintaro Jaya"
                    className="w-full text-sm px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Patokan Rumah (Opsional)
                  </label>
                  <input
                    type="text"
                    value={addressNotes}
                    onChange={(e) => setAddressNotes(e.target.value)}
                    placeholder="Contoh: Pagar hitam depan lapangan badminton"
                    className="w-full text-sm px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-white"
                  />
                </div>

                {/* Map Picker Component */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 mb-2">
                    <MapPin className="w-4 h-4 text-[#f06a60]" />
                    Tentukan Titik Pinpoint Rumah Anda di Peta:
                  </label>
                  <MapPicker
                    initialLat={latitude}
                    initialLng={longitude}
                    onLocationChange={handleLocationChange}
                  />
                </div>

                {!eligibility.allowed && (
                  <div className="p-4 bg-[#fff5f5] rounded-2xl border border-[#f06a60]/30 text-[#f06a60] text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Perhatian: Syarat Minimal Order Antar-Jemput
                    </div>
                    <p className="leading-relaxed text-neutral-800">{eligibility.message}</p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="font-bold underline text-[#f06a60] pt-1 block"
                    >
                      ← Tambah sepatu atau tas di Step 1
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-black/[0.08] shadow-xs">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold uppercase tracking-normal text-neutral-600 hover:text-black px-5 py-3 rounded-full hover:bg-[#f2ece5]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedStep2}
                  className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#000000] text-white font-heading font-bold text-base sm:text-[18px] tracking-normal uppercase px-8 py-4 rounded-full disabled:opacity-40 transition-all shadow-md active:scale-98"
                >
                  <span>Lanjut ke Jadwal</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: JADWAL JEMPUT & CUT-OFF */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.08] shadow-sm space-y-6">
                <div className="border-b border-black/[0.06] pb-4">
                  <h2 className="font-heading font-bold text-[#0d1526] text-xl sm:text-2xl tracking-tight">
                    Pilih Hari & Slot Jam Penjemputan
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Kurir Fice Shoes Care menjemput setiap hari pukul 09.00 - 18.00 WIB.
                  </p>
                </div>

                <div className="p-4 bg-[#f2ece5] border border-black/[0.06] rounded-2xl text-xs flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#f06a60] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5 text-[#000000]">
                      Aturan Penjemputan Cepat (Cut-Off 13.00 WIB):
                    </strong>
                    <span className="text-neutral-600">
                      Order sebelum jam 13.00 WIB bisa dijemput di hari yang sama (Slot Siang/Sore). Di atas jam 13.00 WIB, opsi jemput tercepat dimulai besok (H+1).
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 block">
                    Pilih Hari Penjemputan:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableDates.map((item) => (
                      <button
                        key={item.date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(item.date);
                          if (!item.availableSlots.includes(selectedSlot)) {
                            setSelectedSlot(item.availableSlots[0]);
                          }
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          selectedDate === item.date
                            ? 'border-[#f06a60] bg-[#fff8f8] ring-2 ring-[#f06a60]/20 shadow-xs'
                            : 'border-black/[0.08] hover:border-black/20 bg-white'
                        }`}
                      >
                        <span className="text-xs font-bold block text-[#000000]">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-1 block font-semibold">
                          {item.isToday ? 'Slot Terbatas' : 'Tersedia'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slots */}
                <div className="space-y-2 pt-3">
                  <label className="text-xs font-bold text-neutral-700 block">
                    Pilih Slot Jam Penjemputan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={availableDates.find((d) => d.date === selectedDate)?.isToday}
                      onClick={() => setSelectedSlot('morning')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedSlot === 'morning'
                          ? 'border-[#f06a60] bg-[#fff8f8] ring-2 ring-[#f06a60]/20'
                          : 'border-black/[0.08] hover:border-black/20 bg-white disabled:opacity-30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-sm text-[#000000]">
                          Slot Pagi / Siang
                        </span>
                        <span className="text-[11px] font-bold text-[#000000] bg-[#f2ece5] px-2.5 py-0.5 rounded-full">
                          09.00 - 13.00 WIB
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Penjemputan sebelum istirahat siang.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSlot('afternoon')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedSlot === 'afternoon'
                          ? 'border-[#f06a60] bg-[#fff8f8] ring-2 ring-[#f06a60]/20'
                          : 'border-black/[0.08] hover:border-black/20 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-sm text-[#000000]">
                          Slot Siang / Sore
                        </span>
                        <span className="text-[11px] font-bold text-[#000000] bg-[#f2ece5] px-2.5 py-0.5 rounded-full">
                          14.00 - 18.00 WIB
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Penjemputan santai di sore hari.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-black/[0.08] shadow-xs">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold uppercase tracking-normal text-neutral-600 hover:text-black px-5 py-3 rounded-full hover:bg-[#f2ece5]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#000000] text-white font-heading font-bold text-base sm:text-[18px] tracking-normal uppercase px-8 py-4 rounded-full transition-all shadow-md active:scale-98"
                >
                  <span>Lanjut ke Pembayaran</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PEMBAYARAN & REVIEW */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.08] shadow-sm space-y-6">
                <div className="border-b border-black/[0.06] pb-4">
                  <h2 className="font-heading font-bold text-[#0d1526] text-xl sm:text-2xl tracking-tight">
                    Pembayaran
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Satu metode, satu kali bayar, dengan rekening resmi yang bisa dicek.
                  </p>
                </div>

                <div className="p-6 rounded-3xl border-2 border-[#f06a60] bg-[#fff8f8] ring-2 ring-[#f06a60]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#f06a60] text-white flex items-center justify-center font-heading font-bold text-sm shrink-0">
                      <CreditCard className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="font-heading font-bold text-[#0d1526] text-base">
                      Transfer Bank Setelah Verifikasi di Workshop
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Sepatu dijemput, tiba di workshop, kondisi fisiknya dicek dan difoto QC awal.
                    Tagihan resmi terbit di halaman lacak pesanan, Anda bayar via transfer ke rekening
                    BCA yang tertera di sana, lalu pengerjaan dimulai.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Catatan untuk Kurir (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Contoh: Tolong bawa kantong tambahan karena sedang hujan."
                    className="w-full text-sm px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-white"
                  />
                </div>

                {/* PROMO CODE SECTION */}
                <div className="p-5 bg-white rounded-3xl border border-black/[0.08] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#f06a60]" />
                      Punya Kode Promo / Voucher?
                    </label>
                    {appliedPromo && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Voucher Digunakan
                      </span>
                    )}
                  </div>

                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => {
                            setPromoCodeInput(e.target.value.toUpperCase());
                            setPromoError(null);
                          }}
                          placeholder="Masukkan Kode Promo (cth: FICEBARU)"
                          className="w-full text-xs font-mono font-bold uppercase pl-9 pr-3 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-[#fdf8f1]"
                        />
                        <Ticket className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCodeInput.trim()}
                        className="bg-[#0d1526] hover:bg-[#f06a60] text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all disabled:opacity-40 cursor-pointer shrink-0"
                      >
                        {promoLoading ? 'Mengecek...' : 'Terapkan'}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-emerald-900">
                              {appliedPromo.code}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700">
                              Hemat {formatRupiah(appliedPromo.discountAmount)}
                            </span>
                          </div>
                          {appliedPromo.description && (
                            <p className="text-[10px] text-emerald-600 line-clamp-1">
                              {appliedPromo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-xs text-neutral-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Batalkan Promo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {promoError && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {promoError}
                    </p>
                  )}
                  {promoSuccess && !promoError && (
                    <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {promoSuccess}
                    </p>
                  )}
                </div>

                {/* Final Recap */}
                <div className="p-5 bg-[#fdf8f1] rounded-3xl border border-black/[0.08] space-y-3">
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-500">
                    Ringkasan Akhir Pesanan
                  </h4>

                  <div className="space-y-1.5 text-xs">
                    {selectedItemsArray.map((i) => (
                      <div key={i.serviceId} className="flex justify-between text-neutral-700">
                        <span>
                          {i.serviceName} ({i.quantity}x)
                        </span>
                        <span className="font-bold">{formatRupiah(i.price * i.quantity)}</span>
                      </div>
                    ))}

                    <div className="flex justify-between text-neutral-600 pt-2 border-t border-black/[0.06]">
                      <span>Subtotal Perawatan:</span>
                      <span className="font-bold">{formatRupiah(subtotal)}</span>
                    </div>

                    {appliedPromo && discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> Diskon Promo ({appliedPromo.code}):
                        </span>
                        <span>-{formatRupiah(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#f06a60] font-bold">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> Biaya Antar-Jemput ({distanceKm} km):
                      </span>
                      <span className="bg-[#f06a60]/10 text-[#f06a60] px-2.5 py-0.5 rounded-full text-[11px]">
                        100% GRATIS
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-heading font-bold text-[#0d1526] pt-2 border-t border-black/[0.06]">
                      <span>Total Pembayaran:</span>
                      <div className="text-right">
                        {discountAmount > 0 && (
                          <span className="text-xs text-neutral-400 line-through mr-2 font-normal">
                            {formatRupiah(subtotal)}
                          </span>
                        )}
                        <span className="text-[#f06a60]">{formatRupiah(finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-neutral-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#f06a60] shrink-0" />
                    <span>
                      Jadwal Jemput: <strong>{selectedDate}</strong> (
                      {selectedSlot === 'morning' ? '09.00 - 13.00' : '14.00 - 18.00'})
                    </span>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {submitError}
                  </div>
                )}
              </div>

              {/* Step 4 Actions */}
              <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-black/[0.08] shadow-xs">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold uppercase tracking-normal text-neutral-600 hover:text-black px-5 py-3 rounded-full hover:bg-[#f2ece5] disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-[#f06a60] hover:bg-[#000000] text-white font-heading font-bold text-base sm:text-lg lg:text-[19px] tracking-normal uppercase px-9 py-4.5 rounded-full shadow-lg transition-all active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Memproses Pesanan...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Konfirmasi &amp; Buat Pesanan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
