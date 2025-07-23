import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Count businesses for this manager
    const businessCount = await prisma.business.count({
      where: {
        manager_id: session.user.id
      }
    })

    return NextResponse.json({ 
      hasBusinesses: businessCount > 0,
      businessCount 
    })
  } catch (error) {
    console.error("Error checking businesses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 