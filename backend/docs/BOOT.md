# 🚀 BOOT — LegendForge

> Atualizado para novo chat em 07/07/2026. Contexto consolidado após a sequência 4.6.6 — Idiomas por fonte.


## 📌 Projeto

**LegendForge** — Virtual Tabletop web para RPG de mesa.

Este arquivo serve para abrir um novo chat sem perder contexto.

---

## ✅ Estado atual confirmado

### Base

- Backend Fastify funcional.
- PostgreSQL via Docker.
- Prisma configurado.
- Better Auth funcionando com sessão/cookie.
- Frontend Next.js integrado com API.
- Rotas principais de campanhas, sistemas, atores, tokens e fichas funcionando.

### Campanhas / Mesa

- `/campaigns`
- `/campaigns/create`
- `/campaigns/search`
- `/campaigns/[id]/edit`
- `/campaigns/[id]/play`
- `/campaigns/[id]/sheets/[sheetId]`

Mesa possui:

- grid/mapa;
- toolbar;
- painel direito;
- chat local;
- rolagens locais;
- atores reais;
- tokens persistidos;
- tamanho de token persistido;
- biblioteca/mesa de atores;
- ficha pronta em modal e pop-out.

### Character Builder

Etapas atuais:

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

Já funciona:

- rascunho;
- carregar rascunho;
- classe/ancestralidade/antecedente;
- atributos;
- perícias;
- idiomas;
- magias;
- equipamentos;
- sobre;
- revisão;
- finalizar ficha;
- player comum cria personagem pela mesa;
- GM mantém fluxo completo.

### Ficha pronta

Abas:

```txt
Ficha/Status
Combate
Bolsa
Magia
Features
Perfil
Notas
```

Funciona:

- modal;
- pop-out;
- rolagens via ficha;
- pop-out envia rolagens para a mesa via `postMessage`;
- ataque real por equipamento;
- dano por equipamento;
- ataque mágico real;
- CD de magia;
- slots de magia;
- features reais;
- level up preview;
- classes por nível;
- idiomas no Perfil.

---

## ✅ Última sequência concluída — 4.6.6 Idiomas por fonte

```txt
[x] 4.6.6.1 — Modelar idiomas no schema/seed/API/types
[x] 4.6.6.2 — Backend salva languageKeys no rascunho da ficha
[x] 4.6.6.3 — Criar etapa de idiomas no builder
[x] 4.6.6.4 — Validar idiomas ao finalizar ficha
[x] 4.6.6.5 — Exibir idiomas na ficha pronta
```

Status:

```txt
frontend lint limpo
backend eslint limpo
```

O usuário confirmou “sem nada nos lints / lint limpo”.

---

## 🧠 Regras da 4.6.6

Idiomas automáticos:

```txt
ancestry.languageKeys
background.languageKeys
```

Idiomas escolhidos:

```txt
draft.languageKeys
CharacterSheetLanguage.source === "builder"
```

Quantidade de escolhas:

```txt
background.languageChoiceCount
```

Validação ao finalizar:

```txt
- exige quantidade exata de idiomas extras
- impede duplicidade
- impede escolher idioma automático de novo como extra
```

---

## 🧩 Arquivos alterados na 4.6.6

Prováveis arquivos tocados:

```txt
backend/prisma/schema.prisma
backend/prisma/seed.ts
backend/prisma/seed-data/languages.ts
backend/prisma/seed-data/ancestries.ts
backend/prisma/seed-data/backgrounds.ts
backend/src/routes/systems.ts
backend/src/routes/character-sheets.ts
frontend/src/app/campaigns/[id]/play/page.tsx
frontend/src/features/character-builder/constants/character-builder-steps.ts
frontend/src/features/character-builder/types/character-builder-types.ts
frontend/src/features/character-builder/steps/CharacterLanguagesStep.tsx
frontend/src/features/character-builder/steps/CharacterReviewStep.tsx
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
```

---

## ⚠️ Pendências e limites conhecidos

Ainda não existe:

```txt
- sincronização em tempo real
- chat persistido no banco
- rolagens persistidas no banco
- slots de magia usados
- comparação automática contra CA
- ficha própria de NPC
- ficha própria de criatura/bestiário
- upload real de imagens
- level up real completo
- multiclasse completa no builder inicial
- proficiência real de equipamento aplicada por fonte
```

Ferramentas locais/visuais atuais:

```txt
pan
zoom
medição
desenho
névoa
chat
rolagens
```

---

## 📌 Próximo passo recomendado

```txt
4.6.7 — Proficiências de equipamento por fonte
```

Objetivo provável:

```txt
- transformar weaponProficiencyKeys/protectionProficiencyKeys/toolProficiencyKeys em regra consumida pela ficha
- calcular ataque de equipamento usando proficiência real
- preparar armaduras/proteções como camada mecânica separada da roupa visual
- mostrar fonte da proficiência
```

---

## 🧭 Como continuar no novo chat

Mensagem sugerida para abrir:

```txt
Estamos continuando o LegendForge. Leia os arquivos .md atualizados e considere que a sequência 4.6.6 — Idiomas por fonte foi concluída com lints limpos. Vamos iniciar a 4.6.7 — Proficiências de equipamento por fonte, mantendo passos pequenos e testáveis.
```

Antes de commit:

```bash
git diff --stat
git status
```

Commit sugerido da sequência 4.6.6:

```bash
git add .
git commit -m "feat: add character language choices"
```

