# 🎲 LegendForge

![Status](https://img.shields.io/badge/status-multiclass%20spell%20foundation%20complete-green)
![Backend](https://img.shields.io/badge/backend-fastify-blue)
![Frontend](https://img.shields.io/badge/frontend-next.js-black)
![Database](https://img.shields.io/badge/database-postgresql-blue)
![ORM](https://img.shields.io/badge/orm-prisma-2D3748)
![Auth](https://img.shields.io/badge/auth-better--auth-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

> A modern Virtual Tabletop (VTT) built with production-grade backend architecture, focusing on scalability, modularity, and real-world system design.

---

## 🚀 About the Project

**LegendForge** is a Virtual Tabletop designed to run tabletop RPG sessions online.

Inspired by tools like Roll20 and Foundry VTT, but with a different philosophy:

- 🧩 System-agnostic
- 🎲 Focused on custom campaigns
- 👥 Built for real gameplay with friends
- 🧠 Designed as a serious full-stack portfolio project
- ⚙️ Built incrementally with production mindset
- 📄 Character creation built as a real persisted flow

---

## 🎯 What Makes This Project Different

LegendForge demonstrates:

- Real backend architecture
- Production-oriented database modeling
- Business rules treated seriously
- Real authentication and persisted sessions
- System design thinking
- Flexible RPG engine foundation
- UI built from a Figma-driven product flow
- Character builder connected to real domain data
- Multiclass character progression foundation
- Spell rules separated into known/prepared/future in-game grants

---

## ⚙️ Tech Stack

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
- Docker
- pnpm

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth Client
- Figma

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
│   │   ├── seed.ts
│   │   └── seed-data/
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── character-builder/
│   │   │   └── game-table/
│   │   ├── lib/
│   │   └── service/
│   ├── public/
│   └── package.json
│
├── docs/
└── README.md
```

---

## 📊 Current Status

> 🟢 Multiclass spell foundation complete. Continuing toward pending choices and Level Up real.

### ✅ Completed

- Backend base with Fastify + TypeScript
- ESLint + Prettier
- Zod validation
- Swagger docs
- Scalar interactive docs
- Prisma integration
- PostgreSQL connection via Docker
- Prisma Studio validation
- Better Auth integration
- User registration and login flow
- Session persistence in database
- Cookie-based authenticated API calls
- Campaign domain:
  - Campaign
  - Participant
  - GameSession
- Campaign API routes
- Frontend campaign flow:
  - `/campaigns`
  - `/campaigns/create`
  - `/campaigns/search`
  - `/campaigns/[id]/edit`
- Game page:
  - `/campaigns/[id]/play`
- Character sheet pop-out:
  - `/campaigns/[id]/sheets/[sheetId]`
- Campaign actors and token foundation
- RPG system foundation:
  - GameSystem
  - Stat
  - Skill
  - Language
  - Ancestry
  - Background
  - CharacterClass
  - CharacterSubclass
  - Feature
  - Spell
  - Equipment
  - LevelProgression
  - LevelProgressionSpellLimit
  - ClassSpell
- Character sheet foundation:
  - CharacterSheet
  - CharacterSheetStat
  - CharacterSheetSkill
  - CharacterSheetSpell
  - CharacterSheetLanguage
  - CharacterSheetEquipment
  - CharacterSheetClass
- Character builder:
  - creation menu
  - builder layout
  - concept step
  - draft save/load
  - real class/ancestry/background options
  - clickable cards
  - persisted class/ancestry/background choices
  - step validation
  - attributes with Standard Array
  - persisted attributes
  - persisted skills
  - persisted languages
  - persisted spells
  - persisted initial equipment
  - about/review steps
  - narrative fields
  - initial multiclass
  - class level distribution
  - initial multiclass HP
  - initial multiclass features
  - initial multiclass spell limits

---

## 🪄 Current Spell Foundation

LegendForge currently separates:

```txt
Known spells
Prepared spells
Always-known spells
GM-granted spells
```

Current rule:

```txt
Builder chooses known spells.
Prepared spells are future sheet state.
GM-granted spells do not count against builder/level-up limits.
```

The multiclass spell flow:

```txt
- ClassSpell decides which class can access each spell.
- LevelProgressionSpellLimit decides known/prepared limits by spell level.
- CharacterSheetSpell stores selected spells.
- CharacterSheetSpell.classId stores internal class origin.
- The ready sheet shows a clean Conjuration block by class.
- Spell cards remain clean and do not show class source.
```

---

## 🚧 In Progress

Current focus:

```txt
4.7 — Multiclasse e Level Up real
```

Next micro:

```txt
4.7.8.1 — Mapear escolhas pendentes possíveis
```

---

## 🔜 Next Steps

```txt
4.7.8 — Escolhas pendentes iniciais
4.7.9 — Refatorar preview de Level Up para usar CharacterSheetClass escolhida
4.7.10 — Criar plano de mudanças do Level Up
4.7.11 — Tela de resumo das mudanças do Level Up
4.7.12 — Telas de escolhas pendentes do Level Up
4.7.13 — Aplicar mudanças reais na ficha ao confirmar
```

---

## 🔮 Confirmed Future Backlog

### Character rules

- pending choices
- real level up flow
- prepared spell state
- spell slot usage
- sub-ancestries
- feats/ASI
- GM-granted spells and rewards

### Game table

- persistent chat
- persistent roll log
- real-time synchronization
- combat and initiative
- multiple scenes/maps

### NPCs and creatures

- NPC sheet
- creature/bestiary sheet
- bestiary templates
- campaign library

### Image upload

- portrait upload from computer
- token upload from computer
- preview/fit/crop
- persist URL in database

---

## 🔐 Authentication

LegendForge uses **Better Auth** as the core authentication layer.

Current auth foundation includes:

- `user`
- `session`
- `account`
- `verification`

Current flow:

1. User registers or logs in.
2. Better Auth persists session in PostgreSQL.
3. Browser stores the session cookie.
4. Frontend calls the API with `credentials: "include"`.
5. Backend reads session through Better Auth.
6. Protected routes use `session.user.id`.

---

## 🗄️ Database

The project follows a **DB-first mindset**.

Current state:

- Prisma is integrated
- PostgreSQL is connected
- Database sync is working
- Auth tables are operational
- Campaign tables are operational
- RPG domain is expanding incrementally
- CharacterSheet domain exists and is connected to the builder
- Multiclass spell limits and spell origins are modeled

More details:

- `docs/DATABASE_SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/DEV_STATE.md`
- `docs/LEGENDFORGE_PHASES_CANONICAL.md`

---

## 🧠 Development Philosophy

- Incremental
- Always functional
- No unnecessary overengineering
- Continuous refinement
- Production mindset from the start
- Backend and database protect the domain
- UI is built around real product flow

> Build small. Scale right.

---

## 🚀 Getting Started

### Backend

```bash
cd backend
docker compose up -d
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm run dev
```

### Prisma Studio

```bash
cd backend
pnpm prisma studio
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

---

## 🧪 Local Development Notes

When changing the Prisma schema:

```bash
cd backend
pnpm prisma format
pnpm prisma validate
pnpm prisma generate
pnpm prisma db push
```

For frontend cache issues:

```bash
cd frontend
rm -rf .next
pnpm run dev
```

Before commits:

```bash
git diff --stat
git status
```

---

## 👨‍💻 Author

Raiel Godinho  
<https://github.com/raiellgod>

---

## 🔮 Vision

LegendForge aims to become:

- A complete Virtual Tabletop
- A strong full-stack portfolio project
- A modular RPG engine
- A well-architected product
- A real multiplayer tabletop experience

Built step by step.  
Built to scale.  
Built like a real product.
