import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// { transactionId, bankDescription, bankDate, bankAmount }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { confirmations }: { confirmations: Array<{ transactionId: string; bankDescription: string; bankDate: string; bankAmount: number }> } = await req.json()

    if (!Array.isArray(confirmations) || confirmations.length === 0) {
      return NextResponse.json({ error: 'confirmations obrigatório' }, { status: 400 })
    }

    const updated: string[] = []
    for (const c of confirmations) {
      const tx = await prisma.financialTransaction.findFirst({
        where: { id: c.transactionId, clinicId: session.user.clinicId },
      })
      if (!tx) continue

      const note = `Conciliado em ${new Date().toLocaleDateString('pt-BR')} | Extrato: "${c.bankDescription}" ${new Date(c.bankDate).toLocaleDateString('pt-BR')} R$${Math.abs(c.bankAmount).toFixed(2)}`

      await prisma.financialTransaction.update({
        where: { id: c.transactionId },
        data: {
          status: tx.status === 'PENDING' || tx.status === 'OVERDUE' ? 'PAID' : tx.status,
          paidDate: tx.paidDate ?? new Date(c.bankDate),
          notes: tx.notes ? `${tx.notes}\n${note}` : note,
        },
      })
      updated.push(c.transactionId)
    }

    return NextResponse.json({ updated })
  } catch (e) {
    console.error('[POST /api/reconciliation/confirm]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
