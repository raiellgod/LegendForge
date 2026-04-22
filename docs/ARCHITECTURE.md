# 🏗️ ARCHITECTURE — LegendForge

---

## 🎯 Project Vision

**LegendForge** é um Virtual Tabletop (VTT) moderno para RPG de mesa.

Inspirado em plataformas como Roll20 e Foundry Virtual Tabletop, mas com uma abordagem diferente:

- 🧩 Sistema agnóstico (multi-RPG)  
- 🎲 Campanhas altamente customizáveis  
- 👥 Foco em gameplay real entre jogadores  

Além disso, o projeto é construído como:

- 💼 Portfólio técnico de alto nível  
- 🧠 Plataforma de aprendizado contínuo  
- ⚙️ Sistema real com preocupação de produção  

---

## 🎯 Main Goals

### 1 — VTT Funcional

- 💬 Chat em tempo real  
- 🎲 Sistema de rolagem de dados  
- 🗺️ Gerenciamento de campanhas  
- 📄 Fichas de personagem dinâmicas  
- 🧭 Mapas interativos *(em evolução)*  

---

### 2 — Backend de Nível Profissional

- 🏗️ Arquitetura modular e escalável  
- 🔒 Integridade forte de dados (DB-first mindset)  
- 📐 Separação clara de responsabilidades  
- ⚡ Preparado para crescimento real  

---

### 3 — Evolução Técnica

- 📚 Domínio de backend moderno  
- 🧠 Modelagem avançada de banco de dados  
- ⚙️ Construção de sistemas complexos  
- 🧩 Integração entre camadas (DB + API + UI)  

---

## 💡 Development Philosophy

O projeto segue **desenvolvimento incremental com mentalidade de produção**.

### Princípios

- ✔️ Pequenos passos, sempre funcionais  
- ✔️ Refatorar faz parte do processo  
- ✔️ Backend como fonte da verdade  
- ✔️ Evitar complexidade prematura, mas não ignorar escala  
- ✔️ Código serve ao domínio, não o contrário  

> 🎯 Consistência > velocidade

---

## 📦 Repository Strategy

### Estrutura atual

LegendForge/
├── backend/
├── frontend/
├── docs/


### Decisões

- 🔹 Separação clara entre backend e frontend  
- 🔹 Backend desenvolvido primeiro (core do sistema)  
- 🔹 Documentação como parte do produto  

### Futuro

- 🔄 Possível monorepo (pnpm workspaces)  
- 🔄 Shared types entre backend e frontend  

---

## ⚙️ Tech Stack

### 🖥️ Backend

- Node.js  
- Fastify  
- TypeScript  
- Prisma (ORM)  
- PostgreSQL (fonte de verdade)  
- pnpm  

---

### 🎨 Frontend (em progresso)

- React  
- Vite  
- Tailwind  
- TypeScript  
- Figma → UI já estruturada até fluxo de criação de partida  

---

## 🏗️ Backend Architecture

### Estrutura base

src/
├── modules/
│ ├── user/
│ ├── campaign/
│ ├── character/
│ ├── system/
│
├── db/
│ ├── prisma.ts
│ └── migrations/
│
├── plugins/
├── utils/
└── server.ts


---

## 🧠 Camadas do Sistema

### 1. Banco de Dados (PostgreSQL)

Responsável por:

- Integridade de dados  
- Constraints críticas  
- Regras de negócio essenciais  
- Performance  

> Exemplo:
> - Limite de atributos (1–30)
> - Nível máximo (1–20)
> - Integridade de subclasses
> - Ownership de features

---

### 2. Prisma (ORM)

Responsável por:

- Tipagem forte  
- Produtividade  
- Relacionamentos  
- Queries seguras  

> ⚠️ Prisma NÃO substitui regras críticas do banco

---

### 3. Backend (Fastify)

Responsável por:

- Regras de negócio  
- Validação (Zod)  
- Orquestração  
- Segurança  

---

### 4. Frontend

Responsável por:

- Experiência do usuário  
- Interação  
- Consumo da API  

---

## 🧩 Modelagem do Domínio

O sistema foi projetado para suportar:

- 🎭 Multiclasse real (ex: Guerreiro 3 / Mago 2)  
- 🧬 Sistema de atributos dinâmico  
- 🎲 Sistemas diferentes (D&D, custom, etc)  
- ⚔️ Itens instanciáveis por personagem  
- 📜 Logs de campanha escaláveis  

---

## ⚙️ Decisões Arquiteturais Críticas

### 🔹 Features unificadas

Uma única tabela para:

- Raças  
- Classes  
- Subclasses  

✔ Simplifica queries  
⚠ Exige validação forte no banco  

---

### 🔹 Inventário por instância

- `items` → modelo global  
- `character_inventory` → instância  

✔ Permite customização sem quebrar o sistema  

---

### 🔹 Banco como autoridade

Regras críticas estão no banco:

- CHECK constraints  
- Triggers  
- Integridade relacional  

---

## 🧩 Development Strategy

Uso de **Feature Capsules**:

Cada feature é:

- pequena  
- isolada  
- testável  
- incremental  

---

## 🗺️ Roadmap Atualizado

### ✔ Concluído

- Setup backend  
- Modelagem do banco (nível produção)  
- Estrutura base do projeto  
- UI no Figma (até criação de partida)  

---

### 🚧 Em andamento

- Integração Prisma  
- Migrations reais  
- Ajustes de constraints e triggers  

---

### 🔜 Próximos passos

- Sistema de autenticação  
- CRUD de campanhas  
- Criação de personagens  
- Sistema de inventário  
- Logs em tempo real  

---

## ⚠️ Pontos de Atenção

### 📊 Escalabilidade

- Logs crescerão rapidamente  
- Futuro: partitioning / otimização  

---

### 🧠 Versionamento

Ainda básico.

Futuro:
- versionamento real de sistema (RPG rules)

---

### ⚙️ Regras complexas

Algumas regras exigem:

- triggers no banco  
- validação no backend  

---

## 🔄 Current Phase

O projeto está em **transição de arquitetura para implementação real**.

### Estado atual

- Banco: quase 100% (nível produção)  
- Prisma: em implementação  
- Figma: fluxo principal definido  
- Backend: base pronta  

---

## 🎯 Direção Atual

Foco em:

- transformar modelagem → código  
- integrar backend + banco  
- validar regras reais  

---

## 🧠 Regra Fundamental

> Se uma regra pode quebrar o sistema  
> → ela deve existir no banco

---

## 📄 Referências

- `DEV_STATE.md` → estado atual  
- `BOOT.md` → entrada rápida  
- `DATABASE.md` *(futuro recomendado)* → detalhamento do banco  

---

## 🏆 Estado da Arquitetura

✔ Modular  
✔ Escalável  
✔ Consistente  
✔ Preparada para produção  

---

**Status: IMPLEMENTATION PHASE (PRODUCTION-READY FOUNDATION)**