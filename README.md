# ClinicJV — Sistema Inteligente de Gestão de Clínicas

> "Não apenas gerencie sua clínica. Evolua ela."

Sistema SaaS multi-tenant de gestão clínica com inteligência estratégica, construído com base em análise benchmarketing do mercado brasileiro.

---

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Rodar em desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

Login demo:
- E-mail: `consultor@clinicjv.com.br`
- Senha: `demo123`

---

## 🏗️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Banco de Dados | PostgreSQL + Prisma ORM |
| Autenticação | NextAuth.js |
| Datas | date-fns (pt-BR) |

---

## 📦 Módulos Implementados

### Operacional
- **Agenda** — Calendário multi-profissional com status progressivo (7 estados), filtro por profissional, modal de atendimento com ações de WhatsApp/telefone/prontuário
- **Pacientes (Prontuário)** — Cadastro completo, histórico de consultas, financeiro, orçamentos, documentos, anamnese e fotos
- **Profissionais** — Cadastro e gestão da equipe com comissões e especialidades

### Financeiro
- **Financeiro** — Entradas/saídas, contas a receber/pagar, fluxo de caixa, **DRE Gerencial** com análise de margem
- **Orçamentos** — Funil de conversão com follow-up e aprovação/reprovação

### Relacionamento
- **CRC** — Central de Relacionamento com 6 categorias (sem confirmação, aniversariantes, faltas, 1ª consulta, reativação, inadimplência) + disparo de campanhas
- **CRM** — Funil Kanban de leads por estágio, integração Meta Ads, gestão de campanhas com CPL e ROI

### Inteligência (Diferencial vs Clinicorp)
- **Score de Saúde** — Índice 0-100 com **Framework 6P** (Paciente, Produção, Pessoas, Processo, Planejamento, Prosperidade), radar chart, benchmarks setoriais e recomendações inteligentes
- **Relatórios** — 30+ relatórios em 6 categorias com prévia de gráficos e exportação
- **Metas** — Acompanhamento com gamificação e TV Mode

### Consultoria (Inédito no mercado)
- **Portal do Consultor** — Visão multiclínica consolidada, ranking de performance, alertas automáticos por KPI, comparativo visual
- **Planos de Ação** — Diagnóstico orientado por dados, tarefas com responsáveis e prazos, IA consultiva

---

## 🗂️ Estrutura do Projeto

```
CLINICJV/
├── app/
│   ├── (auth)/login/           # Autenticação
│   └── (dashboard)/
│       ├── dashboard/          # Dashboard principal
│       ├── agenda/             # Agenda multi-profissional
│       ├── patients/           # Lista + detalhe do paciente
│       ├── financial/          # Módulo financeiro + DRE
│       ├── budgets/            # Orçamentos
│       ├── crc/                # Central de Relacionamento
│       ├── crm/                # CRM + Captação
│       ├── health-score/       # Score de Saúde 6P
│       ├── reports/            # Relatórios
│       ├── goals/              # Metas + Gamificação
│       ├── action-plans/       # Planos de Ação
│       ├── consultant/         # Portal do Consultor
│       ├── professionals/      # Gestão de Profissionais
│       └── settings/           # Configurações
├── components/
│   └── layout/                 # Sidebar + Header
├── lib/
│   ├── utils.ts                # Utilitários e formatadores
│   └── mock-data.ts            # Dados de demonstração
├── prisma/
│   └── schema.prisma           # Schema completo do banco
└── types/
    └── index.ts                # Tipos TypeScript
```

---

## 📊 Framework 6P — Score de Saúde

| Dimensão | KPIs Monitorados |
|---|---|
| **Paciente** | Captação, retenção, NPS |
| **Produção** | Ocupação, ticket médio, procedimentos |
| **Pessoas** | Produtividade, satisfação, comissões |
| **Processo** | Faltas, conversão, eficiência |
| **Planejamento** | Metas, orçado vs realizado |
| **Prosperidade** | Lucro, crescimento, fluxo de caixa |

---

## 🗓️ Roadmap

| Fase | Período | Status |
|---|---|---|
| Sprint 0 — Fundação | Meses 1-2 | ✅ Completo |
| Sprint 1 — Núcleo Operacional | Meses 3-5 | ✅ Completo |
| Sprint 2 — Inteligência Clínica | Meses 6-8 | 🔄 Em desenvolvimento |
| Sprint 3 — Diferencial Consultoria | Meses 9-12 | 📋 Planejado |
| Sprint 4 — Escala | Meses 13-18 | 📋 Planejado |

---

## 🔌 Próximas Integrações

- [ ] WhatsApp Business API
- [ ] Meta Ads (Facebook/Instagram)
- [ ] Google Ads
- [ ] Maquininha de cartão (Stone, PagSeguro)
- [ ] SPC/Serasa
- [ ] NFSe (Nota Fiscal de Serviços)
- [ ] Power BI / Looker
- [ ] App mobile (React Native)

---

*Desenvolvido com base em análise benchmarketing do Clinicorp e mapeamento estratégico do mercado de software para clínicas no Brasil.*
