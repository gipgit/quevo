import { NextResponse } from 'next/server'

export async function GET() {
  // Show all environment variables (without exposing sensitive values)
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    // Authentication
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasAuthUrl: !!process.env.AUTH_URL,
    // Database
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    // Other common vars
    hasVercelUrl: !!process.env.VERCEL_URL,
    hasVercelEnv: !!process.env.VERCEL_ENV,
    // Show partial values for debugging (first 10 chars)
    authSecretPreview: process.env.AUTH_SECRET ? `${process.env.AUTH_SECRET.substring(0, 10)}...` : 'NOT_SET',
    nextAuthSecretPreview: process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 10)}...` : 'NOT_SET',
    nextAuthUrlPreview: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL.substring(0, 20)}...` : 'NOT_SET',
    databaseUrlPreview: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 20)}...` : 'NOT_SET',
  }

  return NextResponse.json(envVars)
} 