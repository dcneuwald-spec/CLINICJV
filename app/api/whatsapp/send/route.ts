import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendWhatsApp } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, message } = await req.json()

  if (!phone || !message) {
    return NextResponse.json({ error: 'phone e message são obrigatórios' }, { status: 400 })
  }

  const result = await sendWhatsApp(phone, message)
  return NextResponse.json(result, { status: result.success ? 200 : 502 })
}
