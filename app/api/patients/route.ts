import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: any = {
      clinicId: session.user.clinicId,
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        financials: {
          select: { amount: true, amountPaid: true, status: true },
        },
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 1,
          select: { startTime: true },
        },
        _count: {
          select: { appointments: true },
        },
      },
    })

    const result = patients.map((patient) => {
      const totalSpent = patient.financials
        .filter((f) => f.status === 'PAID')
        .reduce((sum, f) => sum + f.amountPaid, 0)

      const lastVisit =
        patient.appointments[0]?.startTime?.toISOString() ?? patient.lastVisit?.toISOString() ?? null

      return {
        id: patient.id,
        clinicId: patient.clinicId,
        name: patient.name,
        nickname: patient.nickname ?? undefined,
        email: patient.email ?? undefined,
        phone: patient.phone,
        whatsapp: patient.whatsapp ?? undefined,
        birthDate: patient.birthDate?.toISOString() ?? undefined,
        cpf: patient.cpf ?? undefined,
        gender: patient.gender ?? undefined,
        referralSource: patient.referralSource ?? undefined,
        address: patient.address ?? undefined,
        city: patient.city ?? undefined,
        state: patient.state ?? undefined,
        status: patient.status,
        registrationNum: patient.registrationNum ?? undefined,
        firstVisit: patient.firstVisit?.toISOString() ?? undefined,
        lastVisit: lastVisit ?? undefined,
        totalSpent,
        npsScore: patient.npsScore ?? undefined,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[GET /api/patients]', error)
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
    const { name, phone, email, birthDate, cpf, gender, address, city, state, referralSource, notes } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'name and phone are required' }, { status: 400 })
    }

    const registrationNum = `PAC-${Date.now()}`

    const patient = await prisma.patient.create({
      data: {
        clinicId: session.user.clinicId,
        name,
        phone,
        registrationNum,
        email: email ?? null,
        birthDate: birthDate ? new Date(birthDate) : null,
        cpf: cpf ?? null,
        gender: gender ?? null,
        address: address ?? null,
        city: city ?? null,
        state: state ?? null,
        referralSource: referralSource ?? null,
        notes: notes ?? null,
      },
    })

    return NextResponse.json(
      {
        id: patient.id,
        clinicId: patient.clinicId,
        name: patient.name,
        phone: patient.phone,
        email: patient.email ?? undefined,
        birthDate: patient.birthDate?.toISOString() ?? undefined,
        cpf: patient.cpf ?? undefined,
        gender: patient.gender ?? undefined,
        address: patient.address ?? undefined,
        city: patient.city ?? undefined,
        state: patient.state ?? undefined,
        referralSource: patient.referralSource ?? undefined,
        notes: patient.notes ?? undefined,
        status: patient.status,
        registrationNum: patient.registrationNum ?? undefined,
        totalSpent: patient.totalSpent,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/patients]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
