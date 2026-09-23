import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicOrderCreate = pathname === '/api/orders' && req.method === 'POST';
  const isOrdersApiRequest = pathname.startsWith('/api/orders') && !isPublicOrderCreate;
  const isOrdersPageRequest = pathname === '/orders' || pathname.startsWith('/orders/');

  if (!isOrdersApiRequest && !isOrdersPageRequest) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (isOrdersPageRequest) {
      return NextResponse.redirect(new URL('/not-auth', req.url));
    }
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  if (token.role !== 'admin') {
    if (isOrdersPageRequest) {
      return NextResponse.redirect(new URL('/not-auth', req.url));
    }
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/api/orders/:path*'],
};
