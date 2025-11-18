import { NextResponse } from "next/server"

export async function GET() {
  const envCheck = {
    hasLinkedInClientId: !!process.env.LINKEDIN_CLIENT_ID,
    hasLinkedInSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    linkedinClientIdLength: process.env.LINKEDIN_CLIENT_ID?.length || 0,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  }

  return NextResponse.json(envCheck)
}

