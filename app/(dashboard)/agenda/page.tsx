'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import {
  ChevronLeft, ChevronRight, Plus, Filter, Search,
  Phone, MessageCircle, CheckCircle2, Clock, X, Info,
} from 'lucide-react'
import {
  MOCK_APPOINTMENTS, MOCK_PROFESSIONALS,
} from '@/lib/mock-data'
import {
  cn, formatTime, formatDate, getAppointmentStatusLabel, getAppointmentStatusColor,
} from '@/lib/utils'
import type { Appointment, AppointmentStatus } from '@/types'

const STATUS_FLOW: AppointmentStatus[] = [
  'SCHEDULED', 'CONFIRMED', 'WAITING', 'IN_PROGRESS', 'ATTENDED',
]

const STATUS_ACTIONS: Record<string, string> = {
  SCHEDULED: 'Confirmar',
  CONFIRMED: 'Em Espera',
  WAITING: 'Iniciar Atendimento',
  IN_PROGRESS: 'Finalizar',
  ATTENDED: '✓ Concluído',
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7) // 07:00 - 19:00

function getAptTop(startTime: string): number {
  const [, time] = startTime.split('T')
  const [h, m] = time.split(':').map(Number)
  return ((h - 7) * 60 + m)
}

function getAptHeight(duration: number): number {
  return duration
}

function AppointmentCard({
  apt, onClick,
}: { apt: Appointment; onClick: (a: Appointment) => void }) {
  const height = Math.max(getAptHeight(apt.duration), 44)

  return (
    <div
      className="absolute left-1 right-1 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow group"
      style={{
        top: `${(getAptTop(apt.startTime) / 60) * 64}px`,
        height: `${(height / 60) * 64}px`,
        backgroundColor: apt.professionalColor + '22',
        borderLeft: `3px solid ${apt.professionalColor}`,
      }}
      onClick={() => onClick(apt)}
    >
      <div className="p-1.5">
        <p className="text-xs font-semibold text-slate-800 leading-none truncate">
          {apt.patientName || apt.title}
        </p>
        {height >= 55 && (
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
            {formatTime(apt.startTime)} — {apt.procedures[0]?.procedureName || apt.type}
          </p>
        )}
        {height >= 70 && (
          <span className={cn('badge text-[9px] mt-1', getAppointmentStatusColor(apt.status))}>
            {getAppointmentStatusLabel(apt.status)}
          </span>
        )}
      </div>
    </div>
  )
}

