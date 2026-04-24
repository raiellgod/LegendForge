# 🏗️ ARCHITECTURE — LegendForge

---

## 🎯 Project Vision

**LegendForge** é um Virtual Tabletop (VTT) moderno para RPG de mesa.

Inspirado em plataformas como Roll20 e Foundry VTT, mas com foco em:

- 🧩 Sistema agnóstico (multi-RPG)  
- 🎲 Campanhas customizáveis  
- 👥 Experiência real de jogo entre usuários  

Além disso, o projeto é:

- 💼 Portfólio técnico avançado  
- 🧠 Plataforma de aprendizado contínuo  
- ⚙️ Sistema real com mentalidade de produção  

---

## 🎯 Main Goals

### 1 — Base funcional de VTT

- 🔐 Sistema de autenticação (✔ funcionando)  
- 🧑‍🤝‍🧑 Gestão de usuários  
- 🗺️ Base para campanhas *(em desenvolvimento)*  
- 📄 Base para personagens *(em desenvolvimento)*  

---

### 2 — Backend profissional

- 🏗️ Arquitetura escalável  
- 🔒 Integridade de dados forte  
- 📐 Separação clara de responsabilidades  
- ⚡ Estrutura pronta para crescimento  

---

### 3 — Evolução técnica

- 📚 Backend moderno (Fastify + Prisma)  
- 🧠 Modelagem de banco robusta  
- ⚙️ Integração entre camadas  
- 🧩 Construção incremental de sistema complexo  

---

## 💡 Development Philosophy

> Desenvolvimento incremental com mentalidade de produção

### Princípios

- ✔️ Pequenos passos funcionais  
- ✔️ Refatoração contínua  
- ✔️ Backend como fonte da verdade  
- ✔️ Simplicidade primeiro, escala depois  
- ✔️ Código serve ao domínio  

---

## 📦 Repository Structure

```txt
LegendForge/
├── prisma/
├── src/
├── docs/
├── docker-compose.yml
```

---

### 🔹 Detalhamento

#### prisma/

- `schema.prisma` → definição do banco  
- Prisma controla a estrutura real do banco  

---

#### src/

```txt
src/
├── generated/
│   └── prisma/ → Prisma Client gerado
│
├── lib/
│   └── auth.ts → configuração do Better Auth
│
├── routes/
│   └── (rotas HTTP)
│
├── index.ts → entrypoint do servidor
```

---

#### docs/

- Documentação do sistema  
- Arquitetura  
- Banco de dados  
- Estado do projeto  

---

## ⚙️ Tech Stack

### 🖥️ Backend

- Node.js  
- Fastify  
- TypeScript  
- Prisma ORM  
- PostgreSQL  
- Better Auth  
- Zod  
- pnpm  

---

### 🎨 Frontend (futuro)

- React  
- Vite  
- Tailwind  
- TypeScript  
- Figma  

---

## 🏗️ Backend Architecture

### 🔹 Camadas do sistema

---

### 1. Banco de Dados (PostgreSQL)

Responsável por:

- Persistência  
- Integridade  
- Relacionamentos  

---

### 2. Prisma (ORM)

Responsável por:

- Tipagem forte  
- Queries seguras  
- Mapeamento do banco  

---

### 3. Autenticação (Better Auth)

Responsável por:

- Registro  
- Login  
- Sessões  
- Tokens  

### ⚠️ Decisão crítica

> Better Auth é o **núcleo de identidade do sistema**

Isso significa:

- tabelas oficiais:
  - `user`
  - `session`
  - `account`
  - `verification`
- NÃO recriamos sistema de auth
- TODO o sistema usa `user.id` como base

---

### 4. Backend (Fastify)

Responsável por:

- Rotas HTTP  
- Orquestração  
- Integração com Auth  
- Validação com Zod  

---

## 🔐 Sistema de Autenticação

### ✔️ Implementado

- Better Auth  
- Prisma Adapter  
- Sessões persistentes  
- Integração com banco  

---

### 🔄 Fluxo

1. Usuário se registra  
2. Usuário é salvo na tabela `user`  
3. Sessão é criada (`session`)  
4. Token é retornado  
5. Backend usa o usuário autenticado  

---

## 🧩 Modelagem Atual

### ✔️ Núcleo implementado

- User (Better Auth)  
- Session  
- Account  
- Verification  

---

### 🟡 Domínio RPG (parcial)

- GameSystem  
- Stats  
- Skills  

---

### 🔜 Domínio planejado

- Campaign  
- Character  
- Classes / Subclasses  
- Inventory  
- Logs  

---

## ⚙️ Decisões Arquiteturais

---

### 🔹 DB-first mindset

> Banco é a fonte de verdade

---

### 🔹 Auth como módulo externo confiável

- Better Auth controla identidade  
- Backend consome  
- Sistema não reimplementa segurança  

---

### 🔹 Prisma como camada oficial

- acesso ao banco  
- tipagem  
- segurança  

---

### 🔹 Separação de responsabilidades

| Camada     | Responsabilidade |
|------------|------------------|
| DB         | dados |
| Prisma     | acesso |
| Auth       | identidade |
| Backend    | lógica |
| Frontend   | UX |

---

## 🧩 Development Strategy

> Feature-driven incremental development

Cada passo:

- pequeno  
- testável  
- funcional  

---

## 🗺️ Roadmap Atual

---

### ✔ Concluído

- Setup backend  
- Prisma configurado  
- Banco sincronizado  
- Better Auth funcionando  
- Integração com Fastify  

---

### 🚧 Em andamento

- Expansão do domínio RPG  
- Organização das rotas  
- Estruturação do backend  

---

### 🔜 Próximos passos

- CRUD de campanhas  
- Sistema de personagens  
- Inventário  
- Permissões (GM / Player)  
- Logs de campanha  

---

## ⚠️ Pontos de Atenção

---

### 📊 Estrutura ainda inicial

- rotas ainda simples  
- sem camada de service completa  

---

### 🧠 Crescimento do domínio

- regras complexas ainda não implementadas  
- triggers e constraints ainda pendentes  

---

## 🔄 Current Phase

> **CORE AUTH + DATABASE STABLE — DOMAIN EXPANSION PHASE**

---

### Estado atual

- Auth: ✔ funcionando  
- Banco: ✔ integrado  
- Prisma: ✔ operacional  
- Backend: ✔ ativo  
- Domínio RPG: 🚧 em expansão  

---

## 🎯 Direção Atual

Foco em:

- expandir domínio do sistema  
- estruturar backend  
- implementar primeiras features reais  

---

## 🧠 Regra Fundamental

> Se uma regra é crítica  
> → ela deve existir no banco ou no backend  

---

## 📄 Referências

- DATABASE_SETUP.md  
- DEV_STATE.md  
- FEATURE_CAPSULE.md  

---

## 🏆 Estado da Arquitetura

✔ Funcional  
✔ Base sólida  
✔ Auth resolvido  
✔ Pronta para escalar  

---

## 🚀 Status

**CORE BACKEND READY — DOMAIN EXPANSION STARTED**