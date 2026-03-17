'use client'

import { Header } from '@/components/layout/header'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Users, Calendar, DollarSign,
  Heart, AlertTriangle, Target, ArrowUpRight, ArrowDownRight,
  Minus, CheckCircle2, XCircle, Clock, Star,
} from 'lucide-react'
import {
  MOCK_HEALTH_SCORES, MONTHLY_REVENUE, APPOINTMENT_STATS,
  PROCEDURES_MIX, FUNNEL_DATA, HEALTH_SCORE_HISTORY,
  MOCK_GOALS, MOCK_APPOINTMENTS, MOCK_ACTION_PLANS,
} from '@/lib/mock-data'
import {
  formatCurrency, getScoreColor, getScoreBg, getScoreLabel,
  getAppointmentStatusLabel, getAppointmentStatusColor, cn,
} from '@/lib/utils'

// ============================
// KPI CARD
// ============================

function KPICard({
  label, value, unit, change, benchmark, status, icon, description,
}: {
  label: string
  value: string | number
  unit?: string
  change?: number
  benchmark?: string
  status?: 'good' | 'warning' | 'critical'
  icon: React.ReactNode
  description?: string
}) {
  const statusColors = {
    good: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    critical: 'bg-red-50 text-red-600',
  }
  const iconBg = {
    good: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    critical: 'bg-red-100 text-red-600',
  }
  const s = status || 'good'

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg[s])}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full', statusColors[s])}>
            {change > 0 ? <ArrowUpRight size={12} /> : change < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">
          {value}{unit && <span className="text-base font-normal text-slate-400 ml-1">{unit}</span>}
        </p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {benchmark && (
        <p className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
          Benchmark: {benchmark}
        </p>
      )}
    </div>
  )
}

// ============================
// HEALTH SCORE GAUGE
// ============================

function HealthScoreGauge({ score }: { score: number }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const arc = circumference * 0.75
  const offset = arc - (arc * Math.min(score, 100)) / 100
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-36">
        <svg viewBox="0 0 180 140" className="w-full h-full">
          {/* Track */}
          <circle
            cx="90" cy="100" r={radius}
            fill="none" stroke="#E2E8F0" strokeWidth="14"
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(135, 90, 100)"
          />
          {/* Progress */}
          <circle
            cx="90" cy="100" r={radius}
            fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(135, 90, 100)"
            className="score-ring"
          />
          {/* Score text */}
          <text x="90" y="95" textAnchor="middle" className="text-3xl font-bold" fill={color} fontSize="32" fontWeight="700">
            {score}
          </text>
          <text x="90" y="115" textAnchor="middle" fill="#94A3B8" fontSize="12">
            {getScoreLabel(score)}
          </text>
        </svg>
      </div>
    </div>
  )
}

// ============================
// RADAR / 6P CHART
// ============================

