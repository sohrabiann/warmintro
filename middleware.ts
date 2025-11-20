import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATH_PREFIXES = ["/", "/auth", "/api"]
const DEBUG_MIDDLEWARE = process.env.NEXT_PUBLIC_MIDDLEWARE_DEBUG === "true"

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const isPublic = PUBLIC_PATH_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (isPublic) {
    return NextResponse.next()
  }

  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value

  if (!sessionToken) {
    const signInUrl = new URL("/auth/signin", request.url)
    const callbackDestination = `${pathname}${search}` || "/"
    signInUrl.searchParams.set("callbackUrl", callbackDestination)

    if (DEBUG_MIDDLEWARE) {
      console.log("[Middleware] Redirecting to sign-in", {
        callbackDestination,
      })
    }

    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
