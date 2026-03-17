import type {
  Clinic, Professional, Patient, Appointment, FinancialTransaction,
  Budget, Lead, Campaign, ClinicHealthScore, ActionPlan, Goal,
} from '@/types'

// ============================
// CLÍNICA
// ============================

export const MOCK_CLINIC: Clinic = {
  id: 'clinic-01',
  name: 'Clínica Estética Bella Vita',
  tradeName: 'Bella Vita',
  cnpj: '12.345.678/0001-90',
  phone: '(11) 3456-7890',
  email: 'contato@bellavita.com.br',
  city: 'São Paulo',
  state: 'SP',
  specialty: 'estética',
  plan: 'pro',
  active: true,
  createdAt: '2022-03-15T00:00:00Z',
}

export const MOCK_CLINICS: Clinic[] = [
  MOCK_CLINIC,
  {
    id: 'clinic-02',
    name: 'Odonto Smile Center',
    tradeName: 'Smile Center',
    cnpj: '98.765.432/0001-10',
    phone: '(11) 2345-6789',
    email: 'contato@smilecenter.com.br',
    city: 'São Paulo',
    state: 'SP',
    specialty: 'odontologia',
    plan: 'pro',
    active: true,
    createdAt: '2021-06-01T00:00:00Z',
  },
  {
    id: 'clinic-03',
    name: 'FisioVita Reabilitação',
    tradeName: 'FisioVita',
    phone: '(11) 9876-5432',
    city: 'Guarulhos',
    state: 'SP',
    specialty: 'fisioterapia',
    plan: 'basic',
    active: true,
    createdAt: '2023-01-10T00:00:00Z',
  },
  {
    id: 'clinic-04',
    name: 'Psico Bem Estar',
    tradeName: 'Psico Bem Estar',
    phone: '(11) 1234-5678',
    city: 'Campinas',
    state: 'SP',
    specialty: 'psicologia',
    plan: 'basic',
    active: true,
    createdAt: '2023-05-20T00:00:00Z',
  },
]

// ============================
// PROFISSIONAIS
// ============================

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-01',
    clinicId: 'clinic-01',
    name: 'Dra. Camila Ferreira',
    specialty: 'Estética Facial',
    crm: 'CRM/SP 123456',
    color: '#3B82F6',
    phone: '(11) 99999-0001',
    email: 'camila@bellavita.com.br',
    commission: 40,
    active: true,
  },
  {
    id: 'prof-02',
    clinicId: 'clinic-01',
    name: 'Dr. Ricardo Alves',
    specialty: 'Estética Corporal',
    crm: 'CRM/SP 654321',
    color: '#10B981',
    phone: '(11) 99999-0002',
    email: 'ricardo@bellavita.com.br',
    commission: 35,
    active: true,
  },
  {
    id: 'prof-03',
    clinicId: 'clinic-01',
    name: 'Dra. Ana Souza',
    specialty: 'Nutrição Estética',
    color: '#F59E0B',
    phone: '(11) 99999-0003',
    email: 'ana@bellavita.com.br',
    commission: 30,
    active: true,
  },
  {
    id: 'prof-04',
    clinicId: 'clinic-01',
    name: 'Dra. Patrícia Lima',
    specialty: 'Dermatologia',
    crm: 'CRM/SP 789012',
    color: '#8B5CF6',
    phone: '(11) 99999-0004',
    commission: 45,
    active: true,
  },
]

