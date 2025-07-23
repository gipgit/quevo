import prisma from "@/lib/prisma"

export async function getPlanLimits(planId: number) {
  const limits = await prisma.planlimit.findMany({ where: { plan_id: planId } })
  console.log('getPlanLimits:', limits)
  return limits.map(l => ({
    feature: l.feature,
    limit_type: l.limit_type,
    scope: l.scope,
    value: l.value,
    enabled: l.enabled,
    notes: l.notes
  }))
}
