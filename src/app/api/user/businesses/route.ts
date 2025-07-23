import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorizzato" }, { status: 401 })
    }

    const businesses = await prisma.business.findMany({
      where: {
        manager_id: session.user.id,
      },
      select: {
        business_id: true,
        business_name: true,
        business_city: true,
        business_img_profile: true,
        business_urlname: true,
        business_country: true,
        business_region: true,
        business_address: true,
        business_phone: true,
        business_email: true,
        business_descr: true,
        date_created: true,
        sponsored: true,
        sponsored_level: true,
        business_public_uuid: true,
      },
    })

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 })
  }
}
