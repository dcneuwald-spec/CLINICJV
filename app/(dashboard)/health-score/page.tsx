'use client'

import { Header } from '@/components/layout/header'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  Heart, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, ArrowUpRight, Info, Lightbulb,
} from 'lucide-react'
import { MOCK_HEALTH_SCORES, HEALTH_SCORE_HISTORY } from '@/lib/mock-data'
import {
  cn, formatCurrency, getScoreColor, getScoreBg, getScoreLabel,
} from '@/lib/utils'

const BENCHMARK: Record<string, number> = {
  occupancyRate: 75,
  absenceRate: 10,
  returnRate: 60,
  conversionRate: 65,
  npsScore: 9,
  avgTicket: 600,
  defaultRate: 5,
  revenueGrowth: 10,
}

const DIMENSIONS = [
  { key: 'patientScore',    label: 'Paciente',      description: 'Captação, retenção e NPS dos pacientes' },
  { key: 'productionScore', label: 'Produção',       description: 'Ocupação, ticket médio e volume de procedimentos' },
  { key: 'peopleScore',     label: 'Pessoas',        description: 'Produtividade da equipe e satisfação dos profissionais' },
  { key: 'processScore',    label: 'Processo',       description: 'Eficiência operacional, faltas e conversão' },
  { key: 'planningScore',   label: 'Planejamento',   description: 'Aderência a metas e orçamento vs realizado' },
  { key: 'prosperityScore', label: 'Prosperidade',   description: 'Lucratividade, crescimento e fluxo de caixa' },
]

const KPIS = [
  { key: 'occupancyRate',   label: 'Taxa de Ocupação',         unit: '%',    higherIsBetter: true  },
  { key: 'absenceRate',     label: 'Taxa de Faltas',           unit: '%',    higherIsBetter: false },
  { key: 'returnRate',      label: 'Taxa de Retorno',          unit: '%',    higherIsBetter: true  },
  { key: 'conversionRate',  label: 'Conversão de Orçamentos',  unit: '%',    higherIsBetter: true  },
  { key: 'npsScore',        label: 'NPS Médio',                unit: '/10',  higherIsBetter: true  },
  { key: 'avgTicket',       label: 'Ticket Médio',             unit: 'R$',   higherIsBetter: true  },
  { key: 'defaultRate',     label: 'Inadimplência',            unit: '%',    higherIsBetter: false },
  { key: 'revenueGrowth',   label: 'Crescimento de Receita',   unit: '%',    higherIsBetter: true  },
]

