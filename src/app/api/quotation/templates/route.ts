import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { templateName, templateData } = await request.json()

    if (!templateName || !templateData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get business ID
    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      select: {
        business_id: true
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if template name already exists
    const existingTemplate = await prisma.quotationtemplate.findFirst({
      where: {
        business_id: business.business_id,
        template_name: templateName
      }
    })

    if (existingTemplate) {
      return NextResponse.json({ error: 'Template name already exists' }, { status: 409 })
    }

    // Save template
    const template = await prisma.quotationtemplate.create({
      data: {
        business_id: business.business_id,
        template_name: templateName,
        template_data: templateData
      }
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Error saving template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business ID
    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      select: {
        business_id: true
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get templates
    const templates = await prisma.quotationtemplate.findMany({
      where: {
        business_id: business.business_id
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
