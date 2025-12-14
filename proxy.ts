import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  const isAuthPage = request.nextUrl.pathname === "/"
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard")

  if (!token) {
    if (isAdminPage || isDashboardPage) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  try {
    const payload = await verifyToken(token)

    if (!payload || typeof payload === "string") {
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    if (isAuthPage) {
      if (payload.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (isAdminPage && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (isDashboardPage && payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("[v0] Middleware token verification error:", error)
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.delete("auth-token")
    return response
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)"],
}
