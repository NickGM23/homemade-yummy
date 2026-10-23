import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Публічне створення замовлення тепер іде через /api/checkout/* (після SMS-підтвердження),
  // тому весь /api/orders/** — лише для адміна, без винятків. Сторінка /orders — для будь-якого
  // авторизованого (див. нижче).
  const isOrdersApiRequest = pathname.startsWith('/api/orders');
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

  // Сторінка /orders відкрита для кожного авторизованого: клієнт бачить лише свої замовлення,
  // а вкладку «Всі» сторінка віддає тільки адміну (перевірка по БД у app/(site)/orders/page.tsx).
  if (isOrdersPageRequest) {
    return NextResponse.next();
  }

  if (token.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/api/orders/:path*'],
};
