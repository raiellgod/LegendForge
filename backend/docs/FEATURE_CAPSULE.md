# 📦 FEATURE CAPSULES — LegendForge

---

## 📌 About

Este arquivo registra o desenvolvimento incremental do projeto.

Cada cápsula representa:

- uma etapa pequena
- funcional
- testável
- validada

---

# 🧱 Capsule 01 — Setup

## 🎯 Goal

Configurar o ambiente inicial de desenvolvimento do backend.

## ✅ Result

- ambiente funcional
- código padronizado
- execução consistente

---

# ⚡ Capsule 02 — Backend Base

## 🎯 Goal

Criar base do backend com Fastify.

## ✅ Result

- API funcional
- validação estruturada
- documentação disponível

---

# 🧠 Capsule 03 — Data & UI Design

## 🎯 Goal

Definir domínio do sistema antes da implementação.

## ✅ Result

- base conceitual sólida
- visão clara do produto

---

# ⚡ Capsule 04 — Database Design (Core)

## ✅ Result

- banco modelado com qualidade profissional
- suporte a campanhas, personagens, sistemas, participantes, sessões e logs
- Better Auth como núcleo de identidade
- regra de ouro: domínio crítico no banco/backend

---

# ⚡ Capsule 05 — Figma UI

## ✅ Result

- fluxo de login/registro
- home pública
- home logada de campanhas
- fluxo inicial de criação de mundo
- tela de edição/finalização da campanha
- base visual para mesa e criação de personagem

---

# ⚡ Capsule 06 — System Design (RPG)

## ✅ Result

- classes definidas
- subclasses definidas
- progressão 1–20 planejada
- talentos/features
- atributos e perícias
- base para múltiplos sistemas

---

# ⚡ Capsule 07 — Database Refinement

## ✅ Result

- banco mais consistente
- preparado para múltiplos sistemas, campanhas, personagens e inventário

---

# ⚡ Capsule 08 — Production Constraints & Integrity

## ✅ Result

- limites de atributos
- limites de nível
- entendimento de quais regras ficam no banco e quais ficam no backend

---

# ⚡ Capsule 09 — Prisma Integration

## ✅ Result

- `schema.prisma` criado
- Prisma Client gerado
- PostgreSQL conectado via Docker
- Prisma Studio funcionando
- banco sincronizado com `db push`

---

# ⚡ Capsule 10 — Authentication (Better Auth)

## ✅ Result

- Better Auth integrado
- Prisma Adapter configurado
- login e registro funcionando
- sessões persistidas no banco
- frontend usando `authClient`
- backend lendo sessão real por cookie

---

# ⚡ Capsule 11 — API Integration

## ✅ Result

- API funcional
- auth integrado
- banco persistindo dados reais
- CORS ajustado
- fluxo sessão/cookie validado

---

# ⚡ Capsule 12 — Campaign Domain API

## ✅ Result

- usuário autenticado cria campanha
- criador entra como GM
- home lista campanhas do usuário
- rotas de participantes implementadas
- base para permissões owner/GM/player

---

# ⚡ Capsule 13 — Campaign Frontend Flow

## ✅ Result

- `/campaigns`
- `/campaigns/create`
- `/campaigns/[id]/edit`
- fluxo de criação de campanha ponta a ponta
- frontend conectado ao backend real

---

# ⚡ Capsule 14 — Campaign Search & Join Flow

## ✅ Result

- página de busca iniciada
- fluxo de entrada por código/convite discutido
- decisão: solicitação de entrada deve depender de aprovação futura

---

# ⚡ Capsule 15 — Game Page Foundation

## ✅ Result

- `/campaigns/[id]/play`
- header da mesa
- grid/mapa
- toolbar lateral
- abas laterais
- chat local
- rolagens local
- personagens inicialmente mockados
- base visual da mesa funcionando

---

# ⚡ Capsule 16 — Campaign Actors

