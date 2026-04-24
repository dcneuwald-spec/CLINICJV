'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import {
  MessageCircle, Instagram, Search, Send, Paperclip,
  Smile, Phone, MoreVertical, CheckCheck, Check,
  Filter, ChevronDown, Loader2, User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Channel = 'whatsapp' | 'instagram'
type Direction = 'in' | 'out'

type Contact = {
  id: string
  name: string
  phone?: string
  handle?: string
  channel: Channel
  avatar?: string
  lastMessage: string
  lastTime: string
  unread: number
  online?: boolean
  tags?: string[]
}

type Message = {
  id: string
  text: string
  direction: Direction
  time: string
  status: 'sent' | 'delivered' | 'read'
}

const CONTACTS: Contact[] = [
  {
    id: 'c1', name: 'Maria Fernanda Silva', phone: '11999991234', channel: 'whatsapp',
    lastMessage: 'Gostaria de remarcar minha consulta para quinta-feira', lastTime: '09:42', unread: 2,
    online: true, tags: ['paciente'],
  },
  {
    id: 'c2', name: 'João Pedro Almeida', phone: '11988887654', channel: 'whatsapp',
    lastMessage: 'Confirmado! Estarei lá às 14h', lastTime: '09:18', unread: 0, tags: ['confirmado'],
  },
  {
    id: 'c3', name: 'Ana Carolina Souza', handle: '@ana.souza', channel: 'instagram',
    lastMessage: 'Vi o antes e depois no feed! Vocês são incríveis 😍', lastTime: '08:55', unread: 1,
    online: true, tags: ['lead'],
  },
  {
    id: 'c4', name: 'Roberto Carlos Mendes', phone: '11977776543', channel: 'whatsapp',
    lastMessage: 'Tudo bem! Qual o valor da consulta de avaliação?', lastTime: 'Ontem', unread: 0,
    tags: ['lead'],
  },
  {
    id: 'c5', name: 'Patrícia Lima', handle: '@paty.lima', channel: 'instagram',
    lastMessage: 'Quero agendar um procedimento estético. Vocês fazem preenchimento?', lastTime: 'Ontem', unread: 3,
    tags: ['lead'],
  },
  {
    id: 'c6', name: 'Carlos Eduardo Ramos', phone: '11966665432', channel: 'whatsapp',
    lastMessage: 'Obrigado pelo atendimento! Nota 10 para toda a equipe 🌟', lastTime: 'Seg', unread: 0,
    tags: ['paciente'],
  },
  {
    id: 'c7', name: 'Juliana Martins', phone: '11955554321', channel: 'whatsapp',
    lastMessage: 'Qual o horário disponível na semana que vem?', lastTime: 'Sex', unread: 0,
    tags: ['paciente'],
  },
  {
    id: 'c8', name: 'Fernanda Costa', handle: '@fer.costa', channel: 'instagram',
    lastMessage: 'Boa tarde! Vi que vocês têm promoção para novas pacientes', lastTime: 'Sex', unread: 0,
    tags: ['lead'],
  },
]

const THREAD: Record<string, Message[]> = {
  c1: [
    { id: 'm1', text: 'Olá! Vi que tenho consulta amanhã às 15h.', direction: 'in', time: '09:30', status: 'read' },
    { id: 'm2', text: 'Olá, Maria! Sim, sua consulta está confirmada para amanhã às 15h com Dr. Carlos.', direction: 'out', time: '09:32', status: 'read' },
    { id: 'm3', text: 'Ah, infelizmente não vou conseguir comparecer. Tem como remarcar?', direction: 'in', time: '09:38', status: 'read' },
    { id: 'm4', text: 'Claro! Sem problema. Tem preferência de horário?', direction: 'out', time: '09:39', status: 'read' },
    { id: 'm5', text: 'Gostaria de remarcar minha consulta para quinta-feira', direction: 'in', time: '09:42', status: 'delivered' },
  ],
  c3: [
    { id: 'm1', text: 'Oi! Vocês ficam no centro ou no bairro Jardins?', direction: 'in', time: '08:40', status: 'read' },
    { id: 'm2', text: 'Olá, Ana! Ficamos na Av. Paulista, 1000 - próximo ao metrô Brigadeiro 🏥', direction: 'out', time: '08:42', status: 'read' },
    { id: 'm3', text: 'Vi o antes e depois no feed! Vocês são incríveis 😍', direction: 'in', time: '08:55', status: 'delivered' },
  ],
  c4: [
    { id: 'm1', text: 'Boa tarde! Vi o anúncio de vocês. Fazem tratamento para bruxismo?', direction: 'in', time: '14:20', status: 'read' },
    { id: 'm2', text: 'Boa tarde! Sim, fazemos! A avaliação inicial é gratuita. Posso agendar para você?', direction: 'out', time: '14:22', status: 'read' },
    { id: 'm3', text: 'Tudo bem! Qual o valor da consulta de avaliação?', direction: 'in', time: '14:30', status: 'read' },
  ],
}

