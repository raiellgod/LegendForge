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
- banco sincronizado

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
  - Criar criatura/inimigo
- personagem usa builder real
- NPC/criatura têm fluxo simples próprio de ator
- GM mantém criação completa
- player comum usa criação direta de personagem

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

# ⚡ Capsule 36 — Active Characters & Actor Lifecycle

## 🎯 Goal

Ajustar ciclo de vida de personagens, NPCs, criaturas, biblioteca e atores ativos.

## ✅ Result

- fluxo de atores em `TABLE`/`LIBRARY` revisado
- regras de biblioteca preservadas para NPCs/criaturas
- preparação para personagem ativo por player
- decisão mantida: personagem de player/GM não deve ser tratado como NPC
- decisão futura registrada: NPCs terão ficha própria
- decisão futura registrada: criaturas terão bloco próprio de bestiário

---

# ⚡ Capsule 37 — Ready Character Sheet

## 🎯 Goal

Transformar a ficha pronta em uma visualização jogável e organizada.

## ✅ Result

- `CharacterReadySheetModal` consolidado
- abas criadas na ordem:
  - Ficha/Status
  - Bolsa
  - Magia
  - Perfil
- identidade movida para header fixo
- Ficha/Status compactada
- todas as perícias aparecem, não apenas as proficientes
- testes e perícias preparados como linhas clicáveis
- Bolsa concentra moedas, equipamentos e ataques derivados de equipamento
- Magia concentra truques/magias
- Perfil concentra retrato, token, personalidade, aparência, história e notas
- span “Visão do mestre” removido
- notas do mestre aparecem apenas para GM
- retrato/token por URL com persistência
- token/ficha sincronizam imagem e fit quando salvos

---

# ⚡ Capsule 38 — Ready Sheet Roll Actions

## 🎯 Goal

Conectar a ficha pronta ao sistema de rolagens da mesa.

## ✅ Result

- contrato `CharacterReadySheetRollRequest` criado
- parser de dados aceita modificadores numéricos positivos e negativos
- clicar em perícia rola `1d20 + bônus`
- clicar em teste de resistência rola `1d20 + bônus`
- clicar em iniciativa rola `1d20 + iniciativa`
- GM pode rolar iniciativa da mesa
- ranking de iniciativa inclui:
  - personagens
  - NPCs
  - criaturas
- ranking não usa emojis
- personagens usam iniciativa real da ficha
- NPCs/criaturas usam +0 enquanto não têm ficha/stat block
- Bolsa tem botões pequenos:
  - Ataque
  - Dano
- ataque de equipamento é básico/provisório: `1d20 + 0`
- dano de equipamento rola expressão do item
- Magia tem botões:
  - Ataque
  - Dano
  - Efeito
- ataque mágico era básico/provisório antes da 4.27
- dano mágico é detectado pela descrição
- textos de UI deixam claro o que é provisório
- teste regressivo da 4.26 concluído

---

# ⚡ Capsule 39 — Player Character Creation Access

## 🎯 Goal

Permitir que player comum crie personagem pela aba Personagens.

## ✅ Result

- player comum vê botão `+ Personagem`
- player comum abre o builder diretamente
- GM continua vendo `Biblioteca` e fluxo completo de `+ Criar`
- ajuste preserva permissões diferentes de GM e player

---

# ⚡ Capsule 40 — Advanced Spell Progression Rules

## 🎯 Goal

Transformar a etapa de Magias e a aba Magia da ficha pronta em uma base real de regras de conjuração por classe/progressão.

## ✅ Result

- `CharacterClass.spellcastingAbilityKey` adicionado à modelagem.
- `LevelProgression` revisado/expandido para progressão por classe e nível.
- `ClassSpell` criado para relacionar classe e magias permitidas.
- Migration aplicada para regras de progressão de classe.
- Seed de progressão básica por classe populado.
- Seed mínimo de magias expandido para permitir testes reais.
- Seed de magias permitidas por classe populado.
- Rota `GET /systems/:systemId/character-options` passou a retornar:
  - `spellcastingAbilityKey`
  - `levelProgressions`
  - `classSpells`
- Builder passou a filtrar magias pela classe selecionada.
- Builder passou a validar limites de truques/magias por nível inicial.
- Builder limpa magias antigas ao trocar de classe.
- Ficha pronta calcula atributo de conjuração por classe.
- Ficha pronta calcula CD de magia real.
- Ficha pronta calcula ataque mágico real.
- Ficha pronta desabilita ataque mágico quando a classe não possui atributo de conjuração.
- Ficha pronta exibe espaços de magia vindos da progressão do nível atual.
- Aba Magia recebeu primeira reorganização visual.
- Resultado grande de rolagem foi corrigido para mostrar o total numérico da rolagem.
- Teste regressivo da 4.27 concluído.

## 🧪 Testado

- Bárbaro não mostra magias no builder.
- Bardo mostra apenas magias permitidas.
- Limite de truques/magias funciona com seed expandido.
- Trocar de classe limpa magias antigas.
- Bardo calcula Carisma, CD e ataque mágico corretamente.
- Ataque mágico rola `1d20 + bônus real`.
- Classe sem conjuração mostra valores `—` e bloqueia ataque mágico.
- Slots de magia aparecem na aba Magia.
- Dano mágico rola expressão detectada da descrição.
- Resultado grande do chat mostra soma final, não lista de dados.

## ⚠️ Limitações mantidas

- Dano de magia ainda é detectado pela descrição.
- Controle de slots usados ainda não existe.
- Ataque contra CA ainda não é automático.
- Ataque de equipamento ainda é provisório.
- Estrutura visual da ficha pronta será melhorada na 4.28.

---

# 🧭 Próxima cápsula esperada

```txt
Capsule 41 — Ready Sheet Structural Refactor
```

Foco esperado:

- arquitetura visual da ficha pronta
- shell fixo com centro variável
- cards compactos com expand/collapse
- aba Magia mais limpa
- aba Bolsa mais limpa
- preparação futura de ficha destacável/pop-out
