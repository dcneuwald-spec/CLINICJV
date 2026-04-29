import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { date: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const report = await (prisma as any).dailyReport.findFirst({
      where: { clinicId: session.user.clinicId, date: new Date(params.date) },
    })

    return NextResponse.json(report ?? null)
  } catch (e) {
    return NextResponse.json(null)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { date: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const fields = await req.json()
    const data: any = {}

    const numFields = ['revenue', 'ticketMedio', 'attendedRevenue', 'pa']
    const intFields = [
      'leadsTotal', 'leadsOrganic', 'leadsClients', 'leadsTraffic', 'leadsReferral',
      'leadsScheduled', 'attendedLeads', 'attendedTraffic', 'productsSold',
      'reactivations7d', 'reactivationsScheduled',
    ]
    for (const f of numFields) if (fields[f] !== undefined) data[f] = Number(fields[f])
    for (const f of intFields) if (fields[f] !== undefined) data[f] = parseInt(fields[f])

    const report = await (prisma as any).dailyReport.upsert({
      where: { clinicId_date: { clinicId: session.user.clinicId, date: new Date(params.date) } },
      update: data,
      create: { clinicId: session.user.clinicId, date: new Date(params.date), ...data },
    })

    return NextResponse.json(report)
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
