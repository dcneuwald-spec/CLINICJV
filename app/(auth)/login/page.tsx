'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, Star, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Profile = 'consultor' | 'cliente'

const PROFILES = {
  consultor: {
    label: 'Consultor JV',
    description: 'Acesso completo ao painel de gestão e metodologia de consultoria',
    icon: Star,
    email: 'consultor@clinicjv.com.br',
    color: 'brand',
  },
  cliente: {
    label: 'Cliente JV',
    description: 'Acesso ao seu painel de acompanhamento e ferramentas de gestão',
    icon: Building2,
    email: 'cliente@clinicjv.com.br',
    color: 'emerald',
  },
} as const

export default function LoginPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>('consultor')
  const [email, setEmail]     = useState('consultor@clinicjv.com.br')
  const [password, setPassword] = useState('demo123')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const selectProfile = (p: Profile) => {
    setProfile(p)
    setEmail(PROFILES[p].email)
    setPassword('demo123')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
    } else {
      router.push('/consultoria')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo — branding ─────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] bg-slate-900 p-12 flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm tracking-wider">JV</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg tracking-tight leading-none">Consultoria JV</p>
              <p className="text-slate-500 text-xs tracking-wide mt-0.5">Sistema de Gestão Estratégica</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            Metodologia<br />
            <span className="text-brand-400">JV</span> de Gestão
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Ferramenta exclusiva para acompanhamento da metodologia de consultoria — base de estudo, plano financeiro e relatório gerencial.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-5">
          {[
            { icon: '📊', label: 'Base de Estudo', desc: 'Diagnóstico histórico e projeções' },
            { icon: '💰', label: 'Plano Financeiro', desc: 'Previsto × Realizado por categoria' },
            { icon: '📈', label: 'Gerencial', desc: 'Acompanhamento diário de métricas' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-slate-200 text-sm font-medium">{f.label}</p>
                <p className="text-slate-500 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-slate-600 text-xs">© 2026 Consultoria JV · Todos os direitos reservados</p>
      </div>

      {/* ── Painel direito — formulário ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">JV</span>
            </div>
            <span className="text-slate-900 font-bold text-lg">Consultoria JV</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Bem-vindo</h1>
          <p className="text-slate-500 text-sm mb-8">Selecione seu perfil de acesso</p>

          {/* ── Seleção de perfil ─────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {(Object.entries(PROFILES) as [Profile, typeof PROFILES[Profile]][]).map(([key, p]) => {
              const Icon    = p.icon
              const active  = profile === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectProfile(key)}
                  className={cn(
                    'relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all duration-150',
                    active
                      ? 'border-brand-600 bg-brand-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                  )}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold leading-none mb-1', active ? 'text-brand-700' : 'text-slate-700')}>
                      {p.label}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug">{p.description}</p>
                  </div>
                  {active && (
                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Formulário ─────────────────────────────────────── */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  Entrar como {PROFILES[profile].label}
                </>
              )}
            </button>
          </form>

          {/* Demo info */}
          <div className="mt-6 p-3.5 bg-white border border-slate-200 rounded-xl">
            <p className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Acesso demonstração</span> — senha:{' '}
              <span className="font-mono font-semibold text-slate-800">demo123</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Consultor JV: consultor@clinicjv.com.br · Cliente JV: cliente@clinicjv.com.br
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
