import { NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { draftId } = await request.json()

    if (!draftId) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const draft = await prisma.emailDraft.findUnique({
      where: { id: draftId },
      include: { contact: true },
    })

    if (!draft || draft.userId !== user.id) {
      return NextResponse.json(
        { error: "Email draft not found" },
        { status: 404 }
      )
    }

    // Update draft status to "sent"
    await prisma.emailDraft.update({
      where: { id: draftId },
      data: { status: "sent" },
    })

    // Create email tracking record
    await prisma.emailTracking.create({
      data: {
        userId: user.id,
        contactId: draft.contactId,
        emailDraftId: draftId,
      },
    })

    // Note: In MVP, we're just marking it as sent
    // In production, this would integrate with Gmail/Outlook API to actually send

    return NextResponse.json({ success: true, message: "Email marked as sent" })
  } catch (error) {
    console.error("Send email error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}

