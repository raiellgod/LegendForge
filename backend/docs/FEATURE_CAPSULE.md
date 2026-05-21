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

## 🎯 Goal

Criar estrutura completa do banco.

## ✅ Result

- banco modelado com qualidade profissional
- suporte a campanhas, personagens, sistemas, participantes, sessões e logs
- Better Auth como núcleo de identidade
- regra de ouro: domínio crítico no banco/backend

---

# ⚡ Capsule 05 — Figma UI

## 🎯 Goal

Criar interface visual do sistema.

## ✅ Result

- fluxo de login/registro
- home pública
- home logada de campanhas
- fluxo inicial de criação de mundo
- tela de edição/finalização da campanha
- base visual para a mesa e criação de personagem

---

# ⚡ Capsule 06 — System Design (RPG)

## 🎯 Goal

Criar sistema próprio de RPG.

## ✅ Result

- classes definidas
- subclasses definidas
- progressão 1–20
- talentos/features
- atributos e perícias
- base para múltiplos sistemas

---

# ⚡ Capsule 07 — Database Refinement

## 🎯 Goal

Elevar o banco para nível produção real.

## ✅ Result

- banco mais consistente
- preparado para múltiplos sistemas, campanhas, personagens e inventário

---

# ⚡ Capsule 08 — Production Constraints & Integrity

## 🎯 Goal

Definir regras críticas de integridade.

## ✅ Result

- limites de atributos
- limites de nível
- entendimento de quais regras ficam no banco e quais ficam no backend

---

# ⚡ Capsule 09 — Prisma Integration

## 🎯 Goal

Conectar modelagem ao sistema real.

## ✅ Result

- `schema.prisma` criado
- Prisma Client gerado
- PostgreSQL conectado via Docker
- Prisma Studio funcionando
- banco sincronizado com `db push`

---

# ⚡ Capsule 10 — Authentication (Better Auth)

## 🎯 Goal

Implementar autenticação real.

## ✅ Result

- Better Auth integrado
- Prisma Adapter configurado
- login e registro funcionando
- sessões persistidas no banco
- frontend usando `authClient`
- backend lendo sessão real por cookie

---

# ⚡ Capsule 11 — API Integration

## 🎯 Goal

Validar sistema funcionando end-to-end.

## ✅ Result

- API funcional
- auth integrado
- banco persistindo dados reais
- CORS ajustado
- fluxo sessão/cookie validado

---

# ⚡ Capsule 12 — Campaign Domain API

## 🎯 Goal

Criar primeiras rotas reais de campanha.

## ✅ Result

- usuário autenticado cria campanha
- criador entra como GM
- home lista campanhas do usuário
- rotas de participantes implementadas
- base para permissões owner/GM/player

---

# ⚡ Capsule 13 — Campaign Frontend Flow

## 🎯 Goal

Implementar fluxo inicial real de campanhas no frontend.

## ✅ Result

- `/campaigns`
- `/campaigns/create`
- `/campaigns/[id]/edit`
- fluxo de criação de campanha ponta a ponta
- frontend conectado ao backend real

---

# ⚡ Capsule 14 — Campaign Search & Join Flow

## 🎯 Goal

Criar busca/entrada em campanha.

## ✅ Result

- página de busca iniciada
- fluxo de entrada por código/convite discutido
- decisão: solicitação de entrada deve depender de aprovação futura
- owner/GM terão controle de participantes

---

# ⚡ Capsule 15 — Game Page Foundation

## 🎯 Goal

Criar base da mesa de jogo.

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

## 🎯 Goal

Substituir mock de personagens por atores reais de campanha.

## ✅ Result

- `CampaignActor` criado
- atores associados à campanha
- localização `TABLE`/`LIBRARY`
- aba Personagens consome API real
- devolver/trazer da biblioteca persistido
- decisão: `CampaignActor` não é ficha completa; ficha vem depois

---

