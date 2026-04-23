/**
 * POST /api/whatsapp/reminders
 *
 * Processa lembretes e confirmações de consultas.
 * Pode ser chamado por:
 *  - Vercel Cron Jobs (vercel.json)
 *  - Cron externo (cURL, make.com, n8n, etc.)
 *  - Acionamento manual no painel de Configurações
 *
 * Lógica:
 *  1. Busca agendamentos com status SCHEDULED ou CONFIRMED cujo
 *     horário está dentro da janela configurada (confirmHoursBefore /
 *     alertHoursBefore) e que ainda não receberam o lembrete.
 *  2. Dispara mensagem via WhatsApp para o telefone do paciente.
 *  3. Marca reminderSent = true no agendamento.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsApp, TEMPLATES } from '@/lib/whatsapp'
import { format, addHours, subHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(req: NextRequest) {
  // Autoriza tanto session autenticada quanto cron secret
  const authHeader = req.headers.get('authorization')
  const cronOk = CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`

  const { getServerSession } = await import('next-auth')
  const { authOptions }      = await import('@/lib/auth')
  const session              = await getServerSession(authOptions)

  if (!session && !cronOk) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Determina clinicId: da sessão ou do body (cron pode passar)
  const body      = await req.json().catch(() => ({}))
  const clinicId  = (session?.user as any)?.clinicId ?? body.clinicId

  if (!clinicId) {
    return NextResponse.json({ error: 'clinicId obrigatório' }, { status: 400 })
  }

  // Carrega configurações da clínica
  const settings = await prisma.clinicSettings.findUnique({ where: { clinicId } })
  const confirmHours = settings?.confirmHoursBefore ?? 24
  const alertHours   = settings?.alertHoursBefore   ?? 2
  const clinicName   = (await prisma.clinic.findUnique({ where: { id: clinicId }, select: { name: true } }))?.name ?? 'Clínica'

  const now = new Date()
  const results: { type: string; appointmentId: string; patientName: string; success: boolean; error?: string }[] = []

  // ── Confirmações (X horas antes) ──────────────────────────────
  const confirmWindow = {
    gte: subHours(addHours(now, confirmHours), 1), // janela de 1h em torno do momento alvo
    lte: addHours(now, confirmHours),
  }

  const toConfirm = await prisma.appointment.findMany({
    where: {
      clinicId,
      status: { in: ['SCHEDULED'] },
      reminderSent: false,
      startTime: confirmWindow,
      patient: { whatsapp: { not: null } },
    },
    include: {
      patient: { select: { name: true, phone: true, whatsapp: true } },
      professional: { select: { name: true } },
    },
  })

  for (const apt of toConfirm) {
    const phone = apt.patient?.whatsapp ?? apt.patient?.phone
    if (!phone) continue

    const msg = TEMPLATES.confirmation({
      nome:         apt.patient!.name,
      clinica:      clinicName,
      data:         format(apt.startTime, "dd/MM/yyyy", { locale: ptBR }),
      hora:         format(apt.startTime, "HH:mm"),
      profissional: apt.professional.name,
    })

    const res = await sendWhatsApp(phone, msg)
    results.push({ type: 'confirmation', appointmentId: apt.id, patientName: apt.patient!.name, success: res.success, error: res.error })

    if (res.success) {
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { reminderSent: true },
      })
    }
  }

  // ── Lembretes no dia (X horas antes) ─────────────────────────
  const reminderWindow = {
    gte: subHours(addHours(now, alertHours), 1),
    lte: addHours(now, alertHours),
  }

  const toRemind = await prisma.appointment.findMany({
    where: {
      clinicId,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      reminderSent: true,                        // confirmação já enviada
      startTime: reminderWindow,
      patient: { whatsapp: { not: null } },
    },
    include: {
      patient: { select: { name: true, phone: true, whatsapp: true } },
      professional: { select: { name: true } },
    },
  })

  for (const apt of toRemind) {
    const phone = apt.patient?.whatsapp ?? apt.patient?.phone
    if (!phone) continue

    const msg = TEMPLATES.reminder({
      nome:    apt.patient!.name,
      clinica: clinicName,
      hora:    format(apt.startTime, "HH:mm"),
    })

    const res = await sendWhatsApp(phone, msg)
    results.push({ type: 'reminder', appointmentId: apt.id, patientName: apt.patient!.name, success: res.success, error: res.error })
  }

  // ── Alertas de retorno (ReturnAlert) ─────────────────────────
  const dueAlerts = await prisma.returnAlert.findMany({
    where: {
      clinicId,
      sent: false,
      alertDate: { lte: addHours(now, 1) },
      patient: { whatsapp: { not: null } },
    },
    include: {
      patient: { select: { name: true, phone: true, whatsapp: true } },
    },
  })

  for (const alert of dueAlerts) {
    const phone = alert.patient.whatsapp ?? alert.patient.phone
    if (!phone) continue

    const msg = alert.message ?? TEMPLATES.reactivation({
      nome:    alert.patient.name,
      clinica: clinicName,
    })

    const res = await sendWhatsApp(phone, msg)
    results.push({ type: 'return_alert', appointmentId: alert.id, patientName: alert.patient.name, success: res.success, error: res.error })

    if (res.success) {
      await prisma.returnAlert.update({
        where: { id: alert.id },
        data: { sent: true, sentAt: now },
      })
    }
  }

  const sent   = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  return NextResponse.json({ ok: true, processed: results.length, sent, failed, results })
}
