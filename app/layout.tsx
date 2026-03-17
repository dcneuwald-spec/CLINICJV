import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ClinicJV — Sistema Inteligente de Gestão de Clínicas',
    template: '%s | ClinicJV',
  },
  description:
    'Sistema de gestão clínica com inteligência estratégica. Score de saúde, análise preditiva e portal do consultor.',
  keywords: ['gestão clínica', 'sistema médico', 'agenda médica', 'prontuário eletrônico'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
