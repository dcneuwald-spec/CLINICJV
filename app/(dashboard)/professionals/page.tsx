'use client'

import { Header } from '@/components/layout/header'
import { Plus, Phone, Mail, Stethoscope } from 'lucide-react'
import { MOCK_PROFESSIONALS } from '@/lib/mock-data'
import { cn, formatPhone, getInitials } from '@/lib/utils'

export default function ProfessionalsPage() {
  return (
    <div className="animate-fade-in">
      <Header title="Profissionais" subtitle="Equipe da clínica" />
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{MOCK_PROFESSIONALS.length} profissionais cadastrados</p>
          <button className="btn-primary text-xs gap-1.5"><Plus size={13} /> Novo Profissional</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_PROFESSIONALS.map(prof => (
            <div key={prof.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold"
                  style={{ backgroundColor: prof.color }}
                >
                  {getInitials(prof.name)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{prof.name}</p>
                  <p className="text-xs text-slate-400">{prof.specialty}</p>
                  {prof.crm && <p className="text-[10px] text-slate-400">{prof.crm}</p>}
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                {prof.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="flex-shrink-0" />
                    {formatPhone(prof.phone)}
                  </div>
                )}
                {prof.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="flex-shrink-0" />
                    {prof.email}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Stethoscope size={12} className="flex-shrink-0" />
                  Comissão: {prof.commission}%
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <button className="btn-secondary text-xs flex-1 justify-center">Editar</button>
                <div
                  className={cn(
                    'badge text-[10px] flex-shrink-0 self-center',
                    prof.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {prof.active ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
