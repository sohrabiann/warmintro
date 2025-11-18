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

    // Get all contacts for user
    const contactsCount = await prisma.contact.count({
      where: { userId: user.id },
    })

    // Get email drafts
    const emailsDrafted = await prisma.emailDraft.count({
      where: { userId: user.id },
    })

    // Get sent emails
    const emailsSent = await prisma.emailDraft.count({
      where: { userId: user.id, status: "sent" },
    })

    // Get email tracking stats
    const emailTracking = await prisma.emailTracking.findMany({
      where: { userId: user.id },
    })

    const emailsOpened = emailTracking.filter((e) => e.opened).length
    const emailsReplied = emailTracking.filter((e) => e.replied).length

    return NextResponse.json({
      contactsRecommended: contactsCount,
      emailsDrafted,
      emailsSent,
      emailsOpened,
      emailsReplied,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}

