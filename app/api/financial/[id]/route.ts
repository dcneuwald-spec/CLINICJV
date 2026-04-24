import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transaction = await prisma.financialTransaction.findFirst({
      where: { id: params.id, clinicId: session.user.clinicId },
      include: { patient: { select: { id: true, name: true } } },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: transaction.id,
      clinicId: transaction.clinicId,
      patientId: transaction.patientId,
      patientName: transaction.patient?.name ?? null,
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      amount: transaction.amount,
      amountPaid: transaction.amountPaid,
      dueDate: transaction.dueDate.toISOString(),
      paidDate: transaction.paidDate?.toISOString() ?? null,
      paymentMethod: transaction.paymentMethod,
      installments: transaction.installments,
      installmentNum: transaction.installmentNum,
      category: transaction.category,
      notes: transaction.notes,
      invoiceNumber: transaction.invoiceNumber,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/financial/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.financialTransaction.findFirst({
      where: { id: params.id, clinicId: session.user.clinicId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const body = await req.json()
    const { status, description, amount, dueDate, paymentMethod, category, notes, amountPaid } = body

    const updateData: any = {}

    if (description !== undefined) updateData.description = description
    if (amount !== undefined) updateData.amount = Number(amount)
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate)
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod
    if (category !== undefined) updateData.category = category
    if (notes !== undefined) updateData.notes = notes

    if (status !== undefined) {
      updateData.status = status
      // Marking as PAID — set paidDate and amountPaid
      if (status === 'PAID') {
        updateData.paidDate = new Date()
        updateData.amountPaid = amountPaid != null ? Number(amountPaid) : existing.amount
      }
    }

    // Allow explicit amountPaid override even without status change
    if (amountPaid !== undefined && status !== 'PAID') {
      updateData.amountPaid = Number(amountPaid)
    }

    const updated = await prisma.financialTransaction.update({
      where: { id: params.id },
      data: updateData,
      include: { patient: { select: { id: true, name: true } } },
    })

    return NextResponse.json({
      id: updated.id,
      clinicId: updated.clinicId,
      patientId: updated.patientId,
      patientName: updated.patient?.name ?? null,
      type: updated.type,
      status: updated.status,
      description: updated.description,
      amount: updated.amount,
      amountPaid: updated.amountPaid,
      dueDate: updated.dueDate.toISOString(),
      paidDate: updated.paidDate?.toISOString() ?? null,
      paymentMethod: updated.paymentMethod,
      installments: updated.installments,
      installmentNum: updated.installmentNum,
      category: updated.category,
      notes: updated.notes,
      invoiceNumber: updated.invoiceNumber,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[PUT /api/financial/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.financialTransaction.findFirst({
      where: { id: params.id, clinicId: session.user.clinicId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const updated = await prisma.financialTransaction.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ id: updated.id, status: updated.status })
  } catch (error) {
    console.error('[DELETE /api/financial/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
