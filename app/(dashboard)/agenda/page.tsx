'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import {
  ChevronLeft, ChevronRight, Plus, Phone, MessageCircle,
  CheckCircle2, X, Info, Loader2, CalendarCheck, Search,
  GripVertical, DollarSign, FileText, UserPlus, Clock,
} from 'lucide-react'
import { cn, formatTime, formatDate, getAppointmentStatusLabel, getAppointmentStatusColor } from '@/lib/utils'
import type { Appointment, AppointmentStatus, Professional } from '@/types'

const STATUS_FLOW: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED', 'WAITING', 'IN_PROGRESS', 'ATTENDED']
const STATUS_ACTIONS: Record<string, string> = {
  SCHEDULED: 'Confirmar', CONFIRMED: 'Em Espera', WAITING: 'Iniciar Atendimento',
  IN_PROGRESS: 'Finalizar', ATTENDED: '✓ Concluído',
}
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7)
const PX_PER_HOUR = 64
const PX_PER_MIN = PX_PER_HOUR / 60
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface ProcedureOption { id: string; name: string; price: number; duration: number }
interface SelectedProc { procedureId: string; name: string; price: number; quantity: number }

function minutesFromStart(iso: string) {
  const [, t] = iso.split('T')
  const [h, m] = t.split(':').map(Number)
  return (h - 7) * 60 + m
}

function getWeekDates(base: Date): Date[] {
  const day = base.getDay()
  const mon = new Date(base)
  mon.setDate(base.getDate() - (day === 0 ? 6 : day - 1))
  mon.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d })
}

function fmtDur(mins: number) {
  if (!mins) return '0h'
  const h = Math.floor(mins / 60), m = mins % 60
  if (!h) return `${m}min`
  if (!m) return `${h}h`
  return `${h}h ${m}min`
}

