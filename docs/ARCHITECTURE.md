# 🏗️ ARCHITECTURE — LegendForge

---

## 🎯 Project Vision

**LegendForge** é um Virtual Tabletop (VTT) para RPG de mesa.

Inspirado em plataformas como Roll20 e Foundry Virtual Tabletop, com foco em:

- 🧩 ser agnóstico de sistema  
- 🎲 permitir campanhas personalizadas  
- 👥 servir como ferramenta prática para jogar com amigos  

Além disso, é um projeto voltado para:

- 💼 portfólio  
- 🧠 aprendizado contínuo  

---

## 🎯 Main Goals

### 1 — Criar uma mesa virtual funcional

- 💬 Chat  
- 🎲 Rolagem de dados  
- 🗺️ Campanhas  
- 📄 Fichas de personagem  
- 🧭 Mapas (futuro)  

---

### 2 — Construir um projeto forte de portfólio

- 🏗️ Arquitetura backend organizada  
- 🧹 Código limpo e modular  
- 📐 Boas práticas modernas  

---

### 3 — Evoluir como programador

- 📚 Aprender backend moderno  
- 🧠 Entender banco de dados  
- ⚙️ Trabalhar com sistemas reais  

---

## 💡 Development Philosophy

O projeto segue **desenvolvimento incremental**.

### Princípios

- ✔️ Pequenos passos diários  
- ✔️ Sempre ter algo funcionando  
- ✔️ Evoluir stack por stack  
- ✔️ Evitar complexidade prematura  
- ✔️ Aceitar refatorações  
- ✔️ Sem pressa  

> 🎯 O objetivo não é velocidade — é consistência.

---

## 📦 Repository Strategy

### Estrutura inicial

```
LegendForge/
├── backend/
├── frontend/
├── docs/
```

### Decisão

- 🔹 Backend e frontend separados  
- 🔹 Foco inicial no backend  
- 🔹 Redução de complexidade  

### Futuro

- 🔄 Possível migração para monorepo com pnpm  

---

## ⚙️ Tech Stack

### 🖥️ Backend

- Node.js  
- Fastify  
- TypeScript  
- Prisma  
- PostgreSQL  
- pnpm  

---

### 🎨 Frontend (planejado)

- React  
- Vite  
- Tailwind  
- TypeScript  

---

### 🛠️ Ferramentas

- VS Code  
- Git  

---

## 🏗️ Backend Architecture

### Estrutura planejada

```
src/
├── modules/
│   ├── user/
│   │   ├── user.routes.ts
│   │   ├── user.controller.ts
│   │   └── user.service.ts
│   │
│   ├── campaign/
│   │   ├── campaign.routes.ts
│   │   ├── campaign.controller.ts
│   │   └── campaign.service.ts
│
├── db/
│   └── prisma.ts
│
├── plugins/
│
└── server.ts
```

### Objetivos da arquitetura

- 🧩 Separar responsabilidades  
- 📦 Evitar arquivos grandes  
- 🔧 Facilitar manutenção  

---

## 🧩 Development Strategy

O projeto será desenvolvido utilizando **Feature Capsules**.

### Cada feature deve ser:

- pequena  
- independente  
- testável  
- funcional  

### Exemplos de cápsulas

1. Server Boot  
2. User System  
3. Campaign System  
4. Dice Roller  
5. Chat  

---

## 🗺️ Initial Roadmap

### Step 0
- Setup inicial  

### Step 1
- Setup backend  

### Step 2
- Banco de dados + User  

### Step 3
- Autenticação  

### Step 4
- Campanhas  

### Step 5
- Dice Roller  

### Step 6
- Chat  

### Step 7
- Fichas  

---

## ⚠️ Important

Este arquivo **NÃO representa o estado atual do projeto**.

Ele define:

- 🧠 visão  
- 🎯 direção  
- 🏗️ decisões arquiteturais  

---

## 📄 Referências

Para estado atual:

→ `DEV_STATE.md`  

Para entrada rápida:

→ `BOOT.md`  