function SixPRadar({ scores }: { scores: ClinicHealthScoreDimensions }) {
  const dims = [
    { key: 'patientScore', label: 'Paciente' },
    { key: 'productionScore', label: 'Produção' },
    { key: 'peopleScore', label: 'Pessoas' },
    { key: 'processScore', label: 'Processo' },
    { key: 'planningScore', label: 'Planejamento' },
    { key: 'prosperityScore', label: 'Prosperidade' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {dims.map(d => {
        const val = scores[d.key as keyof ClinicHealthScoreDimensions]
        const color = val >= 70 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-red-500'
        return (
          <div key={d.key} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{d.label}</span>
              <span className={cn('font-semibold', getScoreColor(val))}>{val}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${val}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface ClinicHealthScoreDimensions {
  patientScore: number
  productionScore: number
  peopleScore: number
  processScore: number
  planningScore: number
  prosperityScore: number
}

// ============================
// APPOINTMENT STATUS BADGE
// ============================

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('badge text-[11px]', getAppointmentStatusColor(status))}>
      {getAppointmentStatusLabel(status)}
    </span>
  )
}

// ============================
// DASHBOARD PAGE
// ============================

export default function DashboardPage() {
  const currentScore = MOCK_HEALTH_SCORES[0]
  const prevScore = MOCK_HEALTH_SCORES[1]
  const todayApts = MOCK_APPOINTMENTS.slice(0, 8)

  const totalRevenueFeb = MONTHLY_REVENUE[5].receita
  const totalRevenueJan = MONTHLY_REVENUE[4].receita
  const revenueChange = ((totalRevenueFeb - totalRevenueJan) / totalRevenueJan) * 100

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        subtitle="Visão geral da clínica — Fevereiro 2025"
      />

      <div className="p-6 space-y-6">

        {/* ===== SCORE DE SAÚDE ===== */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Score principal */}
            <div className="flex flex-col items-center lg:items-start gap-3 lg:w-48 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-red-500" />
                <h2 className="text-base font-semibold text-slate-800">Score de Saúde</h2>
              </div>
              <HealthScoreGauge score={currentScore.overallScore} />
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-semibold', getScoreColor(currentScore.overallScore))}>
                  {currentScore.overallScore}/100
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <ArrowUpRight size={11} />
                  +{currentScore.overallScore - prevScore.overallScore}pts vs Jan
                </span>
              </div>
            </div>

            {/* Divisor */}
            <div className="hidden lg:block w-px bg-slate-100 self-stretch" />

            {/* 6 dimensões */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-600">Framework 6P — Dimensões</h3>
                <a href="/health-score" className="text-xs text-brand-600 hover:underline">Ver detalhes →</a>
              </div>
              <SixPRadar scores={currentScore} />
            </div>

            {/* Divisor */}
            <div className="hidden lg:block w-px bg-slate-100 self-stretch" />

            {/* Histórico */}
            <div className="lg:w-48 flex-shrink-0 flex flex-col gap-3">
              <h3 className="text-sm font-medium text-slate-600">Evolução 6 meses</h3>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={HEALTH_SCORE_HISTORY} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" tick={{ fontSize: 9 }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v: number) => [`${v}`, 'Score']} contentStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="score" stroke="#10B981" fill="url(#scoreGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ===== KPIs PRINCIPAIS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Faturamento — Fev/25"
            value={formatCurrency(totalRevenueFeb)}
            change={revenueChange}
            status="good"
            icon={<DollarSign size={18} />}
            benchmark="Meta: R$ 45.000"
          />
          <KPICard
            label="Taxa de Ocupação"
            value={`${currentScore.occupancyRate}%`}
            change={currentScore.occupancyRate - prevScore.occupancyRate}
            status={currentScore.occupancyRate >= 75 ? 'good' : currentScore.occupancyRate >= 60 ? 'warning' : 'critical'}
            icon={<Calendar size={18} />}
            benchmark="Meta: ≥ 75%"
          />
          <KPICard
            label="Taxa de Faltas"
            value={`${currentScore.absenceRate}%`}
            change={-(currentScore.absenceRate - prevScore.absenceRate)}
            status={currentScore.absenceRate <= 10 ? 'good' : currentScore.absenceRate <= 15 ? 'warning' : 'critical'}
            icon={<XCircle size={18} />}
            benchmark="Meta: ≤ 10%"
          />
          <KPICard
            label="NPS Médio"
            value={currentScore.npsScore.toFixed(1)}
            unit="/10"
            change={currentScore.npsScore - prevScore.npsScore}
            status={currentScore.npsScore >= 9 ? 'good' : currentScore.npsScore >= 7 ? 'warning' : 'critical'}
            icon={<Star size={18} />}
            benchmark="Meta: ≥ 9.0"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Ticket Médio"
            value={formatCurrency(currentScore.avgTicket)}
            change={((currentScore.avgTicket - prevScore.avgTicket) / prevScore.avgTicket) * 100}
            status="good"
            icon={<TrendingUp size={18} />}
          />
          <KPICard
            label="Conversão de Orçamentos"
            value={`${currentScore.conversionRate}%`}
            change={currentScore.conversionRate - prevScore.conversionRate}
            status={currentScore.conversionRate >= 65 ? 'good' : 'warning'}
            icon={<Target size={18} />}
            benchmark="Meta: ≥ 65%"
          />
          <KPICard
            label="Taxa de Retorno"
            value={`${currentScore.returnRate}%`}
            change={currentScore.returnRate - prevScore.returnRate}
            status={currentScore.returnRate >= 60 ? 'good' : 'warning'}
            icon={<Users size={18} />}
            benchmark="Meta: ≥ 60%"
          />
          <KPICard
            label="Inadimplência"
            value={`${currentScore.defaultRate}%`}
            change={-(currentScore.defaultRate - prevScore.defaultRate)}
            status={currentScore.defaultRate <= 5 ? 'good' : currentScore.defaultRate <= 8 ? 'warning' : 'critical'}
            icon={<AlertTriangle size={18} />}
            benchmark="Meta: ≤ 5%"
          />
        </div>

        {/* ===== GRÁFICOS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Receita x Despesas */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Receita vs Despesas</h3>
              <span className="text-xs text-slate-400">Últimos 6 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_REVENUE} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v)]} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="receita" name="Receita" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth={1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" name="Lucro" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mix de procedimentos */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Mix de Procedimentos</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={PROCEDURES_MIX} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {PROCEDURES_MIX.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {PROCEDURES_MIX.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-600">{p.name}</span>
                  </div>
                  <span className="font-medium text-slate-800">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== AGENDAMENTOS + FUNIL ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Faltas e Desmarcações */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Agendamentos — Faltas e Desmarcações</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={APPOINTMENT_STATS} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="atendidos" name="Atendidos" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="faltas" name="Faltas" fill="#EF4444" stackId="a" />
                <Bar dataKey="desmarcados" name="Desmarcados" fill="#F59E0B" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Funil de Vendas */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Funil de Captação — Fev/25</h3>
            </div>
            <div className="space-y-3">
              {FUNNEL_DATA.map((stage, i) => {
                const pct = (stage.value / FUNNEL_DATA[0].value) * 100
                return (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24 flex-shrink-0">{stage.stage}</span>
                    <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${pct}%`, backgroundColor: stage.color }}
                      >
                        <span className="text-white text-xs font-bold">{stage.value}</span>
                      </div>
                    </div>
                    {i > 0 && (
                      <span className="text-xs text-slate-400 w-10 text-right flex-shrink-0">
                        {((stage.value / FUNNEL_DATA[i - 1].value) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Conversão total: {((FUNNEL_DATA[4].value / FUNNEL_DATA[0].value) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* ===== AGENDA DE HOJE + PLANOS DE AÇÃO ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Agenda de hoje */}
          <div className="card lg:col-span-3">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Agenda de Hoje</h3>
              <a href="/agenda" className="text-xs text-brand-600 hover:underline">Ver agenda completa →</a>
            </div>
            <div className="divide-y divide-slate-50">
              {todayApts.map(apt => (
                <div key={apt.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: apt.professionalColor }} />
                  <div className="flex flex-col flex-shrink-0 w-16">
                    <span className="text-sm font-semibold text-slate-900">
                      {apt.startTime.slice(11, 16)}
                    </span>
                    <span className="text-[10px] text-slate-400">{apt.duration}min</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {apt.patientName || 'Compromisso'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{apt.professionalName}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Planos de Ação */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Planos de Ação</h3>
              <a href="/action-plans" className="text-xs text-brand-600 hover:underline">Ver todos →</a>
            </div>
            <div className="divide-y divide-slate-50">
              {MOCK_ACTION_PLANS.map(plan => {
                const done = plan.tasks.filter(t => t.completed).length
                const total = plan.tasks.length
                const pct = Math.round((done / total) * 100)
                const priorityColor = {
                  critical: 'text-red-600 bg-red-50',
                  high: 'text-orange-600 bg-orange-50',
                  medium: 'text-amber-600 bg-amber-50',
                  low: 'text-emerald-600 bg-emerald-50',
                }[plan.priority]

                return (
                  <div key={plan.id} className="px-5 py-4">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 leading-snug">{plan.title}</p>
                      </div>
                      <span className={cn('badge text-[10px] flex-shrink-0', priorityColor)}>
                        {plan.priority === 'critical' ? 'Crítico' : plan.priority === 'high' ? 'Alta' : plan.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{done}/{total} tarefas</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ===== METAS ===== */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Metas do Mês</h3>
            <a href="/goals" className="text-xs text-brand-600 hover:underline">Gerenciar metas →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {MOCK_GOALS.map(goal => {
              const s = goal.percentComplete >= 80 ? 'good' : goal.percentComplete >= 50 ? 'warning' : 'critical'
              const barColor = s === 'good' ? 'bg-emerald-500' : s === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              return (
                <div key={goal.id} className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{goal.title}</span>
                    <span className={cn('font-semibold', s === 'good' ? 'text-emerald-600' : s === 'warning' ? 'text-amber-600' : 'text-red-600')}>
                      {goal.percentComplete.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${Math.min(goal.percentComplete, 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {goal.metric === 'absence_rate'
                      ? `Atual: ${goal.currentValue}% / Meta: ${goal.targetValue}%`
                      : `${goal.currentValue.toLocaleString('pt-BR')} / ${goal.targetValue.toLocaleString('pt-BR')}`}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
