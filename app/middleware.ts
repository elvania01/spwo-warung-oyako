import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;

  // Halaman yang membutuhkan login
  const mustLogin =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/owner") ||
    req.nextUrl.pathname.startsWith("/kasir") ||
    req.nextUrl.pathname.startsWith("/inventory") ||
    req.nextUrl.pathname.startsWith("/pettycash") ||
    req.nextUrl.pathname.startsWith("/transaksi") ||
    req.nextUrl.pathname.startsWith("/profile");

  // Jika tidak ada token → redirect ke halaman not found
  if (mustLogin && !token) {
    return NextResponse.redirect(new URL("/not-found", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/owner/:path*",
    "/kasir/:path*",
    "/inventory/:path*",
    "/pettycash/:path*",
    "/transaksi/:path*",
    "/profile/:path*",
  ],
};
