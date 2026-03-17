'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import {
  Building2, Bell, CreditCard, Shield, Users, Calendar,
  MessageSquare, FileText, Database, Sliders, Save, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SETTING_SECTIONS = [
  { id: 'clinic', label: 'Clínica', icon: <Building2 size={16} /> },
  { id: 'schedule', label: 'Agenda', icon: <Calendar size={16} /> },
  { id: 'notifications', label: 'Notificações', icon: <Bell size={16} /> },
  { id: 'financial', label: 'Financeiro', icon: <CreditCard size={16} /> },
  { id: 'users', label: 'Usuários e Permissões', icon: <Users size={16} /> },
  { id: 'messages', label: 'Mensagens', icon: <MessageSquare size={16} /> },
  { id: 'documents', label: 'Documentos', icon: <FileText size={16} /> },
  { id: 'security', label: 'Segurança', icon: <Shield size={16} /> },
  { id: 'integrations', label: 'Integrações', icon: <Sliders size={16} /> },
  { id: 'data', label: 'Dados e Backup', icon: <Database size={16} /> },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-brand-600' : 'bg-slate-200',
      )}
    >
      <div className={cn(
        'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
        checked ? 'left-5' : 'left-1',
      )} />
    </button>
  )
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('clinic')
  const [settings, setSettings] = useState({
    clinicName: 'Clínica Estética Bella Vita',
    tradeName: 'Bella Vita',
    phone: '(11) 3456-7890',
    email: 'contato@bellavita.com.br',
    specialty: 'estética',
    confirmChannel: 'whatsapp',
    confirmHours: '24',
    alertHours: '2',
    whatsappEnabled: true,
    smsEnabled: false,
    emailEnabled: true,
    autoConfirm: true,
    autoReminder: true,
    invoiceEnabled: false,
    pixEnabled: true,
    cardEnabled: true,
    twoFactor: false,
    auditLog: true,
  })

  const update = (key: string, value: string | boolean) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  return (
    <div className="animate-fade-in">
      <Header title="Configurações" subtitle="Personalize o sistema para sua clínica" />

      <div className="p-6 flex gap-5">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 space-y-1">
          {SETTING_SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left',
                activeSection === s.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <span className="flex-shrink-0">{s.icon}</span>
              <span className="font-medium">{s.label}</span>
              <ChevronRight size={14} className="ml-auto opacity-50" />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="card p-6 space-y-6">
            {activeSection === 'clinic' && (
              <>
                <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Dados da Clínica</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'clinicName', label: 'Nome da Clínica', type: 'text' },
                    { key: 'tradeName', label: 'Nome Fantasia', type: 'text' },
                    { key: 'phone', label: 'Telefone', type: 'text' },
                    { key: 'email', label: 'E-mail', type: 'email' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-medium text-slate-500 block mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        value={settings[f.key as keyof typeof settings] as string}
                        onChange={e => update(f.key, e.target.value)}
                        className="input"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1.5">Especialidade</label>
                    <select
                      value={settings.specialty}
                      onChange={e => update('specialty', e.target.value)}
                      className="input"
                    >
                      <option value="estética">Estética</option>
                      <option value="odontologia">Odontologia</option>
                      <option value="fisioterapia">Fisioterapia</option>
                      <option value="psicologia">Psicologia</option>
                      <option value="nutrição">Nutrição</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'notifications' && (
              <>
                <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Notificações e Lembretes</h3>
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Canais Ativos</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'whatsappEnabled', label: 'WhatsApp', desc: 'Envio via WhatsApp Business' },
                        { key: 'smsEnabled', label: 'SMS', desc: 'Envio via operadora' },
                        { key: 'emailEnabled', label: 'E-mail', desc: 'Envio via SMTP configurado' },
                      ].map(c => (
                        <div key={c.key} className="flex items-center justify-between py-2 border-b border-slate-50">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{c.label}</p>
                            <p className="text-xs text-slate-400">{c.desc}</p>
                          </div>
                          <Toggle
                            checked={settings[c.key as keyof typeof settings] as boolean}
                            onChange={v => update(c.key, v)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Automações</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'autoConfirm', label: 'Confirmação automática', desc: 'Enviar confirmação ao agendar' },
                        { key: 'autoReminder', label: 'Lembrete automático', desc: 'Lembrete antes da consulta' },
                      ].map(a => (
                        <div key={a.key} className="flex items-center justify-between py-2 border-b border-slate-50">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{a.label}</p>
                            <p className="text-xs text-slate-400">{a.desc}</p>
                          </div>
                          <Toggle
                            checked={settings[a.key as keyof typeof settings] as boolean}
                            onChange={v => update(a.key, v)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1.5">Confirmar consulta (horas antes)</label>
                      <input type="number" value={settings.confirmHours} onChange={e => update('confirmHours', e.target.value)} className="input" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1.5">Lembrete (horas antes)</label>
                      <input type="number" value={settings.alertHours} onChange={e => update('alertHours', e.target.value)} className="input" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'security' && (
              <>
                <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Segurança</h3>
                <div className="space-y-4">
                  {[
                    { key: 'twoFactor', label: 'Autenticação em dois fatores', desc: 'Exigir 2FA para todos os usuários' },
                    { key: 'auditLog', label: 'Log de auditoria', desc: 'Registrar todas as ações do sistema' },
                  ].map(s => (
                    <div key={s.key} className="flex items-center justify-between py-3 border-b border-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{s.label}</p>
                        <p className="text-xs text-slate-400">{s.desc}</p>
                      </div>
                      <Toggle
                        checked={settings[s.key as keyof typeof settings] as boolean}
                        onChange={v => update(s.key, v)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {!['clinic', 'notifications', 'security'].includes(activeSection) && (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Sliders size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  {SETTING_SECTIONS.find(s => s.id === activeSection)?.label}
                </p>
                <p className="text-xs text-slate-400">Configurações disponíveis em breve</p>
              </div>
            )}

            {['clinic', 'notifications', 'security'].includes(activeSection) && (
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="btn-primary gap-2">
                  <Save size={14} /> Salvar Alterações
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
