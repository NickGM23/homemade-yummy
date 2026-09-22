import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

type Handler = (req: Request) => Promise<NextResponse>;
type HandlersMap = {
  GET?: Handler;
  POST?: Handler;
  PUT?: Handler;
  DELETE?: Handler;
};

export function withErrorHandling(handlers: HandlersMap) {
  const wrappedHandlers: HandlersMap = {};

  for (const method of Object.keys(handlers) as (keyof HandlersMap)[]) {
    const handler = handlers[method];
    if (!handler) continue;

    wrappedHandlers[method] = async (req: Request) => {
      try {
        return await handler(req);
      } catch (error) {
        if (error instanceof ZodError) {
          return NextResponse.json(
            { message: 'Validation error', errors: error.flatten().fieldErrors },
            { status: 400 },
          );
        }

        console.error(`[${method}_ERROR]`, error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
      }
    };
  }

  return wrappedHandlers;
}
