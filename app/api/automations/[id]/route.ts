import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, triggerStage, delayDays, actionType, messageTemplate, active } = body

    const automation = await (prisma as any).automation.updateMany({
      where: { id: params.id, clinicId: session.user.clinicId },
      data: {
        ...(name !== undefined && { name }),
        ...(triggerStage !== undefined && { triggerStage }),
        ...(delayDays !== undefined && { delayDays: Number(delayDays) }),
        ...(actionType !== undefined && { actionType }),
        ...(messageTemplate !== undefined && { messageTemplate }),
        ...(active !== undefined && { active }),
      },
    })

    if (automation.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await (prisma as any).automation.findFirst({ where: { id: params.id } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/automations/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await (prisma as any).automation.deleteMany({
      where: { id: params.id, clinicId: session.user.clinicId },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/automations/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
