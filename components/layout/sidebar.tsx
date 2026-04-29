'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard, Calendar, Users, DollarSign, BarChart3,
  MessageSquare, Megaphone, Heart, TrendingUp, Target,
  Settings, LogOut, Building2, ClipboardList,
  Star, Stethoscope, ChevronDown, ChevronRight, Inbox, PieChart,
} from 'lucide-react'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

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
      { href: '/dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={16} /> },
      { href: '/agenda',    label: 'Agenda',     icon: <Calendar size={16} /> },
      { href: '/patients',  label: 'Pacientes',  icon: <Users size={16} /> },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/financial', label: 'Financeiro',  icon: <DollarSign size={16} /> },
      { href: '/budgets',   label: 'Orçamentos',  icon: <ClipboardList size={16} /> },
    ],
  },
  {
    label: 'Relacionamento',
    items: [
      { href: '/crc',           label: 'CRC — Relacionamento', icon: <MessageSquare size={16} /> },
      { href: '/crm',           label: 'CRM — Captação',       icon: <Megaphone size={16} /> },
      { href: '/crm/contacts',  label: 'Caixa de Entrada',     icon: <Inbox size={16} /> },
    ],
  },
  {
    label: 'Inteligência',
    items: [
      { href: '/gerencial',    label: 'Gerencial',      icon: <PieChart size={16} /> },
      { href: '/health-score', label: 'Score de Saúde', icon: <Heart size={16} /> },
      { href: '/reports',      label: 'Relatórios',     icon: <BarChart3 size={16} /> },
      { href: '/goals',        label: 'Metas',          icon: <Target size={16} /> },
    ],
  },
  {
    label: 'Consultoria',
    items: [
      { href: '/consultant',   label: 'Portal do Consultor', icon: <Star size={16} /> },
      { href: '/action-plans', label: 'Planos de Ação',      icon: <TrendingUp size={16} /> },
    ],
  },
  {
    label: 'Configuração',
    items: [
      { href: '/professionals', label: 'Profissionais',  icon: <Stethoscope size={16} /> },
      { href: '/settings',      label: 'Configurações',  icon: <Settings size={16} /> },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleGroup = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }))

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const userName  = session?.user?.name ?? 'Usuário'
  const userRole  = (session?.user as any)?.role ?? ''
  const roleLabel: Record<string, string> = {
    ADMIN: 'Administrador', CONSULTANT: 'Consultor', MANAGER: 'Gestor',
    PROFESSIONAL: 'Profissional', RECEPTIONIST: 'Recepção',
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-sidebar flex flex-col z-40 overflow-hidden border-r border-white/5">

      {/* Logotipo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs tracking-wider">CJ</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none tracking-tight">ClinicJV</p>
          <p className="text-slate-500 text-[10px] mt-0.5 tracking-wide uppercase">Gestão Inteligente</p>
        </div>
      </div>

      {/* Clínica ativa */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Building2 size={12} className="text-slate-600 flex-shrink-0" />
          <span className="text-slate-400 text-xs truncate flex-1">
            {(session?.user as any)?.clinicName ?? 'Clínica'}
          </span>
          <ChevronDown size={11} className="text-slate-600 flex-shrink-0" />
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-1">
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-slate-600 hover:text-slate-400 transition-colors"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest">{group.label}</span>
              {collapsed[group.label]
                ? <ChevronRight size={10} />
                : <ChevronDown size={10} />}
            </button>

            {!collapsed[group.label] && (
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link key={item.href} href={item.href}>
                    <span className={cn('sidebar-item', isActive(item.href) && 'active')}>
                      <span className="flex-shrink-0 opacity-80">{item.icon}</span>
                      <span className="flex-1 text-[13px]">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">{getInitials(userName)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-xs font-medium truncate leading-none">{userName}</p>
            <p className="text-slate-500 text-[10px] mt-0.5 truncate">{roleLabel[userRole] ?? userRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-600 hover:text-slate-300 transition-colors p-1"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
