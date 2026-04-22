import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const clinicId = session.user.clinicId

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999)

    const [
      totalPatients,
      newPatientsThisMonth,
      appointmentsToday,
      appointmentsThisMonth,
      absentThisMonth,
      attendedThisMonth,
      incomeThisMonth,
      pendingIncome,
      overdueIncome,
      leadsThisMonth,
      convertedLeads,
      totalLeads,
      recentAppointments,
    ] = await Promise.all([
      prisma.patient.count({ where: { clinicId, status: 'ACTIVE' } }),
      prisma.patient.count({ where: { clinicId, createdAt: { gte: startOfMonth } } }),
      prisma.appointment.count({ where: { clinicId, startTime: { gte: startOfDay, lte: endOfDay }, status: { notIn: ['CANCELLED'] } } }),
      prisma.appointment.count({ where: { clinicId, startTime: { gte: startOfMonth, lte: endOfMonth }, status: { notIn: ['CANCELLED'] } } }),
      prisma.appointment.count({ where: { clinicId, startTime: { gte: startOfMonth }, status: 'ABSENT' } }),
      prisma.appointment.count({ where: { clinicId, startTime: { gte: startOfMonth }, status: 'ATTENDED' } }),
      prisma.financialTransaction.aggregate({ where: { clinicId, type: 'INCOME', status: 'PAID', paidDate: { gte: startOfMonth } }, _sum: { amountPaid: true } }),
      prisma.financialTransaction.aggregate({ where: { clinicId, type: 'INCOME', status: 'PENDING' }, _sum: { amount: true } }),
      prisma.financialTransaction.aggregate({ where: { clinicId, type: 'INCOME', status: 'OVERDUE' }, _sum: { amount: true } }),
      prisma.lead.count({ where: { clinicId, createdAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { clinicId, status: 'CONVERTED' } }),
      prisma.lead.count({ where: { clinicId } }),
      prisma.appointment.findMany({
        where: { clinicId, startTime: { gte: startOfDay, lte: endOfDay } },
        orderBy: { startTime: 'asc' },
        take: 8,
        include: { patient: { select: { name: true } }, professional: { select: { name: true, color: true } } },
      }),
    ])

    // Monthly revenue for last 6 months
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const [inc, exp] = await Promise.all([
        prisma.financialTransaction.aggregate({ where: { clinicId, type: 'INCOME', status: 'PAID', paidDate: { gte: mStart, lte: mEnd } }, _sum: { amountPaid: true } }),
        prisma.financialTransaction.aggregate({ where: { clinicId, type: 'EXPENSE', status: 'PAID', paidDate: { gte: mStart, lte: mEnd } }, _sum: { amountPaid: true } }),
      ])
      monthlyRevenue.push({
        month: mStart.toLocaleDateString('pt-BR', { month: 'short' }),
        revenue: inc._sum.amountPaid ?? 0,
        expenses: exp._sum.amountPaid ?? 0,
      })
    }

    const absenceRate = (attendedThisMonth + absentThisMonth) > 0
      ? Math.round((absentThisMonth / (attendedThisMonth + absentThisMonth)) * 100 * 10) / 10
      : 0
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100 * 10) / 10 : 0

    return NextResponse.json({
      totalPatients,
      newPatientsThisMonth,
      appointmentsToday,
      appointmentsThisMonth,
      absenceRateThisMonth: absenceRate,
      revenueThisMonth: incomeThisMonth._sum.amountPaid ?? 0,
      pendingReceivable: pendingIncome._sum.amount ?? 0,
      overdueReceivable: overdueIncome._sum.amount ?? 0,
      leadsThisMonth,
      conversionRate,
      monthlyRevenue,
      recentAppointments: recentAppointments.map((a) => ({
        id: a.id,
        patientName: a.patient?.name ?? a.title ?? 'Bloqueio',
        professionalName: a.professional?.name ?? '',
        professionalColor: a.professional?.color ?? '#3B82F6',
        startTime: a.startTime.toISOString(),
        status: a.status,
        duration: a.duration,
      })),
    })
  } catch (error) {
    console.error('[GET /api/dashboard]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
