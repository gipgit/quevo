import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"
import { getPlanLimits } from "@/lib/plan-limit"
import { getUsage, incrementUsage, canCreateMore } from "@/lib/usage-utils"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { business_id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business_id = params.business_id // UUID string

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: {
        business_id: business_id,
        is_available: true,
      },
      include: {
        productcategory: {
          select: {
            category_name: true,
          },
        },
        productvariation: {
          where: {
            is_available: true,
          },
          select: {
            variation_id: true,
            variation_name: true,
            additional_description: true,
            price_override: true,
            price_modifier: true,
          },
          orderBy: {
            display_order: "asc",
          },
        },
      },
      orderBy: [{ display_order: "asc" }, { item_name: "asc" }],
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { business_id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business_id = params.business_id // UUID string
    const data = await request.json()

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id,
      },
      include: {
        plan: true, // Get plan directly from business
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // Check plan limits (business-based system)
    const planId = business.plan_id
    const planLimits = await getPlanLimits(planId)
    const planLimitProducts = planLimits.find(l => l.feature === 'products' && l.limit_type === 'count' && l.scope === 'global')
    if (!planLimitProducts) {
      return NextResponse.json({ error: "Product plan limit not found" }, { status: 403 })
    }
    const currentUsage = await getUsage({ business_id, feature: 'products' })
    if (!canCreateMore(currentUsage, planLimitProducts)) {
      return NextResponse.json({ error: "Product limit reached for your plan" }, { status: 403 })
    }

    // Create product with variations and increment usage
    const newProduct = await prisma.$transaction(async (tx) => {
      // Create the product
      const product = await tx.product.create({
        data: {
          business_id: business_id,
          category_id: data.category_id,
          item_name: data.item_name,
          item_notes: data.item_notes,
          item_description: data.item_description,
          price: data.price,
          price_type: data.price_type,
          price_unit: data.price_unit,
          is_available: data.is_available,
          image_available: data.image_available,
          image_url: data.image_url,
          display_order: data.display_order || 0,
        },
      })

      // Create variations
      if (data.variations && data.variations.length > 0) {
        for (let i = 0; i < data.variations.length; i++) {
          const variation = data.variations[i]
          await tx.productvariation.create({
            data: {
              item_id: product.item_id,
              variation_name: variation.variation_name,
              additional_description: variation.additional_description,
              price_override: variation.price_override,
              price_modifier: variation.price_modifier,
              is_available: true,
              display_order: i,
            },
          })
        }
      }

      // Increment usage counter
      await incrementUsage({ business_id, feature: 'products' })

      return product
    })

    return NextResponse.json(newProduct)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
