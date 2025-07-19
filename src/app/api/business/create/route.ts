import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const createBusinessSchema = z.object({
  business_name: z.string().min(2).max(50),
  business_urlname: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9-_]+$/),
  business_country: z.string().min(2).max(50),
  business_region: z.string().min(2).max(50),
  business_city: z.string().min(2).max(50),
  business_address: z.string().min(5).max(80),
  business_phone: z.string().optional(),
  business_email: z.string().email().optional(),
  business_descr: z.string().optional(),
  company_name: z.string().min(2).max(50),
  company_country: z.string().min(2).max(50),
  company_region: z.string().min(2).max(50),
  company_city: z.string().min(2).max(50),
  company_address: z.string().min(5).max(80),
  company_vat: z.string().min(5).max(50),
  company_contact: z.string().min(2).max(50),
  categories: z.array(z.number()).optional(), // Array of category IDs
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorizzato" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createBusinessSchema.parse(body)

    // Check if business URL name is already taken
    const existingBusiness = await prisma.business.findUnique({
      where: { business_urlname: validatedData.business_urlname },
    })

    if (existingBusiness) {
      return NextResponse.json({ message: "Nome URL business già in uso" }, { status: 409 })
    }

    // Create the business with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the business
      const business = await tx.business.create({
        data: {
          business_name: validatedData.business_name,
          business_urlname: validatedData.business_urlname,
          business_country: validatedData.business_country,
          business_region: validatedData.business_region,
          business_city: validatedData.business_city,
          business_address: validatedData.business_address,
          business_phone: validatedData.business_phone,
          business_email: validatedData.business_email,
          business_descr: validatedData.business_descr,
          company_name: validatedData.company_name,
          company_country: validatedData.company_country,
          company_region: validatedData.company_region,
          company_city: validatedData.company_city,
          company_address: validatedData.company_address,
          company_vat: validatedData.company_vat,
          company_contact: validatedData.company_contact,
          manager_id: session.user.id,
          business_public_uuid: crypto.randomUUID(),
        },
      })

      // Create default business profile settings
      await tx.businessprofilesettings.create({
        data: {
          business_id: business.business_id,
        },
      })

      // Add business categories if provided
      if (validatedData.categories && validatedData.categories.length > 0) {
        await tx.businesscategory.createMany({
          data: validatedData.categories.map((categoryId) => ({
            business_id: business.business_id,
            category_id: categoryId,
          })),
        })
      }

      return business
    })

    return NextResponse.json(
      {
        message: "Business creato con successo",
        business: {
          business_id: result.business_id,
          business_name: result.business_name,
          business_urlname: result.business_urlname,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dati non validi",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    console.error("Error creating business:", error)
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 })
  }
}
