/**
 * POST /api/whatsapp/campaigns
 *
 * Executa uma campanha de WhatsApp para uma categoria do CRC.
 * Body: { categoryId, customMessage?, clinicId? }
 *
 * categoryId pode ser:
 *   unconfirmed | birthdays | absent | first-absent | inactive | debt
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendWhatsApp, TEMPLATES } from '@/lib/whatsapp'
import { subDays } from 'date-fns'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinicId   = (session.user as any).clinicId as string
  const clinicName = (session.user as any).clinicName as string ?? 'Clínica'

  const { categoryId, customMessage, messageType = 'whatsapp' } = await req.json()

  if (!categoryId) {
    return NextResponse.json({ error: 'categoryId é obrigatório' }, { status: 400 })
  }

  if (messageType !== 'whatsapp') {
    // SMS / e-mail ainda não implementados — retorna aviso
    return NextResponse.json({
      ok: false,
      warning: 'Apenas WhatsApp está disponível. Configure SMS ou e-mail nas Integrações.',
    }, { status: 200 })
  }

  const now       = new Date()
  const tomorrow  = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
  const birthMonth = String(now.getMonth() + 1).padStart(2, '0')

  // ── Busca pacientes por categoria ─────────────────────────────
  let patients: { id: string; name: string; phone: string; whatsapp: string | null }[] = []
  let messageBuilder: (p: typeof patients[0]) => string

  switch (categoryId) {
    case 'unconfirmed': {
      const apts = await prisma.appointment.findMany({
        where: {
          clinicId,
          confirmed: false,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          startTime: {
            gte: now,
            lte: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
          },
          patient: { isNot: null },
        },
        include: {
          patient: { select: { id: true, name: true, phone: true, whatsapp: true } },
        },
        distinct: ['patientId'],
      })
      patients = apts
        .map(a => a.patient)
        .filter(Boolean) as typeof patients
      messageBuilder = p =>
        customMessage
          ? TEMPLATES.custom(customMessage, { nome: p.name })
          : TEMPLATES.confirmation({
              nome: p.name, clinica: clinicName,
              data: tomorrow.toLocaleDateString('pt-BR'),
              hora: '—', profissional: '—',
            })
      break
    }

    case 'birthdays': {
      const all = await prisma.patient.findMany({
        where: { clinicId, status: 'ACTIVE', birthDate: { not: null } },
        select: { id: true, name: true, phone: true, whatsapp: true, birthDate: true },
      })
      patients = all
        .filter(p => p.birthDate && String(p.birthDate.getMonth() + 1).padStart(2, '0') === birthMonth)
        .map(({ id, name, phone, whatsapp }) => ({ id, name, phone, whatsapp }))
      messageBuilder = p =>
        customMessage
          ? TEMPLATES.custom(customMessage, { nome: p.name })
          : TEMPLATES.birthday({ nome: p.name, clinica: clinicName, desconto: '15%' })
      break
    }

    case 'absent':
    case 'first-absent': {
      const apts = await prisma.appointment.findMany({
        where: {
          clinicId,
          status: 'ABSENT',
          startTime: { gte: subDays(now, 30) },
          ...(categoryId === 'first-absent' ? { isFirstVisit: true } : {}),
          patient: { isNot: null },
        },
        include: {
          patient: { select: { id: true, name: true, phone: true, whatsapp: true } },
        },
        distinct: ['patientId'],
      })
      patients = apts.map(a => a.patient).filter(Boolean) as typeof patients
      messageBuilder = p =>
        customMessage
          ? TEMPLATES.custom(customMessage, { nome: p.name })
          : TEMPLATES.absence({ nome: p.name, clinica: clinicName })
      break
    }

    case 'inactive': {
      patients = await prisma.patient.findMany({
        where: {
          clinicId,
          status: { not: 'BLOCKED' },
          OR: [
            { status: 'INACTIVE' },
            { lastVisit: { lt: subDays(now, 60) } },
            { lastVisit: null, createdAt: { lt: subDays(now, 90) } },
          ],
        },
        select: { id: true, name: true, phone: true, whatsapp: true },
      })
      messageBuilder = p =>
        customMessage
          ? TEMPLATES.custom(customMessage, { nome: p.name })
          : TEMPLATES.reactivation({ nome: p.name, clinica: clinicName })
      break
    }

    case 'debt': {
      const txs = await prisma.financialTransaction.findMany({
        where: { clinicId, type: 'INCOME', status: 'OVERDUE', patient: { isNot: null } },
        include: {
          patient: { select: { id: true, name: true, phone: true, whatsapp: true } },
        },
        distinct: ['patientId'],
      })
      patients = txs.map(t => t.patient).filter(Boolean) as typeof patients
      messageBuilder = p =>
        customMessage
          ? TEMPLATES.custom(customMessage, { nome: p.name })
          : TEMPLATES.debt({ nome: p.name, clinica: clinicName, valor: 'valor em aberto', vencimento: 'data vencida' })
      break
    }

    default:
      return NextResponse.json({ error: `categoryId '${categoryId}' inválido` }, { status: 400 })
  }

  if (patients.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, results: [], warning: 'Nenhum paciente nesta categoria' })
  }

  // ── Envia mensagens ────────────────────────────────────────────
  const results: { patientId: string; name: string; success: boolean; error?: string }[] = []

  for (const patient of patients) {
    const phone = patient.whatsapp ?? patient.phone
    if (!phone) {
      results.push({ patientId: patient.id, name: patient.name, success: false, error: 'Sem telefone cadastrado' })
      continue
    }

    const msg = messageBuilder(patient)
    const res = await sendWhatsApp(phone, msg)
    results.push({ patientId: patient.id, name: patient.name, success: res.success, error: res.error })
  }

  const sent   = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  return NextResponse.json({ ok: true, sent, failed, total: patients.length, results })
}