// ============================
// PACIENTES
// ============================

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat-01', clinicId: 'clinic-01',
    name: 'Beatriz Oliveira', nickname: 'Bia',
    email: 'beatriz@email.com', phone: '(11) 98765-4321',
    whatsapp: '(11) 98765-4321', birthDate: '1990-05-15',
    cpf: '123.456.789-00', gender: 'F',
    referralSource: 'Instagram', city: 'São Paulo', state: 'SP',
    status: 'ACTIVE', registrationNum: 'BV-0001',
    firstVisit: '2023-01-10', lastVisit: '2024-12-20',
    totalSpent: 4800, npsScore: 9,
    createdAt: '2023-01-10T00:00:00Z', updatedAt: '2024-12-20T00:00:00Z',
  },
  {
    id: 'pat-02', clinicId: 'clinic-01',
    name: 'Fernanda Costa', phone: '(11) 97654-3210',
    email: 'fernanda@email.com', birthDate: '1985-09-22',
    cpf: '987.654.321-00', gender: 'F',
    referralSource: 'Indicação', city: 'São Paulo', state: 'SP',
    status: 'ACTIVE', registrationNum: 'BV-0002',
    firstVisit: '2023-03-05', lastVisit: '2025-01-08',
    totalSpent: 12300, npsScore: 10,
    createdAt: '2023-03-05T00:00:00Z', updatedAt: '2025-01-08T00:00:00Z',
  },
  {
    id: 'pat-03', clinicId: 'clinic-01',
    name: 'Carla Mendes', phone: '(11) 96543-2109',
    email: 'carla@email.com', birthDate: '1995-12-01',
    gender: 'F', referralSource: 'Google',
    city: 'Osasco', state: 'SP',
    status: 'ACTIVE', registrationNum: 'BV-0003',
    firstVisit: '2024-02-14', lastVisit: '2024-11-30',
    totalSpent: 2100, npsScore: 8,
    createdAt: '2024-02-14T00:00:00Z', updatedAt: '2024-11-30T00:00:00Z',
  },
  {
    id: 'pat-04', clinicId: 'clinic-01',
    name: 'Juliana Santos', phone: '(11) 95432-1098',
    birthDate: '1988-07-18', gender: 'F',
    referralSource: 'Facebook Ads', city: 'Santo André', state: 'SP',
    status: 'ACTIVE', registrationNum: 'BV-0004',
    firstVisit: '2024-06-01', lastVisit: '2025-01-15',
    totalSpent: 6500, npsScore: 7,
    createdAt: '2024-06-01T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'pat-05', clinicId: 'clinic-01',
    name: 'Mariana Rodrigues', phone: '(11) 94321-0987',
    email: 'mariana@email.com', birthDate: '1993-03-25',
    gender: 'F', referralSource: 'Indicação',
    city: 'São Paulo', state: 'SP',
    status: 'ACTIVE', registrationNum: 'BV-0005',
    firstVisit: '2023-08-20', lastVisit: '2025-02-01',
    totalSpent: 9200, npsScore: 9,
    createdAt: '2023-08-20T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'pat-06', clinicId: 'clinic-01',
    name: 'Tatiane Ferreira', phone: '(11) 93210-9876',
    birthDate: '1980-11-10', gender: 'F',
    referralSource: 'Instagram', city: 'São Paulo', state: 'SP',
    status: 'INACTIVE', registrationNum: 'BV-0006',
    firstVisit: '2022-05-12', lastVisit: '2023-09-30',
    totalSpent: 3400,
    createdAt: '2022-05-12T00:00:00Z', updatedAt: '2023-09-30T00:00:00Z',
  },
  {
    id: 'pat-07', clinicId: 'clinic-01',
    name: 'Roberta Almeida', phone: '(11) 92109-8765',
    email: 'roberta@email.com', birthDate: '1997-01-07',
    gender: 'F', referralSource: 'TikTok',
    city: 'São Paulo', state: 'SP',
    status: 'ACTIVE', registrationNum: 'BV-0007',
    firstVisit: '2025-01-20', lastVisit: '2025-01-20',
    totalSpent: 450, npsScore: 8,
    createdAt: '2025-01-20T00:00:00Z', updatedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: 'pat-08', clinicId: 'clinic-01',
    name: 'Paulo Henrique', phone: '(11) 91098-7654',
    birthDate: '1982-06-30', gender: 'M',
    referralSource: 'Google', city: 'São Paulo', state: 'SP',
    status: 'ACTIVE', registrationNum: 'BV-0008',
    firstVisit: '2024-09-10', lastVisit: '2025-01-10',
    totalSpent: 3200,
    createdAt: '2024-09-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z',
  },
]

// ============================
// AGENDAMENTOS
// ============================

