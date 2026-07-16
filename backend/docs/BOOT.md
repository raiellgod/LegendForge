# 🚀 BOOT — LegendForge

> Atualizado para novo chat em 16/07/2026. Contexto consolidado após a macro **4.7.7 — Magias iniciais por classe/nível**.

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
- criação inicial multiclasse;
- distribuição de níveis por classe;
- classe principal;
- PV inicial multiclasse;
- features iniciais por classe/nível;
- atributos;
- perícias;
- idiomas;
- magias por classe/nível;
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
- ataque mágico;
- CD de magia;
- slots de magia;
- bloco Conjuração por classe;
- features reais;
- level up preview;
- classes por nível;
- idiomas no Perfil;
- notas avançadas.

---

## ✅ Última sequência concluída — 4.7.7 Magias iniciais por classe/nível

```txt
[x] 4.7.7.0 — Modelar limites de magia por nível
[x] 4.7.7.1 — União final das permissões de magia por classe no builder
[x] 4.7.7.2 — Backend valida magia contra múltiplas classes
[x] 4.7.7.3 — Backend salva e retorna classId/source da magia
[x] 4.7.7.4 — Frontend types recebem origem interna da magia
[x] 4.7.7.5 — Bloco de conjuração por classe na ficha pronta
```

Status:

```txt
backend eslint limpo
frontend lint limpo
páginas sem erro
ficha abre/finaliza normalmente
```

---

## 🧠 Regras oficiais de magia pós 4.7.7

```txt
Magias conhecidas ≠ magias preparadas.
Builder escolhe magias conhecidas.
Preparadas serão estado/mecânica futura da ficha.
Mago/estudioso usa premissa de grimório: conhece mais do que prepara.
Magias concedidas pelo mestre não contam em limite do builder/level up.
Magias sempre conhecidas futuramente não contam no limite comum.
```

Limites:

```txt
LevelProgressionSpellLimit.spellLevel
LevelProgressionSpellLimit.spellsKnown
LevelProgressionSpellLimit.spellsPrepared
```

Uso atual:

```txt
spellLevel 0 = truques
builder usa spellsKnown
preparação futura usa spellsPrepared
```

Multiclasse:

```txt
Builder une listas de magia das classes escolhidas.
Magia duplicada entre classes aparece uma vez só.
Backend aceita magia se qualquer classe escolhida permitir.
Backend salva classId interno em CharacterSheetSpell.
Card de magia não mostra origem por classe.
Ficha mostra bloco Conjuração por classe.
```

---

## 🧩 Arquivos alterados na 4.7.7

Prováveis arquivos tocados:

```txt
backend/prisma/schema.prisma
backend/prisma/seed.ts
backend/src/routes/systems.ts
backend/src/routes/character-sheets.ts
frontend/src/features/character-builder/types/character-builder-types.ts
frontend/src/features/character-builder/steps/CharacterSpellsStep.tsx
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
```

---

## ⚠️ Pendências e limites conhecidos

Ainda não existe:

```txt
- sincronização em tempo real
- chat persistido no banco
- rolagens persistidas no banco
- slots de magia usados/gastos
- preparação/despreparação diária de magias
- comparação automática contra CA
- ficha própria de NPC
- ficha própria de criatura/bestiário
- upload real de imagens
- level up real completo
- escolhas pendentes completas
- sub-ancestralidade implementada
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

## 🔜 Próximo passo recomendado

```txt
4.7.8 — Escolhas pendentes iniciais
```

Objetivo provável:

```txt
- mapear escolhas pendentes possíveis
- preparar subclasse pendente
- preparar magias/truques pendentes
- preparar proficiências pendentes
- preparar idiomas pendentes
- preparar base para Level Up real
```

---

## 🧭 Como continuar no novo chat

Mensagem sugerida para abrir:

```txt
Estamos continuando o LegendForge. Leia os arquivos .md atualizados e considere que a sequência 4.7.7 — Magias iniciais por classe/nível foi concluída com lints limpos. Vamos iniciar a 4.7.8 — Escolhas pendentes iniciais, mantendo passos pequenos, funcionais e testáveis.
```

Antes de commit:

```bash
git diff --stat
git status
```

Commit sugerido da sequência 4.7.7:

```bash
git add .
git commit -m "feat: support multiclass spell limits"
```
