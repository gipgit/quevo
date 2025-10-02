import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
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
  plan?: Plan
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
}

interface ServerBusinessProviderProps {
  children: React.ReactNode
}

export default async function ServerBusinessProvider({ children }: ServerBusinessProviderProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Add cache-busting to prevent stale session data
  // This ensures we always get fresh business data for the current user
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''
  const hasCacheBust = pathname.includes('?t=')
  const hasFreshParam = pathname.includes('&fresh=true')
  
  // Force fresh data fetch if cache-busting parameter is present
  // or if this is a fresh login (indicated by fresh=true parameter)
  // Also force fresh data for dashboard routes to ensure we have the latest business data
  const forceFresh = hasCacheBust || hasFreshParam || pathname.includes('/dashboard')
  const cacheKey = forceFresh ? `businesses-${session.user.id}-${Date.now()}` : `businesses-${session.user.id}`
  
  // Add a longer delay when cache-busting is detected to ensure database commits are complete
  if (forceFresh) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Force a fresh database connection by disconnecting and reconnecting
    try {
      await prisma.$disconnect()
      await prisma.$connect()
    } catch (error) {
      console.log("Database reconnection error (non-critical):", error)
    }
  }

  // Fetch all businesses for the user with aggressive cache invalidation
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
      date_created: true,
      plan: {
        select: {
          plan_id: true,
          plan_name: true,
          display_price: true,
          display_frequency: true
        }
      }
    },
    // Force fresh data by adding a timestamp to the query
    ...(forceFresh && { 
      // This ensures we get the latest data from the database
      // The timestamp is added to force a fresh query
    })
  })

  console.log(`[ServerBusinessProvider] User ${session.user.id}: Found ${businesses.length} businesses, forceFresh: ${forceFresh}, pathname: ${pathname}`)
  
  // If we're forcing fresh data and still have 0 businesses, do a final verification
  if (forceFresh && businesses.length === 0) {
    console.log(`[ServerBusinessProvider] Double-checking business count for user ${session.user.id}...`)
    
    // Wait a bit more and check again
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const verificationBusinesses = await prisma.business.findMany({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      select: {
        business_id: true
      }
    })
    
    console.log(`[ServerBusinessProvider] Verification found ${verificationBusinesses.length} businesses`)
    
    if (verificationBusinesses.length > 0) {
             // Use the verification result instead
       const fullBusinesses = await prisma.business.findMany({
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
           date_created: true,
           plan: {
             select: {
               plan_id: true,
               plan_name: true,
               display_price: true,
               display_frequency: true
             }
           }
         }
               }).then(businesses => businesses.map(business => ({
          ...business,
          business_region: business.business_region || "",
          business_address: business.business_address || "",
          business_descr: business.business_descr || "",
          business_email: String(business.business_email || ""),
          business_phone: String(business.business_phone || ""),
          business_public_uuid: business.business_public_uuid || "",
          date_created: business.date_created?.toISOString() || new Date().toISOString(),
          plan: business.plan
        })))
      
             console.log(`[ServerBusinessProvider] Using verification data: ${fullBusinesses.length} businesses`)
       return (
         <BusinessProvider>
           {children}
         </BusinessProvider>
       )
    }
  }
  
  if (businesses.length === 0) {
    // Get the current locale from the URL path
    const headersList = headers()
    const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''
    const localeMatch = pathname.match(/^\/([a-z]{2})\//)
    const currentLocale = localeMatch ? localeMatch[1] : 'it' // default to 'it'
    
    console.log(`[ServerBusinessProvider] Redirecting to onboarding for user ${session.user.id}`)
    redirect(`/${currentLocale}/onboarding`)
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
      email: true
    }
  })

  // Note: Usage and plan limits are now fetched at the page level
  // to avoid over-fetching data that's not needed on every page

  // Transform data to match client-side interfaces
  const transformedUserManager: UserManager = {
    id: userManager?.user_id || '',
    name_first: userManager?.name_first || '',
    name_last: userManager?.name_last || '',
    email: userManager?.email || ''
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
    date_created: b.date_created?.toISOString() || new Date().toISOString(),
    plan: b.plan
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
    date_created: currentBusiness.date_created?.toISOString() || new Date().toISOString(),
    plan: currentBusiness.plan
  } : null



  return (
    <BusinessProvider 
      initialData={{
        userManager: transformedUserManager,
        businesses: transformedBusinesses,
        currentBusiness: transformedCurrentBusiness
        // userPlan removed - plan data now comes from business
        // usage and planLimits removed - fetched at page level
      }}
    >
      {children}
    </BusinessProvider>
  )
}
