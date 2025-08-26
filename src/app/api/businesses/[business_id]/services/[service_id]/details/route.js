// src/app/api/booking/service-details/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import your Prisma Client instance

// --- DEBUGGING: Check if prisma is defined right after import ---
console.log('DEBUG: prisma instance in service-details API route:', prisma ? 'Defined' : 'Undefined');
// --- END DEBUGGING ---

export async function GET(request, { params }) {
    const { service_id } = params;

    if (!service_id) {
        return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // service_id is now a UUID, so we use it directly
    const parsedServiceId = service_id;

    if (!parsedServiceId) {
        return NextResponse.json({ error: 'Invalid Service ID format' }, { status: 400 });
    }

    try {
        // Fetch service details including consent-related fields
        const service = await prisma.service.findUnique({
            where: {
                service_id: parsedServiceId,
            },
            select: {
                service_id: true,
                service_name: true,
                description: true,
                require_phone: true,
                require_consent_pdp: true,
                require_consent_newsletter: true,
                require_consent_newsletter_text: true,
                has_extras: true,
                has_items: true,
            },
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Fetch requirements for the service
        const requirements = await prisma.servicerequirementblock.findMany({
            where: {
                service_id: parsedServiceId,
                is_active: true,
            },
            select: {
                requirement_block_id: true,
                title: true,
                requirements_text: true,
                is_required: true,
            },
            orderBy: {
                requirement_block_id: 'asc',
            },
        });

        // Fetch questions for the service with the new question_options JSONB field
        const questions = await prisma.servicequestion.findMany({
            where: {
                service_id: parsedServiceId,
                is_active: true,
            },
            select: {
                question_id: true,
                question_text: true,
                question_type: true,
                question_options: true, // Include the new JSONB field
                max_length: true,
                is_required: true,
                display_order: true,
            },
            orderBy: {
                display_order: 'asc',
            },
        });

        // Fetch service items for the service, using 'service_item_id' and new price columns
        const serviceItems = await prisma.serviceitem.findMany({
            where: {
                service_id: parsedServiceId,
                is_active: true,
            },
            select: {
                service_item_id: true,
                item_name: true,
                item_description: true,
                price_base: true, // Corrected field name
                price_type: true, // New field
                price_unit: true, // New field
                display_order: true,
            },
            orderBy: {
                display_order: 'asc',
            },
        });

        return NextResponse.json({ service, requirements, questions, serviceItems }, { status: 200 });

    } catch (error) {
        console.error('Prisma error fetching service details:', error);
        return NextResponse.json({ error: 'Failed to fetch service details from database', details: error.message }, { status: 500 });
    }
}
