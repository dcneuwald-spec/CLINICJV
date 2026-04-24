'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import Link from 'next/link'
import {
  Plus, Search, Users, UserCheck, UserX,
  Phone, MessageCircle, Star, ChevronRight, TrendingUp, X,
} from 'lucide-react'
import { cn, formatDate, formatPhone, getAge, formatCurrency, getInitials } from '@/lib/utils'
import type { Patient } from '@/types'

const SOURCE_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700',
  Facebook: 'bg-blue-100 text-blue-700',
  'Facebook Ads': 'bg-blue-100 text-blue-700',
  Google: 'bg-amber-100 text-amber-700',
  Indicação: 'bg-emerald-100 text-emerald-700',
  TikTok: 'bg-slate-100 text-slate-700',
}

function PatientRow({ patient }: { patient: Patient }) {
  const age = patient.birthDate ? getAge(patient.birthDate) : null
  const srcColor = patient.referralSource ? (SOURCE_COLORS[patient.referralSource] || 'bg-slate-100 text-slate-600') : ''
  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 text-xs font-bold">{getInitials(patient.name)}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-slate-900">{patient.name}</p>
              {patient.status === 'INACTIVE' && <span className="badge bg-slate-100 text-slate-500 text-[10px]">Inativo</span>}
            </div>
            <p className="text-xs text-slate-400">{patient.registrationNum}{age ? ` · ${age} anos` : ''}</p>
          </div>
        </div>
      </td>
      <td>
        <div className="text-sm text-slate-700">{formatPhone(patient.phone)}</div>
        {patient.email && <div className="text-xs text-slate-400 truncate max-w-40">{patient.email}</div>}
      </td>
      <td>{patient.referralSource && <span className={cn('badge text-xs', srcColor)}>{patient.referralSource}</span>}</td>
      <td><span className="text-sm text-slate-700">{patient.lastVisit ? formatDate(patient.lastVisit) : '—'}</span></td>
      <td><span className="text-sm font-semibold text-slate-800">{formatCurrency(patient.totalSpent)}</span></td>
      <td>
        {patient.npsScore && (
          <div className="flex items-center gap-1">
            <Star size={12} className={patient.npsScore >= 9 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
            <span className="text-sm text-slate-700">{patient.npsScore}</span>
          </div>
        )}
      </td>
      <td>
        <div className="flex items-center gap-1">
          <a href={`tel:${patient.phone}`} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"><Phone size={14} /></a>
          <a href={`https://wa.me/55${patient.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-emerald-600"><MessageCircle size={14} /></a>
          <Link href={`/patients/${patient.id}`} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-brand-600"><ChevronRight size={14} /></Link>
        </div>
      </td>
    </tr>
  )
}

function NewPatientModal({ onClose, onSave }: { onClose: () => void; onSave: (p: Patient) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '', gender: '', referralSource: '', cpf: '', city: '', state: '' })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { onSave(await res.json()); onClose() }
    else setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b"><h3 className="font-bold text-slate-900">Novo Paciente</h3><button onClick={onClose}><X size={18} className="text-slate-400" /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs font-medium text-slate-600 block mb-1">Nome *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Telefone *</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">E-mail</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Nascimento</label><input className="input" type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Gênero</label>
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">—</option><option value="F">Feminino</option><option value="M">Masculino</option><option value="O">Outro</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">CPF</label><input className="input" value={form.cpf} onChange={e => set('cpf', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Como nos conheceu</label>
              <select className="input" value={form.referralSource} onChange={e => set('referralSource', e.target.value)}>
                <option value="">—</option><option>Instagram</option><option>Facebook</option><option>Facebook Ads</option><option>Google</option><option>Indicação</option><option>TikTok</option><option>Outros</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Cidade</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Estado</label><input className="input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="SP" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Salvando...' : 'Cadastrar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all')
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('status', filter)
    if (search) params.set('search', search)
    const res = await fetch(`/api/patients?${params}`)
    if (res.ok) setPatients(await res.json())
    setLoading(false)
  }, [filter, search])

  useEffect(() => { load() }, [load])

  const activeCount = patients.filter(p => p.status === 'ACTIVE').length
  const inactiveCount = patients.filter(p => p.status === 'INACTIVE').length
  const avgLTV = patients.length > 0 ? patients.reduce((s, p) => s + p.totalSpent, 0) / patients.length : 0

  return (
    <div className="animate-fade-in">
      <Header title="Pacientes" subtitle={`${patients.length} pacientes cadastrados`} />
      {showModal && <NewPatientModal onClose={() => setShowModal(false)} onSave={p => setPatients(prev => [p, ...prev])} />}

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center"><Users size={18} className="text-brand-600" /></div><div><p className="text-xl font-bold text-slate-900">{patients.length}</p><p className="text-xs text-slate-500">Total cadastros</p></div></div>
          <div className="card p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center"><UserCheck size={18} className="text-emerald-600" /></div><div><p className="text-xl font-bold text-slate-900">{activeCount}</p><p className="text-xs text-slate-500">Ativos</p></div></div>
          <div className="card p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center"><UserX size={18} className="text-slate-500" /></div><div><p className="text-xl font-bold text-slate-900">{inactiveCount}</p><p className="text-xs text-slate-500">Inativos</p></div></div>
          <div className="card p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><TrendingUp size={18} className="text-amber-600" /></div><div><p className="text-xl font-bold text-slate-900">{formatCurrency(avgLTV)}</p><p className="text-xs text-slate-500">LTV médio</p></div></div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input type="text" placeholder="Buscar por nome, telefone ou e-mail..." className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'ACTIVE', 'INACTIVE'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn('btn text-xs px-3 py-1.5', filter === f ? 'btn-primary' : 'btn-secondary')}>
                {f === 'all' ? 'Todos' : f === 'ACTIVE' ? 'Ativos' : 'Inativos'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs gap-1.5 ml-auto sm:ml-0"><Plus size={14} /> Novo Paciente</button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead><tr><th>Paciente</th><th>Contato</th><th>Origem</th><th>Última Visita</th><th>Total Gasto</th><th>NPS</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-12">Carregando...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-12">Nenhum paciente encontrado</td></tr>
              ) : (
                patients.map(p => <PatientRow key={p.id} patient={p} />)
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 text-right">{patients.length} resultado(s)</p>
      </div>
    </div>
  )
}
