// ClinicJV — Tipos Centrais do Sistema

// ============================
// USUÁRIOS E AUTENTICAÇÃO
// ============================

export type UserRole = 'ADMIN' | 'CONSULTANT' | 'MANAGER' | 'PROFESSIONAL' | 'RECEPTIONIST'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  active: boolean
  createdAt: string
}

// ============================
// CLÍNICA
// ============================

export interface Clinic {
  id: string
  name: string
  tradeName?: string
  cnpj?: string
  phone?: string
  email?: string
  logo?: string
  address?: string
  city?: string
  state?: string
  specialty?: string
  plan: 'basic' | 'pro' | 'enterprise'
  active: boolean
  createdAt: string
}

// ============================
// PROFISSIONAIS
// ============================

export interface Professional {
  id: string
  clinicId: string
  name: string
  specialty: string
  crm?: string
  color: string
  phone?: string
  email?: string
  avatar?: string
  commission: number
  active: boolean
}

// ============================
// PACIENTES
// ============================

export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export interface Patient {
  id: string
  clinicId: string
  name: string
  nickname?: string
  email?: string
  phone: string
  whatsapp?: string
  birthDate?: string
  cpf?: string
  gender?: 'M' | 'F' | 'O'
  referralSource?: string
  address?: string
  city?: string
  state?: string
  status: PatientStatus
  registrationNum?: string
  firstVisit?: string
  lastVisit?: string
  totalSpent: number
  npsScore?: number
  createdAt: string
  updatedAt: string
}

// ============================
// AGENDA
// ============================

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'ATTENDED'
  | 'LATE'
  | 'ABSENT'
  | 'CANCELLED'
  | 'RESCHEDULED'

export type AppointmentType = 'CONSULTATION' | 'COMMITMENT' | 'EVENT' | 'BLOCK'

export interface AppointmentProcedure {
  id: string
  procedureId: string
  procedureName: string
  quantity: number
  price: number
  executed: boolean
}

export interface Appointment {
  id: string
  clinicId: string
  patientId?: string
  patientName?: string
  patientPhone?: string
  professionalId: string
  professionalName: string
  professionalColor: string
  type: AppointmentType
  status: AppointmentStatus
  title?: string
  startTime: string
  endTime: string
  duration: number
  isFirstVisit: boolean
  confirmChannel?: string
  confirmed: boolean
  notes?: string
  category?: string
  labels: string[]
  procedures: AppointmentProcedure[]
  createdAt: string
}

export interface Procedure {
  id: string
  clinicId: string
  name: string
  description?: string
  duration: number
  price: number
  category?: string
  active: boolean
}

// ============================
// FINANCEIRO
// ============================

export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIAL'

export interface FinancialTransaction {
  id: string
  clinicId: string
  patientId?: string
  patientName?: string
  type: TransactionType
  status: TransactionStatus
  description: string
  amount: number
  amountPaid: number
  dueDate: string
  paidDate?: string
  paymentMethod?: string
  installments: number
  installmentNum: number
  category?: string
  notes?: string
  createdAt: string
}

export interface Budget {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  number: string
  title?: string
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'followup'
  totalAmount: number
  discount: number
  finalAmount: number
  validUntil?: string
  approvedAt?: string
  createdAt: string
  items: BudgetItem[]
}

export interface BudgetItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  executed: boolean
}

// ============================
// CRM E LEADS
// ============================

export type LeadStatus = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'CONVERTED' | 'LOST'

export interface Lead {
  id: string
  clinicId: string
  name: string
  email?: string
  phone: string
  source?: string
  campaignId?: string
  campaignName?: string
  status: LeadStatus
  score: number
  interest?: string
  notes?: string
  lostReason?: string
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  clinicId: string
  name: string
  platform: string
  status: string
  budget?: number
  spent: number
  leads: number
  conversions: number
  cpl?: number
  conversionRate?: number
  startDate?: string
  endDate?: string
}

// ============================
// SCORE DE SAÚDE
// ============================

export interface ClinicHealthScore {
  id: string
  clinicId: string
  period: string
  overallScore: number

  // 6 dimensões
  patientScore: number
  productionScore: number
  peopleScore: number
  processScore: number
  planningScore: number
  prosperityScore: number

  // KPIs
  occupancyRate: number
  absenceRate: number
  returnRate: number
  conversionRate: number
  npsScore: number
  avgTicket: number
  defaultRate: number
  revenueGrowth: number
}

// ============================
// KPIs E MÉTRICAS
// ============================

export interface KPICard {
  label: string
  value: string | number
  unit?: string
  change?: number
  changeLabel?: string
  benchmark?: number
  trend?: 'up' | 'down' | 'stable'
  status?: 'good' | 'warning' | 'critical'
  icon?: string
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

// ============================
// PLANO DE AÇÃO
// ============================

export interface ActionPlan {
  id: string
  clinicId: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  kpiMetric?: string
  targetValue?: number
  dueDate?: string
  completedAt?: string
  createdAt: string
  tasks: ActionTask[]
}

export interface ActionTask {
  id: string
  title: string
  assignee?: string
  completed: boolean
  dueDate?: string
}

// ============================
// METAS
// ============================

export interface Goal {
  id: string
  clinicId: string
  professionalId?: string
  professionalName?: string
  title: string
  metric: string
  targetValue: number
  currentValue: number
  period: string
  startDate: string
  endDate: string
  status: string
  percentComplete: number
}

// ============================
// NAVEGAÇÃO
// ============================

export interface NavItem {
  href: string
  label: string
  icon: string
  category: string
  badge?: number
  roles?: UserRole[]
}
