import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "class-availability-secret-key-change-in-production"
)

const publicPaths = ["/", "/login", "/signup", "/api/auth/login", "/api/auth/signup", "/api/auth/login-face"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and static assets
  if (
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/models") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = payload.role as string

    // Role-based access control
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    }
    if (pathname.startsWith("/dashboard/lecturer") && role !== "lecturer") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    }
    if (pathname.startsWith("/dashboard/student") && role !== "student") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    }

    // Add user info to request headers for API routes
    const response = NextResponse.next()
    response.headers.set("x-user-id", payload.userId as string)
    response.headers.set("x-user-role", role)
    response.headers.set("x-user-email", payload.email as string)
    response.headers.set("x-user-name", payload.name as string)
    return response
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
