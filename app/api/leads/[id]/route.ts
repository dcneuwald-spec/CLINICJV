import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, clinicId: session.user.clinicId },
      include: { interactions: { orderBy: { createdAt: 'desc' } } },
    })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
      convertedAt: lead.convertedAt?.toISOString() ?? null,
      lostAt: lead.lostAt?.toISOString() ?? null,
    })
  } catch (error) {
    console.error('[GET /api/leads/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { status, score, notes, lostReason, interest, name, phone, email, source } = body

    const data: any = {}
    if (status !== undefined) {
      data.status = status
      if (status === 'CONVERTED') data.convertedAt = new Date()
      if (status === 'LOST') {
        data.lostAt = new Date()
        if (lostReason) data.lostReason = lostReason
      }
    }
    if (score !== undefined) data.score = score
    if (notes !== undefined) data.notes = notes
    if (interest !== undefined) data.interest = interest
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = phone
    if (email !== undefined) data.email = email
    if (source !== undefined) data.source = source

    const lead = await prisma.lead.update({ where: { id: params.id }, data })
    return NextResponse.json({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[PUT /api/leads/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.lead.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/leads/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
