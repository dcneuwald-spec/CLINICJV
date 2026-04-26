import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export interface BankEntry {
  id: string
  date: string
  description: string
  amount: number // positive = credit, negative = debit
}

export interface MatchSuggestion {
  transactionId: string
  description: string
  amount: number
  dueDate: string
  type: string
  status: string
  patientName: string | null
  confidence: number // 0-100
  reasons: string[]
}

export interface MatchResult {
  bankEntry: BankEntry
  suggestions: MatchSuggestion[]
}

function scoreMatch(entry: BankEntry, tx: any): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Amount match (max 60 pts)
  const entryAbs = Math.abs(entry.amount)
  const txAmt = tx.amount
  const diff = Math.abs(entryAbs - txAmt)
  const pct = txAmt > 0 ? (diff / txAmt) * 100 : 100

  if (diff === 0) {
    score += 60; reasons.push('Valor exato')
  } else if (pct <= 0.5) {
    score += 50; reasons.push('Valor quase idêntico (<0.5%)')
  } else if (pct <= 2) {
    score += 35; reasons.push('Valor muito próximo (<2%)')
  } else if (pct <= 5) {
    score += 20; reasons.push('Valor próximo (<5%)')
  }

  // Date proximity (max 30 pts)
  const entryDate = new Date(entry.date)
  const txDate = new Date(tx.dueDate)
  const daysDiff = Math.abs((entryDate.getTime() - txDate.getTime()) / 86400000)

  if (daysDiff === 0) {
    score += 30; reasons.push('Mesma data')
  } else if (daysDiff <= 1) {
    score += 25; reasons.push(`±${Math.round(daysDiff)} dia`)
  } else if (daysDiff <= 3) {
    score += 18; reasons.push(`±${Math.round(daysDiff)} dias`)
  } else if (daysDiff <= 7) {
    score += 10; reasons.push(`±${Math.round(daysDiff)} dias`)
  } else if (daysDiff <= 15) {
    score += 4
  }

  // Description similarity (max 10 pts) — token overlap
  const entryTokens = entry.description.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2)
  const txTokens = (tx.description || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((t: string) => t.length > 2)
  const overlap = entryTokens.filter(t => txTokens.includes(t)).length
  if (overlap > 0) {
    const sim = overlap / Math.max(entryTokens.length, txTokens.length, 1)
    const pts = Math.round(sim * 10)
    if (pts > 0) { score += pts; reasons.push('Descrição similar') }
  }

  return { score, reasons }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { entries, dateRange }: { entries: BankEntry[]; dateRange?: { start: string; end: string } } = await req.json()

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'entries obrigatório' }, { status: 400 })
    }

    // Load DB transactions in the date window (±30 days of entry dates)
    const dates = entries.map(e => new Date(e.date).getTime()).filter(d => !isNaN(d))
    const minDate = new Date(Math.min(...dates) - 30 * 86400000)
    const maxDate = new Date(Math.max(...dates) + 30 * 86400000)

    const transactions = await prisma.financialTransaction.findMany({
      where: {
        clinicId: session.user.clinicId,
        dueDate: { gte: dateRange?.start ? new Date(dateRange.start) : minDate, lte: dateRange?.end ? new Date(dateRange.end) : maxDate },
        status: { not: 'CANCELLED' },
      },
      include: { patient: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
    })

    const results: MatchResult[] = entries.map(entry => {
      // credit (positive) → INCOME; debit (negative) → EXPENSE
      const expectedType = entry.amount >= 0 ? 'INCOME' : 'EXPENSE'

      const scored = transactions
        .filter(tx => tx.type === expectedType)
        .map(tx => {
          const { score, reasons } = scoreMatch(entry, tx)
          return { tx, score, reasons }
        })
        .filter(s => s.score >= 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      const suggestions: MatchSuggestion[] = scored.map(({ tx, score, reasons }) => ({
        transactionId: tx.id,
        description: tx.description,
        amount: tx.amount,
        dueDate: tx.dueDate.toISOString(),
        type: tx.type,
        status: tx.status,
        patientName: (tx as any).patient?.name ?? null,
        confidence: Math.min(score, 100),
        reasons,
      }))

      return { bankEntry: entry, suggestions }
    })

    return NextResponse.json(results)
  } catch (e) {
    console.error('[POST /api/reconciliation]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
