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

// Helper function to get localized board description
function getLocalizedBoardDescription(locale: string, customerName: string): string {
  const localeMap: Record<string, string> = {
    // English
    'en': `Service Board for ${customerName}`,
    'en-US': `Service Board for ${customerName}`,
    'en-GB': `Service Board for ${customerName}`,
    
    // Italian
    'it': `Bacheca Servizio per ${customerName}`,
    'it-IT': `Bacheca Servizio per ${customerName}`,
    
    // Spanish
    'es': `Tablero de Servicio para ${customerName}`,
    'es-ES': `Tablero de Servicio para ${customerName}`,
    
    // German
    'de': `Service-Board für ${customerName}`,
    'de-DE': `Service-Board für ${customerName}`,
    
    // French
    'fr': `Tableau de Service pour ${customerName}`,
    'fr-FR': `Tableau de Service pour ${customerName}`,
    
    // Arabic
    'ar': `لوحة الخدمة لـ ${customerName}`,
    'ar-SA': `لوحة الخدمة لـ ${customerName}`,
    
    // Chinese
    'zh': `${customerName}的服务板`,
    'zh-CN': `${customerName}的服务板`,
    'zh-TW': `${customerName}的服務板`
  };
  
  return localeMap[locale] || localeMap['en-US'];
}

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
    
    // Get request locale early so it can be used throughout the function
    const requestLocale = request.headers.get('x-next-intl-locale') || 'en-US';

    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
      requestDateTimes, // Simplified format: array of ISO 8601 strings
      totalPrice,
      serviceResponses,
      eventId
    } = body;

    // Input Validation
    if (!serviceId || !customerName || !customerEmail || totalPrice === undefined) {
      const missingFields = [];
      if (!serviceId) missingFields.push('serviceId');
      if (!customerName) missingFields.push('customerName');
      if (!customerEmail) missingFields.push('customerEmail');
      if (totalPrice === undefined) missingFields.push('totalPrice');
      
      return NextResponse.json({ 
        error: 'Missing required service request fields.',
        details: `Missing fields: ${missingFields.join(', ')}`,
        errorType: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    // Sanitize and capitalize customer name
    const sanitizedCustomerName = sanitizeAndCapitalizeName(customerName);

    // Verify business exists and get plan info
    const business = await prisma.business.findUnique({
      where: { business_id: business_id },
      include: { 
        plan: true, // Get plan directly from business
        usermanager: true // Keep for email sending
      }
    });

    if (!business) {
      return NextResponse.json({ 
        error: 'Business not found.',
        details: `Business with ID '${business_id}' does not exist.`,
        errorType: 'BUSINESS_NOT_FOUND'
      }, { status: 404 });
    }

    // Verify service exists and belongs to business
    const service = await prisma.service.findFirst({
      where: { 
        service_id: serviceId,
        business_id: business_id
      },
    });

    if (!service) {
      return NextResponse.json({ 
        error: 'Service not found or does not belong to this business.',
        details: `Service with ID '${serviceId}' not found for business '${business_id}'.`,
        errorType: 'SERVICE_NOT_FOUND'
      }, { status: 404 });
    }

    // Note: Time validation can be added here if needed for the simplified datetime format

    // ENFORCE PER-MONTH SERVICE REQUEST LIMIT
    // plan_id is now on business directly
    const planId = business?.plan_id;
    if (!planId) {
      return NextResponse.json({ 
        error: 'Plan ID not found for business.',
        details: 'The business does not have an associated plan. Please contact support.',
        errorType: 'PLAN_NOT_FOUND'
      }, { status: 500 });
    }
    const planLimits = await getPlanLimits(planId);
    const planLimitRequests = planLimits.find(l => l.feature === 'service_requests' && l.limit_type === 'count' && l.scope === 'per_month');
    if (!planLimitRequests) {
      return NextResponse.json({ 
        error: 'Service request plan limit not found',
        details: 'Your current plan does not include service request functionality. Please upgrade your plan.',
        errorType: 'PLAN_LIMIT_NOT_FOUND'
      }, { status: 403 });
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const currentUsage = await getUsage({ business_id, feature: 'service_requests', year, month });
    if (!canCreateMore(currentUsage, planLimitRequests)) {
      const currentCount = currentUsage;
      const maxAllowed = planLimitRequests.value || 0;
      return NextResponse.json({ 
        error: 'This business has reached monthly service request limit.',
        details: `Usage: ${currentCount} out of ${maxAllowed}. Please contact the business owner for more information.`,
        errorType: 'MONTHLY_LIMIT_REACHED',
        usage: {
          current: currentCount,
          limit: maxAllowed,
          remaining: Math.max(0, maxAllowed - currentCount)
        }
      }, { status: 403 });
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
           event_id: eventId || null,
           customer_user_id: finalCustomerUserId,
           customer_name: sanitizedCustomerName,
           customer_email: customerEmail,
           customer_phone: customerPhone || undefined,
           customer_notes: customerNotes || null,
           request_datetimes: requestDateTimes && requestDateTimes.length > 0 ? requestDateTimes : undefined,
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
           board_title: `${service.service_name} - ${sanitizedCustomerName}`,
           board_description: getLocalizedBoardDescription(requestLocale, sanitizedCustomerName),
           board_ref: boardRef,
           is_password_protected: false,
           status: 'pending'
         },
       });

      console.log("Service board created with ID:", serviceBoard.board_id);

      // Prepare JSON snapshots for service request
      let selectedServiceItemsSnapshot = null;
      let selectedServiceExtrasSnapshot = null;
      let questionResponsesSnapshot = null;
      let requirementResponsesSnapshot = null;

      // Store service responses if provided
      if (serviceResponses) {
        console.log("Processing service responses:", JSON.stringify(serviceResponses, null, 2));
        console.log("Service responses structure:", {
          hasSelectedServiceItems: !!serviceResponses.selectedServiceItems,
          selectedServiceItemsCount: serviceResponses.selectedServiceItems?.length || 0,
          hasSelectedServiceExtras: !!serviceResponses.selectedServiceExtras,
          selectedServiceExtrasCount: serviceResponses.selectedServiceExtras?.length || 0,
          hasQuestionResponses: !!serviceResponses.questionResponses,
          questionResponsesKeys: serviceResponses.questionResponses ? Object.keys(serviceResponses.questionResponses) : [],
          hasCheckboxResponses: !!serviceResponses.checkboxResponses,
          checkboxResponsesKeys: serviceResponses.checkboxResponses ? Object.keys(serviceResponses.checkboxResponses) : [],
          hasConfirmedRequirements: !!serviceResponses.confirmedRequirements,
          confirmedRequirementsKeys: serviceResponses.confirmedRequirements ? Object.keys(serviceResponses.confirmedRequirements) : []
        });
        
        try {
          // Prepare selected service items snapshot
          if (serviceResponses.selectedServiceItems && serviceResponses.selectedServiceItems.length > 0) {
            selectedServiceItemsSnapshot = serviceResponses.selectedServiceItems.map((item: any) => ({
              service_item_id: item.service_item_id,
              name: item.item_name, // Shortened from item_name
              qty: item.quantity, // Shortened from quantity
              price_at_req: parseFloat(item.price_base.toString()), // Shortened from price_at_request
              price_type: item.price_type || 'fixed',
              price_unit: item.price_unit || null
            }));
          }

          // Prepare question responses snapshot for open text and media upload questions
          if (serviceResponses.questionResponses && Object.keys(serviceResponses.questionResponses).length > 0) {
            questionResponsesSnapshot = [];
            for (const [questionId, response] of Object.entries(serviceResponses.questionResponses)) {
              if (response && typeof response === 'string' && response.trim() !== '') {
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
                    response_text: response.trim()
                  });
                }
              }
            }
          }

          // Prepare requirement responses snapshot - save ALL requirements with selection status
          const allRequirements = await prisma.servicerequirementblock.findMany({
            where: { 
              service_id: serviceId,
              is_active: true
            },
            select: { 
              requirement_block_id: true, 
              title: true, 
              requirements_text: true
            },
            orderBy: { requirement_block_id: 'asc' }
          });

          console.log("All requirements found:", allRequirements);
          console.log("Confirmed requirements from frontend:", serviceResponses.confirmedRequirements);

          if (allRequirements.length > 0) {
            requirementResponsesSnapshot = allRequirements.map(req => {
              const isConfirmed = serviceResponses.confirmedRequirements?.[req.requirement_block_id] || false;
              console.log(`Requirement ${req.requirement_block_id} confirmed: ${isConfirmed}`);
              return {
                requirement_block_id: req.requirement_block_id,
                title: req.title,
                requirements_text: req.requirements_text,
                customer_confirmed: isConfirmed
              };
            });
          }

          // Prepare checkbox responses snapshot
          if (serviceResponses.checkboxResponses && Object.keys(serviceResponses.checkboxResponses).length > 0) {
            console.log("Processing checkbox responses:", JSON.stringify(serviceResponses.checkboxResponses, null, 2));
            
            for (const [questionId, optionIds] of Object.entries(serviceResponses.checkboxResponses)) {
              // Handle both single values (checkbox_single) and arrays (checkbox_multi)
              const selectedValues = Array.isArray(optionIds) ? optionIds : [optionIds];
              console.log(`Question ${questionId} selected values:`, selectedValues);
              
              if (selectedValues.length > 0 && selectedValues.some(val => val !== null && val !== undefined)) {
                // Get question details with options from JSON field
                const question = await prisma.servicequestion.findUnique({
                  where: { question_id: parseInt(questionId) },
                  select: { question_text: true, question_type: true, question_options: true }
                });
                
                console.log(`Question ${questionId} details:`, {
                  question_text: question?.question_text,
                  question_type: question?.question_type,
                  question_options: question?.question_options
                });
                
                if (question && question.question_options) {
                  // Parse the JSON options - handle both string and object formats
                  let options = [];
                  try {
                    if (typeof question.question_options === 'string') {
                      options = JSON.parse(question.question_options);
                    } else if (Array.isArray(question.question_options)) {
                      options = question.question_options;
                    }
                  } catch (parseError) {
                    console.warn(`Failed to parse question_options for question ${questionId}:`, parseError);
                    options = [];
                  }
                  
                  console.log(`Question ${questionId} parsed options:`, options);
                  
                  // Filter selected options based on selectedValues (which are the option values from frontend)
                  const selectedOptions = options
                    .filter((option: any) => {
                      // Handle different option structures
                      const optionValue = option.value || option.id || option.option_value;
                      const isSelected = selectedValues.includes(optionValue);
                      console.log(`Option ${optionValue} selected: ${isSelected}`, option);
                      return isSelected;
                    })
                    .map((option: any) => ({
                      option_id: option.id || option.option_id,
                      option_text: option.text || option.option_text,
                      option_value: option.value || option.id || option.option_value
                    }));
                  
                  console.log(`Question ${questionId} selected options:`, selectedOptions);
                  
                  if (selectedOptions.length > 0) {
                    if (!questionResponsesSnapshot) questionResponsesSnapshot = [];
                    questionResponsesSnapshot.push({
                      question_id: parseInt(questionId),
                      question_text: question.question_text,
                      question_type: question.question_type,
                      selected_options: selectedOptions
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

          // Prepare selected service extras snapshot
          let selectedServiceExtrasSnapshot = null;
          console.log("Checking serviceResponses.selectedServiceExtras:", {
            exists: !!serviceResponses.selectedServiceExtras,
            type: typeof serviceResponses.selectedServiceExtras,
            isArray: Array.isArray(serviceResponses.selectedServiceExtras),
            length: serviceResponses.selectedServiceExtras?.length,
            content: serviceResponses.selectedServiceExtras
          });
          
          if (serviceResponses.selectedServiceExtras && serviceResponses.selectedServiceExtras.length > 0) {
            console.log("Processing selected service extras:", JSON.stringify(serviceResponses.selectedServiceExtras, null, 2));
            
            selectedServiceExtrasSnapshot = serviceResponses.selectedServiceExtras.map((extra: any) => ({
              service_extra_id: extra.service_extra_id,
              extra_name: extra.extra_name,
              extra_description: extra.extra_description,
              price_at_request: parseFloat(extra.price_base.toString()),
              price_type: extra.price_type || 'fixed',
              price_unit: extra.price_unit || null,
              quantity: extra.quantity || 1
            }));
            
            console.log("Service extras snapshot prepared:", selectedServiceExtrasSnapshot);
            
            // TODO: Uncomment after regenerating Prisma
            // console.log("Would save service extras snapshot to database:", selectedServiceExtrasSnapshot);
          } else {
            console.log("No service extras found or empty array");
          }

        } catch (responseError) {
          console.error("Error processing service responses:", responseError);
          // Continue with the main flow even if responses fail
        }
      }

      // Log all snapshots before database update
      console.log("Final snapshots to save:", {
        selectedServiceItemsSnapshot,
        selectedServiceExtrasSnapshot,
        questionResponsesSnapshot,
        requirementResponsesSnapshot
      });

      // Update service request with JSON snapshots
      const updatedServiceRequest = await prisma.servicerequest.update({
        where: { request_id: serviceRequest.request_id },
        data: {
          selected_service_items_snapshot: selectedServiceItemsSnapshot || undefined,
          // TODO: Uncomment after regenerating Prisma with the new selected_service_extras_snapshot column
          // selected_service_extras_snapshot: selectedServiceExtrasSnapshot || undefined,
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

    // Format date for emails
    const formattedRequestDate = result.serviceRequest.date_created ? format(new Date(result.serviceRequest.date_created), 'PPPP') : 'N/A';

    // Create email links
    const customerRequestLink = `${appBaseUrl}/${businessUrlName}/s/${result.serviceBoard?.board_ref}?locale=${requestLocale}`;
    const businessManageRequestLink = `${appBaseUrl}/dashboard/service-requests/${result.serviceRequest.request_id}`;

    // Prepare common email data
    const R2_PUBLIC_DOMAIN = "https://pub-eac238aed876421982e277e0221feebc.r2.dev";
    
    // Determine business profile image URL
    const businessProfileImageUrl = !business.business_img_profile 
      ? `${appBaseUrl}/uploads/business/${business.business_public_uuid}/profile.webp`
      : `${R2_PUBLIC_DOMAIN}/business/${business.business_public_uuid}/profile.webp`;

    // Debug: Log the image URL being used
    console.log('Business profile image URL:', businessProfileImageUrl);
    console.log('Business img_profile value:', business.business_img_profile);
    console.log('Business public UUID:', business.business_public_uuid);

    // Get business name initial for fallback
    const businessNameInitial = business.business_name ? business.business_name.charAt(0).toUpperCase() : 'Q';

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
      business_profile_image: businessProfileImageUrl,
      business_name_initial: businessNameInitial,
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
        subject: `${business.business_name} - Conferma Richiesta Servizio`,
        html: customerEmailHtml,
        headers: {
          'X-Entity-Ref-ID': 'my-id-123',
          'X-Mailer': 'Flowia Email System'
        }
      });

      // Send business email to UserManager
      if (business.usermanager?.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: business.usermanager.email,
          subject: `Nuova Richiesta Servizio da ${sanitizedCustomerName} - ${business.business_name}`,
          html: businessEmailHtml,
          headers: {
            'X-Entity-Ref-ID': 'my-id-123',
            'X-Mailer': 'Flowia Email System'
          }
        });
      } else {
        console.warn(`No UserManager email found for business ${business.business_name} (ID: ${business_id})`);
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
        plan: true // Get plan directly from business
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
        request_datetimes: true,
        status: true,
        price_subtotal: true,
        customer_notes: true,
        date_created: true,
        is_handled: true,
        handled_at: true,
        handled_by: true,
        priority: true,
        urgency_flag: true,
        is_closed: true,
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
            changed_at: true,
            changed_by: true
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
        requirement_responses_snapshot: true,
        // Event information
        event_id: true,
        serviceevent: {
          select: {
            event_id: true,
            event_name: true,
            event_description: true,
            event_type: true,
            duration_minutes: true,
            buffer_minutes: true,
            is_required: true,
            is_active: true
          }
        },
        // Include linked service board
        serviceboard: {
          select: {
            board_id: true,
            board_ref: true,
            board_title: true,
            status: true,
            action_count: true,
            created_at: true,
            updated_at: true,
            serviceboardaction: {
              select: {
                action_id: true,
                action_type: true,
                action_title: true,
                action_status: true,
                action_priority: true,
                created_at: true,
                due_date: true,
                is_customer_action_required: true
              },
              orderBy: {
                created_at: 'desc'
              }
            }
          }
        }
      }
    });

    // Get plan limits for service requests
    const planLimits = await prisma.planlimit.findMany({
      where: {
        plan_id: business.plan_id,
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