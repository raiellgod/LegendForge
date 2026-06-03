# 📊 DEV STATE — LegendForge

---

## 📅 Last Update

03/06/2026

---

## 🧱 Project Structure

```txt
LegendForge/
├── backend/
│   ├── src/
│   │   ├── generated/prisma/
│   │   ├── lib/
│   │   ├── routes/
│   │   │   ├── campaigns.ts
│   │   │   ├── character-sheets.ts
│   │   │   └── systems.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── campaigns/[id]/
│   │   │       ├── play/page.tsx
│   │   │       └── sheets/[sheetId]/page.tsx
│   │   ├── features/
│   │   │   ├── character-builder/
│   │   │   │   ├── components/
│   │   │   │   ├── constants/
│   │   │   │   ├── review/
│   │   │   │   ├── services/
│   │   │   │   ├── steps/
│   │   │   │   ├── summary/
│   │   │   │   ├── types/
│   │   │   │   └── utils/
│   │   │   └── game-table/
│   │   │       ├── components/
│   │   │       ├── constants/
│   │   │       ├── services/
│   │   │       ├── types/
│   │   │       └── utils/
│   │   ├── components/
│   │   ├── lib/
│   │   └── service/
│   └── package.json
│
├── docs/
└── README.md
```

---

## ⚙️ Dependencies

### Backend

- Node.js
- Fastify
- TypeScript
- Prisma
- PostgreSQL
- Better Auth
- Zod
- Swagger
- Scalar API Reference
- ESLint
- Prettier
- pnpm
- Docker

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth Client
- lucide-react
- ESLint
- pnpm

---

## 🗄️ Database — Status Real

### ✅ Implementado

- Better Auth tables
- GameSystem
- Stat
- Skill
- Campaign
- Participant
- GameSession
- CampaignActor
- SceneToken
- Ancestry
- Background
- CharacterClass
- CharacterSubclass
- Feature
- Spell
- Equipment
- LevelProgression
- ClassSpell
- CharacterSheet
- CharacterSheetStat
- CharacterSheetSkill
- CharacterSheetSpell
- CharacterSheetEquipment

### ✅ Validado

- registro cria usuário
- login cria sessão
- sessão aparece no Prisma Studio
- campanhas são criadas com owner
- criador entra como participante GM
- home lista campanhas do usuário autenticado
- página de mesa abre campanha real
- aba Personagens consome atores reais
- biblioteca/mesa de atores está persistida
- tokens de cena persistem
- posição de token persiste
- tamanho de token persiste
- rascunho de CharacterSheet cria no banco
- rascunho carrega
- classe/ancestralidade/antecedente persistem
- atributos persistem
- perícias persistem
- magias persistem
- equipamentos persistem
- campos de sobre persistem
- criação de personagem do zero abre draft vazio
- player comum consegue abrir criação de personagem pela aba Personagens
- ficha pronta carrega dados da CharacterSheet
- ficha pronta abre no modal
- ficha pronta abre em pop-out
- pop-out carrega dados reais
- pop-out envia rolagens para o chat da mesa via `postMessage`
- retrato/token por URL persistem
- atualização de token a partir da ficha sincroniza tokens existentes do ator
- progressões por classe/nível foram criadas e populadas no seed
- `ClassSpell` foi populada no seed
- magias são filtradas por classe no builder
- limites de truques/magias por nível funcionam no frontend
- CD e ataque mágico real funcionam na ficha pronta
- slots de magia aparecem na aba Magia

### 🚧 Em andamento

- 4.28.14 — revisão UX/UI do chat após ficha pop-out
- 4.28.15 — commit da 4.28
- persistência/sincronização futura de ferramentas locais da mesa

---

## 🌐 API — Status

### ✅ Implementado

- Fastify configurado
- CORS funcionando para frontend local
- Better Auth em `/api/auth/*`
- Swagger em `/swagger.json`
- Scalar em `/docs`
- Helper de sessão real
- Rotas de campanha
- Rotas de participantes
- Rotas de sistemas
- Rotas de character sheets
- Rotas de atores de campanha
- Rotas de tokens de cena

### Rotas importantes atuais

