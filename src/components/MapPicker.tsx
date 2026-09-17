'use client';

import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search, Check, AlertCircle, Info } from 'lucide-react';
import { calculateDistanceKm, DEFAULT_WORKSHOP_COORDS } from '@/lib/haversine';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number, distanceKm: number) => void;
  workshopLat?: number;
  workshopLng?: number;
  freeRadiusKm?: number;
}

export default function MapPicker({
  initialLat = DEFAULT_WORKSHOP_COORDS.lat,
  initialLng = DEFAULT_WORKSHOP_COORDS.lng,
  onLocationChange,
  workshopLat = DEFAULT_WORKSHOP_COORDS.lat,
  workshopLng = DEFAULT_WORKSHOP_COORDS.lng,
  freeRadiusKm = 20,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);

  const [customerPos, setCustomerPos] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [distanceKm, setDistanceKm] = useState<number>(() =>
    calculateDistanceKm(workshopLat, workshopLng, initialLat, initialLng)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current).setView(
        [customerPos.lat, customerPos.lng],
        12
      );
      mapInstanceRef.current = map;

      // CartoDB Positron / OSM tiles matching warm style
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Workshop custom icon (Fice Black & Red)
      const workshopIcon = L.divIcon({
        className: 'custom-workshop-icon',
        html: `<div style="background:#000000;color:#f06a60;padding:6px;border-radius:12px;border:2px solid #f06a60;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Customer custom icon (Fice Red Pin)
      const customerIcon = L.divIcon({
        className: 'custom-customer-icon',
        html: `<div style="background:#f06a60;color:#ffffff;padding:6px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 4px 14px rgba(240,106,96,0.5);display:flex;align-items:center;justify-content:center;width:38px;height:38px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
      });

      // Add Workshop Marker & 20km Free Radius Circle
      L.marker([workshopLat, workshopLng], { icon: workshopIcon })
        .addTo(map)
        .bindPopup(
          `<strong>Workshop Fice Shoes Care</strong><br/>${DEFAULT_WORKSHOP_COORDS.address}`
        );

      L.circle([workshopLat, workshopLng], {
        radius: freeRadiusKm * 1000,
        color: '#f06a60',
        weight: 2,
        fillColor: '#f06a60',
        fillOpacity: 0.07,
        dashArray: '6, 6',
      })
        .addTo(map)
        .bindTooltip(`Radius Free Antar-Jemput (${freeRadiusKm} km)`);

      // Add Customer Marker (Draggable)
      const customerMarker = L.marker([customerPos.lat, customerPos.lng], {
        icon: customerIcon,
        draggable: true,
      }).addTo(map);
      customerMarkerRef.current = customerMarker;

      customerMarker.on('dragend', (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        handleUpdatePosition(lat, lng);
      });

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        customerMarker.setLatLng([lat, lng]);
        handleUpdatePosition(lat, lng);
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [workshopLat, workshopLng, freeRadiusKm]);

  const handleUpdatePosition = (lat: number, lng: number) => {
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    const dist = calculateDistanceKm(workshopLat, workshopLng, roundedLat, roundedLng);
    setCustomerPos({ lat: roundedLat, lng: roundedLng });
    setDistanceKm(dist);
    onLocationChange(roundedLat, roundedLng, dist);
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ', Indonesia'
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        if (mapInstanceRef.current && customerMarkerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
          customerMarkerRef.current.setLatLng([lat, lng]);
        }
        handleUpdatePosition(lat, lng);
      } else {
        setSearchError('Alamat tidak ditemukan. Coba ketik nama jalan utama atau klik peta.');
      }
    } catch (err) {
      console.error('Error searching address:', err);
      setSearchError('Gagal mencari alamat. Silakan klik langsung pada peta.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Browser Anda tidak mendukung deteksi lokasi otomatis.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current && customerMarkerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
          customerMarkerRef.current.setLatLng([lat, lng]);
        }
        handleUpdatePosition(lat, lng);
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setSearchError('Izin akses lokasi ditolak atau tidak tersedia.');
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const isWithinRadius = distanceKm <= freeRadiusKm;

  return (
    <div className="space-y-3">
      {/* Search and Locate Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchAddress} className="flex-1 relative flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik nama jalan, perumahan, atau mall (misal: Bintaro Plaza)..."
            className="w-full text-xs pl-9 pr-24 py-3 rounded-full border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#f06a60] bg-white shadow-xs"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#000000] hover:bg-[#f06a60] text-white rounded-full text-xs font-bold transition-all disabled:opacity-50"
          >
            {isSearching ? 'Mencari...' : 'Cari'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-[#f2ece5] text-[#000000] border border-black/10 hover:bg-[#e8dfd5] rounded-full text-xs font-bold transition-all disabled:opacity-50 shrink-0"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Mendeteksi...' : 'Lokasi Saya'}
        </button>
      </div>

      {searchError && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {searchError}
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-3xl overflow-hidden border border-black/10 shadow-sm">
        <div ref={mapContainerRef} className="w-full h-80 z-0" />

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 z-10 bg-[#fdf8f1]/95 backdrop-blur-xs p-3 rounded-2xl border border-black/10 text-[11px] shadow-sm space-y-1.5 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#000000] border border-[#f06a60] inline-block"></span>
            <span>Workshop Fice Shoes Care</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#f06a60] border-2 border-white inline-block"></span>
            <span>Titik Jemput Anda (Bisa Digeser)</span>
          </div>
        </div>

        {/* Floating Distance Badge */}
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-full border border-black/10 text-xs shadow-md">
          <div className="font-bold text-[#000000] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#f06a60]" />
            Jarak: <span className="text-[#f06a60] font-black">{distanceKm} km</span>
          </div>
        </div>
      </div>

      {/* Distance feedback alert */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          isWithinRadius
            ? 'bg-white border-[#f06a60]/30 text-[#000000]'
            : 'bg-[#fff5f5] border-[#f06a60]/40 text-[#f06a60]'
        }`}
      >
        {isWithinRadius ? (
          <Check className="w-4 h-4 text-[#f06a60] shrink-0 mt-0.5" />
        ) : (
          <Info className="w-4 h-4 text-[#f06a60] shrink-0 mt-0.5" />
        )}
        <div>
          {isWithinRadius ? (
            <p>
              <strong>Jarak {distanceKm} km (Dalam Radius 20 km):</strong> Anda berhak mendapatkan layanan <strong>100% Free Antar-Jemput</strong> untuk berapapun jumlah sepatu/tas yang dicuci!
            </p>
          ) : (
            <p>
              <strong>Jarak {distanceKm} km (Di atas Radius 20 km):</strong> Layanan Free Antar-Jemput tetap berlaku dengan syarat <strong>minimal 3 item</strong> di keranjang pesanan.
            </p>
          )}
          <p className="text-[11px] opacity-75 mt-1">
            * Tips: Geser pin merah di peta atau klik titik mana saja pada peta untuk menyesuaikan lokasi rumah Anda secara presisi.
          </p>
        </div>
      </div>
    </div>
  );
}
