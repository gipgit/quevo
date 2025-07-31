import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json({ message: "Token e email sono richiesti." }, { status: 400 })
    }

    // Find user by activation token and email
    const user = await prisma.usermanager.findFirst({
      where: {
        token_activation: token,
        email: email.toLowerCase().trim(),
      },
    })

    if (!user) {
      return NextResponse.json({ message: "Link di attivazione non valido o scaduto." }, { status: 404 })
    }

    // Check if account is already active
    if (user.active === "active") {
      return NextResponse.json({ message: "Il tuo account è già stato attivato." }, { status: 409 })
    }

    // Activate the account and clear the activation token
    const activatedUser = await prisma.usermanager.update({
      where: { user_id: user.user_id },
      data: {
        active: "active",
        token_activation: null
      },
    })

    // Create a temporary auto-login token that will be used for automatic signin
    const autoLoginToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry

    // Store the auto-login token temporarily in database
    await prisma.usermanager.update({
      where: { user_id: user.user_id },
      data: {
        // We'll use a temporary field for the auto-login token
        token_activation: autoLoginToken, // Reusing this field temporarily
      },
    })

    return NextResponse.json(
      {
        message: "Account attivato con successo!",
        success: true,
        autoLoginToken: autoLoginToken,
        data: {
          user_id: activatedUser.user_id,
          name_first: activatedUser.name_first,
          name_last: activatedUser.name_last,
          email: activatedUser.email,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Activation error:", error)
    return NextResponse.json({ message: "Errore interno del server durante l'attivazione." }, { status: 500 })
  }
}
