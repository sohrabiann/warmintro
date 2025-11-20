import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import LinkedInProvider from "next-auth/providers/linkedin"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

// Validate environment variables
const linkedinClientId = process.env.LINKEDIN_CLIENT_ID
const linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (!linkedinClientId || !linkedinClientSecret) {
  throw new Error("Missing LinkedIn OAuth credentials. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET")
}

if (!nextAuthSecret) {
  throw new Error("Missing NEXTAUTH_SECRET. Please set NEXTAUTH_SECRET in your .env file")
}

// NextAuth configuration
// Using JWT sessions - adapter disabled to avoid configuration errors
// We'll manage users manually in the JWT callback
const authOptions = {
  // adapter: PrismaAdapter(prisma), // Disabled - causes config errors
  session: {
    strategy: "jwt" as const,
  },
  trustHost: true, // Automatically detect host from request headers
  secret: nextAuthSecret,
  providers: [
    LinkedInProvider({
      clientId: linkedinClientId,
      clientSecret: linkedinClientSecret,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Allow sign in - don't block on database operations
      return true
    },
    async jwt({ token, user, account, profile }: any) {
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
            console.error("Error updating user in database:", error?.message || error)
          }
        }, 0)
      }
      
      return token
    },
    async session({ session, token }: any) {
      if (session?.user && token) {
        // Only set id if it exists in token
        if (token.id) {
          session.user.id = token.id as string
        }
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
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
  console.error("NextAuth initialization error:", error)
  throw new Error(`NextAuth configuration error: ${error.message}`)
}

export const { handlers, auth, signIn, signOut } = nextAuth

// Export handlers directly - error logging is handled by NextAuth internally
export const { GET, POST } = handlers

