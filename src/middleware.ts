import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  if (url.pathname.startsWith("/admin-2026-dashboard")) {
    if (url.pathname.startsWith("/admin-2026-dashboard/login")) {
      return NextResponse.next();
    }

    const authCookie = request.cookies.get("hxnf_admin_auth");

    if (!authCookie || authCookie.value !== "true") {
      url.pathname = "/admin-2026-dashboard/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-2026-dashboard/:path*"],
};
