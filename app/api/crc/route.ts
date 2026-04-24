/**
 * GET /api/crc
 * Retorna categorias do CRC com pacientes reais
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinicId  = (session.user as any).clinicId as string
  const now       = new Date()
  const tomorrow  = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
  const birthMonth = String(now.getMonth() + 1).padStart(2, '0')

  const patientSelect = {
    id: true, name: true, phone: true, whatsapp: true,
    birthDate: true, lastVisit: true, status: true,
  }

  // Sem confirmação (hoje + amanhã)
  const unconfirmedApts = await prisma.appointment.findMany({
    where: {
      clinicId,
      confirmed: false,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      startTime: { gte: now, lte: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) },
      patient: { isNot: null },
    },
    include: { patient: { select: patientSelect } },
    distinct: ['patientId'],
  })
  const unconfirmed = unconfirmedApts.map(a => a.patient).filter(Boolean)

  // Aniversariantes do mês
  const allPatients = await prisma.patient.findMany({
    where: { clinicId, status: 'ACTIVE', birthDate: { not: null } },
    select: patientSelect,
  })
  const birthdays = allPatients.filter(
    p => p.birthDate && String(p.birthDate.getMonth() + 1).padStart(2, '0') === birthMonth,
  )

  // Faltas (últimos 30 dias)
  const absentApts = await prisma.appointment.findMany({
    where: {
      clinicId, status: 'ABSENT',
      startTime: { gte: subDays(now, 30) },
      patient: { isNot: null },
    },
    include: { patient: { select: patientSelect } },
    distinct: ['patientId'],
  })
  const absent = absentApts.map(a => a.patient).filter(Boolean)

  // Falta — 1ª consulta
  const firstAbsentApts = await prisma.appointment.findMany({
    where: {
      clinicId, status: 'ABSENT', isFirstVisit: true,
      startTime: { gte: subDays(now, 30) },
      patient: { isNot: null },
    },
    include: { patient: { select: patientSelect } },
    distinct: ['patientId'],
  })
  const firstAbsent = firstAbsentApts.map(a => a.patient).filter(Boolean)

  // Reativação (sem visita há +60 dias ou inativos)
  const inactive = await prisma.patient.findMany({
    where: {
      clinicId,
      status: { not: 'BLOCKED' },
      OR: [
        { status: 'INACTIVE' },
        { lastVisit: { lt: subDays(now, 60) } },
        { lastVisit: null, createdAt: { lt: subDays(now, 90) } },
      ],
    },
    select: patientSelect,
  })

  // Inadimplentes
  const debtTxs = await prisma.financialTransaction.findMany({
    where: { clinicId, type: 'INCOME', status: 'OVERDUE', patient: { isNot: null } },
    include: { patient: { select: patientSelect } },
    distinct: ['patientId'],
  })
  const debtors = debtTxs.map(t => t.patient).filter(Boolean)

  const format = (list: any[]) =>
    list.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      whatsapp: p.whatsapp,
    }))

  return NextResponse.json({
    unconfirmed:  format(unconfirmed),
    birthdays:    format(birthdays),
    absent:       format(absent),
    firstAbsent:  format(firstAbsent),
    inactive:     format(inactive),
    debt:         format(debtors),
  })
}
