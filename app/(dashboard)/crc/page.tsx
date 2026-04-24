'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import {
  MessageCircle, Users, CalendarX, UserMinus, AlertCircle,
  Gift, Play, CheckCircle2, X, Loader2, WifiOff, Send,
} from 'lucide-react'
import { cn, formatPhone, getInitials } from '@/lib/utils'

interface CRCPatient {
  id: string
  name: string
  phone: string
  whatsapp: string | null
}

interface CRCData {
  unconfirmed: CRCPatient[]
  birthdays:   CRCPatient[]
  absent:      CRCPatient[]
  firstAbsent: CRCPatient[]
  inactive:    CRCPatient[]
  debt:        CRCPatient[]
}

interface Category {
  id:          string
  label:       string
  description: string
  icon:        React.ReactNode
  color:       string
  bgColor:     string
  patients:    CRCPatient[]
  template:    string
}

function buildCategories(data: CRCData, month: string): Category[] {
  return [
    {
      id: 'unconfirmed',
      label: 'Sem Confirmação',
      description: 'Agendamentos de hoje/amanhã sem confirmação',
      icon: <CalendarX size={20} />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      patients: data.unconfirmed,
      template: 'Olá *{nome}*! 🦷 Confirmando sua consulta para amanhã. Por favor, responda *SIM* para confirmar ou *NÃO* para cancelar.',
    },
    {
      id: 'birthdays',
      label: 'Aniversariantes',
      description: `Pacientes com aniversário em ${month}`,
      icon: <Gift size={20} />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      patients: data.birthdays,
      template: '🎂 *Feliz Aniversário, {nome}!*\n\nToda a equipe da clínica deseja um dia especial! 🎉 Como presente, preparamos *15% de desconto* no seu próximo procedimento. Válido por 30 dias! ✨',
    },
    {
      id: 'absent',
      label: 'Faltas',
      description: 'Pacientes que faltaram nos últimos 30 dias',
      icon: <UserMinus size={20} />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      patients: data.absent,
      template: 'Olá *{nome}*! 😔 Notamos que você não pôde comparecer à sua consulta. Podemos reagendar? Basta responder essa mensagem! 🦷',
    },
    {
      id: 'first-absent',
      label: 'Falta — 1ª Consulta',
      description: 'Alto risco de perda — nunca retornaram',
      icon: <AlertCircle size={20} />,
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      patients: data.firstAbsent,
      template: 'Olá *{nome}*! Ficamos preocupados com sua ausência. Era sua *primeira consulta* conosco e adoraríamos te conhecer. Podemos remarcar sem custo algum. Aguardamos seu contato! 🦷',
    },
    {
      id: 'inactive',
      label: 'Reativação',
      description: 'Sem visita há mais de 60 dias',
      icon: <Users size={20} />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      patients: data.inactive,
      template: 'Olá *{nome}*! 😊 Sentimos sua falta! Faz um tempo que não te vemos. Que tal agendar uma consulta? Temos novidades te esperando! Basta responder essa mensagem. 🦷',
    },
    {
      id: 'debt',
      label: 'Inadimplência',
      description: 'Pacientes com valores vencidos',
      icon: <AlertCircle size={20} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      patients: data.debt,
      template: 'Olá *{nome}*! Identificamos um valor em aberto em sua conta. Gostaríamos de resolver isso para você. Entre em contato conosco! 😊',
    },
  ]
}

// ─────────────────────────────────────────────────
// Modal de campanha
// ─────────────────────────────────────────────────

