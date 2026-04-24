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
- regras críticas no banco  
- separação entre modelo e instância  

---

## ⚠️ Complexidades Tratadas

- limite de atributos (1–30)  
- limite de nível (1–20)  
- integridade de subclasses  
- ownership de features  
- base preparada para escala  

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

- busca de campanhas  
- tela da mesa  

---

# ⚡ Capsule 06 — System Design (RPG)

## 🎯 Goal

Criar sistema próprio de RPG.

---

## 🧪 Changes Made

- classes definidas  
- subclasses definidas  
- progressão 1–20  
- talentos (feats)  
- estrutura de atributos  

---

## ✅ Result

- sistema consistente  
- pronto para integração  

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
- suporte a múltiplos sistemas  

---

## ✅ Result

- banco nível sênior  
- consistente  
- escalável  

---

## ⚠️ Aprendizados

- banco é parte da lógica de negócio  
- constraints são essenciais  
- triggers resolvem validações complexas  

---

# ⚡ Capsule 08 — Production Constraints & Integrity

## 🎯 Goal

Definir regras críticas de integridade.

---

## 🧪 Changes Made

- limites de atributos  
- limites de nível  
- preparação para validações complexas  

---

## ✅ Result

- dados protegidos  
- redução de inconsistências  

---

## ⚠️ Observação

Algumas regras exigem:

- banco + backend  

---

# ⚡ Capsule 09 — Prisma Integration

## 🎯 Goal

Conectar modelagem ao sistema real.

---

## 🧪 Changes Made

- criação do `schema.prisma`  
- adaptação do banco para ORM  
- geração do Prisma Client  
- sincronização com PostgreSQL  

---

## ✅ Result

- banco operacional  
- queries tipadas  
- integração backend ↔ banco  

---

# ⚡ Capsule 10 — Authentication (Better Auth)

## 🎯 Goal

Implementar sistema de autenticação real.

---

## 🧪 Changes Made

- integração do Better Auth  
- criação de tabelas:
  - user
  - session
  - account
  - verification  
- adaptação do backend  
- integração com Fastify  

---

## ✅ Result

- registro funcionando  
- login funcionando  
- sessões persistidas  
- autenticação real em produção  

---

## 🧠 Decisão Crítica

> Auth NÃO é mais parte do sistema  
> → é o núcleo do sistema

Todo o domínio agora depende de:

```txt
user.id
```

---

# ⚡ Capsule 11 — API Integration (Current)

## 🎯 Goal

Validar sistema funcionando end-to-end.

---

## 🧪 Changes Made

- integração Fastify + Auth  
- testes via Swagger/Scalar  
- validação de endpoints  
- persistência real de dados  

---

## ✅ Result

- API funcional  
- fluxo completo validado  
- base pronta para expansão  

---

# 🧠 Estado Atual do Projeto

O projeto saiu de:

👉 conceito  
👉 design  
👉 modelagem  

E entrou em:

👉 **sistema real funcionando**

---

## 🏁 Status

✔ Auth funcional  
✔ Banco integrado  
✔ API funcionando  
✔ Base sólida  

---

## 🚧 Próxima fase

👉 expansão do domínio RPG  

- campaigns  
- characters  
- inventory  
- permissions  

---

## 🧠 Regra de Ouro

> Cada cápsula deve gerar valor real  
> e aproximar o sistema de ser jogável  

---