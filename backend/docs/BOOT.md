# 🚀 BOOT — LegendForge

---

## 📌 Project

**LegendForge**  
Virtual Tabletop (VTT)

---

## 📅 Current State — 08/06/2026

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
- Regras avançadas da 4.29 funcionando:
  - ataques reais por equipamento
  - campos estruturados em `Equipment`
  - aba Combate com ataques equipados
  - CA manual visível apenas para GM
  - features reais na aba Features
  - subclasse liberada no nível correto
  - Level Up preview visual com mudanças do próximo nível
- Fundação de multiclasse da 4.30 funcionando:
  - `CharacterSheetClass` criado
  - fichas novas sincronizam classe principal
  - backfill das fichas antigas executado
  - API retorna `characterSheet.classes[]`
  - ficha pronta exibe classes e níveis por classe
  - proficiência usa nível total
  - features usam nível individual da classe
  - magia usa classe conjuradora ativa
  - Level Up permite escolher visualmente qual classe receberia o próximo nível
  - subclasse é avaliada por classe escolhida

- Seed modularizado em `backend/prisma/seed-data`.
- Conteúdo base expandido na 4.31.
- `Equipment.imageUrl` funcionando.
- Placeholders de imagem preenchidos no seed de equipamentos.
- Ficha pronta mostra imagem/inicial de equipamento na Bolsa e no Combate.
- Teste regressivo final da Fase 4 concluído no nível atual.

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
- ataque de equipamento já usa bônus real na ficha
- ataque ainda não compara automaticamente com CA; GM pode informar CA manual como referência
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
[x] Fase 4 — Criação/ficha de personagem
[planejado] Fase 4.5 — Revisão estrutural de regras de personagem/equipamento
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
[x] 4.29.1 — Revisar modelagem de ataques reais por equipamento
[x] 4.29.2 — Adicionar/confirmar campos necessários em Equipment para ataque
[x] 4.29.3 — Ajustar seed de equipamentos ofensivos
[x] 4.29.4 — Calcular ataque real por equipamento na ficha
[x] 4.29.5 — Exibir ataque real na aba Bolsa/Combate
[x] 4.29.6 — Preparar ataque contra CA manual
[x] 4.29.7 — Revisar modelagem de Feature por nível
[x] 4.29.8 — Exibir Features reais na aba Features
[x] 4.29.9 — Preparar subclasse no nível correto
[x] 4.29.10 — Planejar fluxo de Level Up
[x] 4.29.11 — Criar primeira versão do botão Level Up
[x] 4.29.12 — Level Up mostra apenas pendências/mudanças do novo nível
[x] 4.29.13 — Teste regressivo da 4.29
[x] 4.29.14 — Atualizar documentação
[x] 4.29.15 — Commit da 4.29
[x] 4.30.1 — Revisar modelagem de nível total vs níveis de classe
[x] 4.30.2 — Criar modelo CharacterSheetClass / níveis de classe
[x] 4.30.3 — Sincronizar classe principal em CharacterSheetClass
[x] 4.30.3.1 — Backfill das fichas antigas para CharacterSheetClass
[x] 4.30.4 — Ajustar backend para carregar classes da ficha
[x] 4.30.5 — Ajustar types/frontend para múltiplas classes na ficha pronta
[x] 4.30.6 — Atualizar ficha pronta para exibir níveis por classe
[x] 4.30.7 — Ajustar cálculo de proficiência pelo nível total
[x] 4.30.8 — Ajustar features por classe/nível de classe
[x] 4.30.9 — Ajustar magia/progressão considerando classe específica
[x] 4.30.10 — Atualizar Level Up para escolher classe existente ou nova classe
[x] 4.30.11 — Preparar escolha de subclasse por classe
[x] 4.30.12 — Teste regressivo da multiclasse
[em andamento] 4.30.13 — Atualizar documentação
[próximo] 4.30.14 — Commit da 4.30
[planejado] 4.31 — Modularização e expansão do conteúdo base do sistema
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

## ✅ Fase 4.29 — Regras avançadas de equipamento, features e Level Up

A 4.29 consolidou a primeira camada de regras avançadas para uso real da ficha pronta em mesa.

### Equipamentos e ataques reais

