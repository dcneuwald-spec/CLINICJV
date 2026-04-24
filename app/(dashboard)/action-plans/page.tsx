'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import {
  Plus, Target, CheckCircle2, Clock, AlertTriangle,
  ChevronDown, ChevronUp, Edit3, Lightbulb,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

type PlanStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
type PlanPriority = 'critical' | 'high' | 'medium' | 'low'
type Task = { id: string; title: string; completed: boolean; dueDate?: string }
type ActionPlan = { id: string; title: string; description: string; priority: PlanPriority; status: PlanStatus; tasks: Task[]; kpiMetric?: string; targetValue?: string; dueDate?: string }

const ACTION_PLANS: ActionPlan[] = [
  {
    id: 'ap-1',
    title: 'Reduzir Taxa de Faltas',
    description: 'Implementar confirmações automáticas via WhatsApp 24h e 2h antes da consulta para reduzir a taxa de faltas abaixo de 10%.',
    priority: 'high',
    status: 'in_progress',
    kpiMetric: 'absenceRate',
    targetValue: '10',
    dueDate: '2025-03-31',
    tasks: [
      { id: 't1', title: 'Configurar mensagem de confirmação no WhatsApp', completed: true, dueDate: '2025-02-20' },
      { id: 't2', title: 'Ativar lembretes automáticos 24h antes', completed: true, dueDate: '2025-02-22' },
      { id: 't3', title: 'Ativar lembretes automáticos 2h antes', completed: false, dueDate: '2025-03-01' },
      { id: 't4', title: 'Monitorar resultados por 30 dias', completed: false, dueDate: '2025-03-31' },
    ],
  },
  {
    id: 'ap-2',
    title: 'Aumentar Taxa de Retorno',
    description: 'Criar régua de reativação para pacientes sem visita há 30+ dias usando CRC e campanhas automatizadas.',
    priority: 'medium',
    status: 'open',
    kpiMetric: 'returnRate',
    targetValue: '65',
    dueDate: '2025-04-30',
    tasks: [
      { id: 't5', title: 'Segmentar pacientes inativos no CRC', completed: false, dueDate: '2025-03-10' },
      { id: 't6', title: 'Criar templates de mensagem de reativação', completed: false, dueDate: '2025-03-15' },
      { id: 't7', title: 'Disparar campanha piloto para 20 pacientes', completed: false, dueDate: '2025-03-20' },
    ],
  },
  {
    id: 'ap-3',
    title: 'Otimizar Conversão de Orçamentos',
    description: 'Aumentar taxa de aprovação de orçamentos de 62% para 70% com follow-up estruturado.',
    priority: 'medium',
    status: 'open',
    kpiMetric: 'conversionRate',
    targetValue: '70',
    dueDate: '2025-05-31',
    tasks: [
      { id: 't8', title: 'Mapear etapas do funil de vendas', completed: false },
      { id: 't9', title: 'Criar script de follow-up para orçamentos', completed: false },
      { id: 't10', title: 'Treinar equipe na abordagem consultiva', completed: false },
    ],
  },
]

export default function ActionPlansPage() {
  const [expanded, setExpanded] = useState<string | null>(ACTION_PLANS[0].id)

  const open = ACTION_PLANS.filter(p => p.status === 'open' || p.status === 'in_progress')
  const done = ACTION_PLANS.filter(p => p.status === 'completed')

  return (
    <div className="animate-fade-in">
      <Header title="Planos de Ação" subtitle="Diagnóstico orientado por dados" />

      <div className="p-6 space-y-5">
        {/* Banner */}
        <div className="card p-5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Lightbulb size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Planos de Ação — IA Consultiva</h3>
              <p className="text-brand-200 text-sm mt-0.5">
                Diagnósticos automáticos baseados nos KPIs da clínica com ações recomendadas
              </p>
            </div>
            <button className="btn bg-white text-brand-700 hover:bg-brand-50 text-sm ml-auto">
              <Plus size={14} /> Novo Plano
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-brand-600">{open.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Em andamento</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{done.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Concluídos</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {ACTION_PLANS.reduce((s, p) => s + p.tasks.filter(t => t.completed).length, 0)}/
              {ACTION_PLANS.reduce((s, p) => s + p.tasks.length, 0)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Tarefas concluídas</p>
          </div>
        </div>

        {/* Lista de planos */}
        <div className="space-y-4">
          {ACTION_PLANS.map(plan => {
            const doneTasks = plan.tasks.filter(t => t.completed).length
            const pct = Math.round((doneTasks / plan.tasks.length) * 100)
            const isExpanded = expanded === plan.id

            const priorityConfig = {
              critical: { label: 'Crítico', dot: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
              high:     { label: 'Alta',    dot: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
              medium:   { label: 'Média',   dot: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
              low:      { label: 'Baixa',   dot: 'bg-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600' },
            }[plan.priority]

            return (
              <div key={plan.id} className={cn('card border-l-4', priorityConfig.border)}>
                <button
                  className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : plan.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-0.5', priorityConfig.dot)} />
                      <span className="text-sm font-semibold text-slate-800">{plan.title}</span>
                      <span className={cn('badge text-[10px]', priorityConfig.bg, priorityConfig.text)}>
                        {priorityConfig.label}
                      </span>
                      <span className={cn(
                        'badge text-[10px]',
                        plan.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600',
                      )}>
                        {plan.status === 'in_progress' ? 'Em andamento' : 'Aberto'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{plan.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{doneTasks}/{plan.tasks.length} tarefas</span>
                      {plan.dueDate && (
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          Prazo: {plan.dueDate.slice(0, 10)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-slate-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3 animate-fade-in">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarefas</h4>
                    <div className="space-y-2">
                      {plan.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <button className={cn(
                            'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 hover:border-brand-500',
                          )}>
                            {task.completed && <CheckCircle2 size={12} />}
                          </button>
                          <span className={cn(
                            'text-sm flex-1',
                            task.completed ? 'line-through text-slate-400' : 'text-slate-700',
                          )}>
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock size={11} />
                              {task.dueDate}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {plan.kpiMetric && plan.targetValue && (
                      <div className="p-3 bg-brand-50 rounded-xl border border-brand-100">
                        <p className="text-xs text-brand-700">
                          <strong>KPI alvo:</strong> {plan.kpiMetric} → {plan.targetValue}
                          {plan.kpiMetric.includes('Rate') ? '%' : ''}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button className="btn-secondary text-xs gap-1.5"><Edit3 size={12} /> Editar Plano</button>
                      <button className="btn-primary text-xs">Marcar como Concluído</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
