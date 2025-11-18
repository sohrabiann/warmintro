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

    // Get all contacts with email tracking data
    const contacts = await prisma.contact.findMany({
      where: { userId: user.id },
      include: {
        emailDrafts: {
          select: {
            id: true,
            status: true,
            subject: true,
            body: true,
            createdAt: true,
          },
        },
        emailTracking: {
          select: {
            opened: true,
            replied: true,
            repliedAt: true,
            replyContent: true,
          },
        },
      },
    })

    // Create user node (center)
    const userNode = {
      id: user.id,
      name: user.name || "You",
      type: "user",
      x: 0,
      y: 0,
      fixed: true,
      size: 20,
    }

    // Create contact nodes
    const contactNodes = contacts.map((contact) => {
      // Determine email status
      let emailStatus = "not_sent"
      const hasDraft = contact.emailDrafts.some((d) => d.status === "draft")
      const hasSent = contact.emailDrafts.some((d) => d.status === "sent")
      const tracking = contact.emailTracking[0]

      if (hasSent && tracking) {
        if (tracking.replied) {
          emailStatus = "replied"
        } else if (tracking.opened) {
          emailStatus = "opened"
        } else {
          emailStatus = "sent"
        }
      } else if (hasDraft) {
        emailStatus = "draft"
      }

      // Determine industry (infer from company name or use default)
      // For MVP, we'll use a simple mapping or default to user's target industry
      let industry = "Other"
      const companyLower = (contact.company || "").toLowerCase()
      if (companyLower.includes("tech") || companyLower.includes("software") || companyLower.includes("engineering")) {
        industry = "Technology"
      } else if (companyLower.includes("finance") || companyLower.includes("bank") || companyLower.includes("investment")) {
        industry = "Finance"
      } else if (companyLower.includes("consulting") || companyLower.includes("consultant")) {
        industry = "Consulting"
      } else if (companyLower.includes("health") || companyLower.includes("medical")) {
        industry = "Healthcare"
      } else if (companyLower.includes("marketing") || companyLower.includes("advertising")) {
        industry = "Marketing"
      } else if (companyLower.includes("design") || companyLower.includes("creative")) {
        industry = "Design"
      } else if (companyLower.includes("education") || companyLower.includes("university") || companyLower.includes("school")) {
        industry = "Education"
      } else if (contact.company) {
        industry = "Other"
      } else {
        industry = user.targetIndustry || "Other"
      }

      return {
        id: contact.id,
        name: contact.name,
        type: "contact",
        industry,
        warmScore: contact.warmScore,
        emailStatus,
        company: contact.company,
        role: contact.role,
        email: contact.email,
        linkedinUrl: contact.linkedinUrl,
        matchReasons: contact.matchReasons,
        emailDrafts: contact.emailDrafts,
        emailTracking: contact.emailTracking,
        size: 10 + (contact.warmScore / 10), // Size based on warm score
      }
    })

    // Create links (user to each contact)
    const links = contacts.map((contact) => ({
      source: user.id,
      target: contact.id,
      strength: contact.warmScore / 100, // Link strength based on warm score
    }))

    return NextResponse.json({
      nodes: [userNode, ...contactNodes],
      links,
    })
  } catch (error) {
    console.error("Network graph error:", error)
    return NextResponse.json(
      { error: "Failed to fetch network data" },
      { status: 500 }
    )
  }
}

