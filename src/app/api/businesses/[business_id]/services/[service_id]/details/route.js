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

    const parsedServiceId = parseInt(service_id, 10);

    if (isNaN(parsedServiceId)) {
        return NextResponse.json({ error: 'Invalid Service ID format' }, { status: 400 });
    }

    try {
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
            },
            orderBy: {
                requirement_block_id: 'asc',
            },
        });

        // Fetch questions for the service
        const questions = await prisma.servicequestion.findMany({
            where: {
                service_id: parsedServiceId,
                is_active: true,
            },
            select: {
                question_id: true,
                question_text: true,
                question_type: true,
                max_length: true,
                is_required: true,
                display_order: true,
            },
            orderBy: {
                display_order: 'asc',
            },
        });

        // For checkbox_multi questions, fetch their options
        for (const question of questions) {
            if (question.question_type === 'checkbox_multi') {
                const options = await prisma.servicequestionoption.findMany({
                    where: {
                        question_id: question.question_id,
                        is_active: true,
                    },
                    select: {
                        option_id: true,
                        option_text: true,
                        display_order: true,
                    },
                    orderBy: {
                        display_order: 'asc',
                    },
                });
                question.options = options;
            }
        }

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

        return NextResponse.json({ requirements, questions, serviceItems }, { status: 200 });

    } catch (error) {
        console.error('Prisma error fetching service details:', error);
        return NextResponse.json({ error: 'Failed to fetch service details from database', details: error.message }, { status: 500 });
    }
}
