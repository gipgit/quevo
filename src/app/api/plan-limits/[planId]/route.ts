import { NextResponse } from "next/server"
import { getPlanLimits } from "@/lib/plan-limit"

export async function GET(
  request: Request,
  { params }: { params: { planId: string } }
) {
  console.log("[API] /api/plan-limits/[planId] called", { params })
  try {
    const planId = Number(params.planId)
    if (isNaN(planId)) {
      console.warn("[API] Invalid planId received", { planId: params.planId })
      return NextResponse.json({ error: "Invalid planId" }, { status: 400 })
    }
    const limits = await getPlanLimits(planId)
    console.log("[API] Plan limits fetched", { planId, limits })
    return NextResponse.json({ limits })
  } catch (error) {
    console.error("[API] Error fetching plan limits:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
