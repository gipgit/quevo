import { NextResponse } from "next/server"
import { getPlanLimits } from "@/lib/plan-limit"

export async function GET(
  request: Request,
  { params }: { params: { planId: string } }
) {
  try {
    const planId = Number(params.planId)
    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid planId" }, { status: 400 })
    }
    const limits = await getPlanLimits(planId)
    return NextResponse.json({ limits })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
