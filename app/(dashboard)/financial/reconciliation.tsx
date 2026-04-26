'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle,
  ArrowRight, RefreshCw, ChevronDown, Banknote, Search, X,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankEntry {
  id: string
  date: string
  description: string
  amount: number
}

interface MatchSuggestion {
  transactionId: string
  description: string
  amount: number
  dueDate: string
  type: string
  status: string
  patientName: string | null
  confidence: number
  reasons: string[]
}

interface MatchResult {
  bankEntry: BankEntry
  suggestions: MatchSuggestion[]
}

type Decision = 'accepted' | 'rejected' | 'ignored'

// ─── OFX Parser ───────────────────────────────────────────────────────────────

function parseOFX(text: string): BankEntry[] {
  const entries: BankEntry[] = []
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let match: RegExpExecArray | null
  let idx = 0
  while ((match = trnRegex.exec(text)) !== null) {
    const block = match[1]
    const get = (tag: string) => {
      const m = new RegExp(`<${tag}>([^<\r\n]+)`, 'i').exec(block)
      return m ? m[1].trim() : ''
    }
    const rawDate = get('DTPOSTED') || get('DTUSER')
    const rawAmt = get('TRNAMT')
    const memo = get('MEMO') || get('NAME') || get('FITID')
    if (!rawDate || !rawAmt) continue

    const year = rawDate.slice(0, 4)
    const month = rawDate.slice(4, 6)
    const day = rawDate.slice(6, 8)
    const date = `${year}-${month}-${day}`
    const amount = parseFloat(rawAmt.replace(',', '.'))

    entries.push({ id: `ofx-${idx++}`, date, description: memo, amount })
  }
  return entries
}

// ─── Excel Parser (lazy import SheetJS) ───────────────────────────────────────

async function parseExcel(file: File): Promise<BankEntry[]> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false })

  const entries: BankEntry[] = []
  let idx = 0
  // Detect header row — look for keywords
  let dataStart = 0
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const rowStr = (rows[r] || []).join(' ').toLowerCase()
    if (rowStr.match(/data|date|valor|amount|descrição|description/)) {
      dataStart = r + 1
      break
    }
  }

  const header = (rows[dataStart - 1] || []).map((h: any) => String(h || '').toLowerCase())
  const colDate = header.findIndex(h => h.includes('data') || h.includes('date'))
  const colDesc = header.findIndex(h => h.includes('descriç') || h.includes('description') || h.includes('histor') || h.includes('memo'))
  const colAmt = header.findIndex(h => h.includes('valor') || h.includes('amount') || h.includes('saldo') || h.includes('crédito') || h.includes('débito'))

  for (let r = dataStart; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length === 0) continue
    const rawDate = colDate >= 0 ? row[colDate] : row[0]
    const rawDesc = colDesc >= 0 ? row[colDesc] : row[1]
    const rawAmt = colAmt >= 0 ? row[colAmt] : row[2]

    if (!rawDate || rawAmt == null) continue

    // Parse date
    let date = ''
    if (rawDate instanceof Date) {
      date = rawDate.toISOString().slice(0, 10)
    } else {
      const s = String(rawDate).trim()
      // DD/MM/YYYY
      const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
      if (m) date = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
      else if (/^\d{4}-\d{2}-\d{2}/.test(s)) date = s.slice(0, 10)
      else continue
    }

    const amtStr = String(rawAmt).replace(/[R$\s.]/g, '').replace(',', '.').trim()
    const amount = parseFloat(amtStr)
    if (isNaN(amount)) continue
    const desc = String(rawDesc || '').trim() || 'Sem descrição'

    entries.push({ id: `xls-${idx++}`, date, description: desc, amount })
  }
  return entries
}

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfBadge({ confidence }: { confidence: number }) {
  if (confidence >= 75) return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Alta {confidence}%</span>
  if (confidence >= 45) return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Média {confidence}%</span>
  return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Baixa {confidence}%</span>
}

// ─── UploadZone ───────────────────────────────────────────────────────────────

