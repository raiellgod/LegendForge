# 🧠 DATABASE SETUP — LegendForge

Este documento descreve:

- Estrutura do banco
- Regras de negócio
- Limitações do dbdiagram
- Regras aplicadas fora do dbdiagram
- Progresso da implementação com Prisma

---

# 📌 STATUS ATUAL

✔ Banco modelado no dbdiagram  
✔ Prisma integrado e funcionando  
✔ Better Auth integrado ao banco  
✔ Auth persistindo dados corretamente  
✔ Campanhas implementadas no Prisma  
✔ Participantes implementados no Prisma  
✔ Sessões de jogo implementadas no Prisma  
🔄 Expansão do domínio RPG em andamento  
❌ Regras SQL avançadas ainda não aplicadas  
❌ Triggers ainda não implementadas  

---

# 🗺️ BANCO DE DADOS — NÚCLEO ATUAL

## 🔐 Auth — Better Auth Core

```prisma
model User {
  id            String   @id
  name          String
  email         String   @unique
  emailVerified Boolean
  image         String?
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime
  updatedAt     DateTime

  sessions      Session[]
  accounts      Account[]
  campaigns     Campaign[]
  participants  Participant[]
}
```

Tabelas oficiais do Better Auth:

- `user`
- `session`
- `account`
- `verification`

---

## 🎲 Campanhas

```prisma
model Campaign {
  id          String   @id @default(uuid())
  name        String
  description String?
  coverImage  String?
  ownerId     String
  isPublic    Boolean  @default(false)
  isActive    Boolean  @default(true)
  inviteCode  String?  @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner        User          @relation(fields: [ownerId], references: [id])
  participants Participant[]
  sessions     GameSession[]
}
```

Responsabilidades:

- representar um mundo/campanha
- guardar owner
- permitir visibilidade pública/futura busca
- guardar imagem de capa
- receber participantes
- conectar sessões de jogo

---

## 👥 Participantes

```prisma
model Participant {
  id         String   @id @default(uuid())
  campaignId String
  userId     String
  role       ParticipantRole
  createdAt  DateTime @default(now())

  campaign Campaign @relation(fields: [campaignId], references: [id])
  user     User     @relation(fields: [userId], references: [id])
}
```

Status atual:

- criador da campanha entra como `GM`
- jogador que entra por convite será `PLAYER`
- permissões refinadas ainda serão evoluídas

---

## 🗓️ Sessões de jogo

```prisma
model GameSession {
  id          String   @id @default(uuid())
  campaignId  String
  scheduledAt DateTime
  createdAt   DateTime @default(now())

  campaign Campaign @relation(fields: [campaignId], references: [id])
}
```

Uso atual:

- `GET /campaigns` busca a próxima sessão futura
- frontend mostra `Not Scheduled` se não houver sessão marcada

---

## ⚙️ Sistema RPG inicial

- `GameSystem`
- `Stat`
- `Skill`

Esses modelos já existem como base para sistemas customizáveis.

---

# ⚠️ LIMITAÇÕES DO DBDIAGRAM

O dbdiagram não suporta diretamente:

## ❌ Regras avançadas

- CHECK constraints
- validações condicionais
- regras entre tabelas

## ❌ Triggers

- validação de consistência
- validação de domínio
- side effects controlados

## ❌ Índices parciais

- exemplo: apenas 1 GM principal por campanha

## ❌ Constraints complexas

- validações cruzadas entre entidades
- regras condicionais com múltiplos campos

---

# 🧠 REGRAS QUE DEVEM EXISTIR NO BANCO OU BACKEND

## Campanhas

- apenas owner pode deletar campanha
- apenas owner/GM pode alterar configurações críticas
- usuário deve ver campanhas onde é owner ou participant
- campanhas inativas não devem aparecer na home
- inviteCode deve ser único

## Participantes

- owner não pode ser removido da própria campanha
- usuário não deve entrar duas vezes na mesma campanha
- alteração de GM deve preservar consistência
- futuro: status `PENDING`, `APPROVED`, `REMOVED`

## Sistemas RPG

- stats devem pertencer ao mesmo sistema da skill
- níveis devem respeitar limites
- personagens devem respeitar raça/classe/sistema da campanha

---

# 🧱 ARQUITETURA DE RESPONSABILIDADE

| Camada     | Responsabilidade |
|------------|------------------|
| DB         | integridade estrutural |
| SQL RULES  | regras críticas complexas |
| Prisma     | acesso tipado |
| Backend    | lógica, permissões e validação |
| Frontend   | experiência e feedback visual |

---

# 🧪 PASSOS DE IMPLEMENTAÇÃO

## 🔹 Fase 1 — Setup Prisma

- [x] Criar `schema.prisma`
- [x] Validar schema
- [x] Gerar Prisma Client
- [x] Conectar com banco

## 🔹 Fase 2 — Auth

- [x] Better Auth integrado
- [x] User
- [x] Session
- [x] Account
- [x] Verification
- [x] Sessão via cookie validada

## 🔹 Fase 3 — Campanhas

- [x] Campaign
- [x] Participant
- [x] GameSession
- [x] POST `/campaigns`
- [x] GET `/campaigns`
- [x] GET `/campaigns/:id`
- [x] PATCH `/campaigns/:id`
- [x] DELETE `/campaigns/:id`
- [x] JOIN por invite code
- [ ] Busca pública de campanhas
- [ ] Refinar status de participante
- [ ] Persistir descrição/capa com validação final
- [ ] Storage real para capa

## 🔹 Fase 4 — Sistema RPG

- [x] GameSystem
- [x] Stat
- [x] Skill
- [ ] Classes
- [ ] Subclasses
- [ ] Features
- [ ] Characters

## 🔹 Fase 5 — Regras avançadas

- [ ] Aplicar regras SQL avançadas
- [ ] Implementar triggers quando necessário
- [ ] Índices específicos para performance e integridade

---

# 🧠 FILOSOFIA DO PROJETO

> Banco é a fundação do sistema.

Ordem correta:

1. Auth funcionando
2. Banco consistente
3. Backend confiável
4. Frontend conectado
5. Expansão controlada
6. Features avançadas

---

# 📍 PRÓXIMO PASSO

👉 Consolidar domínio de campanhas no backend:

- buscar campanhas públicas
- melhorar update de campanha
- preparar regras de participação
- definir como imagem de capa será armazenada em produção

---

# 📌 CHECKPOINT

✔ Auth funcionando  
✔ Prisma integrado  
✔ Banco funcional  
✔ Campanhas iniciadas  
✔ Fluxo real de criação de campanha funcionando  

👉 Próximo nível: busca/participação de campanhas e página de jogo
