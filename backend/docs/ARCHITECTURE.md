# 🏗️ ARCHITECTURE — LegendForge

---

## 🎯 Project Vision

**LegendForge** é um Virtual Tabletop (VTT) moderno para RPG de mesa.

Inspirado em plataformas como Roll20 e Foundry VTT, mas com foco em:

- 🧩 Sistema agnóstico (multi-RPG)
- 🎲 Campanhas customizáveis
- 👥 Experiência real de jogo entre usuários
- 🧠 Arquitetura real de produto full-stack

Além disso, o projeto é:

- 💼 Portfólio técnico avançado
- 🧠 Plataforma de aprendizado contínuo
- ⚙️ Sistema real com mentalidade de produção

---

## 🎯 Main Goals

### 1 — Base funcional de VTT

- 🔐 Sistema de autenticação
- 🧑‍🤝‍🧑 Gestão de usuários
- 🗺️ Campanhas
- 📄 Personagens
- 🎲 Mesa de jogo

### 2 — Backend profissional

- 🏗️ Arquitetura escalável
- 🔒 Integridade de dados forte
- 📐 Separação clara de responsabilidades
- ⚡ Estrutura pronta para crescimento

### 3 — Frontend conectado ao domínio

- Telas baseadas no Figma
- Integração real com API
- Auth via sessão/cookie
- UI incremental sem depender de mock permanente

---

## 💡 Development Philosophy

> Desenvolvimento incremental com mentalidade de produção

### Princípios

- ✔️ Pequenos passos funcionais
- ✔️ Refatoração contínua
- ✔️ Backend como fonte da verdade
- ✔️ Simplicidade primeiro, escala depois
- ✔️ Código serve ao domínio
- ✔️ Cada tela deve avançar o produto para algo jogável

---

## 📦 Repository Structure

```txt
LegendForge/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── generated/
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── get-authenticated-session.ts
│   │   │   └── prisma.ts
│   │   ├── routes/
│   │   │   └── campaigns.ts
│   │   └── index.ts
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── lib/
│   │   │   └── auth-client.ts
│   │   └── service/
│   ├── public/
│   └── package.json
│
├── docs/
└── README.md
```

---

## ⚙️ Tech Stack

### 🖥️ Backend

- Node.js
- Fastify
- TypeScript
- Prisma ORM
- PostgreSQL
- Better Auth
- Zod
- Swagger
- Scalar API Reference
- pnpm
- Docker

### 🎨 Frontend

- Next.js
- React
- Tailwind CSS
- TypeScript
- Better Auth Client
- Figma

---

## 🏗️ Backend Architecture

### 1. Banco de Dados — PostgreSQL

Responsável por:

- persistência
- integridade
- relacionamentos
- base do domínio

### 2. Prisma

Responsável por:

- acesso ao banco
- queries tipadas
- sincronização do schema
- Prisma Studio

### 3. Better Auth

Responsável por:

- registro
- login
- sessões
- cookies de autenticação
- tabelas oficiais de identidade

### 4. Fastify

Responsável por:

- rotas HTTP
- integração com auth
- autorização
- validação com Zod
- orquestração da API

---

## 🔐 Sistema de Autenticação

### ✔️ Implementado

- Better Auth
- Prisma Adapter
- Sessões persistentes
- Integração com Fastify
- Frontend com `authClient`
- Backend com helper `getAuthenticatedSession`

### 🔄 Fluxo atual

1. Usuário registra ou faz login no frontend.
2. Better Auth cria/atualiza sessão no banco.
3. Browser mantém cookie de sessão.
4. Frontend chama API com `credentials: "include"`.
5. Backend usa `auth.api.getSession`.
6. Rotas protegidas usam `session.user.id`.

### Decisão importante

> Não usar Bearer token manual/localStorage para sessão principal.  
> O fluxo atual usa sessão/cookie do Better Auth.

---

## 🧩 Modelagem Atual

### ✔️ Núcleo implementado

- User
- Session
- Account
- Verification

### ✔️ Domínio RPG inicial

- GameSystem
- Stat
- Skill

### ✔️ Campanhas

- Campaign
- Participant
- GameSession

### 🔜 Domínio planejado

- Characters
- Classes / Subclasses
- Inventory
- Logs
- Permissions refinadas
- Campaign Invites

---

## 🗺️ Campanha — Fluxo Atual

### Backend

- `POST /campaigns`
- `GET /campaigns`
- `GET /campaigns/:id`
- `PATCH /campaigns/:id`
- `DELETE /campaigns/:id`
- `POST /campaigns/join`
- rotas de participantes

### Frontend

- `/campaigns`
  - home logada
  - estado sem campanhas
  - estado com campanhas
- `/campaigns/create`
  - nomear mundo
  - selecionar ficha/sistema visualmente
  - criar campanha
- `/campaigns/[id]/edit`
  - finalizar configuração inicial
  - visualizar nome/capa/owner
  - preparar descrição e imagem de capa

---

## ⚙️ Decisões Arquiteturais

### DB-first mindset

> Banco é a fonte de verdade.

### Auth como módulo externo confiável

- Better Auth controla identidade.
- Backend consome a sessão.
- Sistema não reimplementa segurança.

### Prisma como camada oficial

- acesso tipado
- segurança
- produtividade

### Frontend incremental

- Figma guia as telas
- implementação segue o que já tem no domínio
- telas mockadas devem ser evitadas quando a API já existir

### Upload de imagem

- Estado atual: preview/armazenamento simples via string/base64 em `coverImage`.
- Futuro: storage real com upload, crop, validação e URL pública.

---

## ⚠️ Pontos de Atenção

- Backend ainda não está modularizado em services.
- Upload de capa ainda é temporário.
- Busca de campanhas públicas ainda não está implementada.
- Página de jogo ainda não existe.
- Regras avançadas do banco ainda não foram aplicadas via SQL/triggers.
- Tailwind/Next em dev usa `next dev --webpack` para estabilidade local.

---

## 🔄 Current Phase

> **AUTH + CAMPAIGN FLOW WORKING — CAMPAIGN BACKEND CONSOLIDATION PHASE**

---

## 🎯 Direção Atual

Foco em:

- consolidar backend de campanhas
- implementar busca de campanhas públicas
- refinar PATCH de campanha
- preparar página de jogo
- evoluir armazenamento de capa
- estruturar services quando as regras crescerem

---

## 🧠 Regra Fundamental

> Se uma regra é crítica  
> → ela deve existir no banco ou no backend.

---

## 📄 Referências

- DATABASE_SETUP.md
- DEV_STATE.md
- FEATURE_CAPSULE.md
- BOOT.md

---

## 🏆 Estado da Arquitetura

✔ Auth resolvido  
✔ Backend funcional  
✔ Prisma operacional  
✔ Frontend conectado  
✔ Campanhas começaram a virar produto real  
✔ Pronta para próxima expansão do domínio
