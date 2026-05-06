# 🎲 LegendForge

![Status](https://img.shields.io/badge/status-campaign%20flow%20working-yellow)
![Backend](https://img.shields.io/badge/backend-fastify-blue)
![Frontend](https://img.shields.io/badge/frontend-next.js-black)
![Database](https://img.shields.io/badge/database-postgresql-blue)
![ORM](https://img.shields.io/badge/orm-prisma-2D3748)
![Auth](https://img.shields.io/badge/auth-better--auth-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

> A modern Virtual Tabletop (VTT) built with production-grade backend architecture,
> focusing on scalability, modularity, and real-world system design.

---

## 🚀 About the Project

**LegendForge** is a Virtual Tabletop designed to run tabletop RPG sessions online.

Inspired by tools like Roll20 and Foundry VTT — but with a different philosophy:

- 🧩 System-agnostic
- 🎲 Focused on custom campaigns
- 👥 Built for real gameplay with friends
- 🧠 Designed as a serious full-stack portfolio project
- ⚙️ Built incrementally with production mindset

---

## 🎯 What Makes This Project Different

LegendForge is not just a VTT.

It demonstrates:

- 🏗️ Real backend architecture
- 🗄️ Production-oriented database modeling
- ⚙️ Business rules treated seriously
- 🔐 Real authentication and persisted sessions
- 🧠 System design thinking
- 🎮 Flexible RPG engine foundation
- 🎨 UI built from a Figma-driven product flow

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
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
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

> 🟡 Auth + campaign creation flow working

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
- Initial RPG domain models:
  - GameSystem
  - Stat
  - Skill
- Campaign domain foundation:
  - Campaign
  - Participant
  - GameSession
- Campaign API routes:
  - create campaign
  - list user campaigns
  - get campaign by id
  - update campaign
  - delete campaign
  - join campaign
  - manage participants
- Frontend campaign flow:
  - `/campaigns`
  - `/campaigns/create`
  - `/campaigns/[id]/edit`

---

## 🚧 In Progress

- Campaign backend consolidation
- Public campaign search
- Join campaign flow refinement
- Campaign image cover workflow
- Campaign edit persistence
- Page/game room foundation

---

## 🔜 Next Steps

- Implement campaign search:
  - `GET /campaigns/public`
  - or `GET /campaigns/search`
- Improve `PATCH /campaigns/:id`
- Persist description and cover image more cleanly
- Replace temporary base64 cover flow with real storage later
- Create `/campaigns/search`
- Create `/campaigns/[id]/play`
- Expand schema with:
  - Character
  - Classes
  - Subclasses
  - Inventory
  - Logs

---

## 🔐 Authentication

LegendForge uses **Better Auth** as the core authentication layer.

Current auth foundation includes:

- `user`
- `session`
- `account`
- `verification`

Authentication is not a side feature — it is part of the system core.

Current flow:

1. User registers or logs in.
2. Better Auth persists session in PostgreSQL.
3. Browser stores the session cookie.
4. Frontend calls the API with `credentials: "include"`.
5. Backend reads session via `auth.api.getSession`.
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
- RPG domain is being expanded incrementally

More details are documented in:

- `docs/DATABASE_SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/DEV_STATE.md`

---

## 🎨 UI / UX

The project UI is designed in Figma and implemented incrementally.

Current UI progress:

- ✅ Public home
- ✅ Login
- ✅ Register
- ✅ Logged-in campaign home
- ✅ Create campaign page
- ✅ Initial edit/finalize campaign page
- 🟡 Search campaign page
- 🟡 Tabletop/session screen

---

## 🧠 Development Philosophy

- Incremental
- Always functional
- No unnecessary overengineering
- Continuous refinement
- Production mindset from the start

> “Build small. Scale right.”

---

## 📦 Feature Capsules

The project is documented through **Feature Capsules**, which record small validated steps.

Current capsules include:

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

---

## 🤝 Contributing

This is currently a personal project focused on learning, architecture, and portfolio quality.

Discussions, ideas, and feedback are welcome.

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

---

Built step by step.  
Built to scale.  
Built like a real product.
