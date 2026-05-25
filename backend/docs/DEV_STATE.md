# 📊 DEV STATE — LegendForge

---

## 📅 Last Update

24/05/2026

---

## 🧱 Project Structure

```txt
LegendForge/
├── backend/
│   ├── src/
│   │   ├── generated/prisma/
│   │   ├── lib/
│   │   ├── routes/
│   │   │   ├── campaigns.ts
│   │   │   ├── character-sheets.ts
│   │   │   └── systems.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── campaigns/[id]/play/page.tsx
│   │   ├── features/
│   │   │   └── character-builder/
│   │   │       ├── components/
│   │   │       ├── constants/
│   │   │       ├── review/
│   │   │       ├── steps/
│   │   │       ├── summary/
│   │   │       ├── types/
│   │   │       └── utils/
│   │   ├── components/
│   │   ├── lib/
│   │   └── service/
│   └── package.json
│
├── docs/
└── README.md
```

---

## ⚙️ Dependencies

### Backend

- Node.js
- Fastify
- TypeScript
- Prisma
- PostgreSQL
- Better Auth
- Zod
- Swagger
- Scalar API Reference
- ESLint
- Prettier
- pnpm
- Docker

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth Client
- lucide-react
- ESLint
- pnpm

---

## 🗄️ Database — Status Real

### ✅ Implementado

- Better Auth tables
- GameSystem
- Stat
- Skill
- Campaign
- Participant
- GameSession
- CampaignActor
- SceneToken
- Ancestry
- Background
- CharacterClass
- CharacterSubclass
- Feature
- Spell
- Equipment
- CharacterSheet
- CharacterSheetStat
- CharacterSheetSkill
- CharacterSheetSpell
- CharacterSheetEquipment

### ✅ Validado

- registro cria usuário
- login cria sessão
- sessão aparece no Prisma Studio
- campanhas são criadas com owner
- criador entra como participante GM
- home lista campanhas do usuário autenticado
- página de mesa abre campanha real
- aba Personagens consome atores reais
- biblioteca/mesa de atores está persistida
- tokens de cena persistem
- rascunho de CharacterSheet cria no banco
- rascunho carrega
- classe/ancestralidade/antecedente persistem
- atributos persistem
- perícias persistem
- magias persistem
- equipamentos persistem
- campos de sobre persistem

### 🚧 Em andamento

- refatoração do Character Builder
- correção do fluxo “Criar personagem do zero”
- limpeza final do `page.tsx`
- teste regressivo completo
- preparar upload real de imagens
- finalizar fluxo estável de ficha

---

## 🌐 API — Status

### ✅ Implementado

- Fastify configurado
- CORS funcionando para frontend local
- Better Auth em `/api/auth/*`
- Swagger em `/swagger.json`
- Scalar em `/docs`
- Helper de sessão real
- Rotas de campanha
- Rotas de participantes
- Rotas de sistemas
- Rotas de character sheets
- Rotas de atores de campanha
- Rotas de tokens de cena

### Rotas importantes atuais

```txt
GET    /campaigns
POST   /campaigns
GET    /campaigns/:id
PATCH  /campaigns/:id
DELETE /campaigns/:id

GET    /campaigns/:id/participants
PATCH  /campaigns/:campaignId/participants/:participantId/role
DELETE /campaigns/:campaignId/participants/:participantId

GET    /campaigns/:campaignId/actors
POST   /campaigns/:campaignId/actors
PATCH  /campaigns/:campaignId/actors/:actorId

GET    /campaigns/:campaignId/tokens
POST   /campaigns/:campaignId/tokens
PATCH  /campaigns/:campaignId/tokens/:tokenId
DELETE /campaigns/:campaignId/tokens/:tokenId

GET    /systems
GET    /systems/:systemId/character-options

GET    /campaigns/:campaignId/character-sheets
POST   /campaigns/:campaignId/character-sheets
GET    /campaigns/:campaignId/character-sheets/:sheetId
PATCH  /campaigns/:campaignId/character-sheets/:sheetId
```

---

## 🎨 Frontend — Status

### ✅ Implementado

- Home pública
- Login
- Registro
- Header privado
- Background parchment
- `/campaigns`
- `/campaigns/create`
- `/campaigns/search`
- `/campaigns/[id]/edit`
- `/campaigns/[id]/play`

### Página de jogo `/campaigns/[id]/play`

Estado atual:

- header de mesa
- grid/mapa
- toolbar lateral
- abas laterais
- Chat
- Rolagens
- Personagens
- Diário inicial
- Mesa/configuração inicial
- atores reais
- tokens/cena
- modal de criação de personagem
- builder de personagem

---

## 🧍 Character Builder — Status detalhado