function CampaignModal({
  category, onClose,
}: {
  category: Category
  onClose: () => void
}) {
  const [messageType, setMessageType] = useState('whatsapp')
  const [message, setMessage]         = useState(category.template)
  const [sending, setSending]         = useState(false)
  const [result, setResult]           = useState<{
    ok: boolean; sent?: number; failed?: number; total?: number; warning?: string
  } | null>(null)

  const dispatch = async () => {
    setSending(true)
    try {
      const res  = await fetch('/api/whatsapp/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          messageType,
          customMessage: message !== category.template ? message : undefined,
        }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ ok: false })
    } finally {
      setSending(false)
    }
  }

  // Tela de resultado
  if (result) {
    const allFailed = result.ok && result.sent === 0 && (result.failed ?? 0) > 0
    const hasWarning = !!result.warning
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center animate-slide-up shadow-2xl">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
            result.ok && !allFailed ? 'bg-emerald-100' : 'bg-amber-100',
          )}>
            {result.ok && !allFailed
              ? <CheckCircle2 size={32} className="text-emerald-500" />
              : <WifiOff size={28} className="text-amber-500" />}
          </div>

          {hasWarning ? (
            <>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Canal não disponível</h3>
              <p className="text-slate-500 text-sm mb-6">{result.warning}</p>
            </>
          ) : result.ok ? (
            <>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Campanha disparada!</h3>
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{result.sent}</p>
                  <p className="text-xs text-slate-400">enviadas</p>
                </div>
                {(result.failed ?? 0) > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{result.failed}</p>
                    <p className="text-xs text-slate-400">falharam</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-700">{result.total}</p>
                  <p className="text-xs text-slate-400">total</p>
                </div>
              </div>
              {(result.failed ?? 0) > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                  Falhas geralmente indicam pacientes sem número de WhatsApp cadastrado ou problemas de conexão.
                </p>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Erro ao disparar</h3>
              <p className="text-slate-500 text-sm mb-4">
                Verifique a conexão do WhatsApp em Configurações → WhatsApp.
              </p>
            </>
          )}

          <button onClick={onClose} className="btn-primary w-full justify-center">Fechar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', category.bgColor, category.color)}>
              {category.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{category.label}</h3>
              <p className="text-xs text-slate-500">{category.patients.length} paciente(s)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Canal */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Canal de envio</p>
            <div className="flex gap-2">
              {[
                { id: 'whatsapp', label: '💬 WhatsApp' },
                { id: 'sms',     label: '📱 SMS' },
                { id: 'email',   label: '📧 E-mail' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setMessageType(c.id)}
                  className={cn(
                    'btn text-xs px-3 py-1.5',
                    messageType === c.id ? 'btn-primary' : 'btn-secondary',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {messageType !== 'whatsapp' && (
              <p className="text-[10px] text-amber-600 mt-1.5">
                ⚠ Apenas WhatsApp está integrado. SMS e E-mail estarão disponíveis em breve.
              </p>
            )}
          </div>

          {/* Mensagem editável */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Mensagem</p>
            <textarea
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="input resize-none text-sm leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Use <code className="font-mono bg-slate-100 px-1 rounded">{'{nome}'}</code> para inserir o nome do paciente.
            </p>
          </div>

          {/* Lista de pacientes */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Destinatários ({category.patients.length})
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 p-2">
              {category.patients.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Nenhum paciente nesta categoria</p>
              ) : (
                category.patients.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-xs text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-50">
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-700 text-[9px] font-bold">{getInitials(p.name)}</span>
                    </div>
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-slate-400 flex-shrink-0">{formatPhone(p.whatsapp ?? p.phone)}</span>
                    {!p.whatsapp && (
                      <span className="text-amber-500 text-[9px] font-medium">sem WhatsApp</span>
                    )}
                  </div>
                ))
              )}
            </div>
            {category.patients.filter(p => !p.whatsapp).length > 0 && (
              <p className="text-[10px] text-amber-600 mt-1">
                {category.patients.filter(p => !p.whatsapp).length} paciente(s) sem WhatsApp — receberão via telefone principal.
              </p>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button
            onClick={dispatch}
            disabled={sending || category.patients.length === 0}
            className="btn-primary flex-1 justify-center gap-2 disabled:opacity-50"
          >
            {sending
              ? <><Loader2 size={14} className="animate-spin" /> Enviando...</>
              : <><Send size={14} /> Disparar Campanha</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Página principal CRC
// ─────────────────────────────────────────────────

export default function CRCPage() {
  const [data, setData]               = useState<CRCData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [activeCategory, setActive]   = useState<Category | null>(null)

  useEffect(() => {
    fetch('/api/crc')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const monthName = new Date().toLocaleString('pt-BR', { month: 'long' })
  const categories = data ? buildCategories(data, monthName) : []
  const totalNeedAttention = categories.reduce((s, c) => s + c.patients.length, 0)

  return (
    <div className="animate-fade-in">
      <Header title="CRC — Central de Relacionamento" subtitle="Reengajamento proativo de pacientes" />

      <div className="p-6 space-y-5">

        {/* Banner */}
        <div className="card p-5 bg-gradient-to-r from-brand-700 to-brand-800 text-white border-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg">Central de Relacionamento</h3>
              <p className="text-brand-200 text-sm mt-1">
                Identifique oportunidades e automatize o reengajamento com seus pacientes via WhatsApp
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {loading ? (
                <Loader2 size={24} className="text-brand-300 animate-spin" />
              ) : (
                <>
                  <p className="text-3xl font-bold">{totalNeedAttention}</p>
                  <p className="text-brand-200 text-xs">pacientes precisam de atenção</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cards de categorias */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 h-48 animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', cat.bgColor, cat.color)}>
                    {cat.icon}
                  </div>
                  <span className={cn(
                    'text-2xl font-bold tracking-tight',
                    cat.patients.length > 0 ? cat.color : 'text-slate-200',
                  )}>
                    {cat.patients.length}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">{cat.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{cat.description}</p>
                </div>

                {cat.patients.length > 0 && (
                  <div className="space-y-1.5">
                    {cat.patients.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center gap-2 text-xs text-slate-600">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-slate-500">{getInitials(p.name)}</span>
                        </div>
                        <span className="truncate">{p.name}</span>
                      </div>
                    ))}
                    {cat.patients.length > 3 && (
                      <p className="text-[10px] text-slate-400 pl-7">+{cat.patients.length - 3} mais</p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setActive(cat)}
                  disabled={cat.patients.length === 0}
                  className={cn(
                    'btn text-xs justify-center gap-2 mt-auto',
                    cat.patients.length > 0 ? 'btn-primary' : 'btn-secondary opacity-40 cursor-not-allowed',
                  )}
                >
                  {cat.patients.length > 0
                    ? <><Play size={12} /> Ativar Campanha</>
                    : <><CheckCircle2 size={12} /> Sem pacientes</>}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dica do sistema */}
        <div className="card p-5 border-l-4 border-brand-500">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageCircle size={16} className="text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">💡 Recomendação do Sistema</p>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Configure a conexão WhatsApp em <strong>Configurações → WhatsApp</strong> para habilitar o
                disparo automático de campanhas e lembretes. Clínicas que utilizam reengajamento semanal
                registram até <strong>45% menos faltas</strong> e recuperam receita de pacientes inativos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {activeCategory && (
        <CampaignModal category={activeCategory} onClose={() => setActive(null)} />
      )}
    </div>
  )
}
