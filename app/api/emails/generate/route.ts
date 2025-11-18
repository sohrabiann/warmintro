import { NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { contactId } = await request.json()

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      )
    }

    // Get user and contact data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    })

    if (!user || !contact || contact.userId !== user.id) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      )
    }

    // Build prompt for OpenAI
    const prompt = `You are helping a student/professional write a warm introduction email. 

User Information:
- Name: ${user.name || "User"}
- University: ${user.university || "Not specified"}
- Graduation Year: ${user.graduationYear || "Not specified"}
- Target Industry: ${user.targetIndustry || "Not specified"}
- Interests: ${user.interests.join(", ") || "None specified"}

Contact Information:
- Name: ${contact.name}
- Role: ${contact.role || "Not specified"}
- Company: ${contact.company || "Not specified"}
- University: ${contact.university || "Not specified"}
- Graduation Year: ${contact.graduationYear || "Not specified"}
- Interests: ${contact.interests.join(", ") || "None specified"}
- Location: ${contact.location || "Not specified"}

Match Reasons: ${contact.matchReasons.join("; ")}

Write a personalized, warm, and professional email that:
1. Mentions the shared connection (university, interests, etc.)
2. Is friendly but professional
3. Asks for a brief coffee chat or informational interview
4. Is concise (under 150 words)
5. Shows genuine interest in their work/company

Return ONLY the email in this JSON format:
{
  "subject": "Email subject line",
  "body": "Email body text"
}`

    // Generate email with OpenAI
    // Using gpt-3.5-turbo which is reliable and cost-effective
    // We'll parse JSON from the response since not all models support JSON mode
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at writing warm, personalized professional networking emails. You MUST return ONLY valid JSON in this exact format with no additional text: {\"subject\": \"Email subject here\", \"body\": \"Email body text here\"}",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content || "{}"
    
    // Extract JSON from response (handle cases where model adds extra text)
    let emailContent
    try {
      // Try parsing directly first
      emailContent = JSON.parse(content)
    } catch {
      // If that fails, try to extract JSON object from the text
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        emailContent = JSON.parse(jsonMatch[0])
      } else {
        // Last resort: create a basic structure
        const lines = content.split("\n").filter((l) => l.trim())
        emailContent = {
          subject: lines[0]?.replace(/^subject:?\s*/i, "") || "Networking Introduction",
          body: content,
        }
      }
    }

    // Validate we have required fields
    if (!emailContent.subject || !emailContent.body) {
      throw new Error("OpenAI response missing required email fields")
    }

    // Create or update email draft
    const existingDraft = await prisma.emailDraft.findFirst({
      where: {
        userId: user.id,
        contactId: contact.id,
        status: "draft",
      },
    })

    let emailDraft
    if (existingDraft) {
      emailDraft = await prisma.emailDraft.update({
        where: { id: existingDraft.id },
        data: {
          subject: emailContent.subject,
          body: emailContent.body,
        },
      })
    } else {
      emailDraft = await prisma.emailDraft.create({
        data: {
          userId: user.id,
          contactId: contact.id,
          subject: emailContent.subject,
          body: emailContent.body,
          status: "draft",
        },
      })
    }

    return NextResponse.json({ draft: emailDraft })
  } catch (error: any) {
    console.error("Email generation error:", error)
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate email"
    if (error?.message?.includes("API key")) {
      errorMessage = "Invalid OpenAI API key. Please check your .env file."
    } else if (error?.message?.includes("rate limit")) {
      errorMessage = "OpenAI API rate limit exceeded. Please try again later."
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === "development" ? error?.stack : undefined },
      { status: 500 }
    )
  }
}

