'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, X, Loader2, ChevronRight, ChevronDown,
  Building2, Landmark, Wallet, PiggyBank, CreditCard,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────
interface AccountPlan { id: string; code: string; name: string; type: string; parentId?: string | null; active: boolean }
interface BankAccount { id: string; name: string; bank?: string; agency?: string; account?: string; type: string; balance: number; active: boolean }
interface CardFee { id: string; brand: string; cardType: string; installments: string; feePercent: number; active: boolean }

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCOUNT_TYPES = ['checking', 'savings', 'cash', 'investment'] as const
const ACCOUNT_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  checking:   { label: 'Conta Corrente',  icon: <Building2 size={16} />,  color: 'bg-blue-100 text-blue-700' },
  savings:    { label: 'Poupança',        icon: <PiggyBank size={16} />,  color: 'bg-emerald-100 text-emerald-700' },
  cash:       { label: 'Caixa',           icon: <Wallet size={16} />,     color: 'bg-amber-100 text-amber-700' },
  investment: { label: 'Investimento',    icon: <Landmark size={16} />,   color: 'bg-purple-100 text-purple-700' },
}

const BRANDS = ['visa', 'mastercard', 'elo', 'amex', 'hipercard']
const BRAND_LABELS: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', elo: 'Elo', amex: 'Amex', hipercard: 'Hipercard' }
const BRAND_COLORS: Record<string, string> = {
  visa: 'bg-blue-600', mastercard: 'bg-red-600', elo: 'bg-amber-500',
  amex: 'bg-slate-700', hipercard: 'bg-red-800',
}
const INSTALLMENT_COLS = [
  { key: 'debit-1',    label: 'Débito',      cardType: 'debit',  installments: '1' },
  { key: 'credit-1',   label: 'Crédito 1x',  cardType: 'credit', installments: '1' },
  { key: 'credit-2-3', label: '2–3x',        cardType: 'credit', installments: '2-3' },
  { key: 'credit-4-6', label: '4–6x',        cardType: 'credit', installments: '4-6' },
  { key: 'credit-7-12',label: '7–12x',       cardType: 'credit', installments: '7-12' },
]

