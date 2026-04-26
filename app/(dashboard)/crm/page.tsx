'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import {
  Plus, Search, TrendingUp, Users, Target, DollarSign,
  MessageCircle, Phone, Calendar, ExternalLink, Megaphone,
  BarChart3, ChevronDown, Zap, Trash2, Pencil, X, Loader2,
  MessageSquare, Mail, FileText, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { cn, formatCurrency, formatDate, getInitials, getLeadStatusLabel } from '@/lib/utils'
import type { Lead, LeadStatus } from '@/types'

// ── Types ────────────────────────────────────────────────────────────────────
interface Automation {
  id: string; name: string; triggerStage: string; delayDays: number
  actionType: string; messageTemplate: string; active: boolean; createdAt: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_COLUMNS: { status: LeadStatus; label: string; color: string; dot: string }[] = [
  { status: 'NEW',       label: 'Novos Leads', color: 'bg-slate-500',   dot: 'bg-slate-400' },
  { status: 'CONTACTED', label: 'Contactados', color: 'bg-blue-500',    dot: 'bg-blue-400' },
  { status: 'SCHEDULED', label: 'Agendados',   color: 'bg-purple-500',  dot: 'bg-purple-400' },
  { status: 'CONVERTED', label: 'Convertidos', color: 'bg-emerald-500', dot: 'bg-emerald-400' },
  { status: 'LOST',      label: 'Perdidos',    color: 'bg-red-400',     dot: 'bg-red-400' },
]

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-700' },
  facebook:  { label: 'Facebook',  color: 'bg-blue-100 text-blue-700' },
  google:    { label: 'Google',    color: 'bg-amber-100 text-amber-700' },
  indicacao: { label: 'Indicação', color: 'bg-emerald-100 text-emerald-700' },
  tiktok:    { label: 'TikTok',    color: 'bg-slate-100 text-slate-700' },
  whatsapp:  { label: 'WhatsApp',  color: 'bg-green-100 text-green-700' },
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  meta:     { label: 'Meta Ads',   color: 'bg-blue-100 text-blue-700' },
  google:   { label: 'Google Ads', color: 'bg-amber-100 text-amber-700' },
  whatsapp: { label: 'WhatsApp',   color: 'bg-green-100 text-green-700' },
  email:    { label: 'E-mail',     color: 'bg-slate-100 text-slate-600' },
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <MessageSquare size={12} className="text-green-600" />,
  email:    <Mail size={12} className="text-blue-600" />,
  note:     <FileText size={12} className="text-slate-500" />,
}
const ACTION_LABELS: Record<string, string> = { whatsapp: 'WhatsApp', email: 'E-mail', note: 'Nota interna' }

