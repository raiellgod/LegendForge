# 🏗️ ARCHITECTURE — LegendForge

> Atualizado para novo chat em 16/07/2026. Contexto consolidado após a macro **4.7.7 — Magias iniciais por classe/nível**.

## 🎯 Visão do Projeto

**LegendForge** é um Virtual Tabletop (VTT) web inspirado em Roll20/Foundry, mas com identidade própria: sistema agnóstico, campanhas reais, mesa jogável, criação de personagem persistida e ficha pronta utilizável durante a sessão.

O projeto também funciona como portfólio full-stack real, com foco em arquitetura de produto, regras de domínio, persistência, autenticação, UI incremental e evolução testável.

---

## 🧭 Filosofia de desenvolvimento

- Passos pequenos, funcionais e testáveis.
- Backend e banco como fonte da verdade.
- Evitar mock circular.
- Regras críticas validadas no backend.
- Refatorar continuamente, mas sem quebrar fluxo funcional.
- Arquivos grandes exigem fonte única da verdade.
- Antes de qualquer commit: **rodar `git diff --stat` e `git status`**.
- Se o arquivo for grande, preferir receber a versão atual do usuário antes de reescrever.
- Mudança pequena: usar “Procure/Troque”.
- Mudança grande: entregar arquivo inteiro baseado na última versão enviada.
- Backend lint: `pnpm eslint`.
- Frontend lint: `pnpm lint`.

---

## 🧱 Stack

### Backend

- Node.js
- Fastify
- TypeScript
- Prisma
- PostgreSQL
- Better Auth
- Zod
- Swagger/Scalar
- Docker
- pnpm

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Better Auth Client
- pnpm

---

## 📦 Estrutura atual

```txt
LegendForge/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── seed.ts
│   │   └── seed-data/
│   └── src/
│       ├── generated/
│       ├── lib/
│       ├── routes/
│       │   ├── campaigns.ts
│       │   ├── character-sheets.ts
│       │   └── systems.ts
│       └── index.ts
│
├── frontend/
│   └── src/
│       ├── app/
│       │   └── campaigns/
│       │       └── [id]/
│       │           ├── play/page.tsx
│       │           └── sheets/[sheetId]/page.tsx
│       └── features/
│           ├── character-builder/
│           │   ├── components/
│           │   ├── constants/
│           │   ├── review/
│           │   ├── services/
│           │   ├── steps/
│           │   ├── summary/
│           │   ├── types/
│           │   └── utils/
│           └── game-table/
│               ├── components/
│               ├── constants/
│               ├── services/
│               ├── types/
│               └── utils/
└── docs/
```

---

## 🧩 Modelagem principal

### Núcleo

- User
- Session
- Account
- Verification

### Campanha / Mesa

- Campaign
- Participant
- GameSession
- CampaignActor
- SceneToken

### Sistema RPG

- GameSystem
- Stat
- Skill
- Language
- Ancestry
- Background
- CharacterClass
- CharacterSubclass
- Feature
- Spell
- Equipment
- LevelProgression
- LevelProgressionSpellLimit
- ClassSpell

### Ficha

- CharacterSheet
- CharacterSheetStat
- CharacterSheetSkill
- CharacterSheetSpell
- CharacterSheetLanguage
- CharacterSheetEquipment
- CharacterSheetClass

---

## 🧍 Character Builder — arquitetura atual

