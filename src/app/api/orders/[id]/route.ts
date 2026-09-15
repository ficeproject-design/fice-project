import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  getOrderByInvoice,
  updateOrderStatus,
  updatePaymentStatus,
  addQCPhoto,
} from '@/lib/db';

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
    const { action, status, paymentStatus, paymentMethod, qcPhoto } = body;

    let updatedOrder = null;

    // Action: Update Order Status
    if (action === 'update_status' && status) {
      updatedOrder = updateOrderStatus(id, status);
    }
    // Action: Update Payment Status
    else if (action === 'update_payment' && paymentStatus) {
      updatedOrder = updatePaymentStatus(id, paymentStatus, paymentMethod);
    }
    // Action: Add QC Photo
    else if (action === 'add_qc_photo' && qcPhoto) {
      updatedOrder = addQCPhoto(id, qcPhoto);
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
