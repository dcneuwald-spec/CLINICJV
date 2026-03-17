import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, differenceInYears, isToday, isTomorrow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: ptBR })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

export function getAge(birthDate: string | Date): number {
  const d = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate
  return differenceInYears(new Date(), d)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-500'
  if (score >= 40) return 'text-amber-500'
  return 'text-red-500'
}

export function getScoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excelente'
  if (score >= 70) return 'Bom'
  if (score >= 55) return 'Regular'
  if (score >= 40) return 'Atenção'
  return 'Crítico'
}

export function getAppointmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    WAITING: 'Em Espera',
    IN_PROGRESS: 'Em Atendimento',
    ATTENDED: 'Atendido',
    LATE: 'Atrasado',
    ABSENT: 'Faltou',
    CANCELLED: 'Cancelado',
    RESCHEDULED: 'Remarcado',
  }
  return labels[status] || status
}

export function getAppointmentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SCHEDULED: 'bg-slate-100 text-slate-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    WAITING: 'bg-amber-100 text-amber-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    ATTENDED: 'bg-emerald-100 text-emerald-700',
    LATE: 'bg-orange-100 text-orange-700',
    ABSENT: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
    RESCHEDULED: 'bg-indigo-100 text-indigo-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getLeadStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: 'Novo',
    CONTACTED: 'Contactado',
    SCHEDULED: 'Agendado',
    CONVERTED: 'Convertido',
    LOST: 'Perdido',
  }
  return labels[status] || status
}

export function getBudgetStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    sent: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Reprovado',
    followup: 'Follow Up',
  }
  return labels[status] || status
}

export function getTransactionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    PAID: 'Pago',
    OVERDUE: 'Vencido',
    CANCELLED: 'Cancelado',
    PARTIAL: 'Parcial',
  }
  return labels[status] || status
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    pix: 'PIX',
    boleto: 'Boleto',
    cheque: 'Cheque',
    transferencia: 'Transferência',
  }
  return labels[method] || method
}

export function getDateLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Hoje'
  if (isTomorrow(date)) return 'Amanhã'
  if (isPast(date)) return formatDate(date)
  return formatDate(date)
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}
