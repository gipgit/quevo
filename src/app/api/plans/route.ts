// src/app/api/plans/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensures this route is not cached

export async function GET() {
  try {
    // Fetch all plans from your database, ordered by plan_id
    const plans = await prisma.plan.findMany({
      orderBy: {
        plan_id: 'asc', // Use plan_id for ordering
      },
      select: {
        plan_id: true,
        plan_name: true,
        display_price: true,
        display_frequency: true,
        plan_description: true,
        stripe_price_id: true,
        stripe_product_id: true,
        plan_features: true,
      },
    });

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans.' }, { status: 500 });
  }
}
