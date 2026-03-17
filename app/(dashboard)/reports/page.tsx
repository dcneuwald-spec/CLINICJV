'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import {
  BarChart3, FileText, Download, Calendar, DollarSign,
  Users, Activity, Search, Filter, Eye,
  TrendingUp, ArrowUpRight,
} from 'lucide-react'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import {
  APPOINTMENT_STATS, MONTHLY_REVENUE, PROCEDURES_MIX,
} from '@/lib/mock-data'
import { cn, formatCurrency } from '@/lib/utils'

const REPORT_CATEGORIES = [
  {
    id: 'appointments',
    label: 'Agendamentos',
    icon: <Calendar size={16} />,
    color: 'bg-blue-100 text-blue-700',
    reports: [
      'Relatório Geral de Agendamentos',
      'Taxa de Faltas por Profissional',
      'Desmarcações e Motivos',
      'Primeiras Consultas',
      'Ocupação da Agenda',
      'Alertas de Retorno',
      'Marcadores e Categorias',
    ],
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: <DollarSign size={16} />,
    color: 'bg-emerald-100 text-emerald-700',
    reports: [
      'DRE Gerencial',
      'Fluxo de Caixa',
      'Contas a Receber',
      'Contas a Pagar',
      'Balancete Mensal',
      'Pagamentos e Comissões',
      'Inadimplência por Período',
      'Notas Fiscais Emitidas',
      'Recibos',
    ],
  },
  {
    id: 'patients',
    label: 'Pacientes',
    icon: <Users size={16} />,
    color: 'bg-purple-100 text-purple-700',
    reports: [
      'Novos Pacientes por Período',
      'Faixa Etária',
      'Origem de Captação',
      'Localização Geográfica',
      'Indicações',
      'Avaliações Google',
      'Régua de Cobrança',
      'Taxa de Retorno',
      'NPS e Satisfação',
    ],
  },
  {
    id: 'procedures',
    label: 'Tratamentos',
    icon: <Activity size={16} />,
    color: 'bg-amber-100 text-amber-700',
    reports: [
      'Procedimentos Executados',
      'Faturamento por Procedimento',
      'Procedimentos Não Realizados',
      'Mix de Procedimentos',
      'Evolução de Tratamentos',
    ],
  },
  {
    id: 'crm',
    label: 'CRM e Vendas',
    icon: <TrendingUp size={16} />,
    color: 'bg-pink-100 text-pink-700',
    reports: [
      'Orçamentos e Conversão',
      'Funil de Vendas',
      'Oportunidades Abertas',
      'Performance de Campanhas',
      'CPL por Canal',
      'ROI de Marketing',
    ],
  },
  {
    id: 'general',
    label: 'Geral',
    icon: <FileText size={16} />,
    color: 'bg-slate-100 text-slate-700',
    reports: [
      'Acessos por Usuário',
      'Ações e Auditoria',
      'Mensagens Enviadas',
      'Confirmações e Alertas',
    ],
  },
]

const QUICK_REPORTS = [
  { label: 'Ocupação da Agenda', value: '71,4%', change: '+6,2%', color: 'brand' },
  { label: 'Novos Pacientes', value: '14', change: '+3', color: 'emerald' },
  { label: 'Faturamento', value: 'R$ 38.400', change: '+8,5%', color: 'amber' },
  { label: 'Taxa de Faltas', value: '12,5%', change: '-2,3%', color: 'red' },
]

