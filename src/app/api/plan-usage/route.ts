import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUsage } from "@/lib/usage-utils";
import { getPlanLimits } from "@/lib/plan-limit";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId") || session?.user?.businesses?.[0]?.business_id;
  const feature = searchParams.get("feature");

  if (!userId || !businessId) {
    return NextResponse.json({ error: "Missing user or business context" }, { status: 400 });
  }

  // Robust planId lookup
  let planId: number | undefined = (session as any)?.user?.plan_id;
  if (!planId) {
    // Try to fetch from business's manager
    const business = await prisma.business.findUnique({ where: { business_id: businessId } });
    if (business) {
      const userManager = await prisma.usermanager.findUnique({ where: { user_id: business.manager_id } });
      planId = userManager?.plan_id;
    }
  }
  if (!planId) {
    return NextResponse.json({ error: "Missing plan context" }, { status: 400 });
  }

  try {
    const planLimits = await getPlanLimits(planId);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (feature) {
      const limit = planLimits.find(l => l.feature === feature);
      if (!limit) {
        return NextResponse.json({ usage: { [feature]: 0 } });
      }
      let usage = 0;
      if (limit.limit_type === 'per_month') {
        usage = await getUsage({ business_id: businessId, feature, year, month });
      } else {
        usage = await getUsage({ business_id: businessId, feature });
      }
      return NextResponse.json({ usage: { [feature]: usage } });
    } else {
      // Full usage query for all features in plan limits
      const usage: Record<string, number> = {};
      for (const limit of planLimits) {
        if (limit.limit_type === 'per_month') {
          usage[limit.feature] = await getUsage({ business_id: businessId, feature: limit.feature, year, month });
        } else {
          usage[limit.feature] = await getUsage({ business_id: businessId, feature: limit.feature });
        }
      }
      return NextResponse.json({ usage });
    }
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json({ error: "Failed to fetch usage data", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