## ✅ Result

- `CampaignActor` criado
- atores associados à campanha
- localização `TABLE`/`LIBRARY`
- aba Personagens consome API real
- devolver/trazer da biblioteca persistido
- decisão: `CampaignActor` não é ficha completa; ficha vem depois

---

# ⚡ Capsule 17 — Scene Tokens

## ✅ Result

- base de `SceneToken`
- tokens conectados à campanha/cena
- movimento/estado inicial persistido
- base pronta para sincronização futura

---

# ⚡ Capsule 18 — RPG System Seed Expansion

## ✅ Result

- atributos
- perícias
- classes
- subclasses
- ancestralidades
- antecedentes com nomes próprios LegendForge
- magias
- equipamentos
- features iniciais

---

# ⚡ Capsule 19 — CharacterSheet Backend

## ✅ Result

- modelos de ficha no Prisma
- `CharacterSheet`
- `CharacterSheetStat`
- `CharacterSheetSkill`
- `CharacterSheetSpell`
- `CharacterSheetEquipment`
- rotas em `backend/src/routes/character-sheets.ts`
- GET, POST, GET por id e PATCH funcionando
- rascunho de ficha persistindo

---

# ⚡ Capsule 20 — Character Creation Menu

## ✅ Result

- menu com opções:
  - Criar personagem
  - Criar NPC
  - Editar ficha diretamente
  - Personagem pronto
- apenas Criar personagem ativo por enquanto
- demais opções marcadas como planejadas

---

# ⚡ Capsule 21 — Character Builder Layout

## ✅ Result

- modal grande de criação
- sidebar com etapas
- área central
- resumo lateral
- navegação anterior/próxima
- etapas planejadas do builder

---

# ⚡ Capsule 22 — Character Builder Draft

## ✅ Result

- etapa Conceito com formulário real
- campos de nome, pronomes, conceito, retrato, token e encaixe do token
- salvar rascunho via API
- carregar rascunho ao abrir builder
- feedback visual de sucesso/erro

---

# ⚡ Capsule 23 — Character Builder Options

## ✅ Result

- rota `GET /systems/:systemId/character-options`
- retorna classes, ancestralidades e antecedentes
- cards no builder usam dados reais
- resumo lateral mostra nomes escolhidos

---

# ⚡ Capsule 24 — Character Builder Choices Persistence

## ✅ Result

- seleção clicável de classe
- seleção clicável de ancestralidade
- seleção clicável de antecedente
- salvamento de `classId`, `ancestryId`, `backgroundId`
- carregamento posterior preserva escolhas

---

# ⚡ Capsule 25 — Character Builder Step Validation

## ✅ Result

- Conceito exige nome
- Classe exige classe
- Ancestralidade exige ancestralidade
- Antecedente exige antecedente
- botão Próxima bloqueia quando falta algo
- mensagem visual explica o que falta

---

# ⚡ Capsule 26 — Character Builder Attributes

## ✅ Result

- 6 atributos
- Standard Array
- cálculo automático de modificador
- resumo lateral com total/maior atributo
- persistência em `CharacterSheetStat`
- carregamento posterior preserva atributos

---

# ⚡ Capsule 27 — Character Builder Skills

## ✅ Result

- perícias reais do sistema
- cálculo por atributo
- seleção manual
- sugestões do antecedente sem auto-seleção
- persistência em `CharacterSheetSkill`
- limite temporário de escolhas
- regra futura definida: classe limita lista/quantidade e antecedente sugere escolhas

---

# ⚡ Capsule 28 — Character Builder Spells

## ✅ Result

- etapa de magias/truques
- seleção persistida
- separação visual entre truques e magias
- filtros por tipo/escola/busca
- regra futura definida: classe deve filtrar magias e progressão por nível

---

# ⚡ Capsule 29 — Character Builder Equipment

## ✅ Result

