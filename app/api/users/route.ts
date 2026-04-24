import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clinicUsers = await prisma.clinicUser.findMany({
      where: { clinicId: session.user.clinicId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            active: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(
      clinicUsers.map(cu => ({
        id: cu.user.id,
        name: cu.user.name,
        email: cu.user.email,
        role: cu.user.role,
        phone: cu.user.phone ?? undefined,
        active: cu.user.active,
        createdAt: cu.user.createdAt,
      }))
    )
  } catch (error) {
    console.error('[GET /api/users]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can create users
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, role, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      // If user exists but is not in this clinic, just link them
      const alreadyLinked = await prisma.clinicUser.findUnique({
        where: { clinicId_userId: { clinicId: session.user.clinicId, userId: existing.id } },
      })
      if (alreadyLinked) {
        return NextResponse.json({ error: 'Usuário com este e-mail já existe nesta clínica' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Usuário com este e-mail já existe no sistema' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.$transaction(async tx => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role ?? 'RECEPTIONIST',
          phone: phone ?? null,
        },
      })

      await tx.clinicUser.create({
        data: {
          clinicId: session.user.clinicId,
          userId: newUser.id,
          role: newUser.role,
        },
      })

      return newUser
    })

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? undefined,
        active: user.active,
        createdAt: user.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/users]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