const today = new Date()
const todayStr = today.toISOString().slice(0, 10)

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-01', clinicId: 'clinic-01',
    patientId: 'pat-01', patientName: 'Beatriz Oliveira', patientPhone: '(11) 98765-4321',
    professionalId: 'prof-01', professionalName: 'Dra. Camila Ferreira', professionalColor: '#3B82F6',
    type: 'CONSULTATION', status: 'CONFIRMED',
    startTime: `${todayStr}T08:00:00`, endTime: `${todayStr}T09:00:00`, duration: 60,
    isFirstVisit: false, confirmed: true, confirmChannel: 'whatsapp',
    labels: ['vip'], procedures: [{ id: 'p1', procedureId: 'proc-01', procedureName: 'Botox', quantity: 1, price: 800, executed: false }],
    createdAt: `${todayStr}T07:00:00`,
  },
  {
    id: 'apt-02', clinicId: 'clinic-01',
    patientId: 'pat-02', patientName: 'Fernanda Costa', patientPhone: '(11) 97654-3210',
    professionalId: 'prof-01', professionalName: 'Dra. Camila Ferreira', professionalColor: '#3B82F6',
    type: 'CONSULTATION', status: 'WAITING',
    startTime: `${todayStr}T09:00:00`, endTime: `${todayStr}T10:00:00`, duration: 60,
    isFirstVisit: false, confirmed: true, confirmChannel: 'whatsapp',
    labels: [], procedures: [{ id: 'p2', procedureId: 'proc-02', procedureName: 'Preenchimento Labial', quantity: 1, price: 1200, executed: false }],
    createdAt: `${todayStr}T07:00:00`,
  },
  {
    id: 'apt-03', clinicId: 'clinic-01',
    patientId: 'pat-03', patientName: 'Carla Mendes',
    professionalId: 'prof-02', professionalName: 'Dr. Ricardo Alves', professionalColor: '#10B981',
    type: 'CONSULTATION', status: 'IN_PROGRESS',
    startTime: `${todayStr}T09:30:00`, endTime: `${todayStr}T10:30:00`, duration: 60,
    isFirstVisit: false, confirmed: true,
    labels: [], procedures: [{ id: 'p3', procedureId: 'proc-03', procedureName: 'Drenagem Linfática', quantity: 1, price: 350, executed: false }],
    createdAt: `${todayStr}T07:00:00`,
  },
  {
    id: 'apt-04', clinicId: 'clinic-01',
    patientId: 'pat-04', patientName: 'Juliana Santos',
    professionalId: 'prof-01', professionalName: 'Dra. Camila Ferreira', professionalColor: '#3B82F6',
    type: 'CONSULTATION', status: 'SCHEDULED',
    startTime: `${todayStr}T10:00:00`, endTime: `${todayStr}T11:00:00`, duration: 60,
    isFirstVisit: false, confirmed: false,
    labels: [], procedures: [],
    createdAt: `${todayStr}T07:00:00`,
  },
  {
    id: 'apt-05', clinicId: 'clinic-01',
    patientId: 'pat-07', patientName: 'Roberta Almeida',
    professionalId: 'prof-04', professionalName: 'Dra. Patrícia Lima', professionalColor: '#8B5CF6',
    type: 'CONSULTATION', status: 'SCHEDULED',
    startTime: `${todayStr}T11:00:00`, endTime: `${todayStr}T12:00:00`, duration: 60,
    isFirstVisit: true, confirmed: false,
    labels: ['primeira-consulta'], procedures: [],
    createdAt: `${todayStr}T07:00:00`,
  },
  {
    id: 'apt-06', clinicId: 'clinic-01',
    patientId: 'pat-05', patientName: 'Mariana Rodrigues',
    professionalId: 'prof-03', professionalName: 'Dra. Ana Souza', professionalColor: '#F59E0B',
    type: 'CONSULTATION', status: 'ATTENDED',
    startTime: `${todayStr}T07:00:00`, endTime: `${todayStr}T08:00:00`, duration: 60,
    isFirstVisit: false, confirmed: true,
    labels: [], procedures: [{ id: 'p4', procedureId: 'proc-04', procedureName: 'Consulta Nutricional', quantity: 1, price: 250, executed: true }],
    createdAt: `${todayStr}T06:00:00`,
  },
  {
    id: 'apt-07', clinicId: 'clinic-01',
    patientId: 'pat-08', patientName: 'Paulo Henrique',
    professionalId: 'prof-02', professionalName: 'Dr. Ricardo Alves', professionalColor: '#10B981',
    type: 'CONSULTATION', status: 'ABSENT',
    startTime: `${todayStr}T08:00:00`, endTime: `${todayStr}T09:00:00`, duration: 60,
    isFirstVisit: false, confirmed: false,
    labels: [], procedures: [],
    createdAt: `${todayStr}T07:00:00`,
  },
  {
    id: 'apt-08', clinicId: 'clinic-01',
    patientId: 'pat-01', patientName: 'Beatriz Oliveira',
    professionalId: 'prof-01', professionalName: 'Dra. Camila Ferreira', professionalColor: '#3B82F6',
    type: 'CONSULTATION', status: 'SCHEDULED',
    startTime: `${todayStr}T14:00:00`, endTime: `${todayStr}T15:00:00`, duration: 60,
    isFirstVisit: false, confirmed: true,
    labels: [], procedures: [],
    createdAt: `${todayStr}T07:00:00`,
  },
  {
    id: 'apt-09', clinicId: 'clinic-01',
    patientId: 'pat-02', patientName: 'Fernanda Costa',
    professionalId: 'prof-04', professionalName: 'Dra. Patrícia Lima', professionalColor: '#8B5CF6',
    type: 'CONSULTATION', status: 'SCHEDULED',
    startTime: `${todayStr}T15:00:00`, endTime: `${todayStr}T16:00:00`, duration: 60,
    isFirstVisit: false, confirmed: true,
    labels: ['vip'], procedures: [],
    createdAt: `${todayStr}T07:00:00`,
  },
  {
    id: 'apt-10', clinicId: 'clinic-01',
    patientId: 'pat-06', patientName: 'Tatiane Ferreira',
    professionalId: 'prof-02', professionalName: 'Dr. Ricardo Alves', professionalColor: '#10B981',
    type: 'CONSULTATION', status: 'SCHEDULED',
    startTime: `${todayStr}T16:00:00`, endTime: `${todayStr}T17:00:00`, duration: 60,
    isFirstVisit: false, confirmed: false,
    labels: [], procedures: [],
    createdAt: `${todayStr}T07:00:00`,
  },
]

