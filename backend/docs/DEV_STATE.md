# 📊 DEV STATE — LegendForge

---

## 📅 Last Update

21/05/2026

---

## 🧱 Project Structure

```txt
LegendForge/
├── backend/
│   ├── src/
│   │   ├── generated/prisma/
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── get-authenticated-session.ts
│   │   │   └── prisma.ts
│   │   ├── routes/
│   │   │   ├── campaigns.ts
│   │   │   ├── character-sheets.ts
│   │   │   └── systems.ts
│   │   └── index.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
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
│   │   │
│   │   ├── components/ui/
│   │   ├── lib/
│   │   │   └── auth-client.ts
│   │   └── service/
│   │
│   ├── public/
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
- rascunho de CharacterSheet cria no banco
- rascunho carrega ao abrir builder
- classe/ancestralidade/antecedente persistem na ficha
- atributos existem visualmente no builder

### 🚧 Em andamento

- persistir atributos do builder em `CharacterSheetStat`
- refinar constraints
- aplicar regras SQL avançadas
- preparar upload real de imagens
- finalizar fluxo de criação de ficha

---

## 🌐 API — Status

### ✅ Implementado

- Fastify configurado
- CORS funcionando para frontend local
- Better Auth exposto em `/api/auth/*`
- Swagger em `/swagger.json`
- Scalar em `/docs`
- Helper de sessão real do Better Auth
- Rotas de campanha
- Rotas de participantes
- Rotas de sistemas
- Rotas de character sheets

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

GET    /systems
GET    /systems/:systemId/character-options

GET    /campaigns/:campaignId/character-sheets
POST   /campaigns/:campaignId/character-sheets
GET    /campaigns/:campaignId/character-sheets/:sheetId
PATCH  /campaigns/:campaignId/character-sheets/:sheetId
```

### ⚠️ Ajustes pendentes

- persistência de stats no POST/PATCH de ficha
- retorno dos stats no GET de ficha
- talvez criar services quando regras crescerem
- padronizar erros
- validar se classe/ancestralidade/antecedente pertencem ao mesmo sistema

---

## 🎨 Frontend — Status

### ✅ Implementado

- Home pública
- Login
- Registro
- Header privado
- Background parchment
- Botão base
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
- atores reais de campanha
- tokens/cena iniciais
- modal de criação de personagem
- builder de personagem

---

## 🧍 Character Builder — Status detalhado

Arquivo principal:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
```

Backend:

```txt
backend/src/routes/character-sheets.ts
backend/src/routes/systems.ts
backend/prisma/schema.prisma
```

Concluído:

- menu inicial com opções de criação
- builder em modal
- etapas:
  - Conceito
  - Classe
  - Ancestralidade
  - Antecedente
  - Atributos
  - Perícias
  - Magias
  - Equipamentos
  - Sobre
  - Revisão
- etapa Conceito com campos reais
- salvar rascunho
- carregar rascunho
- carregar opções reais do sistema
- cards clicáveis para classe, ancestralidade e antecedente
- resumo lateral
- validação de avanço
- etapa Atributos visual/local
- cálculo de modificador

Pendente imediato:

```txt
4.15 — Persistir atributos no banco
```

---

## 🧠 Fluxo atual do Builder

1. Usuário abre mesa.
2. Clica para criar personagem.
3. Abre menu de criação.
4. Escolhe “Criar personagem”.
5. Builder abre.
6. Carrega rascunho existente, se houver.
7. Carrega opções do sistema.
8. Usuário preenche conceito.
9. Usuário escolhe classe, ancestralidade e antecedente.
10. Usuário ajusta atributos visualmente.
11. Rascunho salva no banco.
12. Próximo: atributos também precisam salvar/carregar.

---

## ⚠️ Pontos de Atenção

### Unidade de trabalho

- `page.tsx` é grande.
- Não trabalhar com suposição.
- Na próxima conversa, usar o último `page.tsx` enviado como fonte da verdade.
- Mudança grande = reescrever arquivo completo.
- Mudança pequena = âncora real do arquivo atual.

### Tailwind/Next

- Em dev local, usar `next dev --webpack`.
- Cache `.next` pode precisar ser limpo.

### Imagens

- `portraitUrl` e `tokenImageUrl` ainda são strings/URLs.
- Storage real fica para futuro.

### Backend

- Rotas ainda concentram lógica.
- Services podem ser criados quando regras crescerem.

---

## ✅ Implemented Features

- Auth real
- Sessão real com cookie
- Backend protegido por usuário autenticado
- Home logada de campanhas
- Criação de campanha
- Participante GM automático
- Edição inicial da campanha
- Busca/entrada de campanha iniciada
- Página de mesa
- Atores reais na mesa
- Tokens/cena com persistência inicial
- Sistema RPG base
- Builder visual de personagem
- Rascunho de ficha persistido
- Seleção de classe/ancestralidade/antecedente persistida
- Atributos visuais no builder

---

## 🎯 Current Focus

### 🔥 FASE ATUAL

👉 **Fase 4 — Criação/ficha de personagem**

Micro atual:

```txt
4.15 — Persistir atributos no banco
```

---

## 🚀 Next Steps

### Próximo micro exato

- [ ] enviar atributos no `handleSaveCharacterBuilderDraft`
- [ ] aceitar atributos no `character-sheets.ts`
- [ ] validar atributos entre 3 e 20
- [ ] criar/atualizar `CharacterSheetStat`
- [ ] incluir stats no GET
- [ ] popular builder com stats salvos

### Depois

- [ ] 4.16 — Perícias ligada à classe/antecedente
- [ ] 4.17 — Magias ligada à classe
- [ ] 4.18 — Equipamentos ligada à classe/antecedente
- [ ] 4.19 — Sobre
- [ ] 4.20 — Revisão
- [ ] 4.21 — Finalizar ficha e listar na aba Personagens

---

## 🏁 Estado Atual

👉 **Character Builder em andamento, pronto para persistir atributos.**
