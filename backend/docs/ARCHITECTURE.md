# 🏗️ ARCHITECTURE — LegendForge

---

## 🎯 Project Vision

**LegendForge** é um Virtual Tabletop (VTT) moderno para RPG de mesa, construído como produto real e como portfólio full-stack.

O projeto é inspirado em VTTs como Roll20 e Foundry VTT, mas segue uma identidade própria:

- 🧩 Sistema agnóstico e expansível
- 🎲 Campanhas customizáveis
- 👥 Experiência real de jogo entre usuários
- 📄 Criação de personagens persistida
- 🧠 Arquitetura real de produto full-stack
- ⚙️ Desenvolvimento incremental, testável e com mentalidade de produção

---

## 🎯 Main Goals

### 1 — Base funcional de VTT

- 🔐 Autenticação real
- 🧑‍🤝‍🧑 Gestão de campanhas e participantes
- 🗺️ Mesa de jogo
- 🎭 Atores de campanha
- 🧍 Personagens jogáveis
- 🎲 Rolagens, chat, diário, tokens e cenas

### 2 — Backend profissional

- 🏗️ Arquitetura escalável
- 🔒 Integridade de dados forte
- 📐 Separação clara de responsabilidades
- ⚡ Rotas reais com validação
- 🧠 Backend e banco como fonte da verdade

### 3 — Frontend conectado ao domínio

- Telas baseadas em Figma e referências de VTT
- Integração real com API
- Auth via sessão/cookie
- UI incremental sem depender de mock permanente
- Builder de personagem avançando por etapas reais

---

## 💡 Development Philosophy

> Desenvolvimento incremental com mentalidade de produção.

Princípios:

- ✔️ Pequenos passos funcionais
- ✔️ Cada micro deve ser testável
- ✔️ Refatoração contínua
- ✔️ Backend como fonte da verdade
- ✔️ Banco protege integridade
- ✔️ Frontend consome API real sempre que possível
- ✔️ Evitar mock circular
- ✔️ Código serve ao domínio
- ✔️ Cada tela deve aproximar o produto de algo jogável

---

## 🧭 Source-of-truth workflow para código grande

Regra atual de trabalho para arquivos grandes, especialmente:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
```

- Para mudanças grandes: reescrever o arquivo inteiro com base no último arquivo enviado.
- Para mudanças pequenas: usar apenas âncoras reais do arquivo atual.
- Não orientar com estrutura presumida de versões anteriores.
- Tratar o último `page.tsx` enviado como fonte única da verdade.
- Antes de commit Git, sempre rodar `git diff --stat`.

---

## 📦 Repository Structure — Estado atual

```txt
LegendForge/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── generated/
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── get-authenticated-session.ts
│   │   │   └── prisma.ts
│   │   ├── routes/
│   │   │   ├── campaigns.ts
│   │   │   ├── character-sheets.ts
│   │   │   └── systems.ts
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
│   │   │   │   ├── search/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── edit/page.tsx
│   │   │   │       └── play/page.tsx
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
- regras críticas quando fizer sentido
- fonte de verdade do domínio

### 2. Prisma

Responsável por:

- acesso tipado ao banco
- queries relacionais
- migrations/db push durante desenvolvimento
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
- validação com Zod
- autorização
- orquestração da API
- integração com Better Auth

---

## 🔐 Sistema de Autenticação

Implementado:

- Better Auth
- Prisma Adapter
- Sessões persistentes
- Integração com Fastify
- Frontend com `authClient`
- Backend com helper `getAuthenticatedSession`

Fluxo atual:

1. Usuário registra ou faz login.
2. Better Auth cria/atualiza sessão no banco.
3. Browser mantém cookie de sessão.
4. Frontend chama API com `credentials: "include"`.
5. Backend valida sessão via Better Auth.
6. Rotas protegidas usam `session.user.id`.

Decisão importante:

> Não usar Bearer token manual/localStorage para sessão principal. O fluxo atual usa sessão/cookie do Better Auth.

---

## 🧩 Modelagem Atual

### Núcleo implementado

- User
- Session
- Account
- Verification

### Campanhas e mesa

- Campaign
- Participant
- GameSession
- CampaignActor
- SceneToken

### Sistema RPG

- GameSystem
- Stat
- Skill
- Ancestry
- Background
- CharacterClass
- CharacterSubclass
- Feature
- Spell
- Equipment

### Ficha/personagem

- CharacterSheet
- CharacterSheetStat
- CharacterSheetSkill
- CharacterSheetSpell
- CharacterSheetEquipment

---

## 🗺️ Campanha — Fluxo Atual

Backend:

- `POST /campaigns`
- `GET /campaigns`
- `GET /campaigns/:id`
- `PATCH /campaigns/:id`
- `DELETE /campaigns/:id`
- `POST /campaigns/join`
- rotas de participantes
- rotas de atores de campanha
- rotas de tokens de cena

Frontend:

- `/campaigns`
- `/campaigns/create`
- `/campaigns/search`
- `/campaigns/[id]/edit`
- `/campaigns/[id]/play`

---

## 🧍 Character Builder — Arquitetura atual

A criação de personagem está sendo construída dentro de:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
```

Backend relacionado:

```txt
backend/src/routes/character-sheets.ts
backend/src/routes/systems.ts
```

Estado atual:

- Menu de criação de personagem
- Modal do builder
- Etapa Conceito real
- Salvar rascunho
- Carregar rascunho
- Carregar opções reais do sistema
- Selecionar classe, ancestralidade e antecedente
- Persistir `classId`, `ancestryId`, `backgroundId`
- Validar avanço por etapa
- Etapa Atributos visual/local

Próximo passo:

```txt
4.15 — Persistir atributos no banco
```

---

## ⚙️ Decisões Arquiteturais

### DB-first mindset

> Banco é a fonte de verdade.

### Auth como núcleo

- Better Auth controla identidade.
- Backend consome a sessão.
- Sistema não reimplementa segurança.

### Prisma como camada oficial

- acesso tipado
- produtividade
- segurança
- geração de client

### Frontend incremental

- Figma e referências guiam a UI
- implementação segue domínio real
- mock permanente deve ser evitado

### IA no builder

A IA do LegendForge deve ser apenas sugestiva, não decisória. Ela pode sugerir classe, magia, truque, subclasse ou caminho de criação quando solicitada, mas a decisão final é sempre do jogador.

---

## ⚠️ Pontos de Atenção

- `page.tsx` da mesa está grande e precisa de cuidado.
- Evitar mudanças por trechos imaginados.
- Rotas ainda estão concentradas; services podem ser criados quando regras crescerem.
- Upload de imagens ainda usa URL/string; storage real fica para futuro.
- Builder ainda não finaliza personagem; está na fase de rascunho.
- Atributos foram criados visualmente, mas ainda não persistem no banco.

---

## 🔄 Current Phase

> **FASE 4 — Criação/Ficha de Personagem em andamento**

---

## 🎯 Direção Atual

Foco imediato:

- persistir atributos do builder
- carregar atributos salvos
- evoluir perícias, magias, equipamentos, sobre e revisão
- finalizar ficha e listar na aba Personagens

---

## 🧠 Regra Fundamental

> Se uma regra é crítica para o jogo, ela deve existir no banco ou no backend.

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
✔ Campanhas reais  
✔ Mesa com atores/tokens persistidos  
✔ Sistema RPG inicial semeado  
✔ Builder de personagem em andamento  
