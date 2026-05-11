'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { formatCurrency, cn } from '@/lib/utils'
import {
  BookOpen, DollarSign, BarChart3, TrendingUp, TrendingDown,
  ChevronDown, ChevronRight, Edit2, Check, X, Plus, AlertTriangle,
} from 'lucide-react'

// ════════════════════════════════════════════════════════════
// DADOS — BASE DE ESTUDO
// ════════════════════════════════════════════════════════════

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

const BASE_HISTORICO: Record<number, (number | null)[]> = {
  2021: [32000, 28500, 35000, 30000, 33000, 31500, 29000, 38000, 35500, 27000, 24000, 40000],
  2022: [35000, 30000, 37500, 32000, 36000, 34000, 31000, 52000, 47000, 29000, 26000, 43500],
  2023: [38000, 33000, 40000, 35000, 39000, 37000, 34000, 55000, 50000, 31000, 28000, 46000],
  2024: [42000, 37000, 44000, 38500, 43000, 41000, 37500, 57000, 53000, 33000, 30000, 48000],
  2025: [50000, 50000, 50000, 50000, 50000, 50000, 50000, 58920, 53825, 30925, null, 44614.23],
  2026: [35924.76, 29806.67, 36956.75, null, null, null, null, null, null, null, null, null],
}

const PROJ_2026 = [57500, 57500, 57500, 57500, 57500, 57500, 57500, 67758, 61898.75, 35563.75, null, 51306.36]
const TAXA_CRESCIMENTO = 0.15

// ════════════════════════════════════════════════════════════
// DADOS — PLANO FINANCEIRO
// ════════════════════════════════════════════════════════════

type MesData = { previsto: number; realizado: number }

interface CategoriaReceita {
  nome: string
  meses: MesData[]
  percentual?: number
}

interface CategoriaCusto {
  nome: string
  percentual: number
  meses: MesData[]
}

const MESES_LABEL = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function buildMeses(previsto: number, realizados: (number | null)[]): MesData[] {
  return MESES_LABEL.map((_, i) => ({
    previsto,
    realizado: realizados[i] ?? 0,
  }))
}

const RECEITAS_INIT: CategoriaReceita[] = [
  { nome: 'Cirurgia',                   percentual: 0.02,  meses: buildMeses(1000,   [0,0,0,0,0,0,0,0,1000,680,0,0]) },
  { nome: 'Clínico geral',              percentual: 0.05,  meses: buildMeses(2500,   [0,0,0,0,0,0,0,0,2500,3845,0,0]) },
  { nome: 'Harmonização facial',        percentual: 0.84,  meses: buildMeses(43000,  [35924.76,29806.67,36956.75,0,0,0,0,0,46995,25400,0,0]) },
  { nome: 'Periodontia',               percentual: 0.01,  meses: buildMeses(530,    [0,0,0,0,0,0,0,0,530,1000,0,0]) },
  { nome: 'Endodontia',                percentual: 0.03,  meses: buildMeses(1450,   [0,0,0,0,0,0,0,0,1450,0,0,0]) },
  { nome: 'Pagamentos sem especialidade', percentual: 0.05, meses: buildMeses(1520,  [0,0,0,0,0,0,0,0,1350,0,0,0]) },
]

const CUSTOS_INIT: CategoriaCusto[] = [
  { nome: 'Comissão / bonificação', percentual: 0.03,  meses: buildMeses(1500, [0,500,0,0,0,0,0,0,1856.96,300,0,800]) },
  { nome: 'Laboratório',            percentual: 0.017, meses: buildMeses(850,  [0,0,0,0,0,0,0,0,1052.28,399,0,399]) },
  { nome: 'Material HOF',           percentual: 0.21,  meses: buildMeses(10500,[8879.84,7386.23,4174.59,0,0,0,0,0,12998.74,4418.16,0,24858.82]) },
  { nome: 'Material odontológico',  percentual: 0.03,  meses: buildMeses(1500, [759.1,1639.17,1691.93,0,0,0,0,0,994.03,1147.72,0,6231.95]) },
  { nome: 'Dentista',               percentual: 0.007, meses: buildMeses(350,  [0,0,5250,0,0,0,0,0,650,0,0,5900]) },
  { nome: 'Imposto',                percentual: 0.015, meses: buildMeses(0,    [170.83,502.51,742.78,0,0,0,0,0,0,0,0,1416.12]) },
]