// ── CRMPage ───────────────────────────────────────────────────────────────────
export default function CRMPage() {
  const [activeView, setActiveView] = useState<'kanban' | 'campaigns' | 'automations'>('kanban')
  const [search, setSearch] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null)

  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(setLeads).finally(() => setLoading(false))
  }, [])

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    const res = await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) { const updated = await res.json(); setLeads(prev => prev.map(l => l.id === id ? updated : l)) }
  }

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(status) }
  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    const lead = leads.find(l => l.id === leadId)
    if (leadId && lead && lead.status !== status) updateLeadStatus(leadId, status)
    setDraggedId(null); setDragOverCol(null)
  }

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.interest || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalLeads = leads.length
  const converted = leads.filter(l => l.status === 'CONVERTED').length
  const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0'

  return (
    <div className="animate-fade-in">
      <Header title="CRM — Captação e Leads" subtitle="Funil de vendas, campanhas e automações" />
      <div className="p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center"><Users size={18} className="text-brand-600" /></div>
            <div><p className="text-xl font-bold text-slate-900">{totalLeads}</p><p className="text-xs text-slate-500">Total de leads</p></div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center"><Target size={18} className="text-emerald-600" /></div>
            <div><p className="text-xl font-bold text-slate-900">{conversionRate}%</p><p className="text-xs text-slate-500">Taxa de conversão</p></div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><DollarSign size={18} className="text-amber-600" /></div>
            <div><p className="text-xl font-bold text-slate-900">{formatCurrency(0)}</p><p className="text-xs text-slate-500">CPL médio</p></div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center"><TrendingUp size={18} className="text-purple-600" /></div>
            <div><p className="text-xl font-bold text-slate-900">{formatCurrency(0)}</p><p className="text-xs text-slate-500">Investido em mídia</p></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(['kanban', 'campaigns', 'automations'] as const).map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                className={cn('btn text-xs px-4 py-1.5 gap-1.5', activeView === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500')}>
                {v === 'automations' && <Zap size={12} />}
                {v === 'kanban' ? 'Funil Kanban' : v === 'campaigns' ? 'Campanhas' : 'Automações'}
              </button>
            ))}
          </div>
          {activeView === 'kanban' && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
              <Search size={14} className="text-slate-400" />
              <input type="text" placeholder="Buscar lead..." className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          )}
          {activeView !== 'automations' && (
            <button className="btn-primary text-xs gap-1.5 ml-auto"><Plus size={14} /> Novo Lead</button>
          )}
          {activeView === 'campaigns' && (
            <button className="btn-secondary text-xs gap-1.5"><ExternalLink size={13} /> Conectar Meta Ads</button>
          )}
        </div>

        {/* Kanban com drag-and-drop */}
        {activeView === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map(col => {
              const colLeads = filteredLeads.filter(l => l.status === col.status)
              const isOver = dragOverCol === col.status
              return (
                <div key={col.status} className="flex-shrink-0 w-56"
                  onDragOver={e => handleDragOver(e, col.status)}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={e => handleDrop(e, col.status)}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('w-2.5 h-2.5 rounded-full', col.color)} />
                    <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                    <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full px-1.5 py-0.5">{colLeads.length}</span>
                  </div>
                  <div className={cn('space-y-2 rounded-xl p-2 min-h-32 transition-colors', isOver ? 'bg-brand-50 border-2 border-dashed border-brand-300' : 'bg-slate-50')}>
                    {loading ? (
                      <div className="flex items-center justify-center py-8"><Loader2 size={14} className="animate-spin text-slate-300" /></div>
                    ) : colLeads.length === 0 ? (
                      <div className="text-[10px] text-slate-300 text-center py-6">{isOver ? 'Soltar aqui' : 'Vazio'}</div>
                    ) : (
                      colLeads.map(lead => (
                        <LeadCard key={lead.id} lead={lead} onMove={updateLeadStatus} isDragging={draggedId === lead.id} />
                      ))
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
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center"><Megaphone size={18} className="text-brand-600" /></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{camp.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {platform && <span className={cn('badge text-[10px]', platform.color)}>{platform.label}</span>}
                          <span className={cn('badge text-[10px]', camp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>{camp.status === 'active' ? 'Ativa' : 'Encerrada'}</span>
                        </div>
                      </div>
                    </div>
                    <button className="btn-secondary text-xs gap-1.5"><BarChart3 size={12} /> Relatório</button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { label: 'Investido', value: formatCurrency(camp.spent) },
                      { label: 'Leads', value: camp.leads },
                      { label: 'Conversões', value: camp.conversions },
                      { label: 'CPL', value: formatCurrency(camp.cpl) },
                      { label: 'Conv. Rate', value: `${camp.conversionRate.toFixed(1)}%` },
                      { label: 'ROI Est.', value: camp.conversions > 0 ? `${((camp.conversions * 680 - camp.spent) / camp.spent * 100).toFixed(0)}%` : '—' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center bg-slate-50 rounded-xl p-3">
                        <p className="text-base font-bold text-slate-900">{stat.value}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  {camp.budget && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Orçamento</span><span>{formatCurrency(camp.spent)} / {formatCurrency(camp.budget)}</span></div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-600 rounded-full" style={{ width: `${(camp.spent / camp.budget) * 100}%` }} /></div>
                    </div>
                  )}
                </div>
              )
            })}
            <div className="card p-8 text-center border-dashed">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3"><ExternalLink size={22} className="text-blue-600" /></div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Conectar com Meta Ads</p>
              <p className="text-xs text-slate-400 mb-4">Importe automaticamente leads dos seus anúncios no Facebook e Instagram</p>
              <button className="btn-primary text-sm gap-2 mx-auto"><ExternalLink size={14} /> Conectar conta Meta</button>
            </div>
          </div>
        )}

        {/* Automações */}
        {activeView === 'automations' && <AutomationsView />}
      </div>
    </div>
  )
}

