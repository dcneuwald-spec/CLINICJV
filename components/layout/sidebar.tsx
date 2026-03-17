'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calendar, Users, DollarSign, BarChart3,
  MessageSquare, Megaphone, Heart, TrendingUp, Target,
  UserCheck, Settings, LogOut, Building2, ClipboardList,
  Star, Stethoscope, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

interface NavGroup {
  label: string
  items: NavItem[]
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operacional',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { href: '/agenda', label: 'Agenda', icon: <Calendar size={18} /> },
      { href: '/patients', label: 'Pacientes', icon: <Users size={18} /> },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/financial', label: 'Financeiro', icon: <DollarSign size={18} /> },
      { href: '/budgets', label: 'Orçamentos', icon: <ClipboardList size={18} /> },
    ],
  },
  {
    label: 'Relacionamento',
    items: [
      { href: '/crc', label: 'CRC — Relacionamento', icon: <MessageSquare size={18} />, badge: 3 },
      { href: '/crm', label: 'CRM — Captação', icon: <Megaphone size={18} /> },
    ],
  },
  {
    label: 'Inteligência',
    items: [
      { href: '/health-score', label: 'Score de Saúde', icon: <Heart size={18} /> },
      { href: '/reports', label: 'Relatórios', icon: <BarChart3 size={18} /> },
      { href: '/goals', label: 'Metas', icon: <Target size={18} /> },
    ],
  },
  {
    label: 'Consultoria',
    items: [
      { href: '/consultant', label: 'Portal do Consultor', icon: <Star size={18} /> },
      { href: '/action-plans', label: 'Planos de Ação', icon: <TrendingUp size={18} /> },
    ],
  },
  {
    label: 'Configuração',
    items: [
      { href: '/professionals', label: 'Profissionais', icon: <Stethoscope size={18} /> },
      { href: '/settings', label: 'Configurações', icon: <Settings size={18} /> },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleGroup = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-sidebar flex flex-col z-40 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">CJ</span>
        </div>
        <div>
          <p className="text-white font-bold text-base leading-none">ClinicJV</p>
          <p className="text-slate-400 text-xs mt-0.5">Gestão Inteligente</p>
        </div>
      </div>

      {/* Clínica ativa */}
      <div className="px-4 py-3 border-b border-white/10">
        <button className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 rounded-md bg-brand-600/30 flex items-center justify-center flex-shrink-0">
            <Building2 size={13} className="text-brand-400" />
          </div>
          <span className="text-slate-300 text-xs font-medium truncate flex-1">Bella Vita Estética</span>
          <ChevronDown size={13} className="text-slate-500 flex-shrink-0" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-2">
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-slate-500 hover:text-slate-400 transition-colors"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider">{group.label}</span>
              {collapsed[group.label]
                ? <ChevronRight size={12} />
                : <ChevronDown size={12} />}
            </button>

            {!collapsed[group.label] && (
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link key={item.href} href={item.href}>
                    <span className={cn(
                      'sidebar-item',
                      isActive(item.href) && 'active',
                    )}>
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Usuário */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">JV</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">João Vieira</p>
            <p className="text-slate-500 text-[10px] truncate">Consultor</p>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors" title="Sair">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
