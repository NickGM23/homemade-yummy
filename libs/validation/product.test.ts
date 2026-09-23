import { describe, expect, it } from 'vitest';
import { productByIdsSchema } from './product';

describe('productByIdsSchema', () => {
  it('accepts a valid array of positive ints', () => {
    expect(productByIdsSchema.safeParse({ ids: [1, 2, 3] }).success).toBe(true);
  });

  it('rejects a non-array ids field', () => {
    expect(productByIdsSchema.safeParse({ ids: 'not-an-array' }).success).toBe(false);
  });

  it('rejects an empty array', () => {
    expect(productByIdsSchema.safeParse({ ids: [] }).success).toBe(false);
  });

  it('rejects an array longer than 200', () => {
    const ids = Array.from({ length: 201 }, (_, i) => i + 1);
    expect(productByIdsSchema.safeParse({ ids }).success).toBe(false);
  });

  it('rejects a negative id', () => {
    expect(productByIdsSchema.safeParse({ ids: [-1] }).success).toBe(false);
  });

  it('rejects a non-integer id', () => {
    expect(productByIdsSchema.safeParse({ ids: [1.5] }).success).toBe(false);
  });
});
