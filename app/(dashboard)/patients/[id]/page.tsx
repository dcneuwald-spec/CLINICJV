'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import Link from 'next/link'
import {
  ArrowLeft, Phone, MessageCircle, Star, Calendar, DollarSign,
  FileText, Camera, Activity, AlertCircle, CheckCircle2, XCircle,
  Edit3, Trash2, UserX, Printer, Search,
} from 'lucide-react'
import {
  MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_TRANSACTIONS, MOCK_BUDGETS,
} from '@/lib/mock-data'
import {
  cn, formatDate, formatPhone, getAge, formatCurrency,
  getInitials, getAppointmentStatusLabel, getAppointmentStatusColor,
  getBudgetStatusLabel, getTransactionStatusLabel, getPaymentMethodLabel,
} from '@/lib/utils'

const TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'appointments', label: 'Consultas' },
  { id: 'financial', label: 'Financeiro' },
  { id: 'budgets', label: 'Orçamentos' },
  { id: 'documents', label: 'Documentos' },
  { id: 'photos', label: 'Fotos' },
  { id: 'anamnesis', label: 'Anamnese' },
]

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview')

  const patient = MOCK_PATIENTS.find(p => p.id === params.id) || MOCK_PATIENTS[0]
  const appointments = MOCK_APPOINTMENTS.filter(a => a.patientId === patient.id)
  const transactions = MOCK_TRANSACTIONS.filter(t => t.patientId === patient.id)
  const budgets = MOCK_BUDGETS.filter(b => b.patientId === patient.id)

  const age = patient.birthDate ? getAge(patient.birthDate) : null
  const attended = appointments.filter(a => a.status === 'ATTENDED').length
  const absent = appointments.filter(a => a.status === 'ABSENT').length
  const absenceRate = appointments.length > 0 ? ((absent / appointments.length) * 100).toFixed(0) : '0'

  return (
    <div className="animate-fade-in">
      <Header title={patient.name} subtitle={`Prontuário ${patient.registrationNum}`} />

      <div className="p-6 space-y-5">
        {/* Breadcrumb */}
        <Link href="/patients" className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors w-fit">
          <ArrowLeft size={14} />
          Voltar para Pacientes
        </Link>

        {/* Header do paciente */}
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-700 text-2xl font-bold">{getInitials(patient.name)}</span>
            </div>

            {/* Info principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                {patient.nickname && <span className="text-slate-400 text-sm">({patient.nickname})</span>}
                <span className={cn('badge', patient.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                  {patient.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                {age ? `${age} anos` : ''}{patient.birthDate ? ` · Nasc. ${formatDate(patient.birthDate)}` : ''}
                {patient.cpf ? ` · CPF ${patient.cpf}` : ''}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <a href={`tel:${patient.phone}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-600 transition-colors">
                  <Phone size={14} /> {formatPhone(patient.phone)}
                </a>
                {patient.email && (
                  <span className="text-sm text-slate-500">{patient.email}</span>
                )}
                {patient.referralSource && (
                  <span className="badge bg-purple-100 text-purple-700 text-xs">{patient.referralSource}</span>
                )}
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://wa.me/55${patient.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs gap-1.5"
              >
                <MessageCircle size={13} /> WhatsApp
              </a>
              <button className="btn-secondary text-xs gap-1.5">
                <Calendar size={13} /> Agendar
              </button>
              <button className="btn-secondary text-xs gap-1.5">
                <Search size={13} /> Consultar CPF
              </button>
              <button className="btn-secondary text-xs gap-1.5">
                <Edit3 size={13} /> Editar
              </button>
            </div>
          </div>

          {/* KPIs do paciente */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
              <p className="text-xs text-slate-500">Consultas totais</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{attended}</p>
              <p className="text-xs text-slate-500">Atendidas</p>
            </div>
            <div className="text-center">
              <p className={cn('text-2xl font-bold', Number(absenceRate) > 15 ? 'text-red-600' : 'text-slate-900')}>
                {absenceRate}%
              </p>
              <p className="text-xs text-slate-500">Taxa de falta</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-600">{formatCurrency(patient.totalSpent)}</p>
              <p className="text-xs text-slate-500">Total investido</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map(tab => (
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

        {/* Conteúdo das tabs */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Dados cadastrais */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Dados Cadastrais</h3>
              <div className="space-y-3">
                {[
                  { label: 'Nome completo', value: patient.name },
                  { label: 'Apelido', value: patient.nickname || '—' },
                  { label: 'Data de nascimento', value: patient.birthDate ? `${formatDate(patient.birthDate)} (${age} anos)` : '—' },
                  { label: 'Sexo', value: patient.gender === 'F' ? 'Feminino' : patient.gender === 'M' ? 'Masculino' : '—' },
                  { label: 'CPF', value: patient.cpf || '—' },
                  { label: 'Telefone', value: formatPhone(patient.phone) },
                  { label: 'E-mail', value: patient.email || '—' },
                  { label: 'Cidade/Estado', value: patient.city ? `${patient.city}/${patient.state}` : '—' },
                  { label: 'Como conheceu', value: patient.referralSource || '—' },
                  { label: 'Cadastro em', value: formatDate(patient.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-xs text-slate-400 flex-shrink-0">{label}</span>
                    <span className="text-xs text-slate-700 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo financeiro */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Resumo Financeiro</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Total gasto</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(patient.totalSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Lançamentos</span>
                  <span className="text-sm text-slate-700">{transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Orçamentos</span>
                  <span className="text-sm text-slate-700">{budgets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Ticket médio</span>
                  <span className="text-sm text-slate-700">
                    {attended > 0 ? formatCurrency(patient.totalSpent / attended) : '—'}
                  </span>
                </div>
                {patient.npsScore && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">NPS</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={i < patient.npsScore! ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                        />
                      ))}
                      <span className="text-sm font-semibold text-slate-800 ml-1">{patient.npsScore}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-800">Histórico de Consultas</h3>
              <button className="btn-primary text-xs gap-1.5"><Calendar size={13} /> Agendar</button>
            </div>
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">Nenhuma consulta registrada</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Profissional</th>
                    <th>Procedimento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td className="font-medium">{apt.startTime.replace('T', ' ').slice(0, 16)}</td>
                      <td>{apt.professionalName}</td>
                      <td>{apt.procedures[0]?.procedureName || '—'}</td>
                      <td>
                        <span className={cn('badge text-xs', getAppointmentStatusColor(apt.status))}>
                          {getAppointmentStatusLabel(apt.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-800">Lançamentos Financeiros</h3>
              <button className="btn-primary text-xs">+ Lançamento</button>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">Nenhum lançamento</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Forma</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.dueDate)}</td>
                      <td>{tx.description}</td>
                      <td>{tx.paymentMethod ? getPaymentMethodLabel(tx.paymentMethod) : '—'}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'budgets' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-800">Orçamentos</h3>
              <button className="btn-primary text-xs">+ Orçamento</button>
            </div>
            {budgets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">Nenhum orçamento</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {budgets.map(b => (
                  <div key={b.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {b.number}{b.title ? ` — ${b.title}` : ''}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(b.createdAt)}</p>
                      </div>
                      <span className={cn(
                        'badge text-xs flex-shrink-0',
                        b.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        b.status === 'followup' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700',
                      )}>
                        {getBudgetStatusLabel(b.status)}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {b.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs text-slate-600">
                          <span>{item.description} (x{item.quantity})</span>
                          <span>{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t border-slate-100 pt-2">
                      <span className="text-slate-500">Total</span>
                      <span className="text-slate-900">{formatCurrency(b.finalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'documents' || activeTab === 'photos' || activeTab === 'anamnesis') && (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              {activeTab === 'photos' ? <Camera size={28} className="text-slate-400" /> :
               activeTab === 'documents' ? <FileText size={28} className="text-slate-400" /> :
               <Activity size={28} className="text-slate-400" />}
            </div>
            <p className="text-slate-500 text-sm font-medium">
              {activeTab === 'photos' ? 'Nenhuma foto registrada' :
               activeTab === 'documents' ? 'Nenhum documento' :
               'Nenhuma anamnese'}
            </p>
            <button className="btn-primary text-xs mt-4">
              + Adicionar {activeTab === 'photos' ? 'Foto' : activeTab === 'documents' ? 'Documento' : 'Anamnese'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
