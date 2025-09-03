import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Reverse mapping function to convert frontend payment method IDs to database method names
function mapPaymentMethodIdToName(methodId: string): string {
  const mapping: Record<string, string> = {
    'paypal': 'PayPal',
    'bank_transfer': 'Bank Transfer',
    'cash': 'Cash',
    'pos': 'POS',
    'stripe': 'Stripe',
    'satispay': 'Satispay',
    'credit_card': 'Credit Card',
    'apple_pay': 'Apple Pay',
    'google_pay': 'Google Pay',
    'amazon_pay': 'Amazon Pay',
    'klarna': 'Klarna',
    'sofort': 'Sofort',
    'ideal': 'iDEAL',
    'bancontact': 'Bancontact',
    'giropay': 'Giropay',
    'eps': 'EPS',
    'multibanco': 'Multibanco',
    'trustly': 'Trustly',
    'paysafecard': 'Paysafecard',
    'skrill': 'Skrill',
    'neteller': 'Neteller',
    'rapid_transfer': 'Rapid Transfer',
    'mybank': 'MyBank',
    'bpay': 'BPAY'
  }
  
  return mapping[methodId] || methodId
}

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

    // Update payment methods (array of { type, visible, details })
    if (Array.isArray(body.payments)) {
      // Use transaction for better performance and consistency
      await prisma.$transaction(async (tx) => {
        for (const pm of body.payments) {
          // Convert frontend ID to database method name
          const methodName = mapPaymentMethodIdToName(pm.type)
          
          // Find payment_method_id by name
          const method = await tx.paymentmethod.findFirst({ 
            where: { method_name: methodName } 
          })
          
          if (!method) continue
          
          await tx.businesspaymentmethod.upsert({
            where: { 
              business_id_payment_method_id: { 
                business_id: business_id, 
                payment_method_id: method.payment_method_id 
              } 
            },
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
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /profile/payments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 