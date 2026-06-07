# 🎲 LegendForge

![Status](https://img.shields.io/badge/status-multiclass%20foundation-green)
![Backend](https://img.shields.io/badge/backend-fastify-blue)
![Frontend](https://img.shields.io/badge/frontend-next.js-black)
![Database](https://img.shields.io/badge/database-postgresql-blue)
![ORM](https://img.shields.io/badge/orm-prisma-2D3748)
![Auth](https://img.shields.io/badge/auth-better--auth-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

> A modern Virtual Tabletop (VTT) built with a production-minded full-stack architecture, focused on real campaign play, persisted character creation, and an evolving ready character sheet connected to the table.

---

## 🚀 About the Project

**LegendForge** is a Virtual Tabletop designed to run tabletop RPG sessions online.

Inspired by tools like Roll20 and Foundry VTT, but with its own philosophy:

- 🧩 System-agnostic foundation
- 🎲 Custom campaigns and real table flow
- 👥 Built for real gameplay with friends
- 🧠 Designed as a serious full-stack portfolio project
- ⚙️ Built incrementally with small, testable steps
- 📄 Persisted character creation and ready sheet
- 🗺️ Table tools built toward a playable VTT experience
- 🧍 Ready character sheet available both as a modal and a pop-out window
- 🎲 Sheet-based roll actions connected to the table chat
- ✨ Spellcasting progression connected to class rules
- ⚔️ Real equipment attacks in the ready sheet
- 🧩 Real feature display by class, subclass and ancestry
- ⬆️ Level Up preview prepared for class-level selection and future multiclass

---

## 🎯 What Makes This Project Different

LegendForge demonstrates:

- 🏗️ Real backend architecture
- 🗄️ Production-oriented database modeling
- ⚙️ Business rules treated seriously
- 🔐 Real authentication and persisted sessions
- 🧠 System design thinking
- 🎮 Flexible RPG engine foundation
- 🎨 Product-driven UI flow
- 🧍 Character builder connected to real domain data
- 🧾 Ready character sheet with reusable view architecture
- 🪟 Character sheet pop-out linked to the table
- 🎲 Table roll actions from skills, saving throws, initiative, equipment and spells
- 🪄 Spellcasting progression by class, spell filtering, spell limits, spell DC, spell attack and spell slots
- ⚔️ Equipment attacks calculated from item data and character stats
- ✨ Ready sheet features connected to backend rules
- ⬆️ Level Up preview designed to separate total character level from class levels
- 🧩 Incremental VTT features with persistence where it matters

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
│   │   ├── migrations/
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
│   │   │   │       ├── play/page.tsx
│   │   │   │       └── sheets/[sheetId]/page.tsx
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

> 🟢 Multiclass foundation completed and tested at visual/data-structure level.  
> 🟡 Next focus: update documentation and commit 4.30.

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
- Character sheet pop-out page:
  - `/campaigns/[id]/sheets/[sheetId]`
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
  - LevelProgression
  - ClassSpell
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
  - reusable `CharacterReadySheetView`
  - modal shell through `CharacterReadySheetModal`
  - pop-out route with real sheet data
  - top compact fixed sheet summary
  - tabs in order: Ficha/Status, Combate, Bolsa, Magia, Features, Perfil, Notas
  - Ficha/Status organized for fast reading
  - Bolsa with compact expandable cards
  - Magia with compact expandable cards grouped by Truques and Magias by level
  - Perfil focused on image/token/profile fields
  - Notas separated from Perfil
  - portrait/token URL editing and persistence
  - `<Image />` used for sheet image previews with `unoptimized`
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
  - skill → `1d20 + skill bonus`
  - saving throw → `1d20 + saving throw bonus`
  - initiative → `1d20 + initiative bonus`
  - GM table initiative ranking
  - player characters use real initiative bonus
  - NPCs/creatures use `+0` until their own sheets exist
  - equipment attack with real calculated bonus
  - equipment damage button
  - spell attack with real spell attack bonus for spellcasting classes
  - spell damage detection from description
  - spell attack disabled when class has no spellcasting ability
  - pop-out sheet sends rolls back to the table by `postMessage`
- Advanced spellcasting rules:
  - class spellcasting ability
  - class level progression
  - class-spell access table
  - spells filtered by selected class
  - cantrip/spell limits by class progression
  - spell save DC calculation
  - spell attack bonus calculation
  - spell slot display in ready sheet
  - expanded minimum spell seed for testing
- Advanced equipment/features/Level Up rules:
  - structured equipment attack fields
  - offensive equipment seed updated
  - real equipment attack bonus in ready sheet
  - GM-only manual target AC reference
  - real features displayed in Features tab
  - subclass selection level configured by class
  - Level Up preview modal inside ready sheet/pop-out
- Player creation access:
  - player common user sees `+ Personagem`
  - player opens character builder directly
  - GM keeps `Biblioteca` and full `+ Criar` flow

---

## 🚧 In Progress

```txt
4.30.13 — Atualizar documentação
4.30.14 — Commit da 4.30
```

---

## 🔜 Next Step

```txt
4.30.13 — Atualizar documentação
4.30.14 — Commit da 4.30
```

Then:

```txt
4.31 — Modularização e expansão do conteúdo base do sistema
```

Expected commit command:

```bash
git status
git diff --stat
cd frontend
pnpm lint
cd ..
git add .
git status
git commit -m "feat: refactor ready sheet popout"
```

---

# 🧩 Atualização — Fase 4.30 Multiclasse

## ✅ Implementado na 4.30

- `CharacterSheetClass` criado para separar nível total do personagem dos níveis por classe.
- Fichas novas sincronizam classe principal em `CharacterSheetClass`.
- Backfill manual executado para fichas antigas que já tinham `classId`.
- Backend carrega `characterSheet.classes[]` junto da ficha pronta.
- Frontend recebeu tipos para múltiplas classes na ficha pronta.
- Aba Features mostra classes da ficha com nível individual e classe principal.
- Proficiência continua usando o nível total do personagem (`CharacterSheet.level`).
- Features de classe/subclasse passam a considerar o nível individual de cada classe em `CharacterSheetClass`.
- Magia/progressão usa uma classe conjuradora ativa baseada em `characterSheet.classes`.
- CD de magia e ataque mágico continuam usando proficiência pelo nível total.
- Modal Level Up permite escolher visualmente qual classe existente receberia o próximo nível.
- Opção futura “Adicionar nova classe” aparece preparada, mas ainda desabilitada.
- Modal Level Up mostra status de subclasse por classe escolhida.
- 4.30.12 — Teste regressivo da multiclasse concluído no nível atual.

## ⚠️ Limitações intencionais da 4.30

- Level Up ainda não salva alterações.
- Ainda não existe PATCH real para subir nível total + nível de classe.
- Adicionar uma nova classe de multiclasse ainda não está liberado.
- Escolha real de subclasse no Level Up ainda não salva.
- Slots combinados de magia multiclasse ainda não foram implementados.
- Controle de slots usados ainda não existe.
- A estrutura antiga `CharacterSheet.classId/subclassId/level` foi mantida por compatibilidade durante a transição.

## 🎯 Próximo foco

```txt
4.30.13 — Atualizar documentação
4.30.14 — Commit da 4.30
4.31 — Modularização e expansão do conteúdo base do sistema
```


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
- Database migrations are being used for schema evolution
- Auth tables are operational
- Campaign tables are operational
- RPG domain is expanding incrementally
- CharacterSheet domain exists and is connected to the builder, ready sheet modal and ready sheet pop-out
- Campaign actors and scene tokens are connected to the game table
- `LevelProgression` stores class progression by level
- `ClassSpell` stores which spells each class can learn/use and from which class level

More details:

- `backend/docs/DATABASE_SETUP.md`
- `backend/docs/ARCHITECTURE.md`
- `backend/docs/DEV_STATE.md`

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
- ✅ Ready character sheet modal
- ✅ Ready character sheet pop-out
- ✅ Compact fixed sheet top
- ✅ Ficha/Status, Combate, Bolsa, Magia, Features, Perfil and Notas tabs
- ✅ Compact expandable cards in Magia and Bolsa
- ✅ Rollable skills, saving throws, initiative, equipment and spells
- ✅ Magic tab with real spellcasting summary and slots
- ✅ Image/token URL persistence
- 🟡 Chat panel needs UX/UI cleanup after pop-out integration

---

## 🧪 Useful Commands

### Backend

```bash
cd backend
docker compose up -d
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm run dev
```

### Prisma Studio

```bash
cd backend
pnpm prisma studio
```

### Seed

```bash
cd backend
pnpm prisma db seed
```

Fallback when seed command is not configured:

```bash
cd backend
pnpm tsx prisma/seed.ts
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Lint

```bash
cd frontend
pnpm lint
```

### Clear Next cache

```bash
cd frontend
rm -rf .next
pnpm run dev
```

### Before commits

```bash
git status
git diff --stat
```

Before deployment later:

- review `.gitignore`
- keep `node_modules`, `.next`, `dist`, `.turbo`, logs and local generated caches out of git/deploy packages
