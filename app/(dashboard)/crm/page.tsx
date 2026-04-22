'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import {
  Plus, Search, TrendingUp, Users, Target, DollarSign,
  MessageCircle, Phone, Calendar, ExternalLink, Megaphone, BarChart3,
} from 'lucide-react'
import {
  cn, formatCurrency, formatDate, getInitials, getLeadStatusLabel,
} from '@/lib/utils'
import type { Lead, LeadStatus } from '@/types'

const STATUS_COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'NEW',       label: 'Novos Leads',  color: 'bg-slate-500' },
  { status: 'CONTACTED', label: 'Contactados',  color: 'bg-blue-500' },
  { status: 'SCHEDULED', label: 'Agendados',    color: 'bg-purple-500' },
  { status: 'CONVERTED', label: 'Convertidos',  color: 'bg-emerald-500' },
  { status: 'LOST',      label: 'Perdidos',     color: 'bg-red-400' },
]

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  instagram:  { label: 'Instagram', color: 'bg-pink-100 text-pink-700' },
  facebook:   { label: 'Facebook',  color: 'bg-blue-100 text-blue-700' },
  google:     { label: 'Google',    color: 'bg-amber-100 text-amber-700' },
  indicacao:  { label: 'Indicação', color: 'bg-emerald-100 text-emerald-700' },
  tiktok:     { label: 'TikTok',    color: 'bg-slate-100 text-slate-700' },
  whatsapp:   { label: 'WhatsApp',  color: 'bg-green-100 text-green-700' },
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  meta:      { label: 'Meta Ads',   color: 'bg-blue-100 text-blue-700' },
  google:    { label: 'Google Ads', color: 'bg-amber-100 text-amber-700' },
  whatsapp:  { label: 'WhatsApp',   color: 'bg-green-100 text-green-700' },
  email:     { label: 'E-mail',     color: 'bg-slate-100 text-slate-600' },
}

const MOCK_CAMPAIGNS = [
  {
    id: '1', name: 'Captação — Limpeza e Profilaxia', platform: 'meta',
    status: 'active', spent: 1800, budget: 3000, leads: 34, conversions: 9,
    cpl: 52.9, conversionRate: 26.5,
  },
  {
    id: '2', name: 'Clareamento Dental — Verão', platform: 'google',
    status: 'active', spent: 2400, budget: 4000, leads: 28, conversions: 7,
    cpl: 85.7, conversionRate: 25.0,
  },
  {
    id: '3', name: 'Reativação de Pacientes', platform: 'whatsapp',
    status: 'ended', spent: 320, budget: 320, leads: 12, conversions: 5,
    cpl: 26.7, conversionRate: 41.7,
  },
]