// ============================
// FINANCEIRO
// ============================

export const MOCK_TRANSACTIONS: FinancialTransaction[] = [
  { id: 'tx-01', clinicId: 'clinic-01', patientId: 'pat-01', patientName: 'Beatriz Oliveira', type: 'INCOME', status: 'PAID', description: 'Botox — sessão 1/1', amount: 800, amountPaid: 800, dueDate: '2025-01-10', paidDate: '2025-01-10', paymentMethod: 'pix', installments: 1, installmentNum: 1, category: 'procedimento', createdAt: '2025-01-10T10:00:00Z' },
  { id: 'tx-02', clinicId: 'clinic-01', patientId: 'pat-02', patientName: 'Fernanda Costa', type: 'INCOME', status: 'PAID', description: 'Preenchimento Labial', amount: 1200, amountPaid: 1200, dueDate: '2025-01-08', paidDate: '2025-01-08', paymentMethod: 'cartao_credito', installments: 2, installmentNum: 1, category: 'procedimento', createdAt: '2025-01-08T11:00:00Z' },
  { id: 'tx-03', clinicId: 'clinic-01', patientId: 'pat-05', patientName: 'Mariana Rodrigues', type: 'INCOME', status: 'PAID', description: 'Consulta Nutricional', amount: 250, amountPaid: 250, dueDate: '2025-01-15', paidDate: '2025-01-15', paymentMethod: 'dinheiro', installments: 1, installmentNum: 1, category: 'consulta', createdAt: '2025-01-15T09:00:00Z' },
  { id: 'tx-04', clinicId: 'clinic-01', patientId: 'pat-04', patientName: 'Juliana Santos', type: 'INCOME', status: 'PENDING', description: 'Drenagem Linfática — pacote 5 sessões', amount: 1500, amountPaid: 0, dueDate: '2025-02-01', paymentMethod: 'boleto', installments: 1, installmentNum: 1, category: 'pacote', createdAt: '2025-01-20T10:00:00Z' },
  { id: 'tx-05', clinicId: 'clinic-01', type: 'EXPENSE', status: 'PAID', description: 'Aluguel — Fevereiro/2025', amount: 4500, amountPaid: 4500, dueDate: '2025-02-05', paidDate: '2025-02-05', paymentMethod: 'transferencia', installments: 1, installmentNum: 1, category: 'fixo', createdAt: '2025-02-05T09:00:00Z' },
  { id: 'tx-06', clinicId: 'clinic-01', type: 'EXPENSE', status: 'PAID', description: 'Insumos e materiais — Jan/2025', amount: 2100, amountPaid: 2100, dueDate: '2025-01-20', paidDate: '2025-01-20', paymentMethod: 'cartao_credito', installments: 1, installmentNum: 1, category: 'insumos', createdAt: '2025-01-20T09:00:00Z' },
  { id: 'tx-07', clinicId: 'clinic-01', patientId: 'pat-03', patientName: 'Carla Mendes', type: 'INCOME', status: 'OVERDUE', description: 'Drenagem Linfática — sessão avulsa', amount: 350, amountPaid: 0, dueDate: '2025-01-05', paymentMethod: 'boleto', installments: 1, installmentNum: 1, category: 'procedimento', createdAt: '2025-01-05T10:00:00Z' },
  { id: 'tx-08', clinicId: 'clinic-01', patientId: 'pat-07', patientName: 'Roberta Almeida', type: 'INCOME', status: 'PENDING', description: 'Avaliação inicial', amount: 150, amountPaid: 0, dueDate: '2025-02-28', paymentMethod: undefined, installments: 1, installmentNum: 1, category: 'consulta', createdAt: '2025-01-20T11:00:00Z' },
  { id: 'tx-09', clinicId: 'clinic-01', type: 'EXPENSE', status: 'PENDING', description: 'Marketing Digital — Março/2025', amount: 1800, amountPaid: 0, dueDate: '2025-03-01', paymentMethod: undefined, installments: 1, installmentNum: 1, category: 'marketing', createdAt: '2025-02-20T09:00:00Z' },
  { id: 'tx-10', clinicId: 'clinic-01', type: 'EXPENSE', status: 'PAID', description: 'Folha de pagamento — Fevereiro/2025', amount: 8500, amountPaid: 8500, dueDate: '2025-02-28', paidDate: '2025-02-28', paymentMethod: 'transferencia', installments: 1, installmentNum: 1, category: 'pessoal', createdAt: '2025-02-28T09:00:00Z' },
]

