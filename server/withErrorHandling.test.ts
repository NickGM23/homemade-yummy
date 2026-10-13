import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { HttpError, withErrorHandling } from './withErrorHandling';

const req = new Request('http://localhost/api/test', { method: 'POST' });

function run(fn: (req: Request) => Promise<NextResponse>) {
  return withErrorHandling({ POST: fn }).POST(req);
}

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('boom', { code, clientVersion: 'test' });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('withErrorHandling', () => {
  it('passes a successful response through untouched', async () => {
    const res = await run(async () => NextResponse.json({ ok: true }, { status: 201 }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('maps ZodError to 400 with field errors', async () => {
    const res = await run(async () => {
      z.object({ name: z.string() }).parse({});
      return NextResponse.json({});
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      message: 'Validation error',
      errors: { name: expect.any(Array) },
    });
  });

  it('maps HttpError to its own status and message', async () => {
    const res = await run(async () => {
      throw new HttpError(418, 'teapot');
    });
    expect(res.status).toBe(418);
    expect(await res.json()).toEqual({ message: 'teapot' });
  });

  it('maps a malformed JSON body (SyntaxError) to 400', async () => {
    const res = await run(async () => {
      await new Request('http://localhost/api/test', { method: 'POST', body: '{nope' }).json();
      return NextResponse.json({});
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: 'Invalid JSON body' });
  });

  it.each([
    ['P2002', 409],
    ['P2003', 409],
    ['P2025', 404],
  ])('maps Prisma %s to %i without leaking details', async (code, status) => {
    const res = await run(async () => {
      throw prismaError(code);
    });
    expect(res.status).toBe(status);
    expect(JSON.stringify(await res.json())).not.toContain('boom');
  });

  it('keeps unmapped Prisma errors and unknown errors as a generic 500', async () => {
    for (const error of [prismaError('P1001'), new Error('db password is hunter2')]) {
      const res = await run(async () => {
        throw error;
      });
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ message: 'Server error' });
    }
  });
});
