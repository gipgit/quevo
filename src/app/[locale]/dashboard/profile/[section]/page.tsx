import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ProfileWrapper from "./profile-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

interface PageProps {
  params: {
    section: string
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const section = params.section || "info"

  // Get current business ID from cookie
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  
  if (!currentBusinessId) {
    redirect('/dashboard')
  }

  // Fetch user manager details (profile-specific data)
  const userManagerData = await prisma.usermanager.findFirst({
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

  // Transform to match expected interface
  const userManager = userManagerData ? {
    id: userManagerData.user_id,
    name_first: userManagerData.name_first,
    name_last: userManagerData.name_last,
    email: userManagerData.email
  } : null

  // Note: Profile-specific data (businessprofile, businessprofilesetting, etc.)
  // will be fetched by the ProfileWrapper component as needed
  // This avoids potential schema issues and follows the optimal approach

  return (
    <ProfileWrapper 
      section={section}
      userManager={userManager}
    />
  )
} 