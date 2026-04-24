import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function formatAppointment(apt: any) {
  return {
    id: apt.id,
    clinicId: apt.clinicId,
    patientId: apt.patientId ?? undefined,
    patientName: apt.patient?.name ?? apt.title ?? 'Bloqueio',
    professionalId: apt.professionalId,
    professionalName: apt.professional?.name ?? '',
    professionalColor: apt.professional?.color ?? '#3B82F6',
    type: apt.type,
    status: apt.status,
    title: apt.title ?? undefined,
    startTime: apt.startTime.toISOString(),
    endTime: apt.endTime.toISOString(),
    duration: apt.duration,
    isFirstVisit: apt.isFirstVisit,
    notes: apt.notes ?? undefined,
    category: apt.category ?? undefined,
    labels: apt.labels ?? [],
    procedures: (apt.procedures ?? []).map((p: any) => ({
      procedureId: p.procedureId,
      procedureName: p.procedure?.name ?? '',
      quantity: p.quantity,
      price: p.price,
      executed: p.executed,
    })),
    createdAt: apt.createdAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const professionalId = searchParams.get('professionalId')

    const date = dateParam ? new Date(dateParam) : new Date()
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const where: any = {
      clinicId: session.user.clinicId,
      startTime: { gte: startOfDay, lte: endOfDay },
    }
    if (professionalId) where.professionalId = professionalId

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        patient: { select: { name: true } },
        professional: { select: { name: true, color: true } },
        procedures: { include: { procedure: { select: { name: true } } } },
      },
    })

    return NextResponse.json(appointments.map(formatAppointment))
  } catch (error) {
    console.error('[GET /api/appointments]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patientId, professionalId, startTime, duration, type, title, notes, isFirstVisit } = body

    if (!professionalId || !startTime || !duration) {
      return NextResponse.json({ error: 'professionalId, startTime and duration are required' }, { status: 400 })
    }

    const start = new Date(startTime)
    const end = new Date(start.getTime() + duration * 60000)

    const apt = await prisma.appointment.create({
      data: {
        clinicId: session.user.clinicId,
        professionalId,
        createdById: session.user.id,
        patientId: patientId ?? null,
        startTime: start,
        endTime: end,
        duration: Number(duration),
        type: type ?? 'CONSULTATION',
        title: title ?? null,
        notes: notes ?? null,
        isFirstVisit: isFirstVisit ?? false,
      },
      include: {
        patient: { select: { name: true } },
        professional: { select: { name: true, color: true } },
        procedures: { include: { procedure: { select: { name: true } } } },
      },
    })

    return NextResponse.json(formatAppointment(apt), { status: 201 })
  } catch (error) {
    console.error('[POST /api/appointments]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
