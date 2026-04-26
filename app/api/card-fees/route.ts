import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const fees = await (prisma as any).cardFee.findMany({
      where: { clinicId: session.user.clinicId },
      orderBy: [{ brand: 'asc' }, { cardType: 'asc' }, { installments: 'asc' }],
    })
    return NextResponse.json(fees)
  } catch (e) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    // Bulk upsert: receive array of fee objects
    const items: any[] = Array.isArray(body) ? body : [body]
    const results = []
    for (const item of items) {
      const { brand, cardType, installments, feePercent } = item
      if (!brand || !cardType || !installments || feePercent == null) continue
      // Check if fee already exists for this combination
      const existing = await (prisma as any).cardFee.findFirst({
        where: { clinicId: session.user.clinicId, brand, cardType, installments },
      })
      if (existing) {
        const updated = await (prisma as any).cardFee.update({ where: { id: existing.id }, data: { feePercent: Number(feePercent) } })
        results.push(updated)
      } else {
        const created = await (prisma as any).cardFee.create({
          data: { clinicId: session.user.clinicId, brand, cardType, installments, feePercent: Number(feePercent) },
        })
        results.push(created)
      }
    }
    return NextResponse.json(results, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
