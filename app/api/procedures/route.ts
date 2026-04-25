import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const procedures = await prisma.procedure.findMany({
      where: { clinicId: session.user.clinicId, active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, duration: true, price: true, category: true },
    })

    return NextResponse.json(procedures)
  } catch (error) {
    console.error('[GET /api/procedures]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
