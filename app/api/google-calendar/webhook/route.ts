/**
 * POST /api/google-calendar/webhook
 * Receives Google Calendar push notifications and syncs changed events
 * into the clinic's appointment database.
 *
 * Google sends a notification whenever a calendar event changes.
 * Register the channel via:
 *   POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/watch
 *   body: { id: "<uuid>", type: "web_hook", address: "<NEXTAUTH_URL>/api/google-calendar/webhook",
 *           token: "<GOOGLE_WEBHOOK_TOKEN>" }
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const channelToken = req.headers.get('x-goog-channel-token')
  const expectedToken = process.env.GOOGLE_WEBHOOK_TOKEN

  if (expectedToken && channelToken !== expectedToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const resourceState = req.headers.get('x-goog-resource-state')
  if (resourceState === 'sync') {
    // Initial sync notification — acknowledge and return
    return new NextResponse(null, { status: 200 })
  }

  // Find the clinic that owns this calendar channel
  const channelId = req.headers.get('x-goog-channel-id')

  // Trigger a re-sync for all clinics that have Google Calendar connected
  // In production you'd map channelId → clinicId stored when registering the watch
  const settings = await prisma.clinicSettings.findMany({
    where: { googleAccessToken: { not: null } },
    select: { clinicId: true, googleAccessToken: true, googleCalendarId: true },
    take: 50,
  })

  // Fire-and-forget incremental sync for each connected clinic
  // A real implementation would use the channelId to identify the specific clinic
  for (const s of settings) {
    if (!s.googleAccessToken || !s.googleCalendarId) continue
    try {
      const eventsRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(s.googleCalendarId)}/events?` +
        new URLSearchParams({ updatedMin: new Date(Date.now() - 5 * 60 * 1000).toISOString(), singleEvents: 'true', maxResults: '50' }),
        { headers: { Authorization: `Bearer ${s.googleAccessToken}` } },
      )
      if (!eventsRes.ok) continue
      const events = await eventsRes.json()

      for (const ev of events.items ?? []) {
        // Find matching appointment by googleEventId
        const apt = await prisma.appointment.findFirst({
          where: { clinicId: s.clinicId, googleEventId: ev.id },
        })
        if (!apt) continue

        // Update appointment status if event is cancelled
        if (ev.status === 'cancelled') {
          await prisma.appointment.update({
            where: { id: apt.id },
            data: { status: 'CANCELLED' },
          })
        }
      }
    } catch (err) {
      console.error('[gcal webhook] sync error for clinic', s.clinicId, err)
    }
  }

  return new NextResponse(null, { status: 200 })
}
