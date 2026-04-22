# 🚀 BOOT — LegendForge

---

## 📌 Project

**LegendForge**  
Virtual Tabletop (VTT)

---

## ⚙️ Stack

### 🖥️ Backend

- Node.js  
- Fastify  
- TypeScript  
- Prisma (em implementação)  
- PostgreSQL (fonte de verdade)  

---

### 🎨 Frontend (em progresso)

- React  
- Vite  
- Tailwind  
- TypeScript  

---

## 📊 Current State

- ✅ Backend base funcional  
- ✅ Arquitetura definida  
- ✅ Banco de dados modelado (nível produção ~11/10)  
- ✅ Figma estruturado até fluxo de criação de partida  
- 🚧 Prisma sendo integrado  
- ⚠️ API ainda não conectada ao banco real  

---

## 🎯 Next Tasks (FOCO ATUAL)

### 🔥 PRIORIDADE CRÍTICA (AGORA)

- [ ] Criar `schema.prisma` baseado no banco final
- [ ] Configurar conexão com PostgreSQL
- [ ] Rodar primeira migration real
- [ ] Validar estrutura no banco (constraints + integridade)

---

### 🧠 BACKEND (PRÓXIMA ETAPA)

- [ ] Criar módulo `users`
- [ ] Implementar autenticação (sessions)
- [ ] Estruturar camada de services
- [ ] Integrar validação (Zod)

---

### 🧩 FEATURES INICIAIS

- [ ] POST `/users`
- [ ] POST `/sessions`
- [ ] GET `/campaigns`
- [ ] POST `/campaigns`

---

### 🎨 FRONTEND

- [ ] Finalizar:
  - Criar Partida  
  - Procurar Partida  
- [ ] Iniciar:
  - Tela da mesa (core do produto)

---

## 📄 Project Docs

- `ARCHITECTURE.md` → visão e decisões  
- `DEV_STATE.md` → estado real atualizado  
- `FEATURE_CAPSULE.md` → progresso incremental  

---

## ⚡ Quick Context

O projeto NÃO está mais em fase de planejamento.

Estamos na fase mais importante:

👉 **Transformar arquitetura em sistema funcional**

---

## 🧠 Foco Atual

- Integração real com banco  
- Primeiras features persistidas  
- Validação de regras críticas  

---

## ⚠️ Regra Importante

> Não avançar features antes de validar a base.

Se o banco estiver errado → tudo quebra depois.

---

## 🎯 Mentalidade

- Construir pouco, mas certo  
- Validar cada camada  
- Evitar retrabalho  

---

## 🚀 Estado Atual

👉 **PRISMA INTEGRATION PHASE**

- Banco pronto  
- Arquitetura sólida  
- Hora de conectar tudo  

---