import { auth } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname === "/" || pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  // Protected routes - redirect to sign in if not authenticated
  if (!session) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect to onboarding if user hasn't completed it
  if (pathname !== "/onboarding" && pathname.startsWith("/dashboard")) {
    const user = session.user
    // Check if user has completed onboarding (has targetIndustry set)
    // This will be checked in the dashboard page component
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

