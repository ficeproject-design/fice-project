import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  getOrderByInvoice,
  updateOrderStatus,
  updatePaymentStatus,
  addQCPhoto,
  deleteQCPhoto,
  updateCustomerReview,
} from '@/lib/db';
import type { OrderStatus } from '@/lib/types';

/** Allowed forward/backward steps. Terminal states have no outgoing edges. */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  WAITING_PICKUP: ['PICKING_UP', 'CANCELLED'],
  PICKING_UP: ['IN_WORKSHOP', 'WAITING_PICKUP', 'CANCELLED'],
  IN_WORKSHOP: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['READY_TO_DELIVER', 'CANCELLED'],
  READY_TO_DELIVER: ['DELIVERING', 'CANCELLED'],
  DELIVERING: ['COMPLETED', 'READY_TO_DELIVER'],
  COMPLETED: [],
  CANCELLED: [],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let order = getOrderById(id);
    if (!order) {
      order = getOrderByInvoice(id);
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat pesanan' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, status, paymentStatus, paymentMethod, qcPhoto, photoId, review } = body;

    let updatedOrder = null;

    // Action: Update Order Status (guarded transitions)
    if (action === 'update_status') {
      const valid: OrderStatus[] = [
        'WAITING_PICKUP', 'PICKING_UP', 'IN_WORKSHOP', 'IN_PROGRESS',
        'READY_TO_DELIVER', 'DELIVERING', 'COMPLETED', 'CANCELLED',
      ];
      if (valid.includes(status)) {
        const current = getOrderById(id);
        if (!current) {
          return NextResponse.json(
            { success: false, error: 'Pesanan tidak ditemukan' },
            { status: 404 }
          );
        }
        const allowed = ALLOWED_TRANSITIONS[current.status] || [];
        if (!allowed.includes(status)) {
          return NextResponse.json(
            {
              success: false,
              error: `Transisi status ${current.status} → ${status} tidak diizinkan.`,
            },
            { status: 400 }
          );
        }
        if (status === 'CANCELLED' && current.paymentStatus === 'PAID') {
          return NextResponse.json(
            {
              success: false,
              error:
                'Pesanan yang sudah dibayar (PAID) tidak bisa dibatalkan. Refund manual dulu bila perlu.',
            },
            { status: 400 }
          );
        }
        if (status === 'COMPLETED' && current.paymentStatus !== 'PAID') {
          return NextResponse.json(
            {
              success: false,
              error:
                'Pesanan belum dibayar (UNPAID) tidak bisa ditandai COMPLETED. Verifikasi pembayaran dulu.',
            },
            { status: 400 }
          );
        }
        updatedOrder = updateOrderStatus(id, status);
      }
    }
    // Action: Update Payment Status (no downgrade, whitelisted method)
    else if (action === 'update_payment') {
      if (paymentStatus === 'PAID' || paymentStatus === 'UNPAID') {
        const current = getOrderById(id);
        if (!current) {
          return NextResponse.json(
            { success: false, error: 'Pesanan tidak ditemukan' },
            { status: 404 }
          );
        }
        if (current.paymentStatus === 'PAID' && paymentStatus === 'UNPAID') {
          return NextResponse.json(
            {
              success: false,
              error:
                'Status PAID tidak bisa diturunkan ke UNPAID (jejak audit). Buat penyesuaian manual bila perlu.',
            },
            { status: 400 }
          );
        }
        const allowedMethods = ['QRIS', 'TRANSFER', 'COD'] as const;
        const safeMethod: (typeof allowedMethods)[number] | undefined =
          typeof paymentMethod === 'string' &&
          (allowedMethods as readonly string[]).includes(paymentMethod)
            ? (paymentMethod as (typeof allowedMethods)[number])
            : undefined;
        updatedOrder = updatePaymentStatus(id, paymentStatus, safeMethod);
      }
    }
    // Action: Add QC Photo (data URL dikonversi ke file oleh db.ts, bukan inline base64)
    else if (action === 'add_qc_photo') {
      if (
        qcPhoto &&
        (qcPhoto.type === 'BEFORE' || qcPhoto.type === 'AFTER') &&
        typeof qcPhoto.photoUrl === 'string' &&
        qcPhoto.photoUrl.startsWith('data:') &&
        qcPhoto.photoUrl.length < 7_000_000
      ) {
        try {
          updatedOrder = addQCPhoto(id, {
            type: qcPhoto.type,
            photoUrl: qcPhoto.photoUrl,
            notes:
              typeof qcPhoto.notes === 'string'
                ? qcPhoto.notes.trim().slice(0, 300) || undefined
                : undefined,
          });
        } catch (validationError) {
          return NextResponse.json(
            {
              success: false,
              error:
                validationError instanceof Error
                  ? validationError.message
                  : 'Foto QC tidak valid',
            },
            { status: 400 }
          );
        }
      }
    }
    // Action: Remove QC Photo
    else if (action === 'remove_qc_photo' && typeof photoId === 'string') {
      updatedOrder = deleteQCPhoto(id, photoId);
    }
    // Action: Update Customer Review Text
    else if (action === 'update_review' && typeof review === 'string') {
      updatedOrder = updateCustomerReview(id, review);
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan atau aksi tidak valid' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Pesanan berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui pesanan' },
      { status: 500 }
    );
  }
}
