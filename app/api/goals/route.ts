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

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { professional: { select: { name: true } } },
    })

    return NextResponse.json(
      goals.map((g) => {
        const pct = g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0
        return {
          id: g.id,
          clinicId: g.clinicId,
          professionalId: g.professionalId ?? undefined,
          professionalName: g.professional?.name ?? undefined,
          title: g.title,
          metric: g.metric,
          targetValue: g.targetValue,
          currentValue: g.currentValue,
          percentComplete: Math.round(pct * 10) / 10,
          period: g.period,
          startDate: g.startDate.toISOString(),
          endDate: g.endDate.toISOString(),
          status: g.status,
          createdAt: g.createdAt.toISOString(),
        }
      })
    )
  } catch (error) {
    console.error('[GET /api/goals]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, metric, targetValue, currentValue, period, startDate, endDate, professionalId } = body

    if (!title || !metric || targetValue === undefined || !period || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const goal = await prisma.goal.create({
      data: {
        clinicId: session.user.clinicId,
        title,
        metric,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue ?? 0),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        professionalId: professionalId ?? null,
      },
    })

    const pct = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0
    return NextResponse.json({ ...goal, percentComplete: pct, startDate: goal.startDate.toISOString(), endDate: goal.endDate.toISOString(), createdAt: goal.createdAt.toISOString(), updatedAt: goal.updatedAt.toISOString() }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/goals]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
