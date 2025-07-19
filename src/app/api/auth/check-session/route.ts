import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      }
    });

  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        user: null,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 