// ============================
// ORÇAMENTOS
// ============================

export const MOCK_BUDGETS: Budget[] = [
  {
    id: 'bud-01', clinicId: 'clinic-01', patientId: 'pat-01', patientName: 'Beatriz Oliveira',
    number: 'ORC-001', title: 'Protocolo Facial Completo',
    status: 'approved', totalAmount: 3600, discount: 360, finalAmount: 3240,
    validUntil: '2025-03-01', approvedAt: '2025-01-15',
    createdAt: '2025-01-10T00:00:00Z',
    items: [
      { id: 'bi-01', description: 'Botox — 3 sessões', quantity: 3, unitPrice: 800, totalPrice: 2400, executed: false },
      { id: 'bi-02', description: 'Peeling Químico', quantity: 3, unitPrice: 400, totalPrice: 1200, executed: false },
    ],
  },
  {
    id: 'bud-02', clinicId: 'clinic-01', patientId: 'pat-02', patientName: 'Fernanda Costa',
    number: 'ORC-002', title: 'Harmonização Orofacial',
    status: 'sent', totalAmount: 2800, discount: 0, finalAmount: 2800,
    validUntil: '2025-02-28',
    createdAt: '2025-01-20T00:00:00Z',
    items: [
      { id: 'bi-03', description: 'Preenchimento Labial', quantity: 1, unitPrice: 1200, totalPrice: 1200, executed: false },
      { id: 'bi-04', description: 'Preenchimento Malar', quantity: 1, unitPrice: 1600, totalPrice: 1600, executed: false },
    ],
  },
  {
    id: 'bud-03', clinicId: 'clinic-01', patientId: 'pat-04', patientName: 'Juliana Santos',
    number: 'ORC-003', title: 'Pacote Corporal',
    status: 'followup', totalAmount: 2500, discount: 250, finalAmount: 2250,
    validUntil: '2025-02-15',
    createdAt: '2025-01-25T00:00:00Z',
    items: [
      { id: 'bi-05', description: 'Drenagem Linfática — 5 sessões', quantity: 5, unitPrice: 350, totalPrice: 1750, executed: false },
      { id: 'bi-06', description: 'Crioterapia — 3 sessões', quantity: 3, unitPrice: 250, totalPrice: 750, executed: false },
    ],
  },
  {
    id: 'bud-04', clinicId: 'clinic-01', patientId: 'pat-03', patientName: 'Carla Mendes',
    number: 'ORC-004',
    status: 'rejected', totalAmount: 5000, discount: 500, finalAmount: 4500,
    createdAt: '2025-01-05T00:00:00Z',
    items: [
      { id: 'bi-07', description: 'Protocolo Premium', quantity: 1, unitPrice: 5000, totalPrice: 5000, executed: false },
    ],
  },
]

// ============================
// LEADS / CRM
// ============================

