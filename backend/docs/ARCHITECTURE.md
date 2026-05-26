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

## 💡 Development Philosophy

> Desenvolvimento incremental com mentalidade de produção.

Princípios:

- Pequenos passos funcionais.
- Cada micro deve ser testável.
- Refatoração contínua.
- Backend e banco como fonte de verdade.
- Evitar mock circular.
- Código deve servir ao domínio.
- UI deve aproximar o produto de algo jogável.
- Arquivos grandes exigem fonte única da verdade.
- Antes de qualquer commit Git: sempre rodar `git diff --stat`.

---

## 🧭 Source-of-truth workflow para código grande

Regra atual para arquivos grandes, principalmente:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
```

- Para mudança grande: reescrever o arquivo inteiro baseado no último arquivo enviado pelo usuário.
- Para mudança pequena: usar âncoras reais do arquivo atual no estilo “Procure este trecho / Troque por este trecho”.
- Não usar código presumido de versões antigas.
- Quando refatorar fluxos grandes, manter um único arquivo atual como fonte da verdade.

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
│   │   ├── lib/
│   │   └── service/
│   ├── public/
│   └── package.json
│
├── docs/
└── README.md
```

---

## ⚙️ Tech Stack

### Backend

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

### Frontend

- Next.js
- React
- Tailwind CSS
- TypeScript
- Better Auth Client
- Figma

---

## 🏗️ Backend Architecture

### PostgreSQL

Responsável por persistência, integridade, relacionamentos e regras críticas quando fizer sentido.

### Prisma

Responsável pelo acesso tipado ao banco, queries relacionais, migrations/db push durante desenvolvimento e Prisma Studio.

### Better Auth

Responsável por registro, login, sessões e cookies de autenticação.

### Fastify

Responsável por rotas HTTP, validação com Zod, autorização e integração com Better Auth.

---

## 🔐 Sistema de Autenticação

Implementado:

- Better Auth
- Prisma Adapter
- Sessões persistentes
- Integração com Fastify
- Frontend com `authClient`
- Backend com helper `getAuthenticatedSession`

Decisão importante:

> Não usar Bearer token manual/localStorage para sessão principal. O fluxo atual usa sessão/cookie do Better Auth.

---

## 🧩 Modelagem Atual

### Núcleo

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

## 🧍 Character Builder — Arquitetura atual

Arquivos principais:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
frontend/src/features/character-builder/
backend/src/routes/character-sheets.ts
backend/src/routes/systems.ts
backend/prisma/schema.prisma
backend/prisma/seed.ts
```

Estrutura extraída:

```txt
features/character-builder/
├── components/
├── constants/
├── review/
├── services/
├── steps/
├── summary/
├── types/
└── utils/
```

Status consolidado:

- Conceito, atributos, perícias, magias, equipamentos, sobre e revisão foram extraídos/refatorados.
- Criar personagem pela mesa abre draft vazio.
- Linguagem dinâmica por pronome foi aplicada em labels principais de classe/ancestralidade/antecedente.
- Pronome e gênero inicial foram sincronizados quando apropriado.
- O builder continua sendo aberto dentro da mesa.

---

## 🎲 Game Table — Arquitetura atual

A mesa foi refatorada para `frontend/src/features/game-table/`.

Estrutura:

```txt
features/game-table/
├── components/
│   ├── TableChatPanel.tsx
│   ├── TableCharactersPanel.tsx
│   ├── TableJournalPanel.tsx
│   ├── TableLeftToolbar.tsx
│   ├── TableRightPanel.tsx
│   ├── TableRollsPanel.tsx
│   ├── TableSceneCanvas.tsx
│   └── TableSettingsPanel.tsx
├── constants/
│   ├── dice-constants.ts
│   └── table-ui-constants.ts
├── services/
│   └── game-table-api.ts
├── types/
│   └── game-table-types.ts
└── utils/
    ├── actor-utils.ts
    ├── dice-utils.ts
    ├── token-utils.ts
    └── user-utils.ts
```

Funcionalidades atuais da mesa:

- Painel direito em abas: Chat, Rolagens, Personagens, Diário e Mesa.
- Toolbar esquerda funcional: Selecionar, Mover visão, Medir, Desenhar e Névoa.
- Tokens reais na cena com posição persistida.
- Tamanho de token editável e persistido.
- Escala definida: `1 quadrado = 40px = 1,5m`.
- Ferramenta Medir:
  - linha em metros
  - círculo com centro no clique e raio no arrasto
  - medição fica visível até trocar de ferramenta ou criar outra
- Ferramenta Desenhar:
  - desenho local
  - desfazer último traço
  - limpar desenhos
- Ferramenta Névoa:
  - névoa local com máscara real
  - áreas reveladas
  - tokens fora da área revelada ficam cobertos
- Biblioteca e `+ Criar` restaurados na aba Personagens.
- Sem sincronização em tempo real ainda.

Decisão atual:

> Desenho, medição, pan/zoom e névoa são locais/visuais por enquanto. Persistência e sincronização em tempo real entram em fases futuras.

---

## 🧠 Regras futuras importantes

### Perícias e proficiências

- Classe deve fornecer lista pré-definida de perícias permitidas e quantidade de escolhas.
- Antecedente deve fornecer quantidade de perícias com sugestões, mas usuário escolhe manualmente.
- Sistema deve impedir duplicidade da mesma perícia.
- Proficiências de armas, escudos, ferramentas e similares devem ser editáveis pelo GM durante a campanha.

### Armadura/defesa

- Armaduras devem ser principalmente visuais/cosméticas.
- Defesa deve vir de camada mecânica aplicada à roupa/equipamento, permitindo trocar aparência sem perder defesa.

### Personagens ativos

- Player comum: 1 personagem ativo por campanha.
- GM: pode ter vários NPCs/criaturas, mas só 1 personagem próprio ativo.
- NPCs/criaturas podem ir para biblioteca.
- Personagens de player/GM precisam de fluxo próprio de remover/inativar/excluir.

### Linguagem dinâmica

- Implementar e expandir linguagem baseada em pronomes.
- Primeiro masculino/feminino.
- Neutro será adaptado caso a caso depois.

### Upload de imagem

- Upload direto do computador entra na Fase 4.25.
- Inclui retrato, token, preview/fit/crop simples e persistência da URL no banco.

### Sincronização em tempo real

- Entrará em fase posterior.
- Deve sincronizar tokens, chat/rolagens, névoa, desenhos e demais eventos de mesa entre contas.

---

## 🔄 Current Phase

> **FASE 4 — Criação/Ficha de Personagem**

Estado atual:

```txt
[x] 4.22 — Refatoração do Character Builder
[x] 4.23 — Refatoração da Mesa de Jogo
[em andamento] 4.24.0 — Atualização dos documentos do projeto
[próximo] 4.24 — Personagens ativos, biblioteca e exclusão/remoção correta
```

---

## 🧠 Regra Fundamental

> Se uma regra é crítica para o jogo, ela deve existir no banco ou no backend.

---

## 🏆 Estado da Arquitetura

- Auth resolvido.
- Backend funcional.
- Prisma operacional.
- Frontend conectado.
- Campanhas reais.
- Mesa com atores/tokens persistidos.
- Sistema RPG inicial semeado.
- Builder de personagem avançado e refatorado.
- Mesa de jogo refatorada em `features/game-table`.
- Próximo foco: regras corretas de personagens ativos, biblioteca e remoção/exclusão.
