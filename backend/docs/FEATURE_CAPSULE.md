# 📦 FEATURE CAPSULES — LegendForge

> Atualizado para novo chat em 16/07/2026. Contexto consolidado após a macro **4.7.7 — Magias iniciais por classe/nível**.

## 📌 Sobre

Este arquivo registra o desenvolvimento incremental do projeto. Cada cápsula representa uma etapa pequena, funcional, testável e validada.

---

# ✅ Cápsulas já consolidadas

As cápsulas anteriores cobrem:

```txt
01 — Setup
02 — Backend Base
03 — Data & UI Design
04 — Database Design
05 — Figma UI
06 — System Design
07 — Database Refinement
08 — Production Constraints
09 — Prisma Integration
10 — Authentication
11 — API Integration
12 — Campaign Domain API
13 — Campaign Frontend Flow
14 — Campaign Search & Join
15 — Game Page Foundation
16 — Campaign Actors
17 — Scene Tokens
18 — RPG System Seed
19 — CharacterSheet Backend
20 — Character Creation Menu
21 — Character Builder Layout
22 — Character Builder Draft
23 — Character Builder Options
24 — Character Choices Persistence
25 — Character Builder Step Validation
26 — Attributes
27 — Skills
28 — Spells
29 — Equipment
30 — About
31 — Review & Stabilization
32 — Game Table Refactor
33 — Game Table Panels
34 — Game Table Canvas & Tools
35 — Game Table Regression
36 — Ready Sheet / Modal / Pop-out
37 — Automatic Rolls
38 — Spellcasting Rules
39 — Equipment Attacks / Features / Level Up Preview
40 — Multiclass Foundation
41 — Seed Modularization / Equipment Images
42 — Character Creation Rules: Skills Foundation
43 — Character Languages by Source
44 — Equipment Proficiencies by Source
45 — Character Narrative Fields
46 — Initial Multiclass Foundation
47 — Initial Multiclass HP and Features
```

---

# ⚡ Capsule 48 — Multiclass Spell Limits and Spell Sources

## 🎯 Goal

Consolidar magias iniciais por classe/nível com suporte a multiclasse, separando magias conhecidas de magias preparadas e preparando origem interna por classe.

## ✅ Result

- `LevelProgressionSpellLimit` modelado no Prisma.
- `LevelProgression.spellLimits` criado.
- `CharacterSheetSpell.classId` criado.
- Seed preenche limites por nível de magia.
- `/systems/:systemId/character-options` retorna `spellLimits`.
- Frontend types recebem `CharacterBuilderSpellLimit`.
- Builder usa `spellsKnown` por nível de magia.
- Builder não usa `spellsPrepared` como limite de escolha.
- Preparadas ficam para estado/mecânica futura da ficha.
- Lista de magias é unificada por classes escolhidas.
- Magia duplicada entre classes aparece uma vez só.
- Origem interna prioriza classe principal quando compatível.
- Backend valida magia contra múltiplas classes.
- Backend salva `source` e `classId` em `CharacterSheetSpell`.
- Backend retorna `classId` e `characterClass` em cada magia da ficha.
- Frontend types aceitam origem interna da magia.
- Ficha pronta mostra bloco **Conjuração** por classe.
- Cards de magia continuam limpos, sem origem visual por card.
- Ataque mágico fica preparado para usar a origem interna da magia.

## 🧠 Decisions

```txt
Magias conhecidas ≠ magias preparadas.
Builder escolhe magias conhecidas.
Preparadas serão estado/função futura da ficha.
Mago/estudioso usa premissa de grimório: conhece mais do que prepara.
Magias concedidas pelo mestre não contam no limite do builder/level up.
Magias sempre conhecidas futuramente não contam no limite comum.
```

## 🧪 Validation

```txt
backend eslint limpo
frontend lint limpo
páginas sem erro
ficha abre/finaliza normalmente
```

## 🔚 Completed micros

```txt
[x] 4.7.7.0 — Modelar limites de magia por nível
[x] 4.7.7.1 — União final das permissões de magia por classe no builder
[x] 4.7.7.2 — Backend valida magia contra múltiplas classes
[x] 4.7.7.3 — Backend salva e retorna classId/source da magia
[x] 4.7.7.4 — Frontend types recebem origem interna da magia
[x] 4.7.7.5 — Bloco de conjuração por classe na ficha pronta
```

---

# 🔜 Capsule 49 — Initial Pending Choices

## 🎯 Goal

Mapear e preparar escolhas pendentes iniciais sem ainda implementar todo o fluxo de Level Up real.

## Planned

```txt
[próximo] 4.7.8.1 — Mapear escolhas pendentes possíveis
[ ] 4.7.8.2 — Subclasse pendente
[ ] 4.7.8.3 — Magias/truques pendentes
[ ] 4.7.8.4 — Proficiências pendentes
[ ] 4.7.8.5 — Línguas pendentes
[ ] 4.7.8.6 — Atributos/talentos futuramente
```

## Notes

As escolhas pendentes devem ser planejadas para servirem tanto ao personagem inicial quanto ao Level Up real depois.
