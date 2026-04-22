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

---

## ⚙️ Dependencies Installed

- Node  
- TypeScript  
- @types/node  
- Prettier  
- ESLint  
- tsx  

---

## 🛠️ Tooling & Config

- `git init`  
- `tsc --init`  
- ESLint configurado  
- Prettier integrado  
- Ordenação automática de imports  

---

## 🧪 Changes Made

- estrutura inicial criada  
- TypeScript configurado  
- scripts de desenvolvimento funcionando  

---

## ✅ Result

- ambiente funcional  
- código padronizado  
- execução consistente  

---

# ⚡ Capsule 02 — Backend Base

## 🎯 Goal

Criar base do backend com Fastify.

---

## ⚙️ Dependencies Installed

- Fastify  
- Zod  
- Swagger  

---

## 🧪 Changes Made

- inicialização do servidor  
- integração com Zod  
- documentação com Swagger  

---

## ✅ Result

- API funcional  
- validação estruturada  
- documentação disponível  

---

# 🧠 Capsule 03 — Data & UI Design

## 🎯 Goal

Definir domínio do sistema antes da implementação.

---

## ⚙️ Tools Used

- dbdiagram.io  
- Figma  

---

## 🧪 Changes Made

- modelagem inicial do banco  
- definição de entidades principais  
- estrutura inicial da UI  

---

## ✅ Result

- base conceitual sólida  
- visão clara do produto  

---

# ⚡ Capsule 04 — Database Design (Core)

## 🎯 Goal

Criar estrutura completa do banco.

---

## 🧪 Evolução

Essa cápsula passou por múltiplas refatorações até atingir nível produção.

---

## ✅ Result (FINAL)

- banco modelado com qualidade profissional  
- normalização adequada  
- suporte a:

### 🧩 Domínio

- usuários  
- campanhas  
- personagens  
- classes e subclasses  
- sistemas de RPG  

### ⚙️ Engenharia

- multiclasse  
- inventário por instância  
- sistema de features unificado  
- logs escaláveis  

---

## 🧠 Decisões Importantes

- features centralizadas em uma tabela  
- regras críticas no banco (não só no backend)  
- separação entre modelo e instância (items vs inventory)  

---

## ⚠️ Complexidades Tratadas

- limite de atributos (1–30)  
- limite de nível (1–20)  
- integridade de subclasses (trigger)  
- ownership de features (CHECK constraint)  
- base preparada para escala  

---

## 🚧 Next

- implementar via Prisma  
- criar migrations reais  
- validar constraints no PostgreSQL  

---

# ⚡ Capsule 05 — Figma UI

## 🎯 Goal

Criar interface visual do sistema.

---

## 🧪 Changes Made

- fluxo de criação de campanha  
- estrutura de navegação  
- base da mesa de jogo  

---

## ✅ Result

- UX definida  
- fluxo principal claro  

---

## 🟡 Em progresso

- buscar campanhas  
- tela inicial da mesa  

---

## 🔜 Next

- integração com backend  
- interação real com dados  

---

# ⚡ Capsule 06 — System Design (RPG)

## 🎯 Goal

Criar sistema próprio de RPG.

---

## 🧪 Changes Made

- classes definidas  
- subclasses definidas  
- progressão 1–20  
- talentos (feats) criados  
- estrutura de atributos  

---

## ✅ Result

- sistema jogável conceitualmente  
- pronto para integração  

---

## 🟡 Em evolução

- balanceamento  
- ajustes finos  

---

## 🔜 Next

- integrar ao banco  
- criar lógica de cálculo  
- validar progressão real  

---

# ⚡ Capsule 07 — Database Refinement (Senior Level)

## 🎯 Goal

Elevar o banco para nível produção real.

---

## 🧪 Changes Made

- remoção de JSON desnecessário  
- normalização completa  
- criação de enums  
- revisão de relações  
- preparação para múltiplos sistemas RPG  

---

## ✅ Result

- banco nível sênior (quase enterprise)  
- pronto para escalar  
- consistente  

---

## ⚠️ Aprendizados

- banco NÃO é só armazenamento → é regra de negócio  
- constraints são obrigatórias  
- trigger resolve problemas que FK não resolve  

---

# ⚡ Capsule 08 — Production Constraints & Integrity

## 🎯 Goal

Implementar regras críticas no banco.

---

## 🧪 Changes Made

- validação de atributos (1–30)  
- validação de nível (1–20)  
- estrutura para validação de multiclasse  
- preparação para triggers  

---

## ✅ Result

- integridade forte de dados  
- redução de bugs futuros  

---

## ⚠️ Observação

Nem tudo pode ser resolvido só com constraint:

- soma de níveis  
- validações complexas  

→ requer backend + banco  

---

# ⚡ Capsule 09 — Prisma Integration (CURRENT)

## 🎯 Goal

Conectar modelagem ao sistema real.

---

## 🧪 Em andamento

- criação do `schema.prisma`  
- adaptação do banco para ORM  
- planejamento de migrations  

---

## 🎯 Resultado Esperado

- banco operacional  
- API persistindo dados reais  

---

## 🔥 Próximo passo crítico

- rodar primeira migration  
- validar estrutura no PostgreSQL  

---

# 🧠 Estado Atual do Projeto

O projeto saiu de:

👉 conceito  
👉 design  
👉 modelagem  

E entrou em:

👉 **implementação real**

---

## 🏁 Status

✔ Arquitetura sólida  
✔ Banco robusto  
✔ Sistema definido  

🚧 Falta:

👉 transformar tudo em código funcional  

---

## 🧠 Regra de Ouro

> Cada cápsula deve gerar valor real  
> e deixar o sistema mais próximo de ser jogável

---