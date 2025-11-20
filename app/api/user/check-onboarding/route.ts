import { NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const onboardingComplete =
      !!user.targetIndustry && !!user.university && !!user.targetJobRole

    return NextResponse.json({ onboardingComplete })
  } catch (error) {
    console.error("Check onboarding error:", error)
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    )
  }
}

