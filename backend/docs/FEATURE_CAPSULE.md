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

## ⚙️ Dependencies Installed

- Node
- TypeScript
- @types/node
- Prettier
- ESLint
- tsx

## 🛠️ Tooling & Config

- `git init`
- `tsc --init`
- ESLint configurado
- Prettier integrado
- Ordenação automática de imports

## ✅ Result

- ambiente funcional
- código padronizado
- execução consistente

---

# ⚡ Capsule 02 — Backend Base

## 🎯 Goal

Criar base do backend com Fastify.

## ⚙️ Dependencies Installed

- Fastify
- Zod
- Swagger

## ✅ Result

- API funcional
- validação estruturada
- documentação disponível

---

# 🧠 Capsule 03 — Data & UI Design

## 🎯 Goal

Definir domínio do sistema antes da implementação.

## ⚙️ Tools Used

- dbdiagram.io
- Figma

## ✅ Result

- base conceitual sólida
- visão clara do produto

---

# ⚡ Capsule 04 — Database Design (Core)

## 🎯 Goal

Criar estrutura completa do banco.

## ✅ Result (FINAL)

- banco modelado com qualidade profissional
- normalização adequada
- suporte a:
  - campanhas
  - personagens
  - classes e subclasses
  - sistemas de RPG
  - participantes
  - sessões
  - logs

## 🧠 Decisões Importantes

- Better Auth é o núcleo de identidade
- features centralizadas em uma tabela
- regras críticas no banco/backend
- separação entre modelo e instância

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
- base visual para capa, informações da campanha e owner

## 🟡 Em progresso

- busca de campanhas
- tela da mesa
- responsividade fina
- fluxo definitivo de upload de imagem

---

# ⚡ Capsule 06 — System Design (RPG)

## 🎯 Goal

Criar sistema próprio de RPG.

## ✅ Result

- classes definidas
- subclasses definidas
- progressão 1–20
- talentos (feats)
- estrutura de atributos
- base para múltiplos sistemas

---

# ⚡ Capsule 07 — Database Refinement (Senior Level)

## 🎯 Goal

Elevar o banco para nível produção real.

## ✅ Result

- banco nível sênior
- consistente
- escalável
- preparado para múltiplos sistemas, campanhas, personagens e inventário

---

# ⚡ Capsule 08 — Production Constraints & Integrity

## 🎯 Goal

Definir regras críticas de integridade.

## ✅ Result

- limites de atributos
- limites de nível
- preparação para validações complexas
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

Implementar sistema de autenticação real.

## 🧪 Changes Made

- Better Auth integrado
- Prisma Adapter configurado
- tabelas oficiais:
  - `user`
  - `session`
  - `account`
  - `verification`
- login e registro funcionando
- sessões persistidas no banco
- frontend usando `authClient`
- backend lendo sessão real por cookie com `auth.api.getSession`

## ✅ Result

- registro funcionando
- login funcionando
- sessão persistente
- rota protegida usando sessão real
- fluxo frontend ↔ backend estabilizado

## 🧠 Decisão Crítica

> Auth NÃO é mais parte do sistema  
> → é o núcleo do sistema

Todo o domínio depende de:

```txt
user.id
```

---

# ⚡ Capsule 11 — API Integration

## 🎯 Goal

Validar sistema funcionando end-to-end.

## 🧪 Changes Made

- integração Fastify + Auth
- testes via Swagger/Scalar
- validação de endpoints
- persistência real de dados
- CORS ajustado para frontend local
- fluxo de sessão via cookie validado

## ✅ Result

- API funcional
- auth integrado
- banco persistindo dados reais
- base pronta para domínio de campanhas

---

# ⚡ Capsule 12 — Campaign Domain API

## 🎯 Goal

Criar primeiras rotas reais de campanha.

## 🧪 Changes Made

- `POST /campaigns`
- `GET /campaigns`
- `GET /campaigns/:id`
- `PATCH /campaigns/:id`
- `DELETE /campaigns/:id`
- `POST /campaigns/join`
- rotas de participantes:
  - listar participantes
  - trocar role
  - remover participante

## ✅ Result

- usuário autenticado consegue criar campanha
- criador entra automaticamente como `GM`
- home logada lista campanhas onde o usuário é owner ou participant
- GET de campanha por id pronto para tela de edição
- PATCH preparado para nome, descrição, capa e visibilidade

---

# ⚡ Capsule 13 — Campaign Frontend Flow

## 🎯 Goal

Implementar fluxo inicial real de campanhas no frontend.

## 🧪 Changes Made

- página `/campaigns`
  - estado sem campanhas
  - estado com campanhas
  - cards reais vindos da API
- página `/campaigns/create`
  - nome da campanha
  - seleção visual de ficha/sistema
  - criação real via API
  - redirecionamento para edição da campanha
- página `/campaigns/[id]/edit`
  - leitura real da campanha
  - nome digitado aparece como título
  - placeholder/preview de capa
  - modal de imagem dentro da área da capa
  - botões de ação
  - card “Forjado por”
  - descrição inicial da campanha

## ✅ Result

- primeiro fluxo de campanha funcionando de ponta a ponta
- frontend conectado ao backend real
- UI alinhada com o Figma atual
- base pronta para evoluir busca de campanha e página de jogo

---

# 🧠 Estado Atual do Projeto

O projeto saiu de:

👉 conceito  
👉 design  
👉 modelagem  
👉 auth isolado  

E entrou em:

👉 **fluxo real de campanha funcionando**

---

## 🏁 Status

✔ Auth funcional  
✔ Banco integrado  
✔ API funcionando  
✔ Frontend conectado  
✔ Home logada de campanhas pronta  
✔ Criação inicial de campanha pronta  
✔ Tela de edição/finalização inicial pronta  

---

## 🚧 Próxima fase

👉 consolidar backend de campanhas e busca

- busca de campanhas públicas
- convite/código de entrada
- regras de participação
- descrição e capa persistidas com fluxo mais robusto
- futura integração com storage real
- início da página de jogo

---

## 🧠 Regra de Ouro

> Cada cápsula deve gerar valor real  
> e aproximar o sistema de ser jogável