import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    console.log("[PUT /profile/payments]", { params, method: request.method })
    const bodyText = await request.text()
    console.log("[PUT /profile/payments] body:", bodyText)
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const business_id = params.business_id
    if (!business_id) return NextResponse.json({ error: "Missing business_id" }, { status: 400 })
    const body = JSON.parse(bodyText)
    // Fetch business and check ownership
    const business = await prisma.business.findUnique({ where: { business_id: business_id } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })
    if (business.manager_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // --- Update payment methods (array of { type, visible, details }) ---
    if (Array.isArray(body.payments)) {
      for (const pm of body.payments) {
        // Find payment_method_id by name
        const method = await prisma.paymentmethod.findFirst({ where: { method_name: pm.type } })
        if (!method) continue
        await prisma.businesspaymentmethod.upsert({
          where: { business_id_payment_method_id: { business_id: business_id, payment_method_id: method.payment_method_id } },
          update: {
            visible: pm.visible ?? true,
            method_details_json: pm.details ?? {},
          },
          create: {
            business_id: business_id,
            payment_method_id: method.payment_method_id,
            visible: pm.visible ?? true,
            method_details_json: pm.details ?? {},
          },
        })
      }
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /profile/payments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
