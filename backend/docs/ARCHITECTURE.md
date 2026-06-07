# 🏗️ ARCHITECTURE — LegendForge

---

## 🎯 Project Vision

**LegendForge** é um Virtual Tabletop (VTT) moderno para RPG de mesa, construído como produto real e como portfólio full-stack.

O projeto é inspirado em VTTs como Roll20 e Foundry VTT, mas segue uma identidade própria:

- 🧩 Sistema agnóstico e expansível
- 🎲 Campanhas customizáveis
- 👥 Experiência real de jogo entre usuários
- 📄 Criação de personagens persistida
- 🧠 Arquitetura real de produto full-stack
- ⚙️ Desenvolvimento incremental, testável e com mentalidade de produção
- 🎲 Ficha pronta voltada para uso real na mesa
- 🪟 Ficha pronta destacável em pop-out, conectada ao chat da mesa
- 🪄 Regras de conjuração conectadas a progressão de classe
- ⚔️ Ataques reais por equipamento conectados à ficha
- ✨ Features reais exibidas por origem e nível
- ⬆️ Level Up preview dentro da ficha pronta com base para multiclasse

---

## 💡 Development Philosophy

> Desenvolvimento incremental com mentalidade de produção.

Princípios:

- Pequenos passos funcionais.
- Cada micro deve ser testável.
- Refatoração contínua.
- Backend e banco como fonte de verdade.
- Evitar mock circular.
- Código deve servir ao domínio.
- UI deve aproximar o produto de algo jogável.
- Arquivos grandes exigem fonte única da verdade.
- Antes de qualquer commit Git: sempre rodar `git diff --stat`.

---

## 🧭 Source-of-truth workflow para código grande

