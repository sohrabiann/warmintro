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
    const { targetIndustry, targetJobRole, interests, university, graduationYear } = body

    // Update user with onboarding data
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        targetIndustry,
        targetJobRole,
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

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        targetIndustry: true,
        targetJobRole: true,
        interests: true,
        university: true,
        graduationYear: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Fetch onboarding error:", error)
    return NextResponse.json(
      { error: "Failed to fetch onboarding data" },
      { status: 500 }
    )
  }
}

