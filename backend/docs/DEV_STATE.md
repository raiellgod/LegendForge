# 📊 DEV STATE — LegendForge

---

## 📅 Last Update

29/05/2026

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
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── campaigns/[id]/play/page.tsx
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
- retrato/token por URL persistem
- atualização de token a partir da ficha sincroniza tokens existentes do ator

### 🚧 Em andamento

- commit/documentação da 4.26
- próxima macro: regras avançadas de sistema/ficha
- preparar progressão por nível
- preparar magias por classe
- preparar CD/ataque mágico real
- preparar upload real de imagens
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

Status:

- Criar personagem abre draft vazio.
- Builder não carrega dados antigos da Hikari ao criar personagem.
- Player comum abre builder direto pelo botão `+ Personagem`.
- Pronomes influenciam linguagem de labels principais.
- Pronome e gênero inicial sincronizam quando apropriado.
- Salvar rascunho funciona.
- Finalizar ficha gera personagem/ficha pronta.
- Ficha pronta tem abas Ficha/Status, Bolsa, Magia e Perfil.
- Ficha pronta exibe todas as perícias.
- Bolsa mostra equipamentos, moedas e botões Ataque/Dano.
- Magia mostra botões Ataque/Dano/Efeito.
- Perfil mostra imagem/token e campos narrativos.
- Teste regressivo da 4.26 foi concluído.

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
[pendente] 4.26.13 — Commit da 4.26
[próximo] 4.27 — Regras avançadas de sistema/ficha
```

---

## 🧭 Próximo plano

### 4.26.13 — Commit da 4.26

```txt
[ ] git status
[ ] git diff --stat
[ ] cd frontend && pnpm lint && cd ..
[ ] git add .
[ ] git status
[ ] git commit -m "feat: add ready sheet roll actions"
```

### 4.27 — Regras avançadas de sistema/ficha

```txt
[ ] 4.27.1 — Mapear regras atuais de classe, magia, progressão e ficha pronta
[ ] 4.27.2 — Revisar modelagem de progressão por classe/nível
[ ] 4.27.3 — Popular seed de progressão básica por classe
[ ] 4.27.4 — Filtrar magias por classe
[ ] 4.27.5 — Validar quantidade de truques/magias por nível
[ ] 4.27.6 — Calcular CD de magia e ataque mágico
[ ] 4.27.7 — Mostrar espaços de magia na aba Magia
[ ] 4.27.8 — Features de classe por nível
[ ] 4.27.9 — Subclasse no nível correto
[ ] 4.27.10 — Preparar fluxo de subir de nível
[ ] 4.27.11 — Revisão UX/UI das regras avançadas
[ ] 4.27.12 — Teste regressivo
[ ] 4.27.13 — Commit
```

### 4.28 — Multiclasse

```txt
[ ] Modelar múltiplas classes por ficha
[ ] Nível total por soma das classes
[ ] Subir nível perguntando qual classe recebe o novo nível
[ ] Ajustar magias/proficiências/features por classe
[ ] Histórico de níveis
```

---

## 🔮 Backlog confirmado

### Upload real de imagens

- upload de retrato direto do computador
- upload de token direto do computador
- preview/fit/crop
- persistência segura

### Responsividade da ficha pronta

- revisar notebooks menores
- revisar telas widescreen
- revisar tablet
- revisar comportamento de scroll nas abas Ficha/Status, Bolsa, Magia e Perfil

### Regras avançadas

- seed mais robusto
- progressão por nível
- magias por classe/nível
- perícias por classe/antecedente
- salvaguardas
- proficiências editáveis pelo GM
- defesa/armadura como camada mecânica

### Multiclasse

- múltiplas classes por ficha
- nível por classe
- escolher qual classe sobe ao ganhar nível
- impacto em perícias, proficiências, magias e equipamentos

---

## ⚠️ Regra de trabalho

- `page.tsx` é grande.
- Usar sempre o último arquivo enviado como fonte da verdade.
- Mudança grande = arquivo completo.
- Mudança pequena = âncora real.
- Não presumir estrutura antiga.
- Antes de commit: `git diff --stat`.

---

## 🏁 Estado Atual

👉 **Fase 4.26 concluída funcionalmente. Próximo passo: commit da 4.26 e início da 4.27 — regras avançadas de sistema/ficha.**
