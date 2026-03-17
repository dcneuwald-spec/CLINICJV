'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import Link from 'next/link'
import {
  Plus, Search, Filter, Users, UserCheck, UserX,
  Phone, MessageCircle, Star, ChevronRight, TrendingUp,
} from 'lucide-react'
import { MOCK_PATIENTS } from '@/lib/mock-data'
import {
  cn, formatDate, formatPhone, getAge, formatCurrency, getInitials,
} from '@/lib/utils'
import type { Patient } from '@/types'

const REFERRAL_SOURCE_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700',
  Facebook: 'bg-blue-100 text-blue-700',
  'Facebook Ads': 'bg-blue-100 text-blue-700',
  Google: 'bg-amber-100 text-amber-700',
  Indicação: 'bg-emerald-100 text-emerald-700',
  TikTok: 'bg-slate-100 text-slate-700',
}

function PatientRow({ patient }: { patient: Patient }) {
  const age = patient.birthDate ? getAge(patient.birthDate) : null
  const sourceColor = patient.referralSource ? (REFERRAL_SOURCE_COLORS[patient.referralSource] || 'bg-slate-100 text-slate-600') : ''

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
              {patient.status === 'INACTIVE' && (
                <span className="badge bg-slate-100 text-slate-500 text-[10px]">Inativo</span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {patient.registrationNum}{age ? ` · ${age} anos` : ''}
            </p>
          </div>
        </div>
      </td>
      <td>
        <div className="text-sm text-slate-700">{formatPhone(patient.phone)}</div>
        {patient.email && <div className="text-xs text-slate-400 truncate max-w-40">{patient.email}</div>}
      </td>
      <td>
        {patient.referralSource && (
          <span className={cn('badge text-xs', sourceColor)}>{patient.referralSource}</span>
        )}
      </td>
      <td>
        <span className="text-sm text-slate-700">
          {patient.lastVisit ? formatDate(patient.lastVisit) : '—'}
        </span>
      </td>
      <td>
        <span className="text-sm font-semibold text-slate-800">
          {formatCurrency(patient.totalSpent)}
        </span>
      </td>
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
          <a
            href={`tel:${patient.phone}`}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <Phone size={14} />
          </a>
          <a
            href={`https://wa.me/55${patient.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-emerald-600"
          >
            <MessageCircle size={14} />
          </a>
          <Link href={`/patients/${patient.id}`} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-brand-600">
            <ChevronRight size={14} />
          </Link>
        </div>
      </td>
    </tr>
  )
}

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filtered = MOCK_PATIENTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ||
      (filter === 'active' && p.status === 'ACTIVE') ||
      (filter === 'inactive' && p.status === 'INACTIVE')
    return matchSearch && matchFilter
  })

  const activeCount = MOCK_PATIENTS.filter(p => p.status === 'ACTIVE').length
  const inactiveCount = MOCK_PATIENTS.filter(p => p.status === 'INACTIVE').length
  const totalRevenue = MOCK_PATIENTS.reduce((sum, p) => sum + p.totalSpent, 0)

  return (
    <div className="animate-fade-in">
      <Header title="Pacientes" subtitle={`${MOCK_PATIENTS.length} pacientes cadastrados`} />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <Users size={18} className="text-brand-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{MOCK_PATIENTS.length}</p>
              <p className="text-xs text-slate-500">Total cadastros</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <UserCheck size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{activeCount}</p>
              <p className="text-xs text-slate-500">Ativos</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <UserX size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{inactiveCount}</p>
              <p className="text-xs text-slate-500">Inativos</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalRevenue / MOCK_PATIENTS.length)}</p>
              <p className="text-xs text-slate-500">LTV médio</p>
            </div>
          </div>
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou e-mail..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn('btn text-xs px-3 py-1.5', filter === f ? 'btn-primary' : 'btn-secondary')}
              >
                {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Inativos'}
              </button>
            ))}
          </div>
          <button className="btn-primary text-xs gap-1.5 ml-auto sm:ml-0">
            <Plus size={14} /> Novo Paciente
          </button>
        </div>

        {/* Tabela */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Contato</th>
                <th>Origem</th>
                <th>Última Visita</th>
                <th>Total Gasto</th>
                <th>NPS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-12">
                    Nenhum paciente encontrado
                  </td>
                </tr>
              ) : (
                filtered.map(p => <PatientRow key={p.id} patient={p} />)
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 text-right">{filtered.length} resultado(s)</p>
      </div>
    </div>
  )
}
