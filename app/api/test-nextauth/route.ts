import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to import and check NextAuth
    const { auth } = await import("@/app/api/auth/[...nextauth]/route")
    const session = await auth()
    
    return NextResponse.json({
      success: true,
      message: "NextAuth initialized successfully",
      hasSession: !!session,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name,
    }, { status: 500 })
  }
}

