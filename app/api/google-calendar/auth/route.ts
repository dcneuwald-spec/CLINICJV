/**
 * GET /api/google-calendar/auth
 * Returns Google OAuth2 authorization URL for the authenticated clinic.
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment.
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? `${process.env.NEXTAUTH_URL}/api/google-calendar/callback`

  if (!clientId) {
    return NextResponse.json({
      error: 'GOOGLE_CLIENT_ID não configurado',
      instructions: 'Configure as variáveis GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env',
    }, { status: 503 })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: session.user.clinicId,
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return NextResponse.json({ url })
}
