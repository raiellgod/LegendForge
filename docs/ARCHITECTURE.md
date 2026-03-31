====================================
LEGEND FORGE — PROJECT CONTEXT
====================================

VISÃO DO PROJETO

LegendForge é um Virtual Tabletop (VTT) para RPG de mesa.

Inspirado em plataformas como Roll20 e Foundry Virtual Tabletop,
porém com foco em:

- ser agnóstico de sistema
- permitir campanhas personalizadas
- servir como ferramenta prática para jogar com amigos

Também é um projeto de portfólio e aprendizado.


------------------------------------
OBJETIVOS PRINCIPAIS
------------------------------------

1. Criar uma mesa virtual funcional

- chat
- rolagem de dados
- campanhas
- fichas de personagem
- mapas (futuro)

2. Construir um projeto forte de portfólio

- arquitetura backend organizada
- código limpo e modular
- boas práticas modernas

3. Evoluir como programador

- aprender backend moderno
- entender banco de dados
- trabalhar com sistemas reais


------------------------------------
FILOSOFIA DE DESENVOLVIMENTO
------------------------------------

O projeto segue desenvolvimento incremental.

Princípios:

- pequenos passos diários
- sempre ter algo funcionando
- evoluir stack por stack
- evitar complexidade prematura
- aceitar refatorações
- sem pressa

O objetivo não é velocidade.
É consistência.


------------------------------------
ESTRATÉGIA DE REPOSITÓRIO
------------------------------------

Inicialmente:

- backend e frontend separados

Estrutura:

LegendForge/
backend/
frontend/
docs/

Motivo:

- reduzir complexidade inicial
- focar primeiro no backend

No futuro:

- possibilidade de migrar para monorepo com pnpm


------------------------------------
STACK TECNOLÓGICA
------------------------------------

Backend:

- Node.js
- Fastify
- TypeScript
- Prisma
- PostgreSQL
- pnpm

Frontend (futuro):

- React
- Vite
- Tailwind
- TypeScript

Ferramentas:

- VS Code
- Git


------------------------------------
ARQUITETURA DO BACKEND
------------------------------------

Estrutura planejada:

src/

modules/

user/
user.routes.ts
user.controller.ts
user.service.ts

campaign/
campaign.routes.ts
campaign.controller.ts
campaign.service.ts

db/
prisma.ts

plugins/

server.ts


Objetivo:

- separar responsabilidades
- evitar arquivos grandes
- facilitar manutenção


------------------------------------
ESTRATÉGIA DE DESENVOLVIMENTO
------------------------------------

O projeto será desenvolvido usando Feature Capsules.

Cada feature:

- pequena
- independente
- testável
- funcional

Exemplos:

1. Server Boot
2. User System
3. Campaign System
4. Dice Roller
5. Chat


------------------------------------
ROADMAP INICIAL
------------------------------------

Step 0:
Setup inicial

Step 1:
Setup backend

Step 2:
Banco de dados + User

Step 3:
Autenticação

Step 4:
Campanhas

Step 5:
Dice Roller

Step 6:
Chat

Step 7:
Fichas


------------------------------------
IMPORTANTE
------------------------------------

Este arquivo NÃO representa o estado atual do projeto.

Ele representa:

- visão
- direção
- decisões arquiteturais

Para estado atual usar:

DEV_STATE.md

Para entrada rápida usar:

BOOT.md