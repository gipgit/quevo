import prisma from "@/lib/prisma"

// Get usage for a feature (global or per-month)
export async function getUsage({ business_id, feature, year, month }: {
  business_id: string,
  feature: string,
  year?: number,
  month?: number
}) {
  if (year && month) {
    // Monthly counter
    console.log('getUsage (monthly) call:', { business_id, feature, year, month });
    const counter = await prisma.usagecountermonthly.findUnique({
      where: {
        business_id_feature_year_month: {
          business_id,
          feature,
          year,
          month
        }
      }
    });
    return counter ? counter.usage_count : 0;
  } else {
    // Global counter
    console.log('getUsage (global) call:', { business_id, feature });
    const counter = await prisma.usagecounter.findUnique({
      where: {
        business_id_feature: {
          business_id,
          feature
        }
      }
    });
    return counter ? counter.usage_count : 0;
  }
}

// Increment usage (global or per-month)
export async function incrementUsage({ business_id, feature, year, month }: {
  business_id: string,
  feature: string,
  year?: number,
  month?: number
}) {
  if (year && month) {
    await prisma.usagecountermonthly.upsert({
      where: {
        business_id_feature_year_month: {
          business_id,
          feature,
          year,
          month
        }
      },
      update: { usage_count: { increment: 1 }, updated_at: new Date() },
      create: { business_id, feature, year, month, usage_count: 1 }
    });
  } else {
    await prisma.usagecounter.upsert({
      where: {
        business_id_feature: {
          business_id,
          feature
        }
      },
      update: { usage_count: { increment: 1 }, updated_at: new Date() },
      create: { business_id, feature, usage_count: 1 }
    });
  }
}

// Decrement usage (global or per-month)
export async function decrementUsage({ business_id, feature, year, month }: {
  business_id: string,
  feature: string,
  year?: number,
  month?: number
}) {
  if (year && month) {
    await prisma.usagecountermonthly.upsert({
      where: {
        business_id_feature_year_month: {
          business_id,
          feature,
          year,
          month
        }
      },
      update: { usage_count: { decrement: 1 }, updated_at: new Date() },
      create: { business_id, feature, year, month, usage_count: 0 }
    });
  } else {
    await prisma.usagecounter.upsert({
      where: {
        business_id_feature: {
          business_id,
          feature
        }
      },
      update: { usage_count: { decrement: 1 }, updated_at: new Date() },
      create: { business_id, feature, usage_count: 0 }
    });
  }
}

// Check if user can create more of a feature
export function canCreateMore(currentUsage: number, planLimit: { value: number | null }): boolean {
  return planLimit.value === -1 || planLimit.value === null || currentUsage < planLimit.value;
}

// Helper function to get usage percentage
export function getUsagePercentage(currentUsage: number, planLimit: { value: number | null }): number {
  if (planLimit.value === -1 || planLimit.value === null) return 0;
  return Math.min(100, (currentUsage / planLimit.value) * 100);
}

// Helper function to format usage display
export function formatUsageDisplay(currentUsage: number, planLimit: { value: number | null }, unlimitedText: string = "∞"): string {
  if (planLimit.value === -1 || planLimit.value === null) return `${currentUsage} / ${unlimitedText}`;
  return `${currentUsage} / ${planLimit.value}`;
} 