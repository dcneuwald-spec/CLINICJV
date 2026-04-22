import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteParams = { params: { id: string } }

function serializeProfessional(p: {
  id: string
  clinicId: string
  name: string
  specialty: string
  crm: string | null
  color: string
  phone: string | null
  email: string | null
  avatar: string | null
  commission: number
  active: boolean
}) {
  return {
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
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const professional = await prisma.professional.findUnique({
      where: { id: params.id },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    if (professional.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(serializeProfessional(professional))
  } catch (error) {
    console.error('[GET /api/professionals/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.professional.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }
    if (existing.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, specialty, crm, color, phone, email, commission, active } = body

    const updated = await prisma.professional.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(specialty !== undefined && { specialty }),
        ...(crm !== undefined && { crm }),
        ...(color !== undefined && { color }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(commission !== undefined && { commission }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json(serializeProfessional(updated))
  } catch (error) {
    console.error('[PUT /api/professionals/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.professional.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }
    if (existing.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.professional.update({
      where: { id: params.id },
      data: { active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/professionals/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
