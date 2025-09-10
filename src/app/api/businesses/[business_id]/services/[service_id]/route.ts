import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { decrementUsage } from "@/lib/usage-utils"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: { business_id: string; service_id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { business_id, service_id } = params
    const data = await request.json()

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // Check if the service exists and belongs to the business
    const existingService = await prisma.service.findFirst({
      where: {
        service_id: service_id,
        business_id: business_id,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Allowed question types for ServiceQuestion
    const ALLOWED_QUESTION_TYPES = ["open", "checkbox_single", "checkbox_multi", "media_upload"]

    // Update service with related data
    await prisma.$transaction(async (tx) => {
      // Update the main service
      await tx.service.update({
        where: {
          service_id: service_id,
        },
        data: {
          service_name: data.service_name,
          description: data.description,
          price_base: data.price_base ? parseFloat(data.price_base) : null,
          price_type: data.price_type || "fixed",
          price_unit: data.price_unit,
          has_items: data.has_items || false,
          has_extras: data.has_extras || false,
          active_booking: data.active_booking || false,
          require_consent_newsletter: data.require_consent_newsletter || false,
          require_consent_newsletter_text: data.require_consent_newsletter_text,
          require_phone: data.require_phone || false,
          active_quotation: data.active_quotation || false,
          is_active: data.is_active,
          display_order: data.display_order || 0,
        },
      })

      // Delete existing questions and create new ones
      await tx.servicequestion.deleteMany({
        where: {
          service_id: service_id,
        },
      })

      if (data.servicequestion && data.servicequestion.length > 0) {
        for (let i = 0; i < data.servicequestion.length; i++) {
          const question = data.servicequestion[i]
          if (!ALLOWED_QUESTION_TYPES.includes(question.question_type)) {
            throw new Error(`Invalid question_type: ${question.question_type}. Allowed: ${ALLOWED_QUESTION_TYPES.join(", ")}`)
          }
          
          // Prepare question options as JSON for radio/checkbox questions
          let questionOptionsJson = null;
          if (question.question_options && question.question_options.length > 0) {
            questionOptionsJson = question.question_options.map((option: any, index: number) => ({
              id: index + 1,
              text: option.text || option,
              display_order: index
            }));
          }

          await tx.servicequestion.create({
            data: {
              service_id: service_id,
              question_text: question.question_text,
              question_type: question.question_type,
              question_options: questionOptionsJson,
              max_length: question.max_length,
              is_required: question.is_required,
              display_order: i,
              is_active: true,
            },
          })
        }
      }

      // Delete existing requirements and create new ones
      await tx.servicerequirementblock.deleteMany({
        where: {
          service_id: service_id,
        },
      })

      if (data.servicerequirementblock && data.servicerequirementblock.length > 0) {
        for (const requirement of data.servicerequirementblock) {
          await tx.servicerequirementblock.create({
            data: {
              service_id: service_id,
              title: requirement.title,
              requirements_text: requirement.requirements_text,
              is_required: requirement.is_required || false,
              is_active: true,
            },
          })
        }
      }

      // Delete existing service items and create new ones
      await tx.serviceitem.deleteMany({
        where: {
          service_id: service_id,
        },
      })

      if (data.serviceitem && data.serviceitem.length > 0) {
        for (let i = 0; i < data.serviceitem.length; i++) {
          const item = data.serviceitem[i]
          await tx.serviceitem.create({
            data: {
              service_id: service_id,
              item_name: item.item_name,
              item_description: item.item_description,
              price_base: item.price_base,
              price_type: item.price_type,
              price_unit: item.price_unit,
              is_active: true,
              display_order: i,
            },
          })
        }
      }

      // Delete existing service extras and create new ones
      await tx.serviceextra.deleteMany({
        where: {
          service_id: service_id,
        },
      })

      if (data.serviceextra && data.serviceextra.length > 0) {
        for (let i = 0; i < data.serviceextra.length; i++) {
          const extra = data.serviceextra[i]
          await tx.serviceextra.create({
            data: {
              service_id: service_id,
              extra_name: extra.extra_name,
              extra_description: extra.extra_description,
              price_base: extra.price_base,
              price_type: extra.price_type,
              price_unit: extra.price_unit,
              is_active: true,
              display_order: i,
            },
          })
        }
      }

      // Delete existing service events and create new ones
      await tx.serviceevent.deleteMany({
        where: {
          service_id: service_id,
        },
      })

      if (data.serviceevent && data.serviceevent.length > 0) {
        for (let i = 0; i < data.serviceevent.length; i++) {
          const event = data.serviceevent[i]
          const createdEvent = await tx.serviceevent.create({
            data: {
              service_id: service_id,
              event_name: event.event_name,
              event_description: event.event_description,
              event_type: event.event_type,
              duration_minutes: event.duration_minutes,
              buffer_minutes: event.buffer_minutes,
              is_required: event.is_required,
              display_order: event.display_order,
              is_active: event.is_active,
            },
          })

          // Create availability records for each day
          if (event.availability) {
            const dayMapping = {
              monday: 1,
              tuesday: 2,
              wednesday: 3,
              thursday: 4,
              friday: 5,
              saturday: 6,
              sunday: 0
            }

            for (const [day, config] of Object.entries(event.availability)) {
              const typedConfig = config as { enabled: boolean; start: string; end: string }
              if (typedConfig.enabled) {
                await tx.serviceeventavailability.create({
                  data: {
                    event_id: createdEvent.event_id,
                    business_id: business_id,
                    day_of_week: dayMapping[day as keyof typeof dayMapping],
                    time_start: new Date(`2000-01-01T${typedConfig.start}:00`),
                    time_end: new Date(`2000-01-01T${typedConfig.end}:00`),
                    is_recurring: true,
                  },
                })
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ message: "Service updated successfully" })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { business_id: string; service_id: string } }
) {
  try {
    const { business_id, service_id } = params

    // Check if the service exists and belongs to the business
    const existingService = await prisma.service.findFirst({
      where: {
        service_id: service_id,
        business_id: business_id,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Delete the service (this will cascade to related records due to foreign key constraints)
    await prisma.service.delete({
      where: {
        service_id: service_id,
      },
    })

    // Decrement usage counter
    await decrementUsage({ business_id, feature: 'services' })

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    )
  }
} 

export async function PATCH(
  request: NextRequest,
  { params }: { params: { business_id: string; service_id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { business_id, service_id } = params
    const data = await request.json()

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // Verify service exists and belongs to this business
    const existingService = await prisma.service.findFirst({
      where: {
        service_id: service_id,
        business_id: business_id,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Update the service with the provided data
    const updatedService = await prisma.service.update({
      where: {
        service_id: service_id,
      },
      data: {
        has_image: data.has_image !== undefined ? data.has_image : existingService.has_image,
        // Add other fields that might need updating in the future
        ...(data.service_name && { service_name: data.service_name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        // Add more fields as needed
      },
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 