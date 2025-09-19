import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { canAccessRoute, UserRole } from "@/lib/permissions"

// المسارات التي لا تحتاج مصادقة
const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/signup", 
  "/auth/error",
  "/api/auth",
  "/_next",
  "/favicon.ico",
]

// المسارات المحمية حسب الدور مع نظام الصلاحيات المتقدم
const roleBasedPaths: Record<string, string[]> = {
  admin: ["/admin"],
  restaurant: ["/restaurant"],
  bank: ["/bank"],
  supplier: ["/supplier"],
  marketer: ["/marketer"],
  landspice_employee: ["/staff", "/landspice"],
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // السماح بالمسارات العامة
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // التحقق من تسجيل الدخول
  if (!req.auth?.user) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  const user = req.auth.user
  const userRole = user.role as UserRole

  // التحقق من حالة المستخدم
  if (user.status !== "active") {
    return NextResponse.redirect(new URL("/auth/error?error=AccountDeactivated", req.url))
  }

  // استخدام نظام الصلاحيات المتقدم للتحقق من الوصول
  if (!canAccessRoute(userRole, pathname)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  // إعادة توجيه المستخدم للوحة التحكم المناسبة بناءً على دوره
  if (pathname === "/dashboard") {
    switch (userRole) {
      case "admin":
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      case "restaurant":
        return NextResponse.redirect(new URL("/restaurant/dashboard", req.url))
      case "bank":
        return NextResponse.redirect(new URL("/bank/dashboard", req.url))
      case "supplier":
        return NextResponse.redirect(new URL("/supplier/dashboard", req.url))
      case "marketer":
        return NextResponse.redirect(new URL("/marketer/dashboard", req.url))
      case "landspice_employee":
        return NextResponse.redirect(new URL("/staff/dashboard", req.url))
      default:
        return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
