import type { OrderStatus } from './types.ts';

/** Langkah maju/mundur yang diizinkan. Status terminal tidak punya jalan keluar. */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  WAITING_PICKUP: ['PICKING_UP', 'CANCELLED'],
  PICKING_UP: ['IN_WORKSHOP', 'WAITING_PICKUP', 'CANCELLED'],
  IN_WORKSHOP: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['READY_TO_DELIVER', 'CANCELLED'],
  READY_TO_DELIVER: ['DELIVERING', 'CANCELLED'],
  DELIVERING: ['COMPLETED', 'READY_TO_DELIVER'],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return (ALLOWED_TRANSITIONS[from] || []).includes(to);
}