// ════════════════════════════════════════════════════════════
// DADOS — GERENCIAL
// ════════════════════════════════════════════════════════════

interface MetricaDia {
  nome: string
  descricao: string
  meta: number
  dias: (number | null)[]
}

function buildDias(filled: Partial<Record<number, number>>): (number | null)[] {
  return Array.from({ length: 31 }, (_, i) => filled[i + 1] ?? null)
}

const GERENCIAL_MESES_IDX = [0, 1, 2, 7, 8, 9]
const GERENCIAL_MESES_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Agosto', 'Setembro', 'Outubro']

function buildGerencial(mes: number): MetricaDia[] {
  const baseJan: Partial<Record<number, number>>[] = [
    { 8: 4800, 9: 3200, 10: 5100, 15: 6200, 16: 4400, 22: 5800, 23: 3900, 29: 6224.76 },
    { 2: 2, 8: 3, 9: 2, 10: 4, 15: 5, 16: 3, 22: 4, 23: 3, 29: 5 },
    { 2: 1, 8: 2, 9: 1, 10: 2, 15: 3, 16: 2, 22: 3, 23: 1, 29: 2 },
    { 8: 1, 10: 2, 15: 2, 16: 1, 22: 2, 29: 2 },
    { 8: 1, 10: 2, 15: 3, 16: 1, 22: 2, 29: 2 },
  ]
  const metas = [50000, 0, 0, 0, 0, 0, 0, 50000, 53825, 30925, 0, 44614.23]
  const metaAtual = metas[mes] || 50000

  return [
    { nome: 'Faturamento',                  descricao: 'Todo valor vendido no dia',                        meta: metaAtual, dias: buildDias(baseJan[0] ?? {}) },
    { nome: 'Leads abordados',              descricao: 'Todos os contatos realizados pelos clientes',       meta: 30,        dias: buildDias(baseJan[1] ?? {}) },
    { nome: 'Leads convertidos',            descricao: 'Leads que agendaram avaliação/procedimento',        meta: 15,        dias: buildDias(baseJan[2] ?? {}) },
    { nome: 'Qtd de vendas',                descricao: 'Pessoas atendidas (procedimentos pela 1ª vez)',     meta: 20,        dias: buildDias(baseJan[3] ?? {}) },
    { nome: 'Prod/Serv vendidos',           descricao: 'Quantidade de produtos/serviços vendidos',          meta: 30,        dias: buildDias(baseJan[4] ?? {}) },
    { nome: 'PA (Itens por atendimento)',   descricao: 'Produtos/serviços por atendimento',                 meta: 1.5,       dias: buildDias({}) },
    { nome: 'Ticket Médio',                 descricao: 'Valor médio por atendimento',                      meta: 2500,      dias: buildDias({}) },
    { nome: 'Recall/retornos realizados',   descricao: 'Contatos ativos realizados',                        meta: 50,        dias: buildDias({}) },
    { nome: 'Recall/retornos convertidos',  descricao: 'Contatos ativos que agendaram',                     meta: 25,        dias: buildDias({}) },
  ]
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function pct(real: number, prev: number): string {
  if (prev === 0) return real > 0 ? '—' : '—'
  const v = (real / prev) * 100
  return `${v.toFixed(0)}%`
}

function pctClass(real: number, prev: number): string {
  if (prev === 0) return 'text-slate-400'
  return real >= prev ? 'text-emerald-600' : 'text-red-500'
}

function ytd(meses: MesData[], key: 'previsto' | 'realizado'): number {
  return meses.reduce((s, m) => s + m[key], 0)
}

function fmtN(v: number | null): string {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function fmtShort(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000)    return `${(v / 1000).toFixed(0)}k`
  return v.toFixed(0)
}

// ════════════════════════════════════════════════════════════
// TAB — BASE DE ESTUDO
// ════════════════════════════════════════════════════════════

function BaseDeEstudo() {
  const anos = [2021, 2022, 2023, 2024, 2025, 2026]

  function total(ano: number): number {
    const d = ano === 2026 ? BASE_HISTORICO[2026] : BASE_HISTORICO[ano]
    return d.reduce<number>((s, v) => s + (v ?? 0), 0)
  }

  function projTotal(): number {
    return PROJ_2026.reduce<number>((s, v) => s + (v ?? 0), 0)
  }

  function varPct(ano: number, prev: number, i: number): number | null {
    const cur  = BASE_HISTORICO[ano]?.[i] ?? null
    const prv  = BASE_HISTORICO[prev]?.[i] ?? null
    if (cur === null || prv === null || prv === 0) return null
    return ((cur - prv) / prv) * 100
  }

  return (
    <div className="animate-fade-in">
      {/* Header info */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Faturamento 2025', value: fmtN(total(2025)), sub: 'Realizado parcial', color: 'text-slate-800' },
          { label: 'Meta 2026', value: fmtN(projTotal()), sub: `Taxa crescimento: ${(TAXA_CRESCIMENTO * 100).toFixed(0)}%`, color: 'text-brand-700' },
          { label: 'Realizado 2026 YTD', value: fmtN(total(2026)), sub: 'Jan–Mar acumulado', color: 'text-emerald-700' },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={cn('text-xl font-bold', c.color)}>{c.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabela principal */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Faturamento Histórico — Mensal (R$)</h3>
          <span className="text-xs text-slate-400">Taxa de projeção: +{(TAXA_CRESCIMENTO * 100).toFixed(0)}% a.a.</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest w-32">Mês</th>
                {anos.map(a => (
                  <th key={a} className={cn(
                    'px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-widest',
                    a === 2026 ? 'text-brand-700 bg-brand-50' : 'text-slate-500'
                  )}>
                    {a === 2026 ? '2026 Real.' : a}
                  </th>
                ))}
                <th className="px-3 py-3 text-right text-[11px] font-semibold text-emerald-700 uppercase tracking-widest bg-emerald-50">
                  Proj. 2026
                </th>
                <th className="px-3 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Var. %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MONTHS.map((mes, i) => {
                const projecao = PROJ_2026[i]
                const real26   = BASE_HISTORICO[2026][i]
                const var25    = varPct(2025, 2024, i)

                return (
                  <tr key={mes} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{mes}</td>
                    {anos.map(a => {
                      const v = BASE_HISTORICO[a]?.[i] ?? null
                      const isReal = a === 2026
                      return (
                        <td key={a} className={cn(
                          'px-3 py-2.5 text-right text-sm tabular-nums',
                          v === null ? 'text-slate-300' : isReal ? 'text-brand-700 font-medium' : 'text-slate-700',
                          isReal && v !== null ? 'bg-brand-50/40' : ''
                        )}>
                          {v === null ? '—' : fmtN(v)}
                        </td>
                      )
                    })}
                    <td className={cn(
                      'px-3 py-2.5 text-right text-sm tabular-nums bg-emerald-50/40',
                      projecao === null ? 'text-slate-300' : 'text-emerald-700 font-semibold'
                    )}>
                      {projecao === null ? '—' : fmtN(projecao)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                      {var25 === null ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <span className={cn('text-xs font-semibold', var25 >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                          {var25 >= 0 ? '+' : ''}{var25.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {/* Total */}
              <tr className="bg-slate-100 font-semibold">
                <td className="px-4 py-3 text-sm font-bold text-slate-800">TOTAL</td>
                {anos.map(a => (
                  <td key={a} className={cn(
                    'px-3 py-3 text-right text-sm tabular-nums font-bold',
                    a === 2026 ? 'text-brand-700' : 'text-slate-800'
                  )}>
                    {fmtN(total(a))}
                  </td>
                ))}
                <td className="px-3 py-3 text-right text-sm tabular-nums font-bold text-emerald-700">
                  {fmtN(projTotal())}
                </td>
                <td className="px-3 py-3 text-right text-sm tabular-nums">
                  <span className="text-xs font-bold text-emerald-600">
                    +{(TAXA_CRESCIMENTO * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center gap-6 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-200" /> Histórico</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-brand-200" /> 2026 Realizado</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-200" /> Projeção 2026</div>
        <div className="flex items-center gap-1.5">— Sem dado</div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// TAB — PLANO FINANCEIRO
// ════════════════════════════════════════════════════════════

function PlanoFinanceiro() {
  const [mesSel, setMesSel] = useState(0)
  const [secao, setSecao] = useState<Record<string, boolean>>({ receitas: false, custos: false })
  const [receitas] = useState<CategoriaReceita[]>(RECEITAS_INIT)
  const [custos]   = useState<CategoriaCusto[]>(CUSTOS_INIT)

  const toggleSecao = (k: string) => setSecao(p => ({ ...p, [k]: !p[k] }))

  const totalRecPrev = receitas.reduce((s, r) => s + r.meses[mesSel].previsto, 0)
  const totalRecReal = receitas.reduce((s, r) => s + r.meses[mesSel].realizado, 0)
  const totalCusPrev = custos.reduce((s, c)   => s + c.meses[mesSel].previsto, 0)
  const totalCusReal = custos.reduce((s, c)   => s + c.meses[mesSel].realizado, 0)
  const margemPrev   = totalRecPrev - totalCusPrev
  const margemReal   = totalRecReal - totalCusReal

  // YTD
  const ytdRecPrev = receitas.reduce((s, r) => s + ytd(r.meses, 'previsto'), 0) / 12
  const ytdRecReal = receitas.reduce((s, r) => s + ytd(r.meses, 'realizado'), 0)

  return (
    <div className="animate-fade-in space-y-4">

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita Prevista',  value: fmtN(totalRecPrev), color: 'text-brand-700',   bg: 'bg-brand-50' },
          { label: 'Receita Realizada', value: fmtN(totalRecReal), color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Custo Total',       value: fmtN(totalCusReal), color: 'text-orange-700',  bg: 'bg-orange-50' },
          { label: 'Margem (Real.)',    value: fmtN(margemReal),   color: margemReal >= 0 ? 'text-emerald-700' : 'text-red-600', bg: margemReal >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
        ].map(k => (
          <div key={k.label} className={cn('card p-4', k.bg)}>
            <p className="text-xs text-slate-500 mb-1">{k.label}</p>
            <p className={cn('text-xl font-bold', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Seletor de mês */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Visualizar mês</p>
        <div className="flex flex-wrap gap-1.5">
          {MESES_LABEL.map((m, i) => (
            <button
              key={m}
              onClick={() => setMesSel(i)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                mesSel === i
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela principal */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            Demonstrativo Financeiro — {MONTHS[mesSel]} 2026
          </h3>
          <span className="text-xs text-slate-400">Previsto × Realizado × Δ%</span>
        </div>

        {/* ── RECEITAS ── */}
        <div>
          <button
            onClick={() => toggleSecao('receitas')}
            className="w-full flex items-center justify-between px-5 py-3 bg-brand-50 hover:bg-brand-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              {secao.receitas ? <ChevronDown size={14} className="text-brand-600" /> : <ChevronRight size={14} className="text-brand-600" />}
              <span className="text-sm font-bold text-brand-700 uppercase tracking-wide">Receitas</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-slate-500">Prev: <strong className="text-brand-700">{fmtN(totalRecPrev)}</strong></span>
              <span className="text-slate-500">Real: <strong className={totalRecReal >= totalRecPrev ? 'text-emerald-700' : 'text-red-600'}>{fmtN(totalRecReal)}</strong></span>
              <span className={cn('text-xs font-bold', pctClass(totalRecReal, totalRecPrev))}>
                {pct(totalRecReal, totalRecPrev)}
              </span>
            </div>
          </button>

          {!secao.receitas && (
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Categoria</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Previsto</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Realizado</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">%</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">YTD Real.</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Mix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receitas.map((r) => {
                  const prev = r.meses[mesSel].previsto
                  const real = r.meses[mesSel].realizado
                  const ytdR = ytd(r.meses, 'realizado')
                  const mixPct = totalRecReal > 0 ? (real / totalRecReal) * 100 : 0

                  return (
                    <tr key={r.nome} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-slate-700 font-medium">{r.nome}</td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-slate-500">{fmtN(prev)}</td>
                      <td className={cn('px-4 py-3 text-right text-sm tabular-nums font-semibold', real >= prev && real > 0 ? 'text-emerald-700' : real === 0 ? 'text-slate-300' : 'text-red-600')}>
                        {fmtN(real)}
                      </td>
                      <td className={cn('px-4 py-3 text-right text-xs font-semibold', pctClass(real, prev))}>
                        {pct(real, prev)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-slate-600">{fmtN(ytdR)}</td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500">
                        {mixPct > 0 ? `${mixPct.toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  )
                })}

                {/* Total receitas */}
                <tr className="bg-brand-50 font-bold">
                  <td className="px-5 py-3 text-sm font-bold text-brand-800">TOTAL RECEITAS</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-brand-700">{fmtN(totalRecPrev)}</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums font-bold text-brand-700">{fmtN(totalRecReal)}</td>
                  <td className={cn('px-4 py-3 text-right text-xs font-bold', pctClass(totalRecReal, totalRecPrev))}>
                    {pct(totalRecReal, totalRecPrev)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-brand-700">{fmtN(ytdRecReal)}</td>
                  <td className="px-4 py-3 text-right text-xs text-brand-600">100%</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* ── CUSTOS ── */}
        <div className="border-t border-slate-200">
          <button
            onClick={() => toggleSecao('custos')}
            className="w-full flex items-center justify-between px-5 py-3 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              {secao.custos ? <ChevronDown size={14} className="text-orange-600" /> : <ChevronRight size={14} className="text-orange-600" />}
              <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">Custos Variáveis</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-slate-500">Prev: <strong className="text-orange-700">{fmtN(totalCusPrev)}</strong></span>
              <span className="text-slate-500">Real: <strong className="text-orange-700">{fmtN(totalCusReal)}</strong></span>
            </div>
          </button>

          {!secao.custos && (
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Categoria</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">% Ref.</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Previsto</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Realizado</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">% Receita</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">YTD Real.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {custos.map((c) => {
                  const prev = c.meses[mesSel].previsto
                  const real = c.meses[mesSel].realizado
                  const pctRec = totalRecReal > 0 ? (real / totalRecReal) * 100 : 0
                  const ytdC  = ytd(c.meses, 'realizado')

                  return (
                    <tr key={c.nome} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-slate-700 font-medium">{c.nome}</td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400">{(c.percentual * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-slate-500">{fmtN(prev)}</td>
                      <td className={cn('px-4 py-3 text-right text-sm tabular-nums font-semibold', real === 0 ? 'text-slate-300' : 'text-orange-700')}>
                        {fmtN(real)}
                      </td>
                      <td className={cn('px-4 py-3 text-right text-xs', pctRec > c.percentual * 100 * 1.1 ? 'text-red-500 font-semibold' : 'text-slate-500')}>
                        {pctRec > 0 ? `${pctRec.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-slate-600">{fmtN(ytdC)}</td>
                    </tr>
                  )
                })}

                {/* Total custos */}
                <tr className="bg-orange-50 font-bold">
                  <td className="px-5 py-3 text-sm font-bold text-orange-800" colSpan={2}>TOTAL CUSTOS</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-orange-700">{fmtN(totalCusPrev)}</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums font-bold text-orange-700">{fmtN(totalCusReal)}</td>
                  <td className="px-4 py-3 text-right text-xs text-orange-600">
                    {totalRecReal > 0 ? `${((totalCusReal / totalRecReal) * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-orange-700">
                    {fmtN(custos.reduce((s, c) => s + ytd(c.meses, 'realizado'), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* ── MARGEM ── */}
        <div className="border-t border-slate-200 px-5 py-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Margem de Contribuição</p>
              <p className="text-xs text-slate-400 mt-0.5">Receita Realizada − Custos Variáveis Realizados</p>
            </div>
            <div className="text-right">
              <p className={cn('text-2xl font-bold', margemReal >= 0 ? 'text-emerald-700' : 'text-red-600')}>
                {fmtN(margemReal)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Margem: {totalRecReal > 0 ? `${((margemReal / totalRecReal) * 100).toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// TAB — GERENCIAL
// ════════════════════════════════════════════════════════════

interface ActionItem {
  id: number
  data: string
  metrica: string
  oque: string
  quem: string
  quando: string
  status: 'pendente' | 'andamento' | 'concluido'
}

function Gerencial() {
  const [mesSel, setMesSel] = useState(0)
  const [metricas]  = useState<MetricaDia[]>(() => buildGerencial(0))
  const [diasUteis] = useState(20)
  const [actions, setActions] = useState<ActionItem[]>([
    { id: 1, data: '2026-01-09', metrica: 'Faturamento', oque: 'Aumentar captação de leads via Instagram', quem: 'Gestora', quando: '2026-01-15', status: 'andamento' },
    { id: 2, data: '2026-01-09', metrica: 'Leads convertidos', oque: 'Implementar protocolo de follow-up em 24h', quem: 'Recepção', quando: '2026-01-12', status: 'pendente' },
  ])

  const mesNome = GERENCIAL_MESES_NAMES[mesSel] ?? MONTHS[mesSel]
  const DIAS_MES = 31
  const hoje = 9

  function totalMetrica(m: MetricaDia): number {
    return m.dias.reduce<number>((s, v) => s + (v ?? 0), 0)
  }

  function porDiaHoje(m: MetricaDia): number {
    const realizados = m.dias.slice(0, hoje).reduce<number>((s, v) => s + (v ?? 0), 0)
    return realizados / hoje
  }

  function projecaoFim(m: MetricaDia): number {
    return porDiaHoje(m) * DIAS_MES
  }

  function statusColor(m: MetricaDia): string {
    const pctAtingido = totalMetrica(m) / (m.meta / DIAS_MES * hoje)
    if (pctAtingido >= 1) return 'text-emerald-600 bg-emerald-50'
    if (pctAtingido >= 0.8) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  const statusLabel = { pendente: 'Pendente', andamento: 'Em andamento', concluido: 'Concluído' }
  const statusColors = {
    pendente: 'bg-amber-50 text-amber-700',
    andamento: 'bg-blue-50 text-blue-700',
    concluido: 'bg-emerald-50 text-emerald-700',
  }

  return (
    <div className="animate-fade-in space-y-6">

      {/* Seletor de mês */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mês de referência</p>
          <span className="text-xs text-slate-400">Dias úteis: <strong className="text-slate-700">{diasUteis}</strong></span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GERENCIAL_MESES_NAMES.map((m, i) => (
            <button
              key={m}
              onClick={() => setMesSel(i)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                mesSel === i ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.slice(0, 4).map(m => {
          const total = totalMetrica(m)
          const proj  = projecaoFim(m)
          const pctM  = (total / m.meta) * 100
          return (
            <div key={m.nome} className="card p-4">
              <p className="text-xs text-slate-500 mb-2 leading-tight">{m.nome}</p>
              <p className="text-lg font-bold text-slate-900 tabular-nums">
                {m.nome.includes('Faturamento') || m.nome.includes('Ticket') ? fmtN(total) : total.toFixed(0)}
              </p>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', pctM >= 100 ? 'bg-emerald-500' : pctM >= 70 ? 'bg-amber-500' : 'bg-red-500')}
                  style={{ width: `${Math.min(pctM, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {pctM.toFixed(0)}% da meta · Proj: {m.nome.includes('Faturamento') || m.nome.includes('Ticket') ? fmtN(proj) : proj.toFixed(0)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Tabela de acompanhamento diário */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Relatório Gerencial — {mesNome} 2026</h3>
          <p className="text-xs text-slate-400 mt-0.5">Acompanhamento diário de métricas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-50 min-w-[180px]">Métrica</th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-brand-50">Meta/mês</th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-brand-50">Meta/dia</th>
                {Array.from({ length: hoje }, (_, i) => (
                  <th key={i + 1} className={cn(
                    'px-2 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase min-w-[36px]',
                    i + 1 === hoje ? 'bg-amber-50 text-amber-700' : ''
                  )}>
                    {i + 1}
                  </th>
                ))}
                <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Total</th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Proj.</th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metricas.map((m) => {
                const total   = totalMetrica(m)
                const metaDia = m.meta / diasUteis
                const proj    = projecaoFim(m)
                const isMoney = m.nome.includes('Faturamento') || m.nome.includes('Ticket')
                const fmt     = (v: number) => isMoney ? fmtN(v) : v % 1 !== 0 ? v.toFixed(2) : v.toString()

                return (
                  <tr key={m.nome} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 sticky left-0 bg-white">
                      <p className="text-xs font-medium text-slate-700 leading-tight">{m.nome}</p>
                      <p className="text-[10px] text-slate-400 leading-tight hidden xl:block">{m.descricao}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums font-semibold text-brand-700 bg-brand-50/40">
                      {fmt(m.meta)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums text-brand-600 bg-brand-50/40">
                      {fmt(metaDia)}
                    </td>
                    {Array.from({ length: hoje }, (_, i) => {
                      const val = m.dias[i]
                      const acima = val !== null && val >= metaDia
                      return (
                        <td key={i + 1} className={cn(
                          'px-2 py-2.5 text-center text-xs tabular-nums',
                          val === null ? 'text-slate-200' : acima ? 'text-emerald-700 font-semibold' : 'text-red-600',
                          i + 1 === hoje ? 'bg-amber-50/50' : ''
                        )}>
                          {val === null ? '—' : isMoney ? fmtShort(val) : val}
                        </td>
                      )
                    })}
                    <td className="px-3 py-2.5 text-right text-sm tabular-nums font-bold text-slate-800">
                      {fmt(total)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums text-slate-500">
                      {fmt(proj)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={cn('badge text-[10px]', statusColor(m))}>
                        {((total / m.meta) * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plano de Ação */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800">Plano de Ação</h3>
          </div>
          <button className="btn-secondary text-xs py-1.5 px-3">
            <Plus size={13} /> Nova ação
          </button>
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50">
              {['Data', 'Métrica', 'O que fazer', 'Quem', 'Quando', 'Status'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {actions.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(a.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-xs font-medium text-slate-700">{a.metrica}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{a.oque}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{a.quem}</td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(a.quando).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('badge text-[10px]', statusColors[a.status])}>
                    {statusLabel[a.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPAL
// ════════════════════════════════════════════════════════════

const TABS = [
  { id: 'base',       label: 'Base de Estudo',   icon: BookOpen,    desc: 'Diagnóstico histórico e projeções de faturamento' },
  { id: 'financeiro', label: 'Plano Financeiro',  icon: DollarSign,  desc: 'Previsto × Realizado por categoria de receita e custo' },
  { id: 'gerencial',  label: 'Gerencial',          icon: BarChart3,   desc: 'Acompanhamento diário e plano de ação' },
] as const

type TabId = typeof TABS[number]['id']

export default function ConsultoriaPage() {
  const [tab, setTab] = useState<TabId>('base')
  const active = TABS.find(t => t.id === tab)!

  return (
    <div className="animate-fade-in min-h-screen">
      <Header
        title="Consultoria JV"
        subtitle="Metodologia de gestão estratégica — Karol Botelho · 2026"
      />

      <div className="p-6 space-y-6">

        {/* ── Tabs ── */}
        <div className="flex items-stretch gap-3">
          {TABS.map(t => {
            const Icon    = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 flex flex-col items-start gap-1.5 px-5 py-4 rounded-xl border-2 text-left transition-all duration-150',
                  isActive
                    ? 'border-brand-600 bg-brand-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                  <span className={cn('text-sm font-semibold', isActive ? 'text-brand-700' : 'text-slate-600')}>
                    {t.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug hidden sm:block">{t.desc}</p>
              </button>
            )
          })}
        </div>

        {/* ── Conteúdo do tab ── */}
        {tab === 'base'       && <BaseDeEstudo />}
        {tab === 'financeiro' && <PlanoFinanceiro />}
        {tab === 'gerencial'  && <Gerencial />}

      </div>
    </div>
  )
}
