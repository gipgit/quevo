import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { getCurrentBusinessIdFromCookie } from "./server-business-utils"
import { BusinessProvider } from "./business-context"

interface Business {
  business_id: string
  business_name: string
  business_urlname: string
  business_country: string
  business_region: string
  business_address: string
  business_email: string
  business_phone: string
  business_descr: string
  business_img_profile: string | null
  business_img_cover: string | null
  business_public_uuid: string
  date_created: string
}

interface Plan {
  plan_id: number
  plan_name: string
  display_price: string | null
  display_frequency: string | null
}

interface UserManager {
  id: string
  name_first: string
  name_last: string
  email: string
  plan: Plan
}

interface ServerBusinessProviderProps {
  children: React.ReactNode
}

export default async function ServerBusinessProvider({ children }: ServerBusinessProviderProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch all businesses for the user
  const businesses = await prisma.business.findMany({
    where: {
      usermanager: {
        user_id: session.user.id
      }
    },
    select: {
      business_id: true,
      business_name: true,
      business_urlname: true,
      business_country: true,
      business_region: true,
      business_address: true,
      business_email: true,
      business_phone: true,
      business_descr: true,
      business_img_profile: true,
      business_img_cover: true,
      business_public_uuid: true,
      date_created: true
    }
  })

  if (businesses.length === 0) {
    redirect('/dashboard/onboarding')
  }

  // Get current business from cookie - if no cookie exists, don't set a current business
  // This allows the select-business page to work properly
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  const currentBusiness = currentBusinessId 
    ? businesses.find(b => b.business_id === currentBusinessId) || null
    : null

  // Fetch user manager details
  const userManager = await prisma.usermanager.findFirst({
    where: {
      user_id: session.user.id
    },
    select: {
      user_id: true,
      name_first: true,
      name_last: true,
      email: true,
      plan_id: true,
      plan: {
        select: {
          plan_id: true,
          plan_name: true,
          display_price: true,
          display_frequency: true
        }
      }
    }
  })

  // Note: Usage and plan limits are now fetched at the page level
  // to avoid over-fetching data that's not needed on every page

  // Transform data to match client-side interfaces
  const transformedUserManager: UserManager = {
    id: userManager?.user_id || '',
    name_first: userManager?.name_first || '',
    name_last: userManager?.name_last || '',
    email: userManager?.email || '',
    plan: userManager?.plan || { plan_id: 1, plan_name: 'Free', display_price: null, display_frequency: null }
  }

  const transformedBusinesses: Business[] = businesses.map(b => ({
    business_id: b.business_id,
    business_name: b.business_name,
    business_urlname: b.business_urlname,
    business_country: b.business_country,
    business_region: b.business_region || '',
    business_address: b.business_address || '',
    business_email: String(b.business_email || ''),
    business_phone: String(b.business_phone || ''),
    business_descr: b.business_descr || '',
    business_img_profile: b.business_img_profile,
    business_img_cover: b.business_img_cover,
    business_public_uuid: b.business_public_uuid || '',
    date_created: b.date_created?.toISOString() || new Date().toISOString()
  }))

  // Only transform current business if we have one
  const transformedCurrentBusiness: Business | null = currentBusiness ? {
    business_id: currentBusiness.business_id,
    business_name: currentBusiness.business_name,
    business_urlname: currentBusiness.business_urlname,
    business_country: currentBusiness.business_country,
    business_region: currentBusiness.business_region || '',
    business_address: currentBusiness.business_address || '',
    business_email: String(currentBusiness.business_email || ''),
    business_phone: String(currentBusiness.business_phone || ''),
    business_descr: currentBusiness.business_descr || '',
    business_img_profile: currentBusiness.business_img_profile,
    business_img_cover: currentBusiness.business_img_cover,
    business_public_uuid: currentBusiness.business_public_uuid || '',
    date_created: currentBusiness.date_created?.toISOString() || new Date().toISOString()
  } : null

  return (
    <BusinessProvider 
      initialData={{
        userManager: transformedUserManager,
        userPlan: transformedUserManager.plan,
        businesses: transformedBusinesses,
        currentBusiness: transformedCurrentBusiness
        // usage and planLimits removed - fetched at page level
      }}
    >
      {children}
    </BusinessProvider>
  )
}
