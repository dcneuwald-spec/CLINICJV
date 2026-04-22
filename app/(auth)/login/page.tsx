'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'

const QUICK_ACCESS = [
  { role: 'Consultor',  email: 'consultor@clinicjv.com.br' },
  { role: 'Admin',      email: 'admin@clinicjv.com.br' },
  { role: 'Gestor',     email: 'gestor@clinicjv.com.br' },
  { role: 'Recepção',   email: 'recepcao@clinicjv.com.br' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('consultor@clinicjv.com.br')
  const [password, setPassword] = useState('demo123')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">

      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-slate-900 border-r border-white/5 p-12 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CJ</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">ClinicJV</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Gestão inteligente<br />para clínicas modernas
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Controle agenda, finanças, pacientes e desempenho da sua equipe em um único lugar.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: '📅', label: 'Agenda inteligente com visão por profissional' },
            { icon: '💰', label: 'Financeiro completo com contas a receber' },
            { icon: '📊', label: 'Score de saúde e metas em tempo real' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="text-lg">{f.icon}</span>
              <span className="text-slate-400 text-sm">{f.label}</span>
            </div>
          ))}
        </div>

        <p className="text-slate-600 text-xs">© 2025 ClinicJV · Todos os direitos reservados</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CJ</span>
            </div>
            <span className="text-slate-900 font-semibold text-lg">ClinicJV</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Entrar na conta</h1>
          <p className="text-slate-500 text-sm mb-8">Acesse o sistema de gestão da sua clínica</p>

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
              className="btn-primary w-full justify-center py-2.5 text-sm mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={15} /> Entrar no sistema
                </>
              )}
            </button>
          </form>

          {/* Acesso rápido demo */}
          <div className="mt-8 p-4 bg-white border border-slate-200 rounded-xl">
            <p className="text-xs font-semibold text-slate-700 mb-3">Acesso rápido — demonstração</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACCESS.map(r => (
                <button
                  key={r.role}
                  onClick={() => { setEmail(r.email); setPassword('demo123') }}
                  className="text-xs text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors font-medium"
                >
                  {r.role}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2.5">Senha: <span className="font-mono font-semibold">demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
