# 🎲 LegendForge

![Status](https://img.shields.io/badge/status-character%20builder%20refactor%20in%20progress-yellow)
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
│   │   └── seed.ts
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   └── character-builder/
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

> 🟡 Character builder refactor in progress

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
- Campaign actors and token foundation
- RPG system foundation:
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
- Character sheet foundation:
  - CharacterSheet
  - CharacterSheetStat
  - CharacterSheetSkill
  - CharacterSheetSpell
  - CharacterSheetEquipment
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
  - persisted spells
  - persisted initial equipment
  - about/review steps
  - partial extraction into `features/character-builder`

---

## 🚧 In Progress

Current focus:

```txt
4.22.18 — Finish review/refactor stabilization
```

Known issue:

```txt
Creating a new character can still load old draft data.
```

Expected fix:

- “Criar personagem” should open an empty `CharacterBuilderDraft`.
- It should not call the existing draft loader.
- The old draft loader should remain available for a future “continue draft/edit” flow.

---

## 🔜 Next Steps

```txt
4.22.18.3 — Clear default draft values / open new character empty
4.22.18.4 — Dynamic language by pronoun
4.22.18.5 — Sync pronoun with initial gender
4.22.19 — Final cleanup of page.tsx
4.22.20 — Full builder regression test
4.22.21 — Commit builder refactor
```

---

## 🔮 Confirmed Future Backlog

### Game table refactor

- extract table layout
- extract panels/tabs
- refactor token layer
- add token size editing

### Character/player rules

- each player should have only one active character per campaign
- GM can have many NPCs/creatures
- GM should have only one own active player-character
- NPCs/creatures can move to library
- player characters need their own removal/inactivation flow

### Advanced RPG rules

- class-based skill lists and choice counts
- background skill suggestions with manual selection
- no duplicate skill selection
- saving throws
- editable proficiencies by GM
- armor/defense as a mechanical layer separate from visual clothes
- multiclass

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

More details:

- `docs/DATABASE_SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/DEV_STATE.md`

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
