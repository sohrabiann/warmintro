import { NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Handle both Promise and direct params (Next.js 16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params
    const draftId = resolvedParams.id

    if (!draftId) {
      return NextResponse.json(
        { error: "Email draft ID is required" },
        { status: 400 }
      )
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

    return NextResponse.json({ draft })
  } catch (error: any) {
    console.error("Get email error:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch email",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Handle both Promise and direct params (Next.js 16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params
    const draftId = resolvedParams.id

    if (!draftId) {
      return NextResponse.json(
        { error: "Email draft ID is required" },
        { status: 400 }
      )
    }

    const { subject, body, status } = await request.json()

    const draft = await prisma.emailDraft.findUnique({
      where: { id: draftId },
    })

    if (!draft || draft.userId !== user.id) {
      return NextResponse.json(
        { error: "Email draft not found" },
        { status: 404 }
      )
    }

    const updatedDraft = await prisma.emailDraft.update({
      where: { id: draftId },
      data: {
        subject: subject ?? draft.subject,
        body: body ?? draft.body,
        status: status ?? draft.status,
      },
    })

    return NextResponse.json({ draft: updatedDraft })
  } catch (error: any) {
    console.error("Update email error:", error)
    return NextResponse.json(
      { 
        error: "Failed to update email",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

