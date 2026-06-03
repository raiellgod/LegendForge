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
- ataques reais por equipamento funcionam na ficha pronta
- `Equipment` possui campos estruturados de ataque/dano
- features reais aparecem na aba Features
- subclasse respeita nível de escolha configurado em `CharacterClass.subclassSelectionLevel`
- Level Up preview abre na ficha e mostra mudanças do próximo nível

### 🚧 Em andamento

- 4.29.15 — commit da 4.29
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
- Bolsa mostra equipamentos, moedas e botões Ataque/Dano com ataque real por equipamento.
- Magia mostra botões Ataque/Dano, cálculo real de conjuração e slots.
- Perfil mostra imagem/token e campos narrativos.
- Notas ficam separadas de Perfil.
- Teste regressivo da 4.28 foi concluído com zero erros.

---

## 🧾 Ready Sheet — Status detalhado da 4.29

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

## ⚔️ Equipment, Features e Level Up — Status detalhado da 4.29


A 4.29 consolidou a primeira camada de regras avançadas para uso real da ficha pronta em mesa.

### Equipamentos e ataques reais

- `Equipment` recebeu campos estruturados para ataque:
  - `damageFormula`
  - `damageType`
  - `attackType`
  - `attackAbilityKey`
  - `alternativeAbilityKey`
  - `weaponGroup`
  - `normalRange`
  - `longRange`
  - `isFinesse`
  - `isThrown`
  - `isTwoHanded`
  - `isVersatile`
  - `versatileDamageFormula`
  - `attackBonus`
  - `damageBonus`
- O seed de equipamentos ofensivos foi atualizado.
- A ficha pronta calcula ataque real por equipamento usando atributo, proficiência temporária e bônus do item.
- A aba Combate exibe os ataques equipados.
- A aba Bolsa continua exibindo ataques/danos como inventário de uso rápido.
- GM possui campo manual de CA do alvo na aba Combate.
- Player não vê nem preenche a CA exata do alvo.
- Comparação automática contra CA ainda não existe; por enquanto a CA aparece apenas como referência no texto da rolagem do GM.

### Features reais

- As rotas de ficha retornam `features` reais disponíveis para a ficha.
- A aba Features exibe recursos/traços por origem:
  - classe
  - subclasse
  - ancestralidade
  - outras fontes futuras
- Features são exibidas como texto mecânico/narrativo.
- Aplicação automática de efeitos de features ainda é futura.

### Subclasse por nível correto

- `CharacterClass.subclassSelectionLevel` foi adicionado.
- O seed define o nível de escolha de subclasse.
- O backend valida que uma subclasse só pode ser escolhida no nível correto.
- A subclasse precisa pertencer à classe escolhida.
- A ficha mostra status de subclasse: indisponível, pendente ou escolhida.

### Level Up preview

- A aba Features recebeu botão Level Up.
- O Level Up abre como modal dentro da ficha pronta/pop-out.
- O modal ainda não salva alterações.
- O backend envia `levelUpPreview` com:
  - nível atual
  - próximo nível
  - progressão atual
  - próxima progressão
  - features novas do próximo nível
  - status de subclasse
- A decisão arquitetural ficou registrada: nível do personagem é diferente de nível de classe.
- O Level Up real precisará futuramente permitir subir uma classe existente ou adicionar multiclasse.
- Ancestralidade, antecedente, equipamentos iniciais e origem do personagem não são reprocessados no Level Up.

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
[x] 4.29.1 — Revisar modelagem de ataques reais por equipamento
[x] 4.29.2 — Adicionar/confirmar campos necessários em Equipment para ataque
[x] 4.29.3 — Ajustar seed de equipamentos ofensivos
[x] 4.29.4 — Calcular ataque real por equipamento na ficha
[x] 4.29.5 — Exibir ataque real na aba Bolsa/Combate
[x] 4.29.6 — Preparar ataque contra CA manual
[x] 4.29.7 — Revisar modelagem de Feature por nível
[x] 4.29.8 — Exibir Features reais na aba Features
[x] 4.29.9 — Preparar subclasse no nível correto
[x] 4.29.10 — Planejar fluxo de Level Up
[x] 4.29.11 — Criar primeira versão do botão Level Up
[x] 4.29.12 — Level Up mostra apenas pendências/mudanças do novo nível
[x] 4.29.13 — Teste regressivo da 4.29
[x] 4.29.14 — Atualizar documentação
[próximo] 4.29.15 — Commit da 4.29
```

## 🧭 Próximo plano

### 4.29.15 — Commit da 4.29

Comandos obrigatórios antes do commit:

```bash
git status
git diff --stat
cd frontend
pnpm lint
cd ..
git add .
git status
git commit -m "feat: add advanced equipment features and level up preview"
```

Depois do commit, seguir para:

```txt
4.30 — Multiclasse
4.31 — Modularização e expansão do conteúdo base do sistema
```


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
