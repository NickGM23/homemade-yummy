import { describe, expect, it } from 'vitest';
import { createOrderSchema, orderFiltersSchema } from './order';

describe('createOrderSchema', () => {
  const validPickupOrder = {
    fullName: 'Іван Іванов',
    phone: '380991234567',
    deliveryType: 'pickup' as const,
    items: [{ productId: 1, quantity: 2 }],
  };

  it('accepts a valid pickup order', () => {
    expect(createOrderSchema.safeParse(validPickupOrder).success).toBe(true);
  });

  it('rejects an empty items array', () => {
    const result = createOrderSchema.safeParse({ ...validPickupOrder, items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects deliveryType "address" without an address', () => {
    const result = createOrderSchema.safeParse({
      ...validPickupOrder,
      deliveryType: 'address',
    });
    expect(result.success).toBe(false);
  });

  it('accepts deliveryType "address" with an address', () => {
    const result = createOrderSchema.safeParse({
      ...validPickupOrder,
      deliveryType: 'address',
      address: 'вул. Хрещатик, 1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a negative quantity', () => {
    const result = createOrderSchema.safeParse({
      ...validPickupOrder,
      items: [{ productId: 1, quantity: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer productId', () => {
    const result = createOrderSchema.safeParse({
      ...validPickupOrder,
      items: [{ productId: 1.5, quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it('strips client-supplied price/amount/userId fields not part of the schema', () => {
    const result = createOrderSchema.safeParse({
      ...validPickupOrder,
      userId: 999,
      shippingAmount: 0,
      totalAmount: 999999,
      items: [{ productId: 1, quantity: 1, price: 1, amount: 1 }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('userId');
      expect(result.data).not.toHaveProperty('totalAmount');
      expect(result.data.items[0]).not.toHaveProperty('price');
    }
  });
});

describe('orderFiltersSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(orderFiltersSchema.safeParse({}).success).toBe(true);
  });

  it('rejects a limit above 100', () => {
    expect(orderFiltersSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it('rejects an invalid dateFrom format', () => {
    expect(orderFiltersSchema.safeParse({ dateFrom: 'not-a-date' }).success).toBe(false);
  });

  it('accepts a valid dateFrom format', () => {
    expect(orderFiltersSchema.safeParse({ dateFrom: '2026-01-01' }).success).toBe(true);
  });

  it('rejects an invalid status', () => {
    expect(orderFiltersSchema.safeParse({ status: 'NOT_A_STATUS' }).success).toBe(false);
  });

  it('accepts a valid status', () => {
    expect(orderFiltersSchema.safeParse({ status: 'PENDING' }).success).toBe(true);
  });
});