```txt
GET    /campaigns
POST   /campaigns
GET    /campaigns/:id
PATCH  /campaigns/:id
DELETE /campaigns/:id

GET    /campaigns/:id/participants
PATCH  /campaigns/:campaignId/participants/:participantId/role
DELETE /campaigns/:campaignId/participants/:participantId

GET    /campaigns/:campaignId/actors
POST   /campaigns/:campaignId/actors
PATCH  /campaigns/:campaignId/actors/:actorId

GET    /campaigns/:campaignId/tokens
POST   /campaigns/:campaignId/tokens
PATCH  /campaigns/:campaignId/tokens/:tokenId
DELETE /campaigns/:campaignId/tokens/:tokenId

GET    /systems
GET    /systems/:systemId/character-options

GET    /campaigns/:campaignId/character-sheets
POST   /campaigns/:campaignId/character-sheets
GET    /campaigns/:campaignId/character-sheets/:sheetId
PATCH  /campaigns/:campaignId/character-sheets/:sheetId
```

### Mudanças relevantes da 4.27

A rota:

```txt
GET /systems/:systemId/character-options
```

agora retorna, nas classes:

```txt
spellcastingAbilityKey
levelProgressions
classSpells
```

As rotas de ficha pronta incluem `characterClass.levelProgressions` para permitir a exibição de slots na aba Magia.

### Mudanças relevantes da 4.28

A 4.28 foi majoritariamente frontend. Não criou rota backend nova.

Nova rota frontend:

```txt
/campaigns/[id]/sheets/[sheetId]
```

Essa rota usa APIs existentes para:

- validar/carregar campanha
- buscar a ficha
- buscar atores
- buscar opções do sistema
- renderizar a mesma ficha pronta do modal em pop-out

---

## 🎨 Frontend — Status

### ✅ Implementado

- Home pública
- Login
- Registro
- Header privado
- Background parchment
- `/campaigns`
- `/campaigns/create`
- `/campaigns/search`
- `/campaigns/[id]/edit`
- `/campaigns/[id]/play`
- `/campaigns/[id]/sheets/[sheetId]`

### Página de jogo `/campaigns/[id]/play`

Estado atual:

- header de mesa
- grid/mapa
- toolbar lateral esquerda
- painel direito com abas extraídas
- Chat
- Rolagens
- Personagens
- Diário inicial
- Mesa/configuração inicial
- atores reais
- tokens/cena
- modal de criação de personagem
- builder de personagem
- biblioteca de atores
- ações de ator/personagem
- edição de tamanho de token
- ficha pronta de personagem
- pop-out da ficha
- listener de mensagens do pop-out
- rolagens automáticas vindas da ficha
- criação de personagem para player comum pela aba Personagens

---

## 🧍 Character Builder — Status detalhado

Pasta principal:

```txt
frontend/src/features/character-builder/
```

Etapas/componentes extraídos:

- types
- constants
- steps config
- utils de atributos
- utils de perícias
- utils de magias
- utils de equipamentos
- utils de sobre/about
- utils de cálculos da ficha pronta
- componentes genéricos
- componentes da revisão
- etapa Conceito
- etapa Atributos
- etapa Perícias
- etapa Magias
- etapa Equipamentos
- etapa Sobre
- etapa Revisão
- modal de ficha pronta
- view reutilizável da ficha pronta

Status:

- Criar personagem abre draft vazio.
- Builder não carrega dados antigos ao criar personagem.
- Player comum abre builder direto pelo botão `+ Personagem`.
- Pronomes influenciam linguagem de labels principais.
- Pronome e gênero inicial sincronizam quando apropriado.
- Salvar rascunho funciona.
- Finalizar ficha gera personagem/ficha pronta.
- Ficha pronta tem abas Ficha/Status, Combate, Bolsa, Magia, Features, Perfil e Notas.
- Ficha pronta exibe todas as perícias.
- Bolsa mostra equipamentos, moedas e botões Ataque/Dano.
- Magia mostra botões Ataque/Dano, cálculo real de conjuração e slots.
- Perfil mostra imagem/token e campos narrativos.
- Notas ficam separadas de Perfil.
- Teste regressivo da 4.28 foi concluído com zero erros.

