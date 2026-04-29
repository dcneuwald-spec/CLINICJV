import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { clinicId: session.user.clinicId }
    if (startDate) where.date = { ...where.date, gte: new Date(startDate) }
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) }

    const reports = await (prisma as any).dailyReport.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(reports)
  } catch (e) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { date, ...fields } = body
    if (!date) return NextResponse.json({ error: 'date obrigatório' }, { status: 400 })

    const data: any = {
      clinicId: session.user.clinicId,
      date: new Date(date),
    }

    const numFields = ['revenue', 'ticketMedio', 'attendedRevenue', 'pa']
    const intFields = [
      'leadsTotal', 'leadsOrganic', 'leadsClients', 'leadsTraffic', 'leadsReferral',
      'leadsScheduled', 'attendedLeads', 'attendedTraffic', 'productsSold',
      'reactivations7d', 'reactivationsScheduled',
    ]
    for (const f of numFields) if (fields[f] !== undefined) data[f] = Number(fields[f])
    for (const f of intFields) if (fields[f] !== undefined) data[f] = parseInt(fields[f])

    const report = await (prisma as any).dailyReport.upsert({
      where: { clinicId_date: { clinicId: session.user.clinicId, date: new Date(date) } },
      update: data,
      create: data,
    })

    return NextResponse.json(report, { status: 201 })
  } catch (e) {
    console.error('[POST /api/gerencial]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
