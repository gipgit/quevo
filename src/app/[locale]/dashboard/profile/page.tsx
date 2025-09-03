import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ProfileWrapper from "./profile-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

// Mapping function to convert database payment method names to frontend config IDs
function mapPaymentMethodNameToId(methodName: string): string {
  const mapping: Record<string, string> = {
    'PayPal': 'paypal',
    'Bank Transfer': 'bank_transfer',
    'Cash': 'cash',
    'POS': 'pos',
    'Stripe': 'stripe',
    'Satispay': 'satispay',
    'Credit Card': 'credit_card',
    'Apple Pay': 'apple_pay',
    'Google Pay': 'google_pay',
    'Amazon Pay': 'amazon_pay',
    'Klarna': 'klarna',
    'Sofort': 'sofort',
    'iDEAL': 'ideal',
    'Bancontact': 'bancontact',
    'Giropay': 'giropay',
    'EPS': 'eps',
    'Multibanco': 'multibanco',
    'Trustly': 'trustly',
    'Paysafecard': 'paysafecard',
    'Skrill': 'skrill',
    'Neteller': 'neteller',
    'Rapid Transfer': 'rapid_transfer',
    'MyBank': 'mybank',
    'BPAY': 'bpay'
  }
  
  return mapping[methodName] || methodName.toLowerCase().replace(/\s+/g, '_')
}

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get current business ID from cookie
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  
  if (!currentBusinessId) {
    redirect('/dashboard')
  }

  // Fetch all profile data on the server side in parallel
  const [userManagerData, business, settings, links, payments] = await Promise.all([
    // User manager details
    prisma.usermanager.findFirst({
      where: { user_id: session.user.id },
      select: {
        user_id: true,
        name_first: true,
        name_last: true,
        email: true
      }
    }),
    // Business profile data
    prisma.business.findUnique({ 
      where: { business_id: currentBusinessId }
    }),
    // Profile settings
    prisma.businessprofilesettings.findUnique({ 
      where: { business_id: currentBusinessId }
    }),
    // Social links
    prisma.businesslink.findMany({ 
      where: { business_id: currentBusinessId }
    }),
    // Payment methods
    prisma.businesspaymentmethod.findMany({
      where: { business_id: currentBusinessId },
      include: { paymentmethod: true },
    })
  ])

  if (!business) {
    redirect('/dashboard')
  }

  // Transform user manager data
  const userManager = userManagerData ? {
    id: userManagerData.user_id,
    name_first: userManagerData.name_first,
    name_last: userManagerData.name_last,
    email: userManagerData.email
  } : null

  // Patch image paths for frontend
  let patchedProfileData = { ...business } as any
  if (business.business_public_uuid) {
    patchedProfileData.business_img_profile = `/uploads/business/${business.business_public_uuid}/profile.webp`
    patchedProfileData.business_img_cover_mobile = `/uploads/business/${business.business_public_uuid}/cover-mobile.webp`
    patchedProfileData.business_img_cover_desktop = `/uploads/business/${business.business_public_uuid}/cover-desktop.webp`
  } else {
    patchedProfileData.business_img_profile = null
    patchedProfileData.business_img_cover_mobile = null
    patchedProfileData.business_img_cover_desktop = null
  }

  // Transform social links to expected format
  const socialLinks = Object.fromEntries(
    links.map(l => [l.link_type, { url: l.link_url, visible: l.visible ?? false }])
  )

  // Transform payment methods to expected format
  const paymentMethods = payments.map(pm => ({
    type: mapPaymentMethodNameToId(pm.paymentmethod?.method_name || ''),
    visible: pm.visible ?? false,
    details: pm.method_details_json || {},
  }))



  return (
    <ProfileWrapper 
      section="info"
      userManager={userManager}
      initialProfileData={patchedProfileData}
      initialProfileSettings={settings}
      initialSocialLinks={socialLinks}
      initialPaymentMethods={paymentMethods}
    />
  )
} 