# 📊 DEV STATE — LegendForge

---

## 📅 Last Update

26/05/2026

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
│   │   │   ├── character-builder/
│   │   │   │   ├── components/
│   │   │   │   ├── constants/
│   │   │   │   ├── review/
│   │   │   │   ├── services/
│   │   │   │   ├── steps/
│   │   │   │   ├── summary/
│   │   │   │   ├── types/
│   │   │   │   └── utils/
│   │   │   └── game-table/
│   │   │       ├── components/
│   │   │       ├── constants/
│   │   │       ├── services/
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
- posição de token persiste
- tamanho de token persiste
- rascunho de CharacterSheet cria no banco
- rascunho carrega
- classe/ancestralidade/antecedente persistem
- atributos persistem
- perícias persistem
- magias persistem
- equipamentos persistem
- campos de sobre persistem
- criação de personagem do zero abre draft vazio

### 🚧 Em andamento

- atualização dos documentos após 4.23
- próxima macro: personagens ativos, biblioteca e exclusão/remoção correta
- preparar upload real de imagens
- finalizar fluxo estável de ficha pronta
- persistência/sincronização futura de ferramentas locais da mesa

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
- toolbar lateral esquerda
- painel direito com abas extraídas
- Chat
- Rolagens
- Personagens
- Diário inicial
- Mesa/configuração inicial
- atores reais
- tokens/cena
- modal de criação de personagem
- builder de personagem
- biblioteca de atores
- ações de ator/personagem
- edição de tamanho de token

---

## 🧍 Character Builder — Status detalhado

Pasta principal:

```txt
frontend/src/features/character-builder/
```

Etapas/componentes extraídos:

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

Status:

- Criar personagem abre draft vazio.
- Builder não carrega dados antigos da Hikari ao criar personagem.
- Pronomes influenciam linguagem de labels principais.
- Pronome e gênero inicial sincronizam quando apropriado.
- Salvar rascunho funciona.
- Teste regressivo da refatoração do builder foi concluído antes da 4.23.

---

## 🎲 Game Table — Status detalhado

Pasta principal:

```txt
frontend/src/features/game-table/
```

Componentes extraídos:

- `TableLeftToolbar`
- `TableSceneCanvas`
- `TableRightPanel`
- `TableChatPanel`
- `TableRollsPanel`
- `TableCharactersPanel`
- `TableJournalPanel`
- `TableSettingsPanel`

Constantes, serviços, types e utils extraídos:

- `constants/dice-constants.ts`
- `constants/table-ui-constants.ts`
- `services/game-table-api.ts`
- `types/game-table-types.ts`
- `utils/actor-utils.ts`
- `utils/dice-utils.ts`
- `utils/token-utils.ts`
- `utils/user-utils.ts`

Funcionalidades validadas:

- Selecionar move tokens.
- Mover visão arrasta o mapa.
- Medir linha em metros.
- Medir círculo com centro no clique e raio no arrasto.
- Medição permanece até trocar ferramenta ou criar outra.
- Desenhar cria traços locais.
- Desenhar desfaz último traço.
- Desenhar limpa desenhos.
- Névoa cria áreas reveladas com máscara real.
- Névoa desfaz última área.
- Névoa limpa áreas.
- Tokens fora da área revelada ficam cobertos.
- Tamanho de token 1x1, 2x2, 3x3 e 4x4 funciona.
- Tamanho de token persiste após recarregar.
- Biblioteca e `+ Criar` aparecem na aba Personagens.
- Teste regressivo da mesa concluído.

Observação:

```txt
Medição, desenho, névoa, pan/zoom e chat/rolagens atuais ainda são locais/visuais.
Sincronização real entre contas será tratada em fase futura.
```

---

## 🧩 Micros atuais

```txt
[x] 4.22 — Refatoração do Character Builder
[x] 4.23 — Refatoração da Mesa de Jogo
[em andamento] 4.24.0 — Atualização dos documentos do projeto
[próximo] 4.24 — Personagens ativos, biblioteca e exclusão/remoção correta
```

---

## 🧭 Próximo plano

### 4.24.0 — Documentos

```txt
[ ] 4.24.0.1 — Atualizar DEV_STATE.md com fechamento da 4.23
[ ] 4.24.0.2 — Atualizar FEATURE_CAPSULE.md com ferramentas da mesa
[ ] 4.24.0.3 — Atualizar ARCHITECTURE.md com features/game-table
[ ] 4.24.0.4 — Atualizar BOOT.md com estado atual e próximo passo
[ ] 4.24.0.5 — Atualizar README.md se necessário
[ ] 4.24.0.6 — Commit dos documentos
```

### 4.24 — Personagens ativos, biblioteca e exclusão/remoção correta

```txt
[ ] 4.24.1 — Mapear regras atuais de CampaignActor, TABLE/LIBRARY e SceneToken
[ ] 4.24.2 — Definir regra de personagem ativo por player
[ ] 4.24.3 — Corrigir diferença entre remover token da cena, devolver à biblioteca e excluir ator
[ ] 4.24.4 — Implementar remoção/exclusão segura de NPC/criatura
[ ] 4.24.5 — Implementar regra de personagem de player/GM sem tratar como NPC
[ ] 4.24.6 — Ajustar UI da aba Personagens/Biblioteca para essas regras
[ ] 4.24.7 — Teste regressivo de atores, tokens e biblioteca
[ ] 4.24.8 — Commit da 4.24
```

---

## 🔮 Backlog confirmado

### Fase 4.25 — Ficha pronta/imagens

- página/modal de ficha pronta
- upload de retrato direto do computador
- upload de token direto do computador
- preview/fit/crop
- persistência de URL

### Fase 4.26 — Ajustes finais de UX/UI da ficha pronta

- polish visual
- legibilidade
- responsividade
- revisão de layout

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

👉 **Fase 4.24.0 em andamento. Próximo passo funcional: 4.24 — Personagens ativos, biblioteca e exclusão/remoção correta.**
