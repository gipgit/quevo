import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { getPlanLimits } from '@/lib/plan-limit';
import { canCreateMore } from '@/lib/usage-utils';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { customerActionNotificationEmail } from '@/lib/emailTemplatesServiceRequest';

const prisma = new PrismaClient();

// Action types that inherently require customer action
const ACTION_TYPES_REQUIRING_CUSTOMER_ACTION = [
  'payment_request',
  'signature_request', 
  'information_request',
  'feedback_request',
  'approval_request',
  'checklist',
  'opt_in_request'
] as const;

// Action types that never require customer action
const ACTION_TYPES_NEVER_REQUIRING_CUSTOMER_ACTION = [
  'generic_message',
  'milestone_update',
  'resource_link',
  'document_download'
] as const;

// Action types that don't need status tracking (they are informational only)
const ACTION_TYPES_NO_STATUS_NEEDED = [
  'generic_message',
  'milestone_update',
  'resource_link',
  'document_download'
] as const;

/**
 * Determines if an action requires customer action based on action type and form data
 */
function determineCustomerActionRequired(actionType: string, actionDetails: any): boolean {
  // Check if action type inherently requires customer action
  if (ACTION_TYPES_REQUIRING_CUSTOMER_ACTION.includes(actionType as any)) {
    return true;
  }
  
  // Check if action type never requires customer action
  if (ACTION_TYPES_NEVER_REQUIRING_CUSTOMER_ACTION.includes(actionType as any)) {
    return false;
  }
  
  // Check form-specific logic
  switch (actionType) {
    case 'appointment_scheduling':
      return actionDetails.appointment_mode === 'multiple_choice' || 
             actionDetails.appointment_mode === 'fixed_pending_confirmation';
    case 'video_message':
      return actionDetails.requires_acknowledgment === true;
    default:
      return false; // Default to false for unknown types
  }
}

/**
 * Determines the appropriate action status based on action type and form data
 */