// ── NewAppointmentModal ──────────────────────────────────────────────────────
function NewAppointmentModal({ profList, selectedDate, onClose, onCreated }: {
  profList: Professional[]; selectedDate: Date; onClose: () => void; onCreated: (a: Appointment) => void
}) {
  const [form, setForm] = useState({ professionalId: profList[0]?.id ?? '', date: selectedDate.toISOString().slice(0, 10), startTime: '09:00', duration: '60', type: 'CONSULTATION', notes: '', isFirstVisit: false })
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing')
  const [patientQuery, setPatientQuery] = useState('')
  const [patientResults, setPatientResults] = useState<{ id: string; name: string; phone: string }[]>([])
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [procedures, setProcedures] = useState<ProcedureOption[]>([])
  const [selProcs, setSelProcs] = useState<SelectedProc[]>([])
  const [procQuery, setProcQuery] = useState('')
  const [showProcDrop, setShowProcDrop] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdApt, setCreatedApt] = useState<Appointment | null>(null)
  const [sendingFin, setSendingFin] = useState(false)
  const [sendingBudget, setSendingBudget] = useState(false)
  const [finSent, setFinSent] = useState(false)
  const [budgetDone, setBudgetDone] = useState(false)

  useEffect(() => {
    fetch('/api/procedures').then(r => r.ok ? r.json() : []).then(d => setProcedures(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    if (patientQuery.length < 2) { setPatientResults([]); return }
    const t = setTimeout(() => {
      fetch(`/api/patients?search=${encodeURIComponent(patientQuery)}&limit=5`).then(r => r.json())
        .then(d => setPatientResults(Array.isArray(d) ? d.slice(0, 5) : d.patients?.slice(0, 5) ?? []))
    }, 300)
    return () => clearTimeout(t)
  }, [patientQuery])

  const filteredProcs = procedures.filter(p => p.name.toLowerCase().includes(procQuery.toLowerCase()) && !selProcs.some(s => s.procedureId === p.id)).slice(0, 6)

  const addProc = (p: ProcedureOption) => { setSelProcs(prev => [...prev, { procedureId: p.id, name: p.name, price: p.price, quantity: 1 }]); setProcQuery(''); setShowProcDrop(false) }
  const removeProc = (i: number) => setSelProcs(prev => prev.filter((_, j) => j !== i))

  const sendToFin = async () => {
    if (!createdApt?.patientId) return
    setSendingFin(true)
    const total = createdApt.procedures.reduce((s, p) => s + p.price * p.quantity, 0)
    const res = await fetch('/api/financial', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'INCOME', description: `Consulta - ${createdApt.patientName} - ${createdApt.procedures.map(p => p.procedureName).join(', ')}`, amount: total, dueDate: createdApt.startTime, patientId: createdApt.patientId, category: 'Consulta' }),
    })
    setSendingFin(false)
    if (res.ok) setFinSent(true)
  }

  const createBudget = async () => {
    if (!createdApt?.patientId) return
    setSendingBudget(true)
    const res = await fetch('/api/budgets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: createdApt.patientId, title: `Orçamento - ${createdApt.procedures.map(p => p.procedureName).join(', ')}`, items: createdApt.procedures.map(p => ({ description: p.procedureName, quantity: p.quantity, unitPrice: p.price, procedureId: p.procedureId })), discount: 0 }),
    })
    setSendingBudget(false)
    if (res.ok) setBudgetDone(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.professionalId) { setError('Selecione um profissional'); return }
    if (patientMode === 'new' && !newName.trim()) { setError('Nome do paciente é obrigatório'); return }
    if (patientMode === 'new' && !newPhone.trim()) { setError('Telefone do paciente é obrigatório'); return }
    setSaving(true); setError(null)
    let patientId = selectedPatient?.id ?? null
    if (patientMode === 'new') {
      const pr = await fetch('/api/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim(), phone: newPhone.trim() }) })
      if (!pr.ok) { setError('Erro ao cadastrar paciente'); setSaving(false); return }
      const pat = await pr.json(); patientId = pat.id
    }
    const res = await fetch('/api/appointments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, professionalId: form.professionalId, startTime: `${form.date}T${form.startTime}:00`, duration: Number(form.duration), type: form.type, title: patientId ? undefined : 'Bloqueio', notes: form.notes || undefined, isFirstVisit: form.isFirstVisit, procedures: selProcs.map(p => ({ procedureId: p.procedureId, quantity: p.quantity, price: p.price })) }),
    })
    if (!res.ok) { setError('Erro ao criar agendamento'); setSaving(false); return }
    const created = await res.json()
    onCreated(created)
    if (selProcs.length > 0 && patientId) { setSaving(false); setCreatedApt(created) } else { onClose() }
  }

  if (createdApt) {
    const total = createdApt.procedures.reduce((s, p) => s + p.price * p.quantity, 0)
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Agendamento Criado</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-3">
              <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-slate-800">{createdApt.patientName}</p>
                <p className="text-sm text-slate-500">{formatDate(createdApt.startTime, 'dd/MM/yyyy')} às {formatTime(createdApt.startTime)} · {createdApt.professionalName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Procedimentos</p>
              {createdApt.procedures.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-0.5">
                  <span className="text-slate-700">{p.procedureName}</span>
                  <span className="text-slate-500">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold border-t border-slate-100 pt-1 mt-1">
                <span>Total</span><span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-xs text-slate-400">Deseja gerar registros financeiros?</p>
              <div className="flex gap-2">
                <button onClick={sendToFin} disabled={sendingFin || finSent} className={cn('flex-1 btn-secondary text-xs justify-center gap-1.5', finSent && 'text-emerald-600 border-emerald-200 bg-emerald-50')}>
                  {sendingFin ? <Loader2 size={11} className="animate-spin" /> : <DollarSign size={11} />}{finSent ? 'Enviado ✓' : 'Enviar ao Financeiro'}
                </button>
                <button onClick={createBudget} disabled={sendingBudget || budgetDone} className={cn('flex-1 btn-secondary text-xs justify-center gap-1.5', budgetDone && 'text-emerald-600 border-emerald-200 bg-emerald-50')}>
                  {sendingBudget ? <Loader2 size={11} className="animate-spin" /> : <FileText size={11} />}{budgetDone ? 'Criado ✓' : 'Criar Orçamento'}
                </button>
              </div>
              {(finSent || budgetDone) && (
                <div className="flex gap-4 text-xs pt-1">
                  {finSent && <a href={`/patients/${createdApt.patientId}`} className="text-brand-600 hover:underline">Ver Financeiro do Paciente →</a>}
                  {budgetDone && <a href="/budgets" className="text-brand-600 hover:underline">Ver Orçamentos →</a>}
                </div>
              )}
            </div>
            <button onClick={onClose} className="btn-primary w-full justify-center">Fechar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Nova Consulta</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Paciente */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Paciente</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden mb-2">
              <button type="button" onClick={() => setPatientMode('existing')} className={cn('flex-1 text-xs py-2 transition-colors', patientMode === 'existing' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50')}>Buscar Paciente</button>
              <button type="button" onClick={() => setPatientMode('new')} className={cn('flex-1 text-xs py-2 flex items-center justify-center gap-1 transition-colors', patientMode === 'new' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50')}><UserPlus size={12} /> Novo Paciente</button>
            </div>
            {patientMode === 'existing' ? (
              <div className="relative">
                {selectedPatient ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 rounded-xl border border-brand-200">
                    <span className="text-sm font-medium text-brand-800 flex-1">{selectedPatient.name}</span>
                    <button type="button" onClick={() => { setSelectedPatient(null); setPatientQuery('') }}><X size={14} className="text-brand-400" /></button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={patientQuery} onChange={e => setPatientQuery(e.target.value)} placeholder="Buscar por nome ou telefone…" className="input pl-8" />
                    {patientResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        {patientResults.map(p => (
                          <button key={p.id} type="button" onClick={() => { setSelectedPatient(p); setPatientQuery(''); setPatientResults([]) }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left">
                            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0"><span className="text-brand-700 text-[10px] font-bold">{p.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}</span></div>
                            <div><p className="text-sm font-medium text-slate-800">{p.name}</p><p className="text-xs text-slate-400">{p.phone}</p></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!selectedPatient && <p className="text-[10px] text-slate-400 mt-1">Deixe em branco para criar um bloqueio na agenda</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Nome *</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome completo" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Telefone *</label>
                  <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="(11) 99999-9999" className="input" />
                </div>
              </div>
            )}
          </div>
          {/* Profissional */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Profissional *</label>
            <select value={form.professionalId} onChange={e => setForm(f => ({ ...f, professionalId: e.target.value }))} className="input" required>
              <option value="">Selecione...</option>
              {profList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {/* Data + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Data *</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" required /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Horário *</label><input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="input" required /></div>
          </div>
          {/* Duração + Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Duração</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="input">
                <option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">1 hora</option><option value="90">1h 30min</option><option value="120">2 horas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tipo</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
                <option value="CONSULTATION">Consulta</option><option value="PROCEDURE">Procedimento</option><option value="FOLLOWUP">Retorno</option><option value="EVALUATION">Avaliação</option><option value="BLOCK">Bloqueio</option>
              </select>
            </div>
          </div>
          {/* Procedimentos */}
          {procedures.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Procedimentos</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={procQuery} onChange={e => { setProcQuery(e.target.value); setShowProcDrop(true) }} onFocus={() => setShowProcDrop(true)} onBlur={() => setTimeout(() => setShowProcDrop(false), 150)} placeholder="Buscar e adicionar procedimento…" className="input pl-8" />
                {showProcDrop && filteredProcs.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {filteredProcs.map(p => (
                      <button key={p.id} type="button" onMouseDown={() => addProc(p)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 text-left">
                        <span className="text-sm text-slate-800">{p.name}</span>
                        <span className="text-xs text-slate-400">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selProcs.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {selProcs.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                      <span className="flex-1 text-sm text-slate-700">{p.name}</span>
                      <span className="text-xs text-slate-500">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <button type="button" onClick={() => removeProc(i)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button>
                    </div>
                  ))}
                  <p className="text-xs text-slate-500 text-right">Total: <b>R$ {selProcs.reduce((s, p) => s + p.price * p.quantity, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b></p>
                </div>
              )}
            </div>
          )}
          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Observações</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="input resize-none" placeholder="Anotações internas…" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.isFirstVisit} onChange={e => setForm(f => ({ ...f, isFirstVisit: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span className="text-sm text-slate-700">Primeira consulta do paciente</span>
          </label>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? <Loader2 size={14} className="animate-spin" /> : 'Agendar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── AppointmentCard ──────────────────────────────────────────────────────────
function AppointmentCard({ apt, onClick, onDragStart, isDragging }: {
  apt: Appointment; onClick: (a: Appointment) => void
  onDragStart: (e: React.DragEvent, a: Appointment) => void; isDragging: boolean
}) {
  const top = minutesFromStart(apt.startTime)
  const h = Math.max(apt.duration, 44)
  return (
    <div draggable onDragStart={e => onDragStart(e, apt)}
      className={cn('absolute left-1 right-1 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all group select-none', isDragging && 'opacity-40')}
      style={{ top: `${top * PX_PER_MIN}px`, height: `${h * PX_PER_MIN}px`, backgroundColor: apt.professionalColor + '22', borderLeft: `3px solid ${apt.professionalColor}` }}
      onClick={() => onClick(apt)}>
      <div className="p-1.5 flex items-start gap-1">
        <GripVertical size={10} className="text-slate-400 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 leading-none truncate">{apt.patientName || apt.title}</p>
          {h >= 55 && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{formatTime(apt.startTime)} — {apt.procedures[0]?.procedureName || apt.type}</p>}
          {h >= 70 && <span className={cn('badge text-[9px] mt-1', getAppointmentStatusColor(apt.status))}>{getAppointmentStatusLabel(apt.status)}</span>}
        </div>
      </div>
    </div>
  )
}

// ── AppointmentModal ─────────────────────────────────────────────────────────
function AppointmentModal({ apt, onClose, onStatusChange }: {
  apt: Appointment; onClose: () => void; onStatusChange: (id: string, s: AppointmentStatus) => void
}) {
  const idx = STATUS_FLOW.indexOf(apt.status as AppointmentStatus)
  const nextStatus = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  const [sendingFin, setSendingFin] = useState(false)
  const [sendingBudget, setSendingBudget] = useState(false)
  const [finSent, setFinSent] = useState(false)
  const [budgetDone, setBudgetDone] = useState(false)
  const total = apt.procedures.reduce((s, p) => s + p.price * p.quantity, 0)

  const sendToFin = async () => {
    if (!apt.patientId) return
    setSendingFin(true)
    const res = await fetch('/api/financial', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'INCOME', description: `Consulta - ${apt.patientName} - ${apt.procedures.map(p => p.procedureName).join(', ')}`, amount: total, dueDate: apt.startTime, patientId: apt.patientId, category: 'Consulta' }),
    })
    setSendingFin(false)
    if (res.ok) setFinSent(true)
  }

  const createBudget = async () => {
    if (!apt.patientId) return
    setSendingBudget(true)
    const res = await fetch('/api/budgets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: apt.patientId, title: `Orçamento - ${apt.procedures.map(p => p.procedureName).join(', ')}`, items: apt.procedures.map(p => ({ description: p.procedureName, quantity: p.quantity, unitPrice: p.price, procedureId: p.procedureId })), discount: 0 }),
    })
    setSendingBudget(false)
    if (res.ok) setBudgetDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">{apt.patientName || 'Consulta'}</h3>
            <p className="text-sm text-slate-500">{formatTime(apt.startTime)} — {formatTime(apt.endTime)} · {apt.professionalName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className={cn('badge', getAppointmentStatusColor(apt.status))}>{getAppointmentStatusLabel(apt.status)}</span>
            {apt.isFirstVisit && <span className="badge bg-purple-100 text-purple-700">1ª Consulta</span>}
            {apt.confirmed && <span className="badge bg-emerald-100 text-emerald-700"><CheckCircle2 size={11} className="mr-1" /> Confirmado</span>}
          </div>
          {apt.procedures.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Procedimentos</p>
              <div className="space-y-1">
                {apt.procedures.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-700">{p.procedureName}</span>
                    <span className="text-slate-500">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                {apt.procedures.length > 1 && (
                  <div className="flex justify-between text-sm font-semibold border-t border-slate-100 pt-1">
                    <span>Total</span><span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {apt.notes && <div className="bg-slate-50 rounded-lg px-3 py-2"><p className="text-xs text-slate-600">{apt.notes}</p></div>}
          {apt.patientPhone && (
            <div className="flex gap-2">
              <a href={`tel:${apt.patientPhone}`} className="flex-1 btn-secondary text-xs justify-center"><Phone size={14} /> Ligar</a>
              <a href={`https://wa.me/55${apt.patientPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 btn-secondary text-xs justify-center"><MessageCircle size={14} /> WhatsApp</a>
              <a href={`/patients/${apt.patientId}`} className="flex-1 btn-secondary text-xs justify-center"><Info size={14} /> Prontuário</a>
            </div>
          )}
          {apt.procedures.length > 0 && apt.patientId && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-xs font-medium text-slate-400">Registros Financeiros</p>
              <div className="flex gap-2">
                <button onClick={sendToFin} disabled={sendingFin || finSent}
                  className={cn('flex-1 btn-secondary text-xs justify-center gap-1.5', finSent && 'text-emerald-600 border-emerald-200 bg-emerald-50')}>
                  {sendingFin ? <Loader2 size={11} className="animate-spin" /> : <DollarSign size={11} />}
                  {finSent ? 'Enviado ✓' : 'Enviar para Financeiro'}
                </button>
                <button onClick={createBudget} disabled={sendingBudget || budgetDone}
                  className={cn('flex-1 btn-secondary text-xs justify-center gap-1.5', budgetDone && 'text-emerald-600 border-emerald-200 bg-emerald-50')}>
                  {sendingBudget ? <Loader2 size={11} className="animate-spin" /> : <FileText size={11} />}
                  {budgetDone ? 'Criado ✓' : 'Criar Orçamento'}
                </button>
              </div>
              {(finSent || budgetDone) && (
                <div className="flex gap-4 text-xs">
                  {finSent && <a href={`/patients/${apt.patientId}`} className="text-brand-600 hover:underline">Ver Financeiro do Paciente →</a>}
                  {budgetDone && <a href="/budgets" className="text-brand-600 hover:underline">Ver Orçamentos →</a>}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          {nextStatus && !['ATTENDED', 'ABSENT', 'CANCELLED'].includes(apt.status) && (
            <button onClick={() => { onStatusChange(apt.id, nextStatus); onClose() }} className="btn-primary flex-1 justify-center">{STATUS_ACTIONS[apt.status]}</button>
          )}
          {!['ABSENT', 'ATTENDED', 'CANCELLED'].includes(apt.status) && (
            <button onClick={() => { onStatusChange(apt.id, 'ABSENT'); onClose() }} className="btn-secondary text-red-600 border-red-100 hover:bg-red-50 flex-1 justify-center">Registrar Falta</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── AgendaPage ───────────────────────────────────────────────────────────────
export default function AgendaPage() {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  const [filterProf, setFilterProf] = useState<string>('all')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [weekAppointments, setWeekAppointments] = useState<Appointment[]>([])
  const [profList, setProfList] = useState<Professional[]>([])
  const [showNewModal, setShowNewModal] = useState(false)
  const [gcalConnected, setGcalConnected] = useState(false)
  const [gcalLoading, setGcalLoading] = useState(false)
  const [draggedApt, setDraggedApt] = useState<Appointment | null>(null)
  const [dropTarget, setDropTarget] = useState<{ profId: string; time: string } | null>(null)

  useEffect(() => {
    fetch('/api/professionals').then(r => r.json()).then(setProfList)
    fetch('/api/google-calendar/status').then(r => r.ok ? r.json() : null).then(d => d && setGcalConnected(d.connected)).catch(() => {})
  }, [])

  const loadAppointments = () => {
    const dateStr = selectedDate.toISOString().slice(0, 10)
    fetch(`/api/appointments?date=${dateStr}`).then(r => r.json()).then(d => setAppointments(Array.isArray(d) ? d : []))
  }

  const loadWeekAppointments = () => {
    const wd = getWeekDates(selectedDate)
    const s = wd[0].toISOString().slice(0, 10)
    const e = wd[6].toISOString().slice(0, 10)
    fetch(`/api/appointments?startDate=${s}&endDate=${e}`).then(r => r.json()).then(d => setWeekAppointments(Array.isArray(d) ? d : []))
  }

  useEffect(() => { loadAppointments(); loadWeekAppointments() }, [selectedDate])

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    const res = await fetch(`/api/appointments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) {
      const updated = await res.json()
      setAppointments(prev => prev.map(a => a.id === id ? updated : a))
      setWeekAppointments(prev => prev.map(a => a.id === id ? updated : a))
    }
  }

  const changeDate = (delta: number) => {
    setSelectedDate(prev => { const d = new Date(prev); d.setDate(d.getDate() + delta * (viewMode === 'week' ? 7 : 1)); return d })
  }

  const handleDragStart = (e: React.DragEvent, apt: Appointment) => { setDraggedApt(apt); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, profId: string) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    const totalMins = Math.max(0, Math.round((e.clientY - rect.top) / PX_PER_MIN / 15) * 15)
    const h = 7 + Math.floor(totalMins / 60), m = totalMins % 60
    if (h >= 7 && h < 20) setDropTarget({ profId, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` })
  }
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, profId: string) => {
    e.preventDefault(); if (!draggedApt) return
    const rect = e.currentTarget.getBoundingClientRect()
    const totalMins = Math.max(0, Math.round((e.clientY - rect.top) / PX_PER_MIN / 15) * 15)
    const h = 7 + Math.floor(totalMins / 60), m = totalMins % 60
    if (h < 7 || h >= 20) return
    const newStart = `${selectedDate.toISOString().slice(0, 10)}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
    const prev = draggedApt; setDraggedApt(null); setDropTarget(null)
    setAppointments(p => p.map(a => a.id === prev.id ? { ...a, startTime: newStart, professionalId: profId } : a))
    await fetch(`/api/appointments/${prev.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startTime: newStart, duration: prev.duration, professionalId: profId }) })
    loadAppointments()
  }
  const handleDragEnd = () => { setDraggedApt(null); setDropTarget(null) }

  const handleConnectGcal = async () => {
    setGcalLoading(true)
    const res = await fetch('/api/google-calendar/auth')
    if (res.ok) { const { url } = await res.json(); window.location.href = url }
    setGcalLoading(false)
  }

  const weekDates = getWeekDates(selectedDate)
  const todayStr = new Date().toISOString().slice(0, 10)
  const filteredApts = filterProf === 'all' ? appointments : appointments.filter(a => a.professionalId === filterProf)
  const aptsByProf = profList.reduce((acc, p) => { acc[p.id] = filteredApts.filter(a => a.professionalId === p.id); return acc }, {} as Record<string, Appointment[]>)
  const professionals = filterProf === 'all' ? profList : profList.filter(p => p.id === filterProf)

  const total = appointments.length
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length
  const attended = appointments.filter(a => a.status === 'ATTENDED').length
  const absent = appointments.filter(a => a.status === 'ABSENT').length
  const inProgress = appointments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'WAITING').length
  const occupancy = total > 0 ? Math.round(((attended + inProgress) / total) * 100) : 0
  const weekTotalMinutes = weekAppointments.filter(a => !['CANCELLED', 'ABSENT'].includes(a.status)).reduce((s, a) => s + a.duration, 0)

  const weekLabel = viewMode === 'week'
    ? `${formatDate(weekDates[0].toISOString(), 'dd/MM')} — ${formatDate(weekDates[6].toISOString(), 'dd/MM/yyyy')}`
    : formatDate(selectedDate.toISOString(), "EEEE, dd 'de' MMMM 'de' yyyy")

  const HourLines = () => (
    <>
      {HOURS.map(h => <div key={h} className="absolute left-0 right-0 border-b border-slate-100" style={{ top: `${(h - 7) * PX_PER_HOUR}px`, height: `${PX_PER_HOUR}px` }} />)}
      {HOURS.map(h => <div key={`${h}h`} className="absolute left-0 right-0 border-b border-dashed border-slate-50" style={{ top: `${(h - 7) * PX_PER_HOUR + 32}px` }} />)}
    </>
  )

  return (
    <div className="h-screen flex flex-col">
      <Header title="Agenda" subtitle={weekLabel} />

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={16} className="text-slate-500" /></button>
          <span className="text-sm font-semibold text-slate-800 min-w-28 text-center">
            {viewMode === 'week'
              ? `${weekDates[0].getDate().toString().padStart(2,'0')}/${(weekDates[0].getMonth()+1).toString().padStart(2,'0')} — ${weekDates[6].getDate().toString().padStart(2,'0')}/${(weekDates[6].getMonth()+1).toString().padStart(2,'0')}`
              : formatDate(selectedDate.toISOString(), 'dd/MM/yyyy')}
          </span>
          <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={16} className="text-slate-500" /></button>
          <button onClick={() => setSelectedDate(new Date())} className="btn-secondary text-xs px-3 py-1.5">Hoje</button>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button onClick={() => setViewMode('day')} className={cn('px-3 py-1.5 text-xs font-medium transition-colors', viewMode === 'day' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50')}>Dia</button>
          <button onClick={() => setViewMode('week')} className={cn('px-3 py-1.5 text-xs font-medium transition-colors', viewMode === 'week' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50')}>Semana</button>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Professional filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilterProf('all')} className={cn('btn text-xs px-3 py-1.5', filterProf === 'all' ? 'btn-primary' : 'btn-secondary')}>Todos</button>
          {profList.map(p => (
            <button key={p.id} onClick={() => setFilterProf(p.id)} className={cn('btn text-xs px-3 py-1.5 gap-1.5', filterProf === p.id ? 'text-white' : 'btn-secondary')} style={filterProf === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: filterProf === p.id ? 'white' : p.color }} />
              {p.name.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleConnectGcal} disabled={gcalLoading} className={cn('btn text-xs gap-1.5 px-3 py-1.5', gcalConnected ? 'btn-secondary text-emerald-600 border-emerald-200' : 'btn-secondary')}>
            {gcalLoading ? <Loader2 size={13} className="animate-spin" /> : <CalendarCheck size={13} className={gcalConnected ? 'text-emerald-500' : ''} />}
            {gcalConnected ? 'Google Agenda ✓' : 'Conectar Google Agenda'}
          </button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary text-xs gap-1.5"><Plus size={14} /> Nova Consulta</button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-6 text-xs flex-wrap">
        <span className="text-slate-500">Total: <b className="text-slate-800">{total}</b></span>
        <span className="text-emerald-600">Atendidos: <b>{attended}</b></span>
        <span className="text-purple-600">Em andamento: <b>{inProgress}</b></span>
        <span className="text-blue-600">Confirmados: <b>{confirmed}</b></span>
        <span className="text-red-600">Faltas: <b>{absent}</b></span>
        <span className="text-indigo-600 flex items-center gap-1"><Clock size={11} /> Semana: <b>{fmtDur(weekTotalMinutes)}</b></span>
        <span className="text-slate-500 ml-auto">Ocupação: <b className="text-slate-800">{occupancy}%</b></span>
        {draggedApt && <span className="text-brand-600 font-medium animate-pulse">{dropTarget ? `→ ${dropTarget.time}` : 'Arraste para reposicionar…'}</span>}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto" onDragEnd={handleDragEnd}>
        <div className="flex min-w-max">
          {/* Hour column */}
          <div className="w-16 flex-shrink-0 bg-white border-r border-slate-200 sticky left-0 z-10">
            <div className="h-10 border-b border-slate-200" />
            {HOURS.map(h => (
              <div key={h} className="h-16 border-b border-slate-100 flex items-start justify-end pr-2 pt-1">
                <span className="text-[10px] text-slate-400">{String(h).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          {/* Day view — professional columns */}
          {viewMode === 'day' && professionals.map(prof => (
            <div key={prof.id} className="flex-1 min-w-[180px] border-r border-slate-200 last:border-r-0">
              <div className="h-10 border-b border-slate-200 flex items-center justify-center gap-2 px-3 sticky top-0 z-10 bg-white">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: prof.color }} />
                <span className="text-xs font-semibold text-slate-700 truncate">{prof.name.split(' ').slice(0, 2).join(' ')}</span>
                <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0">{aptsByProf[prof.id]?.length || 0} cons.</span>
              </div>
              <div className={cn('relative transition-colors', draggedApt && dropTarget?.profId === prof.id && 'bg-brand-50/50')}
                style={{ height: `${HOURS.length * PX_PER_HOUR}px` }}
                onDragOver={e => handleDragOver(e, prof.id)} onDrop={e => handleDrop(e, prof.id)}>
                <HourLines />
                {draggedApt && dropTarget?.profId === prof.id && dropTarget.time && (
                  <div className="absolute left-1 right-1 h-0.5 bg-brand-500 rounded-full z-20 pointer-events-none"
                    style={{ top: (() => { const [hh, mm] = dropTarget.time.split(':').map(Number); return `${((hh - 7) * 60 + mm) * PX_PER_MIN}px` })() }}>
                    <span className="absolute -top-3 left-1 text-[10px] text-brand-600 font-bold bg-white px-1 rounded">{dropTarget.time}</span>
                  </div>
                )}
                {aptsByProf[prof.id]?.map(apt => (
                  <AppointmentCard key={apt.id} apt={apt} onClick={setSelectedApt} onDragStart={handleDragStart} isDragging={draggedApt?.id === apt.id} />
                ))}
              </div>
            </div>
          ))}

          {/* Week view — day columns */}
          {viewMode === 'week' && weekDates.map(date => {
            const dateStr = date.toISOString().slice(0, 10)
            const isToday = dateStr === todayStr
            const dayApts = weekAppointments.filter(a => a.startTime.slice(0, 10) === dateStr && (filterProf === 'all' || a.professionalId === filterProf))
            return (
              <div key={dateStr} className="flex-1 min-w-[140px] border-r border-slate-200 last:border-r-0">
                <div className={cn('h-10 border-b border-slate-200 flex flex-col items-center justify-center sticky top-0 z-10', isToday ? 'bg-brand-50' : 'bg-white')}>
                  <span className="text-[10px] font-medium text-slate-400">{DAY_NAMES[date.getDay()]}</span>
                  <span className={cn('text-sm font-bold', isToday ? 'text-brand-600' : 'text-slate-700')}>
                    {date.getDate().toString().padStart(2, '0')}/{(date.getMonth() + 1).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="relative" style={{ height: `${HOURS.length * PX_PER_HOUR}px` }}>
                  <HourLines />
                  {dayApts.map(apt => (
                    <AppointmentCard key={apt.id} apt={apt} onClick={setSelectedApt} onDragStart={handleDragStart} isDragging={draggedApt?.id === apt.id} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedApt && <AppointmentModal apt={selectedApt} onClose={() => setSelectedApt(null)} onStatusChange={handleStatusChange} />}
      {showNewModal && (
        <NewAppointmentModal profList={profList} selectedDate={selectedDate} onClose={() => setShowNewModal(false)}
          onCreated={apt => { setAppointments(prev => [...prev, apt]); setWeekAppointments(prev => [...prev, apt]) }} />
      )}
    </div>
  )
}