Regra atual para arquivos grandes, principalmente:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
frontend/src/app/campaigns/[id]/sheets/[sheetId]/page.tsx
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/features/character-builder/components/CharacterReadySheetModal.tsx
```

- Para mudança grande: reescrever o arquivo inteiro baseado no último arquivo enviado pelo usuário.
- Para mudança pequena: usar âncoras reais do arquivo atual no estilo “Procure este trecho / Troque por este trecho”.
- Não usar código presumido de versões antigas.
- Quando refatorar fluxos grandes, manter um único arquivo atual como fonte da verdade.
- Para ficha pronta, a fonte principal atual é `CharacterReadySheetView.tsx`.

---

## 📦 Repository Structure — Estado atual

```txt
LegendForge/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── generated/
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── get-authenticated-session.ts
│   │   │   └── prisma.ts
│   │   ├── routes/
│   │   │   ├── campaigns.ts
│   │   │   ├── character-sheets.ts
│   │   │   └── systems.ts
│   │   └── index.ts
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/page.tsx
│   │   │   │   ├── search/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── edit/page.tsx
│   │   │   │       ├── play/page.tsx
│   │   │   │       └── sheets/[sheetId]/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── character-builder/
│   │   │   │   ├── components/
│   │   │   │   ├── constants/
│   │   │   │   ├── review/
│   │   │   │   ├── services/
│   │   │   │   ├── steps/
│   │   │   │   ├── summary/
│   │   │   │   ├── types/
│   │   │   │   └── utils/
│   │   │   └── game-table/
│   │   │       ├── components/
│   │   │       ├── constants/
│   │   │       ├── services/
│   │   │       ├── types/
│   │   │       └── utils/
│   │   ├── lib/
│   │   └── service/
│   ├── public/
│   └── package.json
│
├── docs/
└── README.md
```

---

## ⚙️ Tech Stack

### Backend

- Node.js
- Fastify
- TypeScript
- Prisma ORM
- PostgreSQL
- Better Auth
- Zod
- Swagger
- Scalar API Reference
- pnpm
- Docker

### Frontend

- Next.js
- React
- Tailwind CSS
- TypeScript
- Better Auth Client
- Figma

---

## 🏗️ Backend Architecture

### PostgreSQL

Responsável por persistência, integridade, relacionamentos e regras críticas quando fizer sentido.

### Prisma

Responsável pelo acesso tipado ao banco, queries relacionais, migrations, seed e Prisma Studio.

### Better Auth

Responsável por registro, login, sessões e cookies de autenticação.

### Fastify

Responsável por rotas HTTP, validação com Zod, autorização e integração com Better Auth.

---

## 🔐 Sistema de Autenticação

Implementado:

- Better Auth
- Prisma Adapter
- Sessões persistentes
- Integração com Fastify
- Frontend com `authClient`
- Backend com helper `getAuthenticatedSession`

Decisão importante:

> Não usar Bearer token manual/localStorage para sessão principal. O fluxo atual usa sessão/cookie do Better Auth.

---

## 🧩 Modelagem Atual

### Núcleo

- User
- Session
- Account
- Verification

### Campanhas e mesa

- Campaign
- Participant
- GameSession
- CampaignActor
- SceneToken

### Sistema RPG

- GameSystem
- Stat
- Skill
- Ancestry
- Background
- CharacterClass
- CharacterSubclass
- Feature
- Spell
- Equipment
- LevelProgression
- ClassSpell

### Ficha/personagem

- CharacterSheet
- CharacterSheetStat
- CharacterSheetSkill
- CharacterSheetSpell
- CharacterSheetEquipment
- CharacterSheetClass

---

## 🪄 Arquitetura de regras de magia — 4.27

A macro 4.27 consolidou a primeira camada de regras avançadas de sistema/ficha com foco em magia e progressão inicial.

### Campos e modelos principais

- `CharacterClass.spellcastingAbilityKey`
  - define o atributo usado pela classe para conjuração.
  - exemplos: Bardo usa `charisma`, Devoto usa `wisdom`, Bárbaro usa `null`.

- `LevelProgression`
  - guarda progressão por classe e nível.
  - inclui bônus de proficiência, truques conhecidos, magias conhecidas/preparadas e espaços de magia por círculo/nível.

- `ClassSpell`
  - relação entre classe e magia.
  - define quais magias cada classe pode aprender/conjurar e o nível mínimo da classe.

### Backend

A rota:

```txt
GET /systems/:systemId/character-options
```

entrega em cada classe:

```txt
spellcastingAbilityKey
levelProgressions
classSpells
```

A rota de ficha pronta também carrega a progressão da classe para a aba Magia exibir slots.

### Frontend

O builder:

- filtra magias pela classe selecionada.
- respeita `minimumClassLevel`.
- valida limite de truques/magias usando a progressão da classe no nível inicial.
- limpa magias antigas do draft ao trocar de classe.

A ficha pronta calcula:

```txt
CD de magia = 8 + proficiência + modificador do atributo de conjuração
Ataque mágico = proficiência + modificador do atributo de conjuração
```

Também exibe espaços de magia da progressão atual.

### Correção de rolagem

A função de rolagem foi ajustada para o resultado grande do chat mostrar sempre o total numérico da rolagem.

Exemplo:

```txt
2d8 [5, 5] → 10
```

---

## ⚔️ Arquitetura de equipamento/features/Level Up — 4.29


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

## 🧍 Character Builder — Arquitetura atual

Arquivos principais:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
frontend/src/features/character-builder/
backend/src/routes/character-sheets.ts
backend/src/routes/systems.ts
backend/prisma/schema.prisma
backend/prisma/seed.ts
```

Estrutura extraída:

```txt
features/character-builder/
├── components/
├── constants/
├── review/
├── services/
├── steps/
├── summary/
├── types/
└── utils/
```

Status consolidado:

- Conceito, atributos, perícias, magias, equipamentos, sobre e revisão foram extraídos/refatorados.
- Criar personagem pela mesa abre draft vazio.
- Player comum vê `+ Personagem` e abre o builder direto.
- GM mantém `Biblioteca` e `+ Criar` completo.
- Linguagem dinâmica por pronome foi aplicada em labels principais de classe/ancestralidade/antecedente.
- Pronome e gênero inicial foram sincronizados quando apropriado.
- O builder continua sendo aberto dentro da mesa.
- A etapa Magias usa `ClassSpell` e `LevelProgression` para listar escolhas válidas.

---

## 🧾 Ready Character Sheet — Arquitetura atual após 4.29

Arquivos principais:

```txt
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/features/character-builder/components/CharacterReadySheetModal.tsx
frontend/src/app/campaigns/[id]/sheets/[sheetId]/page.tsx
frontend/src/app/campaigns/[id]/play/page.tsx
```

