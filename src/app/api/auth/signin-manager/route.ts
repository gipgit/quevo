// DEPRECATED: This route is no longer used since we're using NextAuth
// The functionality has been moved to NextAuth's built-in authentication

export async function GET() {
  return new Response('This endpoint is deprecated. Use NextAuth for authentication.', { status: 410 })
}

export async function POST() {
  return new Response('This endpoint is deprecated. Use NextAuth for authentication.', { status: 410 })
}
