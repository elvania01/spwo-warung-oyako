import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {

  // ✅ BYPASS UNTUK CYPRESS / E2E
  if (process.env.NEXT_PUBLIC_E2E === "true") {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth")?.value;

  const mustLogin =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/dashboard/kasir") ||
    req.nextUrl.pathname.startsWith("/laporan") ||
    req.nextUrl.pathname.startsWith("/pettycash/kasir") ||
    req.nextUrl.pathname.startsWith("/inventory") ||
    req.nextUrl.pathname.startsWith("/pettycash") ||
    req.nextUrl.pathname.startsWith("/inventory/kasir") ||
    req.nextUrl.pathname.startsWith("/profile");

  if (mustLogin && !token) {
    return NextResponse.redirect(new URL("/not-found", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard/kasir/:path*",
    "/pettycash/kasir/:path*",
    "/inventory/:path*",
    "/pettycash/:path*",
    "/inventory/kasir/:path*",
    "/profile/:path*",
  ],
};
