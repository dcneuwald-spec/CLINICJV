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

    const budgets = await prisma.budget.findMany({
      where: { clinicId: session.user.clinicId },
      include: {
        patient: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = budgets.map((b) => ({
      id: b.id,
      clinicId: b.clinicId,
      patientId: b.patientId,
      patientName: b.patient.name,
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
      items: b.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        executed: item.executed,
        procedureId: item.procedureId,
      })),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/budgets]', error)
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
    const { patientId, title, notes, validUntil, items, discount } = body

    if (!patientId) {
      return NextResponse.json({ error: 'Missing required field: patientId' }, { status: 400 })
    }

    // Verify patient belongs to clinic
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId: session.user.clinicId },
    })
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Auto-generate budget number: ORC-{YYYY}-{sequence}
    const year = new Date().getFullYear()
    const countThisYear = await prisma.budget.count({
      where: {
        clinicId: session.user.clinicId,
        number: { startsWith: `ORC-${year}-` },
      },
    })
    const sequence = String(countThisYear + 1).padStart(4, '0')
    const number = `ORC-${year}-${sequence}`

    // Calculate totalAmount from items
    const itemsArray: Array<{ description: string; quantity: number; unitPrice: number; procedureId?: string }> =
      Array.isArray(items) ? items : []
    const totalAmount = itemsArray.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const discountValue = Number(discount ?? 0)
    const finalAmount = totalAmount - discountValue

    const budget = await prisma.budget.create({
      data: {
        clinicId: session.user.clinicId,
        patientId,
        number,
        title: title ?? null,
        notes: notes ?? null,
        validUntil: validUntil ? new Date(validUntil) : null,
        totalAmount,
        discount: discountValue,
        finalAmount,
        status: 'draft',
        items: {
          create: itemsArray.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            procedureId: item.procedureId ?? null,
          })),
        },
      },
      include: {
        patient: { select: { id: true, name: true } },
        items: true,
      },
    })

    return NextResponse.json(
      {
        id: budget.id,
        clinicId: budget.clinicId,
        patientId: budget.patientId,
        patientName: budget.patient.name,
        number: budget.number,
        title: budget.title,
        status: budget.status,
        totalAmount: budget.totalAmount,
        discount: budget.discount,
        finalAmount: budget.finalAmount,
        validUntil: budget.validUntil?.toISOString() ?? null,
        notes: budget.notes,
        approvedAt: budget.approvedAt?.toISOString() ?? null,
        rejectedAt: budget.rejectedAt?.toISOString() ?? null,
        createdAt: budget.createdAt.toISOString(),
        updatedAt: budget.updatedAt.toISOString(),
        items: budget.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          executed: item.executed,
          procedureId: item.procedureId,
        })),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/budgets]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
