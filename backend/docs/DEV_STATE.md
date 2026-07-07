# 📊 DEV STATE — LegendForge

> Atualizado para novo chat em 07/07/2026. Contexto consolidado após a sequência 4.6.6 — Idiomas por fonte.


## 📅 Last Update

07/07/2026

---

## ✅ Estado consolidado

### Geral

```txt
Branch usual: feat/game-page
Stack: Next.js + React + Tailwind + TypeScript / Fastify + Prisma + PostgreSQL
Auth: Better Auth por sessão/cookie
Gerenciador: pnpm
```

### Última informação de qualidade

```txt
Backend eslint: limpo
Frontend lint: limpo
```

Confirmado pelo usuário após a 4.6.6.5.

---

## ✅ Última sequência concluída

```txt
[x] 4.6.6.1 — Modelar idiomas no schema/seed/API/types
[x] 4.6.6.2 — Backend salva languageKeys no rascunho da ficha
[x] 4.6.6.3 — Criar etapa de idiomas no builder
[x] 4.6.6.4 — Validar idiomas ao finalizar ficha
[x] 4.6.6.5 — Exibir idiomas na ficha pronta
```

Commit sugerido:

```bash
git diff --stat
git status
git add .
git commit -m "feat: add character language choices"
```

---

## 📁 Arquivos relevantes recentes

### Backend

```txt
backend/prisma/schema.prisma
backend/prisma/seed.ts
backend/prisma/seed-data/languages.ts
backend/prisma/seed-data/ancestries.ts
backend/prisma/seed-data/backgrounds.ts
backend/src/routes/systems.ts
backend/src/routes/character-sheets.ts
```

### Frontend

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
frontend/src/features/character-builder/constants/character-builder-steps.ts
frontend/src/features/character-builder/types/character-builder-types.ts
frontend/src/features/character-builder/steps/CharacterLanguagesStep.tsx
frontend/src/features/character-builder/steps/CharacterReviewStep.tsx
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
```

---

## 🧩 Estado funcional atual

### Character Builder

- abre draft vazio ao criar personagem;
- salva rascunho;
- carrega rascunho;
- etapa Conceito;
- etapa Classe;
- etapa Ancestralidade;
- etapa Antecedente;
- etapa Atributos;
- etapa Perícias;
- etapa Idiomas;
- etapa Magias;
- etapa Equipamentos;
- etapa Sobre;
- etapa Revisão;
- finaliza ficha.

### Idiomas

- idiomas carregam da API de opções do sistema;
- ancestralidade/antecedente podem conceder idiomas automáticos;
- antecedente pode exigir escolhas extras;
- builder salva `draft.languageKeys`;
- POST/PATCH salvam `languageKeys`;
- finalização valida idiomas;
- review mostra idiomas;
- ficha pronta mostra idiomas no Perfil.

### Ficha pronta

- Modal dentro da mesa;
- pop-out;
- rolagens pela ficha;
- rolagens do pop-out retornam à mesa;
- status, combate, bolsa, magia, features, perfil e notas;
- idiomas no Perfil;
- imagens de equipamento em Bolsa/Combate.

---

## ⚠️ Atenções técnicas

### Arquivos grandes

Pedir versão atual do usuário antes de reescrever:

```txt
play/page.tsx
CharacterReadySheetView.tsx
character-sheets.ts
systems.ts
schema.prisma
seed.ts
```

### Regra de trabalho

Antes de commit:

```bash
git diff --stat
```

Depois:

```bash
git status
```

### Quando usar arquivo inteiro

Usar arquivo inteiro em mudanças grandes, principalmente:

```txt
page.tsx
CharacterReadySheetView.tsx
character-sheets.ts
```

### Quando usar Procure/Troque

Usar em mudanças pequenas e com âncora clara.

---

## 🔜 Próxima micro recomendada

```txt
4.6.7 — Proficiências de equipamento por fonte
```

Plano provável:

```txt
4.6.7.1 — Revisar modelagem atual de proficiências de equipamento
4.6.7.2 — Backend retorna proficiências resolvidas da ficha
4.6.7.3 — Ficha pronta calcula ataque usando proficiência real
4.6.7.4 — Review/ficha mostram fonte da proficiência
4.6.7.5 — Preparar proteções/armaduras para CA real
```

Ponto de partida provável:

```txt
backend/src/routes/character-sheets.ts
frontend/src/features/character-builder/utils/character-sheet-calculations.ts
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/features/character-builder/types/character-builder-types.ts
```

