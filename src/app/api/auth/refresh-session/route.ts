import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Force session refresh by calling auth() with no cache
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'No active session' }, { status: 401 })
    }

    // Return success with user info to confirm fresh session
    return NextResponse.json({ 
      success: true, 
      user: {
        id: session.user.id,
        email: session.user.email
      }
    })
  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json({ success: false, message: 'Session refresh failed' }, { status: 500 })
  }
}
