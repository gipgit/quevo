import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json({
    message: 'Environment variables check',
    envVars,
    timestamp: new Date().toISOString()
  })
} 