import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

const urlnameSchema = z.object({
  urlname: z
    .string()
    .min(3, "Il nome URL deve contenere almeno 3 caratteri")
    .max(30, "Il nome URL non può superare i 30 caratteri")
    .regex(/^[a-z0-9-]+$/, "Il nome URL può contenere solo lettere minuscole, numeri e trattini"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { urlname } = urlnameSchema.parse(body)

    const existingBusiness = await prisma.business.findUnique({
      where: { business_urlname: urlname },
      select: { business_urlname: true },
    })

    return NextResponse.json({
      available: !existingBusiness,
      message: existingBusiness ? "Nome URL già in uso" : "Nome URL disponibile",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          available: false,
          message: error.errors[0]?.message || "Formato nome URL non valido",
        },
        { status: 400 },
      )
    }

    console.error("URL name check error:", error)
    return NextResponse.json({ available: false, message: "Errore durante la verifica" }, { status: 500 })
  }
}
