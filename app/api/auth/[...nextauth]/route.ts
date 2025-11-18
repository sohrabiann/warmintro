import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import LinkedInProvider from "next-auth/providers/linkedin"
import { prisma } from "@/lib/prisma"

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
  trustHost: true,
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
      // Allow sign in
      return true
    },
    async jwt({ token, user, account, profile }: any) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      
      // Update user in database after LinkedIn OAuth
      if (account?.provider === "linkedin" && user?.email) {
        try {
          await prisma.user.upsert({
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
        } catch (error) {
          console.error("Error updating user in database:", error)
        }
      }
      
      return token
    },
    async session({ session, token }: any) {
      if (session?.user && token) {
        session.user.id = token.id as string
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

// Initialize NextAuth
const nextAuth = NextAuth(authOptions)

export const { handlers, auth, signIn, signOut } = nextAuth
export const { GET, POST } = handlers