- `Equipment` recebeu campos estruturados para ataque:
  - `damageFormula`
  - `damageType`
  - `attackType`
  - `attackAbilityKey`
  - `alternativeAbilityKey`
  - `weaponGroup`
  - `normalRange`
  - `longRange`
  - `isFinesse`
  - `isThrown`
  - `isTwoHanded`
  - `isVersatile`
  - `versatileDamageFormula`
  - `attackBonus`
  - `damageBonus`
- O seed de equipamentos ofensivos foi atualizado.
- A ficha pronta calcula ataque real por equipamento usando atributo, proficiência temporária e bônus do item.
- A aba Combate exibe os ataques equipados.
- A aba Bolsa continua exibindo ataques/danos como inventário de uso rápido.
- GM possui campo manual de CA do alvo na aba Combate.
- Player não vê nem preenche a CA exata do alvo.
- Comparação automática contra CA ainda não existe; por enquanto a CA aparece apenas como referência no texto da rolagem do GM.

### Features reais

- As rotas de ficha retornam `features` reais disponíveis para a ficha.
- A aba Features exibe recursos/traços por origem:
  - classe
  - subclasse
  - ancestralidade
  - outras fontes futuras
- Features são exibidas como texto mecânico/narrativo.
- Aplicação automática de efeitos de features ainda é futura.

### Subclasse por nível correto

- `CharacterClass.subclassSelectionLevel` foi adicionado.
- O seed define o nível de escolha de subclasse.
- O backend valida que uma subclasse só pode ser escolhida no nível correto.
- A subclasse precisa pertencer à classe escolhida.
- A ficha mostra status de subclasse: indisponível, pendente ou escolhida.

### Level Up preview

- A aba Features recebeu botão Level Up.
- O Level Up abre como modal dentro da ficha pronta/pop-out.
- O modal ainda não salva alterações.
- O backend envia `levelUpPreview` com:
  - nível atual
  - próximo nível
  - progressão atual
  - próxima progressão
  - features novas do próximo nível
  - status de subclasse
- A decisão arquitetural ficou registrada: nível do personagem é diferente de nível de classe.
- O Level Up real precisará futuramente permitir subir uma classe existente ou adicionar multiclasse.
- Ancestralidade, antecedente, equipamentos iniciais e origem do personagem não são reprocessados no Level Up.

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
git commit -m "feat: add multiclass foundation"
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

👉 **Fase 4.30 concluída funcionalmente até teste regressivo. Próximo passo imediato: 4.30.13 documentação e 4.30.14 commit da multiclasse.**


---

# 🧩 Atualização — Fase 4.30 Multiclasse

## ✅ Implementado na 4.30

- `CharacterSheetClass` criado para separar nível total do personagem dos níveis por classe.
- Fichas novas sincronizam classe principal em `CharacterSheetClass`.
- Backfill manual executado para fichas antigas que já tinham `classId`.
- Backend carrega `characterSheet.classes[]` junto da ficha pronta.
- Frontend recebeu tipos para múltiplas classes na ficha pronta.
- Aba Features mostra classes da ficha com nível individual e classe principal.
- Proficiência continua usando o nível total do personagem (`CharacterSheet.level`).
- Features de classe/subclasse passam a considerar o nível individual de cada classe em `CharacterSheetClass`.
- Magia/progressão usa uma classe conjuradora ativa baseada em `characterSheet.classes`.
- CD de magia e ataque mágico continuam usando proficiência pelo nível total.
- Modal Level Up permite escolher visualmente qual classe existente receberia o próximo nível.
- Opção futura “Adicionar nova classe” aparece preparada, mas ainda desabilitada.
- Modal Level Up mostra status de subclasse por classe escolhida.
- 4.30.12 — Teste regressivo da multiclasse concluído no nível atual.

## ⚠️ Limitações intencionais da 4.30

- Level Up ainda não salva alterações.
- Ainda não existe PATCH real para subir nível total + nível de classe.
- Adicionar uma nova classe de multiclasse ainda não está liberado.
- Escolha real de subclasse no Level Up ainda não salva.
- Slots combinados de magia multiclasse ainda não foram implementados.
- Controle de slots usados ainda não existe.
- A estrutura antiga `CharacterSheet.classId/subclassId/level` foi mantida por compatibilidade durante a transição.

## 🎯 Próximo foco

```txt
4.31.7 — Atualizar documentação final da Fase 4
4.31.8 — Commit de fechamento da Fase 4
Depois do commit: abrir Fase 4.5
```

