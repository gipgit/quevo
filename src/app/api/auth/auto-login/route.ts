import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { autoLoginToken, email } = await request.json()

    if (!autoLoginToken || !email) {
      return NextResponse.json({ message: "Auto-login token and email are required." }, { status: 400 })
    }

    // Find user by auto-login token and email
    const user = await prisma.usermanager.findFirst({
      where: {
        token_activation: autoLoginToken,
        email: email.toLowerCase().trim(),
        active: "active", // Only allow auto-login for active accounts
      },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid auto-login token or account not active." }, { status: 404 })
    }

    // Clear the auto-login token after use
    await prisma.usermanager.update({
      where: { user_id: user.user_id },
      data: {
        token_activation: null
      },
    })

    // Return user data for session creation
    return NextResponse.json(
      {
        message: "Auto-login successful",
        success: true,
        user: {
          id: user.user_id,
          email: user.email,
          name: user.name_first,
          userType: 'manager'
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Auto-login error:", error)
    return NextResponse.json({ message: "Internal server error during auto-login." }, { status: 500 })
  }
}
