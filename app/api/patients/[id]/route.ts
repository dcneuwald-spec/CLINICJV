import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteParams = { params: { id: string } }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 10,
          include: {
            professional: { select: { name: true, color: true } },
            procedures: {
              include: { procedure: { select: { name: true } } },
            },
          },
        },
        financials: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        budgets: {
          include: { items: true },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    if (patient.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      ...patient,
      birthDate: patient.birthDate?.toISOString() ?? null,
      firstVisit: patient.firstVisit?.toISOString() ?? null,
      lastVisit: patient.lastVisit?.toISOString() ?? null,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
      appointments: patient.appointments.map((a) => ({
        ...a,
        startTime: a.startTime.toISOString(),
        endTime: a.endTime.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      financials: patient.financials.map((f) => ({
        ...f,
        dueDate: f.dueDate.toISOString(),
        paidDate: f.paidDate?.toISOString() ?? null,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
      budgets: patient.budgets.map((b) => ({
        ...b,
        validUntil: b.validUntil?.toISOString() ?? null,
        approvedAt: b.approvedAt?.toISOString() ?? null,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('[GET /api/patients/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.patient.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    if (existing.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name, phone, email, birthDate, cpf, gender,
      address, city, state, referralSource, notes,
      nickname, whatsapp, status, npsScore,
    } = body

    const updated = await prisma.patient.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
        ...(cpf !== undefined && { cpf }),
        ...(gender !== undefined && { gender }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(referralSource !== undefined && { referralSource }),
        ...(notes !== undefined && { notes }),
        ...(nickname !== undefined && { nickname }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(status !== undefined && { status }),
        ...(npsScore !== undefined && { npsScore }),
      },
    })

    return NextResponse.json({
      ...updated,
      birthDate: updated.birthDate?.toISOString() ?? null,
      firstVisit: updated.firstVisit?.toISOString() ?? null,
      lastVisit: updated.lastVisit?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[PUT /api/patients/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.patient.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    if (existing.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.patient.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/patients/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
