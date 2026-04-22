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
✔ Regras avançadas criadas em DATABASE_RULES.sql  
🔄 Conversão para Prisma em andamento  
❌ Migrações ainda não executadas  
❌ Backend ainda não integrado completamente  

---

# 🗺️ BANCO DE DADOS (DBDIAGRAM)

```sql
//////////////////////////////////////////////////////
// ENUMS
//////////////////////////////////////////////////////

Enum user_status { ACTIVE BANNED INACTIVE }
Enum participant_role { PLAYER GM }
Enum participant_status { PENDING APPROVED REJECTED REMOVED }
Enum source_origin { OFFICIAL USER AI }
Enum log_type { CHAT SYSTEM ROLL COMBAT }
Enum invite_status { PENDING ACCEPTED EXPIRED REVOKED }

//////////////////////////////////////////////////////
// USERS
//////////////////////////////////////////////////////

Table users {
  id uuid [pk]
  username varchar(30) [not null, unique]
  email varchar(255) [not null, unique]
  password_hash text [not null]
  avatar_url text
  email_verified boolean [default: false]
  terms_accepted_at timestamp
  status user_status [default: 'ACTIVE']
  last_login timestamp
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

Table user_sessions {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  refresh_token text
  ip_address varchar(45)
  user_agent text
  is_revoked boolean
  expires_at timestamp
  created_at timestamp
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

//////////////////////////////////////////////////////
// RACES / CLASSES
//////////////////////////////////////////////////////

Table races {
  id uuid [pk]
  system_id uuid [ref: > game_systems.id]
  name varchar(100)
}

Table classes {
  id uuid [pk]
  system_id uuid [ref: > game_systems.id]
  name varchar(100)
  hit_die integer
}

Table subclasses {
  id uuid [pk]
  class_id uuid [ref: > classes.id]
  name varchar(100)
  unlock_level integer
}

//////////////////////////////////////////////////////
// FEATURES
//////////////////////////////////////////////////////

Table features {
  id uuid [pk]
  system_id uuid [ref: > game_systems.id]
  class_id uuid
  subclass_id uuid
  race_id uuid
  name varchar(100)
  required_level integer
}

//////////////////////////////////////////////////////
// CAMPAIGNS
//////////////////////////////////////////////////////

Table campaigns {
  id uuid [pk]
  owner_id uuid [ref: > users.id]
  system_id uuid [ref: > game_systems.id]
  name varchar(100)
  invite_code varchar(20)
  is_public boolean
  is_active boolean
}

Table participants {
  id uuid [pk]
  campaign_id uuid [ref: > campaigns.id]
  user_id uuid [ref: > users.id]
  role participant_role
}

//////////////////////////////////////////////////////
// CHARACTERS
//////////////////////////////////////////////////////

Table characters {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  campaign_id uuid [ref: > campaigns.id]
  race_id uuid [ref: > races.id]
  name varchar(100)
  level integer
  hp_current integer
  hp_max integer
}

Table character_classes {
  id uuid [pk]
  character_id uuid [ref: > characters.id]
  class_id uuid [ref: > classes.id]
  subclass_id uuid
  class_level integer
}

Table character_stats {
  character_id uuid [ref: > characters.id]
  stat_id uuid [ref: > stats.id]
  value integer
}

//////////////////////////////////////////////////////
// ITEMS
//////////////////////////////////////////////////////

Table items {
  id uuid [pk]
  system_id uuid [ref: > game_systems.id]
  name varchar(100)
  weight decimal
  source source_origin
}

Table character_inventory {
  id uuid [pk]
  character_id uuid [ref: > characters.id]
  item_id uuid [ref: > items.id]
  quantity integer
}

//////////////////////////////////////////////////////
// LOGS
//////////////////////////////////////////////////////

Table campaign_logs {
  id uuid [pk]
  campaign_id uuid [ref: > campaigns.id]
  user_id uuid [ref: > users.id]
  type log_type
  content text
}

---

# ⚠️ LIMITAÇÕES DO DBDIAGRAM

O dbdiagram **não suporta**:

## ❌ Regras avançadas
- CHECK constraints
- validações condicionais
- regras entre tabelas

## ❌ Triggers
- validação de subclasse ↔ classe
- validação de soma de níveis
- validação de coerência entre sistemas

## ❌ Índices parciais
- ex: apenas 1 GM por campanha

## ❌ Constraints complexas
- garantir que uma feature tenha exatamente 1 owner válido
- garantir que a subclasse pertença à classe correta
- garantir que a soma das classes bata com o nível total do personagem

---

# 🧠 REGRAS IMPLEMENTADAS FORA DO DBDIAGRAM

Arquivo: `DATABASE_RULES.sql`

## ✔ Regras importantes

### 1. Apenas 1 GM por campanha

```sql
CREATE UNIQUE INDEX uq_one_gm_per_campaign
ON participants (campaign_id)
WHERE role = 'GM' AND removed_at IS NULL;
```

### 2. Subclasse pertence à classe

Isso é validado com **trigger** no PostgreSQL.

Regra de negócio:

```txt
subclasses.class_id precisa ser igual ao class_id usado em character_classes
```

Ou seja:

- se o personagem escolher `class_id = mage`
- a `subclass_id` precisa pertencer à classe `mage`

---

### 3. Feature só pode ter 1 origem válida

A tabela `features` foi modelada para permitir associação com:

- classe
- subclasse
- raça

Mas a regra correta é:

```txt
exatamente 1 entre class_id, subclass_id ou race_id deve estar preenchido
```

Não pode:
- deixar os 3 nulos
- preencher 2 ou 3 ao mesmo tempo

Isso será resolvido com `CHECK constraint` no PostgreSQL.

---

### 4. Soma dos níveis das classes deve bater com o nível total do personagem

Regra:

```txt
sum(character_classes.class_level) == characters.level
```

Exemplo válido:
- Guerreiro 3
- Mago 2
- `characters.level = 5`

Exemplo inválido:
- Guerreiro 3
- Mago 2
- `characters.level = 4`

Essa regra exige trigger ou validação forte no banco.

---

### 5. Skills e Stats devem pertencer ao mesmo sistema

Regra:

```txt
skills.system_id precisa ser igual ao system_id do stat associado
```

Exemplo inválido:
- skill do sistema D&D
- stat do sistema Pathfinder

Essa coerência não é bem representada no dbdiagram e será validada fora dele.

---

### 6. Origem USER ou AI exige autor (`created_by`)

Para tabelas como `items` e `features`:

```txt
se source = OFFICIAL → created_by pode ser nulo
se source = USER ou AI → created_by deve existir
```

Isso garante rastreabilidade da origem do conteúdo.

---

### 7. Limites numéricos críticos

Regras que devem existir no PostgreSQL:

- `characters.level` entre 1 e 20
- `character_classes.class_level` entre 1 e 20
- `subclasses.unlock_level` entre 1 e 20
- `features.required_level` entre 1 e 20
- `character_stats.value` entre 1 e 30
- `items.weight >= 0`
- `character_inventory.quantity >= 1`
- `hp_current >= 0`
- `hp_max >= 1`
- `hp_current <= hp_max`

Essas são regras clássicas de `CHECK constraint`.

---

# ⚙️ REGRAS QUE FICAM NO BACKEND

Essas regras **não devem ficar só no banco**.  
Elas fazem parte da lógica da aplicação.

## 🎯 Permissões
- GM vs PLAYER
- controle de acesso a páginas
- autorização de ações
- quem pode editar campanha
- quem pode convidar/remover jogadores

## 🎯 IA
- recomendação de builds
- sugestão de magias
- sugestão de itens
- filtragem por classe e nível
- impedir recomendações inválidas

## 🎯 Validações de UX
- mensagens de erro
- validação amigável de formulários
- confirmação de ações
- feedback visual

## 🎯 Regras de fluxo
- impedir criação de personagem por usuário que não participa da campanha
- impedir seleção de subclasse antes do nível correto
- impedir adicionar item/habilidade sem requisitos mínimos
- impedir ações em campanhas deletadas/inativas

---

# 🧱 ARQUITETURA DE RESPONSABILIDADE

| Camada     | Responsabilidade |
|------------|------------------|
| DB         | integridade estrutural dos dados |
| SQL RULES  | regras críticas e invariáveis |
| Backend    | lógica de negócio e orquestração |
| Frontend   | experiência do usuário |

---

# 🧪 PASSOS DE IMPLEMENTAÇÃO

## 🔹 Fase 1 — Setup Prisma
- [x] Criar `schema.prisma`
- [ ] Converter models
- [ ] Validar schema
- [ ] Gerar Prisma Client

## 🔹 Fase 2 — Banco
- [ ] Rodar primeira migration
- [ ] Aplicar `DATABASE_RULES.sql`
- [ ] Validar estrutura no PostgreSQL

## 🔹 Fase 3 — Backend
- [ ] Auth (login/register)
- [ ] CRUD campanhas
- [ ] CRUD personagens
- [ ] Sessions
- [ ] Services

## 🔹 Fase 4 — Sistema RPG
- [ ] Classes / subclasses
- [ ] Stats / skills
- [ ] Features
- [ ] Inventário
- [ ] Regras de progressão

## 🔹 Fase 5 — IA
- [ ] Recomendação de build
- [ ] Filtro inteligente de itens
- [ ] Sugestão de magias
- [ ] Logs/regras de uso da IA

---

# 🧠 FILOSOFIA DO PROJETO

> Pequenos passos → sistema sólido

Ordem correta:

1. Banco correto
2. Regras críticas protegidas
3. Backend confiável
4. Frontend consistente
5. Features avançadas

---

# 📍 PRÓXIMO PASSO

Continuar a conversão do banco para `schema.prisma`, em blocos pequenos.

Próximos models planejados:

- `Campaign`
- `Participant`
- `CampaignInvite`
- `Race`
- `Class`
- `Subclass`
- `Feature`
- `Character`
- `CharacterClass`
- `CharacterStat`
- `CharacterSkill`
- `Item`
- `ItemRequirement`
- `CharacterInventory`
- `CampaignLog`

---

# 📌 CHECKPOINT

Se este documento estiver atualizado, você já tem:

- banco modelado
- responsabilidades separadas
- regras críticas identificadas
- caminho claro para Prisma
- base profissional de documentação
