import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test a simple query
    const userCount = await prisma.usermanager.count()
    
    return NextResponse.json({
      message: "Database connection successful",
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 