# 🚀 BOOT — LegendForge

---

## 📌 Project

**LegendForge**  
Virtual Tabletop (VTT)

---

## ⚙️ Stack

### 🖥️ Backend

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

### 🎨 Frontend

- Next.js
- React
- Tailwind CSS
- TypeScript
- Better Auth Client
- Figma

---

## 📊 Current State — 21/05/2026

- ✅ Backend funcional com Fastify
- ✅ Docker/PostgreSQL funcionando
- ✅ Prisma configurado e conectado ao banco
- ✅ Prisma Studio funcionando
- ✅ Better Auth integrado ao banco
- ✅ Registro e login funcionando
- ✅ Sessões persistidas no banco
- ✅ Backend lendo sessão por cookie
- ✅ Frontend chamando rotas protegidas com `credentials: "include"`
- ✅ Documentação interativa via Scalar/Swagger
- ✅ Home logada `/campaigns` funcionando
- ✅ Criação inicial de campanha funcionando
- ✅ Tela `/campaigns/[id]/edit` funcional
- ✅ Página de jogo `/campaigns/[id]/play` em desenvolvimento avançado
- ✅ Mesa com atores reais via `CampaignActor`
- ✅ Tokens/cena com persistência inicial via `SceneToken`
- ✅ Sistema RPG inicial semeado com classes, ancestralidades, antecedentes, magias e equipamentos
- ✅ Rotas de ficha em `character-sheets.ts`
- ✅ Builder visual de personagem iniciado
- ✅ Rascunho de ficha salva/carrega no banco
- ✅ Classe, ancestralidade e antecedente carregam, selecionam e persistem
- ✅ Validação de avanço por etapa no builder
- ✅ Etapa Atributos criada visualmente/local
- 🚧 Próximo micro: persistir atributos no banco
- ⚠️ Backend ainda sem camada de services completa
- ⚠️ `frontend/src/app/campaigns/[id]/play/page.tsx` está grande e deve ser editado com fonte única da verdade

---

## 🎯 Next Tasks — FOCO ATUAL

### 🔥 PRIORIDADE CRÍTICA AGORA

```txt
4.15 — Persistir atributos no banco
```

Objetivo:

- Enviar atributos escolhidos no builder ao salvar rascunho.
- Criar/atualizar registros em `CharacterSheetStat`.
- Carregar atributos salvos ao abrir o builder.
- Manter o resumo lateral atualizado com dados reais persistidos.

Arquivos esperados:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
backend/src/routes/character-sheets.ts
backend/prisma/schema.prisma
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

## 🧍 Micros da Fase 4

```txt
[x] 4.1 — Planejar UX/UI da criação de personagem
[x] 4.2 — Analisar referências e definir fluxo próprio do LegendForge
[x] 4.3 — Adicionar modelos de CharacterSheet no Prisma
[x] 4.4 — Relacionar ficha com sistema, atributos, perícias, magias e equipamentos
[x] 4.5 — Criar rotas backend de CharacterSheet
[x] 4.6 — Criar menu inicial de criação de personagem
[x] 4.7 — Criar layout base do builder de personagem
[x] 4.8 — Transformar etapa Conceito em formulário real
[x] 4.9 — Salvar rascunho inicial da ficha pelo builder
[x] 4.10 — Carregar rascunho existente ao abrir o builder
[x] 4.11 — Carregar opções reais de Classe, Ancestralidade e Antecedente
[x] 4.12 — Selecionar e persistir Classe, Ancestralidade e Antecedente
[x] 4.13 — Validar avanço do builder por etapa
[x] 4.14 — Criar etapa Atributos visual/local
[próximo] 4.15 — Persistir atributos no banco
[ ] 4.16 — Etapa Perícias ligada à classe/antecedente
[ ] 4.17 — Etapa Magias ligada à classe
[ ] 4.18 — Etapa Equipamentos ligada à classe/antecedente
[ ] 4.19 — Etapa Sobre com aparência, personalidade e história
[ ] 4.20 — Etapa Revisão
[ ] 4.21 — Finalizar ficha e listar na aba Personagens
```

---

## ⚠️ Regra de trabalho para próxima conversa

Para arquivos grandes, especialmente `page.tsx` da mesa:

- Sempre usar o arquivo enviado mais recente como fonte da verdade.
- Não mandar alterações baseadas em código presumido.
- Se for alteração grande, reescrever arquivo completo.
- Se for alteração pequena, usar âncoras reais: “Procure este trecho / Troque por este trecho”.
- Antes de qualquer commit, rodar `git diff --stat`.

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

## 🚀 Estado Atual

👉 **FASE 4 — Character Builder em andamento**

O próximo chat deve começar direto no:

```txt
4.15 — Persistir atributos no banco
```
