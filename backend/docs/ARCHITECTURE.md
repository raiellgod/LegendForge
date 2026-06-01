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
- 🪄 Regras de conjuração já conectadas a progressão de classe

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
frontend/src/features/character-builder/components/CharacterReadySheetModal.tsx
```

- Para mudança grande: reescrever o arquivo inteiro baseado no último arquivo enviado pelo usuário.
- Para mudança pequena: usar âncoras reais do arquivo atual no estilo “Procure este trecho / Troque por este trecho”.
- Não usar código presumido de versões antigas.
- Quando refatorar fluxos grandes, manter um único arquivo atual como fonte da verdade.

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
│   │   │   │       └── play/page.tsx
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

passou a entregar, em cada classe:

```txt
spellcastingAbilityKey
levelProgressions
classSpells
```

A rota de ficha pronta também carrega a progressão da classe para a aba Magia exibir slots.

### Frontend

O builder passou a:

- filtrar magias pela classe selecionada.
- respeitar `minimumClassLevel`.
- validar limite de truques/magias usando a progressão da classe no nível inicial.
- limpar magias antigas do draft ao trocar de classe.

A ficha pronta passou a calcular:

```txt
CD de magia = 8 + proficiência + modificador do atributo de conjuração
Ataque mágico = proficiência + modificador do atributo de conjuração
```

Também passou a exibir espaços de magia da progressão atual.

### Correção de rolagem

A função de rolagem foi ajustada para o resultado grande do chat mostrar sempre o total numérico da rolagem.

Exemplo:

```txt
2d8 [5, 5] → 10
```

em vez de:

```txt
2d8 [5, 5] → 5, 5
```

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
- Player comum agora vê `+ Personagem` e abre o builder direto.
- GM mantém `Biblioteca` e `+ Criar` completo.
- Linguagem dinâmica por pronome foi aplicada em labels principais de classe/ancestralidade/antecedente.
- Pronome e gênero inicial foram sincronizados quando apropriado.
- O builder continua sendo aberto dentro da mesa.
- A etapa Magias já usa `ClassSpell` e `LevelProgression` para listar escolhas válidas.

---

## 🧾 Ready Character Sheet — Arquitetura atual

Arquivo principal:

```txt
frontend/src/features/character-builder/components/CharacterReadySheetModal.tsx
```

A ficha pronta foi organizada em abas:

```txt
1 — Ficha/Status
2 — Bolsa
3 — Magia
4 — Perfil
```

Decisões atuais:

- Identidade do personagem fica no header fixo, visível em todas as abas.
- `Ficha/Status` é compacta e focada em uso durante jogo.
- Perícias exibem todas as perícias do sistema, não apenas as proficientes.
- Perícias e testes de resistência usam linhas clicáveis.
- `Bolsa` concentra moedas, equipamentos e ações básicas de item.
- `Magia` concentra magias/truques, conjuração, CD, ataque mágico e espaços de magia.
- `Perfil` concentra retrato, token, aparência, personalidade, história e notas.
- Notas do mestre aparecem apenas para GM.

Ações de rolagem atuais:

- Iniciativa do personagem: `1d20 + iniciativa real`.
- Perícia: `1d20 + bônus da perícia`.
- Teste de resistência: `1d20 + bônus do teste`.
- Ataque de equipamento: ataque básico `1d20 + 0`.
- Dano de equipamento: rola expressão de dano do equipamento.
- Ataque mágico: `1d20 + ataque mágico real`, quando a classe possui atributo de conjuração.
- Dano mágico: expressão detectada na descrição.
- Ataque mágico desabilitado quando a classe não possui atributo de conjuração.

Limitação atual intencional:

> Ataques de equipamento ainda não têm bônus real e nenhum ataque compara com CA automaticamente. Bônus real de equipamento, alvo e comparação com CA foram movidos para a macro 4.29.

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

### Refatoração estrutural da ficha pronta — 4.28

Decisão tomada após análise de UX da ficha pronta e referências de VTTs:

- A ficha pronta merece uma macro própria.
- A ficha deve ser uma ferramenta viva da mesa, não um bloco que trava a navegação.
- O padrão visual deve priorizar cards compactos e detalhes sob demanda.
- A ficha deve evoluir para uma casca fixa com centro variável.
- Futuramente pode haver modo pop-out/janela destacada, linkada à mesa e ao chat.

### Regras avançadas de equipamento/features/level up — 4.29

Movidas para 4.29:

- ataque real por equipamento.
- ataque contra CA manual.
- features por nível.
- subclasse no nível correto.
- fluxo de level up.
- level up mostrando apenas pendências/mudanças do novo nível.

### Multiclasse — 4.30

- Subir de nível deve perguntar qual classe recebe o novo nível.
- Nível total deve ser soma dos níveis por classe.
- Header deve exibir classes compostas, como `Bardo 3 / Necromante 2`.
- Magias, proficiências, features e progressão devem considerar múltiplas classes.

### Perícias e proficiências

- Classe deve fornecer lista pré-definida de perícias permitidas e quantidade de escolhas.
- Antecedente deve fornecer quantidade de perícias com sugestões, mas usuário escolhe manualmente.
- Sistema deve impedir duplicidade da mesma perícia.
- Proficiências de armas, escudos, ferramentas e similares devem ser editáveis pelo GM durante a campanha.

### Armadura/defesa

- Armaduras devem ser principalmente visuais/cosméticas.
- Defesa deve vir de camada mecânica aplicada à roupa/equipamento, permitindo trocar aparência sem perder defesa.

### Personagens ativos

- Player comum: 1 personagem ativo por campanha.
- GM: pode ter vários NPCs/criaturas, mas só 1 personagem próprio ativo.
- NPCs/criaturas podem ir para biblioteca.
- Personagens de player/GM precisam de fluxo próprio de remover/inativar/excluir.

### NPCs e criaturas

- NPCs terão ficha própria futura, separada de `CharacterSheet`.
- Criaturas terão stat block/bestiário próprio, separado de `CharacterSheet` e `NpcSheet`.

### Linguagem dinâmica

- Implementar e expandir linguagem baseada em pronomes.
- Primeiro masculino/feminino.
- Neutro será adaptado caso a caso depois.

### Upload de imagem

- Upload direto do computador entra em fase futura.
- Inclui retrato, token, preview/fit/crop simples e persistência da URL no banco.

### Sincronização em tempo real

- Entrará em fase posterior.
- Deve sincronizar tokens, chat/rolagens, névoa, desenhos e demais eventos de mesa entre contas.

---

## 🔄 Current Phase

> **FASE 4 — Criação/Ficha de Personagem**

Estado atual:

```txt
[x] 4.22 — Refatoração do Character Builder
[x] 4.23 — Refatoração da Mesa de Jogo
[x] 4.24 — Personagens ativos, biblioteca e ciclo de vida de atores
[x] 4.25 — Ficha pronta, abas, perfil, bolsa, magia e imagens por URL
[x] 4.26 — Rolagens automáticas pela ficha pronta
[x] 4.27 — Regras avançadas de magia e progressão inicial
[próximo] 4.28 — Refatoração estrutural da ficha pronta
[planejado] 4.29 — Regras avançadas de equipamento, features e level up
[planejado] 4.30 — Multiclasse
```

---

## 📌 Estado da 4.27

```txt
[x] 4.27.1 — Revisar modelagem de progressão por classe/nível
[x] 4.27.2 — Revisar/expandir LevelProgression no schema
[x] 4.27.3 — Popular seed de progressão básica por classe
[x] 4.27.3.1 — Popular seed de magias permitidas por classe
[x] 4.27.4 — Filtrar magias por classe
[x] 4.27.5 — Validar quantidade de truques/magias por nível
[x] 4.27.5.1 — Expandir seed mínimo de magias para teste real
[x] 4.27.6 — Calcular atributo de conjuração por classe
[x] 4.27.7 — Calcular CD de magia
[x] 4.27.8 — Calcular ataque mágico real
[x] 4.27.8.1 — Desabilitar ataque mágico quando a classe não tiver atributo de conjuração
[x] 4.27.9 — Exibir espaços de magia na aba Magia
[x] 4.27.9.1 — Reorganizar UX/UI inicial da aba Magia
[x] Correção — resultado grande da rolagem mostra o total, não a lista dos dados
[x] 4.27.10 — Teste regressivo da 4.27
[x] 4.27.11 — Atualizar documentação da 4.27
[próximo] 4.27.12 — Commit da 4.27
```

---

## 📌 Próximas macros reorganizadas

### 4.28 — Refatoração estrutural da ficha pronta

```txt
[ ] 4.28.1 — Planejar arquitetura da ficha pronta
[ ] 4.28.2 — Definir layout shell: header fixo, laterais fixas e centro variável
[ ] 4.28.3 — Definir modo ficha modal atual versus futura janela destacada/pop-out
[ ] 4.28.4 — Criar padrão de cards compactos com expand/collapse
[ ] 4.28.5 — Aplicar expand/collapse na aba Magia
[ ] 4.28.6 — Aplicar expand/collapse na aba Bolsa
[ ] 4.28.7 — Reorganizar informações fixas da ficha: PV, CA, iniciativa, proficiência, percepção e recursos
[ ] 4.28.8 — Reorganizar abas centrais: Ficha/Status, Combate, Magia, Bolsa, Features, Perfil/Notas
[ ] 4.28.9 — Preparar área lateral de defesas, sentidos, condições e proficiências
[ ] 4.28.10 — Melhorar densidade visual e reduzir textos redundantes
[ ] 4.28.11 — Revisar responsividade em notebook menor, widescreen e tablet
[ ] 4.28.12 — Teste regressivo da ficha pronta
[ ] 4.28.13 — Atualizar documentação da 4.28
[ ] 4.28.14 — Commit da 4.28
```

### 4.29 — Regras avançadas de equipamento, features e level up

```txt
[ ] 4.29.1 — Calcular ataque real por equipamento
[ ] 4.29.2 — Definir regra inicial de ataque por equipamento
[ ] 4.29.3 — Revisar modelagem de pacotes/itens compostos
[ ] 4.29.4 — Popular seed de pacotes de equipamento
[ ] 4.29.5 — Popular seed de equipamentos iniciais por classe
[ ] 4.29.6 — Preparar ataque contra CA manual
[ ] 4.29.7 — Features de classe por nível
[ ] 4.29.8 — Subclasse no nível correto
[ ] 4.29.9 — Preparar fluxo de subir de nível
[ ] 4.29.10 — Level up mostra apenas pendências/mudanças do novo nível
[ ] 4.29.11 — Revisão UX/UI das regras avançadas
[ ] 4.29.12 — Teste regressivo da 4.29
[ ] 4.29.13 — Atualizar documentação da 4.29
[ ] 4.29.14 — Commit da 4.29
```

### 4.30 — Multiclasse

```txt
[ ] 4.30.1 — Modelar classes múltiplas da ficha
[ ] 4.30.2 — Criar CharacterSheetClass ou estrutura equivalente
[ ] 4.30.3 — Calcular nível total pela soma das classes
[ ] 4.30.4 — Exibir classes no header da ficha, ex.: Bardo 3 / Necromante 2
[ ] 4.30.5 — Fluxo de subir de nível pergunta qual classe aumenta
[ ] 4.30.6 — Aplicar progressão da classe escolhida
[ ] 4.30.7 — Ajustar magias para múltiplas classes
[ ] 4.30.8 — Ajustar perícias/proficiências para multiclasse
[ ] 4.30.9 — Histórico de níveis
[ ] 4.30.10 — Revisão UX/UI do multiclasse
[ ] 4.30.11 — Teste regressivo
[ ] 4.30.12 — Commit da 4.30
```