# ⚡ Capsule 17 — Scene Tokens

## 🎯 Goal

Persistir tokens reais na cena.

## ✅ Result

- base de `SceneToken`
- tokens conectados à campanha/cena
- movimento/estado inicial persistido
- base pronta para sincronização futura

---

# ⚡ Capsule 18 — RPG System Seed Expansion

## 🎯 Goal

Popular sistema RPG base.

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
- decisões sobre seed: conteúdos grandes podem começar no seed e evoluir depois

---

# ⚡ Capsule 19 — CharacterSheet Backend

## 🎯 Goal

Criar base backend para fichas de personagem.

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

## 🎯 Goal

Adicionar entrada visual para criação de personagem na mesa.

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

## 🎯 Goal

Criar layout base do builder.

## ✅ Result

- modal grande de criação
- sidebar com etapas
- área central
- resumo lateral
- navegação anterior/próxima
- etapas planejadas:
  - Conceito
  - Classe
  - Ancestralidade
  - Antecedente
  - Atributos
  - Perícias
  - Magias
  - Equipamentos
  - Sobre
  - Revisão

---

# ⚡ Capsule 22 — Character Builder Draft

## 🎯 Goal

Salvar e carregar rascunho da ficha.

## ✅ Result

- etapa Conceito com formulário real
- campos de nome, pronomes, conceito, retrato, token e encaixe do token
- salvar rascunho via API
- carregar rascunho ao abrir builder
- corrigidos casos de `null`/string vazia no backend
- feedback visual de sucesso/erro

---

# ⚡ Capsule 23 — Character Builder Options

## 🎯 Goal

Carregar opções reais do sistema para criação de personagem.

## ✅ Result

- rota `GET /systems/:systemId/character-options`
- retorna classes, ancestralidades e antecedentes
- cards no builder usam dados reais
- resumo lateral mostra nomes escolhidos
- `systems.ts` ajustado para response compatível

---

# ⚡ Capsule 24 — Character Builder Choices Persistence

## 🎯 Goal

Selecionar e persistir escolhas principais da ficha.

## ✅ Result

- seleção clicável de classe
- seleção clicável de ancestralidade
- seleção clicável de antecedente
- salvamento de `classId`, `ancestryId`, `backgroundId`
- carregamento posterior preserva escolhas
- resumo lateral atualizado

---

# ⚡ Capsule 25 — Character Builder Step Validation

## 🎯 Goal

Validar avanço do builder por etapa.

## ✅ Result

- Conceito exige nome
- Classe exige classe
- Ancestralidade exige ancestralidade
- Antecedente exige antecedente
- botão Próxima bloqueia quando falta algo
- mensagem visual explica o que falta
- fluxo ficou mais seguro e guiado

---

# ⚡ Capsule 26 — Character Builder Attributes UI

## 🎯 Goal

Criar etapa visual de atributos.

## ✅ Result

- 6 atributos:
  - Força
  - Destreza
  - Constituição
  - Inteligência
  - Sabedoria
  - Carisma
- valor inicial editável
- botões + e -
- input numérico
- cálculo automático de modificador
- total de atributos
- reset visual
- resumo lateral mostra total/maior atributo
- aviso de acessibilidade resolvido com `aria-label`

## ⚠️ Próximo passo

A etapa é visual/local. Ainda falta persistir em `CharacterSheetStat`.

---

# 🧠 Estado Atual do Projeto

O projeto está em:

👉 **Fase 4 — Criação/Ficha de Personagem**

Estado:

- Auth funcional
- Banco integrado
- API funcionando
- Campanhas reais
- Mesa de jogo em andamento
- Atores/tokens persistidos
- Sistema RPG base
- Builder de personagem em andamento

---

# 🚧 Próxima fase imediata

```txt
4.15 — Persistir atributos no banco
```

---

# 🧠 Regra de Ouro

> Cada cápsula deve gerar valor real e aproximar o sistema de ser jogável.
