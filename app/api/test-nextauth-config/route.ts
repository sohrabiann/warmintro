import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = {
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL || "NOT SET",
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
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

