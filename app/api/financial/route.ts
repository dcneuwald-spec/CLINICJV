import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null
    const status = searchParams.get('status') as 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIAL' | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { clinicId: session.user.clinicId }
    if (type) where.type = type
    if (status) where.status = status
    if (startDate || endDate) {
      where.dueDate = {}
      if (startDate) where.dueDate.gte = new Date(startDate)
      if (endDate) where.dueDate.lte = new Date(endDate)
    }

    const transactions = await prisma.financialTransaction.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'desc' },
    })

    const data = transactions.map((t) => ({
      id: t.id,
      clinicId: t.clinicId,
      patientId: t.patientId,
      patientName: t.patient?.name ?? null,
      type: t.type,
      status: t.status,
      description: t.description,
      amount: t.amount,
      amountPaid: t.amountPaid,
      dueDate: t.dueDate.toISOString(),
      paidDate: t.paidDate?.toISOString() ?? null,
      paymentMethod: t.paymentMethod,
      installments: t.installments,
      installmentNum: t.installmentNum,
      category: t.category,
      notes: t.notes,
      invoiceNumber: t.invoiceNumber,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/financial]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, description, amount, dueDate, patientId, paymentMethod, category, notes, installments } = body

    if (!type || !description || amount == null || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: type, description, amount, dueDate' },
        { status: 400 }
      )
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be INCOME or EXPENSE' }, { status: 400 })
    }

    const transaction = await prisma.financialTransaction.create({
      data: {
        clinicId: session.user.clinicId,
        type,
        description,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        status: 'PENDING',
        patientId: patientId ?? null,
        paymentMethod: paymentMethod ?? null,
        category: category ?? null,
        notes: notes ?? null,
        installments: installments ? Number(installments) : 1,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/financial]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
