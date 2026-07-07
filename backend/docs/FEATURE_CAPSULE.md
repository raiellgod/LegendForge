# 📦 FEATURE CAPSULES — LegendForge

> Atualizado para novo chat em 07/07/2026. Contexto consolidado após a sequência 4.6.6 — Idiomas por fonte.


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
```

---

# ⚡ Capsule 42 — Character Creation Rules: Skills Foundation

## 🎯 Goal

Revisar a criação de ficha para começar a separar regras reais por fonte.

## ✅ Result

- atributos por fonte;
- perícias salvas com `source`;
- antecedente virou sugestão visual, não proficiência automática;
- classe passou a controlar quantidade de perícias;
- backend valida limite;
- finalização exige quantidade exata de perícias de classe;
- revisão mostra proficiências da classe.

---

# ⚡ Capsule 43 — Character Languages by Source

## 🎯 Goal

Adicionar idiomas reais ao sistema, builder, backend e ficha pronta.

## ✅ Result

- `Language` modelado no Prisma.
- `CharacterSheetLanguage` modelado no Prisma.
- `GameSystem.languages` criado.
- `Ancestry.languageKeys` criado.
- `Background.languageKeys` criado.
- `Background.languageChoiceCount` usado para escolhas extras.
- `seed-data/languages.ts` criado.
- Seed cadastra idiomas.
- API de opções retorna `languages`.
- API de opções retorna `languageKeys` de ancestralidades e antecedentes.
- Types do frontend aceitam `languages` e `languageKeys`.
- Draft possui `languageKeys`.
- Backend POST/PATCH aceita `languageKeys`.
- Backend salva idiomas na ficha.
- Builder recebeu etapa **Idiomas**.
- Review mostra idiomas.
- Finalização valida idiomas.
- Ficha pronta mostra idiomas no Perfil.

## 🧪 Validation

```txt
backend eslint limpo
frontend lint limpo
```

## 🔚 Completed micros

```txt
[x] 4.6.6.1 — Modelar idiomas no schema/seed/API/types
[x] 4.6.6.2 — Backend salva languageKeys no rascunho da ficha
[x] 4.6.6.3 — Criar etapa de idiomas no builder
[x] 4.6.6.4 — Validar idiomas ao finalizar ficha
[x] 4.6.6.5 — Exibir idiomas na ficha pronta
```

---

# 🔜 Capsule 44 — Equipment Proficiencies by Source

## 🎯 Goal

Transformar proficiências de equipamento em regra real por fonte.

## Planned

```txt
[próximo] 4.6.7.1 — Revisar estado atual de proficiências de equipamento
[ ] 4.6.7.2 — Resolver proficiências efetivas da ficha no backend/frontend
[ ] 4.6.7.3 — Ataque de equipamento usa proficiência real
[ ] 4.6.7.4 — Exibir fonte da proficiência na ficha/review
[ ] 4.6.7.5 — Preparar armaduras/proteções para CA real
```

## Notes

Já existem no sistema:

```txt
CharacterClass.weaponProficiencyKeys
CharacterClass.protectionProficiencyKeys
CharacterClass.toolProficiencyKeys
```

A próxima evolução é fazer a ficha pronta consumir essas listas em vez de assumir proficiência temporária em ataque de equipamento.

