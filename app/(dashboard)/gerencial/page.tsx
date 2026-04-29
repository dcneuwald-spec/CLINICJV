'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import {
  ChevronLeft, ChevronRight, Plus, Save, TrendingUp, TrendingDown,
  DollarSign, Users, Calendar, RefreshCw, BarChart2, X,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { cn, formatCurrency } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyReport {
  id?: string
  date: string
  revenue: number
  ticketMedio: number
  attendedRevenue: number
  leadsTotal: number
  leadsOrganic: number
  leadsClients: number
  leadsTraffic: number
  leadsReferral: number
  leadsScheduled: number
  attendedLeads: number
  attendedTraffic: number
  productsSold: number
  pa: number
  reactivations7d: number
  reactivationsScheduled: number
}

const EMPTY: Omit<DailyReport, 'date'> = {
  revenue: 0, ticketMedio: 0, attendedRevenue: 0,
  leadsTotal: 0, leadsOrganic: 0, leadsClients: 0, leadsTraffic: 0,
  leadsReferral: 0, leadsScheduled: 0, attendedLeads: 0, attendedTraffic: 0,
  productsSold: 0, pa: 0, reactivations7d: 0, reactivationsScheduled: 0,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(d: Date) { return d.toISOString().slice(0, 10) }

function fmtDate(iso: string) {
  const [y, m, day] = iso.split('-')
  return `${day}/${m}/${y}`
}

function fmtShort(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number | string
  fmt?: 'currency' | 'number' | 'decimal'
  trend?: number // % change vs yesterday
  color?: string
  sub?: string
}

function KpiCard({ label, value, fmt = 'number', trend, color = 'brand', sub }: KpiCardProps) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    violet: 'bg-violet-100 text-violet-600',
    sky: 'bg-sky-100 text-sky-600',
  }
  const display =
    fmt === 'currency' ? formatCurrency(Number(value)) :
    fmt === 'decimal' ? Number(value).toFixed(1) :
    String(value)

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-slate-500 leading-tight">{label}</p>
        {trend !== undefined && (
          <span className={cn('text-[10px] font-semibold flex items-center gap-0.5 shrink-0', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <p className={cn('text-xl font-bold', `text-slate-800`)}>{display}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  )
}

// ─── Data Entry Modal ─────────────────────────────────────────────────────────

interface ModalProps {
  date: string
  initial: Omit<DailyReport, 'date'>
  onSave: (data: Omit<DailyReport, 'date'>) => void
  onClose: () => void
  saving: boolean
}

const FIELDS: Array<{ key: keyof Omit<DailyReport, 'date'>; label: string; fmt: 'currency' | 'int' | 'decimal'; section: string }> = [
  { key: 'revenue',               label: 'Faturamento',                    fmt: 'currency', section: 'Financeiro' },
  { key: 'attendedRevenue',       label: 'Pessoas Atendidas - R$',          fmt: 'currency', section: 'Financeiro' },
  { key: 'ticketMedio',           label: 'Ticket Médio',                    fmt: 'currency', section: 'Financeiro' },
  { key: 'leadsTotal',            label: 'Leads Abordados',                 fmt: 'int',      section: 'Leads' },
  { key: 'leadsOrganic',          label: 'Orgânico',                        fmt: 'int',      section: 'Leads' },
  { key: 'leadsClients',          label: 'Leads que já são Clientes',       fmt: 'int',      section: 'Leads' },
  { key: 'leadsTraffic',          label: 'Leads Tráfego',                   fmt: 'int',      section: 'Leads' },
  { key: 'leadsReferral',         label: 'Leads Indicação',                 fmt: 'int',      section: 'Leads' },
  { key: 'leadsScheduled',        label: 'Lead Agendado',                   fmt: 'int',      section: 'Leads' },
  { key: 'attendedLeads',         label: 'Pessoas Atendidas - Lead',        fmt: 'int',      section: 'Atendimento' },
  { key: 'attendedTraffic',       label: 'Pessoas Atendidas - Tráfego',     fmt: 'int',      section: 'Atendimento' },
  { key: 'productsSold',          label: 'Prod/Serv Vendidos',              fmt: 'int',      section: 'Atendimento' },
  { key: 'pa',                    label: 'PA',                              fmt: 'decimal',  section: 'Atendimento' },
  { key: 'reactivations7d',       label: 'Reativações (+7 dias)',           fmt: 'int',      section: 'Reativações' },
  { key: 'reactivationsScheduled',label: 'Reativações Agendadas',           fmt: 'int',      section: 'Reativações' },
]

function DataModal({ date, initial, onSave, onClose, saving }: ModalProps) {
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map(f => [f.key, String(initial[f.key] ?? 0)]))
  )

  const sections = Array.from(new Set(FIELDS.map(f => f.section)))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: any = {}
    FIELDS.forEach(f => {
      data[f.key] = f.fmt === 'int' ? parseInt(form[f.key] || '0') : parseFloat(form[f.key] || '0')
    })
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">Inserir dados do dia</h2>
            <p className="text-xs text-slate-500 mt-0.5">{fmtDate(date)}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {sections.map(section => (
            <div key={section}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{section}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FIELDS.filter(f => f.section === section).map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-600 font-medium block mb-1">{f.label}</label>
                    <input
                      type="number"
                      step={f.fmt === 'int' ? '1' : '0.01'}
                      min="0"
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="input text-sm py-1.5 w-full"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </form>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary text-sm gap-2">
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GerencialPage() {
  const [selectedDate, setSelectedDate] = useState(toISO(new Date()))
  const [todayData, setTodayData] = useState<Omit<DailyReport, 'date'>>(EMPTY)
  const [history, setHistory] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeChart, setActiveChart] = useState<'financial' | 'leads' | 'attended' | 'reactivations'>('financial')

  const loadData = useCallback(async () => {
    setLoading(true)
    // Load selected day
    const res = await fetch(`/api/gerencial/${selectedDate}`)
    if (res.ok) {
      const d = await res.json()
      setTodayData(d ? { ...EMPTY, ...d } : { ...EMPTY })
    }
    // Load last 30 days for charts
    const end = new Date(selectedDate)
    const start = new Date(end)
    start.setDate(start.getDate() - 29)
    const hist = await fetch(`/api/gerencial?startDate=${toISO(start)}&endDate=${toISO(end)}`)
    if (hist.ok) setHistory(await hist.json())
    setLoading(false)
  }, [selectedDate])

  useEffect(() => { loadData() }, [loadData])

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    if (d <= new Date()) setSelectedDate(toISO(d))
  }

  const handleSave = async (data: Omit<DailyReport, 'date'>) => {
    setSaving(true)
    const res = await fetch('/api/gerencial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, ...data }),
    })
    if (res.ok) {
      const saved = await res.json()
      setTodayData({ ...EMPTY, ...saved })
      setModalOpen(false)
      loadData()
    }
    setSaving(false)
  }

  // Calculate trend vs previous day from history
  const prevDay = history.length >= 2 ? history[history.length - 2] : null
  const trend = (key: keyof Omit<DailyReport, 'date' | 'id'>) => {
    if (!prevDay || !prevDay[key] || Number(prevDay[key]) === 0) return undefined
    return ((Number(todayData[key]) - Number(prevDay[key])) / Number(prevDay[key])) * 100
  }

  // Chart data
  const chartData = history.map(r => ({
    date: fmtShort(typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().slice(0, 10)),
    revenue: r.revenue,
    ticketMedio: r.ticketMedio,
    leadsOrganic: r.leadsOrganic,
    leadsTraffic: r.leadsTraffic,
    leadsReferral: r.leadsReferral,
    leadsClients: r.leadsClients,
    attendedLeads: r.attendedLeads,
    attendedTraffic: r.attendedTraffic,
    reactivations7d: r.reactivations7d,
    reactivationsScheduled: r.reactivationsScheduled,
  }))

  const totalAttended = todayData.attendedLeads + todayData.attendedTraffic
  const isToday = selectedDate === toISO(new Date())

  return (
    <div className="animate-fade-in">
      <Header title="Painel Gerencial" subtitle="Indicadores diários de performance" />

      <div className="p-6 space-y-5">

        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => changeDate(-1)} className="btn-secondary p-2"><ChevronLeft size={16} /></button>
            <div className="text-center min-w-[120px]">
              <p className="font-semibold text-slate-800">{fmtDate(selectedDate)}</p>
              {isToday && <p className="text-[10px] text-brand-600 font-medium">Hoje</p>}
            </div>
            <button onClick={() => changeDate(1)} disabled={isToday} className="btn-secondary p-2 disabled:opacity-30"><ChevronRight size={16} /></button>
            {!isToday && (
              <button onClick={() => setSelectedDate(toISO(new Date()))} className="text-xs text-brand-600 hover:underline ml-1">Ir para hoje</button>
            )}
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm gap-2">
            <Plus size={14} /> Inserir dados
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <RefreshCw size={18} className="animate-spin text-brand-500" />
            <span className="text-sm text-slate-500">Carregando...</span>
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Financeiro</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <KpiCard label="Faturamento"            value={todayData.revenue}        fmt="currency" trend={trend('revenue')}        color="emerald" />
                <KpiCard label="Pessoas Atendidas R$"   value={todayData.attendedRevenue} fmt="currency" trend={trend('attendedRevenue')} color="emerald" />
                <KpiCard label="Ticket Médio"           value={todayData.ticketMedio}    fmt="currency" trend={trend('ticketMedio')}    color="brand" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Leads</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <KpiCard label="Leads Abordados"             value={todayData.leadsTotal}     trend={trend('leadsTotal')}     color="sky" />
                <KpiCard label="Orgânico"                    value={todayData.leadsOrganic}   trend={trend('leadsOrganic')}   color="sky" />
                <KpiCard label="Leads que já são Clientes"   value={todayData.leadsClients}   trend={trend('leadsClients')}   color="sky" />
                <KpiCard label="Leads Tráfego"               value={todayData.leadsTraffic}   trend={trend('leadsTraffic')}   color="violet" />
                <KpiCard label="Leads Indicação"             value={todayData.leadsReferral}  trend={trend('leadsReferral')}  color="violet" />
                <KpiCard label="Lead Agendado"               value={todayData.leadsScheduled} trend={trend('leadsScheduled')} color="amber" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Atendimento</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard label="Pessoas Atendidas - Lead"     value={todayData.attendedLeads}   trend={trend('attendedLeads')}   color="emerald" />
                <KpiCard label="Pessoas Atendidas - Tráfego"  value={todayData.attendedTraffic} trend={trend('attendedTraffic')} color="emerald" />
                <KpiCard label="Prod/Serv Vendidos"           value={todayData.productsSold}    trend={trend('productsSold')}    color="brand" />
                <KpiCard label="PA"                           value={todayData.pa}              fmt="decimal" trend={trend('pa')} color="brand"
                  sub={totalAttended > 0 ? `${totalAttended} atendimentos` : undefined} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Reativações</p>
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Reativações (+7 dias)"  value={todayData.reactivations7d}       trend={trend('reactivations7d')}       color="amber" />
                <KpiCard label="Reativações Agendadas"  value={todayData.reactivationsScheduled} trend={trend('reactivationsScheduled')} color="amber" />
              </div>
            </div>

            {/* Charts */}
            {chartData.length > 1 && (
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <BarChart2 size={16} className="text-brand-600" /> Tendências — últimos 30 dias
                  </h3>
                  <div className="flex gap-1 flex-wrap">
                    {([
                      { id: 'financial',    label: 'Financeiro' },
                      { id: 'leads',        label: 'Leads' },
                      { id: 'attended',     label: 'Atendimentos' },
                      { id: 'reactivations',label: 'Reativações' },
                    ] as const).map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveChart(t.id)}
                        className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all',
                          activeChart === t.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeChart === 'financial' && (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gTicket" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name]} contentStyle={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue"    name="Faturamento"  stroke="#3B82F6" fill="url(#gRevenue)" strokeWidth={2} />
                      <Area type="monotone" dataKey="ticketMedio" name="Ticket Médio" stroke="#10B981" fill="url(#gTicket)"  strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {activeChart === 'leads' && (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="leadsOrganic"  name="Orgânico"   stackId="a" fill="#60A5FA" radius={[0,0,0,0]} />
                      <Bar dataKey="leadsTraffic"  name="Tráfego"    stackId="a" fill="#818CF8" radius={[0,0,0,0]} />
                      <Bar dataKey="leadsReferral" name="Indicação"  stackId="a" fill="#34D399" radius={[0,0,0,0]} />
                      <Bar dataKey="leadsClients"  name="Clientes"   stackId="a" fill="#FBBF24" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {activeChart === 'attended' && (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="attendedLeads"   name="Atend. Lead"    fill="#3B82F6" radius={[4,4,0,0]} />
                      <Bar dataKey="attendedTraffic" name="Atend. Tráfego" fill="#8B5CF6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {activeChart === 'reactivations' && (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="reactivations7d"       name="Reativ. +7 dias" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="reactivationsScheduled" name="Reativ. Agendadas" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {chartData.length <= 1 && (
              <div className="card p-8 text-center">
                <BarChart2 size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Insira dados de pelo menos 2 dias para ver os gráficos de tendência.</p>
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <DataModal
          date={selectedDate}
          initial={todayData}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          saving={saving}
        />
      )}
    </div>
  )
}
