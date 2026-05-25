# 🚀 BOOT — LegendForge

---

## 📌 Project

**LegendForge**  
Virtual Tabletop (VTT)

---

## 📅 Current State — 24/05/2026

Este documento serve para reiniciar a próxima conversa sem perder contexto.

---

## ⚙️ Stack

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
- Docker
- pnpm

### Frontend

- Next.js
- React
- Tailwind CSS
- TypeScript
- Better Auth Client
- Figma

---

## ✅ Estado confirmado

- Backend funcional com Fastify.
- Docker/PostgreSQL funcionando.
- Prisma configurado e conectado.
- Better Auth integrado ao banco.
- Registro/login funcionando.
- Sessão via cookie funcionando.
- Frontend chama API com `credentials: "include"`.
- Scalar/Swagger funcionando.
- Campanhas reais implementadas.
- Página `/campaigns/[id]/play` em desenvolvimento avançado.
- Mesa com `CampaignActor`.
- Tokens/cena com `SceneToken`.
- Sistema RPG base semeado.
- Rotas de `character-sheets.ts` e `systems.ts`.
- Builder de personagem com etapas reais.
- Rascunho salva/carrega.
- Classe, ancestralidade e antecedente persistem.
- Atributos persistidos.
- Perícias persistidas.
- Magias persistidas.
- Equipamentos iniciais funcionando.
- Sobre/aparência/personalidade/história funcionando.
- Revisão visual implementada.
- Refatoração parcial do builder para `features/character-builder`.

---

## ⚠️ Estado não concluído / atenção

Não marcar 4.22.18 como concluída ainda.

Problema atual:

```txt
Ao clicar em + Criar → Criar personagem, o builder ainda pode abrir com dados antigos de rascunho/personagem existente.
```

Objetivo imediato:

```txt
Corrigir fluxo de criar personagem do zero para abrir draft vazio.
```

Também foram planejados, mas ainda precisam implementação/teste:

```txt
4.22.18.3 — Limpar valores padrão do rascunho inicial
4.22.18.4 — Linguagem dinâmica por pronome
4.22.18.5 — Sincronizar pronome com gênero inicial
```

---

## 🧩 Macros do projeto

```txt
[x] Fase 0 — Base inicial
[x] Fase 1 — Mesa com atores reais
[x] Fase 2 — Tokens reais na cena
[x] Fase 3 — Regras base do sistema
[em andamento] Fase 4 — Criação/ficha de personagem
[ ] Fase 5 — Biblioteca completa
[ ] Fase 6 — Diário real
[ ] Fase 7 — Configurações da campanha/mesa
[ ] Fase 8 — Sincronização em tempo real
```

---

## 🧍 Fase 4 — Estado macro

```txt
[x] 4.1 — Planejar UX/UI da criação de personagem
[x] 4.2 — Analisar referências e definir fluxo próprio
[x] 4.3 — Adicionar modelos de CharacterSheet no Prisma
[x] 4.4 — Relacionar ficha com sistema, atributos, perícias, magias e equipamentos
[x] 4.5 — Criar rotas backend de CharacterSheet
[x] 4.6 — Criar menu inicial de criação de personagem
[x] 4.7 — Criar layout base do builder
[x] 4.8 — Transformar etapa Conceito em formulário real
[x] 4.9 — Salvar rascunho inicial
[x] 4.10 — Carregar rascunho existente
[x] 4.11 — Carregar opções reais de Classe, Ancestralidade e Antecedente
[x] 4.12 — Selecionar e persistir Classe, Ancestralidade e Antecedente
[x] 4.13 — Validar avanço por etapa
[x] 4.14 — Criar etapa Atributos visual/local
[x] 4.15 — Persistir atributos no banco
[x] 4.16 — Perícias reais/persistidas
[x] 4.17 — Magias/truques persistidos
[x] 4.18 — Equipamentos iniciais
[x] 4.19 — Sobre/aparência/personalidade/história
[x] 4.20 — Revisão/finalização visual
[x] 4.21 — Planejamento/refatoração
[em andamento] 4.22 — Refatoração do Character Builder
```

---

## 🔧 Fase 4.22 — Refatoração atual

```txt
[x] 4.22.1 — Criar estrutura features/character-builder
[x] 4.22.2 — Extrair types
[x] 4.22.3 — Extrair constants
[x] 4.22.4 — Extrair steps config
[x] 4.22.5 — Extrair utils de atributos
[x] 4.22.6 — Extrair utils de perícias
[x] 4.22.7 — Extrair utils de magias
[x] 4.22.8 — Extrair utils de equipamentos
[x] 4.22.9 — Extrair utils de sobre/about
[x] 4.22.10 — Extrair componentes genéricos do builder
[x] 4.22.11 — Extrair componentes da revisão
[x] 4.22.12 — Extrair etapa Conceito
[x] 4.22.13 — Extrair etapa Atributos
[x] 4.22.14 — Extrair etapa Perícias
[x] 4.22.15 — Extrair etapa Magias
[x] 4.22.16 — Extrair etapa Equipamentos
[x] 4.22.17 — Extrair etapa Sobre
[em andamento] 4.22.18 — Extrair/Revisar etapa Revisão e corrigir criação vazia
[ ] 4.22.18.3 — Limpar valores padrão do rascunho inicial
[ ] 4.22.18.4 — Linguagem dinâmica por pronome
[ ] 4.22.18.5 — Sincronizar pronome com gênero inicial
[ ] 4.22.19 — Limpeza final de imports/funções mortas do page.tsx
[ ] 4.22.20 — Teste regressivo completo do builder
[ ] 4.22.21 — Commit da refatoração do builder
```

---

## 🎯 Próxima conversa deve começar por

```txt
Corrigir 4.22.18.3:
Criar personagem do zero deve abrir CharacterBuilderDraft vazio, sem carregar rascunho antigo.
```

Passos esperados:

1. Usar o último `page.tsx` enviado pelo usuário como fonte única da verdade.
2. Procurar a função ligada ao botão `Criar personagem`.
3. Garantir que ela não chame `handleLoadCharacterBuilderDraft()`.
4. Criar/usar `createEmptyCharacterBuilderDraft()`.
5. Limpar `savedCharacterSheetId`, `savedCharacterSheetStatus`, erro/sucesso.
6. Carregar somente opções do sistema.
7. Testar abrindo do zero.
8. Só depois implementar linguagem dinâmica por pronome e sincronização gênero.

---

## 🛠️ Comandos úteis

### Backend

```bash
cd backend
docker compose up -d
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm run dev
```

### Prisma Studio

```bash
cd backend
pnpm prisma studio
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Limpar cache do Next

```bash
cd frontend
rm -rf .next
pnpm run dev
```

### Commit padrão do usuário

```bash
git status
git diff --stat
git add <arquivos>
git commit -m "mensagem"
```

---

## ⚠️ Regra de trabalho

Para arquivos grandes, especialmente:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
```

- Sempre usar o arquivo enviado mais recente como fonte da verdade.
- Mudança grande = reescrever arquivo completo.
- Mudança pequena = usar âncoras reais.
- Não presumir estrutura antiga.
- Antes de commit: `git diff --stat`.

---

## 🚀 Estado Atual

👉 **Fase 4.22.18 em andamento, com correção pendente no fluxo de criação de personagem vazio.**
