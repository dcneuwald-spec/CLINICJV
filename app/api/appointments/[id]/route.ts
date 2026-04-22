import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

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

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apt = await prisma.appointment.findFirst({
      where: { id: params.id, clinicId: session.user.clinicId },
      include: {
        patient: { select: { name: true } },
        professional: { select: { name: true, color: true } },
        procedures: { include: { procedure: { select: { name: true } } } },
      },
    })
    if (!apt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(formatAppointment(apt))
  } catch (error) {
    console.error('[GET /api/appointments/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { status, notes, cancelReason, title, startTime, duration } = body

    const data: any = {}
    if (status !== undefined) {
      data.status = status
      if (status === 'CANCELLED') {
        data.cancelledAt = new Date()
        if (cancelReason) data.cancelReason = cancelReason
      }
      if (status === 'CONFIRMED') data.confirmed = true
      if (status === 'WAITING') data.checkedIn = true
    }
    if (notes !== undefined) data.notes = notes
    if (title !== undefined) data.title = title
    if (startTime !== undefined) {
      data.startTime = new Date(startTime)
      const dur = duration ?? 60
      data.endTime = new Date(new Date(startTime).getTime() + dur * 60000)
      data.duration = dur
    }

    const apt = await prisma.appointment.update({
      where: { id: params.id },
      data,
      include: {
        patient: { select: { name: true } },
        professional: { select: { name: true, color: true } },
        procedures: { include: { procedure: { select: { name: true } } } },
      },
    })
    return NextResponse.json(formatAppointment(apt))
  } catch (error) {
    console.error('[PUT /api/appointments/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.appointment.update({
      where: { id: params.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/appointments/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