const CANNED_RESPONSES = [
  'Olá! Tudo bem? Como posso ajudar?',
  'Confirmado! Sua consulta está agendada. 😊',
  'Certo! Vou verificar a disponibilidade e retorno em instantes.',
  'Para agendar, basta informar seu nome completo e a data preferida.',
  'Obrigado pelo contato! Até breve!',
]

function ChannelIcon({ channel, size = 14 }: { channel: Channel; size?: number }) {
  if (channel === 'whatsapp') {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <MessageCircle size={10} className="text-white" />
      </div>
    )
  }
  return (
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
      <Instagram size={10} className="text-white" />
    </div>
  )
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = ['bg-brand-200 text-brand-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700']
  const idx = name.charCodeAt(0) % colors.length
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const sizeClass = size === 'lg' ? 'w-10 h-10 text-sm' : size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'

  return (
    <div className={cn('rounded-full flex items-center justify-center font-bold flex-shrink-0', sizeClass, colors[idx])}>
      {initials}
    </div>
  )
}

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all')
  const [selected, setSelected] = useState<Contact>(CONTACTS[0])
  const [messages, setMessages] = useState<Record<string, Message[]>>(THREAD)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showCanned, setShowCanned] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected, messages])

  const filtered = CONTACTS.filter(c => {
    const matchChannel = channelFilter === 'all' || c.channel === channelFilter
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) || c.handle?.includes(search)
    return matchChannel && matchSearch
  })

  const thread = messages[selected.id] ?? []

  const sendMessage = async () => {
    if (!input.trim()) return
    setSending(true)
    const msg: Message = {
      id: `m${Date.now()}`,
      text: input.trim(),
      direction: 'out',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    }
    setMessages(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] ?? []), msg] }))
    setInput('')
    setShowCanned(false)
    await new Promise(r => setTimeout(r, 600))
    setMessages(prev => ({
      ...prev,
      [selected.id]: prev[selected.id].map(m => m.id === msg.id ? { ...m, status: 'delivered' } : m),
    }))
    setSending(false)
  }

  const totalUnread = CONTACTS.reduce((s, c) => s + c.unread, 0)

  return (
    <div className="animate-fade-in h-[calc(100vh-56px)] flex flex-col">
      <Header
        title="Caixa de Entrada"
        subtitle={`${totalUnread > 0 ? `${totalUnread} não lidas · ` : ''}WhatsApp + Instagram`}
      />

      <div className="flex flex-1 min-h-0 border-t border-slate-200">
        {/* ── Left panel: contacts list ───────────────────────────────── */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
          {/* Search + filter */}
          <div className="px-3 py-3 space-y-2 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar contato..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'whatsapp', 'instagram'] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
                    channelFilter === ch
                      ? ch === 'whatsapp' ? 'bg-emerald-500 text-white'
                        : ch === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {ch === 'all' ? 'Todos' : ch === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                </button>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">Nenhum contato encontrado</div>
            )}
            {filtered.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelected(contact)}
                className={cn(
                  'w-full flex items-start gap-3 px-3 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50',
                  selected.id === contact.id && 'bg-brand-50 border-l-2 border-l-brand-600',
                )}
              >
                <div className="relative">
                  <Avatar name={contact.name} />
                  {contact.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">{contact.name}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{contact.lastTime}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ChannelIcon channel={contact.channel} />
                    <p className="text-xs text-slate-500 truncate flex-1">{contact.lastMessage}</p>
                    {contact.unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {contact.tags.map(tag => (
                        <span key={tag} className={cn(
                          'badge text-[9px] px-1.5 py-0.5',
                          tag === 'paciente' ? 'bg-emerald-100 text-emerald-700' :
                          tag === 'lead' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700',
                        )}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right panel: conversation ───────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Conversation header */}
          <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center gap-3">
            <Avatar name={selected.name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{selected.name}</h3>
                <ChannelIcon channel={selected.channel} />
              </div>
              <p className="text-xs text-slate-400">
                {selected.channel === 'whatsapp' ? selected.phone : selected.handle}
                {selected.online && <span className="text-emerald-500"> · Online agora</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Phone size={16} className="text-slate-500" />
                </a>
              )}
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <User size={16} className="text-slate-500" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical size={16} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            {thread.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
                <MessageCircle size={32} className="opacity-30" />
                <p>Inicie uma conversa</p>
              </div>
            )}

            {thread.map((msg, i) => {
              const isOut = msg.direction === 'out'
              const prevSameDir = i > 0 && thread[i - 1].direction === msg.direction
              return (
                <div key={msg.id} className={cn('flex', isOut ? 'justify-end' : 'justify-start', !prevSameDir && 'mt-4')}>
                  {!isOut && !prevSameDir && (
                    <Avatar name={selected.name} size="sm" />
                  )}
                  {!isOut && prevSameDir && <div className="w-7" />}
                  <div
                    className={cn(
                      'max-w-[70%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ml-2',
                      isOut
                        ? 'bg-brand-600 text-white rounded-br-sm'
                        : 'bg-white text-slate-800 rounded-bl-sm',
                    )}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <div className={cn(
                      'flex items-center justify-end gap-1 mt-1',
                      isOut ? 'text-brand-200' : 'text-slate-400',
                    )}>
                      <span className="text-[10px]">{msg.time}</span>
                      {isOut && (
                        msg.status === 'read' ? <CheckCheck size={12} className="text-blue-300" /> :
                        msg.status === 'delivered' ? <CheckCheck size={12} /> :
                        <Check size={12} />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Canned responses */}
          {showCanned && (
            <div className="px-4 pb-2">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <p className="text-[10px] font-semibold text-slate-400 uppercase px-3 py-2 border-b border-slate-100">
                  Respostas rápidas
                </p>
                {CANNED_RESPONSES.map(r => (
                  <button
                    key={r}
                    onClick={() => { setInput(r); setShowCanned(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-slate-200">
            <div className="flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2">
              <button
                onClick={() => setShowCanned(prev => !prev)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mb-0.5"
                title="Respostas rápidas"
              >
                <Smile size={18} />
              </button>
              <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mb-0.5">
                <Paperclip size={18} />
              </button>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                }}
                placeholder={`Mensagem via ${selected.channel === 'whatsapp' ? 'WhatsApp' : 'Instagram'}…`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none max-h-32 py-1"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                  input.trim()
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'bg-slate-200 text-slate-400',
                )}
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Pressione Enter para enviar · Shift+Enter para nova linha
            </p>
          </div>
        </div>

        {/* ── Contact info panel (right sidebar) ─────────────────────── */}
        <div className="w-64 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-y-auto">
          <div className="px-4 py-4 border-b border-slate-100 text-center">
            <Avatar name={selected.name} size="lg" />
            <h4 className="text-sm font-bold text-slate-900 mt-3">{selected.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {selected.phone ?? selected.handle}
            </p>
            <div className="flex justify-center mt-2">
              <ChannelIcon channel={selected.channel} />
            </div>
          </div>

          <div className="px-4 py-4 space-y-4">
            {selected.tags && selected.tags.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map(tag => (
                    <span key={tag} className={cn(
                      'badge text-xs',
                      tag === 'paciente' ? 'bg-emerald-100 text-emerald-700' :
                      tag === 'lead' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700',
                    )}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Ações</p>
              <div className="space-y-2">
                <button className="w-full btn-secondary text-xs py-2">Vincular Paciente</button>
                <button className="w-full btn-primary text-xs py-2">Agendar Consulta</button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Histórico</p>
              <p className="text-xs text-slate-500">
                {thread.length} mensagem{thread.length !== 1 ? 's' : ''} nesta conversa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
