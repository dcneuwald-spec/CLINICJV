'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle,
  Plus, Filter, Download, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, XCircle,
} from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  MOCK_TRANSACTIONS, MONTHLY_REVENUE,
} from '@/lib/mock-data'
import {
  cn, formatCurrency, formatDate, getTransactionStatusLabel, getPaymentMethodLabel,
} from '@/lib/utils'
import type { TransactionType, TransactionStatus } from '@/types'

const SUB_TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'receivable', label: 'Contas a Receber' },
  { id: 'payable', label: 'Contas a Pagar' },
  { id: 'cashflow', label: 'Fluxo de Caixa' },
  { id: 'dre', label: 'DRE Gerencial' },
]

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all')

  const income = MOCK_TRANSACTIONS.filter(t => t.type === 'INCOME')
  const expenses = MOCK_TRANSACTIONS.filter(t => t.type === 'EXPENSE')
  const totalIncome = income.filter(t => t.status === 'PAID').reduce((s, t) => s + t.amountPaid, 0)
  const totalExpenses = expenses.filter(t => t.status === 'PAID').reduce((s, t) => s + t.amountPaid, 0)
  const totalPending = MOCK_TRANSACTIONS.filter(t => t.status === 'PENDING').reduce((s, t) => s + t.amount, 0)
  const totalOverdue = MOCK_TRANSACTIONS.filter(t => t.status === 'OVERDUE').reduce((s, t) => s + t.amount, 0)

  const filtered = MOCK_TRANSACTIONS.filter(t => {
    const matchType = typeFilter === 'all' || t.type === typeFilter
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchType && matchStatus
  })

  return (
    <div className="animate-fade-in">
      <Header title="Financeiro" subtitle="Controle financeiro completo" />

      <div className="p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ArrowUpRight size={16} className="text-emerald-600" />
              </div>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">+8.5%</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Receita Recebida</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                <ArrowDownRight size={16} className="text-red-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Despesas Pagas</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center">
                <TrendingUp size={16} className="text-brand-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncome - totalExpenses)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Resultado Líquido</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle size={16} className="text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(totalPending + totalOverdue)}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Pendente/Vencido
              {totalOverdue > 0 && (
                <span className="text-red-600 font-semibold ml-1">({formatCurrency(totalOverdue)} vencido)</span>
              )}
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-1 overflow-x-auto">
            {SUB_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Gráfico fluxo */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Evolução de Receita e Despesas</h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lucroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v)]} contentStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="receita" name="Receita" stroke="#3B82F6" fill="url(#receitaGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#10B981" fill="url(#lucroGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Lançamentos recentes */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Lançamentos Recentes</h3>
                <button className="btn-primary text-xs gap-1.5"><Plus size={13} /> Novo Lançamento</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Paciente</th>
                    <th>Forma</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRANSACTIONS.map(tx => (
                    <tr key={tx.id}>
                      <td className="text-slate-500">{formatDate(tx.dueDate)}</td>
                      <td className="font-medium">{tx.description}</td>
                      <td className="text-slate-500">{tx.patientName || '—'}</td>
                      <td className="text-slate-500">{tx.paymentMethod ? getPaymentMethodLabel(tx.paymentMethod) : '—'}</td>
                      <td>
                        <span className={cn(
                          'badge text-xs',
                          tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
                        )}>
                          {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className={cn('font-semibold', tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600')}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td>
                        <span className={cn(
                          'badge text-xs',
                          tx.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                          tx.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                          tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-500',
                        )}>
                          {getTransactionStatusLabel(tx.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DRE Gerencial */}
        {activeTab === 'dre' && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-800">DRE Gerencial — Fevereiro 2025</h3>
              <button className="btn-secondary text-xs gap-1.5"><Download size={13} /> Exportar</button>
            </div>

            <div className="space-y-1 max-w-lg">
              {[
                { label: 'Receita Bruta', value: 38400, isTotal: false, indent: 0 },
                { label: '  Procedimentos Estéticos', value: 29800, isTotal: false, indent: 1 },
                { label: '  Consultas', value: 5600, isTotal: false, indent: 1 },
                { label: '  Planos e Pacotes', value: 3000, isTotal: false, indent: 1 },
                { label: 'Deduções', value: -1200, isTotal: false, indent: 0 },
                { label: '  Cancelamentos/Estornos', value: -800, isTotal: false, indent: 1 },
                { label: '  Descontos Concedidos', value: -400, isTotal: false, indent: 1 },
                { label: '= RECEITA LÍQUIDA', value: 37200, isTotal: true, indent: 0, highlight: 'brand' },
                { label: 'Custos Variáveis', value: -6800, isTotal: false, indent: 0 },
                { label: '  Insumos e Materiais', value: -4200, isTotal: false, indent: 1 },
                { label: '  Comissões Profissionais', value: -2600, isTotal: false, indent: 1 },
                { label: '= MARGEM BRUTA', value: 30400, isTotal: true, indent: 0, highlight: 'brand' },
                { label: 'Custos Fixos', value: -16000, isTotal: false, indent: 0 },
                { label: '  Folha de Pagamento', value: -8500, isTotal: false, indent: 1 },
                { label: '  Aluguel', value: -4500, isTotal: false, indent: 1 },
                { label: '  Marketing Digital', value: -1800, isTotal: false, indent: 1 },
                { label: '  Outros Fixos', value: -1200, isTotal: false, indent: 1 },
                { label: '= EBITDA', value: 14400, isTotal: true, indent: 0, highlight: 'emerald' },
                { label: 'Impostos e Taxas', value: -2300, isTotal: false, indent: 0 },
                { label: '= RESULTADO LÍQUIDO', value: 12100, isTotal: true, indent: 0, highlight: 'green-big' },
              ].map(({ label, value, isTotal, indent, highlight }) => (
                <div
                  key={label}
                  className={cn(
                    'flex justify-between py-1.5 px-2 rounded',
                    indent === 1 && 'pl-6',
                    isTotal && 'font-semibold border-t border-slate-200 mt-2 pt-2',
                    highlight === 'brand' && 'bg-brand-50',
                    highlight === 'emerald' && 'bg-emerald-50',
                    highlight === 'green-big' && 'bg-emerald-100',
                  )}
                >
                  <span className={cn(
                    'text-sm',
                    indent === 1 ? 'text-slate-500' : isTotal ? 'text-slate-800 font-semibold' : 'text-slate-700',
                    highlight === 'green-big' && 'text-emerald-800 text-base',
                  )}>
                    {label}
                  </span>
                  <span className={cn(
                    'text-sm',
                    value < 0 ? 'text-red-600' : isTotal ? 'text-slate-900 font-bold' : 'text-slate-700',
                    highlight === 'green-big' && 'text-emerald-700 text-base font-bold',
                  )}>
                    {formatCurrency(Math.abs(value))}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-brand-50 rounded-xl">
              <p className="text-sm font-semibold text-brand-800">💡 Análise do Consultor</p>
              <p className="text-xs text-brand-700 mt-1 leading-relaxed">
                Margem líquida de <strong>31,5%</strong> — acima da média do setor (22-28%).
                Ponto de atenção: insumos representam 11% da receita. Revisar contratos de fornecedores
                pode gerar economia de R$ 800-1.200/mês.
              </p>
            </div>
          </div>
        )}

        {/* Fluxo de Caixa */}
        {activeTab === 'cashflow' && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Fluxo de Caixa — 6 meses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="entradaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v)]} />
                <Area type="monotone" dataKey="receita" name="Entradas" stroke="#3B82F6" fill="url(#entradaGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="despesas" name="Saídas" stroke="#EF4444" fill="#FEF2F2" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Contas a Receber */}
        {(activeTab === 'receivable' || activeTab === 'payable') && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-800">
                {activeTab === 'receivable' ? 'Contas a Receber' : 'Contas a Pagar'}
              </h3>
              <button className="btn-primary text-xs gap-1.5"><Plus size={13} /> Novo</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Vencimento</th>
                  <th>Descrição</th>
                  {activeTab === 'receivable' && <th>Paciente</th>}
                  <th>Valor</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS
                  .filter(t => activeTab === 'receivable' ? t.type === 'INCOME' : t.type === 'EXPENSE')
                  .map(tx => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.dueDate)}</td>
                      <td className="font-medium">{tx.description}</td>
                      {activeTab === 'receivable' && <td className="text-slate-500">{tx.patientName || '—'}</td>}
                      <td className="font-semibold">{formatCurrency(tx.amount)}</td>
                      <td>
                        <span className={cn(
                          'badge text-xs',
                          tx.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                          tx.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700',
                        )}>
                          {getTransactionStatusLabel(tx.status)}
                        </span>
                      </td>
                      <td>
                        {tx.status !== 'PAID' && (
                          <button className="btn-secondary text-xs py-1 px-2">
                            <CheckCircle2 size={12} className="text-emerald-500" /> Baixar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
