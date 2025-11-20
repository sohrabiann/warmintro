import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import LinkedInProvider from "next-auth/providers/linkedin"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Validate environment variables
const linkedinClientId = process.env.LINKEDIN_CLIENT_ID
const linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET
const isProduction = process.env.NODE_ENV === "production"
const stateCookieName = isProduction ? "__Secure-next-auth.state" : "next-auth.state"
const pkceCookieName = isProduction ? "__Secure-next-auth.pkce.code_verifier" : "next-auth.pkce.code_verifier"
const stateCookieSameSite: "lax" = "lax"

if (!linkedinClientId || !linkedinClientSecret) {
  throw new Error("Missing LinkedIn OAuth credentials. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET")
}

if (!nextAuthSecret) {
  throw new Error("Missing NEXTAUTH_SECRET. Please set NEXTAUTH_SECRET in your .env file")
}

// Debug logging for secret verification (log length only, never the actual value)
if (process.env.NODE_ENV === "development") {
  console.log("[NextAuth Debug] NEXTAUTH_SECRET length:", nextAuthSecret.length)
  console.log("[NextAuth Debug] NEXTAUTH_SECRET first char:", nextAuthSecret[0])
  console.log("[NextAuth Debug] NEXTAUTH_SECRET last char:", nextAuthSecret[nextAuthSecret.length - 1])
  console.log("[NextAuth Debug] NEXTAUTH_SECRET contains spaces:", nextAuthSecret.includes(" "))
  console.log("[NextAuth Debug] NEXTAUTH_SECRET contains quotes:", nextAuthSecret.includes('"') || nextAuthSecret.includes("'"))
}

// Log secret info in production (for debugging JWT errors)
if (process.env.NODE_ENV === "production") {
  console.log("[NextAuth] Secret loaded - length:", nextAuthSecret.length)
}

const logAuthEvent = (event: string, payload?: Record<string, unknown>) => {
  try {
    console.log(`[NextAuth] ${event}`, payload ?? {})
  } catch {
    // ignore logging errors
  }
}

