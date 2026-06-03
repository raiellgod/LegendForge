# 🚀 BOOT — LegendForge

---

## 📌 Project

**LegendForge**  
Virtual Tabletop (VTT)

---

## 📅 Current State — 03/06/2026

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
- Nova rota `/campaigns/[id]/sheets/[sheetId]` criada para pop-out da ficha.
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
- Ficha pronta refatorada com `CharacterReadySheetView`.
- `CharacterReadySheetModal` virou casca do modal.
- A ficha pronta abre no modal e também em pop-out.
- Pop-out carrega dados reais da ficha e do ator.
- Pop-out envia rolagens para a mesa via `postMessage`.
- Topo compacto da ficha funcionando.
- Ficha pronta organizada em abas:
  - Ficha/Status
  - Combate
  - Bolsa
  - Magia
  - Features
  - Perfil
  - Notas
- Ficha/Status reorganizada para leitura rápida.
- Bolsa com cards compactos e expansíveis.
- Magia com cards compactos e expansíveis.
- Magias separadas em Truques e Magias por nível.
- Perfil focado em imagens e dados narrativos.
- Notas separadas do Perfil.
- Retrato/token por URL com persistência e sincronização com ator/token.
- Imagens da ficha ajustadas para `next/image` com `unoptimized`.
- Rolagens automáticas pela ficha funcionando:
  - perícias
  - testes de resistência
  - iniciativa individual
  - iniciativa da mesa para GM
  - ataque básico de equipamento
  - dano de equipamento
  - ataque mágico real para classe conjuradora
  - dano mágico detectado
- Regras avançadas de magia/progressão inicial funcionando:
  - `spellcastingAbilityKey` em classe
  - `LevelProgression` por classe/nível
  - `ClassSpell` para magias por classe
  - filtro de magia por classe no builder
  - validação de limite de truques/magias por progressão
  - CD de magia real
  - ataque mágico real
  - slots de magia exibidos na ficha pronta
- Resultado grande da rolagem corrigido para mostrar o total numérico.
- Teste regressivo da 4.28 concluído com zero erros.

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
- ataque ainda não compara automaticamente com CA
- NPCs e criaturas ainda não têm ficha/stat block próprios
- iniciativa de NPC/criatura usa +0
- dano mágico ainda é detectado por texto/descrição de forma provisória
- controle de slots usados ainda não existe
- chat precisa de revisão UX/UI depois do pop-out
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
[ ] Fase 9 — Combate e iniciativa
[ ] Fase 10 — Cenas/mapas múltiplos
[ ] Fase 11 — Bestiário completo
[ ] Fase 12 — Inventário, lojas e economia
[ ] Fase 13 — Sistema de efeitos/status
[ ] Fase 14 — Permissões avançadas e moderação
[ ] Fase 15 — Deploy/produção
[ ] Fase 16 — Polimento de portfolio/produto
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
[x] 4.27 — Regras avançadas de magia e progressão inicial
[x] 4.28.1 — Planejar arquitetura da ficha pop-out
[x] 4.28.2 — Criar rota própria da ficha pronta carregando dados reais
[x] 4.28.3 — Reaproveitar ficha completa dentro do pop-out
[x] 4.28.4 — Conectar rolagens do pop-out ao chat da mesa via postMessage
[x] 4.28.5 — Extrair miolo da ficha para CharacterReadySheetView
[x] 4.28.6 — Criar topo fixo compacto da ficha
[x] 4.28.7 — Reorganizar Ficha/Status para leitura rápida
[x] 4.28.8 — Reorganizar aba Magia com cards expansíveis
[x] 4.28.9 — Reorganizar aba Bolsa com cards expansíveis
[x] 4.28.10 — Preparar abas futuras: Combate, Features e Notas
[x] 4.28.11 — Revisar responsividade da ficha pop-out
[x] 4.28.12 — Teste regressivo da ficha pop-out
[x] 4.28.13 — Atualizar documentação da 4.28
[próximo] 4.28.14 — Revisar UX/UI do chat após ficha pop-out
[pendente] 4.28.15 — Commit da 4.28
[planejado] 4.29 — Regras avançadas de equipamento, features e level up
[planejado] 4.30 — Multiclasse
```

---

## ✅ Fase 4.28 — Refatoração estrutural da ficha pronta

Objetivo:

```txt
Transformar a ficha pronta em uma ferramenta real de mesa: rápida, compacta, reutilizável, responsiva e acessível em pop-out.
```

Micros concluídas:

```txt
[x] 4.28.1 — Planejar arquitetura da ficha pop-out
[x] 4.28.2 — Criar rota própria da ficha pronta carregando dados reais
[x] 4.28.3 — Reaproveitar ficha completa dentro do pop-out
[x] 4.28.4 — Conectar rolagens do pop-out ao chat da mesa via postMessage
[x] 4.28.5 — Extrair miolo da ficha para CharacterReadySheetView
[x] 4.28.6 — Criar topo fixo compacto da ficha
[x] 4.28.7 — Reorganizar Ficha/Status para leitura rápida
[x] 4.28.8 — Reorganizar aba Magia com cards expansíveis
[x] 4.28.9 — Reorganizar aba Bolsa com cards expansíveis
[x] 4.28.10 — Preparar abas futuras: Combate, Features e Notas
[x] 4.28.11 — Revisar responsividade da ficha pop-out
[x] 4.28.12 — Teste regressivo da ficha pop-out
[x] 4.28.13 — Atualizar documentação da 4.28
[próximo] 4.28.14 — Revisar UX/UI do chat após ficha pop-out
[pendente] 4.28.15 — Commit da 4.28
```

Arquitetura atual da ficha:

```txt
CharacterReadySheetView
- miolo real da ficha
- usado no modal
- usado no pop-out

CharacterReadySheetModal
- casca de modal dentro da mesa

/campaigns/[id]/sheets/[sheetId]
- rota pop-out
- carrega dados reais
- usa CharacterReadySheetView

/campaigns/[id]/play
- mesa
- chat
- listener de postMessage
```

---

## 🎯 Próxima conversa deve começar por

```txt
4.28.14 — Revisar UX/UI do chat após ficha pop-out
```

Objetivo:

```txt
Limpar o chat para suportar melhor rolagens vindas da ficha, mensagens públicas, sussurros e eventos sem poluir a tela.
```

Depois seguir para:

```txt
4.28.15 — Commit da 4.28
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
git commit -m "feat: refactor ready sheet popout"
```

---

## 🛠️ Comandos úteis

### Backend

```bash
cd backend
docker compose up -d
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm run dev
```

### Prisma Studio

```bash
cd backend
pnpm prisma studio
```

### Seed

```bash
cd backend
pnpm prisma db seed
```

Fallback:

```bash
cd backend
pnpm tsx prisma/seed.ts
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Lint

```bash
cd frontend
pnpm lint
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
frontend/src/app/campaigns/[id]/sheets/[sheetId]/page.tsx
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/features/character-builder/components/CharacterReadySheetModal.tsx
```

Regra:

```txt
Mudança grande = arquivo inteiro.
Mudança pequena = âncoras reais “Procure este trecho / Troque por este trecho”.
Não usar estrutura presumida antiga.
Antes de qualquer commit = git diff --stat.
```

---

## 🚀 Estado Atual

👉 **Fase 4.28 concluída funcionalmente até documentação. Próximo passo imediato: 4.28.14 — revisar UX/UI do chat após ficha pop-out. Depois commit da 4.28.**
