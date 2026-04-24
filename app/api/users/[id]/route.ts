import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ensure user belongs to the same clinic
    const clinicUser = await prisma.clinicUser.findUnique({
      where: { clinicId_userId: { clinicId: session.user.clinicId, userId: params.id } },
    })
    if (!clinicUser) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, phone, role, active, password } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone ?? null
    if (role !== undefined) updateData.role = role
    if (active !== undefined) updateData.active = active
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'password must be at least 6 characters' }, { status: 400 })
      }
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.$transaction(async tx => {
      const updated = await tx.user.update({
        where: { id: params.id },
        data: updateData,
      })

      if (role !== undefined) {
        await tx.clinicUser.update({
          where: { clinicId_userId: { clinicId: session.user.clinicId, userId: params.id } },
          data: { role },
        })
      }

      return updated
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone ?? undefined,
      active: user.active,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('[PUT /api/users/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent self-deactivation
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Não é possível desativar o próprio usuário' }, { status: 400 })
    }

    const clinicUser = await prisma.clinicUser.findUnique({
      where: { clinicId_userId: { clinicId: session.user.clinicId, userId: params.id } },
    })
    if (!clinicUser) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { active: false },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/users/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
