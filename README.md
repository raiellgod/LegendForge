# 🎲 LegendForge

![Status](https://img.shields.io/badge/status-ready%20sheet%20rolls%20complete-green)
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
- 🗺️ Table tools built toward a playable VTT experience
- 🧍 Ready character sheet designed for actual gameplay at the table
- 🎲 Sheet-based roll actions connected to the table chat

---

## 🎯 What Makes This Project Different

LegendForge demonstrates:

- 🏗️ Real backend architecture
- 🗄️ Production-oriented database modeling
- ⚙️ Business rules treated seriously
- 🔐 Real authentication and persisted sessions
- 🧠 System design thinking
- 🎮 Flexible RPG engine foundation
- 🎨 UI built from a product-driven flow
- 🧍 Character builder connected to real domain data
- 🧾 Ready character sheet with tabs, compact status view and inventory/profile/magic sections
- 🎲 Table roll actions from skills, saving throws, initiative, equipment and spells
- 🧩 Incremental VTT features with persistence where it matters

---

## ⚙️ Tech Stack

### 🖥️ Backend

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

### 🎨 Frontend

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

> 🟢 Ready character sheet and sheet-based roll actions completed.  
> 🟡 Next focus: advanced system/character rules, including spellcasting progression, level-up preparation and multiclass foundation.

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
- Campaign actors and real actor locations
- Scene tokens persisted in the database
- Token size editing and persistence
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
  - standard array attributes
  - persisted attributes
  - persisted skills
  - persisted spells
  - persisted starting equipment
  - about/appearance/personality/history step
  - review step
  - empty draft when creating a new character
  - basic dynamic language by pronoun
- Ready character sheet:
  - header with identity visible on all tabs
  - tabs in order: Ficha/Status, Bolsa, Magia, Perfil
  - compact status layout
  - all skills shown, not only proficient skills
  - saving throws and skill rows prepared as rollable actions
  - Bolsa separated with equipment, coins, attack and damage buttons
  - Magia separated with spell cards and basic actions
  - Perfil separated with image/token/profile/narrative fields
  - portrait/token URL editing and persistence
- Game table refactor:
  - `features/game-table`
  - extracted toolbar
  - extracted scene canvas
  - extracted right panel
  - extracted Chat, Rolls, Characters, Journal and Settings panels
  - select tool
  - pan tool
  - measure line/circle tool
  - local drawing tool
  - local fog tool with real mask
  - table regression test completed
- Ready sheet roll actions:
  - click skill → rolls `1d20 + skill bonus`
  - click saving throw → rolls `1d20 + saving throw bonus`
  - click initiative → rolls `1d20 + initiative bonus`
  - GM table initiative ranking
  - player characters use real initiative bonus
  - NPCs/creatures use `+0` until their own sheets exist
  - equipment attack basic button
  - equipment damage button
  - spell attack basic button
  - spell damage detection from description
  - spell effect message to chat
- Player creation access:
  - player common user sees `+ Personagem`
  - player opens character builder directly
  - GM keeps `Biblioteca` and full `+ Criar` flow

---

## 🚧 In Progress

```txt
4.26.13 — Commit/documentation for ready sheet roll actions
```

---

## 🔜 Next Step

```txt
4.27 — Advanced system and character rules
```

Expected work:

- spellcasting rules by class
- filter spells by class
- validate cantrips/spells by class progression
- calculate spell DC and spell attack bonus
- display spell slots / spellcasting limits
- prepare level-up flow
- model progression by class and level
- prepare multiclass foundation for 4.28

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
- CharacterSheet domain exists and is connected to the builder and ready sheet
- Campaign actors and scene tokens are connected to the game table

More details:

- `docs/DATABASE_SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/DEV_STATE.md`

---

## 🎨 UI / UX

Current UI progress:

- ✅ Public home
- ✅ Login
- ✅ Register
- ✅ Logged-in campaign home
- ✅ Create campaign page
- ✅ Initial edit/finalize campaign page
- ✅ Search campaign page started
- ✅ Tabletop/session screen with functional tools
- ✅ Character builder modal with persisted flow
- ✅ Ready character sheet with tabs
- ✅ Compact Ficha/Status layout
- ✅ Rollable skills, saving throws, initiative, equipment and spells
- 🟡 Advanced spellcasting/level-up/multiclass rules coming next

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

## 📦 Feature Capsules

The project is documented through **Feature Capsules**, which record small validated steps.

Current capsules now include:

- Capsule 01 — Setup
- Capsule 02 — Backend Base
- Capsule 03 — Data & UI Design
- Capsule 04 — Database Design
- Capsule 05 — Figma UI
- Capsule 06 — RPG System
- Capsule 07 — Database Refinement
- Capsule 08 — Production Constraints
- Capsule 09 — Prisma Integration
- Capsule 10 — Better Auth
- Capsule 11 — API Integration
- Capsule 12 — Campaign Domain API
- Capsule 13 — Campaign Frontend Flow
- Capsule 14 — Campaign Search & Join Flow
- Capsule 15 — Game Page Foundation
- Capsule 16 — Campaign Actors
- Capsule 17 — Scene Tokens
- Capsule 18 — RPG System Seed Expansion
- Capsule 19 — CharacterSheet Backend
- Capsule 20 — Character Creation Menu
- Capsule 21 — Character Builder Layout
- Capsule 22 — Character Builder Draft
- Capsule 23 — Character Builder Options
- Capsule 24 — Character Builder Choices Persistence
- Capsule 25 — Character Builder Step Validation
- Capsule 26 — Character Builder Attributes
- Capsule 27 — Character Builder Skills
- Capsule 28 — Character Builder Spells
- Capsule 29 — Character Builder Equipment
- Capsule 30 — Character Builder About
- Capsule 31 — Character Builder Review & Stabilization
- Capsule 32 — Game Table Refactor Foundation
- Capsule 33 — Game Table Panels
- Capsule 34 — Game Table Canvas & Tools
- Capsule 35 — Game Table Regression & Cleanup
- Capsule 36 — Active Characters & Actor Lifecycle
- Capsule 37 — Ready Character Sheet
- Capsule 38 — Ready Sheet Roll Actions
- Capsule 39 — Player Character Creation Access

See:

```txt
docs/FEATURE_CAPSULE.md
```

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

When testing auth or database changes:

- restart the backend
- validate request in Scalar
- confirm persistence in Prisma Studio

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

Before deployment later:

- review `.gitignore`
- keep `node_modules`, `.next`, `dist`, `.turbo`, logs and local generated caches out of git/deploy packages
- keep `.env` private
- maintain `.env.example`

---

## 🤝 Contributing

This is currently a personal project focused on learning, architecture, and portfolio quality.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Raiel Godinho  
<https://github.com/raiellgod>

---

## 🔮 Vision

LegendForge aims to become:

- 🎲 A complete Virtual Tabletop
- 🧠 A strong full-stack portfolio project
- ⚙️ A modular RPG engine
- 🔐 A well-architected product
- 👥 A real multiplayer tabletop experience

Built step by step.  
Built to scale.  
Built like a real product.
