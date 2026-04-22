'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Plus, Phone, Mail, Stethoscope, X } from 'lucide-react'
import { cn, formatPhone, getInitials } from '@/lib/utils'
import type { Professional } from '@/types'

function NewProfessionalModal({ onClose, onSave }: { onClose: () => void; onSave: (p: Professional) => void }) {
  const [form, setForm] = useState({ name: '', specialty: '', crm: '', phone: '', email: '', commission: '0', color: '#3B82F6' })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/professionals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, commission: Number(form.commission) }) })
    if (res.ok) { onSave(await res.json()); onClose() }
    else setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b"><h3 className="font-bold text-slate-900">Novo Profissional</h3><button onClick={onClose}><X size={18} className="text-slate-400" /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-xs font-medium text-slate-600 block mb-1">Nome *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
          <div><label className="text-xs font-medium text-slate-600 block mb-1">Especialidade *</label><input className="input" value={form.specialty} onChange={e => set('specialty', e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Conselho (CRM/CRO)</label><input className="input" value={form.crm} onChange={e => set('crm', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Comissão (%)</label><input className="input" type="number" min="0" max="100" value={form.commission} onChange={e => set('commission', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Telefone</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">E-mail</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Cor na agenda</label><input className="input h-10" type="color" value={form.color} onChange={e => set('color', e.target.value)} /></div>
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

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/professionals').then(r => r.json()).then(setProfessionals).finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-in">
      <Header title="Profissionais" subtitle="Equipe da clínica" />
      {showModal && <NewProfessionalModal onClose={() => setShowModal(false)} onSave={p => setProfessionals(prev => [...prev, p])} />}
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{professionals.length} profissionais cadastrados</p>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs gap-1.5"><Plus size={13} /> Novo Profissional</button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionals.map(prof => (
              <div key={prof.id} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: prof.color }}>
                    {getInitials(prof.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{prof.name}</p>
                    <p className="text-xs text-slate-400">{prof.specialty}</p>
                    {prof.crm && <p className="text-[10px] text-slate-400">{prof.crm}</p>}
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-500">
                  {prof.phone && <div className="flex items-center gap-2"><Phone size={12} className="flex-shrink-0" />{formatPhone(prof.phone)}</div>}
                  {prof.email && <div className="flex items-center gap-2"><Mail size={12} className="flex-shrink-0" />{prof.email}</div>}
                  <div className="flex items-center gap-2"><Stethoscope size={12} className="flex-shrink-0" />Comissão: {prof.commission}%</div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <div className={cn('badge text-[10px] flex-shrink-0 self-center', prof.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                    {prof.active ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
