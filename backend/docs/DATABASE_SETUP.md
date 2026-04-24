# 🧠 DATABASE SETUP — LegendForge

Este documento descreve:

- Estrutura do banco (dbdiagram)
- Regras de negócio do banco
- Limitações do dbdiagram
- Regras aplicadas fora do dbdiagram (SQL + Backend)
- Progresso da implementação com Prisma

---

# 📌 STATUS ATUAL

✔ Banco modelado no dbdiagram  
✔ Prisma integrado e funcionando  
✔ Better Auth integrado ao banco  
✔ Auth persistindo dados corretamente  
🔄 Expansão do domínio RPG em andamento  
❌ Regras SQL avançadas ainda não aplicadas  
❌ Triggers ainda não implementadas  

---

# 🗺️ BANCO DE DADOS (DBDIAGRAM)

```sql
//////////////////////////////////////////////////////
// AUTH (BETTER AUTH CORE)
//////////////////////////////////////////////////////

Table user {
  id string [pk]
  name string
  email string [unique]
  emailVerified boolean
  image string
  createdAt timestamp
  updatedAt timestamp
}

Table session {
  id string [pk]
  expiresAt timestamp
  token string [unique]
  createdAt timestamp
  updatedAt timestamp
  ipAddress string
  userAgent string
  userId string [ref: > user.id]
}

Table account {
  id string [pk]
  accountId string
  providerId string
  userId string [ref: > user.id]
  accessToken string
  refreshToken string
  idToken string
  accessTokenExpiresAt timestamp
  refreshTokenExpiresAt timestamp
  scope string
  password string
  createdAt timestamp
  updatedAt timestamp
}

Table verification {
  id string [pk]
  identifier string
  value string
  expiresAt timestamp
  createdAt timestamp
  updatedAt timestamp
}

//////////////////////////////////////////////////////
// SYSTEM
//////////////////////////////////////////////////////

Table game_systems {
  id uuid [pk]
  name varchar(100)
  slug varchar(100)
  version integer
  created_at timestamp
}

Table stats {
  id uuid [pk]
  system_id uuid [ref: > game_systems.id]
  name varchar(50)
}

Table skills {
  id uuid [pk]
  system_id uuid [ref: > game_systems.id]
  stat_id uuid [ref: > stats.id]
  name varchar(50)
}
```

---

# ⚠️ LIMITAÇÕES DO DBDIAGRAM

O dbdiagram não suporta:

## ❌ Regras avançadas
- CHECK constraints  
- validações condicionais  
- regras entre tabelas  

## ❌ Triggers
- validação de domínio (ex: subclasses)  
- validação de consistência de dados  

## ❌ Índices parciais
- ex: apenas 1 GM por campanha  

## ❌ Constraints complexas
- validações cruzadas entre tabelas  
- regras condicionais baseadas em múltiplos campos  

---

# 🧠 REGRAS IMPLEMENTADAS FORA DO DBDIAGRAM

Arquivo: `DATABASE_RULES.sql`

---

## ✔ Regras importantes

### 1. Consistência de sistema

```txt
stats.system_id deve corresponder ao sistema correto
skills devem respeitar stats do mesmo sistema
```

---

### 2. Limites numéricos

- stats entre 1 e 30  
- níveis entre 1 e 20  
- valores não negativos  

---

### 3. Integridade de dados

- relações sempre válidas  
- dados órfãos não devem existir  
- consistência entre entidades  

---

# ⚙️ REGRAS QUE FICAM NO BACKEND

## 🎯 Permissões

- controle de acesso por usuário  
- autorização de ações  
- proteção de rotas  

---

## 🎯 Fluxo

- impedir ações inválidas  
- validar entrada de dados  
- garantir consistência de gameplay  

---

## 🎯 IA

- recomendações válidas  
- filtragem por regras  
- sugestões inteligentes  

---

## 🎯 UX

- mensagens de erro  
- validação amigável  
- feedback visual  

---

# 🧱 ARQUITETURA DE RESPONSABILIDADE

| Camada     | Responsabilidade |
|------------|------------------|
| DB         | integridade estrutural |
| SQL RULES  | regras críticas |
| Prisma     | acesso tipado |
| Backend    | lógica |
| Frontend   | experiência |

---

# 🧪 PASSOS DE IMPLEMENTAÇÃO

## 🔹 Fase 1 — Setup Prisma
- [x] Criar `schema.prisma`
- [x] Validar schema
- [x] Gerar Prisma Client
- [x] Conectar com banco

---

## 🔹 Fase 2 — Banco
- [x] Criar estrutura inicial
- [ ] Aplicar regras SQL avançadas
- [ ] Implementar triggers

---

## 🔹 Fase 3 — Backend
- [x] Auth funcionando
- [ ] CRUD sistemas RPG
- [ ] Services
- [ ] Validação com Zod

---

## 🔹 Fase 4 — Sistema RPG
- [x] GameSystem
- [x] Stat
- [x] Skill
- [ ] Classes
- [ ] Characters
- [ ] Campaigns

---

## 🔹 Fase 5 — IA
- [ ] Sistema de recomendação
- [ ] Sugestão de builds
- [ ] Filtros inteligentes

---

# 🧠 FILOSOFIA DO PROJETO

> Banco é a fundação do sistema

Ordem correta:

1. Auth funcionando  
2. Banco consistente  
3. Backend confiável  
4. Expansão controlada  
5. Features avançadas  

---

# 📍 PRÓXIMO PASSO

👉 Expandir domínio RPG no Prisma sem quebrar o auth

---

# 📌 CHECKPOINT

✔ Auth funcionando  
✔ Prisma integrado  
✔ Banco funcional  
✔ Base pronta para escalar  

👉 Próximo nível: domínio RPG completo