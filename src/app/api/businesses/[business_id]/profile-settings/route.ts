import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    const business_id = params.business_id
    if (!business_id) {
      return NextResponse.json({ error: "Missing business_id" }, { status: 400 })
    }
    const settings = await prisma.businessprofilesettings.findUnique({
      where: { business_id: business_id },
    })
    if (!settings) {
      return NextResponse.json({ error: "No profile settings found" }, { status: 404 })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching business profile settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
