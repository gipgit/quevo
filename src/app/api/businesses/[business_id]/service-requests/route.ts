import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toZonedTime } from "date-fns-tz";
import { addMinutes, parseISO, format } from "date-fns";
import { Decimal } from "@prisma/client/runtime/library";
import nodemailer from 'nodemailer';
import { businessServiceRequestConfirmationEmail, customerServiceRequestConfirmationEmail } from '@/lib/emailTemplatesServiceRequest';
import { getPlanLimits } from '@/lib/plan-limit';
import { getUsage, incrementUsage, canCreateMore } from '@/lib/usage-utils';

const BUSINESS_TIMEZONE = 'Europe/Rome';

// Helper function to sanitize and capitalize customer name
function sanitizeAndCapitalizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  // Remove extra whitespace, trim, and normalize
  const sanitized = name.trim().replace(/\s+/g, ' ');
  
  // Capitalize each word
  return sanitized
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Helper function to generate alphanumeric reference
function generateAlphanumericCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate business name initials
function getBusinessInitials(businessName: string): string {
  return businessName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3); // Take max 3 initials
}

// Helper function to generate board reference
function generateBoardRef(businessName: string): string {
  const prefix = getBusinessInitials(businessName);
  const code = generateAlphanumericCode(6);
  return `${prefix}-B${code}`;
}

// Helper function to generate request reference
function generateRequestRef(businessName: string): string {
  const prefix = getBusinessInitials(businessName);
  const code = generateAlphanumericCode(6);
  return `${prefix}-R${code}`;
}



