/**
 * WhatsApp Service — suporta Z-API, Evolution API e Meta Business API
 *
 * Configure via variáveis de ambiente (ver .env.example):
 *   WHATSAPP_PROVIDER = 'zapi' | 'evolution' | 'meta'
 */

// ────────────────────────────────────────────
// Normalização de número BR → 5511999999999
// ────────────────────────────────────────────

export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!digits.startsWith('55')) digits = `55${digits}`
  // Adiciona 9 se celular de SP sem o nono dígito (10 dígitos + 55)
  if (digits.length === 12) {
    const ddd = digits.slice(2, 4)
    const num = digits.slice(4)
    if (num.length === 8 && parseInt(ddd) >= 11) {
      digits = `${digits.slice(0, 4)}9${num}`
    }
  }
  return digits
}

// ────────────────────────────────────────────
// Templates de mensagem
// ────────────────────────────────────────────

export const TEMPLATES = {
  confirmation: (vars: {
    nome: string; clinica: string; data: string; hora: string; profissional: string
  }) =>
    `Olá *${vars.nome}*! 🦷\n\nLembramos que você tem uma consulta agendada na *${vars.clinica}*:\n\n📅 Data: *${vars.data}*\n⏰ Horário: *${vars.hora}*\n👩‍⚕️ Profissional: *${vars.profissional}*\n\nPara *confirmar* responda *SIM*.\nPara cancelar ou remarcar, responda *NÃO*.\n\nAté logo! 😊`,

  reminder: (vars: {
    nome: string; clinica: string; hora: string
  }) =>
    `Olá *${vars.nome}*! 👋\n\nLembrando que sua consulta na *${vars.clinica}* é *HOJE* às *${vars.hora}*.\n\nNos vemos em breve! 🦷`,

  reactivation: (vars: {
    nome: string; clinica: string
  }) =>
    `Olá *${vars.nome}*! 😊\n\nSentimos sua falta! Faz um tempo que não te vemos na *${vars.clinica}*.\n\nQue tal agendar uma consulta? Temos horários disponíveis — basta responder essa mensagem! 🦷`,

  birthday: (vars: {
    nome: string; clinica: string; desconto?: string
  }) =>
    `🎂 *Feliz Aniversário, ${vars.nome}!*\n\nToda a equipe da *${vars.clinica}* deseja a você um dia muito especial! 🎉\n\n${vars.desconto ? `Como presente, um desconto de *${vars.desconto}* no seu próximo procedimento. Válido por 30 dias! ✨` : ''}`,

  absence: (vars: {
    nome: string; clinica: string
  }) =>
    `Olá *${vars.nome}*! 😊\n\nNotamos que você não pôde comparecer à sua consulta na *${vars.clinica}*.\n\nQueremos te ajudar a reagendar! Responda essa mensagem ou ligue para nós. 🦷`,

  debt: (vars: {
    nome: string; clinica: string; valor: string; vencimento: string
  }) =>
    `Olá *${vars.nome}*! 👋\n\nIdentificamos um pagamento pendente de *${vars.valor}* na *${vars.clinica}*, com vencimento em *${vars.vencimento}*.\n\nPara regularizar, entre em contato conosco. Estamos à disposição! 😊`,

  custom: (text: string, vars: Record<string, string>) => {
    let msg = text
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replaceAll(`{${k}}`, v)
    }
    return msg
  },
}

// ────────────────────────────────────────────
// Resultado de envio
// ────────────────────────────────────────────

export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
  provider?: string
}

// ────────────────────────────────────────────
// Status de conexão
// ────────────────────────────────────────────

export interface ConnectionStatus {
  connected: boolean
  provider: string
  instance?: string
  qrCode?: string   // base64 — usado pelo Z-API e Evolution para conectar
  error?: string
}

// ────────────────────────────────────────────
// Z-API
// ────────────────────────────────────────────

async function sendZapi(phone: string, message: string): Promise<SendResult> {
  const instanceId = process.env.ZAPI_INSTANCE_ID
  const token      = process.env.ZAPI_TOKEN
  const clientToken = process.env.ZAPI_CLIENT_TOKEN

  if (!instanceId || !token) {
    return { success: false, error: 'ZAPI_INSTANCE_ID ou ZAPI_TOKEN não configurados', provider: 'zapi' }
  }

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (clientToken) headers['Client-Token'] = clientToken

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ phone, message }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    return { success: false, error: data.error ?? `Z-API error ${res.status}`, provider: 'zapi' }
  }

  return { success: true, messageId: data.zaapId ?? data.messageId, provider: 'zapi' }
}

