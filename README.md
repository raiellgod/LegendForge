# 🎲 LegendForge

![Status](https://img.shields.io/badge/status-phase%204.6.6%20complete-green)
![Backend](https://img.shields.io/badge/backend-fastify-blue)
![Frontend](https://img.shields.io/badge/frontend-next.js-black)
![Database](https://img.shields.io/badge/database-postgresql-blue)
![ORM](https://img.shields.io/badge/orm-prisma-2D3748)
![Auth](https://img.shields.io/badge/auth-better--auth-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

> Atualizado para novo chat em 07/07/2026. Contexto consolidado após a sequência 4.6.6 — Idiomas por fonte.


> A modern Virtual Tabletop (VTT) built with production-minded full-stack architecture, persistent character creation, ready character sheets, pop-out gameplay support and evolving RPG rules.

---

## 🚀 About

**LegendForge** é um VTT web para RPG de mesa online, inspirado por Roll20/Foundry, mas desenvolvido com identidade própria.

O foco do projeto:

- campanhas reais;
- mesa jogável;
- personagens persistidos;
- ficha pronta para uso em sessão;
- pop-out de ficha;
- rolagens pela ficha;
- regras evolutivas de sistema;
- arquitetura full-stack real;
- desenvolvimento incremental e testável.

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
- Swagger / Scalar
- Docker
- pnpm

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth Client
- pnpm

---

## ✅ Current Status

### Completed core

- Auth with Better Auth.
- Campaigns.
- Participants.
- Campaign actors.
- Scene tokens.
- Character builder.
- Ready character sheet.
- Ready sheet pop-out.
- Sheet-based rolls.
- Spellcasting rules.
- Equipment attacks.
- Features display.
- Level Up preview.
- Multiclass foundation.
- Modular seed data.
- Equipment images.
- Character languages by source.

---

## 🧍 Character Builder

Current steps:

```txt
Concept
Class
Ancestry
Background
Attributes
Skills
Languages
Spells
Equipment
About
Review
```

The builder supports:

- persistent drafts;
- class/ancestry/background selection;
- standard array attributes;
- class skill choices;
- background skill suggestions;
- language choices;
- spell choices filtered by class/progression;
- starting equipment;
- about/profile fields;
- review and finalization.

---

## 🗣️ Languages by Source

Latest completed feature sequence:

```txt
[x] 4.6.6.1 — Schema/seed/API/types
[x] 4.6.6.2 — Backend persistence
[x] 4.6.6.3 — Builder step
[x] 4.6.6.4 — Finalization validation
[x] 4.6.6.5 — Ready sheet display
```

Implemented:

- `Language`;
- `CharacterSheetLanguage`;
- `Ancestry.languageKeys`;
- `Background.languageKeys`;
- `Background.languageChoiceCount`;
- backend POST/PATCH `languageKeys`;
- review display;
- ready sheet Profile display.

---

## 🧾 Ready Character Sheet

Available as:

```txt
1. Modal inside the table.
2. Pop-out window.
```

Tabs:

```txt
Ficha/Status
Combate
Bolsa
Magia
Features
Perfil
Notas
```

Supports:

- skills rolls;
- saving throws;
- initiative;
- equipment attack/damage;
- spell attack/damage;
- spell DC;
- spell slots;
- features;
- images;
- languages;
- level up preview.

---

## 🔜 Next Step

```txt
4.6.7 — Equipment proficiencies by source
```

Expected direction:

- use class weapon/protection/tool proficiencies as real rule data;
- calculate equipment attack proficiency correctly;
- show source of proficiency;
- prepare armor/protection rules.

---

## 🧭 Working Rules

Before commit:

```bash
git diff --stat
git status
```

Common validation:

```bash
cd backend
pnpm eslint

cd ../frontend
pnpm lint
```

Commit suggestion for latest sequence:

```bash
git add .
git commit -m "feat: add character language choices"
```

