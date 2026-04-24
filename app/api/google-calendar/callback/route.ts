/**
 * GET /api/google-calendar/callback
 * OAuth2 callback — exchanges code for tokens and stores them in ClinicSettings.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const clinicId = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !clinicId) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/agenda?gcal=error`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? `${process.env.NEXTAUTH_URL}/api/google-calendar/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  })

  if (!tokenRes.ok) {
    console.error('[gcal callback] token exchange failed', await tokenRes.text())
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/agenda?gcal=error`)
  }

  const tokens = await tokenRes.json()
  const expiry = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null

  // Fetch the primary calendar ID
  let calendarId = 'primary'
  try {
    const listRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1&minAccessRole=owner', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (listRes.ok) {
      const list = await listRes.json()
      calendarId = list.items?.[0]?.id ?? 'primary'
    }
  } catch {}

  // Store tokens in ClinicSettings
  await prisma.clinicSettings.upsert({
    where: { clinicId },
    create: {
      clinicId,
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token ?? null,
      googleCalendarId: calendarId,
      googleTokenExpiry: expiry ? new Date(expiry) : null,
    },
    update: {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token ?? undefined,
      googleCalendarId: calendarId,
      googleTokenExpiry: expiry ? new Date(expiry) : null,
    },
  })

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/agenda?gcal=connected`)
}