export const MOCK_LEADS: Lead[] = [
  { id: 'lead-01', clinicId: 'clinic-01', name: 'Amanda Lima', email: 'amanda@email.com', phone: '(11) 98000-0001', source: 'instagram', campaignName: 'Campanha Verão 2025', status: 'NEW', score: 72, interest: 'Botox', createdAt: '2025-02-10T10:00:00Z', updatedAt: '2025-02-10T10:00:00Z' },
  { id: 'lead-02', clinicId: 'clinic-01', name: 'Cristina Barros', phone: '(11) 98000-0002', source: 'facebook', status: 'CONTACTED', score: 58, interest: 'Preenchimento', createdAt: '2025-02-08T11:00:00Z', updatedAt: '2025-02-09T14:00:00Z' },
  { id: 'lead-03', clinicId: 'clinic-01', name: 'Diego Moreira', phone: '(11) 98000-0003', source: 'google', status: 'SCHEDULED', score: 85, interest: 'Avaliação Geral', createdAt: '2025-02-05T09:00:00Z', updatedAt: '2025-02-11T10:00:00Z' },
  { id: 'lead-04', clinicId: 'clinic-01', name: 'Elaine Pereira', email: 'elaine@email.com', phone: '(11) 98000-0004', source: 'instagram', status: 'CONVERTED', score: 92, interest: 'Botox + Preenchimento', createdAt: '2025-01-28T15:00:00Z', updatedAt: '2025-02-03T11:00:00Z' },
  { id: 'lead-05', clinicId: 'clinic-01', name: 'Felipe Nascimento', phone: '(11) 98000-0005', source: 'indicacao', status: 'NEW', score: 63, interest: 'Drenagem', createdAt: '2025-02-12T08:00:00Z', updatedAt: '2025-02-12T08:00:00Z' },
  { id: 'lead-06', clinicId: 'clinic-01', name: 'Gabriela Teixeira', email: 'gabi@email.com', phone: '(11) 98000-0006', source: 'facebook', status: 'LOST', score: 25, interest: 'Botox', lostReason: 'Preço', createdAt: '2025-01-20T10:00:00Z', updatedAt: '2025-01-25T16:00:00Z' },
  { id: 'lead-07', clinicId: 'clinic-01', name: 'Helena Castro', phone: '(11) 98000-0007', source: 'tiktok', status: 'CONTACTED', score: 47, interest: 'Peeling', createdAt: '2025-02-11T13:00:00Z', updatedAt: '2025-02-12T09:00:00Z' },
  { id: 'lead-08', clinicId: 'clinic-01', name: 'Igor Santos', phone: '(11) 98000-0008', source: 'google', status: 'SCHEDULED', score: 78, interest: 'Avaliação', createdAt: '2025-02-09T14:00:00Z', updatedAt: '2025-02-12T11:00:00Z' },
]

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'camp-01', clinicId: 'clinic-01', name: 'Campanha Verão 2025', platform: 'meta', status: 'active', budget: 3000, spent: 1850, leads: 47, conversions: 12, cpl: 39.4, conversionRate: 25.5, startDate: '2025-01-15', endDate: '2025-03-15' },
  { id: 'camp-02', clinicId: 'clinic-01', name: 'Google — Botox São Paulo', platform: 'google', status: 'active', budget: 1500, spent: 980, leads: 28, conversions: 9, cpl: 35.0, conversionRate: 32.1, startDate: '2025-01-01' },
  { id: 'camp-03', clinicId: 'clinic-01', name: 'Reativação — Pacientes Inativos', platform: 'whatsapp', status: 'completed', budget: 0, spent: 0, leads: 18, conversions: 7, cpl: 0, conversionRate: 38.9, startDate: '2025-01-10', endDate: '2025-01-31' },
]

// ============================
// SCORE DE SAÚDE
// ============================

