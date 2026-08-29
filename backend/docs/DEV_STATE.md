# 📊 DEV STATE — LegendForge

> Atualizado para novo chat em 16/07/2026. Contexto consolidado após a macro **4.7.7 — Magias iniciais por classe/nível**.

## 📅 Last Update

16/07/2026

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
Página/ficha: sem erros aparentes
Ficha: abre e finaliza normalmente
```

Confirmado pelo usuário após a conclusão da 4.7.7.

---

## ✅ Última sequência concluída

```txt
[x] 4.7.7.0 — Modelar limites de magia por nível
[x] 4.7.7.1 — União final das permissões de magia por classe no builder
[x] 4.7.7.2 — Backend valida magia contra múltiplas classes
[x] 4.7.7.3 — Backend salva e retorna classId/source da magia
[x] 4.7.7.4 — Frontend types recebem origem interna da magia
[x] 4.7.7.5 — Bloco de conjuração por classe na ficha pronta
```

Commit sugerido:

```bash
git diff --stat
git status
git add .
git commit -m "feat: support multiclass spell limits"
```

---

## 📁 Arquivos relevantes recentes

### Backend

```txt
backend/prisma/schema.prisma
backend/prisma/seed.ts
backend/src/routes/systems.ts
backend/src/routes/character-sheets.ts
```

### Frontend

```txt
frontend/src/features/character-builder/types/character-builder-types.ts
frontend/src/features/character-builder/steps/CharacterSpellsStep.tsx
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
- distribuição de níveis por classe;
- classe principal;
- multiclasse inicial;
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

### Multiclasse inicial

- `classEntries` no draft;
- `CharacterSheetClass` no banco;
- `CharacterSheet.level` como nível total;
- `CharacterSheetClass.level` como nível por classe;
- PV inicial por classe usando dado máximo + CON por nível;
- features iniciais por classe/nível.

### Magias pós 4.7.7

- `LevelProgressionSpellLimit` modelado.
- Seed preenche `spellLimits`.
- API de opções retorna `spellLimits`.
- Frontend types aceitam `spellLimits`.
- Builder usa `spellsKnown` por nível de magia.
- Builder não usa `spellsPrepared` para limite de escolha.
- Preparadas ficam para mecânica futura.
- Lista de magias é união das classes escolhidas.
- Magia duplicada entre classes aparece uma vez só.
- Backend valida magia contra qualquer classe escolhida.
- Backend salva `CharacterSheetSpell.classId`.
- Backend retorna `classId` e `characterClass` em cada magia da ficha.
- Frontend types aceitam origem interna.
- Ficha mostra bloco Conjuração por classe.
- Cards de magia continuam limpos, sem origem visual por card.

### Ficha pronta

- modal dentro da mesa;
- pop-out;
- rolagens pela ficha;
- rolagens do pop-out retornam à mesa;
- status, combate, bolsa, magia, features, perfil e notas;
- bloco Conjuração por classe;
- idiomas no Perfil;
- imagens de equipamento em Bolsa/Combate.

---

## ⚠️ Atenções técnicas

### Arquivos grandes

Pedir versão atual do usuário antes de reescrever:

```txt
play/page.tsx
CharacterReadySheetView.tsx
CharacterSpellsStep.tsx
character-sheets.ts
systems.ts
schema.prisma
seed.ts
```

### Regra de trabalho

Antes de commit:

```bash
git diff --stat
git status
```

### Quando usar arquivo inteiro

Usar arquivo inteiro em mudanças grandes, principalmente:

```txt
page.tsx
CharacterReadySheetView.tsx
CharacterSpellsStep.tsx
character-sheets.ts
```

### Quando usar Procure/Troque

Usar em mudanças pequenas e com âncora clara.

---

## 🔜 Próxima micro recomendada

```txt
4.7.8 — Escolhas pendentes iniciais
```

Plano provável:

```txt
4.7.8.1 — Mapear escolhas pendentes possíveis
4.7.8.2 — Subclasse pendente
4.7.8.3 — Magias/truques pendentes
4.7.8.4 — Proficiências pendentes
4.7.8.5 — Línguas pendentes
4.7.8.6 — Atributos/talentos futuramente
```

Ponto de partida provável:

```txt
backend/src/routes/character-sheets.ts
backend/src/routes/systems.ts
frontend/src/features/character-builder/types/character-builder-types.ts
frontend/src/features/character-builder/steps/CharacterReviewStep.tsx
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/app/campaigns/[id]/play/page.tsx
```
