// src/app/api/booking/services/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
        return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    try {
        const services = await prisma.bookingService.findMany({
            where: {
                business_id: parseInt(businessId),
                is_active: true,
            },
            orderBy: {
                service_name: 'asc',
            },
            select: {
                service_id: true,
                service_name: true,
                duration_minutes: true,
                price: true,
            },
        });

        const hasGeneralAvailability = await prisma.bookingAvailability.count({
            where: {
                business_id: parseInt(businessId),
                staff_id: null,
                is_recurring: true,
            },
        }) > 0;

        return NextResponse.json({ services, hasGeneralAvailability });
    } catch (error) {
        console.error('Error fetching services or availability:', error);
        return NextResponse.json({ error: 'Failed to fetch services or availability' }, { status: 500 });
    }
}