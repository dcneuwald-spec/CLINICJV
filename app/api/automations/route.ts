import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const automations = await (prisma as any).automation.findMany({
      where: { clinicId: session.user.clinicId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(automations)
  } catch (error) {
    console.error('[GET /api/automations]', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, triggerStage, delayDays, actionType, messageTemplate } = body

    if (!name || !triggerStage || !messageTemplate) {
      return NextResponse.json({ error: 'name, triggerStage e messageTemplate são obrigatórios' }, { status: 400 })
    }

    const automation = await (prisma as any).automation.create({
      data: {
        clinicId: session.user.clinicId,
        name,
        triggerStage,
        delayDays: Number(delayDays ?? 1),
        actionType: actionType ?? 'whatsapp',
        messageTemplate,
        active: true,
      },
    })

    return NextResponse.json(automation, { status: 201 })
  } catch (error) {
    console.error('[POST /api/automations]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
