import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const plans = await (prisma as any).accountPlan.findMany({
      where: { clinicId: session.user.clinicId },
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(plans)
  } catch (e) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { code, name, type, parentId } = await req.json()
    if (!code || !name || !type) return NextResponse.json({ error: 'code, name e type são obrigatórios' }, { status: 400 })
    const plan = await (prisma as any).accountPlan.create({
      data: { clinicId: session.user.clinicId, code, name, type, parentId: parentId ?? null },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