Decisão arquitetural da 4.28:

```txt
CharacterReadySheetView = miolo reutilizável da ficha.
CharacterReadySheetModal = casca de modal dentro da mesa.
sheets/[sheetId]/page.tsx = rota pop-out com dados reais.
play/page.tsx = mesa, chat e listener de postMessage.
```

A ficha pronta agora pode abrir em duas formas:

```txt
1. Modal dentro da mesa.
2. Janela/pop-out separada.
```

O pop-out é importante porque permite ao jogador/mestre manter a ficha aberta enquanto continua vendo grid, chat e mesa.

### Abas atuais

```txt
1 — Ficha/Status
2 — Combate
3 — Bolsa
4 — Magia
5 — Features
6 — Perfil
7 — Notas
```

### Padrão visual

- Topo fixo compacto com identidade e dados importantes.
- Atributos e status essenciais ficam sempre visíveis.
- Salvaguardas/testes de resistência ficam no topo e são clicáveis.
- Centro da ficha muda conforme a aba.
- Cards compactos por padrão.
- Detalhes longos aparecem por expand/collapse.
- Evitar `span` e `.length` desnecessários quando não agregam clareza ao código.

### Ficha/Status

- Focada em leitura rápida.
- Perícias agrupadas e roláveis.
- Não duplica o que já está no topo fixo.

### Bolsa

- Cards compactos e expansíveis.
- Ataque/Dano sempre visíveis quando aplicável.
- Detalhes só aparecem sob demanda.
- Ataque de equipamento usa bônus real calculado por atributo/proficiência temporária/bônus do item.

### Magia

- Truques separados de magias.
- Magias agrupadas por nível.
- Cards compactos e expansíveis.
- Dano, conjuração e alcance aparecem no card fechado.
- Duração, componentes e descrição aparecem no detalhe.
- Botão de efeito foi removido para evitar flood no chat.
- Ataque mágico usa bônus real quando a classe conjura.
- Ataque mágico fica desabilitado quando a classe não conjura.

### Perfil e Notas

- Perfil concentra imagens e campos de identidade visual/narrativa.
- Notas ficam em aba própria.
- Notas de mestre continuam restritas ao GM.

### Pop-out e rolagens

A rota pop-out carrega a ficha real e o ator vinculado. Quando uma ação de rolagem é disparada no pop-out, ela envia uma mensagem para a janela da mesa usando:

```txt
window.opener.postMessage(...)
```

A mesa escuta mensagens com:

```txt
source: "legendforge-sheet-popout"
type: "ROLL_SHEET_ACTION"
```

e publica o resultado no chat local da mesa.

Limitação atual:

> A comunicação do pop-out depende da janela da mesa estar aberta como `window.opener`. Sincronização real entre contas/janelas ainda será tratada em fase futura.

### Ações de rolagem atuais

- Iniciativa do personagem: `1d20 + iniciativa real`.
- Perícia: `1d20 + bônus da perícia`.
- Teste de resistência: `1d20 + bônus do teste`.
- Ataque de equipamento: `1d20 + bônus real do equipamento`.
- Dano de equipamento: rola expressão de dano do equipamento.
- Ataque mágico: `1d20 + ataque mágico real`, quando a classe possui atributo de conjuração.
- Dano mágico: expressão detectada na descrição.
- Ataque mágico desabilitado quando a classe não possui atributo de conjuração.

Limitação atual intencional:

> Ataques de equipamento já possuem bônus real. Comparação automática contra CA ainda é futura; na 4.29 o GM pode informar CA manual como referência no texto da rolagem.

---

## 🎲 Game Table — Arquitetura atual

A mesa foi refatorada para `frontend/src/features/game-table/`.

Estrutura:

```txt
features/game-table/
├── components/
│   ├── TableChatPanel.tsx
│   ├── TableCharactersPanel.tsx
│   ├── TableJournalPanel.tsx
│   ├── TableLeftToolbar.tsx
│   ├── TableRightPanel.tsx
│   ├── TableRollsPanel.tsx
│   ├── TableSceneCanvas.tsx
│   └── TableSettingsPanel.tsx
├── constants/
│   ├── dice-constants.ts
│   └── table-ui-constants.ts
├── services/
│   └── game-table-api.ts
├── types/
│   └── game-table-types.ts
└── utils/
    ├── actor-utils.ts
    ├── dice-utils.ts
    ├── token-utils.ts
    └── user-utils.ts
```