export async function POST(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    const session = await auth();
    // Allow both authenticated users and guest customers to create service requests
    const customerUserId = session?.user?.id || null;

    const business_id = params.business_id;
    const body = await request.json();

    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
      requestDate,
      requestTimeStart,
      totalPrice,
      serviceResponses
    } = body;

    // Input Validation
    if (!serviceId || !customerName || !customerEmail || totalPrice === undefined) {
      return NextResponse.json({ error: 'Missing required service request fields.' }, { status: 400 });
    }

    // Sanitize and capitalize customer name
    const sanitizedCustomerName = sanitizeAndCapitalizeName(customerName);

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { business_id: business_id },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 });
    }

    // Verify service exists and belongs to business
    const service = await prisma.service.findFirst({
      where: { 
        service_id: serviceId,
        business_id: business_id
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found or does not belong to this business.' }, { status: 404 });
    }

    let requestStart: Date | null = null;
    let requestEnd: Date | null = null;

    if (requestDate && requestTimeStart) {
      // For now, let's skip time validation to isolate the issue
      // We'll handle time properly once the basic flow works
      console.log("Time fields provided but skipping validation for now");

      // Skip time slot availability check for now
      console.log("Skipping time slot availability check");
    }

    // ENFORCE PER-MONTH SERVICE REQUEST LIMIT
    // plan_id is on usermanager, not business
    // Need to fetch usermanager for this business
    const businessWithManager = await prisma.business.findUnique({
      where: { business_id: business_id },
      include: { usermanager: true }
    });
    const planId = businessWithManager?.usermanager?.plan_id;
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID not found for business manager.' }, { status: 500 });
    }
    const planLimits = await getPlanLimits(planId);
    const planLimitRequests = planLimits.find(l => l.feature === 'service_requests' && l.limit_type === 'count' && l.scope === 'per_month');
    if (!planLimitRequests) {
      return NextResponse.json({ error: 'Service request plan limit not found' }, { status: 403 });
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const currentUsage = await getUsage({ business_id, feature: 'service_requests', year, month });
    if (!canCreateMore(currentUsage, planLimitRequests)) {
      return NextResponse.json({ error: 'Monthly service request limit reached for your plan.' }, { status: 403 });
    }

    // Create service request and service board with transaction
    const result = await prisma.$transaction(async (prisma) => {
      const requestReference = generateRequestRef(business.business_name);
      const boardRef = generateBoardRef(business.business_name);

      let finalCustomerUserId = customerUserId;
      let userCustomer = null;

      console.log("Starting transaction with customerUserId:", customerUserId);
      console.log("User role:", session?.user?.role);

      // If no authenticated user, create a UserCustomer record for the guest
      if (!customerUserId) {
        console.log("Creating UserCustomer for guest with email:", customerEmail);
        
        // Check if a UserCustomer with this email already exists
        userCustomer = await prisma.usercustomer.findUnique({
          where: { email: customerEmail }
        });

        if (!userCustomer) {
          console.log("Creating new UserCustomer");
          // Create new UserCustomer for guest
          userCustomer = await prisma.usercustomer.create({
            data: {
              email: customerEmail,
              name_first: sanitizedCustomerName.split(' ')[0] || null,
              name_last: sanitizedCustomerName.split(' ').slice(1).join(' ') || null,
              phone: customerPhone || undefined,
              active: 'inactive', // Guest users start as inactive
              date_created: new Date()
            }
          });
          console.log("UserCustomer created with ID:", userCustomer.user_id);
        } else {
          console.log("UserCustomer already exists with ID:", userCustomer.user_id);
          // Don't update existing customer data to prevent privacy violations
        }

        finalCustomerUserId = userCustomer.user_id;
      } else {
        // For authenticated users, check if they have a UserCustomer record
        userCustomer = await prisma.usercustomer.findUnique({
          where: { user_id: customerUserId }
        });

        if (!userCustomer) {
          // User doesn't have a UserCustomer record - create one
          console.log("Creating UserCustomer for authenticated user");
          
          if (session?.user?.role === "manager") {
            // For managers, get their info from UserManager table
            const manager = await prisma.usermanager.findUnique({
              where: { user_id: customerUserId }
            });
            
            if (!manager) {
              throw new Error('Manager user not found');
            }
            
            userCustomer = await prisma.usercustomer.create({
              data: {
                user_id: customerUserId, // Use the same user_id as the manager
                email: manager.email,
                name_first: manager.name_first,
                name_last: manager.name_last,
                phone: manager.tel || undefined,
                active: 'active', // Managers are active
                date_created: new Date()
              }
            });
          } else if (session?.user?.role === "customer") {
            // This shouldn't happen for customers, but handle it just in case
            throw new Error('Customer user not found in UserCustomer table');
          } else {
            throw new Error('Unknown user role');
          }
          
          console.log("UserCustomer created for authenticated user with ID:", userCustomer.user_id);
        }
      }

      // Ensure we have a valid customer user ID
      if (!finalCustomerUserId) {
        throw new Error('No valid customer user ID found');
      }

      console.log("Creating service request with customer ID:", finalCustomerUserId);
      console.log("Customer user object:", userCustomer);

      // Create service request
      const serviceRequest = await prisma.servicerequest.create({
        data: {
          business_id: business_id,
          service_id: serviceId,
          customer_user_id: finalCustomerUserId,
          customer_name: sanitizedCustomerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || undefined,
          customer_notes: customerNotes || null,
          request_date: requestDate ? new Date(requestDate) : null,
          // Skip time fields for now to isolate the issue
          request_time_start: null,
          request_time_end: null,
          price_subtotal: new Decimal(totalPrice.toString()),
          status: 'pending',
          request_reference: requestReference
        },
      });

      console.log("Service request created with ID:", serviceRequest.request_id);

      // Create service board for all users (both authenticated and guest)
      const serviceBoard = await prisma.serviceboard.create({
        data: {
          business_id: business_id,
          customer_id: finalCustomerUserId,
          request_id: serviceRequest.request_id,
          service_id: serviceId,
          board_title: `Request by ${sanitizedCustomerName} - ${serviceRequest.request_reference}`,
          board_description: `Service Board for ${sanitizedCustomerName}`,
          board_ref: boardRef,
          is_password_protected: false,
          status: 'pending'
        },
      });

      console.log("Service board created with ID:", serviceBoard.board_id);

      // Prepare JSON snapshots for service request
      let selectedServiceItemsSnapshot = null;
      let questionResponsesSnapshot = null;
      let requirementResponsesSnapshot = null;

      // Store service responses if provided
      if (serviceResponses) {
        console.log("Processing service responses:", JSON.stringify(serviceResponses, null, 2));
        
        try {
          // Prepare selected service items snapshot
          if (serviceResponses.selectedServiceItems && serviceResponses.selectedServiceItems.length > 0) {
            selectedServiceItemsSnapshot = serviceResponses.selectedServiceItems.map((item: any) => ({
              service_item_id: item.service_item_id,
              item_name: item.item_name,
              quantity: item.quantity,
              price_at_request: parseFloat(item.price_base.toString())
            }));
          }

          // Prepare question responses snapshot
          if (serviceResponses.questionResponses && Object.keys(serviceResponses.questionResponses).length > 0) {
            questionResponsesSnapshot = [];
            for (const [questionId, response] of Object.entries(serviceResponses.questionResponses)) {
              if (response) {
                // Get question details from the service
                const question = await prisma.servicequestion.findUnique({
                  where: { question_id: parseInt(questionId) },
                  select: { question_text: true, question_type: true }
                });
                
                if (question) {
                  questionResponsesSnapshot.push({
                    question_id: parseInt(questionId),
                    question_text: question.question_text,
                    question_type: question.question_type,
                    response_text: response
                  });
                }
              }
            }
          }

          // Prepare requirement responses snapshot
          if (serviceResponses.confirmedRequirements && Object.keys(serviceResponses.confirmedRequirements).length > 0) {
            requirementResponsesSnapshot = [];
            for (const [requirementBlockId, confirmed] of Object.entries(serviceResponses.confirmedRequirements)) {
              if (confirmed) {
                // Get requirement block details
                const requirementBlock = await prisma.servicerequirementblock.findUnique({
                  where: { requirement_block_id: parseInt(requirementBlockId) },
                  select: { title: true, requirements_text: true }
                });
                
                if (requirementBlock) {
                  requirementResponsesSnapshot.push({
                    requirement_block_id: parseInt(requirementBlockId),
                    title: requirementBlock.title,
                    requirements_text: requirementBlock.requirements_text,
                    customer_confirmed: true
                  });
                }
              }
            }
          }

          // Prepare checkbox responses snapshot
          if (serviceResponses.checkboxResponses && Object.keys(serviceResponses.checkboxResponses).length > 0) {
            for (const [questionId, optionIds] of Object.entries(serviceResponses.checkboxResponses)) {
              if (Array.isArray(optionIds) && optionIds.length > 0) {
                // Get question details
                const question = await prisma.servicequestion.findUnique({
                  where: { question_id: parseInt(questionId) },
                  select: { question_text: true, question_type: true }
                });
                
                if (question) {
                  // Get option details
                  const options = await prisma.servicequestionoption.findMany({
                    where: { 
                      question_id: parseInt(questionId),
                      option_id: { in: optionIds.map(id => parseInt(id)) }
                    },
                    select: { option_id: true, option_text: true }
                  });
                  
                  if (options.length > 0) {
                    if (!questionResponsesSnapshot) questionResponsesSnapshot = [];
                    questionResponsesSnapshot.push({
                      question_id: parseInt(questionId),
                      question_text: question.question_text,
                      question_type: question.question_type,
                      selected_options: options.map(opt => ({
                        option_id: opt.option_id,
                        option_text: opt.option_text
                      }))
                    });
                  }
                }
              }
            }
          }

          // Store selected service items in the analytics table
          if (serviceResponses.selectedServiceItems && serviceResponses.selectedServiceItems.length > 0) {
            for (const item of serviceResponses.selectedServiceItems) {
              await prisma.servicerequestselectedserviceitem.create({
                data: {
                  request_id: serviceRequest.request_id,
                  service_item_id: item.service_item_id,
                  item_name: item.item_name,
                  quantity: item.quantity,
                  price_at_request: new Decimal(String(item.price_base))
                }
              });
            }
          }

        } catch (responseError) {
          console.error("Error processing service responses:", responseError);
          // Continue with the main flow even if responses fail
        }
      }

      // Update service request with JSON snapshots
      const updatedServiceRequest = await prisma.servicerequest.update({
        where: { request_id: serviceRequest.request_id },
        data: {
          selected_service_items_snapshot: selectedServiceItemsSnapshot || undefined,
          question_responses_snapshot: questionResponsesSnapshot || undefined,
          requirement_responses_snapshot: requirementResponsesSnapshot || undefined
        }
      });

      console.log("Service request updated with JSON snapshots");

      // Increment monthly usage counter for service requests
      await incrementUsage({ business_id, feature: 'service_requests', year, month });
      return { serviceRequest, serviceBoard };
    });

    // Get business URL name for confirmation page URL
    const businessUrlName = business.business_urlname;

    // Prepare for Email Sending
    const host = request.headers.get('host');
    const appBaseUrl = `http${process.env.NODE_ENV === 'production' ? 's' : ''}://${host}`;
    const requestLocale = request.headers.get('x-next-intl-locale') || 'en-US';

    // Format date for emails
    const formattedRequestDate = result.serviceRequest.request_date ? format(new Date(result.serviceRequest.request_date), 'PPPP') : 'N/A';

    // Create email links
    const customerRequestLink = `${appBaseUrl}/${businessUrlName}/s/${result.serviceBoard?.board_ref}?locale=${requestLocale}`;
    const businessManageRequestLink = `${appBaseUrl}/dashboard/service-requests/${result.serviceRequest.request_id}`;

    // Prepare common email data
    const commonEmailData = {
      request_reference: result.serviceRequest.request_reference,
      service_name: service.service_name,
      price_subtotal: parseFloat(totalPrice).toLocaleString(requestLocale, { style: 'currency', currency: 'EUR' }),
      request_date: formattedRequestDate,
      customer_name: sanitizedCustomerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || 'N/A',
      customer_notes: customerNotes || 'N/A',
      business_name: business.business_name,
    };

    // Helper function to fill template
    const fillTemplate = (template: string, data: Record<string, string>): string => {
      let result = template;
      for (const [key, value] of Object.entries(data)) {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), value);
      }
      return result;
    };

    // Create email HTML content
    const customerEmailHtml = fillTemplate(customerServiceRequestConfirmationEmail, {
      ...commonEmailData,
      request_link: customerRequestLink,
    });

    const businessEmailHtml = fillTemplate(businessServiceRequestConfirmationEmail, {
      ...commonEmailData,
      manage_request_link: businessManageRequestLink,
    });

    // Send emails (non-blocking)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Send customer email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: customerEmail,
        subject: `Conferma Richiesta Servizio da ${business.business_name}`,
        html: customerEmailHtml
      });

      // Send business email
      if (business.business_email) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: business.business_email as string,
          subject: `Nuova Richiesta Servizio per ${business.business_name}`,
          html: businessEmailHtml
        });
      }

      console.log('Service request confirmation emails sent successfully');
    } catch (emailError) {
      console.error('Error sending service request emails:', emailError);
      // Don't fail the request if emails fail
    }

    return NextResponse.json({
      message: 'Service request created successfully!',
      requestReference: result.serviceRequest.request_reference,
      requestId: result.serviceRequest.request_id,
      boardRef: result.serviceBoard?.board_ref || null,
      confirmationPageUrl: result.serviceBoard ? `/${businessUrlName}/s/${result.serviceBoard.board_ref}` : null
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating service request:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      error: "Failed to create service request",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { business_id } = params;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        business_id,
        manager_id: session.user.id
      },
      include: {
        usermanager: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Fetch service requests with related data
    const serviceRequests = await prisma.servicerequest.findMany({
      where: {
        business_id
      },
      orderBy: {
        date_created: 'desc'
      },
      select: {
        request_id: true,
        request_reference: true,
        customer_name: true,
        customer_email: true,
        customer_phone: true,
        request_date: true,
        status: true,
        price_subtotal: true,
        customer_notes: true,
        date_created: true,
        service: {
          select: {
            service_name: true,
            servicecategory: {
              select: {
                category_name: true
              }
            }
          }
        },
        usercustomer: {
          select: {
            name_first: true,
            name_last: true,
            email: true
          }
        },
        servicerequeststatushistory: {
          orderBy: {
            changed_at: 'desc'
          },
          take: 1,
          select: {
            new_status: true,
            changed_at: true
          }
        },
        servicerequestmessage: {
          orderBy: {
            sent_at: 'desc'
          },
          take: 5,
          select: {
            message_text: true,
            sent_at: true,
            sender_type: true
          }
        },
        selected_service_items_snapshot: true,
        question_responses_snapshot: true,
        requirement_responses_snapshot: true
      }
    });

    // Get plan limits for service requests
    const planLimits = await prisma.planlimit.findMany({
      where: {
        plan_id: business.usermanager.plan_id,
        feature: 'service_requests',
        limit_type: 'count',
        scope: 'per_month',
      }
    });
    const serviceRequestLimit = planLimits[0]?.value ?? 10;

    return NextResponse.json({
      serviceRequests,
      planLimits: {
        maxServiceRequests: serviceRequestLimit
      }
    });

  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 