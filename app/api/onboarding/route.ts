import { NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { targetIndustry, targetSeniority, interests, university, graduationYear } = body

    // Update user with onboarding data
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        targetIndustry,
        targetSeniority,
        interests,
        university,
        graduationYear,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    )
  }
}

