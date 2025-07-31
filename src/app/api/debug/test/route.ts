import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return NextResponse.json({
      message: 'POST request received',
      data: body,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    return NextResponse.json({
      message: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 