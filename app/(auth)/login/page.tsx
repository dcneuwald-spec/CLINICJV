'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, Heart } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('consultor@clinicjv.com.br')
  const [password, setPassword] = useState('demo123')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">CJ</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ClinicJV</h1>
          <p className="text-slate-400 mt-1 text-sm">Sistema Inteligente de Gestão de Clínicas</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Bem-vindo de volta</h2>
          <p className="text-slate-500 text-sm mb-6">Faça login para acessar o sistema</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">E-mail</label>
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
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Senha</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-brand-600" defaultChecked />
                Lembrar-me
              </label>
              <a href="#" className="text-sm text-brand-600 hover:underline">Esqueceu a senha?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={16} /> Entrar no Sistema
                </span>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-3 bg-brand-50 rounded-xl border border-brand-100">
            <p className="text-xs font-semibold text-brand-700 mb-1">Demo — Credenciais de Acesso</p>
            <p className="text-xs text-brand-600">E-mail: consultor@clinicjv.com.br</p>
            <p className="text-xs text-brand-600">Senha: demo123</p>
          </div>

          {/* Roles */}
          <div className="mt-4 space-y-1">
            <p className="text-xs text-slate-400 text-center mb-2">Ou acesse como:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Admin', email: 'admin@clinicjv.com.br' },
                { role: 'Gestor', email: 'gestor@clinicjv.com.br' },
                { role: 'Profissional', email: 'profissional@clinicjv.com.br' },
                { role: 'Recepcionista', email: 'recepcao@clinicjv.com.br' },
              ].map(r => (
                <button
                  key={r.role}
                  onClick={() => setEmail(r.email)}
                  className="text-xs text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                >
                  {r.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2025 ClinicJV · Sistema Inteligente de Gestão de Clínicas
        </p>
      </div>
    </div>
  )
}
