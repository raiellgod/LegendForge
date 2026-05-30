# 🚀 BOOT — LegendForge

---

## 📌 Project

**LegendForge**  
Virtual Tabletop (VTT)

---

## 📅 Current State — 29/05/2026

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
- Refatoração do builder para `features/character-builder`.
- Criar personagem pela mesa abre draft vazio.
- Player comum vê `+ Personagem` e abre o builder direto.
- GM mantém `Biblioteca` e `+ Criar`.
- Linguagem dinâmica por pronome funcionando em textos principais.
- Sincronização inicial pronome → gênero funcionando.
- Refatoração da mesa para `features/game-table`.
- Abas da mesa extraídas: Chat, Rolagens, Personagens, Diário e Mesa.
- Toolbar esquerda funcional.
- Mover visão, medir, desenhar e névoa funcionando localmente.
- Tamanho de token editável e persistido.
- Biblioteca e criação de atores restauradas na aba Personagens.
- Ficha pronta organizada em abas: Ficha/Status, Bolsa, Magia e Perfil.
- Identidade da ficha fica no header fixo.
- Ficha/Status compacta mostra todos os atributos, status, testes e perícias.
- Todas as perícias aparecem, não apenas as proficientes.
- Bolsa mostra equipamentos, moedas e ações de ataque/dano.
- Magia mostra magias agrupadas e ações básicas.
- Perfil mostra retrato, token, aparência, história, personalidade e notas.
- Retrato/token por URL com persistência e sincronização com ator/token.
- Rolagens automáticas pela ficha funcionando:
  - perícias
  - testes de resistência
  - iniciativa individual
  - iniciativa da mesa para GM
  - ataque básico de equipamento
  - dano de equipamento
  - ataque mágico básico
  - dano mágico detectado
  - efeito de magia no chat
- Teste regressivo da 4.26 concluído.

---

## ⚠️ Estado não concluído / atenção

A mesa ainda **não tem sincronização em tempo real** entre contas.

Recursos locais/visuais por enquanto:

```txt
- pan/mover visão
- zoom
- medição
- desenhos
- névoa
- chat local atual
- rolagens locais atuais
```

Persistidos no banco, mas sem atualização em tempo real automática:

```txt
- tokens na cena
- posição do token
- tamanho do token
- atores na mesa/biblioteca
- fichas/rascunhos do builder
- imagens por URL da ficha/ator/token
```

Limitações intencionais atuais:

```txt
- ataque de equipamento ainda é 1d20 + 0
- ataque mágico ainda é 1d20 + 0
- ataque ainda não compara automaticamente com CA
- NPCs e criaturas ainda não têm ficha/stat block próprios
- iniciativa de NPC/criatura usa +0
- dano mágico é detectado por texto/descrição de forma provisória
```

Regra futura já decidida:

```txt
Player só deve ver tokens/mapa em áreas liberadas pela névoa.
```

Hoje a névoa está local/visual. Persistência/sincronização virão depois.

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
[x] 4.22 — Refatoração do Character Builder
[x] 4.23 — Refatoração da Mesa de Jogo
[x] 4.24 — Personagens ativos, biblioteca e ciclo de vida de atores
[x] 4.25 — Ficha pronta com abas, perfil, bolsa, magia e imagens por URL
[x] 4.26 — Rolagens automáticas pela ficha pronta
[próximo] 4.27 — Regras avançadas de sistema/ficha
[planejado] 4.28 — Multiclasse
```

---

## ✅ Fase 4.25 — Ficha pronta

```txt
[x] 4.25.1 — Preparar visualização de ficha pronta
[x] 4.25.x — Organizar ficha em abas: Ficha/Status, Bolsa, Magia, Perfil
[x] 4.25.x — Mover identidade para header fixo
[x] 4.25.x — Compactar Ficha/Status
[x] 4.25.x — Mostrar todas as perícias
[x] 4.25.x — Separar Bolsa com equipamentos/moedas
[x] 4.25.x — Separar Magia com magias/truques
[x] 4.25.x — Separar Perfil com imagem/token/narrativa
[x] 4.25.x — Persistir retrato/token por URL
[x] 4.25.x — Teste regressivo da ficha pronta
```

---

## ✅ Fase 4.26 — Rolagens automáticas pela ficha

```txt
[x] 4.26.1 — Preparar contrato de rolagem automática da ficha
[x] 4.26.2 — Clicar em perícia rola 1d20 + bônus
[x] 4.26.3 — Clicar em teste de resistência rola 1d20 + bônus
[x] 4.26.4 — Clicar em iniciativa rola 1d20 + iniciativa
[x] 4.26.5 — Botão do GM para rolar iniciativa em massa
[x] 4.26.6 — Melhorar ranking de iniciativa e preparar ordem de combate
[x] 4.26.6.1 — Incluir personagens no ranking e remover emojis
[x] 4.26.6.2 — Usar iniciativa real dos personagens no ranking
[x] 4.26.7 — Dano por equipamento clicável
[x] 4.26.7.1 — Separar botões Ataque e Dano no card de equipamento
[x] 4.26.8 — Magias clicáveis visualmente e rolagem básica de magia
[x] 4.26.9 — Revisão UX/UI das rolagens
[x] 4.26.10 — Teste regressivo da 4.26
[x] 4.26.12 — Corrigir criação de personagem para player comum
[pendente] 4.26.13 — Commit da 4.26
```

---

## 🎯 Próxima conversa deve começar por

```txt
4.26.13 — Commit da 4.26
```

Comandos esperados:

```bash
git status
git diff --stat
cd frontend
pnpm lint
cd ..
git add .
git status
git commit -m "feat: add ready sheet roll actions"
```

Depois seguir para:

```txt
4.27 — Regras avançadas de sistema/ficha
```

Primeiro micro sugerido:

```txt
4.27.1 — Mapear regras atuais de classe, magia, progressão e ficha pronta
```

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
- Mudança grande = arquivo completo.
- Mudança pequena = usar âncoras reais.
- Não presumir estrutura antiga.
- Antes de commit: `git diff --stat`.

---

## 🚀 Estado Atual

👉 **Fase 4.26 concluída funcionalmente. Próximo passo imediato: commit da 4.26. Depois iniciar 4.27 — regras avançadas de sistema/ficha.**
