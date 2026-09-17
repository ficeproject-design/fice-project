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

    // Action: Update Order Status
    if (action === 'update_status') {
      const valid: OrderStatus[] = [
        'WAITING_PICKUP', 'PICKING_UP', 'IN_WORKSHOP', 'IN_PROGRESS',
        'READY_TO_DELIVER', 'DELIVERING', 'COMPLETED', 'CANCELLED',
      ];
      if (valid.includes(status)) {
        updatedOrder = updateOrderStatus(id, status);
      }
    }
    // Action: Update Payment Status
    else if (action === 'update_payment') {
      if (paymentStatus === 'PAID' || paymentStatus === 'UNPAID') {
        updatedOrder = updatePaymentStatus(id, paymentStatus, paymentMethod);
      }
    }
    // Action: Add QC Photo
    else if (action === 'add_qc_photo') {
      if (
        qcPhoto &&
        (qcPhoto.type === 'BEFORE' || qcPhoto.type === 'AFTER') &&
        typeof qcPhoto.photoUrl === 'string' &&
        qcPhoto.photoUrl.length > 0 &&
        qcPhoto.photoUrl.length < 2_000_000
      ) {
        updatedOrder = addQCPhoto(id, {
          type: qcPhoto.type,
          photoUrl: qcPhoto.photoUrl,
          notes:
            typeof qcPhoto.notes === 'string'
              ? qcPhoto.notes.trim().slice(0, 300) || undefined
              : undefined,
        });
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
