'use client'

import { Header } from '@/components/layout/header'
import { Target, TrendingUp, Plus, Trophy, Star, Award } from 'lucide-react'
import { MOCK_GOALS, MOCK_PROFESSIONALS } from '@/lib/mock-data'
import { cn, formatCurrency } from '@/lib/utils'

function GoalBar({ goal }: { goal: typeof MOCK_GOALS[0] }) {
  const pct = Math.min(goal.percentComplete, 100)
  const status = pct >= 80 ? 'good' : pct >= 50 ? 'warning' : 'critical'
  const barColor = status === 'good' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'

  const formatValue = (v: number) => {
    if (goal.metric === 'revenue') return formatCurrency(v)
    if (goal.metric === 'absence_rate' || goal.metric === 'conversion') return `${v}%`
    if (goal.metric === 'nps') return `${v}/10`
    return String(v)
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{goal.title}</p>
          {goal.professionalName && (
            <p className="text-xs text-slate-400 mt-0.5">{goal.professionalName}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <span className={cn(
            'text-lg font-bold',
            status === 'good' ? 'text-emerald-600' :
            status === 'warning' ? 'text-amber-600' : 'text-red-600',
          )}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Barra */}
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>Atual: <strong className="text-slate-800">{formatValue(goal.currentValue)}</strong></span>
        <span>Meta: <strong className="text-slate-800">{formatValue(goal.targetValue)}</strong></span>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const overallAvg = Math.round(MOCK_GOALS.reduce((s, g) => s + g.percentComplete, 0) / MOCK_GOALS.length)

  return (
    <div className="animate-fade-in">
      <Header title="Metas e Performance" subtitle="Acompanhamento de metas do período" />

      <div className="p-6 space-y-5">
        {/* Resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <Target size={18} className="text-brand-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{MOCK_GOALS.length}</p>
              <p className="text-xs text-slate-500">Metas ativas</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Trophy size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{MOCK_GOALS.filter(g => g.percentComplete >= 100).length}</p>
              <p className="text-xs text-slate-500">Metas atingidas</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{overallAvg}%</p>
              <p className="text-xs text-slate-500">Aderência média</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Award size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">Fev/25</p>
              <p className="text-xs text-slate-500">Período ativo</p>
            </div>
          </div>
        </div>

        {/* Metas */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Metas do Mês — Fevereiro 2025</h3>
          <button className="btn-primary text-xs gap-1.5"><Plus size={13} /> Nova Meta</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_GOALS.map(goal => <GoalBar key={goal.id} goal={goal} />)}
        </div>

        {/* TV Mode / Gamificação */}
        <div className="card p-5 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="text-amber-300 fill-amber-300" />
                <h3 className="font-bold">Modo TV — Gamificação da Equipe</h3>
              </div>
              <p className="text-brand-200 text-sm">
                Exiba as metas em tempo real em uma TV na recepção para engajar a equipe
              </p>
            </div>
            <button className="btn bg-white text-brand-700 hover:bg-brand-50 text-sm px-5">
              Ativar TV Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
