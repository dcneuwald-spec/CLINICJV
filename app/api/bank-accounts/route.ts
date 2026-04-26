import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const accounts = await (prisma as any).bankAccount.findMany({
      where: { clinicId: session.user.clinicId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(accounts)
  } catch (e) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name, bank, agency, account, type, balance } = await req.json()
    if (!name) return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 })
    const ba = await (prisma as any).bankAccount.create({
      data: { clinicId: session.user.clinicId, name, bank: bank ?? null, agency: agency ?? null, account: account ?? null, type: type ?? 'checking', balance: Number(balance ?? 0) },
    })
    return NextResponse.json(ba, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