function LeadCard({ lead }: { lead: Lead }) {
  const src = lead.source ? SOURCE_LABELS[lead.source] : null
  const scoreColor = lead.score >= 70 ? 'text-emerald-600 bg-emerald-50' : lead.score >= 40 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 hover:border-brand-300 transition-all cursor-pointer hover:shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 text-xs font-bold">{getInitials(lead.name)}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 leading-none">{lead.name}</p>
            {lead.interest && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-28">{lead.interest}</p>}
          </div>
        </div>
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0', scoreColor)}>
          {lead.score}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {src && <span className={cn('badge text-[9px]', src.color)}>{src.label}</span>}
        {lead.campaignName && (
          <span className="badge bg-purple-50 text-purple-600 text-[9px] truncate max-w-24">{lead.campaignName}</span>
        )}
      </div>

      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-50">
        <span className="text-[10px] text-slate-400">{formatDate(lead.createdAt)}</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-emerald-600">
            <MessageCircle size={12} />
          </button>
          <button className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-brand-600">
            <Phone size={12} />
          </button>
          <button className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-purple-600">
            <Calendar size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CRMPage() {
  const [activeView, setActiveView] = useState<'kanban' | 'campaigns'>('kanban')
  const [search, setSearch] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(setLeads).finally(() => setLoading(false))
  }, [])

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    const res = await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) { const updated = await res.json(); setLeads(prev => prev.map(l => l.id === id ? updated : l)) }
  }

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.interest || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalLeads = leads.length
  const converted = leads.filter(l => l.status === 'CONVERTED').length
  const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0'
  const totalCampaignSpend = 0
  const avgCPL = 0

  return (
    <div className="animate-fade-in">
      <Header title="CRM — Captação e Leads" subtitle="Funil de vendas e campanhas de captação" />

      <div className="p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <Users size={18} className="text-brand-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{totalLeads}</p>
              <p className="text-xs text-slate-500">Total de leads</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Target size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{conversionRate}%</p>
              <p className="text-xs text-slate-500">Taxa de conversão</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <DollarSign size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(avgCPL)}</p>
              <p className="text-xs text-slate-500">CPL médio</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalCampaignSpend)}</p>
              <p className="text-xs text-slate-500">Investido em mídia</p>
            </div>
          </div>
        </div>

        {/* Toggle de visão */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setActiveView('kanban')}
              className={cn('btn text-xs px-4 py-1.5', activeView === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500')}
            >
              Funil Kanban
            </button>
            <button
              onClick={() => setActiveView('campaigns')}
              className={cn('btn text-xs px-4 py-1.5', activeView === 'campaigns' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500')}
            >
              Campanhas
            </button>
          </div>

          {activeView === 'kanban' && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Buscar lead..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}

          <button className="btn-primary text-xs gap-1.5 ml-auto">
            <Plus size={14} /> Novo Lead
          </button>
          {activeView === 'campaigns' && (
            <button className="btn-secondary text-xs gap-1.5">
              <ExternalLink size={13} /> Conectar Meta Ads
            </button>
          )}
        </div>

        {/* Kanban */}
        {activeView === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map(col => {
              const colLeads = filteredLeads.filter(l => l.status === col.status)
              return (
                <div key={col.status} className="flex-shrink-0 w-56">
                  {/* Header da coluna */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('w-2.5 h-2.5 rounded-full', col.color)} />
                    <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                    <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full px-1.5 py-0.5">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 bg-slate-50 rounded-xl p-2 min-h-32">
                    {colLeads.length === 0 ? (
                      <div className="text-[10px] text-slate-300 text-center py-6">Vazio</div>
                    ) : (
                      colLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Campanhas */}
        {activeView === 'campaigns' && (
          <div className="space-y-4">
            {MOCK_CAMPAIGNS.map(camp => {
              const platform = PLATFORM_LABELS[camp.platform]
              return (
                <div key={camp.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                        <Megaphone size={18} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{camp.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {platform && <span className={cn('badge text-[10px]', platform.color)}>{platform.label}</span>}
                          <span className={cn(
                            'badge text-[10px]',
                            camp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
                          )}>
                            {camp.status === 'active' ? 'Ativa' : 'Encerrada'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="btn-secondary text-xs gap-1.5">
                      <BarChart3 size={12} /> Relatório
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { label: 'Investido', value: formatCurrency(camp.spent) },
                      { label: 'Leads', value: camp.leads },
                      { label: 'Conversões', value: camp.conversions },
                      { label: 'CPL', value: camp.cpl ? formatCurrency(camp.cpl) : '—' },
                      { label: 'Conv. Rate', value: camp.conversionRate ? `${camp.conversionRate.toFixed(1)}%` : '—' },
                      { label: 'ROI Est.', value: camp.conversions > 0 ? `${((camp.conversions * 680 - camp.spent) / camp.spent * 100).toFixed(0)}%` : '—' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center bg-slate-50 rounded-xl p-3">
                        <p className="text-base font-bold text-slate-900">{stat.value}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Barra de progresso do orçamento */}
                  {camp.budget && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Orçamento</span>
                        <span>{formatCurrency(camp.spent)} / {formatCurrency(camp.budget)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full"
                          style={{ width: `${(camp.spent / camp.budget) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* CTA conectar Meta */}
            <div className="card p-8 text-center border-dashed">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <ExternalLink size={22} className="text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Conectar com Meta Ads</p>
              <p className="text-xs text-slate-400 mb-4">
                Importe automaticamente leads dos seus anúncios no Facebook e Instagram
              </p>
              <button className="btn-primary text-sm gap-2 mx-auto">
                <ExternalLink size={14} /> Conectar conta Meta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
