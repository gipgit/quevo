// src/app/api/plans/route.ts

import { NextResponse } from 'next/server';
import { getAllPlans } from '@/lib/plan-features';

export const dynamic = 'force-dynamic'; // Ensures this route is not cached

export async function GET() {
  try {
    // Get all plans from static configuration
    const plans = getAllPlans().map(plan => ({
      plan_id: parseInt(plan.id),
      plan_name: plan.name,
      display_price: plan.display_price,
      display_frequency: plan.display_frequency,
      plan_description: plan.description,
      stripe_price_id: plan.stripe_price_id,
      stripe_product_id: plan.stripe_product_id,
      plan_features: plan.features,
    }));

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans.' }, { status: 500 });
  }
}
