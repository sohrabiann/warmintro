import { NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { findTopMatches } from "@/lib/matching"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with onboarding data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has completed onboarding
    if (!user.targetIndustry || !user.university) {
      return NextResponse.json(
        { error: "Please complete onboarding first" },
        { status: 400 }
      )
    }

    // Find top matches
    const matches = findTopMatches(user, 3)

    // Check which contacts already exist in database
    const existingContacts = await prisma.contact.findMany({
      where: {
        userId: user.id,
        name: { in: matches.map((m) => m.candidate.name) },
      },
    })

    const existingNames = new Set(existingContacts.map((c) => c.name))

    // Create contacts that don't exist yet
    const newContacts = matches
      .filter((match) => !existingNames.has(match.candidate.name))
      .map((match) => ({
        userId: user.id,
        name: match.candidate.name,
        email: match.candidate.email,
        linkedinUrl: match.candidate.linkedinUrl,
        company: match.candidate.company,
        role: match.candidate.role,
        location: match.candidate.location,
        university: match.candidate.university,
        graduationYear: match.candidate.graduationYear,
        interests: match.candidate.interests,
        warmScore: match.score,
        matchReasons: match.reasons,
      }))

    if (newContacts.length > 0) {
      await prisma.contact.createMany({
        data: newContacts,
      })
    }

    // Return all matches (existing + new) with email drafts
    const allContacts = await prisma.contact.findMany({
      where: { userId: user.id },
      orderBy: { warmScore: "desc" },
      take: 3,
      include: {
        emailDrafts: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json({ matches: allContacts })
  } catch (error) {
    console.error("Matches error:", error)
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    )
  }
}

