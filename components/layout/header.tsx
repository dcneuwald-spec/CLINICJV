'use client'

import { Bell, Search } from 'lucide-react'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
}

const NOTIFICATIONS = [
  { id: 1, text: '3 pacientes sem confirmação para amanhã', type: 'warning', time: '5 min' },
  { id: 2, text: 'Roberta Almeida faltou na consulta das 08h', type: 'error',   time: '2h' },
  { id: 3, text: 'Meta de faturamento 85% atingida',           type: 'success', time: '3h' },
]

export function Header({ title, subtitle }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const today = formatDate(new Date().toISOString(), "EEEE, dd 'de' MMMM")

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-30">

      {/* Título */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 leading-none tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
      </div>

      {/* Data */}
      <span className="hidden md:block text-xs text-slate-400 capitalize">{today}</span>

      {/* Busca */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-48">
        <Search size={13} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
        />
      </div>

      {/* Notificações */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Notificações</span>
              <button className="text-xs text-brand-600 hover:underline">Marcar todas como lidas</button>
            </div>
            <div className="divide-y divide-slate-50">
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                    n.type === 'warning' ? 'bg-amber-400' :
                    n.type === 'error'   ? 'bg-red-500'   : 'bg-emerald-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed">{n.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Há {n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <button className="text-xs text-brand-600 hover:underline">Ver todas</button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
