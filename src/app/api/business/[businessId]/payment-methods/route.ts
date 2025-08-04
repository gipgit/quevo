import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { businessId: string } }
) {
    try {
        const { businessId } = params;
        console.log('Payment methods API called for business ID:', businessId);

        // Fetch payment methods for this business
        const paymentMethods = await prisma.businesspaymentmethod.findMany({
            where: { business_id: businessId },
            include: { paymentmethod: true }
        });

        console.log('Found payment methods:', paymentMethods.length);

        // Process the payment methods data
        const processedPaymentMethods = paymentMethods.map((bpm: any) => {
            let details = {};
            if (bpm.method_details_json) {
                try {
                    details = typeof bpm.method_details_json === 'string' 
                        ? JSON.parse(bpm.method_details_json) 
                        : bpm.method_details_json;
                } catch (e) {
                    console.error("Error processing method_details_json:", e);
                }
            }
            return {
                ...bpm,
                details: details,
                label: bpm.paymentmethod.method_name,
                icon: `/icons/payment_icons/${bpm.paymentmethod.method_name.toLowerCase().replace(/\s/g, '_')}.svg`
            };
        });

        console.log('Processed payment methods:', processedPaymentMethods);

        return NextResponse.json({ paymentMethods: processedPaymentMethods });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 