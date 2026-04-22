import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const professionals = await prisma.professional.findMany({
      where: {
        clinicId: session.user.clinicId,
        active: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(
      professionals.map((p) => ({
        id: p.id,
        clinicId: p.clinicId,
        name: p.name,
        specialty: p.specialty,
        crm: p.crm ?? undefined,
        color: p.color,
        phone: p.phone ?? undefined,
        email: p.email ?? undefined,
        avatar: p.avatar ?? undefined,
        commission: p.commission,
        active: p.active,
      }))
    )
  } catch (error) {
    console.error('[GET /api/professionals]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, specialty, crm, color, phone, email, commission } = body

    if (!name || !specialty) {
      return NextResponse.json({ error: 'name and specialty are required' }, { status: 400 })
    }

    const professional = await prisma.professional.create({
      data: {
        clinicId: session.user.clinicId,
        name,
        specialty,
        crm: crm ?? null,
        color: color ?? '#3B82F6',
        phone: phone ?? null,
        email: email ?? null,
        commission: commission ?? 0,
      },
    })

    return NextResponse.json(
      {
        id: professional.id,
        clinicId: professional.clinicId,
        name: professional.name,
        specialty: professional.specialty,
        crm: professional.crm ?? undefined,
        color: professional.color,
        phone: professional.phone ?? undefined,
        email: professional.email ?? undefined,
        avatar: professional.avatar ?? undefined,
        commission: professional.commission,
        active: professional.active,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/professionals]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
