'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import {
  Building2, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Star, ArrowUpRight, ArrowDownRight,
  Minus, BarChart3, Target, Calendar, ChevronRight,
  Bell, Play, Lightbulb,
} from 'lucide-react'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  MOCK_CLINICS, MOCK_HEALTH_SCORES, MOCK_ACTION_PLANS,
} from '@/lib/mock-data'
import {
  cn, formatCurrency, getScoreColor, getScoreLabel, getScoreBg,
} from '@/lib/utils'

function ScoreMini({ score }: { score: number }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'
  const r = 22
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75
  const offset = arc - (arc * Math.min(score, 100)) / 100

  return (
    <div className="relative w-16 h-14 flex-shrink-0">
      <svg viewBox="0 0 60 52" className="w-full h-full">
        <circle cx="30" cy="36" r={r} fill="none" stroke="#E2E8F0" strokeWidth="7"
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" transform="rotate(135, 30, 36)" />
        <circle cx="30" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(135, 30, 36)" className="score-ring" />
        <text x="30" y="33" textAnchor="middle" fill={color} fontSize="13" fontWeight="700">{score}</text>
      </svg>
    </div>
  )
}

const scoresByClinic = MOCK_HEALTH_SCORES.reduce((acc, s) => {
  acc[s.clinicId] = s
  return acc
}, {} as Record<string, typeof MOCK_HEALTH_SCORES[0]>)

const clinicsWithScores = MOCK_CLINICS.map(clinic => ({
  ...clinic,
  score: scoresByClinic[clinic.id],
})).filter(c => c.score).sort((a, b) => (b.score?.overallScore || 0) - (a.score?.overallScore || 0))

const ALERTS = [
  { clinicId: 'clinic-04', message: 'Psico Bem Estar: Score abaixo de 45 — Atenção crítica necessária', severity: 'critical' },
  { clinicId: 'clinic-03', message: 'FisioVita: Taxa de faltas em 18,5% — acima do limite configurado (15%)', severity: 'warning' },
  { clinicId: 'clinic-03', message: 'FisioVita: Crescimento de receita negativo (-2,1%) — 2º mês consecutivo', severity: 'warning' },
  { clinicId: 'clinic-01', message: 'Bella Vita: Meta de faturamento 85% atingida — no prazo', severity: 'info' },
]

const rankChart = clinicsWithScores.map(c => ({
  name: c.tradeName || c.name,
  score: c.score?.overallScore || 0,
  fill: (c.score?.overallScore || 0) >= 70 ? '#10B981' : (c.score?.overallScore || 0) >= 40 ? '#F59E0B' : '#EF4444',
}))

