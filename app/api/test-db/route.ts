import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    const userCount = await prisma.user.count()
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      connected: true, 
      userCount,
      message: "Database connection successful" 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      connected: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}

