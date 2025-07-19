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
    const links = await prisma.businesslink.findMany({
      where: { business_id: business_id },
      select: { link_type: true, link_url: true },
    })
    if (!links) {
      return NextResponse.json({ error: "No links found" }, { status: 404 })
    }
    // Convert to object: { facebook: url, instagram: url, ... }
    const socialLinks: Record<string, string> = {}
    for (const link of links) {
      socialLinks[link.link_type] = link.link_url
    }
    return NextResponse.json(socialLinks)
  } catch (error) {
    console.error("Error fetching business links:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
