# 🎲 LegendForge

![Status](https://img.shields.io/badge/status-core%20working-yellow)
![Backend](https://img.shields.io/badge/backend-fastify-blue)
![Frontend](https://img.shields.io/badge/frontend-react-purple)
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
- 🧠 Designed as a serious backend portfolio project

---

## 🎯 What Makes This Project Different

LegendForge is not just a VTT.

It demonstrates:

- 🏗️ Real backend architecture
- 🗄️ Production-oriented database modeling
- ⚙️ Business rules treated seriously
- 🧠 System design thinking
- 🎮 Flexible RPG engine foundation

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

### 🎨 Frontend

- React
- Vite
- Tailwind
- Figma

---

## 🧱 Project Structure

```txt
LegendForge/
├── src/
│   ├── generated/prisma/
│   ├── lib/
│   │   └── auth.ts
│   ├── routes/
│   └── index.ts
│
├── prisma/
│   └── schema.prisma
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── BOOT.md
│   ├── DATABASE_SETUP.md
│   ├── DEV_STATE.md
│   ├── FEATURE_CAPSULE.md
│   └── DEVELOPER_CONFIG-UTILIZE.txt
│
├── package.json
├── docker-compose.yml
└── tsconfig.json
```

---

## 📊 Current Status

> 🟡 Core system working — ready for domain expansion

### ✅ Completed

- Backend base (Fastify + TypeScript)
- ESLint + Prettier
- Zod validation
- Swagger docs
- Scalar interactive docs
- Prisma integration
- PostgreSQL connection
- Better Auth integration
- User registration and login flow
- Database persistence validated
- Initial RPG domain models:
  - GameSystem
  - Stat
  - Skill
- Figma with core UI flows

---

### 🚧 In Progress

- Expanding `schema.prisma`
- RPG domain implementation
- API routes for game systems
- Backend organization and modular growth

---

### 🔜 Next Steps

- Implement `GameSystem` CRUD
- Implement `Stat` CRUD
- Implement `Skill` CRUD
- Expand schema with:
  - Campaign
  - Participant
  - Character
- Add protected route `/me`
- Start campaign domain integration

---

## 🔐 Authentication

LegendForge uses **Better Auth** as the core authentication layer.

Current auth foundation includes:

- `user`
- `session`
- `account`
- `verification`

This means authentication is not a side feature — it is part of the system core.

---

## 🗄️ Database

The project follows a **DB-first mindset**.

Current state:

- Prisma is integrated
- PostgreSQL is connected
- Database sync is working
- Auth tables are operational
- RPG domain is being expanded incrementally

More details are documented in:

- `docs/DATABASE_SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/DEV_STATE.md`

---

## 🎨 UI / UX (Figma)

The project UI is being designed before full implementation.

Current UI progress:

- ✅ Create campaign flow
- 🟡 Search campaign flow
- 🟡 Tabletop / session screen
- 🟡 Auth screens refinement

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

See:

`docs/FEATURE_CAPSULE.md`

---

## 🚀 Getting Started

```bash
git clone https://github.com/raiellgod/LegendForge.git
cd LegendForge

pnpm install
pnpm dev
```

---

## 🧪 Local Development Notes

When changing the Prisma schema:

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma db push
```

When testing auth or database changes:

- restart the server
- validate the request in Scalar
- confirm persistence in Prisma Studio

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
https://github.com/raiellgod

---

## 🔮 Vision

LegendForge aims to become:

- 🎲 A complete Virtual Tabletop
- 🧠 A strong backend portfolio project
- ⚙️ A modular RPG engine
- 🔐 A well-architected full-stack product

---

Built step by step.  
Built to scale.  
Built like a real product.