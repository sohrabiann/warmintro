import { NextResponse } from "next/server"

export async function GET() {
  try {
    const nextAuthSecret = process.env.NEXTAUTH_SECRET || ""
    
    const config = {
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL || "NOT SET",
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthSecretLength: nextAuthSecret.length,
      nextAuthSecretFirstChar: nextAuthSecret.length > 0 ? nextAuthSecret[0] : "N/A",
      nextAuthSecretLastChar: nextAuthSecret.length > 0 ? nextAuthSecret[nextAuthSecret.length - 1] : "N/A",
      nextAuthSecretHasSpaces: nextAuthSecret.includes(" "),
      nextAuthSecretHasQuotes: nextAuthSecret.includes('"') || nextAuthSecret.includes("'"),
      expectedSecretLength: 44, // Base64 encoded 32-byte secret
      secretMatchesExpected: nextAuthSecret.length === 44,
      hasLinkedInClientId: !!process.env.LINKEDIN_CLIENT_ID,
      linkedInClientIdLength: process.env.LINKEDIN_CLIENT_ID?.length || 0,
      hasLinkedInClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
      linkedInClientSecretLength: process.env.LINKEDIN_CLIENT_SECRET?.length || 0,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlStartsWith: process.env.DATABASE_URL?.substring(0, 20) || "NOT SET",
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
    }

    return NextResponse.json(config)
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}