function AppointmentModal({
  apt, onClose, onStatusChange,
}: {
  apt: Appointment
  onClose: () => void
  onStatusChange: (id: string, s: AppointmentStatus) => void
}) {
  const currentIndex = STATUS_FLOW.indexOf(apt.status as AppointmentStatus)
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIndex + 1]
    : null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">{apt.patientName || 'Consulta'}</h3>
            <p className="text-sm text-slate-500">
              {formatTime(apt.startTime)} — {formatTime(apt.endTime)} · {apt.professionalName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={cn('badge', getAppointmentStatusColor(apt.status))}>
              {getAppointmentStatusLabel(apt.status)}
            </span>
            {apt.isFirstVisit && (
              <span className="badge bg-purple-100 text-purple-700">Primeira Consulta</span>
            )}
            {apt.confirmed && (
              <span className="badge bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={11} className="mr-1" /> Confirmado
              </span>
            )}
          </div>

          {/* Procedimentos */}
          {apt.procedures.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Procedimentos</p>
              <div className="space-y-1">
                {apt.procedures.map(p => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-slate-700">{p.procedureName}</span>
                    <span className="text-slate-500">
                      R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {apt.notes && (
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-600">{apt.notes}</p>
            </div>
          )}

          {/* Ações de contato */}
          {apt.patientPhone && (
            <div className="flex gap-2">
              <a
                href={`tel:${apt.patientPhone}`}
                className="flex-1 btn-secondary text-xs justify-center"
              >
                <Phone size={14} /> Ligar
              </a>
              <a
                href={`https://wa.me/55${apt.patientPhone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-secondary text-xs justify-center"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a href={`/patients/${apt.patientId}`} className="flex-1 btn-secondary text-xs justify-center">
                <Info size={14} /> Prontuário
              </a>
            </div>
          )}
        </div>

        {/* Ações de status */}
        <div className="px-6 pb-5 flex gap-3">
          {nextStatus && apt.status !== 'ATTENDED' && apt.status !== 'ABSENT' && apt.status !== 'CANCELLED' && (
            <button
              onClick={() => { onStatusChange(apt.id, nextStatus); onClose() }}
              className="btn-primary flex-1 justify-center"
            >
              {STATUS_ACTIONS[apt.status]}
            </button>
          )}
          {apt.status !== 'ABSENT' && apt.status !== 'ATTENDED' && apt.status !== 'CANCELLED' && (
            <button
              onClick={() => { onStatusChange(apt.id, 'ABSENT'); onClose() }}
              className="btn-secondary text-red-600 border-red-100 hover:bg-red-50 flex-1 justify-center"
            >
              Registrar Falta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const [selectedDate] = useState(new Date())
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  const [filterProf, setFilterProf] = useState<string>('all')
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status } : a)
    )
  }

  const filteredApts = filterProf === 'all'
    ? appointments
    : appointments.filter(a => a.professionalId === filterProf)

  const aptsByProf = MOCK_PROFESSIONALS.reduce((acc, prof) => {
    acc[prof.id] = filteredApts.filter(a => a.professionalId === prof.id)
    return acc
  }, {} as Record<string, Appointment[]>)

  const professionals = filterProf === 'all'
    ? MOCK_PROFESSIONALS
    : MOCK_PROFESSIONALS.filter(p => p.id === filterProf)

  // Stats do dia
  const total = appointments.length
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length
  const attended = appointments.filter(a => a.status === 'ATTENDED').length
  const absent = appointments.filter(a => a.status === 'ABSENT').length
  const inProgress = appointments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'WAITING').length

  return (
    <div className="h-screen flex flex-col">
      <Header title="Agenda" subtitle={formatDate(selectedDate.toISOString(), "EEEE, dd 'de' MMMM 'de' yyyy")} />

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-wrap">
        {/* Navegação de data */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={16} className="text-slate-500" />
          </button>
          <span className="text-sm font-semibold text-slate-800 min-w-24 text-center">
            {formatDate(selectedDate.toISOString(), "dd/MM/yyyy")}
          </span>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight size={16} className="text-slate-500" />
          </button>
          <button className="btn-secondary text-xs px-3 py-1.5">Hoje</button>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Filtro de profissional */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterProf('all')}
            className={cn('btn text-xs px-3 py-1.5', filterProf === 'all' ? 'btn-primary' : 'btn-secondary')}
          >
            Todos
          </button>
          {MOCK_PROFESSIONALS.map(p => (
            <button
              key={p.id}
              onClick={() => setFilterProf(p.id)}
              className={cn('btn text-xs px-3 py-1.5 gap-1.5', filterProf === p.id ? 'text-white' : 'btn-secondary')}
              style={filterProf === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: filterProf === p.id ? 'white' : p.color }} />
              {p.name.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <button className="btn-primary text-xs gap-1.5">
            <Plus size={14} /> Nova Consulta
          </button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-6 text-xs">
        <span className="text-slate-500">Total: <b className="text-slate-800">{total}</b></span>
        <span className="text-emerald-600">Atendidos: <b>{attended}</b></span>
        <span className="text-purple-600">Em andamento: <b>{inProgress}</b></span>
        <span className="text-blue-600">Confirmados: <b>{confirmed}</b></span>
        <span className="text-red-600">Faltas: <b>{absent}</b></span>
        <span className="text-slate-500 ml-auto">
          Ocupação: <b className="text-slate-800">{total > 0 ? Math.round(((attended + inProgress) / total) * 100) : 0}%</b>
        </span>
      </div>

      {/* Grade da agenda */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-max">
          {/* Coluna de horas */}
          <div className="w-16 flex-shrink-0 bg-white border-r border-slate-200 sticky left-0 z-10">
            <div className="h-10 border-b border-slate-200" />
            {HOURS.map(h => (
              <div key={h} className="h-16 border-b border-slate-100 flex items-start justify-end pr-2 pt-1">
                <span className="text-[10px] text-slate-400">{String(h).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          {/* Colunas dos profissionais */}
          {professionals.map(prof => (
            <div key={prof.id} className="flex-1 min-w-[180px] border-r border-slate-200 last:border-r-0">
              {/* Cabeçalho */}
              <div
                className="h-10 border-b border-slate-200 flex items-center justify-center gap-2 px-3 sticky top-0 z-10 bg-white"
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: prof.color }} />
                <span className="text-xs font-semibold text-slate-700 truncate">{prof.name.split(' ').slice(0, 2).join(' ')}</span>
                <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0">
                  {aptsByProf[prof.id]?.length || 0} cons.
                </span>
              </div>

              {/* Grade de horas */}
              <div className="relative" style={{ height: `${HOURS.length * 64}px` }}>
                {/* Linhas de hora */}
                {HOURS.map(h => (
                  <div key={h} className="absolute left-0 right-0 border-b border-slate-100" style={{ top: `${(h - 7) * 64}px`, height: '64px' }} />
                ))}
                {/* Linha de meia hora */}
                {HOURS.map(h => (
                  <div key={`${h}-half`} className="absolute left-0 right-0 border-b border-dashed border-slate-50" style={{ top: `${(h - 7) * 64 + 32}px` }} />
                ))}

                {/* Appointments */}
                {aptsByProf[prof.id]?.map(apt => (
                  <AppointmentCard key={apt.id} apt={apt} onClick={setSelectedApt} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedApt && (
        <AppointmentModal
          apt={selectedApt}
          onClose={() => setSelectedApt(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