Arquivo principal ainda grande:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
```

Pasta criada para refatoração:

```txt
frontend/src/features/character-builder/
```

Etapas/componentes já extraídos ou parcialmente extraídos:

- types
- constants
- steps config
- utils de atributos
- utils de perícias
- utils de magias
- utils de equipamentos
- utils de sobre/about
- componentes genéricos
- componentes da revisão
- etapa Conceito
- etapa Atributos
- etapa Perícias
- etapa Magias
- etapa Equipamentos
- etapa Sobre
- etapa Revisão

---

## ⚠️ Problema atual

O fluxo abaixo ainda precisa ser corrigido/validado:

```txt
+ Criar → Criar personagem
```

Comportamento esperado:

- abrir ficha vazia
- não carregar Hikari ou qualquer rascunho antigo
- nome/pronomes/conceito vazios
- sem classe/ancestralidade/antecedente selecionados
- sem savedCharacterSheetId
- status como rascunho novo

Comportamento observado recentemente:

- abriu com dados antigos de uma ficha/rascunho existente

---

## 🧠 Plano imediato

```txt
4.22.18.3 — Limpar valores padrão do rascunho inicial
```

Tarefas:

- [ ] encontrar função chamada pelo botão “Criar personagem”
- [ ] remover chamada de `handleLoadCharacterBuilderDraft()` desse fluxo
- [ ] criar/usar `createEmptyCharacterBuilderDraft()`
- [ ] limpar `savedCharacterSheetId`
- [ ] limpar `savedCharacterSheetStatus`
- [ ] limpar erro/sucesso
- [ ] manter `handleLoadCharacterBuilderDraft()` para fluxo futuro “continuar rascunho”
- [ ] testar abrindo do zero

Depois:

```txt
4.22.18.4 — Linguagem dinâmica por pronome
4.22.18.5 — Sincronizar pronome com gênero inicial
```

---

## 🧩 Micros atuais

```txt
[x] 4.22.1 — Criar estrutura features/character-builder
[x] 4.22.2 — Extrair types
[x] 4.22.3 — Extrair constants
[x] 4.22.4 — Extrair steps config
[x] 4.22.5 — Extrair utils de atributos
[x] 4.22.6 — Extrair utils de perícias
[x] 4.22.7 — Extrair utils de magias
[x] 4.22.8 — Extrair utils de equipamentos
[x] 4.22.9 — Extrair utils de sobre/about
[x] 4.22.10 — Extrair componentes genéricos do builder
[x] 4.22.11 — Extrair componentes da revisão
[x] 4.22.12 — Extrair etapa Conceito
[x] 4.22.13 — Extrair etapa Atributos
[x] 4.22.14 — Extrair etapa Perícias
[x] 4.22.15 — Extrair etapa Magias
[x] 4.22.16 — Extrair etapa Equipamentos
[x] 4.22.17 — Extrair etapa Sobre
[em andamento] 4.22.18 — Revisão + correções finais
[ ] 4.22.18.3 — Limpar valores padrão do rascunho inicial
[ ] 4.22.18.4 — Linguagem dinâmica por pronome
[ ] 4.22.18.5 — Sincronizar pronome com gênero inicial
[ ] 4.22.19 — Limpeza final de imports/funções mortas
[ ] 4.22.20 — Teste regressivo completo
[ ] 4.22.21 — Commit
```

---

## 🔮 Backlog confirmado

### Fase 4.23 — Refatoração da mesa

- extrair layout/header/toolbar/painéis/abas
- refatorar camada de tokens
- adicionar edição de tamanho de token

### Fase 4.24 — Personagens ativos/biblioteca/exclusão

- NPCs/criaturas podem ir para biblioteca
- personagens de player têm regra própria
- limitar 1 personagem ativo por player por campanha
- GM pode ter vários NPCs/criaturas, mas só 1 personagem próprio ativo

### Fase 4.25 — Ficha pronta/imagens

- página/modal de ficha pronta
- upload de retrato direto do computador
- upload de token direto do computador
- preview/fit/crop
- persistência de URL

### Fase 4.27 — Regras avançadas

- seed mais robusto
- progressão por nível
- magias por classe/nível
- perícias por classe/antecedente
- salvaguardas
- proficiências editáveis pelo GM
- defesa/armadura como camada mecânica

### Fase 4.28 — Multiclasse

- múltiplas classes por ficha
- nível por classe
- impacto em perícias, proficiências, magias e equipamentos

---

## ⚠️ Regra de trabalho

- `page.tsx` é grande.
- Usar sempre o último arquivo enviado como fonte da verdade.
- Mudança grande = arquivo completo.
- Mudança pequena = âncora real.
- Não presumir estrutura antiga.
- Antes de commit: `git diff --stat`.

---

## 🏁 Estado Atual

👉 **Fase 4.22.18 em andamento. Próximo passo: corrigir criação de personagem do zero para não carregar rascunho antigo.**
