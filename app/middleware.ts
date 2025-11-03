import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  // Daftar route publik (tanpa login)
  const publicRoutes = [
    '/autentikasi/login',
    '/autentikasi/regis',
    '/autentikasi/forgot',
  ];

  const currentPath = req.nextUrl.pathname;

  // Jika belum login dan bukan halaman publik → redirect ke login
  if (!token && !publicRoutes.includes(currentPath)) {
    return NextResponse.redirect(new URL('/autentikasi/login'));
  }

  // Jika sudah login dan masih di halaman login → redirect ke dashboard
  if (token && currentPath === '/autentikasi/login') {
    return NextResponse.redirect(new URL('/dashboard'));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
