import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Centralized feature-to-query mapping for maintainability
const featureQueries = async (userId: string, businessId: string) => {
  // Get current month range for bookings
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    businesses: await prisma.business.count({ where: { manager_id: userId } }),
    products: await prisma.product.count({ where: { business_id: businessId } }),
    services: await prisma.service.count({ where: { business_id: businessId } }),
    promos: await prisma.promo.count({ where: { business_id: businessId } }),
    bookings: await prisma.servicerequest.count({
      where: {
        business_id: businessId,
        date_created: { gte: monthStart },
      },
    }),
  };
};

// Single feature query for efficient updates
const singleFeatureQuery = async (feature: string, userId: string, businessId: string) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  switch (feature) {
    case 'businesses':
      return await prisma.business.count({ where: { manager_id: userId } });
    case 'products':
      return await prisma.product.count({ where: { business_id: businessId } });
    case 'services':
      return await prisma.service.count({ where: { business_id: businessId } });
    case 'promos':
      return await prisma.promo.count({ where: { business_id: businessId } });
    case 'bookings':
      return await prisma.servicerequest.count({
        where: {
          business_id: businessId,
          date_created: { gte: monthStart },
        },
      });
    default:
      throw new Error(`Unknown feature: ${feature}`);
  }
};

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  // Get businessId from query param or session context
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId") || session?.user?.businesses?.[0]?.business_id;
  const feature = searchParams.get("feature");

  if (!userId || !businessId) {
    return NextResponse.json({ error: "Missing user or business context" }, { status: 400 });
  }

  try {
    if (feature) {
      // Single feature query for efficient updates
      const count = await singleFeatureQuery(feature, userId, businessId);
      return NextResponse.json({ usage: { [feature]: count } });
    } else {
      // Full usage query
  const usage = await featureQueries(userId, businessId);
  return NextResponse.json({ usage });
    }
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 });
  }
}