export const MOCK_HEALTH_SCORES: ClinicHealthScore[] = [
  {
    id: 'hs-01', clinicId: 'clinic-01', period: '2025-02',
    overallScore: 72,
    patientScore: 78, productionScore: 68, peopleScore: 75,
    processScore: 65, planningScore: 80, prosperityScore: 70,
    occupancyRate: 71.4, absenceRate: 12.5, returnRate: 58.0,
    conversionRate: 62.0, npsScore: 8.4, avgTicket: 680,
    defaultRate: 4.2, revenueGrowth: 8.5,
  },
  {
    id: 'hs-02', clinicId: 'clinic-01', period: '2025-01',
    overallScore: 67,
    patientScore: 72, productionScore: 63, peopleScore: 70,
    processScore: 60, planningScore: 72, prosperityScore: 65,
    occupancyRate: 65.2, absenceRate: 14.8, returnRate: 54.0,
    conversionRate: 58.0, npsScore: 8.0, avgTicket: 620,
    defaultRate: 5.8, revenueGrowth: 3.2,
  },
  {
    id: 'hs-03', clinicId: 'clinic-02', period: '2025-02',
    overallScore: 81,
    patientScore: 85, productionScore: 82, peopleScore: 79,
    processScore: 78, planningScore: 83, prosperityScore: 80,
    occupancyRate: 82.0, absenceRate: 8.2, returnRate: 68.0,
    conversionRate: 71.0, npsScore: 8.9, avgTicket: 950,
    defaultRate: 2.1, revenueGrowth: 15.3,
  },
  {
    id: 'hs-04', clinicId: 'clinic-03', period: '2025-02',
    overallScore: 55,
    patientScore: 52, productionScore: 58, peopleScore: 60,
    processScore: 50, planningScore: 55, prosperityScore: 53,
    occupancyRate: 55.0, absenceRate: 18.5, returnRate: 48.0,
    conversionRate: 50.0, npsScore: 7.2, avgTicket: 380,
    defaultRate: 8.5, revenueGrowth: -2.1,
  },
  {
    id: 'hs-05', clinicId: 'clinic-04', period: '2025-02',
    overallScore: 43,
    patientScore: 45, productionScore: 40, peopleScore: 50,
    processScore: 38, planningScore: 45, prosperityScore: 40,
    occupancyRate: 42.0, absenceRate: 22.0, returnRate: 38.0,
    conversionRate: 40.0, npsScore: 6.8, avgTicket: 280,
    defaultRate: 12.0, revenueGrowth: -8.5,
  },
]

// ============================
// PLANOS DE AÇÃO
// ============================

export const MOCK_ACTION_PLANS: ActionPlan[] = [
  {
    id: 'ap-01', clinicId: 'clinic-01',
    title: 'Reduzir Taxa de Faltas',
    description: 'Taxa de faltas está 25% acima da média do setor (12,5% vs benchmark de 10%). Ação: implementar confirmação automatizada via WhatsApp 24h e 2h antes.',
    priority: 'high', status: 'in_progress',
    kpiMetric: 'absenceRate', targetValue: 8.0,
    dueDate: '2025-03-31', createdAt: '2025-02-01T00:00:00Z',
    tasks: [
      { id: 't-01', title: 'Configurar automação WhatsApp 24h antes', completed: true, dueDate: '2025-02-10' },
      { id: 't-02', title: 'Configurar lembrete 2h antes da consulta', completed: true, dueDate: '2025-02-10' },
      { id: 't-03', title: 'Treinar recepcionistas no novo fluxo', completed: false, dueDate: '2025-02-20' },
      { id: 't-04', title: 'Monitorar resultado por 30 dias', completed: false, dueDate: '2025-03-31' },
    ],
  },
  {
    id: 'ap-02', clinicId: 'clinic-01',
    title: 'Aumentar Taxa de Conversão de Orçamentos',
    description: 'Conversão de orçamentos em 62%, abaixo da meta de 65%. Implementar follow-up estruturado com 3 pontos de contato após envio do orçamento.',
    priority: 'medium', status: 'open',
    kpiMetric: 'conversionRate', targetValue: 70.0,
    dueDate: '2025-04-30', createdAt: '2025-02-05T00:00:00Z',
    tasks: [
      { id: 't-05', title: 'Criar script de follow-up D+1, D+3 e D+7', completed: false, dueDate: '2025-02-25' },
      { id: 't-06', title: 'Implementar régua de follow-up no sistema', completed: false, dueDate: '2025-03-10' },
      { id: 't-07', title: 'Capacitar equipe de vendas', completed: false, dueDate: '2025-03-20' },
    ],
  },
  {
    id: 'ap-03', clinicId: 'clinic-01',
    title: 'Elevar Taxa de Ocupação para 75%',
    description: 'Ocupação atual em 71,4%. Meta de 75%. Estratégia: campanhas de reativação para pacientes inativos há mais de 60 dias.',
    priority: 'medium', status: 'in_progress',
    kpiMetric: 'occupancyRate', targetValue: 75.0,
    dueDate: '2025-03-31', createdAt: '2025-01-20T00:00:00Z',
    tasks: [
      { id: 't-08', title: 'Segmentar pacientes inativos 60+ dias', completed: true, dueDate: '2025-01-25' },
      { id: 't-09', title: 'Criar campanha de reativação WhatsApp', completed: true, dueDate: '2025-02-01' },
      { id: 't-10', title: 'Lançar campanha e monitorar respostas', completed: false, dueDate: '2025-03-15' },
    ],
  },
]

