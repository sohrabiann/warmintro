import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - allow access
  if (pathname === "/" || pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // For protected routes, check for session token
  // The actual authentication will be verified in the page components
  const sessionToken = request.cookies.get("next-auth.session-token")?.value || 
                       request.cookies.get("__Secure-next-auth.session-token")?.value

  // If no session token, redirect to sign in
  if (!sessionToken) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Let the page components handle onboarding checks
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
