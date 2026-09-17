import React from 'react';
import { OrderStatus, PaymentStatus } from '@/lib/types';
import {
  Clock,
  Truck,
  Building2,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const configs: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    WAITING_PICKUP: {
      label: 'Menunggu Penjemputan',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-300',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    PICKING_UP: {
      label: 'Kurir Menuju Lokasi',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-300',
      icon: <Truck className="w-3.5 h-3.5 text-blue-600 animate-bounce" />,
    },
    IN_WORKSHOP: {
      label: 'Tiba di Workshop',
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      border: 'border-purple-300',
      icon: <Building2 className="w-3.5 h-3.5 text-purple-600" />,
    },
    IN_PROGRESS: {
      label: 'Sedang Dicuci / Treatment',
      bg: 'bg-red-50',
      text: 'text-[#f06a60]',
      border: 'border-[#f06a60]/30',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#f06a60] animate-spin" />,
    },
    READY_TO_DELIVER: {
      label: 'Selesai & Siap Diantar',
      bg: 'bg-teal-50',
      text: 'text-teal-900',
      border: 'border-teal-300',
      icon: <PackageCheck className="w-3.5 h-3.5 text-teal-600" />,
    },
    DELIVERING: {
      label: 'Sedang Diantar Kurir',
      bg: 'bg-cyan-50',
      text: 'text-cyan-900',
      border: 'border-cyan-300',
      icon: <Truck className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />,
    },
    COMPLETED: {
      label: 'Pesanan Selesai',
      bg: 'bg-black',
      text: 'text-white',
      border: 'border-black',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#f06a60]" />,
    },
    CANCELLED: {
      label: 'Dibatalkan',
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      border: 'border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
  };

  const config = configs[status] || configs.WAITING_PICKUP;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  if (status === 'PAID') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-[#000000] text-[#fdf8f1] border border-black">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#f06a60]" />
        LUNAS
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
      <Clock className="w-3.5 h-3.5 text-amber-700" />
      BELUM LUNAS
    </span>
  );
}
