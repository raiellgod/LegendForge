# 🎲 LegendForge

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Backend](https://img.shields.io/badge/backend-fastify-blue)
![Frontend](https://img.shields.io/badge/frontend-react-purple)
![Database](https://img.shields.io/badge/database-postgresql-blue)
![ORM](https://img.shields.io/badge/orm-prisma-2D3748)
![License](https://img.shields.io/badge/license-MIT-green)

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

- 🏗️ Backend architecture realista
- 🗄️ Modelagem de banco nível produção
- ⚙️ Regras de negócio no banco
- 🧠 Pensamento de sistema
- 🎮 Engine de RPG flexível

---

## ⚙️ Tech Stack

### 🖥️ Backend

- Node.js
- Fastify
- TypeScript
- Prisma _(em integração)_
- PostgreSQL

### 🎨 Frontend

- React
- Vite
- Tailwind
- Figma

---

## 🧱 Project Structure

```
LegendForge/
├── backend/
│   ├── src/
│   ├── prisma/
│   └── package.json
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEV_STATE.md
│   ├── BOOT.md
│   ├── FEATURE_CAPSULE.md
│   └── DEVELOPER_CONFIG-UTILIZE.txt
```

---

## 📊 Current Status

> 🟡 Transition phase: Design → Implementation

### ✅ Completed

- Backend base (Fastify + TypeScript)
- ESLint + Prettier
- Zod validation
- Swagger docs
- Database modelado (nível produção)
- Sistema RPG definido
- Figma com fluxos principais

---

### 🚧 In Progress

- Prisma
- Migrations
- Endpoints
- Telas:
  - Criar campanha
  - Buscar campanha
  - Mesa

---

### 🔜 Next Steps

- Criar `schema.prisma`
- Rodar primeira migration
- Sistema de autenticação
- CRUD de campanhas
- Persistência real

---

## 🎨 UI / UX (Figma)

Fluxo definido antes da implementação:

- ✅ Criar campanha
- 🟡 Buscar campanhas
- 🟡 Mesa de jogo

---

## 🧠 Development Philosophy

- Incremental
- Sempre funcional
- Sem overengineering
- Evolução contínua

> “Build small. Scale right.”

---

## 📦 Feature Capsules

- Capsule 01 — Setup
- Capsule 02 — Backend Base
- Capsule 03 — Data & UI Design
- Capsule 04 — Database Design
- Capsule 05 — Figma UI
- Capsule 06 — RPG System
- Capsule 07 — Refinamento do banco
- Capsule 08 — Constraints produção
- Capsule 09 — Prisma _(atual)_

📄 docs/FEATURE_CAPSULE.md

---

## 🚀 Getting Started

```bash
git clone https://github.com/raiellgod/LegendForge.git
cd LegendForge

pnpm install
pnpm dev
```

---

## 🤝 Contributing

This is currently a personal project focused on learning and portfolio.

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

---

Built step by step.
Built to scale.
Built like a real product.
