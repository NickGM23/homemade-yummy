import { describe, expect, it } from 'vitest';
import { resolveOrdersScope } from './orders-scope';

describe('resolveOrdersScope', () => {
  it('never gives a non-admin the "all" scope, even when asked', () => {
    expect(resolveOrdersScope('all', false)).toBe('mine');
    expect(resolveOrdersScope(undefined, false)).toBe('mine');
    expect(resolveOrdersScope('mine', false)).toBe('mine');
  });

  it('defaults an admin to "all"', () => {
    expect(resolveOrdersScope(undefined, true)).toBe('all');
    expect(resolveOrdersScope('all', true)).toBe('all');
    expect(resolveOrdersScope('garbage', true)).toBe('all');
  });

  it('lets an admin switch to "mine"', () => {
    expect(resolveOrdersScope('mine', true)).toBe('mine');
  });
});
