import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";

export function middleware(req: any) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("admin-token")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const decoded: any = verifyAdminToken(token);

    if (!decoded || decoded.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