export default function ConsultantPage() {
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null)

  const avgScore = Math.round(
    clinicsWithScores.reduce((s, c) => s + (c.score?.overallScore || 0), 0) / clinicsWithScores.length
  )

  const criticalCount = clinicsWithScores.filter(c => (c.score?.overallScore || 0) < 40).length
  const warningCount = clinicsWithScores.filter(c => {
    const s = c.score?.overallScore || 0
    return s >= 40 && s < 70
  }).length

  return (
    <div className="animate-fade-in">
      <Header title="Portal do Consultor" subtitle="Visão consolidada de todas as clínicas" />

      <div className="p-6 space-y-6">
        {/* Banner */}
        <div className="card p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Painel do Consultor</h2>
              <p className="text-slate-400 text-sm mt-1">
                Você acompanha <strong className="text-white">{clinicsWithScores.length}</strong> clínicas · {criticalCount} críticas · {warningCount} em atenção
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{avgScore}</p>
                <p className="text-slate-400 text-xs mt-0.5">Score Médio</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
                <p className="text-slate-400 text-xs mt-0.5">Críticas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">{warningCount}</p>
                <p className="text-slate-400 text-xs mt-0.5">Em Atenção</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Bell size={15} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800">Alertas Ativos</h3>
            <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {ALERTS.filter(a => a.severity !== 'info').length}
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {ALERTS.map((alert, i) => {
              const clinic = MOCK_CLINICS.find(c => c.id === alert.clinicId)
              return (
                <div key={i} className={cn(
                  'flex items-start gap-3 px-5 py-3',
                  alert.severity === 'critical' && 'bg-red-50',
                  alert.severity === 'warning' && 'bg-amber-50',
                )}>
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-amber-500' : 'bg-brand-500',
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed">{alert.message}</p>
                  </div>
                  <button className="text-xs text-brand-600 hover:underline flex-shrink-0">Ver clínica →</button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ranking + Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Ranking das clínicas */}
          <div className="card lg:col-span-3">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Ranking de Performance</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {clinicsWithScores.map((clinic, idx) => {
                const s = clinic.score
                if (!s) return null
                return (
                  <div
                    key={clinic.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedClinic(clinic.id === selectedClinic ? null : clinic.id)}
                  >
                    {/* Posição */}
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-slate-100 text-slate-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-50 text-slate-400',
                    )}>
                      {idx + 1}
                    </div>

                    {/* Clínica */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">{clinic.tradeName || clinic.name}</p>
                        <span className="text-[10px] text-slate-400 badge bg-slate-100 flex-shrink-0">{clinic.specialty}</span>
                      </div>
                      <p className="text-xs text-slate-400">{clinic.city}/{clinic.state}</p>
                    </div>

                    {/* Score gauge */}
                    <ScoreMini score={s.overallScore} />

                    {/* KPIs mini */}
                    <div className="hidden lg:flex flex-col gap-1 text-right">
                      <p className="text-[10px] text-slate-400">
                        Ocup: <span className={s.occupancyRate >= 75 ? 'text-emerald-600' : 'text-amber-600'}>{s.occupancyRate}%</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Faltas: <span className={s.absenceRate <= 10 ? 'text-emerald-600' : 'text-red-600'}>{s.absenceRate}%</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        NPS: <span className={s.npsScore >= 9 ? 'text-emerald-600' : 'text-amber-600'}>{s.npsScore}</span>
                      </p>
                    </div>

                    <ChevronRight size={15} className={cn(
                      'text-slate-300 flex-shrink-0 transition-transform',
                      selectedClinic === clinic.id && 'rotate-90',
                    )} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Gráfico comparativo */}
          <div className="card p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Score por Clínica</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={rankChart} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="score" name="Score" radius={[0, 6, 6, 0]}>
                  {rankChart.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legenda */}
            <div className="flex gap-3 mt-3 text-[10px]">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /><span className="text-slate-500">Saudável (≥70)</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-amber-500" /><span className="text-slate-500">Atenção (40-70)</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-red-500" /><span className="text-slate-500">Crítico ({'<'}40)</span></div>
            </div>
          </div>
        </div>

        {/* Planos de ação */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-800">Planos de Ação em Andamento</h3>
            </div>
            <button className="btn-primary text-xs gap-1.5"><Play size={12} /> Novo Plano</button>
          </div>

          <div className="divide-y divide-slate-50">
            {MOCK_ACTION_PLANS.map(plan => {
              const done = plan.tasks.filter(t => t.completed).length
              const total = plan.tasks.length
              const pct = Math.round((done / total) * 100)
              const clinic = MOCK_CLINICS[0] // all in clinic-01

              const priorityConfig = {
                critical: { label: 'Crítico', color: 'bg-red-100 text-red-700' },
                high:     { label: 'Alta',    color: 'bg-orange-100 text-orange-700' },
                medium:   { label: 'Média',   color: 'bg-amber-100 text-amber-700' },
                low:      { label: 'Baixa',   color: 'bg-slate-100 text-slate-600' },
              }[plan.priority]

              const statusConfig = {
                open:        { label: 'Aberto',         color: 'bg-slate-100 text-slate-600' },
                in_progress: { label: 'Em Andamento',   color: 'bg-blue-100 text-blue-700' },
                completed:   { label: 'Concluído',      color: 'bg-emerald-100 text-emerald-700' },
                cancelled:   { label: 'Cancelado',      color: 'bg-slate-100 text-slate-400' },
              }[plan.status]

              return (
                <div key={plan.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-slate-800">{plan.title}</p>
                        <span className={cn('badge text-[10px]', priorityConfig.color)}>{priorityConfig.label}</span>
                        <span className={cn('badge text-[10px]', statusConfig.color)}>{statusConfig.label}</span>
                        <span className="badge bg-slate-100 text-slate-500 text-[10px]">{clinic.tradeName}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{plan.description}</p>

                      {/* Tarefas */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        {plan.tasks.map(task => (
                          <div key={task.id} className="flex items-center gap-1.5 text-xs">
                            {task.completed
                              ? <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                              : <div className="w-3 h-3 rounded-full border-2 border-slate-300 flex-shrink-0" />}
                            <span className={cn(
                              'truncate',
                              task.completed ? 'text-slate-400 line-through' : 'text-slate-600',
                            )}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{done}/{total} tarefas</span>
                        {plan.dueDate && (
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            Prazo: {plan.dueDate.slice(0, 10)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Insight do consultor */}
        <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Insight da Semana — IA Consultiva</p>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                Sua carteira de clínicas tem score médio de <strong>{avgScore}/100</strong>.
                As 2 clínicas abaixo de 60 pontos concentram <strong>74% dos alertas ativos</strong>.
                Priorize a <strong>Psico Bem Estar</strong> (score 43) — análise indica que
                a principal alavanca é a taxa de faltas (22%), que pode ser reduzida com
                automação de confirmação. Impacto estimado: <strong>+8-12 pontos no score</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
