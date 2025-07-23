import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const business_id = params.business_id
    if (!business_id) return NextResponse.json({ error: "Missing business_id" }, { status: 400 })
    
    const body = await request.json()
    
    // Fetch business and check ownership
    const business = await prisma.business.findUnique({ where: { business_id: business_id } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })
    if (business.manager_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Update links (array of { link_type, link_url, visible })
    if (Array.isArray(body.links)) {
      // Use transaction for better performance and consistency
      await prisma.$transaction(async (tx) => {
        for (const link of body.links) {
          await tx.businesslink.upsert({
            where: { 
              business_id_link_type: { 
                business_id: business_id, 
                link_type: link.link_type 
              } 
            },
            update: { 
              link_url: link.link_url, 
              visible: link.visible ?? true 
            },
            create: { 
              business_id: business_id, 
              link_type: link.link_type, 
              link_url: link.link_url, 
              visible: link.visible ?? true 
            },
          })
        }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /profile/links:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 