Funcionalidades atuais da mesa:

- Painel direito em abas: Chat, Rolagens, Personagens, Diário e Mesa.
- Toolbar esquerda funcional: Selecionar, Mover visão, Medir, Desenhar e Névoa.
- Tokens reais na cena com posição persistida.
- Tamanho de token editável e persistido.
- Escala definida: `1 quadrado = 40px = 1,5m`.
- Ferramenta Medir:
  - linha em metros
  - círculo com centro no clique e raio no arrasto
  - medição fica visível até trocar de ferramenta ou criar outra
- Ferramenta Desenhar:
  - desenho local
  - desfazer último traço
  - limpar desenhos
- Ferramenta Névoa:
  - névoa local com máscara real
  - áreas reveladas
  - tokens fora da área revelada ficam cobertos
- Biblioteca e criação de atores na aba Personagens.
- Rolagens manuais e ações de ficha publicam no chat local.
- Iniciativa da mesa permite GM rolar ranking para personagens/NPCs/criaturas.
- Sem sincronização em tempo real ainda.

Decisão atual:

> Desenho, medição, pan/zoom, névoa, chat e rolagens são locais/visuais por enquanto. Persistência/sincronização em tempo real entram em fases futuras.

---

## 🧠 Regras futuras importantes

### Chat UX/UI — 4.28.14

Ajuste planejado após a ficha pop-out:

- reduzir poluição visual do chat.
- melhorar cards de rolagem.
- diferenciar mensagens, rolagens públicas, sussurros e sistema.
- manter rolagens vindas da ficha claras e compactas.
- evitar flood desnecessário.

### Multiclasse e Level Up real — 4.30

Movidas para 4.29:

- ataque real por equipamento.
- ataque contra CA manual.
- features por nível.
- subclasse no nível correto.
- fluxo de level up.
- level up mostrando apenas pendências/mudanças do novo nível.

### Multiclasse — 4.30

Implementado no nível estrutural/visual:

- `CharacterSheetClass` separa níveis por classe.
- `CharacterSheet.level` continua representando o nível total do personagem.
- Fichas novas sincronizam classe principal na nova tabela.
- Fichas antigas receberam backfill manual.
- API de ficha retorna `classes[]`.
- Ficha pronta exibe classes e níveis individuais.
- Proficiência usa nível total.
- Features usam nível individual de cada classe.
- Magia usa classe conjuradora ativa da estrutura nova.
- Level Up permite escolher visualmente a classe que receberia o próximo nível.
- Subclasse é avaliada por classe escolhida no modal.

Ainda futuro:

- salvar Level Up real;
- adicionar nova classe de multiclasse;
- escolher subclasse real durante Level Up;
- slots combinados de magia multiclasse;
- remoção gradual dos campos antigos de compatibilidade.

### NPCs e criaturas

- NPCs devem usar ficha própria futura, separada de `CharacterSheet`.
- Criaturas devem usar bloco próprio de bestiário.
- Não transformar `CharacterSheet` em ficha universal para tudo.

### Upload real de imagens

- Upload direto do computador.
- Preview/fit/crop simples.
- Persistência segura.
- Revisão futura de `next/image` com domínios/loader quando sair do `unoptimized`.

---

## 🧩 Plano macro da Fase 4

```txt
[x] 4.22 — Refatoração do Character Builder
[x] 4.23 — Refatoração da Mesa de Jogo
[x] 4.24 — Personagens ativos, biblioteca e ciclo de vida de atores
[x] 4.25 — Ficha pronta, abas, perfil, bolsa, magia e imagens por URL
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
[x] 4.28.14 — Revisar UX/UI do chat após ficha pop-out
[x] 4.28.15 — Commit da 4.28
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

## ✅ Checklist antes do commit da 4.30

```txt
[ ] git status
[ ] git diff --stat
[ ] cd frontend && pnpm lint && cd ..
[ ] git add .
[ ] git status
[ ] git commit -m "feat: add multiclass foundation"
```


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
4.30.13 — Atualizar documentação
4.30.14 — Commit da 4.30
4.31 — Modularização e expansão do conteúdo base do sistema
```