async function statusZapi(): Promise<ConnectionStatus> {
  const instanceId  = process.env.ZAPI_INSTANCE_ID
  const token       = process.env.ZAPI_TOKEN
  const clientToken = process.env.ZAPI_CLIENT_TOKEN

  if (!instanceId || !token) {
    return { connected: false, provider: 'zapi', error: 'Credenciais não configuradas' }
  }

  const headers: Record<string, string> = {}
  if (clientToken) headers['Client-Token'] = clientToken

  try {
    const res  = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
      { headers },
    )
    const data = await res.json().catch(() => ({}))
    const connected = data.connected === true || data.status === 'CONNECTED'
    const qrRes  = connected ? null : await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/qr-code`,
      { headers },
    )
    const qrData = qrRes ? await qrRes.json().catch(() => ({})) : {}
    return {
      connected,
      provider: 'zapi',
      instance: instanceId,
      qrCode: qrData.value ?? qrData.qrcode,
    }
  } catch (e: any) {
    return { connected: false, provider: 'zapi', error: e.message }
  }
}

// ────────────────────────────────────────────
// Evolution API
// ────────────────────────────────────────────

async function sendEvolution(phone: string, message: string): Promise<SendResult> {
  const baseUrl  = process.env.EVOLUTION_API_URL
  const apiKey   = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE

  if (!baseUrl || !apiKey || !instance) {
    return { success: false, error: 'Variáveis EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE não configuradas', provider: 'evolution' }
  }

  const url = `${baseUrl.replace(/\/$/, '')}/message/sendText/${instance}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: apiKey },
    body: JSON.stringify({ number: phone, text: message }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    return { success: false, error: data.message ?? `Evolution error ${res.status}`, provider: 'evolution' }
  }

  return { success: true, messageId: data.key?.id, provider: 'evolution' }
}

async function statusEvolution(): Promise<ConnectionStatus> {
  const baseUrl  = process.env.EVOLUTION_API_URL
  const apiKey   = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE

  if (!baseUrl || !apiKey || !instance) {
    return { connected: false, provider: 'evolution', error: 'Credenciais não configuradas' }
  }

  try {
    const res  = await fetch(
      `${baseUrl.replace(/\/$/, '')}/instance/fetchInstances`,
      { headers: { apikey: apiKey } },
    )
    const data = await res.json().catch(() => [])
    const inst = Array.isArray(data)
      ? data.find((i: any) => i.instance?.instanceName === instance || i.name === instance)
      : null
    const connected = inst?.instance?.state === 'open' || inst?.state === 'open'

    if (!connected) {
      // Tenta buscar QR Code
      const qrRes  = await fetch(
        `${baseUrl.replace(/\/$/, '')}/instance/connect/${instance}`,
        { headers: { apikey: apiKey } },
      )
      const qrData = await qrRes.json().catch(() => ({}))
      return { connected: false, provider: 'evolution', instance, qrCode: qrData.base64 }
    }

    return { connected: true, provider: 'evolution', instance }
  } catch (e: any) {
    return { connected: false, provider: 'evolution', error: e.message }
  }
}

// ────────────────────────────────────────────
// Meta WhatsApp Business API
// ────────────────────────────────────────────

async function sendMeta(phone: string, message: string): Promise<SendResult> {
  const token   = process.env.META_WHATSAPP_TOKEN
  const phoneId = process.env.META_PHONE_NUMBER_ID

  if (!token || !phoneId) {
    return { success: false, error: 'META_WHATSAPP_TOKEN ou META_PHONE_NUMBER_ID não configurados', provider: 'meta' }
  }

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message },
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    return { success: false, error: data.error?.message ?? `Meta error ${res.status}`, provider: 'meta' }
  }

  return { success: true, messageId: data.messages?.[0]?.id, provider: 'meta' }
}

async function statusMeta(): Promise<ConnectionStatus> {
  const token   = process.env.META_WHATSAPP_TOKEN
  const phoneId = process.env.META_PHONE_NUMBER_ID

  if (!token || !phoneId) {
    return { connected: false, provider: 'meta', error: 'Credenciais não configuradas' }
  }

  try {
    const res  = await fetch(
      `https://graph.facebook.com/v18.0/${phoneId}?fields=display_phone_number,verified_name`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    const data = await res.json().catch(() => ({}))
    if (data.error) return { connected: false, provider: 'meta', error: data.error.message }
    return { connected: true, provider: 'meta', instance: data.display_phone_number }
  } catch (e: any) {
    return { connected: false, provider: 'meta', error: e.message }
  }
}

// ────────────────────────────────────────────
// Interface pública
// ────────────────────────────────────────────

function getProvider(): string {
  return (process.env.WHATSAPP_PROVIDER ?? 'zapi').toLowerCase()
}

export async function sendWhatsApp(rawPhone: string, message: string): Promise<SendResult> {
  const phone    = normalizePhone(rawPhone)
  const provider = getProvider()

  switch (provider) {
    case 'evolution': return sendEvolution(phone, message)
    case 'meta':      return sendMeta(phone, message)
    default:          return sendZapi(phone, message)
  }
}

export async function getWhatsAppStatus(): Promise<ConnectionStatus> {
  const provider = getProvider()
  switch (provider) {
    case 'evolution': return statusEvolution()
    case 'meta':      return statusMeta()
    default:          return statusZapi()
  }
}