function UploadZone({ onEntries }: { onEntries: (e: BankEntry[]) => void }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const process = async (file: File) => {
    setLoading(true)
    setError('')
    try {
      const name = file.name.toLowerCase()
      let entries: BankEntry[] = []
      if (name.endsWith('.ofx') || name.endsWith('.qfx')) {
        const text = await file.text()
        entries = parseOFX(text)
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
        entries = await parseExcel(file)
      } else {
        setError('Formato não suportado. Use .ofx, .xlsx, .xls ou .csv')
        return
      }
      if (entries.length === 0) {
        setError('Nenhuma transação encontrada no arquivo. Verifique o formato.')
        return
      }
      onEntries(entries)
    } catch (err: any) {
      setError('Erro ao processar arquivo: ' + (err?.message || 'erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) process(f) }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'w-full max-w-md border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all',
          dragging ? 'border-brand-400 bg-brand-50' : 'border-slate-300 hover:border-brand-300 hover:bg-slate-50',
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center">
          {loading ? <RefreshCw size={28} className="text-brand-600 animate-spin" /> : <Upload size={28} className="text-brand-600" />}
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700">Arraste o extrato aqui</p>
          <p className="text-sm text-slate-500 mt-1">ou clique para selecionar</p>
          <p className="text-xs text-slate-400 mt-2">Suporta: OFX, QFX, XLSX, XLS, CSV</p>
        </div>
        <input ref={inputRef} type="file" className="hidden" accept=".ofx,.qfx,.xlsx,.xls,.csv" onChange={e => { const f = e.target.files?.[0]; if (f) process(f) }} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl max-w-md w-full">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="max-w-md w-full bg-slate-50 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Como funciona</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { n: '1', t: 'Upload do extrato', s: 'OFX ou Excel do seu banco' },
            { n: '2', t: 'Análise automática', s: 'IA identifica lançamentos similares' },
            { n: '3', t: 'Confirme e concilie', s: 'Revise e aprove as sugestões' },
          ].map(s => (
            <div key={s.n} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center mx-auto mb-2">{s.n}</div>
              <p className="text-xs font-medium text-slate-700">{s.t}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── PreviewStep ──────────────────────────────────────────────────────────────

function PreviewStep({ entries, onConfirm, onBack }: { entries: BankEntry[]; onConfirm: (e: BankEntry[]) => void; onBack: () => void }) {
  const [list, setList] = useState(entries)
  const credits = list.filter(e => e.amount >= 0)
  const debits = list.filter(e => e.amount < 0)
  const total = list.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Extrato importado</h3>
          <p className="text-xs text-slate-500 mt-0.5">{list.length} lançamentos · {credits.length} créditos · {debits.length} débitos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="btn-secondary text-xs">Trocar arquivo</button>
          <button onClick={() => onConfirm(list)} className="btn-primary text-xs">
            Analisar correspondências <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Entradas</p>
          <p className="text-base font-bold text-emerald-600">{formatCurrency(credits.reduce((s, e) => s + e.amount, 0))}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Saídas</p>
          <p className="text-base font-bold text-red-600">{formatCurrency(Math.abs(debits.reduce((s, e) => s + e.amount, 0)))}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Saldo</p>
          <p className={cn('text-base font-bold', total >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="card overflow-hidden max-h-96 overflow-y-auto">
        <table className="table text-xs">
          <thead>
            <tr><th>Data</th><th>Descrição</th><th className="text-right">Valor</th><th></th></tr>
          </thead>
          <tbody>
            {list.map(e => (
              <tr key={e.id}>
                <td className="text-slate-500 whitespace-nowrap">{formatDate(e.date)}</td>
                <td className="max-w-[200px] truncate">{e.description}</td>
                <td className={cn('text-right font-semibold whitespace-nowrap', e.amount >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                  {e.amount >= 0 ? '+' : ''}{formatCurrency(e.amount)}
                </td>
                <td>
                  <button onClick={() => setList(prev => prev.filter(x => x.id !== e.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                    <X size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── MatchingStep ─────────────────────────────────────────────────────────────

function MatchingStep({
  results,
  onDone,
  onBack,
}: {
  results: MatchResult[]
  onDone: (confirmed: number) => void
  onBack: () => void
}) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [chosen, setChosen] = useState<Record<string, string>>({}) // bankId → transactionId
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const decide = (bankId: string, d: Decision, txId?: string) => {
    setDecisions(prev => ({ ...prev, [bankId]: d }))
    if (txId) setChosen(prev => ({ ...prev, [bankId]: txId }))
  }

  const acceptedCount = Object.values(decisions).filter(d => d === 'accepted').length
  const pendingCount = results.length - Object.keys(decisions).length

  const filtered = search
    ? results.filter(r =>
        r.bankEntry.description.toLowerCase().includes(search.toLowerCase()) ||
        r.suggestions[0]?.description.toLowerCase().includes(search.toLowerCase())
      )
    : results

  const handleConfirm = async () => {
    setSaving(true)
    const confirmations = results
      .filter(r => decisions[r.bankEntry.id] === 'accepted')
      .map(r => ({
        transactionId: chosen[r.bankEntry.id] || r.suggestions[0]?.transactionId,
        bankDescription: r.bankEntry.description,
        bankDate: r.bankEntry.date,
        bankAmount: r.bankEntry.amount,
      }))
      .filter(c => c.transactionId)

    if (confirmations.length > 0) {
      await fetch('/api/reconciliation/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmations }),
      })
    }
    setSaving(false)
    onDone(confirmations.length)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">Sugestões de Conciliação</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {acceptedCount} confirmados · {pendingCount} pendentes · {results.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="input text-xs pl-8 py-1.5 w-44" />
          </div>
          <button onClick={onBack} className="btn-secondary text-xs">Voltar</button>
          <button
            onClick={handleConfirm}
            disabled={acceptedCount === 0 || saving}
            className="btn-primary text-xs disabled:opacity-50"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Conciliar {acceptedCount > 0 ? `(${acceptedCount})` : ''}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            const auto: Record<string, Decision> = {}
            results.forEach(r => {
              if (r.suggestions[0]?.confidence >= 75) auto[r.bankEntry.id] = 'accepted'
            })
            setDecisions(prev => ({ ...prev, ...auto }))
          }}
          className="text-xs text-brand-600 hover:underline"
        >
          Aceitar todas com alta confiança
        </button>
        <span className="text-slate-300">·</span>
        <button
          onClick={() => setDecisions({})}
          className="text-xs text-slate-500 hover:underline"
        >
          Limpar seleções
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map(r => {
          const dec = decisions[r.bankEntry.id]
          const bestSuggestion = r.suggestions.find(s => s.transactionId === chosen[r.bankEntry.id]) || r.suggestions[0]
          const hasSuggestion = r.suggestions.length > 0

          return (
            <div
              key={r.bankEntry.id}
              className={cn(
                'card p-3 border transition-all',
                dec === 'accepted' && 'border-emerald-300 bg-emerald-50/40',
                dec === 'rejected' && 'border-red-200 bg-red-50/30 opacity-60',
                dec === 'ignored' && 'opacity-50',
                !dec && 'border-slate-200',
              )}
            >
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                {/* Bank entry */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Banknote size={12} className="text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Extrato bancário</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate">{r.bankEntry.description}</p>
                  <p className="text-xs text-slate-500">{formatDate(r.bankEntry.date)}</p>
                  <p className={cn('text-sm font-bold mt-1', r.bankEntry.amount >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                    {r.bankEntry.amount >= 0 ? '+' : ''}{formatCurrency(r.bankEntry.amount)}
                  </p>
                </div>

                {/* Middle connector */}
                <div className="flex flex-col items-center gap-1.5">
                  {hasSuggestion && bestSuggestion && (
                    <ConfBadge confidence={bestSuggestion.confidence} />
                  )}
                  <ArrowRight size={16} className={cn(
                    'shrink-0',
                    dec === 'accepted' ? 'text-emerald-500' : 'text-slate-300',
                  )} />
                </div>

                {/* Suggested transaction */}
                <div className="min-w-0">
                  {hasSuggestion && bestSuggestion ? (
                    <>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Sistema</span>
                        {bestSuggestion.patientName && (
                          <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 rounded-full truncate max-w-[100px]">{bestSuggestion.patientName}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate">{bestSuggestion.description}</p>
                      <p className="text-xs text-slate-500">{formatDate(bestSuggestion.dueDate)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-bold text-slate-700">{formatCurrency(bestSuggestion.amount)}</p>
                        <span className={cn(
                          'text-[9px] font-medium px-1.5 py-0.5 rounded-full',
                          bestSuggestion.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                          bestSuggestion.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700',
                        )}>
                          {bestSuggestion.status === 'PAID' ? 'Pago' : bestSuggestion.status === 'OVERDUE' ? 'Vencido' : 'Pendente'}
                        </span>
                      </div>
                      {bestSuggestion.reasons.length > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{bestSuggestion.reasons.join(' · ')}</p>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-slate-400 italic">Sem correspondência encontrada</div>
                  )}
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                {hasSuggestion && (
                  <>
                    <button
                      onClick={() => decide(r.bankEntry.id, dec === 'accepted' ? undefined as any : 'accepted')}
                      className={cn(
                        'flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all',
                        dec === 'accepted'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700',
                      )}
                    >
                      <CheckCircle2 size={12} /> {dec === 'accepted' ? 'Confirmado' : 'Confirmar'}
                    </button>

                    {r.suggestions.length > 1 && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === r.bankEntry.id ? null : r.bankEntry.id)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                        >
                          Trocar <ChevronDown size={11} />
                        </button>
                        {openDropdown === r.bankEntry.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 w-72 p-1">
                            {r.suggestions.map(s => (
                              <button
                                key={s.transactionId}
                                onClick={() => { decide(r.bankEntry.id, 'accepted', s.transactionId); setOpenDropdown(null) }}
                                className="w-full flex items-start gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-left"
                              >
                                <ConfBadge confidence={s.confidence} />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-700 truncate">{s.description}</p>
                                  <p className="text-[10px] text-slate-500">{formatDate(s.dueDate)} · {formatCurrency(s.amount)}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={() => decide(r.bankEntry.id, dec === 'rejected' ? undefined as any : 'rejected')}
                  className={cn(
                    'flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ml-auto',
                    dec === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600',
                  )}
                >
                  <XCircle size={12} /> {hasSuggestion ? 'Rejeitar' : 'Ignorar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReconciliationTab() {
  const [step, setStep] = useState<'upload' | 'preview' | 'matching' | 'done'>('upload')
  const [entries, setEntries] = useState<BankEntry[]>([])
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmedCount, setConfirmedCount] = useState(0)

  const handleEntries = (e: BankEntry[]) => {
    setEntries(e)
    setStep('preview')
  }

  const handleAnalyze = async (e: BankEntry[]) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reconciliation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: e }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data: MatchResult[] = await res.json()
      setResults(data)
      setStep('matching')
    } catch (err: any) {
      setError('Erro ao analisar: ' + (err?.message || 'tente novamente'))
    } finally {
      setLoading(false)
    }
  }

  const handleDone = (count: number) => {
    setConfirmedCount(count)
    setStep('done')
  }

  const reset = () => {
    setStep('upload')
    setEntries([])
    setResults([])
    setError('')
  }

  return (
    <div className="space-y-4">
      {/* Progress steps */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        {[
          { id: 'upload', label: 'Upload' },
          { id: 'preview', label: 'Pré-análise' },
          { id: 'matching', label: 'Correspondências' },
          { id: 'done', label: 'Concluído' },
        ].map((s, i, arr) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className={cn(
              'flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold',
              step === s.id ? 'bg-brand-600 text-white' :
              ['upload', 'preview', 'matching', 'done'].indexOf(step) > i ? 'bg-emerald-500 text-white' :
              'bg-slate-200 text-slate-400',
            )}>
              {['upload', 'preview', 'matching', 'done'].indexOf(step) > i ? '✓' : i + 1}
            </span>
            <span className={step === s.id ? 'text-brand-700 font-medium' : ''}>{s.label}</span>
            {i < arr.length - 1 && <span className="text-slate-200">─</span>}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-12">
          <RefreshCw size={20} className="text-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Analisando correspondências com o sistema...</p>
        </div>
      )}

      {!loading && step === 'upload' && <UploadZone onEntries={handleEntries} />}
      {!loading && step === 'preview' && <PreviewStep entries={entries} onConfirm={handleAnalyze} onBack={() => setStep('upload')} />}
      {!loading && step === 'matching' && <MatchingStep results={results} onDone={handleDone} onBack={() => setStep('preview')} />}

      {step === 'done' && (
        <div className="flex flex-col items-center gap-5 py-14">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800">Conciliação concluída!</h3>
            <p className="text-slate-500 mt-1">
              {confirmedCount} lançamento{confirmedCount !== 1 ? 's' : ''} conciliado{confirmedCount !== 1 ? 's' : ''} com sucesso.
            </p>
          </div>
          <button onClick={reset} className="btn-primary gap-2">
            <Upload size={15} /> Nova conciliação
          </button>
        </div>
      )}
    </div>
  )
}
