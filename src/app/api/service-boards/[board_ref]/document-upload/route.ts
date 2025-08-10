import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processAndSaveDocument } from '@/lib/documentUpload';

export async function POST(
  request: NextRequest,
  { params }: { params: { board_ref: string } }
) {
  try {
    const { board_ref } = params;

    // Verify that the service board exists
    const serviceBoard = await prisma.serviceboard.findFirst({
      where: {
        board_ref: board_ref,
      },
      select: {
        board_id: true,
        business_id: true,
      },
    });

    if (!serviceBoard) {
      return NextResponse.json({ error: 'Service board not found' }, { status: 404 });
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

    // Upload document using the business_id from the service board
    const uploadResult = await processAndSaveDocument({
      buffer,
      filename: file.name,
      businessId: serviceBoard.business_id,
      actionType: actionType || 'signature_request',
      boardRef: board_ref
      // Note: actionId is not available in this context as action hasn't been created yet
    });

    return NextResponse.json({
      success: true,
      document_url: uploadResult.path,
      document_name: file.name,
      file_type: file.type
    });

  } catch (error) {
    console.error('Service board document upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload document' 
    }, { status: 500 });
  }
}