function determineActionStatus(actionType: string, actionDetails: any): string {
  // Check if action type doesn't need status tracking
  if (ACTION_TYPES_NO_STATUS_NEEDED.includes(actionType as any)) {
    return 'completed'; // These are informational actions that are "completed" by default
  }
  
  // Check form-specific logic for status
  switch (actionType) {
    case 'appointment_scheduling':
      // If appointment is already confirmed, mark as completed
      if (actionDetails.confirmation_status === 'confirmed' || 
          actionDetails.appointment_mode === 'fixed_confirmed') {
        return 'completed';
      }
      return 'pending';
    case 'video_message':
      // If no acknowledgment required, mark as completed
      if (!actionDetails.requires_acknowledgment) {
        return 'completed';
      }
      return 'pending';
    case 'milestone_update':
      // If milestone is already completed, mark as completed
      if (actionDetails.is_completed || actionDetails.progress_percentage === 100) {
        return 'completed';
      }
      return 'completed'; // Milestone updates are informational, so default to completed
    default:
      return 'pending'; // Default to pending for action types that need tracking
  }
}

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { business_id: string; board_ref: string } }
) {
  try {
    const { business_id, board_ref } = params;

    // First, verify that the service board exists and belongs to the business
    const serviceBoard = await prisma.serviceboard.findFirst({
      where: {
        business_id: business_id,
        board_ref: board_ref,
      },
      select: {
        board_id: true,
        is_password_protected: true,
      },
    });

    if (!serviceBoard) {
      return NextResponse.json({ error: 'Service board not found' }, { status: 404 });
    }

    // Check if board is password protected
    if (serviceBoard.is_password_protected) {
      const accessToken = cookies().get(`board_access_${board_ref}`)?.value;
      
      if (!accessToken) {
        return NextResponse.json({ error: 'Password required', requiresPassword: true }, { status: 401 });
      }

      // Check if the access token matches the board_id
      if (accessToken !== serviceBoard.board_id) {
        return NextResponse.json({ error: 'Invalid access token', requiresPassword: true }, { status: 401 });
      }
    }

    // Fetch all non-archived actions for this board with their tags
    const actions = await prisma.serviceboardaction.findMany({
      where: {
        board_id: serviceBoard.board_id,
        is_archived: false,
      },

      orderBy: [
        { due_date: 'asc' },
        { created_at: 'desc' }
      ],
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Error fetching service board actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service board actions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { business_id: string; board_ref: string } }
) {
  try {
    const { business_id, board_ref } = params;
    const body = await request.json();
    const { action_type, action_details, action_title, action_description } = body;

    // Verify user session
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Verify that the service board exists and belongs to the business
    const serviceBoard = await prisma.serviceboard.findFirst({
      where: {
        business_id: business_id,
        board_ref: board_ref,
      },
      select: {
        board_id: true,
        customer_id: true,
      },
    });
    if (!serviceBoard) {
      return NextResponse.json({ error: 'Service board not found' }, { status: 404 });
    }
    // Fetch business to get manager_id
    const business = await prisma.business.findUnique({
      where: { business_id },
      select: { manager_id: true },
    });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    // Fetch UserManager to get plan_id
    const userManager = await prisma.usermanager.findUnique({
      where: { user_id: business.manager_id },
      select: { plan_id: true },
    });
    if (!userManager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }
    // Get plan limits for actions per board
    const planLimits = await getPlanLimits(userManager.plan_id);
    const planLimitActions = planLimits.find(l => l.feature === 'actions' && l.limit_type === 'count' && l.scope === 'per_board');
    if (!planLimitActions) {
      return NextResponse.json({ error: 'Action per board plan limit not found' }, { status: 403 });
    }
    // Count current actions for this board (not archived)
    const currentActionCount = await prisma.serviceboardaction.count({
      where: {
        board_id: serviceBoard.board_id,
        is_archived: false,
      },
    });
    if (!canCreateMore(currentActionCount, planLimitActions)) {
      return NextResponse.json({ error: 'Action limit reached for this board.' }, { status: 403 });
    }

    // Create the new action
    const newAction = await prisma.serviceboardaction.create({
      data: {
        board_id: serviceBoard.board_id,
        customer_id: serviceBoard.customer_id,
        action_type: action_type,
        action_title: action_title || 'Nuova azione',
        action_description: action_description || 'Descrizione azione',
        action_details: action_details,
        action_status: determineActionStatus(action_type, action_details),
        is_customer_action_required: determineCustomerActionRequired(action_type, action_details),
        is_archived: false,
      },
    });

    // Send email notification to customer (non-blocking)
    try {
      // Fetch additional data needed for email
      const boardWithDetails = await prisma.serviceboard.findFirst({
        where: {
          board_id: serviceBoard.board_id,
        },
        include: {
          business: {
            select: {
              business_name: true,
              business_public_uuid: true,
              business_img_profile: true,
              business_urlname: true,
            },
          },
          servicerequest: {
            select: {
              request_reference: true,
              customer_name: true,
              customer_email: true,
              price_subtotal: true,
              date_created: true,
              service: {
                select: {
                  service_name: true,
                },
              },
            },
          },
        },
      });

      if (boardWithDetails?.servicerequest?.customer_email) {
        const host = request.headers.get('host');
        const appBaseUrl = `http${process.env.NODE_ENV === 'production' ? 's' : ''}://${host}`;
        const requestLocale = 'it'; // Default to Italian

        

        // Create email link
        const customerRequestLink = `${appBaseUrl}/${boardWithDetails.business.business_urlname}/s/${board_ref}?locale=${requestLocale}`;

        // Prepare business profile image URL
        const R2_PUBLIC_DOMAIN = "https://pub-eac238aed876421982e277e0221feebc.r2.dev";
        const businessProfileImageUrl = !boardWithDetails.business.business_img_profile 
          ? `${appBaseUrl}/uploads/business/${boardWithDetails.business.business_public_uuid}/profile.webp`
          : `${R2_PUBLIC_DOMAIN}/business/${boardWithDetails.business.business_public_uuid}/profile.webp`;

        // Get business name initial for fallback
        const businessNameInitial = boardWithDetails.business.business_name 
          ? boardWithDetails.business.business_name.charAt(0).toUpperCase() 
          : 'Q';

        // Determine priority display text
        const priorityDisplayMap = {
          'high': 'Alta',
          'medium': 'Media', 
          'low': 'Bassa'
        };

                 // Prepare email data
         const emailData = {
           board_ref: board_ref,
           service_name: boardWithDetails.servicerequest.service.service_name,
           customer_name: boardWithDetails.servicerequest.customer_name,
           customer_email: boardWithDetails.servicerequest.customer_email,
           business_name: boardWithDetails.business.business_name,
           business_profile_image: businessProfileImageUrl,
           business_name_initial: businessNameInitial,
           action_title: newAction.action_title,
           action_description: newAction.action_description,
           action_priority: newAction.action_priority || 'medium',
           action_priority_display: priorityDisplayMap[newAction.action_priority as keyof typeof priorityDisplayMap] || 'Media',
           due_date: newAction.due_date ? format(new Date(newAction.due_date), 'PPPP', { locale: it }) : null,
           request_link: customerRequestLink,
         };

        // Helper function to fill template
        const fillTemplate = (template: string, data: Record<string, string | null>): string => {
          let result = template;
          for (const [key, value] of Object.entries(data)) {
            const placeholder = `{{${key}}}`;
            if (value !== null) {
              result = result.replace(new RegExp(placeholder, 'g'), value);
            } else {
              // Remove conditional blocks for null values
              result = result.replace(new RegExp(`{{#if ${key}}}[\\s\\S]*?{{\\/if}}`, 'g'), '');
            }
          }
          return result;
        };

        // Create email HTML content
        const customerEmailHtml = fillTemplate(customerActionNotificationEmail, emailData);

        // Send email
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

                 await transporter.sendMail({
           from: process.env.EMAIL_FROM,
           to: boardWithDetails.servicerequest.customer_email,
           subject: `${boardWithDetails.business.business_name} / ${board_ref} / Aggiornamento `,
           html: customerEmailHtml,
          headers: {
            'X-Entity-Ref-ID': 'my-id-123',
            'X-Mailer': 'Quevo Email System'
          }
        });

        console.log('Action notification email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending action notification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(newAction, { status: 201 });
  } catch (error) {
    console.error('Error creating service board action:', error);
    return NextResponse.json(
      { error: 'Failed to create service board action' },
      { status: 500 }
    );
  }
} 