export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState('appointments')
  const [activeReport, setActiveReport] = useState<string | null>('Relatório Geral de Agendamentos')
  const [period, setPeriod] = useState('month')

  const currentCategory = REPORT_CATEGORIES.find(c => c.id === activeCategory)

  return (
    <div className="animate-fade-in">
      <Header title="Relatórios e Indicadores" subtitle="Análise detalhada de todos os dados da clínica" />

      <div className="p-6 space-y-5">
        {/* Quick KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_REPORTS.map(r => (
            <div key={r.label} className="card p-4">
              <p className="text-xl font-bold text-slate-900">{r.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{r.label}</p>
              <span className={cn(
                'text-xs font-medium mt-2 inline-flex items-center gap-0.5',
                r.label.includes('Faltas')
                  ? (r.change.startsWith('-') ? 'text-emerald-600' : 'text-red-600')
                  : (r.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'),
              )}>
                <ArrowUpRight size={12} />{r.change} vs mês anterior
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-5">
          {/* Sidebar de categorias */}
          <div className="w-52 flex-shrink-0 space-y-1">
            {REPORT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setActiveReport(null) }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left',
                  activeCategory === cat.id
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                <span className={cn(
                  'flex-shrink-0',
                  activeCategory === cat.id ? 'text-white' : '',
                )}>
                  {cat.icon}
                </span>
                <span className="font-medium">{cat.label}</span>
                <span className={cn(
                  'ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                  activeCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-400',
                )}>
                  {cat.reports.length}
                </span>
              </button>
            ))}
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Lista de relatórios da categoria */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center', currentCategory?.color)}>
                    {currentCategory?.icon}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-800">{currentCategory?.label}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                    className="input text-xs py-1.5 w-36"
                  >
                    <option value="today">Hoje</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mês</option>
                    <option value="quarter">Trimestre</option>
                    <option value="year">Este ano</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {currentCategory?.reports.map(report => (
                  <button
                    key={report}
                    onClick={() => setActiveReport(report)}
                    className={cn(
                      'flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors text-left',
                      activeReport === report && 'bg-brand-50',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-1.5 h-1.5 rounded-full', activeReport === report ? 'bg-brand-600' : 'bg-slate-300')} />
                      <span className={cn('text-sm', activeReport === report ? 'font-semibold text-brand-700' : 'text-slate-700')}>
                        {report}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="p-1 hover:bg-slate-200 rounded transition-colors" onClick={e => e.stopPropagation()}>
                        <Eye size={13} className="text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 rounded transition-colors" onClick={e => e.stopPropagation()}>
                        <Download size={13} className="text-slate-400" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prévia do relatório ativo */}
            {activeReport === 'Relatório Geral de Agendamentos' && (
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Relatório Geral de Agendamentos</h3>
                  <button className="btn-secondary text-xs gap-1.5"><Download size={13} /> Exportar Excel</button>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={APPOINTMENT_STATS} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="atendidos" name="Atendidos" fill="#10B981" stackId="a" />
                    <Bar dataKey="faltas" name="Faltas" fill="#EF4444" stackId="a" />
                    <Bar dataKey="desmarcados" name="Desmarcados" fill="#F59E0B" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total Agendamentos', value: '182' },
                    { label: 'Atendidos', value: '143', sub: '78,6%' },
                    { label: 'Faltas', value: '23', sub: '12,6%' },
                    { label: 'Desmarcados', value: '16', sub: '8,8%' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-slate-900">{s.value}</p>
                      {s.sub && <p className="text-xs text-slate-400">{s.sub}</p>}
                      <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeReport === 'DRE Gerencial' && (
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">DRE Gerencial — Fev/2025</h3>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs gap-1.5"><Eye size={13} /> Power BI</button>
                    <button className="btn-secondary text-xs gap-1.5"><Download size={13} /> Exportar</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={MONTHLY_REVENUE} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v)]} contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="receita" name="Receita" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" name="Despesas" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lucro" name="Lucro" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeReport === 'Mix de Procedimentos' && (
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Mix de Procedimentos — Fev/2025</h3>
                  <button className="btn-secondary text-xs gap-1.5"><Download size={13} /> Exportar</button>
                </div>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={PROCEDURES_MIX} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                        {PROCEDURES_MIX.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {PROCEDURES_MIX.map(p => (
                      <div key={p.name} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-sm text-slate-700 flex-1">{p.name}</span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p.value}%`, backgroundColor: p.color }} />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 w-10 text-right">{p.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeReport && !['Relatório Geral de Agendamentos', 'DRE Gerencial', 'Mix de Procedimentos'].includes(activeReport) && (
              <div className="card p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 size={24} className="text-brand-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1">{activeReport}</p>
                <p className="text-xs text-slate-400 mb-5">Relatório disponível para o período selecionado</p>
                <div className="flex gap-2 justify-center">
                  <button className="btn-primary text-sm gap-2"><Eye size={14} /> Visualizar Relatório</button>
                  <button className="btn-secondary text-sm gap-2"><Download size={14} /> Exportar Excel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