---

## 🧾 Ready Sheet — Status detalhado da 4.28

Arquivos principais:

```txt
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/features/character-builder/components/CharacterReadySheetModal.tsx
frontend/src/app/campaigns/[id]/sheets/[sheetId]/page.tsx
frontend/src/app/campaigns/[id]/play/page.tsx
```

Arquitetura:

```txt
CharacterReadySheetView
- contém a ficha completa
- usado no modal
- usado no pop-out

CharacterReadySheetModal
- casca visual do modal

sheets/[sheetId]/page.tsx
- página pop-out
- carrega dados reais

play/page.tsx
- mesa
- chat
- listener de postMessage
```

Funcionalidades validadas:

- abrir ficha no modal
- abrir ficha em pop-out
- pop-out carrega a ficha certa
- rolagem do pop-out aparece no chat da mesa
- topo compacto da ficha
- Ficha/Status reorganizada
- Bolsa compacta e expansível
- Magia compacta e expansível
- Magia separada em Truques / Magias / Nível
- abas futuras preparadas: Combate, Features e Notas
- responsividade revisada
- `<Image />` usado no lugar de `<img>` para preview, com `unoptimized`

---

## 🪄 Spellcasting — Status detalhado

Implementado na 4.27:

- `spellcastingAbilityKey` em `CharacterClass`.
- `LevelProgression` expandido.
- `ClassSpell` criado/populado.
- Seed mínimo de magias expandido.
- Builder filtra magias por classe.
- Builder respeita nível mínimo da magia para a classe.
- Builder valida limite de truques/magias pela progressão nível 1.
- Ao trocar de classe, magias antigas são limpas do draft.
- Ficha pronta calcula atributo de conjuração.
- Ficha pronta calcula CD de magia.
- Ficha pronta calcula ataque mágico real.
- Ficha pronta desabilita ataque mágico quando classe não conjura.
- Ficha pronta exibe espaços de magia do nível atual.
- `dice-utils.ts` mostra o total correto da rolagem no resultado grande.

Limitações intencionais:

- Dano mágico ainda é detectado pela descrição.
- Campos próprios como `damageFormula`, `damageType`, `requiresSavingThrow`, `savingThrowAbility` e `usesSpellSlot` ficam para refino futuro.
- Controle de slots usados ainda não existe.

---

## 🎲 Game Table — Status detalhado

Pasta principal:

```txt
frontend/src/features/game-table/
```

Componentes extraídos:

- `TableLeftToolbar`
- `TableSceneCanvas`
- `TableRightPanel`
- `TableChatPanel`
- `TableRollsPanel`
- `TableCharactersPanel`
- `TableJournalPanel`
- `TableSettingsPanel`

Constantes, serviços, types e utils extraídos:

- `constants/dice-constants.ts`
- `constants/table-ui-constants.ts`
- `services/game-table-api.ts`
- `types/game-table-types.ts`
- `utils/actor-utils.ts`
- `utils/dice-utils.ts`
- `utils/token-utils.ts`
- `utils/user-utils.ts`

Funcionalidades validadas:

- Selecionar move tokens.
- Mover visão arrasta o mapa.
- Medir linha em metros.
- Medir círculo com centro no clique e raio no arrasto.
- Medição permanece até trocar ferramenta ou criar outra.
- Desenhar cria traços locais.
- Desenhar desfaz último traço.
- Desenhar limpa desenhos.
- Névoa cria áreas reveladas com máscara real.
- Névoa desfaz última área.
- Névoa limpa áreas.
- Tokens fora da área revelada ficam cobertos.
- Tamanho de token 1x1, 2x2, 3x3 e 4x4 funciona.
- Tamanho de token persiste após recarregar.
- Biblioteca e `+ Criar` aparecem para GM.
- `+ Personagem` aparece para player comum.
- Rolagens manuais aceitam modificadores numéricos positivos e negativos.
- Iniciativa da mesa gera ranking sem emoji.
- Personagens usam iniciativa real no ranking.
- NPCs/criaturas usam +0 até terem ficha própria.

Observação:

