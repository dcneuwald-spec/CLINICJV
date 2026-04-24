import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const goal = await prisma.goal.findFirst({
      where: { id: params.id, clinicId: session.user.clinicId },
      include: { professional: { select: { name: true } } },
    })
    if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const pct = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0
    return NextResponse.json({ ...goal, percentComplete: pct, startDate: goal.startDate.toISOString(), endDate: goal.endDate.toISOString(), createdAt: goal.createdAt.toISOString(), updatedAt: goal.updatedAt.toISOString() })
  } catch (error) {
    console.error('[GET /api/goals/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const data: any = {}
    if (body.title !== undefined) data.title = body.title
    if (body.currentValue !== undefined) data.currentValue = Number(body.currentValue)
    if (body.targetValue !== undefined) data.targetValue = Number(body.targetValue)
    if (body.status !== undefined) data.status = body.status

    const goal = await prisma.goal.update({ where: { id: params.id }, data, include: { professional: { select: { name: true } } } })
    const pct = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0
    return NextResponse.json({ ...goal, percentComplete: pct, startDate: goal.startDate.toISOString(), endDate: goal.endDate.toISOString(), createdAt: goal.createdAt.toISOString(), updatedAt: goal.updatedAt.toISOString() })
  } catch (error) {
    console.error('[PUT /api/goals/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.goal.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/goals/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
