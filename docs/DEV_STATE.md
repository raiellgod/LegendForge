# 📊 DEV STATE — LegendForge

---

## 📅 Last Update

31/03/2026

---

## 🧱 Project Structure

```
LegendForge/
├── .vscode/
│   └── settings.json
│
├── dist/
│   └── index.js
│
├── docs/
│   ├── DEV_STATE.md
│   ├── ARCHITECTURE.md
│   ├── BOOT.md
│   ├── FEATURE_CAPSULE.md
│   └── DEVELOPER_CONFIG-UTILIZE.txt
│
├── src/
│   └── index.ts
│
├── .env
├── .env_explicação
├── .gitignore
├── .npmrc
├── eslint.config.js
├── package.json
├── tsconfig.json
```

---

## ⚙️ Dependencies (Setup / Backend)

### 🧪 Development

- TypeScript — 5.9.3
- tsx — 4.21.0
- @types/node — 24.10.13

### 🧹 Lint & Format

- ESLint — 9.39.2
- eslint-config-prettier — 10.1.8
- eslint-plugin-simple-import-sort — 12.1.1
- Prettier — 3.8.1

---

## 🗄️ Database

- ✅ Modelagem praticamente finalizada
- ✅ Tabelas principais definidas:
  - users
  - campaigns
  - characters
  - items
  - abilities
- ⚠️ Ainda não implementado com Prisma

---

## 🧩 Database Models

- ✔️ Estrutura completa pensada
- ✔️ Suporte a:
  - múltiplos sistemas
  - classes e subclasses
  - inventário
  - habilidades
- ⚠️ Falta tradução para Prisma schema

---

## 🌐 API Endpoints

- ❌ Nenhum endpoint definido

---

## 🎨 Frontend / Figma

- ✅ Tela de criação de partida pronta
- 🟡 Tela de buscar partidas em andamento
- 🟡 Tela inicial da mesa iniciada

---

## 🧠 Sistema RPG

- ✅ Classes definidas
- ✅ Subclasses definidas
- ✅ Sistema de progressão criado
- ✅ Talentos implementados
- 🟡 Balanceamento em evolução

---


## ✅ Implemented Features

- ⚡ Fastify API inicial configurada
- 🧱 Base do backend pronta
- 🛠️ Ambiente de desenvolvimento funcional

---

## 🎯 Current Focus

TRANSIÇÃO PARA IMPLEMENTAÇÃO:

### Backend
- Prisma
- Models reais
- Primeiros endpoints

### Frontend
- Fluxo jogável mínimo

---

## 🚀 Next Steps

- [ ] Prisma setup
- [ ] Primeira migration
- [ ] CRUD de usuário
- [ ] Login funcional
- [ ] Criar campanha via API

---

## 🧠 Architecture Notes

- Sistema está ficando grande → manter modularização
- Evitar overengineering
- Focar no MVP jogável