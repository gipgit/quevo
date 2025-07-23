import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActionTemplateTranslation } from '@/lib/action-templates';

export const dynamic = 'force-dynamic';

// GET /api/business/[businessId]/action-templates
export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'it';
    const businessId = params.businessId;

    // Get business plan
    const business = await prisma.business.findUnique({
      where: { business_id: businessId },
      include: {
        usermanager: {
          select: {
            plan_id: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const planId = business.usermanager?.plan_id || 1;

    // Determine which plan availability field to check
    let planAvailabilityField: 'is_available_plan_1' | 'is_available_plan_2' | 'is_available_plan_3';
    switch (planId) {
      case 1:
        planAvailabilityField = 'is_available_plan_1';
        break;
      case 2:
        planAvailabilityField = 'is_available_plan_2';
        break;
      case 3:
        planAvailabilityField = 'is_available_plan_3';
        break;
      default:
        planAvailabilityField = 'is_available_plan_1';
    }

    // Fetch all active templates ordered by display_order
    const templates = await prisma.serviceboardactiontemplate.findMany({
      where: {
        is_active: true,
      },
      orderBy: [
        { display_order: 'asc' }
      ],
    });

    // Add translations and availability info to templates
    const templatesWithTranslations = templates.map((template: any) => {
      const translation = getActionTemplateTranslation(template.template_name_key, locale);
      const isAvailableForCurrentPlan = template[planAvailabilityField];
      
      return {
        ...template,
        translated_title: translation.title,
        translated_description: translation.description,
        is_available_for_current_plan: isAvailableForCurrentPlan,
        current_plan_id: planId,
      };
    });

    return NextResponse.json(templatesWithTranslations);
  } catch (error) {
    console.error('Error fetching action templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 