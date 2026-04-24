import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { clinicId: session.user.clinicId }
    if (status) where.status = status

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { campaign: { select: { name: true } } },
    })

    return NextResponse.json(
      leads.map((l) => ({
        id: l.id,
        clinicId: l.clinicId,
        name: l.name,
        email: l.email ?? undefined,
        phone: l.phone,
        source: l.source ?? undefined,
        campaignId: l.campaignId ?? undefined,
        campaignName: l.campaign?.name ?? undefined,
        status: l.status,
        score: l.score,
        interest: l.interest ?? undefined,
        notes: l.notes ?? undefined,
        lostReason: l.lostReason ?? undefined,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error('[GET /api/leads]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, phone, email, source, campaignId, interest, notes } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'name and phone are required' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        clinicId: session.user.clinicId,
        name,
        phone,
        email: email ?? null,
        source: source ?? null,
        campaignId: campaignId ?? null,
        interest: interest ?? null,
        notes: notes ?? null,
        score: 50,
      },
    })

    return NextResponse.json({
      id: lead.id,
      clinicId: lead.clinicId,
      name: lead.name,
      phone: lead.phone,
      email: lead.email ?? undefined,
      source: lead.source ?? undefined,
      status: lead.status,
      score: lead.score,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/leads]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
