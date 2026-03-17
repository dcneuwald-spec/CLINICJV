'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import {
  MessageCircle, Users, CalendarX, UserMinus, AlertCircle,
  Gift, Phone, ChevronRight, Play, CheckCircle2, X,
} from 'lucide-react'
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from '@/lib/mock-data'
import { cn, formatDate, formatPhone, getInitials } from '@/lib/utils'

interface CRCCategory {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  patients: typeof MOCK_PATIENTS
}

function buildCategories(): CRCCategory[] {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  // Sem confirmação (agendamentos de hoje/amanhã sem confirmar)
  const unconfirmed = MOCK_APPOINTMENTS
    .filter(a => !a.confirmed && a.status === 'SCHEDULED')
    .map(a => MOCK_PATIENTS.find(p => p.id === a.patientId)!)
    .filter(Boolean)
    .filter((p, i, arr) => arr.findIndex(x => x?.id === p?.id) === i) as typeof MOCK_PATIENTS

  // Aniversariantes do mês
  const birthMonth = (today.getMonth() + 1).toString().padStart(2, '0')
  const birthdays = MOCK_PATIENTS.filter(p => p.birthDate?.slice(5, 7) === birthMonth)

  // Faltas
  const absentPatients = MOCK_APPOINTMENTS
    .filter(a => a.status === 'ABSENT')
    .map(a => MOCK_PATIENTS.find(p => p.id === a.patientId)!)
    .filter(Boolean)
    .filter((p, i, arr) => arr.findIndex(x => x?.id === p?.id) === i) as typeof MOCK_PATIENTS

  // Inativos (sem visita há mais de 60 dias)
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
  const inactive = MOCK_PATIENTS.filter(p => {
    if (p.status === 'INACTIVE') return true
    if (!p.lastVisit) return false
    return new Date(p.lastVisit) < sixtyDaysAgo
  })

  // Inadimplentes
  const debtors = MOCK_PATIENTS.filter(p => {
    const hasOverdue = false // simplificado
    return false
  })

  return [
    {
      id: 'unconfirmed',
      label: 'Sem Confirmação',
      description: 'Agendamentos sem confirmação para hoje e amanhã',
      icon: <CalendarX size={20} />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      patients: unconfirmed,
    },
    {
      id: 'birthdays',
      label: 'Aniversariantes',
      description: `Pacientes aniversariantes em ${today.toLocaleString('pt-BR', { month: 'long' })}`,
      icon: <Gift size={20} />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      patients: birthdays,
    },
    {
      id: 'absent',
      label: 'Faltas',
      description: 'Pacientes que faltaram na última consulta',
      icon: <UserMinus size={20} />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      patients: absentPatients,
    },
    {
      id: 'first-absent',
      label: 'Falta — 1ª Consulta',
      description: 'Alto risco de perda — nunca retornaram',
      icon: <AlertCircle size={20} />,
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      patients: absentPatients.slice(0, 1),
    },
    {
      id: 'inactive',
      label: 'Reativação',
      description: 'Pacientes sem visita há mais de 60 dias',
      icon: <Users size={20} />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      patients: inactive,
    },
    {
      id: 'debt',
      label: 'Inadimplência',
      description: 'Pacientes com valores em aberto vencidos',
      icon: <AlertCircle size={20} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      patients: [],
    },
  ]
}

