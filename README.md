# ⚔️ LegendForge

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-0.1.0-purple)
![TypeScript](https://img.shields.io/badge/tech-TypeScript-3178c6)
![Node](https://img.shields.io/badge/runtime-Node.js-339933)

> 🎲 A modular Virtual Tabletop (VTT) focused on flexibility, learning, and real-world architecture.

---

## 🎬 Preview

```bash
⚔️ LegendForge started...

Player1 connected
Room created: #123
Player2 joined the room

💬 Chat initialized
🎲 Dice system ready

✅ Session ready
```

> ⚠️ Preview is simulated. Core features are under development.

---

## 🧠 Overview

**LegendForge** is a Virtual Tabletop (VTT) designed for tabletop RPG sessions.

Inspired by platforms like Roll20 and Foundry Virtual Tabletop,  
it aims to provide a flexible and modular environment for creating and running custom campaigns.

The system is:

- 🧩 system-agnostic
- 🎲 initially inspired by Dungeons & Dragons
- 🌌 focused on narrative-driven campaigns
- 👨‍💻 developed as a solo project

---

## 🎯 Project Goals

LegendForge is built around three main goals:

### 1 — Play RPG with friends

Provide a functional virtual tabletop with:

- chat system
- dice rolling
- character sheets
- campaigns
- maps

---

### 2 — Build a strong portfolio project

Demonstrate real-world skills in:

- backend architecture
- code organization
- database modeling
- full-stack development

---

### 3 — Evolve as a developer

This project is also a learning journey:

- continuous improvement
- safe experimentation
- natural refactoring

---

## 💡 Development Philosophy

LegendForge follows a core principle:

> **Incremental development**

This means:

- small steps
- testable features
- always something working

---

### 🧠 Principles

- 1️⃣ Evolve stack by stack
- 2️⃣ Always see something working
- 3️⃣ Build correct architecture from the start
- 4️⃣ Refactoring is allowed
- 5️⃣ No rush — long-term vision

---

## 🏗️ Architecture

The project is currently structured as:

```bash
LegendForge/
├── backend/
├── frontend/
├── docs/
```

---

### 📌 Strategy

- ❌ Not a monorepo (yet)
- ✅ Separate backend and frontend
- 🎯 Backend-first approach

Future possibility:

- migrate to monorepo using pnpm workspaces

---

## ⚙️ Tech Stack

### 🖥️ Backend

- Node.js
- Fastify
- TypeScript
- Prisma
- PostgreSQL
- pnpm

### 🎨 Frontend (planned)

- React
- Vite
- Tailwind
- TypeScript

> ⚠️ Frontend will start only after backend core is stable.

---

## 🏗️ Backend Architecture (Planned)

```bash
backend/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   └── user.service.ts
│   │   │
│   │   ├── campaign/
│   │       ├── campaign.routes.ts
│   │       ├── campaign.controller.ts
│   │       └── campaign.service.ts
│   │
│   ├── db/
│   │   └── prisma.ts
│   │
│   ├── plugins/
│   │
│   └── server.ts
│
├── prisma/
│   └── schema.prisma
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/raiellgod/LegendForge.git
cd LegendForge
pnpm install
pnpm dev
```

---

## 🧪 Current Status

> 🟡 Initial development stage

- ✔️ Repository initialized
- ⚙️ Backend setup in progress
- 🧠 Architecture defined

---

## 🗺️ Roadmap (Initial)

### Step 0 - Config Setup

### Step 1 — Backend Setup

- Fastify
- TypeScript
- Prisma
- PostgreSQL

**Goal:** working server with:

```json
{
  "message": "LegendForge API"
}
```

---

### Step 2 — Database

- Prisma connection
- User table

---

### Step 3 — Users

- Register
- Login
- Password hashing

---

### Step 4 — Campaigns

---

### Step 5 — Dice System

---

### Step 6 — Chat

---

### Step 7 — Character Sheets

---

## 🔄 Development Rules

- Build in small steps
- Avoid premature complexity
- Always keep the system runnable

---

## 🤝 Contributing

```bash
send e-mail for raiellgod@gmail.com
```

---

## 📄 License

MIT

---

## 👤 Author

**Raiel Godinho**  
https://github.com/raiellgod

---

## 🌌 Vision

LegendForge is not just a VTT.

It is a long-term project designed to become a flexible platform  
for building and experiencing tabletop RPG systems without limitations.

---

## ⭐ Final Note

This project is in its early stages,  
but it is being built with strong foundations and long-term vision.

Follow the journey.
