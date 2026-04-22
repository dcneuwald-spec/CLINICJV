'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Plus, FileText, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { cn, formatCurrency, formatDate, getBudgetStatusLabel } from '@/lib/utils'
import type { Budget } from '@/types'

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  approved: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={12} /> },
  sent:     { color: 'bg-blue-100 text-blue-700',       icon: <FileText size={12} /> },
  followup: { color: 'bg-amber-100 text-amber-700',     icon: <Clock size={12} /> },
  rejected: { color: 'bg-red-100 text-red-700',         icon: <XCircle size={12} /> },
  draft:    { color: 'bg-slate-100 text-slate-600',     icon: <AlertCircle size={12} /> },
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/budgets').then(r => r.json()).then(setBudgets).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/budgets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) { const updated = await res.json(); setBudgets(prev => prev.map(b => b.id === id ? updated : b)) }
  }

  const totalApproved = budgets.filter(b => b.status === 'approved').reduce((s, b) => s + b.finalAmount, 0)
  const totalOpen = budgets.filter(b => b.status === 'sent' || b.status === 'followup').reduce((s, b) => s + b.finalAmount, 0)
  const conversionRate = budgets.length > 0 ? Math.round((budgets.filter(b => b.status === 'approved').length / budgets.length) * 100) : 0

  return (
    <div className="animate-fade-in">
      <Header title="Orçamentos" subtitle="Gestão de orçamentos e conversão de vendas" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4"><p className="text-xl font-bold text-slate-900">{budgets.length}</p><p className="text-xs text-slate-500 mt-0.5">Total de orçamentos</p></div>
          <div className="card p-4"><p className="text-xl font-bold text-emerald-600">{formatCurrency(totalApproved)}</p><p className="text-xs text-slate-500 mt-0.5">Aprovados</p></div>
          <div className="card p-4"><p className="text-xl font-bold text-amber-600">{formatCurrency(totalOpen)}</p><p className="text-xs text-slate-500 mt-0.5">Em aberto</p></div>
          <div className="card p-4"><p className="text-xl font-bold text-brand-600">{conversionRate}%</p><p className="text-xs text-slate-500 mt-0.5">Taxa de conversão</p></div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-800">Lista de Orçamentos</h3>
          <button className="btn-primary text-xs gap-1.5"><Plus size={13} /> Novo Orçamento</button>
        </div>

        {loading ? <div className="text-center py-12 text-slate-400">Carregando...</div> : (
          <div className="space-y-4">
            {budgets.map(budget => {
              const cfg = STATUS_CONFIG[budget.status] ?? STATUS_CONFIG.draft
              return (
                <div key={budget.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-slate-800">{budget.number}</p>
                        {budget.title && <span className="text-sm text-slate-500">— {budget.title}</span>}
                      </div>
                      <p className="text-xs text-slate-400">{(budget as any).patientName ?? ''} · {formatDate(budget.createdAt)}</p>
                    </div>
                    <span className={cn('badge text-xs flex items-center gap-1', cfg.color)}>{cfg.icon}{getBudgetStatusLabel(budget.status)}</span>
                  </div>

                  {budget.items && (
                    <div className="space-y-1 mb-3">
                      {budget.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs text-slate-600">
                          <span>{item.description} × {item.quantity}</span>
                          <span>{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="text-xs text-slate-400">
                      {budget.discount > 0 && <span>Desconto: {formatCurrency(budget.discount)} · </span>}
                      {budget.validUntil && <span>Válido até {formatDate(budget.validUntil)}</span>}
                    </div>
                    <p className="text-base font-bold text-slate-900">{formatCurrency(budget.finalAmount)}</p>
                  </div>

                  {(budget.status === 'sent' || budget.status === 'followup' || budget.status === 'draft') && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      {budget.status === 'draft' && <button onClick={() => updateStatus(budget.id, 'sent')} className="btn-secondary text-xs flex-1 justify-center">Enviar</button>}
                      {(budget.status === 'sent' || budget.status === 'followup') && <button onClick={() => updateStatus(budget.id, 'followup')} className="btn-secondary text-xs flex-1 justify-center">Follow Up</button>}
                      {(budget.status === 'sent' || budget.status === 'followup') && <button onClick={() => updateStatus(budget.id, 'approved')} className="btn text-xs flex-1 justify-center bg-emerald-600 text-white hover:bg-emerald-700">Aprovar</button>}
                      {(budget.status === 'sent' || budget.status === 'followup') && <button onClick={() => updateStatus(budget.id, 'rejected')} className="btn-secondary text-xs text-red-600 border-red-100 hover:bg-red-50">Reprovar</button>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
