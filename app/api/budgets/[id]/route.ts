import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

function serializeBudget(b: any) {
  return {
    id: b.id,
    clinicId: b.clinicId,
    patientId: b.patientId,
    patientName: b.patient?.name ?? null,
    number: b.number,
    title: b.title,
    status: b.status,
    totalAmount: b.totalAmount,
    discount: b.discount,
    finalAmount: b.finalAmount,
    validUntil: b.validUntil?.toISOString() ?? null,
    notes: b.notes,
    approvedAt: b.approvedAt?.toISOString() ?? null,
    rejectedAt: b.rejectedAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    items: (b.items ?? []).map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      executed: item.executed,
      procedureId: item.procedureId,
    })),
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const budget = await prisma.budget.findFirst({
      where: { id: params.id, clinicId: session.user.clinicId },
      include: {
        patient: { select: { id: true, name: true, phone: true, email: true } },
        items: true,
      },
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    return NextResponse.json(serializeBudget(budget))
  } catch (error) {
    console.error('[GET /api/budgets/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.budget.findFirst({
      where: { id: params.id, clinicId: session.user.clinicId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    const body = await req.json()
    const { status, title, notes, validUntil, discount } = body

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (notes !== undefined) updateData.notes = notes
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null
    if (discount !== undefined) {
      updateData.discount = Number(discount)
      updateData.finalAmount = existing.totalAmount - Number(discount)
    }

    if (status !== undefined) {
      updateData.status = status
      // Status transition logic
      if (status === 'approved') {
        updateData.approvedAt = new Date()
      } else if (status === 'rejected') {
        updateData.rejectedAt = new Date()
      }
    }

    const updated = await prisma.budget.update({
      where: { id: params.id },
      data: updateData,
      include: {
        patient: { select: { id: true, name: true } },
        items: true,
      },
    })

    return NextResponse.json(serializeBudget(updated))
  } catch (error) {
    console.error('[PUT /api/budgets/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.budget.findFirst({
      where: { id: params.id, clinicId: session.user.clinicId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft budgets can be deleted' },
        { status: 400 }
      )
    }

    await prisma.budget.delete({ where: { id: params.id } })

    return NextResponse.json({ id: params.id, deleted: true })
  } catch (error) {
    console.error('[DELETE /api/budgets/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
