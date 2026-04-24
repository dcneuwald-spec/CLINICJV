/**
 * GET /api/google-calendar/status
 * Returns whether Google Calendar is connected for the current clinic.
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.clinicSettings.findUnique({
    where: { clinicId: session.user.clinicId },
    select: { googleAccessToken: true, googleCalendarId: true, googleTokenExpiry: true },
  })

  const connected = !!settings?.googleAccessToken
  const expired = settings?.googleTokenExpiry
    ? new Date(settings.googleTokenExpiry) < new Date()
    : false

  return NextResponse.json({
    connected: connected && !expired,
    calendarId: settings?.googleCalendarId ?? null,
    expired,
  })
}