```txt
Medição, desenho, névoa, pan/zoom e chat/rolagens atuais ainda são locais/visuais.
Sincronização real entre contas será tratada em fase futura.
```

---

## 🧩 Micros atuais

```txt
[x] 4.22 — Refatoração do Character Builder
[x] 4.23 — Refatoração da Mesa de Jogo
[x] 4.24 — Personagens ativos, biblioteca e ciclo de vida de atores
[x] 4.25 — Ficha pronta, abas, perfil, bolsa, magia e imagens por URL
[x] 4.26 — Rolagens automáticas pela ficha pronta
[x] 4.27 — Regras avançadas de magia e progressão inicial
[x] 4.28.1 — Planejar arquitetura da ficha pop-out
[x] 4.28.2 — Criar rota própria da ficha pronta carregando dados reais
[x] 4.28.3 — Reaproveitar ficha completa dentro do pop-out
[x] 4.28.4 — Conectar rolagens do pop-out ao chat da mesa via postMessage
[x] 4.28.5 — Extrair miolo da ficha para CharacterReadySheetView
[x] 4.28.6 — Criar topo fixo compacto da ficha
[x] 4.28.7 — Reorganizar Ficha/Status para leitura rápida
[x] 4.28.8 — Reorganizar aba Magia com cards expansíveis
[x] 4.28.9 — Reorganizar aba Bolsa com cards expansíveis
[x] 4.28.10 — Preparar abas futuras: Combate, Features e Notas
[x] 4.28.11 — Revisar responsividade da ficha pop-out
[x] 4.28.12 — Teste regressivo da ficha pop-out
[x] 4.28.13 — Atualizar documentação da 4.28
[próximo] 4.28.14 — Revisar UX/UI do chat após ficha pop-out
[pendente] 4.28.15 — Commit da 4.28
[depois] 4.29 — Regras avançadas de equipamento, features e level up
```

---

## 🧭 Próximo plano

### 4.28.14 — Revisar UX/UI do chat após ficha pop-out

```txt
[ ] Revisar layout de cards de rolagem
[ ] Reduzir altura/poluição de cards repetidos
[ ] Diferenciar mensagem normal, sistema, rolagem e sussurro
[ ] Preservar visibilidade pública/sussurro
[ ] Melhorar leitura de rolagens vindas da ficha
[ ] Testar rolagens do modal e do pop-out
```

### 4.28.15 — Commit da 4.28

```txt
[ ] git status
[ ] git diff --stat
[ ] cd frontend && pnpm lint && cd ..
[ ] git add .
[ ] git status
[ ] git commit -m "feat: refactor ready sheet popout"
```

---

## 🔮 Backlog confirmado

### Modularização de seed

- Separar seed em arquivos menores antes de expandir muito magias/itens.

```txt
backend/prisma/seeds/
  system.seed.ts
  stats.seed.ts
  skills.seed.ts
  ancestries.seed.ts
  backgrounds.seed.ts
  classes.seed.ts
  subclasses.seed.ts
  level-progressions.seed.ts
  features.seed.ts
  spells.seed.ts
  class-spells.seed.ts
  equipment.seed.ts
  starting-equipment.seed.ts
```

### Upload real de imagens

- upload de retrato direto do computador
- upload de token direto do computador
- preview/fit/crop
- persistência segura

### Regras avançadas

- ataque real por equipamento
- ataque contra CA manual
- features por nível
- subclasse no nível correto
- level up
- multiclasse

### NPCs e criaturas

- NPCs terão ficha própria futura.
- Criaturas terão bloco próprio de bestiário.
- Não usar `CharacterSheet` como ficha universal para tudo.

### Sincronização em tempo real

- WebSocket ou estratégia equivalente futura
- sincronizar tokens, chat, rolagens, desenhos, névoa e estados de mesa

---

## ⚠️ Regras fixas de trabalho

```txt
Branch atual: feat/game-page
Antes de qualquer commit: git diff --stat
Arquivo grande: usar fonte da verdade mais recente
Mudança grande: arquivo inteiro
Mudança pequena: “Procure este trecho / Troque por este trecho”
Não usar estrutura presumida antiga
```