function CampaignModal({
  category, onClose,
}: {
  category: CRCCategory
  onClose: () => void
}) {
  const [messageType, setMessageType] = useState('whatsapp')
  const [sent, setSent] = useState(false)

  const templates: Record<string, string> = {
    unconfirmed: 'Olá {nome}! 😊 Sua consulta está agendada para {data} às {hora} na Bella Vita Estética. Por favor, confirme sua presença respondendo SIM. Qualquer dúvida, estamos à disposição!',
    birthdays: 'Feliz Aniversário, {nome}! 🎉 Toda a equipe da Bella Vita Estética deseja um dia especial. Como presente, preparamos 15% de desconto na sua próxima consulta. Válido até o fim do mês!',
    absent: 'Olá {nome}, sentimos sua falta! 😔 Você não compareceu à sua consulta. Podemos reagendar? Sua saúde e beleza são nossa prioridade. Entre em contato: (11) 3456-7890',
    'first-absent': 'Olá {nome}! Ficamos preocupados com sua ausência. Era sua primeira consulta conosco e gostaríamos muito de conhecê-la. Podemos remarcar sem custo. Aguardamos seu contato!',
    inactive: 'Olá {nome}! Faz um tempo que não te vemos por aqui 🌸 Sentimos sua falta! Que tal agendar uma consulta? Temos novidades incríveis te esperando. Agende: (11) 3456-7890',
    debt: 'Olá {nome}, identificamos um valor em aberto em sua conta. Gostaríamos de resolver isso para você. Entre em contato: (11) 3456-7890',
  }

  const message = templates[category.id] || ''

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Campanha Disparada!</h3>
          <p className="text-slate-500 text-sm mb-1">
            Mensagem enviada para <strong>{category.patients.length}</strong> paciente(s)
          </p>
          <p className="text-slate-400 text-xs mb-6">via {messageType === 'whatsapp' ? 'WhatsApp' : 'SMS'}</p>
          <button onClick={onClose} className="btn-primary w-full justify-center">Fechar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', category.bgColor, category.color)}>
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
            <p className="text-xs font-medium text-slate-500 mb-2">Canal de envio</p>
            <div className="flex gap-2">
              {['whatsapp', 'sms', 'email'].map(c => (
                <button
                  key={c}
                  onClick={() => setMessageType(c)}
                  className={cn(
                    'btn text-xs px-3 py-1.5 capitalize',
                    messageType === c ? 'btn-primary' : 'btn-secondary',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Preview da mensagem</p>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200">
              {message}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Variáveis: {'{nome}'}, {'{data}'}, {'{hora}'} serão substituídas automaticamente
            </p>
          </div>

          {/* Lista de pacientes */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Pacientes na campanha</p>
            <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 p-2">
              {category.patients.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Nenhum paciente nesta categoria</p>
              ) : (
                category.patients.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-xs text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-50">
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-700 text-[9px] font-bold">{getInitials(p.name)}</span>
                    </div>
                    <span className="flex-1">{p.name}</span>
                    <span className="text-slate-400">{formatPhone(p.phone)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button
            onClick={() => setSent(true)}
            disabled={category.patients.length === 0}
            className="btn-primary flex-1 justify-center gap-2 disabled:opacity-50"
          >
            <Play size={14} /> Disparar Campanha
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CRCPage() {
  const [activeCategory, setActiveCategory] = useState<CRCCategory | null>(null)
  const categories = buildCategories()

  return (
    <div className="animate-fade-in">
      <Header title="CRC — Central de Relacionamento" subtitle="Reengajamento proativo de pacientes" />

      <div className="p-6 space-y-5">
        {/* Resumo */}
        <div className="card p-5 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg">Central de Relacionamento</h3>
              <p className="text-brand-200 text-sm mt-1">
                Identifique oportunidades e automatize o reengajamento com seus pacientes
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {categories.reduce((s, c) => s + c.patients.length, 0)}
              </p>
              <p className="text-brand-200 text-xs">pacientes precisam de atenção</p>
            </div>
          </div>
        </div>

        {/* Cards de categorias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', cat.bgColor, cat.color)}>
                  {cat.icon}
                </div>
                <span className={cn(
                  'text-2xl font-bold',
                  cat.patients.length > 0 ? cat.color : 'text-slate-300',
                )}>
                  {cat.patients.length}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">{cat.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{cat.description}</p>
              </div>

              {/* Lista prévia */}
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
                onClick={() => setActiveCategory(cat)}
                disabled={cat.patients.length === 0}
                className={cn(
                  'btn text-xs justify-center gap-2 mt-auto',
                  cat.patients.length > 0 ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed',
                )}
              >
                {cat.patients.length > 0 ? (
                  <><Play size={12} /> Ativar Campanha</>
                ) : (
                  <><CheckCircle2 size={12} /> Nenhum paciente</>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Dica do consultor */}
        <div className="card p-5 border-l-4 border-brand-500">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageCircle size={16} className="text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">💡 Recomendação do Sistema</p>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Sua taxa de reativação atual é de <strong>38,9%</strong>. Clínicas com taxa de reativação acima de 45%
                utilizam campanhas de reengajamento semanais. Ative a categoria <strong>"Reativação"</strong>
                agora para recuperar até <strong>R$ 3.400</strong> em receita potencial.
              </p>
            </div>
          </div>
        </div>
      </div>

      {activeCategory && (
        <CampaignModal category={activeCategory} onClose={() => setActiveCategory(null)} />
      )}
    </div>
  )
}
