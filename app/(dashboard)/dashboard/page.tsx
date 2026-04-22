'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import {
  TrendingUp, Users, Calendar, DollarSign,
  Heart, AlertTriangle, Target, ArrowUpRight, ArrowDownRight,
  Minus, XCircle, Star,
} from 'lucide-react'
import {
  formatCurrency, getScoreColor, getScoreBg, getScoreLabel,
  getAppointmentStatusLabel, getAppointmentStatusColor, cn,
} from '@/lib/utils'

// ============================
// STATIC PLACEHOLDER DATA
// (sections without dedicated API endpoints yet)
// ============================

const HEALTH_SCORE = {
  overallScore: 72,
  patientScore: 75,
  productionScore: 68,
  peopleScore: 80,
  processScore: 70,
  planningScore: 65,
  prosperityScore: 73,
}
const PREV_HEALTH_SCORE = { overallScore: 68 }

const PROCEDURES_MIX = [
  { name: 'Limpeza/Profilaxia', value: 35, color: '#334155' },
  { name: 'Restauração',        value: 25, color: '#475569' },
  { name: 'Ortodontia',         value: 20, color: '#64748B' },
  { name: 'Clareamento',        value: 12, color: '#94A3B8' },
  { name: 'Outros',             value: 8,  color: '#CBD5E1' },
]

const APPOINTMENT_STATS = [
  { name: 'Sem 1', atendidos: 18, faltas: 2, desmarcados: 1 },
  { name: 'Sem 2', atendidos: 22, faltas: 1, desmarcados: 3 },
  { name: 'Sem 3', atendidos: 20, faltas: 3, desmarcados: 2 },
  { name: 'Sem 4', atendidos: 25, faltas: 2, desmarcados: 1 },
]

