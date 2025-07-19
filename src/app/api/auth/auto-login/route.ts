import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const activationSession = cookieStore.get("activation-session")

    if (!activationSession?.value) {
      return NextResponse.json({ message: "Sessione di attivazione non trovata." }, { status: 401 })
    }

    // Find user with the activation session token
    const user = await prisma.usermanager.findFirst({
      where: {
        token_activation: activationSession.value,
        active: "active",
      },
    })

    if (!user) {
      // Clear the invalid cookie
      cookieStore.delete("activation-session")
      return NextResponse.json({ message: "Sessione di attivazione non valida." }, { status: 401 })
    }

    // Clear the activation session token from database
    await prisma.usermanager.update({
      where: { user_id: user.user_id },
      data: {
        token_activation: null,
      },
    })

    // Clear the cookie
    cookieStore.delete("activation-session")

    // Return user data for client-side sign in
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.user_id,
          email: user.email,
          name: `${user.name_first} ${user.name_last}`.trim(),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Auto-login error:", error)
    return NextResponse.json({ message: "Errore durante il login automatico." }, { status: 500 })
  }
}
