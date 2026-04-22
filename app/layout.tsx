import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

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
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
