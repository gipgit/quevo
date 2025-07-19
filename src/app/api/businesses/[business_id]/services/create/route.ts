import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getPlanLimits } from "@/lib/plan-limit"

export async function POST(req: NextRequest, { params }: { params: { business_id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const business_id = params.business_id
    const data = await req.json()

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id,
      },
      include: {
        usermanager: { include: { plan: true } },
      },
    })
    console.debug("Fetched business object:", business)
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }
    if (!business.usermanager) {
      console.error("Business found but usermanager relation is missing:", business)
      return NextResponse.json({ error: "Business manager or plan not found" }, { status: 404 })
    }
    if (!business.usermanager.plan_id) {
      console.error("Plan ID is missing for business:", business_id, business.usermanager)
      return NextResponse.json({ error: "Plan ID not found for business manager" }, { status: 404 })
    }

    // Check plan limits (DB-driven)
    const currentServiceCount = await prisma.service.count({
      where: { business_id: business_id, is_active: true },
    })
    const planId = business.usermanager.plan_id
    const planLimits = await getPlanLimits(planId)
    const maxServices = planLimits.services ?? planLimits.maxServices ?? -1
    if (maxServices !== -1 && currentServiceCount >= maxServices) {
      return NextResponse.json({ error: "Service limit reached for your plan" }, { status: 403 })
    }

    // Allowed question types for ServiceQuestion
    const ALLOWED_QUESTION_TYPES = ["open", "checkbox_single", "checkbox_multi",  "media_upload"]

    // Create service with related data
    const newService = await prisma.$transaction(async (tx) => {
      // Create the service
      const service = await tx.service.create({
        data: {
          business_id: business_id,
          category_id: data.category_id,
          service_name: data.service_name,
          description: data.description,
          duration_minutes: data.duration_minutes,
          buffer_minutes: data.buffer_minutes || 0,
          price_base: data.price_base,
          has_items: data.has_items || false,
          date_selection: data.date_selection || false,
          is_active: true,
          display_order: data.display_order || 0,
        },
      })
      // Create questions
      if (data.questions && data.questions.length > 0) {
        for (let i = 0; i < data.questions.length; i++) {
          const question = data.questions[i]
          if (!ALLOWED_QUESTION_TYPES.includes(question.question_type)) {
            throw new Error(`Invalid question_type: ${question.question_type}. Allowed: ${ALLOWED_QUESTION_TYPES.join(", ")}`)
          }
          const createdQuestion = await tx.servicequestion.create({
            data: {
              service_id: service.service_id,
              question_text: question.question_text,
              question_type: question.question_type,
              max_length: question.max_length,
              is_required: question.is_required,
              display_order: i,
              is_active: true,
            },
          })
          // Create question options for radio/checkbox questions
          if (question.options && question.options.length > 0) {
            for (let j = 0; j < question.options.length; j++) {
              await tx.servicequestionoption.create({
                data: {
                  question_id: createdQuestion.question_id,
                  option_text: question.options[j],
                  display_order: j,
                  is_active: true,
                },
              })
            }
          }
        }
      }
      // Create requirement blocks
      if (data.requirements && data.requirements.length > 0) {
        for (const requirement of data.requirements) {
          await tx.servicerequirementblock.create({
            data: {
              service_id: service.service_id,
              title: requirement.title,
              requirements_text: requirement.requirements_text,
              is_active: true,
            },
          })
        }
      }
      // Create service items
      if (data.items && data.items.length > 0) {
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i]
          await tx.serviceitem.create({
            data: {
              service_id: service.service_id,
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
      return service
    })
    return NextResponse.json(newService)
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
