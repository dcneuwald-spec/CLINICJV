'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Target, TrendingUp, Plus, Trophy, Star, Award, X } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Goal } from '@/types'

function GoalBar({ goal, onUpdate }: { goal: Goal; onUpdate: (g: Goal) => void }) {
  const pct = Math.min(goal.percentComplete ?? 0, 100)
  const status = pct >= 80 ? 'good' : pct >= 50 ? 'warning' : 'critical'
  const barColor = status === 'good' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(goal.currentValue))

  const formatValue = (v: number) => {
    if (goal.metric === 'revenue') return formatCurrency(v)
    if (['absence_rate', 'conversion', 'nps'].includes(goal.metric)) return `${v}%`
    return String(v)
  }

  const saveProgress = async () => {
    const res = await fetch(`/api/goals/${goal.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentValue: Number(val) }) })
    if (res.ok) { onUpdate(await res.json()); setEditing(false) }
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{goal.title}</p>
          {goal.professionalName && <p className="text-xs text-slate-400 mt-0.5">{goal.professionalName}</p>}
        </div>
        <span className={cn('text-lg font-bold', status === 'good' ? 'text-emerald-600' : status === 'warning' ? 'text-amber-600' : 'text-red-600')}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mb-3">
        <span>Atual: <strong className="text-slate-800">{formatValue(goal.currentValue)}</strong></span>
        <span>Meta: <strong className="text-slate-800">{formatValue(goal.targetValue)}</strong></span>
      </div>
      {editing ? (
        <div className="flex gap-2 mt-2">
          <input type="number" className="input text-xs py-1" value={val} onChange={e => setVal(e.target.value)} />
          <button onClick={saveProgress} className="btn-primary text-xs px-3">Salvar</button>
          <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3">✕</button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="text-xs text-brand-600 hover:underline">Atualizar progresso</button>
      )}
    </div>
  )
}

function NewGoalModal({ onClose, onSave }: { onClose: () => void; onSave: (g: Goal) => void }) {
  const [form, setForm] = useState({ title: '', metric: 'revenue', targetValue: '', currentValue: '0', period: 'monthly', startDate: '', endDate: '' })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { onSave(await res.json()); onClose() }
    else setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b"><h3 className="font-bold text-slate-900">Nova Meta</h3><button onClick={onClose}><X size={18} className="text-slate-400" /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-xs font-medium text-slate-600 block mb-1">Título *</label><input className="input" value={form.title} onChange={e => set('title', e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Métrica</label>
              <select className="input" value={form.metric} onChange={e => set('metric', e.target.value)}>
                <option value="revenue">Faturamento</option><option value="appointments">Atendimentos</option><option value="conversion">Conversão (%)</option><option value="nps">NPS (%)</option><option value="absence_rate">Faltas (%)</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Período</label>
              <select className="input" value={form.period} onChange={e => set('period', e.target.value)}>
                <option value="monthly">Mensal</option><option value="quarterly">Trimestral</option><option value="yearly">Anual</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Valor alvo *</label><input className="input" type="number" value={form.targetValue} onChange={e => set('targetValue', e.target.value)} required /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Valor atual</label><input className="input" type="number" value={form.currentValue} onChange={e => set('currentValue', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Início *</label><input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Fim *</label><input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Salvando...' : 'Criar Meta'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/goals').then(r => r.json()).then(setGoals).finally(() => setLoading(false))
  }, [])

  const update = (g: Goal) => setGoals(prev => prev.map(x => x.id === g.id ? g : x))
  const overallAvg = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + (g.percentComplete ?? 0), 0) / goals.length) : 0
  const achieved = goals.filter(g => (g.percentComplete ?? 0) >= 100).length

  return (
    <div className="animate-fade-in">
      <Header title="Metas e Performance" subtitle="Acompanhamento de metas do período" />
      {showModal && <NewGoalModal onClose={() => setShowModal(false)} onSave={g => setGoals(prev => [g, ...prev])} />}

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center"><Target size={18} className="text-brand-600" /></div><div><p className="text-xl font-bold text-slate-900">{goals.length}</p><p className="text-xs text-slate-500">Metas ativas</p></div></div>
          <div className="card p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center"><Trophy size={18} className="text-emerald-600" /></div><div><p className="text-xl font-bold text-slate-900">{achieved}</p><p className="text-xs text-slate-500">Metas atingidas</p></div></div>
          <div className="card p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><TrendingUp size={18} className="text-amber-600" /></div><div><p className="text-xl font-bold text-slate-900">{overallAvg}%</p><p className="text-xs text-slate-500">Aderência média</p></div></div>
          <div className="card p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center"><Award size={18} className="text-purple-600" /></div><div><p className="text-xl font-bold text-slate-900">{new Date().toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}</p><p className="text-xs text-slate-500">Período ativo</p></div></div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Metas do Período</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs gap-1.5"><Plus size={13} /> Nova Meta</button>
        </div>

        {loading ? <div className="text-center py-12 text-slate-400">Carregando...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(goal => <GoalBar key={goal.id} goal={goal} onUpdate={update} />)}
          </div>
        )}

        <div className="card p-5 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2"><Star size={16} className="text-amber-300 fill-amber-300" /><h3 className="font-bold">Modo TV — Gamificação da Equipe</h3></div>
              <p className="text-brand-200 text-sm">Exiba as metas em tempo real em uma TV na recepção para engajar a equipe</p>
            </div>
            <button className="btn bg-white text-brand-700 hover:bg-brand-50 text-sm px-5">Ativar TV Mode</button>
          </div>
        </div>
      </div>
    </div>
  )
}