Arquivos principais:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
frontend/src/features/character-builder/constants/character-builder-steps.ts
frontend/src/features/character-builder/steps/
frontend/src/features/character-builder/components/
frontend/src/features/character-builder/types/character-builder-types.ts
backend/src/routes/character-sheets.ts
backend/src/routes/systems.ts
backend/prisma/schema.prisma
backend/prisma/seed.ts
backend/prisma/seed-data/
```

Etapas atuais do builder:

```txt
Conceito
Classe
Ancestralidade
Antecedente
Atributos
Perícias
Idiomas
Magias
Equipamentos
Sobre
Revisão
```

O builder já suporta criação inicial multiclasse:

```txt
CharacterBuilderDraft.classEntries
CharacterSheetClass
CharacterSheet.level = nível total
CharacterSheetClass.level = nível individual da classe
```

---

## 🪄 Magias — arquitetura atual pós 4.7.7

### Objetivo

A macro 4.7.7 consolidou magias iniciais por classe/nível com suporte a multiclasse e separação entre:

```txt
Magias conhecidas
Magias preparadas
Magias concedidas pelo mestre
Magias sempre conhecidas
```

### Decisões oficiais

```txt
Builder escolhe magias conhecidas.
Preparadas serão estado/função futura da ficha.
Mago/estudioso usa premissa de grimório: conhece mais do que prepara.
Magias concedidas pelo mestre não contam no limite do builder/level up.
Magias sempre conhecidas futuramente não contam no limite comum.
```

### Banco

Modelos relevantes:

```txt
Spell
ClassSpell
LevelProgression
LevelProgressionSpellLimit
CharacterSheetSpell
```

`LevelProgressionSpellLimit` controla limite por nível de magia:

```txt
spellLevel
spellsKnown
spellsPrepared
```

Interpretação atual:

```txt
spellLevel 0 = truques
spellsKnown = limite usado pelo builder
spellsPrepared = limite futuro para preparação diária/estado da ficha
```

`CharacterSheetSpell` agora guarda origem interna:

```txt
classId
source
isPrepared
isAlwaysPrepared
```

### Backend

`backend/src/routes/systems.ts`:

- retorna `levelProgressions.spellLimits` no `/systems/:systemId/character-options`.

`backend/src/routes/character-sheets.ts`:

- valida magias contra múltiplas classes;
- valida `ClassSpell`;
- valida `minimumClassLevel`;
- valida `LevelProgressionSpellLimit.spellsKnown` para o nível da magia;
- salva `CharacterSheetSpell.classId`;
- retorna `characterClass` dentro de cada magia da ficha.

### Frontend

`CharacterSpellsStep.tsx`:

- usa lista única de magias;
- une permissões de todas as classes;
- não duplica magia que aparece em mais de uma classe;
- usa `spellLimits.spellsKnown` por nível de magia;
- mostra contadores por nível;
- não mostra origem da classe no card.

`CharacterReadySheetView.tsx`:

- exibe bloco limpo de **Conjuração** por classe;
- mostra atributo de conjuração por classe;
- prepara CD e ataque mágico por classe;
- cards de magia continuam limpos;
- ataque mágico tenta usar origem interna da magia (`classId/characterClass`), com fallback seguro.

---

## 🗣️ Idiomas — arquitetura atual

### Banco

Modelos principais:

```txt
Language
CharacterSheetLanguage
```

Campos relevantes:

```txt
Ancestry.languageKeys
Background.languageKeys
Background.languageChoiceCount
CharacterSheetLanguage.source
```

Fontes possíveis:

```txt
builder
class
background
ancestry
feature
manual
```

### Regra de finalização

```txt
Idiomas automáticos = ancestry.languageKeys + background.languageKeys
Idiomas extras = CharacterSheet.languages com source === "builder"
Quantidade exigida = background.languageChoiceCount
```

---

## 🧾 Ready Sheet — arquitetura atual

Arquivos principais:

```txt
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/features/character-builder/components/CharacterReadySheetModal.tsx
frontend/src/app/campaigns/[id]/sheets/[sheetId]/page.tsx
frontend/src/app/campaigns/[id]/play/page.tsx
```

A ficha abre como:

```txt
1. Modal dentro da mesa.
2. Janela/pop-out separada.
```

Abas atuais:

```txt
Ficha/Status
Combate
Bolsa
Magia
Features
Perfil
Notas
```

Funcionalidades relevantes:

```txt
rolagens via ficha
rolagens no pop-out via postMessage
ataque real por equipamento
dano por equipamento
CD de magia
ataque mágico
slots de magia
bloco Conjuração por classe
features reais
classes por nível
idiomas no Perfil
notas narrativas avançadas
```

---

## ⚔️ Regras avançadas já existentes

### Multiclasse / Level Up

- `CharacterSheet.level` = nível total.
- `CharacterSheetClass.level` = nível individual da classe.
- Ficha mostra classes por nível.
- Level Up preview permite escolher visualmente qual classe receberia nível.
- Level Up real completo ainda será expandido depois.

### Equipamento

- Equipamentos ofensivos têm dados estruturados.
- Ficha calcula ataque por equipamento.
- Proficiências de arma/proteção/ferramenta já são consumidas pela ficha.
- CA por proteção ainda é prévia/preparação; aplicação final é futura.

### Features

- Features reais retornadas pelo backend.
- Ficha mostra por classe/subclasse/ancestralidade/outros.
- Aplicação mecânica automática ainda é futura.

---

## 📌 Arquivos grandes — fonte da verdade atual

Ao iniciar novo chat, pedir/usar os arquivos atuais caso precise mexer:

```txt
backend/src/routes/character-sheets.ts
backend/src/routes/systems.ts
backend/prisma/schema.prisma
backend/prisma/seed.ts
frontend/src/app/campaigns/[id]/play/page.tsx
frontend/src/app/campaigns/[id]/sheets/[sheetId]/page.tsx
frontend/src/features/character-builder/types/character-builder-types.ts
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/features/character-builder/components/CharacterReadySheetModal.tsx
frontend/src/features/character-builder/steps/CharacterSpellsStep.tsx
frontend/src/features/character-builder/steps/CharacterReviewStep.tsx
frontend/src/features/character-builder/steps/CharacterLanguagesStep.tsx
frontend/src/features/character-builder/constants/character-builder-steps.ts
```

---

## 🔜 Próxima micro recomendada

```txt
4.7.8 — Escolhas pendentes iniciais
```

Ideia:

- mapear escolhas pendentes possíveis no personagem inicial;
- preparar subclasse pendente;
- preparar magias/truques pendentes;
- preparar proficiências/idiomas pendentes;
- sem resolver ainda todo o Level Up real.