- equipamento inicial por classe/antecedente
- escolha entre pacote inicial ou moedas
- inventário inicial calculado
- persistência de equipamentos/moedas
- regra futura definida: itens gerais virão de lojas, não de listagem livre

---

# ⚡ Capsule 30 — Character Builder About

## ✅ Result

- etapa Sobre com identidade, aparência, personalidade, história e notas
- resumo lateral da etapa Sobre
- persistência dos campos narrativos

---

# ⚡ Capsule 31 — Character Builder Review & Stabilization

## ✅ Result

- componentes de revisão criados
- revisão visual exibida
- etapa de revisão estabilizada
- fluxo “Criar personagem” abre draft vazio
- builder não carrega dados antigos ao criar personagem do zero
- linguagem dinâmica por pronome aplicada em labels principais
- sincronização inicial pronome → gênero funcionando
- teste regressivo do builder concluído
- commit da refatoração do builder concluído

---

# ⚡ Capsule 32 — Game Table Refactor Foundation

## 🎯 Goal

Reduzir responsabilidades do `frontend/src/app/campaigns/[id]/play/page.tsx` e criar uma base modular para a mesa.

## ✅ Result

- criada a pasta `frontend/src/features/game-table`
- types extraídos
- helpers de usuários, atores, tokens e rolagens extraídos
- serviços/API da mesa extraídos
- constantes de dados e UI da mesa extraídas
- toolbar esquerda extraída
- painel direito base extraído

---

# ⚡ Capsule 33 — Game Table Panels

## 🎯 Goal

Extrair as abas do painel direito da mesa.

## ✅ Result

- Chat extraído para componente próprio
- Rolagens extraída para componente próprio
- Personagens extraída para componente próprio
- Diário extraído para componente próprio
- Mesa/configurações extraída para componente próprio
- botões Biblioteca e `+ Criar` restaurados na aba Personagens
- painel direito ficou mais modular e testável

---

# ⚡ Capsule 34 — Game Table Canvas & Tools

## 🎯 Goal

Transformar a área central da mesa em uma camada mais organizada e funcional.

## ✅ Result

- `TableSceneCanvas` criado
- renderização de tokens movida para componente próprio
- drag de token corrigido com offset real do clique
- drag em tempo real corrigido após extração
- ferramenta Selecionar move tokens
- ferramenta Mover visão arrasta o mapa
- ferramenta Medir funciona com:
  - linha
  - círculo
  - escala em metros
  - `1 quadrado = 40px = 1,5m`
- ferramenta Desenhar funciona localmente:
  - criar traço
  - desfazer último
  - limpar desenhos
- ferramenta Névoa funciona localmente:
  - máscara real
  - áreas reveladas
  - desfazer última área
  - limpar áreas
  - tokens fora da área revelada ficam cobertos
- tamanho de token editável e persistido:
  - 1x1
  - 2x2
  - 3x3
  - 4x4

---

# ⚡ Capsule 35 — Game Table Regression & Cleanup

## 🎯 Goal

Validar que a mesa continuou funcionando após a refatoração.

## ✅ Result

- lint limpo de warnings relevantes da mesa
- uso de `<Image />` ajustado onde necessário
- teste regressivo da mesa concluído
- commit da refatoração da mesa concluído

Testado:

- carregamento da mesa
- toolbar esquerda
- tokens
- tamanho de token
- painel direito
- chat
- rolagens
- personagens
- diário
- configurações/mesa
- builder aberto pela mesa
- biblioteca
- remover/adicionar/devolver atores/tokens

---

# 🧠 Estado Atual do Projeto

👉 **Fase 4.24.0 — Atualização dos documentos do projeto em andamento.**

Próximo foco funcional:

```txt
4.24 — Personagens ativos, biblioteca e exclusão/remoção correta.
```

---

# 🧠 Regra de Ouro

> Cada cápsula deve gerar valor real e aproximar o sistema de ser jogável.