const MOCK_CAMPAIGNS = [
  { id: '1', name: 'Captação — Limpeza e Profilaxia', platform: 'meta',     status: 'active', spent: 1800, budget: 3000, leads: 34, conversions: 9,  cpl: 52.9,  conversionRate: 26.5 },
  { id: '2', name: 'Clareamento Dental — Verão',      platform: 'google',   status: 'active', spent: 2400, budget: 4000, leads: 28, conversions: 7,  cpl: 85.7,  conversionRate: 25.0 },
  { id: '3', name: 'Reativação de Pacientes',          platform: 'whatsapp', status: 'ended',  spent: 320,  budget: 320,  leads: 12, conversions: 5,  cpl: 26.7,  conversionRate: 41.7 },
]

// ── AutomationModal ───────────────────────────────────────────────────────────
function AutomationModal({ initial, onSave, onClose }: {
  initial?: Automation | null
  onSave: (a: Automation) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    triggerStage: initial?.triggerStage ?? 'NEW',
    delayDays: String(initial?.delayDays ?? 1),
    actionType: initial?.actionType ?? 'whatsapp',
    messageTemplate: initial?.messageTemplate ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório'); return }
    if (!form.messageTemplate.trim()) { setError('Mensagem é obrigatória'); return }
    setSaving(true); setError(null)
    const url = initial ? `/api/automations/${initial.id}` : '/api/automations'
    const method = initial ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, delayDays: Number(form.delayDays) }) })
    setSaving(false)
    if (!res.ok) { setError('Erro ao salvar automação'); return }
    const saved = await res.json()
    onSave(saved)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{initial ? 'Editar Automação' : 'Nova Automação'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nome da Automação *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Follow-up após contato" className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Gatilho — Etapa do Funil</label>
              <select value={form.triggerStage} onChange={e => setForm(f => ({ ...f, triggerStage: e.target.value }))} className="input">
                {STATUS_COLUMNS.map(c => <option key={c.status} value={c.status}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Aguardar (dias)</label>
              <input type="number" min={0} max={365} value={form.delayDays} onChange={e => setForm(f => ({ ...f, delayDays: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Tipo de Ação</label>
            <div className="flex gap-2">
              {(['whatsapp', 'email', 'note'] as const).map(type => (
                <button key={type} type="button" onClick={() => setForm(f => ({ ...f, actionType: type }))}
                  className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-colors',
                    form.actionType === type ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
                  {ACTION_ICONS[type]} {ACTION_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              {form.actionType === 'note' ? 'Conteúdo da Nota' : 'Mensagem'}
            </label>
            <textarea value={form.messageTemplate} onChange={e => setForm(f => ({ ...f, messageTemplate: e.target.value }))} rows={4} className="input resize-none"
              placeholder={form.actionType === 'whatsapp' ? 'Olá {{nome}}, tudo bem? Gostaria de confirmar seu agendamento…' : form.actionType === 'email' ? 'Olá {{nome}},\n\nSegue o follow-up da nossa conversa…' : 'Lembrar de acompanhar este lead…'} />
            <p className="text-[10px] text-slate-400 mt-1">Use {'{{nome}}'} para incluir o nome do lead automaticamente</p>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? <Loader2 size={14} className="animate-spin" /> : 'Salvar Automação'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── AutomationsView ───────────────────────────────────────────────────────────
function AutomationsView() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Automation | null>(null)

  useEffect(() => {
    fetch('/api/automations').then(r => r.json()).then(d => setAutomations(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  const handleSave = (saved: Automation) => {
    setAutomations(prev => {
      const exists = prev.find(a => a.id === saved.id)
      return exists ? prev.map(a => a.id === saved.id ? saved : a) : [...prev, saved]
    })
  }

  const toggleActive = async (a: Automation) => {
    const res = await fetch(`/api/automations/${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !a.active }) })
    if (res.ok) { const updated = await res.json(); setAutomations(prev => prev.map(x => x.id === updated.id ? updated : x)) }
  }

  const deleteAutomation = async (id: string) => {
    if (!confirm('Remover esta automação?')) return
    await fetch(`/api/automations/${id}`, { method: 'DELETE' })
    setAutomations(prev => prev.filter(a => a.id !== id))
  }

  const groupedByStage = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.status] = automations.filter(a => a.triggerStage === col.status)
    return acc
  }, {} as Record<string, Automation[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Automações do Funil</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure mensagens e ações automáticas por etapa do funil</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary text-xs gap-1.5">
          <Plus size={14} /> Nova Automação
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
      ) : (
        <div className="space-y-4">
          {STATUS_COLUMNS.map(col => {
            const stageAutos = groupedByStage[col.status] ?? []
            return (
              <div key={col.status} className="card overflow-hidden">
                <div className={cn('flex items-center gap-2 px-5 py-3 border-b border-slate-100')}>
                  <div className={cn('w-2.5 h-2.5 rounded-full', col.dot)} />
                  <span className="text-sm font-semibold text-slate-700">{col.label}</span>
                  <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5 font-bold">{stageAutos.length}</span>
                  <button onClick={() => { setEditing(null); setShowModal(true) }} className="ml-auto btn-secondary text-xs gap-1 py-1 px-2">
                    <Plus size={11} /> Adicionar
                  </button>
                </div>
                {stageAutos.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <Zap size={20} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Nenhuma automação para esta etapa</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {stageAutos.map(auto => (
                      <div key={auto.id} className={cn('flex items-center gap-4 px-5 py-3 transition-colors', !auto.active && 'opacity-50')}>
                        <div className="flex-shrink-0">{ACTION_ICONS[auto.actionType]}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{auto.name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            Após <b>{auto.delayDays}</b> dia{auto.delayDays !== 1 ? 's' : ''} · {ACTION_LABELS[auto.actionType]} · &quot;{auto.messageTemplate.slice(0, 50)}{auto.messageTemplate.length > 50 ? '…' : ''}&quot;
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => toggleActive(auto)} className="text-slate-400 hover:text-brand-600 transition-colors" title={auto.active ? 'Desativar' : 'Ativar'}>
                            {auto.active ? <ToggleRight size={18} className="text-brand-600" /> : <ToggleLeft size={18} />}
                          </button>
                          <button onClick={() => { setEditing(auto); setShowModal(true) }} className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-100 rounded"><Pencil size={13} /></button>
                          <button onClick={() => deleteAutomation(auto.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <AutomationModal initial={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null) }} />
      )}
    </div>
  )
}

// ── LeadCard ──────────────────────────────────────────────────────────────────
function LeadCard({ lead, onMove, isDragging }: {
  lead: Lead
  onMove: (id: string, status: LeadStatus) => void
  isDragging: boolean
}) {
  const [showMove, setShowMove] = useState(false)
  const src = lead.source ? SOURCE_LABELS[lead.source] : null
  const scoreColor = lead.score >= 70 ? 'text-emerald-600 bg-emerald-50' : lead.score >= 40 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData('leadId', lead.id); e.dataTransfer.effectAllowed = 'move' }}
      className={cn('bg-white border border-slate-200 rounded-xl p-3 hover:border-brand-300 transition-all cursor-grab active:cursor-grabbing hover:shadow-sm select-none', isDragging && 'opacity-40')}
    >
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
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0', scoreColor)}>{lead.score}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {src && <span className={cn('badge text-[9px]', src.color)}>{src.label}</span>}
        {lead.campaignName && <span className="badge bg-purple-50 text-purple-600 text-[9px] truncate max-w-24">{lead.campaignName}</span>}
      </div>

      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-50">
        <span className="text-[10px] text-slate-400">{formatDate(lead.createdAt)}</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600 transition-colors"><MessageCircle size={12} /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-brand-600 transition-colors"><Phone size={12} /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-purple-600 transition-colors"><Calendar size={12} /></button>
          {/* Manual move */}
          <div className="relative">
            <button onClick={() => setShowMove(v => !v)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors" title="Mover para...">
              <ChevronDown size={12} />
            </button>
            {showMove && (
              <div className="absolute right-0 top-6 z-20 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden w-36">
                <p className="text-[10px] text-slate-400 px-2 pt-2 pb-1 font-medium">Mover para</p>
                {STATUS_COLUMNS.filter(c => c.status !== lead.status).map(c => (
                  <button key={c.status} onClick={() => { onMove(lead.id, c.status); setShowMove(false) }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 text-left transition-colors">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', c.dot)} />
                    <span className="text-xs text-slate-700">{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