---

# 🧩 4.31 — Modularização e expansão do conteúdo base do sistema

## Resultado

A 4.31 modularizou e expandiu o conteúdo base do sistema sem iniciar ainda as refatorações estruturais maiores que ficaram para a Fase 4.5.

## Backend / Prisma

- `backend/prisma/seed.ts` passou a atuar como orquestrador.
- Dados do seed foram separados em `backend/prisma/seed-data/`.
- Arquivos de dados criados/organizados por domínio:
  - `ancestries.ts`
  - `backgrounds.ts`
  - `classes.ts`
  - `subclasses.ts`
  - `stats.ts`
  - `skills.ts`
  - `spells.ts`
  - `class-spells.ts`
  - `equipment.ts`
  - `features.ts`
- `Equipment.imageUrl` foi adicionado ao schema.
- Foi criada migration para `imageUrl`.
- O seed de equipamentos passou a preencher placeholders como `/images/equipment/<key>.png`.

## Conteúdo expandido

- Skills novas, incluindo opções ligadas a Força além de Atletismo.
- Antecedentes revisados para usar skills novas.
- Ancestralidades adicionais.
- Subclasses adicionais.
- Equipamentos adicionais.
- Magias adicionais.
- Vínculos classe-magia revisados.
- Features de ancestralidade, classe e subclasse adicionadas.

## Frontend

- `CharacterBuilderEquipmentOption` recebeu `imageUrl`.
- A ficha pronta passou a exibir imagem ou fallback por inicial nos cards de equipamento.
- Aba Combate mostra imagem/inicial nos ataques por equipamento.
- Aba Bolsa mostra imagem/inicial nos itens.
- Fallback evita quebra enquanto as imagens reais ainda não existem.

## Limite proposital

A 4.31 não implementou ainda:

- proficiência real por grupo de arma/proteção/ferramenta;
- escolha real de equipamento inicial;
- revisão profunda de ARMOR/proteção/revestimento no domínio;
- sistema de roupa visual separado da proteção mecânica;
- lojas/inventário avançado.

Esses pontos foram movidos para a Fase 4.5.


---

# ✅ Fase 4 — Fechamento

A Fase 4 foi concluída no nível atual com a criação/ficha de personagem funcionando como base jogável de mesa.

## Entregas finais consolidadas

- Character Builder persistido e organizado por etapas.
- Ficha pronta reutilizável em `CharacterReadySheetView`.
- Ficha em modal e pop-out.
- Rolagens automáticas pela ficha.
- Regras avançadas de magia/progressão inicial.
- Ataques reais por equipamento no nível atual.
- Features reais por classe, subclasse e ancestralidade.
- Level Up preview visual.
- Fundação de multiclasse com `CharacterSheetClass`.
- Seed modularizado em `backend/prisma/seed-data`.
- Conteúdo base expandido:
  - ancestralidades;
  - antecedentes;
  - perícias;
  - subclasses;
  - equipamentos;
  - magias;
  - vínculos classe-magia;
  - features.
- `Equipment.imageUrl` adicionado ao banco.
- Seed de equipamentos com placeholders de imagem.
- Ficha pronta exibindo imagem/inicial de equipamento em Bolsa e Combate.
- Teste regressivo final da Fase 4 concluído no nível atual.

## Decisão importante

Algumas decisões estruturais cresceram além da Fase 4 e foram movidas para uma fase intermediária antes da Fase 5.

```txt
[planejado] Fase 4.5 — Revisão estrutural de regras de personagem/equipamento
```

A Fase 4.5 será construída junto com o usuário e deve discutir/refatorar, entre outras coisas:

- proficiências reais de equipamento por classe;
- grupos de armas/proteções/ferramentas;
- escolhas de equipamento inicial no builder;
- armaduras como proteção/revestimento aplicado, não roupa visual;
- diferença entre roupa/aparência e equipamento mecânico;
- categorias de equipamento próprias do LegendForge;
- impacto em ficha pronta, inventário, lojas, combate e Level Up;
- outras decisões estruturais que ficaram grandes demais para fechar dentro da Fase 4.

---

# 🎯 Próximo foco

```txt
4.31.7 — Atualizar documentação final da Fase 4
4.31.8 — Commit de fechamento da Fase 4
Depois do commit: abrir Fase 4.5
```
