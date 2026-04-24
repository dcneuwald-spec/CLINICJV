/**
 * POST /api/google-calendar/sync
 * Syncs the clinic's appointments to Google Calendar.
 * Creates/updates events for appointments in the next 30 days.
 *
 * POST /api/google-calendar/sync?push=1
 * Pushes a single appointment ID to Google Calendar:
 *   body: { appointmentId }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

async function getAccessToken(clinicId: string): Promise<string | null> {
  const settings = await prisma.clinicSettings.findUnique({
    where: { clinicId },
    select: { googleAccessToken: true, googleRefreshToken: true, googleTokenExpiry: true },
  })
  if (!settings?.googleAccessToken) return null

  const expired = settings.googleTokenExpiry
    ? new Date(settings.googleTokenExpiry) < new Date(Date.now() + 60000)
    : false

  if (!expired) return settings.googleAccessToken

  if (!settings.googleRefreshToken) return null

  // Refresh token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: settings.googleRefreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) return null
  const tokens = await res.json()
  await prisma.clinicSettings.update({
    where: { clinicId },
    data: {
      googleAccessToken: tokens.access_token,
      googleTokenExpiry: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    },
  })
  return tokens.access_token
}

async function upsertGcalEvent(
  accessToken: string,
  calendarId: string,
  apt: any,
): Promise<string | null> {
  const event = {
    summary: apt.patient?.name ?? apt.title ?? 'Consulta',
    description: [
      apt.professional?.name ? `Profissional: ${apt.professional.name}` : '',
      apt.notes ? `Obs: ${apt.notes}` : '',
    ].filter(Boolean).join('\n'),
    start: { dateTime: apt.startTime.toISOString(), timeZone: 'America/Sao_Paulo' },
    end: { dateTime: apt.endTime.toISOString(), timeZone: 'America/Sao_Paulo' },
    status: apt.status === 'CANCELLED' ? 'cancelled' : 'confirmed',
  }

  const method = apt.googleEventId ? 'PUT' : 'POST'
  const url = apt.googleEventId
    ? `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${apt.googleEventId}`
    : `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`

  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  if (!res.ok) {
    console.error('[gcal sync] upsert failed', await res.text())
    return null
  }
  const data = await res.json()
  return data.id
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const clinicId = session.user.clinicId

  const settings = await prisma.clinicSettings.findUnique({
    where: { clinicId },
    select: { googleAccessToken: true, googleCalendarId: true },
  })
  if (!settings?.googleAccessToken) {
    return NextResponse.json({ error: 'Google Calendar não conectado' }, { status: 400 })
  }

  const accessToken = await getAccessToken(clinicId)
  if (!accessToken) return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 })
  const calendarId = settings.googleCalendarId ?? 'primary'

  const { searchParams } = new URL(req.url)
  const pushOne = searchParams.get('push') === '1'

  if (pushOne) {
    const { appointmentId } = await req.json()
    const apt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: { select: { name: true } }, professional: { select: { name: true } } },
    })
    if (!apt || apt.clinicId !== clinicId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const eventId = await upsertGcalEvent(accessToken, calendarId, apt)
    if (eventId && !apt.googleEventId) {
      await prisma.appointment.update({ where: { id: apt.id }, data: { googleEventId: eventId } })
    }
    return NextResponse.json({ ok: true, eventId })
  }

  // Full sync: next 30 days
  const apts = await prisma.appointment.findMany({
    where: { clinicId, startTime: { gte: new Date(), lte: addDays(new Date(), 30) } },
    include: { patient: { select: { name: true } }, professional: { select: { name: true } } },
  })

  let synced = 0
  for (const apt of apts) {
    const eventId = await upsertGcalEvent(accessToken, calendarId, apt)
    if (eventId && !apt.googleEventId) {
      await prisma.appointment.update({ where: { id: apt.id }, data: { googleEventId: eventId } })
      synced++
    }
  }

  return NextResponse.json({ ok: true, synced, total: apts.length })
}