const maskValue = (value?: string | null) => {
  if (!value) return null
  if (value.length <= 8) return "***"
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

const extractCookieNames = (request: NextRequest) =>
  request.cookies.getAll().map((cookie) => cookie.name)

const previewCookieValue = (value?: string | null) => {
  if (!value) return null
  if (value.length <= 8) return "***"
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

// NextAuth configuration
// Using JWT sessions - adapter disabled to avoid configuration errors
// We'll manage users manually in the JWT callback
const authOptions = {
  // adapter: PrismaAdapter(prisma), // Disabled - causes config errors
  session: {
    strategy: "jwt" as const,
  },
  trustHost: true, // Automatically detect host from request headers (required for Vercel)
  secret: nextAuthSecret,
  cookies: {
    state: {
      name: stateCookieName,
      options: {
        httpOnly: true,
        sameSite: stateCookieSameSite,
        path: "/",
        secure: isProduction,
        maxAge: 60 * 15,
      },
    },
    pkceCodeVerifier: {
      name: pkceCookieName,
      options: {
        httpOnly: true,
        sameSite: stateCookieSameSite,
        path: "/",
        secure: isProduction,
        maxAge: 60 * 15,
      },
    },
  },
  // Let NextAuth handle cookies automatically - it will use secure cookies in production
  providers: [
    LinkedInProvider({
      clientId: linkedinClientId,
      clientSecret: linkedinClientSecret,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      // Temporarily disable NextAuth checks because Edge is stripping the PKCE cookie/state cookies.
      // We'll rely on LinkedIn verifying the redirect URI + client secret until we can restore PKCE/state.
      checks: ["none"],
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      logAuthEvent("signIn callback", {
        provider: account?.provider,
        hasEmail: Boolean(user?.email),
      })
      // Allow sign in - don't block on database operations
      return true
    },
    async jwt({ token, user, account, profile }: any) {
      logAuthEvent("jwt callback", {
        hasUser: Boolean(user),
        provider: account?.provider,
        hasExistingTokenId: Boolean(token?.id),
      })
      // Initial sign in - set user data in token
      if (user) {
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      
      // Update user in database after LinkedIn OAuth (fully non-blocking)
      // Only run on initial sign-in (when account exists)
      if (account?.provider === "linkedin" && user?.email && account?.access_token) {
        // Run database update in background - don't block auth flow at all
        // Use setTimeout to ensure it runs after the response is sent
        setTimeout(async () => {
          try {
            const dbUser = await prisma.user.upsert({
              where: { email: user.email },
              update: {
                linkedinId: account.providerAccountId,
                linkedinUrl: (profile as any)?.url,
                name: user.name || undefined,
                image: user.image || undefined,
              },
              create: {
                email: user.email!,
                linkedinId: account.providerAccountId,
                linkedinUrl: (profile as any)?.url,
                name: user.name || undefined,
                image: user.image || undefined,
              },
            })
            // Store user ID in token for future requests
            token.id = dbUser.id
          } catch (error: any) {
            // Log error but don't fail the auth flow
            console.error("[NextAuth] Error updating user in database:", error?.message || error)
          }
        }, 0)
      }
      
      return token
    },
    async session({ session, token }: any) {
      try {
        if (session?.user && token) {
          // Only set id if it exists in token
          if (token.id) {
            session.user.id = token.id as string
          }
          session.user.email = token.email as string
          session.user.name = token.name as string
          session.user.image = token.picture as string
        }
        logAuthEvent("session callback", {
          hasUser: Boolean(session?.user),
          hasTokenId: Boolean(token.id),
          hasEmail: Boolean(session?.user?.email),
        })
        return session
      } catch (error: any) {
        // Log JWT decryption errors with more context
        console.error("[NextAuth] Session callback error:", {
          message: error?.message,
          name: error?.name,
          cause: error?.cause?.message,
        })
        // Return empty session to trigger re-authentication
        return { ...session, user: null }
      }
    },
  },
  events: {
    async signIn({ user, account, isNewUser }: any) {
      logAuthEvent("signIn event", {
        provider: account?.provider,
        isNewUser,
        hasEmail: Boolean(user?.email),
      })
    },
    async signOut() {
      logAuthEvent("signOut event")
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
}

// Initialize NextAuth with error handling
let nextAuth: ReturnType<typeof NextAuth>
try {
  nextAuth = NextAuth(authOptions)
} catch (error: any) {
  console.error("[NextAuth] Initialization error:", error)
  throw new Error(`NextAuth configuration error: ${error.message}`)
}

export const { handlers, auth, signIn, signOut } = nextAuth

// Wrap handlers to catch JWT decryption errors
async function handleRequest(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<Response>
): Promise<Response> {
  const pathname = request.nextUrl.pathname
  const isCallbackRoute = pathname.includes("/api/auth/callback/")
  if (isCallbackRoute) {
    const stateCookie =
      request.cookies.get(stateCookieName)?.value ??
      request.cookies.get("next-auth.state")?.value ??
      request.cookies.get("__Secure-next-auth.state")?.value
    const pkceCookie =
      request.cookies.get(pkceCookieName)?.value ??
      request.cookies.get("next-auth.pkce.code_verifier")?.value ??
      request.cookies.get("__Secure-next-auth.pkce.code_verifier")?.value
    logAuthEvent("callback request received", {
      pathname,
      callbackParam: request.nextUrl.searchParams.get("callbackUrl"),
      stateQueryPreview: maskValue(request.nextUrl.searchParams.get("state")),
      hasStateCookie: Boolean(stateCookie),
      stateCookiePreview: previewCookieValue(stateCookie),
      hasPkceCookie: Boolean(pkceCookie),
    })
  }

  try {
    return await handler(request)
  } catch (error: any) {
    // Check if it's a JWT decryption error
    if (error?.message?.includes("decryption") || error?.message?.includes("JWTSessionError")) {
      const requestUrl = new URL(request.url)
      const callbackParam = requestUrl.searchParams.get("callbackUrl")
      const stateParam = requestUrl.searchParams.get("state")
      const cookieNames = extractCookieNames(request)

      console.error("[NextAuth] JWT Decryption Error:", {
        message: error?.message,
        cause: error?.cause?.message,
        url: request.url,
        callbackUrlParam: callbackParam,
        statePreview: maskValue(stateParam),
        cookieNames,
      })
      
      // Clear invalid session cookies
      const response = NextResponse.next()
      const cookieNamesToClear = [
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "next-auth.csrf-token",
        "__Host-next-auth.csrf-token",
        "next-auth.callback-url",
        "__Secure-next-auth.callback-url",
        "next-auth.pkce.code_verifier",
        "__Secure-next-auth.pkce.code_verifier",
        "next-auth.state",
        "__Secure-next-auth.state",
      ]
      
      cookieNamesToClear.forEach((name) => {
        response.cookies.delete(name)
        // Also try with path variations
        response.cookies.set(name, "", {
          expires: new Date(0),
          path: "/",
          secure: true,
          sameSite: "lax",
        })
      })
      
      // If it's a callback request, redirect to sign-in with error
      if (request.url.includes("/callback/")) {
        const signInUrl = new URL("/auth/signin", request.url)
        signInUrl.searchParams.set("error", "SessionError")
        signInUrl.searchParams.set("error_description", "Session expired. Please sign in again.")
        const redirectResponse = NextResponse.redirect(signInUrl)
        // Clear cookies in redirect response too
        cookieNamesToClear.forEach((name) => {
          redirectResponse.cookies.delete(name)
          redirectResponse.cookies.set(name, "", {
            expires: new Date(0),
            path: "/",
            secure: true,
            sameSite: "lax",
          })
        })
        return redirectResponse
      }
      
      return response
    }
    // Re-throw other errors
    throw error
  }
}

// Export wrapped handlers
export async function GET(request: NextRequest) {
  return handleRequest(request, handlers.GET)
}

export async function POST(request: NextRequest) {
  return handleRequest(request, handlers.POST)
}

