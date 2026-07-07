# 🏗️ ARCHITECTURE — LegendForge

> Atualizado para novo chat em 07/07/2026. Contexto consolidado após a sequência 4.6.6 — Idiomas por fonte.


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
- Antes de qualquer commit: **rodar `git diff --stat`**.
- Se o arquivo for grande, preferir receber a versão atual do usuário antes de reescrever.
- Mudança pequena: usar “Procure/Troque”.
- Mudança grande: entregar arquivo inteiro baseado na última versão enviada.

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

A etapa **Idiomas** foi adicionada na sequência **4.6.6**.

---

## 🗣️ Arquitetura de idiomas — 4.6.6

### Objetivo

Modelar idiomas por fonte e permitir:

- idiomas automáticos da ancestralidade;
- idiomas automáticos do antecedente;
- escolhas extras do antecedente;
- persistência em ficha;
- validação ao finalizar;
- exibição na revisão e na ficha pronta.

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

### Backend

`backend/src/routes/character-sheets.ts` agora:

- aceita `languageKeys` no POST;
- aceita `languageKeys` no PATCH;
- valida idioma por sistema;
- salva em `CharacterSheetLanguage`;
- retorna `languages` no `characterSheetInclude`;
- valida idioma na finalização.

Regra de finalização:

```txt
Idiomas automáticos = ancestry.languageKeys + background.languageKeys
Idiomas extras = CharacterSheet.languages com source === "builder"
Quantidade exigida = background.languageChoiceCount
```

Também valida:

- quantidade exata de escolhas extras;
- idioma extra duplicado;
- idioma automático escolhido novamente como extra.

### Frontend

Arquivos relevantes:

```txt
CharacterLanguagesStep.tsx
CharacterReviewStep.tsx
CharacterReadySheetView.tsx
character-builder-steps.ts
page.tsx
character-builder-types.ts
```

A UI:

- exibe idiomas automáticos;
- permite escolher idiomas extras;
- bloqueia excesso de escolhas;
- mostra idiomas na revisão;
- mostra idiomas na ficha pronta, aba Perfil.

---

## 🧾 Ready Sheet — arquitetura atual

Arquivos principais:

```txt
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/features/character-builder/components/CharacterReadySheetModal.tsx
frontend/src/app/campaigns/[id]/sheets/[sheetId]/page.tsx
frontend/src/app/campaigns/[id]/play/page.tsx
```

Decisão:

```txt
CharacterReadySheetView = miolo reutilizável.
CharacterReadySheetModal = casca modal.
sheets/[sheetId]/page.tsx = pop-out real.
play/page.tsx = mesa + chat + postMessage.
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

Na 4.6.6.5, a aba Perfil passou a exibir **Idiomas**.

---

## ⚔️ Regras avançadas já existentes

### Magia

- `spellcastingAbilityKey` por classe.
- `LevelProgression` por classe/nível.
- `ClassSpell` controla magias por classe.
- Builder filtra magias por classe e nível inicial.
- Ficha calcula CD e ataque mágico reais.
- Slots de magia aparecem na ficha.

### Equipamento

- Equipamentos ofensivos têm dados estruturados.
- Ficha calcula ataque por equipamento.
- Aba Combate e Bolsa mostram ataque/dano.
- CA manual visível apenas para GM.
- Comparação automática contra CA ainda é futura.

### Features

- Features reais retornadas pelo backend.
- Ficha mostra por classe/subclasse/ancestralidade/outros.
- Aplicação mecânica automática ainda é futura.

### Multiclasse / Level Up

- `CharacterSheet.level` = nível total.
- `CharacterSheetClass.level` = nível individual da classe.
- Ficha mostra classes por nível.
- Level Up preview permite escolher visualmente qual classe receberia nível.
- Level Up real ainda será expandido depois.

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
frontend/src/features/character-builder/steps/CharacterLanguagesStep.tsx
frontend/src/features/character-builder/steps/CharacterReviewStep.tsx
frontend/src/features/character-builder/constants/character-builder-steps.ts
```

---

## 🔜 Próxima micro recomendada

```txt
4.6.7 — Proficiências de equipamento por fonte
```

Ideia:

- persistir/derivar proficiências reais por fonte;
- usar proficiências da classe em ataque de equipamento;
- preparar proteções/armaduras/ferramentas;
- substituir “proficiência temporária: sim” na ficha pronta por regra real.

