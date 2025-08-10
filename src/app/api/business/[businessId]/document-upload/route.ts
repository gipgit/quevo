import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processAndSaveDocument } from '@/lib/documentUpload';

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify business exists and user has access
    const business = await prisma.business.findUnique({
      where: { business_id: params.businessId },
      select: { business_id: true, manager_id: true }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.manager_id !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const actionType = formData.get('actionType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, DOCX, XLSX, DOC, XLS files are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload document
    const uploadResult = await processAndSaveDocument({
      buffer,
      filename: file.name,
      businessId: params.businessId,
      actionType: actionType || 'signature_request'
    });

    return NextResponse.json({
      success: true,
      document_url: uploadResult.path,
      document_name: file.name,
      file_type: file.type
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload document' 
    }, { status: 500 });
  }
}
