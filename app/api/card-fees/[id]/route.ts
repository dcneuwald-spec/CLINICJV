import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { feePercent, active } = await req.json()
    const data: any = {}
    if (feePercent !== undefined) data.feePercent = Number(feePercent)
    if (active !== undefined) data.active = active
    await (prisma as any).cardFee.updateMany({ where: { id: params.id, clinicId: session.user.clinicId }, data })
    const updated = await (prisma as any).cardFee.findFirst({ where: { id: params.id } })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await (prisma as any).cardFee.deleteMany({ where: { id: params.id, clinicId: session.user.clinicId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
