import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    console.log('[db-test] Testing database connection...')
    
    // Test basic database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('[db-test] Database connection successful:', result)
    
    // Test if we can query the usermanager table
    const userCount = await prisma.usermanager.count()
    console.log('[db-test] User count:', userCount)
    
    return NextResponse.json({
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('[db-test] Database connection error:', error)
    return NextResponse.json({
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 