// ── AccountPlan ───────────────────────────────────────────────────────────────
function AccountPlanSection() {
  const [plans, setPlans] = useState<AccountPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AccountPlan | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', type: 'REVENUE' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/account-plans').then(r => r.json()).then(d => setPlans(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  const roots = plans.filter(p => !p.parentId)
  const children = (pid: string) => plans.filter(p => p.parentId === pid)

  const openNew = (pid: string | null = null) => { setEditing(null); setParentId(pid); setForm({ code: '', name: '', type: 'REVENUE' }); setShowModal(true) }
  const openEdit = (p: AccountPlan) => { setEditing(p); setParentId(p.parentId ?? null); setForm({ code: p.code, name: p.name, type: p.type }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.code || !form.name) return
    setSaving(true)
    if (editing) {
      const res = await fetch(`/api/account-plans/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { const updated = await res.json(); setPlans(prev => prev.map(p => p.id === updated.id ? updated : p)) }
    } else {
      const res = await fetch('/api/account-plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, parentId }) })
      if (res.ok) { const created = await res.json(); setPlans(prev => [...prev, created]) }
    }
    setSaving(false); setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta conta?')) return
    await fetch(`/api/account-plans/${id}`, { method: 'DELETE' })
    setPlans(prev => prev.filter(p => p.id !== id && p.parentId !== id))
  }

  const PlanRow = ({ plan, level = 0 }: { plan: AccountPlan; level?: number }) => {
    const kids = children(plan.id)
    const isOpen = expanded.has(plan.id)
    return (
      <>
        <div className={cn('flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 group rounded-lg transition-colors', level > 0 && 'ml-6 border-l-2 border-slate-100')}>
          <button onClick={() => setExpanded(prev => { const s = new Set(prev); s.has(plan.id) ? s.delete(plan.id) : s.add(plan.id); return s })} className="w-4 flex-shrink-0">
            {kids.length > 0 ? (isOpen ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />) : <span className="w-3 inline-block" />}
          </button>
          <span className="text-xs text-slate-400 w-14 flex-shrink-0 font-mono">{plan.code}</span>
          <span className="text-sm text-slate-800 flex-1 font-medium">{plan.name}</span>
          <span className={cn('badge text-[10px]', plan.type === 'REVENUE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
            {plan.type === 'REVENUE' ? 'Receita' : 'Despesa'}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => openNew(plan.id)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-brand-600" title="Adicionar subconta"><Plus size={12} /></button>
            <button onClick={() => openEdit(plan)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"><Pencil size={12} /></button>
            <button onClick={() => handleDelete(plan.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
          </div>
        </div>
        {isOpen && kids.map(kid => <PlanRow key={kid.id} plan={kid} level={level + 1} />)}
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h3 className="text-sm font-semibold text-slate-800">Plano de Contas</h3><p className="text-xs text-slate-500 mt-0.5">Estrutura hierárquica para classificação de receitas e despesas</p></div>
        <button onClick={() => openNew(null)} className="btn-primary text-xs gap-1.5"><Plus size={14} /> Nova Conta</button>
      </div>
      <div className="card overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 grid grid-cols-[20px_56px_1fr_80px_80px] text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
          <span /><span>Código</span><span>Nome</span><span>Tipo</span><span />
        </div>
        {loading ? <div className="flex items-center justify-center py-10"><Loader2 size={18} className="animate-spin text-slate-300" /></div>
          : roots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400 mb-3">Nenhuma conta cadastrada</p>
              <button onClick={() => openNew(null)} className="btn-primary text-xs gap-1.5"><Plus size={12} /> Criar primeiro grupo</button>
            </div>
          ) : <div className="p-2">{roots.map(p => <PlanRow key={p.id} plan={p} />)}</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h4 className="font-semibold text-slate-900">{editing ? 'Editar Conta' : parentId ? 'Nova Subconta' : 'Nova Conta'}</h4>
              <button onClick={() => setShowModal(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Código *</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="1.1.1" className="input" /></div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tipo *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
                    <option value="REVENUE">Receita</option>
                    <option value="EXPENSE">Despesa</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Nome *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Procedimentos Estéticos" className="input" /></div>
            </div>
            <div className="px-5 pb-4 flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">{saving ? <Loader2 size={13} className="animate-spin" /> : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── BankAccounts ──────────────────────────────────────────────────────────────
function BankAccountSection() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<BankAccount | null>(null)
  const [form, setForm] = useState({ name: '', bank: '', agency: '', account: '', type: 'checking', balance: '0' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/bank-accounts').then(r => r.json()).then(d => setAccounts(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  const openNew = () => { setEditing(null); setForm({ name: '', bank: '', agency: '', account: '', type: 'checking', balance: '0' }); setShowModal(true) }
  const openEdit = (a: BankAccount) => { setEditing(a); setForm({ name: a.name, bank: a.bank ?? '', agency: a.agency ?? '', account: a.account ?? '', type: a.type, balance: String(a.balance) }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    const payload = { ...form, balance: Number(form.balance) }
    if (editing) {
      const res = await fetch(`/api/bank-accounts/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) { const u = await res.json(); setAccounts(prev => prev.map(a => a.id === u.id ? u : a)) }
    } else {
      const res = await fetch('/api/bank-accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) { const c = await res.json(); setAccounts(prev => [...prev, c]) }
    }
    setSaving(false); setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta conta?')) return
    await fetch(`/api/bank-accounts/${id}`, { method: 'DELETE' })
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  const totalBalance = accounts.filter(a => a.active).reduce((s, a) => s + a.balance, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h3 className="text-sm font-semibold text-slate-800">Contas</h3><p className="text-xs text-slate-500 mt-0.5">Contas bancárias, caixa e investimentos da clínica</p></div>
        <button onClick={openNew} className="btn-primary text-xs gap-1.5"><Plus size={14} /> Nova Conta</button>
      </div>

      {/* Total */}
      <div className="card p-4 flex items-center gap-3 bg-gradient-to-r from-brand-50 to-white border-brand-200">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center"><Wallet size={18} className="text-brand-600" /></div>
        <div><p className="text-xl font-bold text-slate-900">{formatCurrency(totalBalance)}</p><p className="text-xs text-slate-500">Saldo total consolidado</p></div>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader2 size={18} className="animate-spin text-slate-300" /></div>
        : accounts.length === 0 ? (
          <div className="card p-10 text-center">
            <Building2 size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-3">Nenhuma conta cadastrada</p>
            <button onClick={openNew} className="btn-primary text-xs gap-1.5 mx-auto"><Plus size={12} /> Adicionar conta</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(acc => {
              const meta = ACCOUNT_TYPE_LABELS[acc.type] ?? ACCOUNT_TYPE_LABELS.checking
              return (
                <div key={acc.id} className={cn('card p-4 space-y-3', !acc.active && 'opacity-50')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', meta.color.replace('text-', 'text-').replace('bg-', 'bg-').split(' ')[0])}>{meta.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{acc.name}</p>
                        {acc.bank && <p className="text-[10px] text-slate-400">{acc.bank}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(acc)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"><Pencil size={12} /></button>
                      <button onClick={() => handleDelete(acc.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  {(acc.agency || acc.account) && (
                    <p className="text-[10px] text-slate-400 font-mono">
                      {acc.agency && `Ag. ${acc.agency}`}{acc.agency && acc.account && ' · '}{acc.account && `Cc. ${acc.account}`}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className={cn('badge text-[10px]', meta.color)}>{meta.label}</span>
                    <span className={cn('text-base font-bold', acc.balance >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatCurrency(acc.balance)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h4 className="font-semibold text-slate-900">{editing ? 'Editar Conta' : 'Nova Conta'}</h4>
              <button onClick={() => setShowModal(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Nome da Conta *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Conta Corrente Bradesco" className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
                    {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{ACCOUNT_TYPE_LABELS[t].label}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Saldo Inicial (R$)</label><input type="number" step="0.01" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} className="input" /></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Banco</label><input value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))} placeholder="Ex: Bradesco, Itaú, Nubank…" className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Agência</label><input value={form.agency} onChange={e => setForm(f => ({ ...f, agency: e.target.value }))} placeholder="0001" className="input" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Conta</label><input value={form.account} onChange={e => setForm(f => ({ ...f, account: e.target.value }))} placeholder="12345-6" className="input" /></div>
              </div>
            </div>
            <div className="px-5 pb-4 flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">{saving ? <Loader2 size={13} className="animate-spin" /> : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CardFees ──────────────────────────────────────────────────────────────────
function CardFeeSection() {
  const [fees, setFees] = useState<CardFee[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ brand: string; col: typeof INSTALLMENT_COLS[0]; value: string } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/card-fees').then(r => r.json()).then(d => setFees(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  const getFee = (brand: string, cardType: string, installments: string) =>
    fees.find(f => f.brand === brand && f.cardType === cardType && f.installments === installments)

  const startEdit = (brand: string, col: typeof INSTALLMENT_COLS[0]) => {
    const existing = getFee(brand, col.cardType, col.installments)
    setEditing({ brand, col, value: existing ? String(existing.feePercent) : '' })
  }

  const saveEdit = async () => {
    if (!editing) return
    const val = parseFloat(editing.value.replace(',', '.'))
    if (isNaN(val) || val < 0) return
    setSaving(true)
    const existing = getFee(editing.brand, editing.col.cardType, editing.col.installments)
    if (existing) {
      const res = await fetch(`/api/card-fees/${existing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feePercent: val }) })
      if (res.ok) { const u = await res.json(); setFees(prev => prev.map(f => f.id === u.id ? u : f)) }
    } else {
      const res = await fetch('/api/card-fees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([{ brand: editing.brand, cardType: editing.col.cardType, installments: editing.col.installments, feePercent: val }]) })
      if (res.ok) { const created = await res.json(); setFees(prev => [...prev, ...(Array.isArray(created) ? created : [created])]) }
    }
    setSaving(false); setEditing(null)
  }

  const feeColor = (v?: number) => !v ? 'text-slate-300' : v <= 1.5 ? 'text-emerald-600' : v <= 2.5 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Taxas de Máquina de Cartão</h3>
        <p className="text-xs text-slate-500 mt-0.5">Clique em qualquer célula para editar a taxa. Verde ≤ 1,5% · Amarelo ≤ 2,5% · Vermelho &gt; 2,5%</p>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader2 size={18} className="animate-spin text-slate-300" /></div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-32">Bandeira</th>
                {INSTALLMENT_COLS.map(col => (
                  <th key={col.key} className="px-3 py-3 text-center text-xs font-semibold text-slate-500 whitespace-nowrap">
                    <div className="flex flex-col items-center gap-0.5">
                      {col.cardType === 'debit' ? <span className="badge bg-blue-100 text-blue-700 text-[9px]">Débito</span> : <span className="badge bg-purple-100 text-purple-700 text-[9px]">Crédito</span>}
                      <span>{col.label.replace('Débito', '').replace('Crédito ', '')}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BRANDS.map(brand => (
                <tr key={brand} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-7 h-4 rounded flex items-center justify-center', BRAND_COLORS[brand])}>
                        <CreditCard size={10} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{BRAND_LABELS[brand]}</span>
                    </div>
                  </td>
                  {INSTALLMENT_COLS.map(col => {
                    const fee = getFee(brand, col.cardType, col.installments)
                    const isEditing = editing?.brand === brand && editing?.col.key === col.key
                    return (
                      <td key={col.key} className="px-3 py-2 text-center">
                        {isEditing ? (
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              autoFocus
                              value={editing.value}
                              onChange={e => setEditing(prev => prev ? { ...prev, value: e.target.value } : null)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null) }}
                              className="w-16 text-center text-sm border border-brand-300 rounded-lg px-1 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                              placeholder="0,00"
                            />
                            <span className="text-xs text-slate-400">%</span>
                            {saving ? <Loader2 size={11} className="animate-spin text-slate-400" /> : (
                              <button onClick={saveEdit} className="text-brand-600 hover:text-brand-800 text-xs font-bold">✓</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => startEdit(brand, col)} className={cn('w-full text-center py-1.5 rounded-lg hover:bg-slate-100 transition-colors font-semibold text-sm', feeColor(fee?.feePercent))}>
                            {fee ? `${fee.feePercent.toFixed(2).replace('.', ',')}%` : <span className="text-slate-200 font-normal text-xs">—</span>}
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
            <span>💡 Clique em qualquer célula para editar · Enter para confirmar · Esc para cancelar</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── FinancialConfig (main export) ─────────────────────────────────────────────
export default function FinancialConfig() {
  const [section, setSection] = useState<'plans' | 'accounts' | 'fees'>('plans')

  const SECTIONS = [
    { id: 'plans' as const,    label: 'Plano de Contas', icon: <CreditCard size={14} /> },
    { id: 'accounts' as const, label: 'Contas',          icon: <Building2 size={14} /> },
    { id: 'fees' as const,     label: 'Taxas de Cartão', icon: <CreditCard size={14} /> },
  ]

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-44 flex-shrink-0 space-y-1">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={cn('w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
              section === s.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100')}>
            {s.icon}{s.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        {section === 'plans'    && <AccountPlanSection />}
        {section === 'accounts' && <BankAccountSection />}
        {section === 'fees'     && <CardFeeSection />}
      </div>
    </div>
  )
}
