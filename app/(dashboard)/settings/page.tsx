'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import {
  Building2, Bell, CreditCard, Shield, Users, Calendar,
  MessageSquare, FileText, Database, Sliders, Save,
  ChevronRight, Wifi, WifiOff, RefreshCw, Send, CheckCircle2,
  Smartphone, Loader2, AlertTriangle, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SETTING_SECTIONS = [
  { id: 'clinic',         label: 'Clínica',               icon: <Building2 size={16} /> },
  { id: 'schedule',       label: 'Agenda',                 icon: <Calendar size={16} /> },
  { id: 'notifications',  label: 'Notificações',           icon: <Bell size={16} /> },
  { id: 'messages',       label: 'WhatsApp',               icon: <MessageSquare size={16} /> },
  { id: 'financial',      label: 'Financeiro',             icon: <CreditCard size={16} /> },
  { id: 'users',          label: 'Usuários',               icon: <Users size={16} /> },
  { id: 'documents',      label: 'Documentos',             icon: <FileText size={16} /> },
  { id: 'security',       label: 'Segurança',              icon: <Shield size={16} /> },
  { id: 'integrations',   label: 'Integrações',            icon: <Sliders size={16} /> },
  { id: 'data',           label: 'Dados e Backup',         icon: <Database size={16} /> },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-brand-600' : 'bg-slate-200',
      )}
    >
      <div className={cn(
        'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
        checked ? 'left-5' : 'left-1',
      )} />
    </button>
  )
}

// ──────────────────────────────────────────────────
// Painel de conexão WhatsApp
// ──────────────────────────────────────────────────

