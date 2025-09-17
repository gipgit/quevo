import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// UUID validation schema
const uuidSchema = z.string().uuid("ID business non valido")

export async function GET(request: Request, { params }: { params: Promise<{ business_id: string }> }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorizzato" }, { status: 401 })
    }

    // Await the params in Next.js 15+
    const { business_id } = await params

    // Validate UUID format
    const validationResult = uuidSchema.safeParse(business_id)
    if (!validationResult.success) {
      console.log("Invalid business_id UUID:", business_id)
      return NextResponse.json({ message: "ID business non valido" }, { status: 400 })
    }

    console.log("Fetching business with UUID:", business_id, "for user:", session.user.id)

    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id, // Now using UUID string directly
        manager_id: session.user.id,
      },
      include: {
        usermanager: {
          select: {
            name_first: true,
            name_last: true,
            email: true,
          },
        },
        plan: {
          select: {
            plan_id: true,
            plan_name: true,
            display_price: true,
            display_frequency: true,
            plan_description: true,
            plan_features: true,
          },
        },
        businessprofilesettings: true,
        businesslink: true,
        businesscategory: {
          include: {
            category: {
              select: {
                category_id: true,
                category_name: true,
                category_description: true,
              },
            },
          },
        },
      },
    })

    if (!business) {
      console.log("Business not found for UUID:", business_id, "and user:", session.user.id)
      return NextResponse.json({ message: "Business non trovato" }, { status: 404 })
    }

    return NextResponse.json({ business })
  } catch (error) {
    console.error("Error fetching business:", error)
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ business_id: string }> }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorizzato" }, { status: 401 })
    }

    // Await the params in Next.js 15+
    const { business_id } = await params

    // Validate UUID format
    const validationResult = uuidSchema.safeParse(business_id)
    if (!validationResult.success) {
      return NextResponse.json({ message: "ID business non valido" }, { status: 400 })
    }

    const data = await request.json()

    // Verify business ownership
    const existingBusiness = await prisma.business.findFirst({
      where: {
        business_id: business_id, // Using UUID string directly
        manager_id: session.user.id,
      },
    })

    if (!existingBusiness) {
      return NextResponse.json({ message: "Business non trovato" }, { status: 404 })
    }

    // Validate required fields
    if (!data.business_name || data.business_name.trim().length === 0) {
      return NextResponse.json({ message: "Nome business richiesto" }, { status: 400 })
    }

    const updatedBusiness = await prisma.business.update({
      where: {
        business_id: business_id, // Using UUID string directly
      },
      data: {
        business_name: data.business_name?.trim(),
        business_address: data.business_address?.trim() || null,
        business_city: data.business_city?.trim() || null,
        business_region: data.business_region?.trim() || null,
        business_country: data.business_country?.trim() || null,
        business_email: data.business_email?.trim() || null,
        business_phone: data.business_phone?.trim() || null,
        business_descr: data.business_descr?.trim() || null,
      },
      include: {
        usermanager: {
          select: {
            name_first: true,
            name_last: true,
            email: true,
          },
        },
        plan: {
          select: {
            plan_id: true,
            plan_name: true,
            display_price: true,
            display_frequency: true,
            plan_description: true,
            plan_features: true,
          },
        },
        businessprofilesettings: true,
        businesslink: true,
      },
    })

    return NextResponse.json({
      message: "Business aggiornato con successo",
      business: updatedBusiness,
    })
  } catch (error) {
    console.error("Error updating business:", error)
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ business_id: string }> }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorizzato" }, { status: 401 })
    }

    // Await the params in Next.js 15+
    const { business_id } = await params

    // Validate UUID format
    const validationResult = uuidSchema.safeParse(business_id)
    if (!validationResult.success) {
      return NextResponse.json({ message: "ID business non valido" }, { status: 400 })
    }

    // Verify business ownership
    const existingBusiness = await prisma.business.findFirst({
      where: {
        business_id: business_id, // Using UUID string directly
        manager_id: session.user.id,
      },
    })

    if (!existingBusiness) {
      return NextResponse.json({ message: "Business non trovato" }, { status: 404 })
    }

    // Delete business and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete related records first
      await tx.businesslink.deleteMany({
        where: { business_id: business_id },
      })

      await tx.businesscategory.deleteMany({
        where: { business_id: business_id },
      })

      await tx.businessprofilesettings.deleteMany({
        where: { business_id: business_id },
      })

      // Finally delete the business
      await tx.business.delete({
        where: { business_id: business_id },
      })
    })

    return NextResponse.json({
      message: "Business eliminato con successo",
    })
  } catch (error) {
    console.error("Error deleting business:", error)
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 })
  }
}