function ScoreGauge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const r = size === 'lg' ? 70 : size === 'md' ? 55 : 40
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75
  const offset = arc - (arc * Math.min(score, 100)) / 100
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'
  const dim = size === 'lg' ? 180 : size === 'md' ? 140 : 100

  return (
    <svg viewBox={`0 0 ${dim} ${dim}`} className={size === 'lg' ? 'w-44 h-36' : size === 'md' ? 'w-28 h-24' : 'w-20 h-16'}>
      <circle cx={dim / 2} cy={dim * 0.72} r={r} fill="none" stroke="#E2E8F0" strokeWidth={size === 'lg' ? 14 : 10}
        strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" transform={`rotate(135, ${dim / 2}, ${dim * 0.72})`} />
      <circle cx={dim / 2} cy={dim * 0.72} r={r} fill="none" stroke={color} strokeWidth={size === 'lg' ? 14 : 10}
        strokeDasharray={`${arc} ${circ}`} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(135, ${dim / 2}, ${dim * 0.72})`} className="score-ring" />
      <text x={dim / 2} y={dim * 0.72 - 4} textAnchor="middle" fill={color}
        fontSize={size === 'lg' ? 28 : size === 'md' ? 22 : 16} fontWeight="700">{score}</text>
      <text x={dim / 2} y={dim * 0.72 + 14} textAnchor="middle" fill="#94A3B8"
        fontSize={size === 'lg' ? 12 : 10}>{getScoreLabel(score)}</text>
    </svg>
  )
}

export default function HealthScorePage() {
  const current = MOCK_HEALTH_SCORES[0]
  const prev = MOCK_HEALTH_SCORES[1]

  const radarData = DIMENSIONS.map(d => ({
    subject: d.label,
    value: current[d.key as keyof typeof current] as number,
    benchmark: 70,
  }))

  return (
    <div className="animate-fade-in">
      <Header title="Score de Saúde da Clínica" subtitle="Framework 6P — Diagnóstico estratégico" />

      <div className="p-6 space-y-6">
        {/* Score principal + radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score geral */}
          <div className="card p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-red-500" />
              <h3 className="text-sm font-semibold text-slate-800">Score Geral</h3>
            </div>
            <ScoreGauge score={current.overallScore} size="lg" />
            <div className="text-center">
              <p className="text-xs text-slate-500">Período: Fevereiro 2025</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs text-slate-400">vs Jan/25:</span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <ArrowUpRight size={12} />
                  +{current.overallScore - prev.overallScore} pts
                </span>
              </div>
            </div>
          </div>

          {/* Radar 6P */}
          <div className="card p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Mapa das 6 Dimensões</h3>
            <p className="text-xs text-slate-400 mb-4">Linha tracejada = benchmark de 70 pontos</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar name="Sua Clínica" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#10B981" fill="#10B981" fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6 dimensões detalhadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIMENSIONS.map(d => {
            const val = current[d.key as keyof typeof current] as number
            const prevVal = prev[d.key as keyof typeof prev] as number
            const diff = val - prevVal

            return (
              <div key={d.key} className="card p-4 flex gap-4 items-center">
                <ScoreGauge score={val} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{d.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{d.description}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={cn(
                      'flex items-center gap-0.5 text-xs font-medium',
                      diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-slate-400',
                    )}>
                      {diff > 0 ? <TrendingUp size={11} /> : diff < 0 ? <TrendingDown size={11} /> : null}
                      {diff > 0 ? '+' : ''}{diff} vs mês anterior
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* KPIs detalhados */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">KPIs Estratégicos</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {KPIS.map(kpi => {
              const val = current[kpi.key as keyof typeof current] as number
              const bench = BENCHMARK[kpi.key]
              const isGood = kpi.higherIsBetter ? val >= bench : val <= bench
              const pct = kpi.higherIsBetter
                ? Math.min((val / bench) * 100, 100)
                : Math.min((bench / val) * 100, 100)

              return (
                <div key={kpi.key} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-1/4 min-w-32">
                    <p className="text-xs font-medium text-slate-700">{kpi.label}</p>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', isGood ? 'bg-emerald-500' : 'bg-amber-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={cn('text-sm font-bold w-20 text-right', isGood ? 'text-emerald-700' : 'text-amber-700')}>
                      {kpi.unit === 'R$' ? formatCurrency(val) : `${val}${kpi.unit}`}
                    </span>
                  </div>
                  <div className="w-32 text-right">
                    <span className="text-xs text-slate-400">
                      Benchmark: {kpi.unit === 'R$' ? formatCurrency(bench) : `${bench}${kpi.unit}`}
                    </span>
                  </div>
                  <div className="w-8 flex-shrink-0 flex justify-center">
                    {isGood
                      ? <CheckCircle2 size={16} className="text-emerald-500" />
                      : <AlertTriangle size={16} className="text-amber-500" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Histórico + recomendações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Histórico */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Evolução do Score</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={HEALTH_SCORE_HISTORY} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                <defs>
                  <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                {/* Linha de benchmark */}
                <Area type="monotone" dataKey="score" name="Score" stroke="#3B82F6" fill="url(#scoreAreaGrad)" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recomendações */}
          <div className="card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">Recomendações Inteligentes</h3>
            </div>

            {[
              {
                priority: 'high',
                metric: 'Taxa de Faltas — 12,5%',
                insight: 'Taxa 25% acima do benchmark. Ativar confirmação via WhatsApp 24h e 2h antes pode reduzir em até 34%.',
                cta: 'Ver Plano de Ação',
              },
              {
                priority: 'medium',
                metric: 'Taxa de Retorno — 58%',
                insight: 'Meta é 60%. Implementar régua de reativação para pacientes sem visita há 30+ dias pode elevar em 8-12 pontos.',
                cta: 'Ativar no CRC',
              },
              {
                priority: 'low',
                metric: 'NPS — 8.4/10',
                insight: 'Bom, mas a meta é 9.0. Automatizar pesquisa de satisfação pós-consulta e coletar mais avaliações Google.',
                cta: 'Configurar NPS',
              },
            ].map(rec => (
              <div key={rec.metric} className={cn(
                'rounded-xl p-3 border-l-4',
                rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                rec.priority === 'medium' ? 'bg-amber-50 border-amber-500' :
                'bg-blue-50 border-blue-500',
              )}>
                <p className="text-xs font-semibold text-slate-800">{rec.metric}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.insight}</p>
                <button className="text-xs font-medium text-brand-600 hover:underline mt-1.5">{rec.cta} →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
