import prisma from "@/lib/prisma"

// Cache for plan limits (in-memory, per serverless instance)
const planLimitCache: Record<number, Record<string, number>> = {}

export async function getPlanLimits(planId: number) {
  if (planLimitCache[planId]) return planLimitCache[planId]
  const limits = await prisma.planlimit.findMany({ where: { plan_id: planId } })
const result: Record<string, number> = {}
  for (const l of limits) result[l.feature] = l.max_count
  planLimitCache[planId] = result
  return result
}
