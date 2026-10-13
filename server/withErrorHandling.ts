import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

type Handler = (req: Request) => Promise<NextResponse>;
type HandlersMap = {
  GET?: Handler;
  POST?: Handler;
  PUT?: Handler;
  DELETE?: Handler;
};

/**
 * Помилка, текст якої безпечно показати клієнту. Кидайте її з route handler-а, коли запит
 * некоректний через дані клієнта (а не через збій сервера) — буде відповідь `{ message }`
 * з вказаним статусом замість загального 500.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// Відомі помилки Prisma, які спричинені даними запиту, а не збоєм сервера. Повідомлення
// навмисно загальні: `error.meta` містить назви таблиць/колонок і клієнту не віддається.
const PRISMA_ERROR_RESPONSES: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: 'Record already exists' },
  P2003: { status: 409, message: 'Related record constraint failed' },
  P2025: { status: 404, message: 'Record not found' },
};

function toErrorResponse(method: string, error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: 'Validation error', errors: error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  // `req.json()` на некоректному тілі запиту.
  if (error instanceof SyntaxError) {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_RESPONSES[error.code];
    if (mapped) {
      console.error(`[${method}_ERROR] ${error.code}`, error);
      return NextResponse.json({ message: mapped.message }, { status: mapped.status });
    }
  }

  console.error(`[${method}_ERROR]`, error);
  return NextResponse.json({ message: 'Server error' }, { status: 500 });
}

export function withErrorHandling<T extends HandlersMap>(handlers: T): T {
  const wrappedHandlers = {} as T;

  for (const method of Object.keys(handlers) as (keyof T)[]) {
    const handler = handlers[method] as Handler | undefined;
    if (!handler) continue;

    wrappedHandlers[method] = (async (req: Request) => {
      try {
        return await handler(req);
      } catch (error) {
        return toErrorResponse(String(method), error);
      }
    }) as T[keyof T];
  }

  return wrappedHandlers;
}
