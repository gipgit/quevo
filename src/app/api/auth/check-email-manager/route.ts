import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

const emailSchema = z.object({
  email: z.string().email("Email non valida").toLowerCase(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = emailSchema.parse(body)

    // Check if email exists in UserManager table
    const existingManager = await prisma.usermanager.findUnique({
      where: { email },
      select: { email: true },
    })

    if (existingManager) {
      return NextResponse.json({
        available: false,
        message: "Un account manager con questa email esiste già",
        source: "manager_table",
      })
    }

    return NextResponse.json({
      available: true,
      message: "Email disponibile",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ available: false, message: "Formato email non valido" }, { status: 400 })
    }

    console.error("Email check error:", error)
    return NextResponse.json({ available: false, message: "Errore durante la verifica dell'email" }, { status: 500 })
  }
}