// ============================
// METAS
// ============================

export const MOCK_GOALS: Goal[] = [
  { id: 'g-01', clinicId: 'clinic-01', title: 'Faturamento Mensal', metric: 'revenue', targetValue: 45000, currentValue: 38400, period: 'monthly', startDate: '2025-02-01', endDate: '2025-02-28', status: 'active', percentComplete: 85.3 },
  { id: 'g-02', clinicId: 'clinic-01', title: 'Novos Pacientes', metric: 'new_patients', targetValue: 20, currentValue: 14, period: 'monthly', startDate: '2025-02-01', endDate: '2025-02-28', status: 'active', percentComplete: 70 },
  { id: 'g-03', clinicId: 'clinic-01', professionalId: 'prof-01', professionalName: 'Dra. Camila Ferreira', title: 'Conversão de Orçamentos', metric: 'conversion', targetValue: 70, currentValue: 64, period: 'monthly', startDate: '2025-02-01', endDate: '2025-02-28', status: 'active', percentComplete: 91.4 },
  { id: 'g-04', clinicId: 'clinic-01', title: 'Taxa de Faltas', metric: 'absence_rate', targetValue: 8, currentValue: 12.5, period: 'monthly', startDate: '2025-02-01', endDate: '2025-02-28', status: 'active', percentComplete: 40 },
  { id: 'g-05', clinicId: 'clinic-01', title: 'NPS Médio', metric: 'nps', targetValue: 9.0, currentValue: 8.4, period: 'monthly', startDate: '2025-02-01', endDate: '2025-02-28', status: 'active', percentComplete: 93.3 },
]

// ============================
// DADOS DOS GRÁFICOS
// ============================

export const MONTHLY_REVENUE = [
  { name: 'Set', receita: 28400, despesas: 18200, lucro: 10200 },
  { name: 'Out', receita: 31200, despesas: 19500, lucro: 11700 },
  { name: 'Nov', receita: 33800, despesas: 20100, lucro: 13700 },
  { name: 'Dez', receita: 41500, despesas: 22000, lucro: 19500 },
  { name: 'Jan', receita: 35200, despesas: 21300, lucro: 13900 },
  { name: 'Fev', receita: 38400, despesas: 22800, lucro: 15600 },
]

export const APPOINTMENT_STATS = [
  { name: 'Set', total: 142, faltas: 21, desmarcados: 18, atendidos: 103 },
  { name: 'Out', total: 158, faltas: 19, desmarcados: 15, atendidos: 124 },
  { name: 'Nov', total: 165, faltas: 22, desmarcados: 20, atendidos: 123 },
  { name: 'Dez', total: 148, faltas: 25, desmarcados: 22, atendidos: 101 },
  { name: 'Jan', total: 170, faltas: 24, desmarcados: 17, atendidos: 129 },
  { name: 'Fev', total: 182, faltas: 23, desmarcados: 16, atendidos: 143 },
]

export const PROCEDURES_MIX = [
  { name: 'Botox', value: 32, color: '#3B82F6' },
  { name: 'Preenchimento', value: 24, color: '#8B5CF6' },
  { name: 'Drenagem', value: 18, color: '#10B981' },
  { name: 'Peeling', value: 12, color: '#F59E0B' },
  { name: 'Outros', value: 14, color: '#94A3B8' },
]

export const FUNNEL_DATA = [
  { stage: 'Leads', value: 93, color: '#3B82F6' },
  { stage: 'Contato', value: 71, color: '#6366F1' },
  { stage: 'Agendamento', value: 52, color: '#8B5CF6' },
  { stage: 'Orçamento', value: 38, color: '#A855F7' },
  { stage: 'Conversão', value: 24, color: '#10B981' },
]

export const HEALTH_SCORE_HISTORY = [
  { period: 'Set/24', score: 58 },
  { period: 'Out/24', score: 62 },
  { period: 'Nov/24', score: 60 },
  { period: 'Dez/24', score: 64 },
  { period: 'Jan/25', score: 67 },
  { period: 'Fev/25', score: 72 },
]
