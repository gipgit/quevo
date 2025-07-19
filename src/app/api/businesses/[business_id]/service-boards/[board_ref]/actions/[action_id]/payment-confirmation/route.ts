import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { action_id: string } }
) {
  // try {
  //   const { action_id } = params;
  //   const { method_used, note } = await request.json();

  //   // Start a transaction to ensure data consistency
  //   const [updatedAction, paymentSent] = await prisma.$transaction([
  //     // Update the service board action
  //     prisma.serviceboardaction.update({
  //       where: { action_id },
  //       data: {
  //         action_details: {
  //           payment_confirmation: {
  //             confirmed_at: new Date().toISOString(),
  //             method_used,
  //             note,
  //           },
  //         },
  //       },
  //     }),

  //     // Create a record in the PaymentSent table
  //     prisma.paymentsent.create({
  //       data: {
  //         service_board_action_id: action_id,
  //         method_used,
  //         note,
  //         confirmed_at: new Date(),
  //       },
  //     }),
  //   ]);

  //   return NextResponse.json({ 
  //     success: true, 
  //     action: updatedAction,
  //     payment: paymentSent,
  //   });
  // } catch (error) {
  //   console.error('Error confirming payment:', error);
  //   return NextResponse.json(
  //     { error: 'Failed to confirm payment' },
  //     { status: 500 }
  //   );
  // }

  // Dummy response
  return NextResponse.json({ 
    success: true, 
    message: 'Payment confirmation endpoint - dummy response',
    action_id: params.action_id,
    timestamp: new Date().toISOString()
  });
} 