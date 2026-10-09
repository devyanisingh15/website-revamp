import { wait } from './mock';
import { readJSON, writeJSON } from '../storage';
import type { CartLine } from '../cart';

/**
 * ORDER + PAYMENT SERVICE — MOCK. No payment is taken and no order is sent
 * anywhere. Orders are stored in this browser only so tracking can be demoed.
 * Paying with UPI ID "fail@upi" simulates a failed payment.
 */
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'out-for-delivery' | 'delivered';

export const ORDER_STATUSES: { id: OrderStatus; label: string }[] = [
  { id: 'placed', label: 'Order placed' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'out-for-delivery', label: 'Out for delivery' },
  { id: 'delivered', label: 'Delivered' },
];

export interface Address {
  name: string;
  phone: string;
  pincode: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  createdAt: string;
  eta: string;
  status: OrderStatus;
  lines: CartLine[];
  total: number;
  address: Address;
  payment: PaymentMethod;
}

const KEY = 'mb.orders';

export const DEMO_FAIL_UPI = 'fail@upi';

export async function placeOrder(input: Omit<Order, 'id' | 'createdAt' | 'eta' | 'status'>, upiId?: string): Promise<Order> {
  await wait(1400);
  if (input.payment === 'upi' && upiId?.trim().toLowerCase() === DEMO_FAIL_UPI) {
    throw new Error('payment-failed');
  }
  const eta = new Date();
  eta.setDate(eta.getDate() + 3);
  const order: Order = {
    ...input,
    id: `MB${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toISOString(),
    eta: eta.toISOString(),
    status: 'placed',
  };
  writeJSON(KEY, [order, ...listOrders()]);
  return order;
}

export function listOrders(): Order[] {
  return readJSON<Order[]>(KEY, []);
}

export async function findOrder(id: string): Promise<Order | null> {
  await wait(600);
  const clean = id.trim().toUpperCase().replace(/^#/, '');
  const found = listOrders().find((o) => o.id === clean);
  if (found) return found;
  // MOCK — demo order for showing a mid-journey tracking state
  if (clean === 'MBDEMO123') {
    const placed = new Date();
    placed.setDate(placed.getDate() - 2);
    const eta = new Date();
    eta.setDate(eta.getDate() + 1);
    return {
      id: 'MBDEMO123',
      createdAt: placed.toISOString(),
      eta: eta.toISOString(),
      status: 'shipped',
      lines: [
        { key: 'biozyme-performance-whey|rich-milk-chocolate|1kg', productId: 'biozyme-performance-whey', flavourId: 'rich-milk-chocolate', sizeId: '1kg', qty: 1 },
        { key: 'creatine-monohydrate|unflavoured|250g', productId: 'creatine-monohydrate', flavourId: 'unflavoured', sizeId: '250g', qty: 1 },
      ],
      total: 3198,
      address: { name: 'Rohan Verma', phone: '9876501234', pincode: '411045', line1: 'Flat 12B, Sai Residency', line2: 'Baner Road', city: 'Pune', state: 'Maharashtra' },
      payment: 'upi',
    };
  }
  return null;
}
