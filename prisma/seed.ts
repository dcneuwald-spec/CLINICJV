import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpa dados existentes na ordem correta
  await prisma.auditLog.deleteMany()
  await prisma.actionTask.deleteMany()
  await prisma.actionPlan.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.leadInteraction.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.budgetItem.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.financialTransaction.deleteMany()
  await prisma.appointmentProcedure.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.procedure.deleteMany()
  await prisma.anamnesis.deleteMany()
  await prisma.patientDocument.deleteMany()
  await prisma.patientPhoto.deleteMany()
  await prisma.returnAlert.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.clinicSettings.deleteMany()
  await prisma.consultantClinic.deleteMany()
  await prisma.clinicHealthScore.deleteMany()
  await prisma.clinicUser.deleteMany()
  await prisma.clinic.deleteMany()
  await prisma.user.deleteMany()

  const hash = (p: string) => bcrypt.hashSync(p, 10)

  // ============================
  // CLÍNICA
  // ============================
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Clínica Estética Bella Vita',
      tradeName: 'Bella Vita',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 3456-7890',
      email: 'contato@bellavita.com.br',
      website: 'www.bellavita.com.br',
      address: 'Av. Paulista, 1000 — Sala 501',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      specialty: 'estética',
      plan: 'pro',
    },
  })

  await prisma.clinicSettings.create({
    data: {
      clinicId: clinic.id,
      defaultConfirmChannel: 'whatsapp',
      confirmHoursBefore: 24,
      alertHoursBefore: 2,
      targetOccupancyRate: 75,
      targetConversionRate: 65,
      targetReturnRate: 60,
      targetNPS: 70,
      targetAbsenceRate: 10,
    },
  })

  // ============================
  // USUÁRIOS
  // ============================
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Admin ClinicJV', email: 'admin@clinicjv.com.br', password: hash('demo123'), role: 'ADMIN' } }),
    prisma.user.create({ data: { name: 'Consultor Demo', email: 'consultor@clinicjv.com.br', password: hash('demo123'), role: 'CONSULTANT' } }),
    prisma.user.create({ data: { name: 'Gestor Demo', email: 'gestor@clinicjv.com.br', password: hash('demo123'), role: 'MANAGER' } }),
    prisma.user.create({ data: { name: 'Dr. Profissional', email: 'profissional@clinicjv.com.br', password: hash('demo123'), role: 'PROFESSIONAL' } }),
    prisma.user.create({ data: { name: 'Recepção Demo', email: 'recepcao@clinicjv.com.br', password: hash('demo123'), role: 'RECEPTIONIST' } }),
  ])

  const [adminUser, , managerUser, , receptionUser] = users

  // Vincula todos ao clinic
  await Promise.all(
    users.map((u, i) =>
      prisma.clinicUser.create({
        data: { clinicId: clinic.id, userId: u.id, role: u.role },
      })
    )
  )

  // ============================
  // PROFISSIONAIS
  // ============================
  const profs = await Promise.all([
    prisma.professional.create({ data: { clinicId: clinic.id, name: 'Dra. Camila Ferreira', specialty: 'Estética Facial', crm: 'CRM/SP 123456', color: '#3B82F6', phone: '(11) 99999-0001', email: 'camila@bellavita.com.br', commission: 40 } }),
    prisma.professional.create({ data: { clinicId: clinic.id, name: 'Dr. Ricardo Alves', specialty: 'Estética Corporal', crm: 'CRM/SP 654321', color: '#10B981', phone: '(11) 99999-0002', email: 'ricardo@bellavita.com.br', commission: 35 } }),
    prisma.professional.create({ data: { clinicId: clinic.id, name: 'Dra. Ana Souza', specialty: 'Nutrição Estética', color: '#F59E0B', phone: '(11) 99999-0003', email: 'ana@bellavita.com.br', commission: 30 } }),
    prisma.professional.create({ data: { clinicId: clinic.id, name: 'Dra. Patrícia Lima', specialty: 'Dermatologia', crm: 'CRM/SP 789012', color: '#8B5CF6', phone: '(11) 99999-0004', commission: 45 } }),
  ])

  // ============================
  // PROCEDIMENTOS
  // ============================
  const procedures = await Promise.all([
    prisma.procedure.create({ data: { clinicId: clinic.id, name: 'Botox', price: 1200, duration: 60, category: 'Facial' } }),
    prisma.procedure.create({ data: { clinicId: clinic.id, name: 'Preenchimento Labial', price: 1500, duration: 60, category: 'Facial' } }),
    prisma.procedure.create({ data: { clinicId: clinic.id, name: 'Limpeza de Pele', price: 300, duration: 60, category: 'Facial' } }),
    prisma.procedure.create({ data: { clinicId: clinic.id, name: 'Avaliação', price: 0, duration: 30, category: 'Geral' } }),
    prisma.procedure.create({ data: { clinicId: clinic.id, name: 'Peeling Químico', price: 450, duration: 45, category: 'Facial' } }),
    prisma.procedure.create({ data: { clinicId: clinic.id, name: 'Drenagem Linfática', price: 220, duration: 60, category: 'Corporal' } }),
  ])

  // ============================
  // PACIENTES
  // ============================
  const pats = await Promise.all([
    prisma.patient.create({ data: { clinicId: clinic.id, name: 'Beatriz Oliveira', nickname: 'Bia', email: 'beatriz@email.com', phone: '(11) 98765-4321', whatsapp: '(11) 98765-4321', birthDate: new Date('1990-05-15'), cpf: '123.456.789-00', gender: 'F', referralSource: 'Instagram', city: 'São Paulo', state: 'SP', status: 'ACTIVE', registrationNum: 'BV-0001', firstVisit: new Date('2023-01-10'), lastVisit: new Date('2024-12-20'), totalSpent: 4800, npsScore: 9 } }),
    prisma.patient.create({ data: { clinicId: clinic.id, name: 'Fernanda Costa', phone: '(11) 97654-3210', email: 'fernanda@email.com', birthDate: new Date('1985-09-22'), cpf: '987.654.321-00', gender: 'F', referralSource: 'Indicação', city: 'São Paulo', state: 'SP', status: 'ACTIVE', registrationNum: 'BV-0002', firstVisit: new Date('2023-03-05'), lastVisit: new Date('2025-01-08'), totalSpent: 12300, npsScore: 10 } }),
    prisma.patient.create({ data: { clinicId: clinic.id, name: 'Carla Mendes', phone: '(11) 96543-2109', email: 'carla@email.com', birthDate: new Date('1995-12-01'), gender: 'F', referralSource: 'Google', city: 'Osasco', state: 'SP', status: 'ACTIVE', registrationNum: 'BV-0003', firstVisit: new Date('2024-02-14'), lastVisit: new Date('2024-11-30'), totalSpent: 2100, npsScore: 8 } }),
    prisma.patient.create({ data: { clinicId: clinic.id, name: 'Juliana Santos', phone: '(11) 95432-1098', birthDate: new Date('1988-07-18'), gender: 'F', referralSource: 'Facebook Ads', city: 'Santo André', state: 'SP', status: 'ACTIVE', registrationNum: 'BV-0004', firstVisit: new Date('2024-06-01'), lastVisit: new Date('2025-01-15'), totalSpent: 6500, npsScore: 7 } }),
    prisma.patient.create({ data: { clinicId: clinic.id, name: 'Mariana Rodrigues', phone: '(11) 94321-0987', email: 'mariana@email.com', birthDate: new Date('1993-03-25'), gender: 'F', referralSource: 'Indicação', city: 'São Paulo', state: 'SP', status: 'ACTIVE', registrationNum: 'BV-0005', firstVisit: new Date('2023-08-20'), lastVisit: new Date('2025-02-01'), totalSpent: 9200, npsScore: 9 } }),
    prisma.patient.create({ data: { clinicId: clinic.id, name: 'Tatiane Ferreira', phone: '(11) 93210-9876', birthDate: new Date('1980-11-10'), gender: 'F', referralSource: 'Instagram', city: 'São Paulo', state: 'SP', status: 'INACTIVE', registrationNum: 'BV-0006', firstVisit: new Date('2022-05-12'), lastVisit: new Date('2023-09-30'), totalSpent: 3400 } }),
    prisma.patient.create({ data: { clinicId: clinic.id, name: 'Roberta Almeida', phone: '(11) 92109-8765', email: 'roberta@email.com', birthDate: new Date('1997-01-07'), gender: 'F', referralSource: 'TikTok', city: 'São Paulo', state: 'SP', status: 'ACTIVE', registrationNum: 'BV-0007', firstVisit: new Date('2025-01-20'), lastVisit: new Date('2025-01-20'), totalSpent: 450, npsScore: 8 } }),
    prisma.patient.create({ data: { clinicId: clinic.id, name: 'Paulo Henrique', phone: '(11) 91098-7654', birthDate: new Date('1982-06-30'), gender: 'M', referralSource: 'Google', city: 'São Paulo', state: 'SP', status: 'ACTIVE', registrationNum: 'BV-0008', firstVisit: new Date('2024-09-10'), lastVisit: new Date('2025-01-10'), totalSpent: 3200 } }),
  ])

  // ============================
  // AGENDAMENTOS (hoje)
  // ============================
  const today = new Date()
  const d = (h: number, m = 0) => { const dt = new Date(today); dt.setHours(h, m, 0, 0); return dt }

  await Promise.all([
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[0].id, createdById: receptionUser.id, patientId: pats[0].id, startTime: d(8), endTime: d(9), duration: 60, status: 'ATTENDED', isFirstVisit: false } }),
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[0].id, createdById: receptionUser.id, patientId: pats[1].id, startTime: d(9), endTime: d(10), duration: 60, status: 'IN_PROGRESS', isFirstVisit: false } }),
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[0].id, createdById: receptionUser.id, patientId: pats[2].id, startTime: d(10), endTime: d(11), duration: 60, status: 'WAITING', isFirstVisit: false } }),
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[0].id, createdById: receptionUser.id, patientId: pats[3].id, startTime: d(11), endTime: d(12), duration: 60, status: 'CONFIRMED', isFirstVisit: false } }),
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[1].id, createdById: receptionUser.id, patientId: pats[4].id, startTime: d(8), endTime: d(9), duration: 60, status: 'ATTENDED', isFirstVisit: false } }),
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[1].id, createdById: receptionUser.id, patientId: pats[5].id, startTime: d(9, 30), endTime: d(10, 30), duration: 60, status: 'ABSENT', isFirstVisit: false } }),
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[1].id, createdById: receptionUser.id, patientId: pats[6].id, startTime: d(11), endTime: d(12), duration: 60, status: 'SCHEDULED', isFirstVisit: true } }),
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[2].id, createdById: receptionUser.id, patientId: pats[7].id, startTime: d(9), endTime: d(10), duration: 60, status: 'CONFIRMED', isFirstVisit: false } }),
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[3].id, createdById: receptionUser.id, patientId: pats[0].id, startTime: d(14), endTime: d(15), duration: 60, status: 'SCHEDULED', isFirstVisit: false } }),
    prisma.appointment.create({ data: { clinicId: clinic.id, professionalId: profs[3].id, createdById: receptionUser.id, patientId: pats[2].id, startTime: d(15), endTime: d(16), duration: 60, status: 'SCHEDULED', isFirstVisit: false } }),
  ])

  // ============================
  // FINANCEIRO
  // ============================
  const past = (days: number) => { const d = new Date(); d.setDate(d.getDate() - days); return d }

  await Promise.all([
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, patientId: pats[0].id, type: 'INCOME', status: 'PAID', description: 'Botox — Beatriz', amount: 1200, amountPaid: 1200, dueDate: past(20), paidDate: past(20), paymentMethod: 'pix', category: 'Consulta' } }),
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, patientId: pats[1].id, type: 'INCOME', status: 'PAID', description: 'Preenchimento Labial — Fernanda', amount: 1500, amountPaid: 1500, dueDate: past(15), paidDate: past(15), paymentMethod: 'cartao', category: 'Consulta' } }),
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, patientId: pats[2].id, type: 'INCOME', status: 'PENDING', description: 'Limpeza de Pele — Carla', amount: 300, amountPaid: 0, dueDate: past(-5), paymentMethod: 'pix', category: 'Consulta' } }),
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, patientId: pats[3].id, type: 'INCOME', status: 'PAID', description: 'Peeling Químico — Juliana', amount: 450, amountPaid: 450, dueDate: past(10), paidDate: past(10), paymentMethod: 'dinheiro', category: 'Consulta' } }),
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, patientId: pats[4].id, type: 'INCOME', status: 'OVERDUE', description: 'Botox — Mariana', amount: 1200, amountPaid: 0, dueDate: past(30), category: 'Consulta' } }),
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, type: 'EXPENSE', status: 'PAID', description: 'Aluguel — Fevereiro', amount: 4500, amountPaid: 4500, dueDate: past(5), paidDate: past(5), paymentMethod: 'transferencia', category: 'Aluguel' } }),
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, type: 'EXPENSE', status: 'PAID', description: 'Materiais e Insumos', amount: 1200, amountPaid: 1200, dueDate: past(8), paidDate: past(8), paymentMethod: 'pix', category: 'Insumos' } }),
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, type: 'EXPENSE', status: 'PENDING', description: 'Energia Elétrica', amount: 680, amountPaid: 0, dueDate: past(-3), category: 'Utilidades' } }),
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, patientId: pats[5].id, type: 'INCOME', status: 'PAID', description: 'Drenagem — Mariana', amount: 660, amountPaid: 660, dueDate: past(12), paidDate: past(12), paymentMethod: 'pix', category: 'Consulta' } }),
    prisma.financialTransaction.create({ data: { clinicId: clinic.id, type: 'EXPENSE', status: 'PAID', description: 'Contador / Honorários', amount: 900, amountPaid: 900, dueDate: past(2), paidDate: past(2), paymentMethod: 'transferencia', category: 'Administrativo' } }),
  ])

  // ============================
  // ORÇAMENTOS
  // ============================
  await Promise.all([
    prisma.budget.create({
      data: {
        clinicId: clinic.id, patientId: pats[0].id,
        number: 'ORC-2025-001', title: 'Protocolo Facial Completo',
        status: 'approved', totalAmount: 3600, discount: 360, finalAmount: 3240,
        validUntil: new Date(Date.now() + 30 * 86400000), approvedAt: past(5),
        items: { create: [
          { description: 'Botox 3 sessões', quantity: 3, unitPrice: 1200, totalPrice: 3600 },
        ]},
      },
    }),
    prisma.budget.create({
      data: {
        clinicId: clinic.id, patientId: pats[1].id,
        number: 'ORC-2025-002', title: 'Rejuvenescimento Facial',
        status: 'sent', totalAmount: 2700, discount: 0, finalAmount: 2700,
        validUntil: new Date(Date.now() + 15 * 86400000),
        items: { create: [
          { description: 'Preenchimento Labial', quantity: 1, unitPrice: 1500, totalPrice: 1500 },
          { description: 'Peeling Químico', quantity: 1, unitPrice: 450, totalPrice: 450 },
          { description: 'Limpeza de Pele', quantity: 1, unitPrice: 300, totalPrice: 300 },
          { description: 'Botox', quantity: 1, unitPrice: 1200, totalPrice: 1200 },
        ]},
      },
    }),
    prisma.budget.create({
      data: {
        clinicId: clinic.id, patientId: pats[2].id,
        number: 'ORC-2025-003',
        status: 'followup', totalAmount: 900, discount: 0, finalAmount: 900,
        validUntil: new Date(Date.now() + 7 * 86400000),
        items: { create: [
          { description: 'Limpeza de Pele 3x', quantity: 3, unitPrice: 300, totalPrice: 900 },
        ]},
      },
    }),
    prisma.budget.create({
      data: {
        clinicId: clinic.id, patientId: pats[3].id,
        number: 'ORC-2025-004',
        status: 'rejected', totalAmount: 4500, discount: 0, finalAmount: 4500,
        rejectedAt: past(10),
        items: { create: [
          { description: 'Botox + Preenchimento', quantity: 1, unitPrice: 4500, totalPrice: 4500 },
        ]},
      },
    }),
  ])

  // ============================
  // LEADS
  // ============================
  await Promise.all([
    prisma.lead.create({ data: { clinicId: clinic.id, name: 'Amanda Silva', email: 'amanda@email.com', phone: '(11) 98000-0001', source: 'instagram', status: 'NEW', score: 72, interest: 'Botox' } }),
    prisma.lead.create({ data: { clinicId: clinic.id, name: 'Bruno Santos', phone: '(11) 98000-0002', source: 'google', status: 'CONTACTED', score: 55, interest: 'Avaliação' } }),
    prisma.lead.create({ data: { clinicId: clinic.id, name: 'Claudia Lima', email: 'claudia@email.com', phone: '(11) 98000-0003', source: 'facebook', status: 'SCHEDULED', score: 88, interest: 'Preenchimento' } }),
    prisma.lead.create({ data: { clinicId: clinic.id, name: 'Daniela Rocha', email: 'daniela@email.com', phone: '(11) 98000-0004', source: 'instagram', status: 'CONVERTED', score: 95, interest: 'Botox + Preenchimento', convertedAt: past(5) } }),
    prisma.lead.create({ data: { clinicId: clinic.id, name: 'Eduardo Costa', phone: '(11) 98000-0005', source: 'indicacao', status: 'NEW', score: 40, interest: 'Drenagem' } }),
    prisma.lead.create({ data: { clinicId: clinic.id, name: 'Fernanda Viana', email: 'fviana@email.com', phone: '(11) 98000-0006', source: 'facebook', status: 'LOST', score: 20, interest: 'Botox', lostReason: 'Preço', lostAt: past(8) } }),
    prisma.lead.create({ data: { clinicId: clinic.id, name: 'Gustavo Mendes', phone: '(11) 98000-0007', source: 'tiktok', status: 'CONTACTED', score: 60, interest: 'Peeling' } }),
    prisma.lead.create({ data: { clinicId: clinic.id, name: 'Helena Torres', phone: '(11) 98000-0008', source: 'google', status: 'SCHEDULED', score: 78, interest: 'Avaliação' } }),
  ])

  // ============================
  // METAS
  // ============================
  const y = new Date().getFullYear()
  const m = new Date().getMonth()
  const monthStart = new Date(y, m, 1)
  const monthEnd = new Date(y, m + 1, 0)

  await Promise.all([
    prisma.goal.create({ data: { clinicId: clinic.id, title: 'Faturamento Mensal', metric: 'revenue', targetValue: 45000, currentValue: 32500, period: 'monthly', startDate: monthStart, endDate: monthEnd, status: 'active' } }),
    prisma.goal.create({ data: { clinicId: clinic.id, title: 'Novos Pacientes', metric: 'appointments', targetValue: 30, currentValue: 18, period: 'monthly', startDate: monthStart, endDate: monthEnd, status: 'active' } }),
    prisma.goal.create({ data: { clinicId: clinic.id, title: 'Taxa de Conversão de Orçamentos', metric: 'conversion', targetValue: 70, currentValue: 62, period: 'monthly', startDate: monthStart, endDate: monthEnd, status: 'active' } }),
    prisma.goal.create({ data: { clinicId: clinic.id, title: 'NPS da Clínica', metric: 'nps', targetValue: 80, currentValue: 86, period: 'monthly', startDate: monthStart, endDate: monthEnd, status: 'active' } }),
    prisma.goal.create({ data: { clinicId: clinic.id, professionalId: profs[0].id, title: 'Faturamento — Dra. Camila', metric: 'revenue', targetValue: 20000, currentValue: 14800, period: 'monthly', startDate: monthStart, endDate: monthEnd, status: 'active' } }),
  ])

  console.log('✅ Seed concluído com sucesso!')
  console.log('\n📧 Credenciais de acesso:')
  console.log('   consultor@clinicjv.com.br / demo123')
  console.log('   admin@clinicjv.com.br / demo123')
  console.log('   gestor@clinicjv.com.br / demo123')
  console.log('   profissional@clinicjv.com.br / demo123')
  console.log('   recepcao@clinicjv.com.br / demo123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