const MOCK_ACTION_PLANS = [
  {
    id: '1',
    title: 'Reduzir taxa de faltas para abaixo de 10%',
    priority: 'critical' as const,
    tasks: [{ completed: true }, { completed: false }, { completed: false }],
  },
  {
    id: '2',
    title: 'Implementar protocolo de confirmação de consultas',
    priority: 'high' as const,
    tasks: [{ completed: true }, { completed: true }, { completed: false }],
  },
  {
    id: '3',
    title: 'Campanha de reativação de pacientes inativos',
    priority: 'medium' as const,
    tasks: [{ completed: true }, { completed: false }],
  },
]

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
  const iconBg = {
    good:     'bg-emerald-50 text-emerald-600',
    warning:  'bg-amber-50 text-amber-600',
    critical: 'bg-red-50 text-red-600',
  }
  const changeBadge = {
    good:     'text-emerald-700 bg-emerald-50',
    warning:  'text-amber-700 bg-amber-50',
    critical: 'text-red-700 bg-red-50',
  }
  const s = status || 'good'

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg[s])}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-md', changeBadge[s])}>
            {change > 0 ? <ArrowUpRight size={12} /> : change < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}{unit && <span className="text-base font-normal text-slate-400 ml-1">{unit}</span>}
        </p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {benchmark && (
        <p className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          {benchmark}
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
          <circle
            cx="90" cy="100" r={radius}
            fill="none" stroke="#E2E8F0" strokeWidth="14"
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(135, 90, 100)"
          />
          <circle
            cx="90" cy="100" r={radius}
            fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(135, 90, 100)"
            className="score-ring"
          />
          <text x="90" y="95" textAnchor="middle" fill={color} fontSize="32" fontWeight="700">
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
// 6P DIMENSIONS
// ============================

interface ClinicHealthScoreDimensions {
  patientScore: number
  productionScore: number
  peopleScore: number
  processScore: number
  planningScore: number
  prosperityScore: number
}

function SixPRadar({ scores }: { scores: ClinicHealthScoreDimensions }) {
  const dims = [
    { key: 'patientScore',    label: 'Paciente' },
    { key: 'productionScore', label: 'Produção' },
    { key: 'peopleScore',     label: 'Pessoas' },
    { key: 'processScore',    label: 'Processo' },
    { key: 'planningScore',   label: 'Planejamento' },
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

// ============================
// STATUS BADGE
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
  const [kpis, setKpis]   = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/goals').then(r => r.json()).catch(() => []),
    ]).then(([dashData, goalsData]) => {
      setKpis(dashData)
      setGoals(Array.isArray(goalsData) ? goalsData : [])
    }).finally(() => setLoading(false))
  }, [])

  const todayApts    = kpis?.recentAppointments ?? []
  const monthlyRevenue: any[] = kpis?.monthlyRevenue ?? []

  // Map API response to chart-expected shape
  const chartRevenue = monthlyRevenue.map((m: any) => ({
    name:     m.month ?? m.name ?? '',
    receita:  m.revenue  ?? m.receita  ?? 0,
    despesas: m.expenses ?? m.despesas ?? 0,
    lucro:    Math.max(0, (m.revenue ?? m.receita ?? 0) - (m.expenses ?? m.despesas ?? 0)),
  }))

  // Funnel derived from KPI data
  const leadsTotal = kpis?.leadsThisMonth ?? 0
  const convRate   = kpis?.conversionRate ?? 0
  const funnelData = [
    { stage: 'Leads',        value: leadsTotal,                                    color: '#334155' },
    { stage: 'Contactados',  value: Math.round(leadsTotal * 0.72),                 color: '#475569' },
    { stage: 'Agendados',    value: Math.round(leadsTotal * 0.48),                 color: '#64748B' },
    { stage: 'Compareceram', value: Math.round(leadsTotal * 0.38),                 color: '#94A3B8' },
    { stage: 'Convertidos',  value: Math.round(leadsTotal * (convRate / 100)),     color: '#1E293B' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Carregando dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        subtitle={`Visão geral — ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
      />

      <div className="p-6 space-y-6">

        {/* ===== SCORE DE SAÚDE ===== */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Score principal */}
            <div className="flex flex-col items-center lg:items-start gap-3 lg:w-48 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700">Score de Saúde</h2>
              </div>
              <HealthScoreGauge score={HEALTH_SCORE.overallScore} />
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-semibold', getScoreColor(HEALTH_SCORE.overallScore))}>
                  {HEALTH_SCORE.overallScore}/100
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <ArrowUpRight size={11} />
                  +{HEALTH_SCORE.overallScore - PREV_HEALTH_SCORE.overallScore}pts
                </span>
              </div>
            </div>

            <div className="hidden lg:block w-px bg-slate-100 self-stretch" />

            {/* 6 dimensões */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Framework 6P — Dimensões</h3>
                <a href="/health-score" className="text-xs text-brand-600 hover:underline">Ver detalhes →</a>
              </div>
              <SixPRadar scores={HEALTH_SCORE} />
            </div>

            <div className="hidden lg:block w-px bg-slate-100 self-stretch" />

            {/* Histórico */}
            <div className="lg:w-48 flex-shrink-0 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Evolução 6 meses</h3>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={chartRevenue.map(m => ({ period: m.name, score: 65 + Math.random() * 15 }))} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" tick={{ fontSize: 9 }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v: number) => [v.toFixed(0), 'Score']} contentStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="score" stroke="#10B981" fill="url(#scoreGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ===== KPIs PRINCIPAIS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Faturamento do Mês"
            value={formatCurrency(kpis?.revenueThisMonth ?? 0)}
            status="good"
            icon={<DollarSign size={18} />}
            benchmark="Meta: R$ 45.000"
          />
          <KPICard
            label="Consultas Hoje"
            value={kpis?.appointmentsToday ?? 0}
            status="good"
            icon={<Calendar size={18} />}
          />
          <KPICard
            label="Taxa de Faltas"
            value={`${kpis?.absenceRateThisMonth ?? 0}%`}
            status={(kpis?.absenceRateThisMonth ?? 0) <= 10 ? 'good' : 'warning'}
            icon={<XCircle size={18} />}
            benchmark="Meta: ≤ 10%"
          />
          <KPICard
            label="Total de Pacientes"
            value={kpis?.totalPatients ?? 0}
            status="good"
            icon={<Users size={18} />}
            description={`+${kpis?.newPatientsThisMonth ?? 0} novos este mês`}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="A Receber"
            value={formatCurrency(kpis?.pendingReceivable ?? 0)}
            status="warning"
            icon={<TrendingUp size={18} />}
          />
          <KPICard
            label="Vencido"
            value={formatCurrency(kpis?.overdueReceivable ?? 0)}
            status={(kpis?.overdueReceivable ?? 0) > 0 ? 'critical' : 'good'}
            icon={<AlertTriangle size={18} />}
          />
          <KPICard
            label="Taxa de Conversão"
            value={`${kpis?.conversionRate ?? 0}%`}
            status={(kpis?.conversionRate ?? 0) >= 65 ? 'good' : 'warning'}
            icon={<Target size={18} />}
            benchmark="Meta: ≥ 65%"
          />
          <KPICard
            label="Leads este Mês"
            value={kpis?.leadsThisMonth ?? 0}
            status="good"
            icon={<Star size={18} />}
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
              <BarChart data={chartRevenue} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v)]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="receita"  name="Receita"  fill="#334155" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro"    name="Lucro"    fill="#10B981" radius={[4, 4, 0, 0]} />
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
                <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {PROCEDURES_MIX.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-600">{p.name}</span>
                  </div>
                  <span className="font-medium text-slate-700">{p.value}%</span>
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
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="atendidos"   name="Atendidos"   fill="#334155" stackId="a" />
                <Bar dataKey="faltas"      name="Faltas"      fill="#EF4444" stackId="a" />
                <Bar dataKey="desmarcados" name="Desmarcados" fill="#F59E0B" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Funil de Vendas */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Funil de Captação</h3>
              <span className="text-xs text-slate-400">Este mês</span>
            </div>
            <div className="space-y-3">
              {funnelData.map((stage, i) => {
                const pct = funnelData[0].value > 0 ? (stage.value / funnelData[0].value) * 100 : 0
                return (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24 flex-shrink-0">{stage.stage}</span>
                    <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: stage.color }}
                      >
                        <span className="text-white text-xs font-bold">{stage.value}</span>
                      </div>
                    </div>
                    {i > 0 && funnelData[i - 1].value > 0 && (
                      <span className="text-xs text-slate-400 w-10 text-right flex-shrink-0">
                        {((stage.value / funnelData[i - 1].value) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {funnelData[0].value > 0 && (
              <p className="text-xs text-slate-400 mt-3">
                Conversão total: {((funnelData[4].value / funnelData[0].value) * 100).toFixed(1)}%
              </p>
            )}
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
              {todayApts.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">Nenhuma consulta agendada para hoje</div>
              ) : (
                todayApts.map((apt: any) => (
                  <div key={apt.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: apt.professionalColor ?? '#94A3B8' }} />
                    <div className="flex flex-col flex-shrink-0 w-16">
                      <span className="text-sm font-semibold text-slate-900">
                        {apt.startTime?.slice(11, 16)}
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
                ))
              )}
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
                const done  = plan.tasks.filter(t => t.completed).length
                const total = plan.tasks.length
                const pct   = Math.round((done / total) * 100)
                const priorityColor = {
                  critical: 'text-red-600 bg-red-50',
                  high:     'text-orange-600 bg-orange-50',
                  medium:   'text-amber-600 bg-amber-50',
                  low:      'text-emerald-600 bg-emerald-50',
                }[plan.priority]
                const priorityLabel = {
                  critical: 'Crítico', high: 'Alta', medium: 'Média', low: 'Baixa',
                }[plan.priority]

                return (
                  <div key={plan.id} className="px-5 py-4">
                    <div className="flex items-start gap-2 mb-2">
                      <p className="flex-1 text-xs font-medium text-slate-700 leading-snug">{plan.title}</p>
                      <span className={cn('badge text-[10px] flex-shrink-0', priorityColor)}>
                        {priorityLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{done}/{total}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ===== METAS ===== */}
        {goals.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Metas do Mês</h3>
              <a href="/goals" className="text-xs text-brand-600 hover:underline">Gerenciar metas →</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {goals.slice(0, 5).map((goal: any) => {
                const pct = goal.percentComplete ?? 0
                const s   = pct >= 80 ? 'good' : pct >= 50 ? 'warning' : 'critical'
                const barColor  = s === 'good' ? 'bg-emerald-500' : s === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                const textColor = s === 'good' ? 'text-emerald-600' : s === 'warning' ? 'text-amber-600' : 'text-red-600'
                return (
                  <div key={goal.id} className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium truncate pr-1">{goal.title}</span>
                      <span className={cn('font-semibold flex-shrink-0', textColor)}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {goal.currentValue?.toLocaleString('pt-BR')} / {goal.targetValue?.toLocaleString('pt-BR')}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