function WhatsAppPanel() {
  const [status, setStatus]       = useState<any>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [testPhone, setTestPhone] = useState('')
  const [testMsg, setTestMsg]     = useState('Olá! Esta é uma mensagem de teste do ClinicJV. ✅')
  const [sending, setSending]     = useState(false)
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [triggeringReminders, setTriggeringReminders] = useState(false)
  const [reminderResult, setReminderResult] = useState<any>(null)

  const fetchStatus = useCallback(async () => {
    setLoadingStatus(true)
    try {
      const res  = await fetch('/api/whatsapp/status')
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus({ connected: false, error: 'Falha ao consultar status' })
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    // Se desconectado, repoleia a cada 8s para detectar quando o QR for escaneado
    const interval = setInterval(() => {
      if (!status?.connected) fetchStatus()
    }, 8000)
    return () => clearInterval(interval)
  }, [fetchStatus, status?.connected])

  const handleSendTest = async () => {
    if (!testPhone.trim()) return
    setSending(true)
    setSendResult(null)
    try {
      const res  = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, message: testMsg }),
      })
      const data = await res.json()
      setSendResult({ ok: data.success, msg: data.success ? 'Mensagem enviada com sucesso!' : (data.error ?? 'Erro ao enviar') })
    } finally {
      setSending(false)
    }
  }

  const handleRunReminders = async () => {
    setTriggeringReminders(true)
    setReminderResult(null)
    try {
      const res  = await fetch('/api/whatsapp/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      setReminderResult(data)
    } finally {
      setTriggeringReminders(false)
    }
  }

  const providerLabels: Record<string, string> = {
    zapi:      'Z-API',
    evolution: 'Evolution API',
    meta:      'Meta Business API',
  }
  const providerLabel = providerLabels[status?.provider ?? 'zapi'] ?? status?.provider ?? '—'

  return (
    <div className="space-y-6">
      <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">
        Conexão WhatsApp
      </h3>

      {/* Status da conexão */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {loadingStatus ? (
              <Loader2 size={18} className="text-slate-400 animate-spin" />
            ) : status?.connected ? (
              <Wifi size={18} className="text-emerald-500" />
            ) : (
              <WifiOff size={18} className="text-red-400" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {loadingStatus ? 'Verificando...' : status?.connected ? 'Conectado' : 'Desconectado'}
              </p>
              <p className="text-xs text-slate-400">
                Provedor: <span className="font-medium">{providerLabel}</span>
                {status?.instance && ` · ${status.instance}`}
              </p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loadingStatus}
            className="btn-secondary text-xs gap-1.5"
          >
            <RefreshCw size={13} className={loadingStatus ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* QR Code — exibido quando desconectado e disponível */}
        {!status?.connected && status?.qrCode && (
          <div className="p-6 text-center border-b border-slate-200 bg-white">
            <p className="text-sm font-semibold text-slate-800 mb-1">Escaneie o QR Code</p>
            <p className="text-xs text-slate-400 mb-4">
              Abra o WhatsApp no celular → Dispositivos conectados → Conectar dispositivo
            </p>
            <div className="inline-block p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
              {/* QR code base64 retornado pelo Z-API / Evolution */}
              {status.qrCode.startsWith('data:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={status.qrCode} alt="QR Code WhatsApp" className="w-52 h-52" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:image/png;base64,${status.qrCode}`} alt="QR Code WhatsApp" className="w-52 h-52" />
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">
              O QR Code atualiza automaticamente a cada 8 segundos
            </p>
          </div>
        )}

        {/* Sem credenciais configuradas */}
        {!status?.connected && !status?.qrCode && !loadingStatus && (
          <div className="p-6 text-center bg-white border-b border-slate-200">
            <AlertTriangle size={28} className="text-amber-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 mb-1">Credenciais não configuradas</p>
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Configure as variáveis de ambiente do provedor escolhido no servidor.
              {status?.error && <span className="block mt-1 text-red-500">{status.error}</span>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
              {[
                {
                  name: 'Z-API',
                  desc: 'Conecte qualquer número via QR Code. Plano gratuito disponível.',
                  vars: ['ZAPI_INSTANCE_ID', 'ZAPI_TOKEN'],
                },
                {
                  name: 'Evolution API',
                  desc: 'Open source, pode hospedar no próprio servidor.',
                  vars: ['EVOLUTION_API_URL', 'EVOLUTION_API_KEY', 'EVOLUTION_INSTANCE'],
                },
                {
                  name: 'Meta Business',
                  desc: 'API oficial do WhatsApp para empresas verificadas.',
                  vars: ['META_WHATSAPP_TOKEN', 'META_PHONE_NUMBER_ID'],
                },
              ].map(p => (
                <div key={p.name} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-800 mb-1">{p.name}</p>
                  <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">{p.desc}</p>
                  {p.vars.map(v => (
                    <code key={v} className="block text-[10px] font-mono text-brand-700 bg-brand-50 rounded px-1.5 py-0.5 mb-0.5">
                      {v}
                    </code>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Número conectado */}
        {status?.connected && (
          <div className="p-4 bg-emerald-50 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">WhatsApp conectado com sucesso!</p>
              {status.instance && (
                <p className="text-xs text-emerald-600">Número: {status.instance}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Envio de mensagem de teste */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Testar envio</h4>
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={testPhone}
            onChange={e => setTestPhone(e.target.value)}
            className="input flex-1"
          />
        </div>
        <textarea
          rows={3}
          value={testMsg}
          onChange={e => setTestMsg(e.target.value)}
          className="input resize-none"
          placeholder="Mensagem de teste..."
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSendTest}
            disabled={sending || !testPhone.trim()}
            className="btn-primary gap-2 disabled:opacity-50"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? 'Enviando...' : 'Enviar teste'}
          </button>
          {sendResult && (
            <span className={cn('text-sm flex items-center gap-1.5', sendResult.ok ? 'text-emerald-600' : 'text-red-600')}>
              {sendResult.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {sendResult.msg}
            </span>
          )}
        </div>
      </div>

      {/* Disparo manual de lembretes */}
      <div className="rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Lembretes Automáticos</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Processa confirmações e lembretes para consultas na janela configurada.
              Normalmente acionado pelo agendador (Vercel Cron / n8n / make.com).
            </p>
          </div>
          <button
            onClick={handleRunReminders}
            disabled={triggeringReminders}
            className="btn-secondary text-xs gap-1.5 flex-shrink-0"
          >
            {triggeringReminders
              ? <><Loader2 size={13} className="animate-spin" /> Processando...</>
              : <><Smartphone size={13} /> Executar agora</>}
          </button>
        </div>

        {reminderResult && (
          <div className={cn(
            'rounded-lg px-4 py-3 text-sm',
            reminderResult.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700',
          )}>
            <p className="font-medium mb-1">
              {reminderResult.ok ? '✅ Processado com sucesso' : '❌ Erro ao processar'}
            </p>
            {reminderResult.ok && (
              <p className="text-xs">
                {reminderResult.processed} consulta(s) verificadas ·{' '}
                <span className="font-semibold text-emerald-700">{reminderResult.sent} enviadas</span>
                {reminderResult.failed > 0 && (
                  <span className="text-amber-600"> · {reminderResult.failed} falharam</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Configuração WHATSAPP_PROVIDER */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Provedor ativo</p>
        <p className="text-sm text-slate-700">
          Definido pela variável de ambiente{' '}
          <code className="font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5 text-brand-700 text-xs">
            WHATSAPP_PROVIDER
          </code>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Valores aceitos: <code className="font-mono">zapi</code> · <code className="font-mono">evolution</code> · <code className="font-mono">meta</code>
        </p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────
// Página principal de configurações
// ──────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('clinic')
  const [settings, setSettings] = useState({
    clinicName:      'Clínica Estética Bella Vita',
    tradeName:       'Bella Vita',
    phone:           '(11) 3456-7890',
    email:           'contato@bellavita.com.br',
    specialty:       'estética',
    confirmChannel:  'whatsapp',
    confirmHours:    '24',
    alertHours:      '2',
    whatsappEnabled: true,
    smsEnabled:      false,
    emailEnabled:    true,
    autoConfirm:     true,
    autoReminder:    true,
    invoiceEnabled:  false,
    pixEnabled:      true,
    cardEnabled:     true,
    twoFactor:       false,
    auditLog:        true,
  })

  const update = (key: string, value: string | boolean) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  return (
    <div className="animate-fade-in">
      <Header title="Configurações" subtitle="Personalize o sistema para sua clínica" />

      <div className="p-6 flex gap-5">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 space-y-0.5">
          {SETTING_SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left',
                activeSection === s.id
                  ? 'bg-brand-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <span className="flex-shrink-0">{s.icon}</span>
              <span className="font-medium">{s.label}</span>
              <ChevronRight size={13} className="ml-auto opacity-40" />
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="card p-6 space-y-6">

            {/* Clínica */}
            {activeSection === 'clinic' && (
              <>
                <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Dados da Clínica</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'clinicName', label: 'Nome da Clínica', type: 'text' },
                    { key: 'tradeName',  label: 'Nome Fantasia',    type: 'text' },
                    { key: 'phone',      label: 'Telefone',         type: 'text' },
                    { key: 'email',      label: 'E-mail',           type: 'email' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        value={settings[f.key as keyof typeof settings] as string}
                        onChange={e => update(f.key, e.target.value)}
                        className="input"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Especialidade</label>
                    <select
                      value={settings.specialty}
                      onChange={e => update('specialty', e.target.value)}
                      className="input"
                    >
                      <option value="estética">Estética</option>
                      <option value="odontologia">Odontologia</option>
                      <option value="fisioterapia">Fisioterapia</option>
                      <option value="psicologia">Psicologia</option>
                      <option value="nutrição">Nutrição</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Notificações */}
            {activeSection === 'notifications' && (
              <>
                <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Notificações e Lembretes</h3>
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Canais Ativos</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'whatsappEnabled', label: 'WhatsApp', desc: 'Envio via WhatsApp Business (ver aba WhatsApp)' },
                        { key: 'smsEnabled',      label: 'SMS',      desc: 'Envio via operadora (em breve)' },
                        { key: 'emailEnabled',    label: 'E-mail',   desc: 'Envio via SMTP configurado' },
                      ].map(c => (
                        <div key={c.key} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{c.label}</p>
                            <p className="text-xs text-slate-400">{c.desc}</p>
                          </div>
                          <Toggle checked={settings[c.key as keyof typeof settings] as boolean} onChange={v => update(c.key, v)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Automações</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'autoConfirm',  label: 'Confirmação automática', desc: 'Envia confirmação X horas antes da consulta' },
                        { key: 'autoReminder', label: 'Lembrete automático',    desc: 'Envia lembrete Y horas antes da consulta' },
                      ].map(a => (
                        <div key={a.key} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{a.label}</p>
                            <p className="text-xs text-slate-400">{a.desc}</p>
                          </div>
                          <Toggle checked={settings[a.key as keyof typeof settings] as boolean} onChange={v => update(a.key, v)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                        Confirmar consulta (horas antes)
                      </label>
                      <input type="number" min="1" max="72" value={settings.confirmHours} onChange={e => update('confirmHours', e.target.value)} className="input" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                        Lembrete (horas antes)
                      </label>
                      <input type="number" min="1" max="24" value={settings.alertHours} onChange={e => update('alertHours', e.target.value)} className="input" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* WhatsApp */}
            {activeSection === 'messages' && <WhatsAppPanel />}

            {/* Segurança */}
            {activeSection === 'security' && (
              <>
                <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Segurança</h3>
                <div className="space-y-4">
                  {[
                    { key: 'twoFactor', label: 'Autenticação em dois fatores', desc: 'Exigir 2FA para todos os usuários' },
                    { key: 'auditLog',  label: 'Log de auditoria',             desc: 'Registrar todas as ações do sistema' },
                  ].map(s => (
                    <div key={s.key} className="flex items-center justify-between py-3 border-b border-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{s.label}</p>
                        <p className="text-xs text-slate-400">{s.desc}</p>
                      </div>
                      <Toggle checked={settings[s.key as keyof typeof settings] as boolean} onChange={v => update(s.key, v)} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Seções ainda não implementadas */}
            {!['clinic', 'notifications', 'messages', 'security'].includes(activeSection) && (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Sliders size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  {SETTING_SECTIONS.find(s => s.id === activeSection)?.label}
                </p>
                <p className="text-xs text-slate-400">Configurações disponíveis em breve</p>
              </div>
            )}

            {/* Botão Salvar */}
            {['clinic', 'notifications', 'security'].includes(activeSection) && (
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="btn-primary gap-2">
                  <Save size={14} /> Salvar Alterações
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
