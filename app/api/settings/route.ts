import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const clinic = await prisma.clinic.findUnique({
      where: { id: session.user.clinicId },
      include: { settings: true },
    })
    if (!clinic) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      id: clinic.id,
      name: clinic.name,
      tradeName: clinic.tradeName ?? '',
      cnpj: clinic.cnpj ?? '',
      phone: clinic.phone ?? '',
      email: clinic.email ?? '',
      website: clinic.website ?? '',
      address: clinic.address ?? '',
      city: clinic.city ?? '',
      state: clinic.state ?? '',
      zipCode: clinic.zipCode ?? '',
      specialty: clinic.specialty ?? '',
      plan: clinic.plan,
      // settings
      defaultConfirmChannel: clinic.settings?.defaultConfirmChannel ?? 'whatsapp',
      confirmHoursBefore: clinic.settings?.confirmHoursBefore ?? 24,
      alertHoursBefore: clinic.settings?.alertHoursBefore ?? 2,
      targetOccupancyRate: clinic.settings?.targetOccupancyRate ?? 75,
      targetConversionRate: clinic.settings?.targetConversionRate ?? 65,
      targetReturnRate: clinic.settings?.targetReturnRate ?? 60,
      targetNPS: clinic.settings?.targetNPS ?? 70,
      targetAbsenceRate: clinic.settings?.targetAbsenceRate ?? 10,
    })
  } catch (error) {
    console.error('[GET /api/settings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, tradeName, phone, email, website, address, city, state, zipCode, specialty,
      defaultConfirmChannel, confirmHoursBefore, alertHoursBefore,
      targetOccupancyRate, targetConversionRate, targetReturnRate, targetNPS, targetAbsenceRate } = body

    await prisma.$transaction([
      prisma.clinic.update({
        where: { id: session.user.clinicId },
        data: {
          ...(name !== undefined && { name }),
          ...(tradeName !== undefined && { tradeName }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(website !== undefined && { website }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode !== undefined && { zipCode }),
          ...(specialty !== undefined && { specialty }),
        },
      }),
      prisma.clinicSettings.upsert({
        where: { clinicId: session.user.clinicId },
        create: {
          clinicId: session.user.clinicId,
          defaultConfirmChannel: defaultConfirmChannel ?? 'whatsapp',
          confirmHoursBefore: confirmHoursBefore ?? 24,
          alertHoursBefore: alertHoursBefore ?? 2,
          targetOccupancyRate: targetOccupancyRate ?? 75,
          targetConversionRate: targetConversionRate ?? 65,
          targetReturnRate: targetReturnRate ?? 60,
          targetNPS: targetNPS ?? 70,
          targetAbsenceRate: targetAbsenceRate ?? 10,
        },
        update: {
          ...(defaultConfirmChannel !== undefined && { defaultConfirmChannel }),
          ...(confirmHoursBefore !== undefined && { confirmHoursBefore }),
          ...(alertHoursBefore !== undefined && { alertHoursBefore }),
          ...(targetOccupancyRate !== undefined && { targetOccupancyRate }),
          ...(targetConversionRate !== undefined && { targetConversionRate }),
          ...(targetReturnRate !== undefined && { targetReturnRate }),
          ...(targetNPS !== undefined && { targetNPS }),
          ...(targetAbsenceRate !== undefined && { targetAbsenceRate }),
        },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[PUT /api/settings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
