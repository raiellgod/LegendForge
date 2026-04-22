# 📊 DEV STATE — LegendForge

---

## 📅 Last Update

15/04/2026

---

## 🧱 Project Structure

LegendForge/
├── backend/
│ ├── src/
│ │ ├── modules/
│ │ ├── db/
│ │ ├── plugins/
│ │ └── server.ts
│ │
│ ├── prisma/
│ │ ├── schema.prisma
│ │ └── migrations/
│ │
│ └── package.json
│
├── frontend/
│ ├── src/
│ └── package.json
│
├── docs/
│ ├── DEV_STATE.md
│ ├── ARCHITECTURE.md
│ ├── BOOT.md
│ ├── FEATURE_CAPSULE.md
│ └── DEVELOPER_CONFIG-UTILIZE.txt


---

## ⚙️ Dependencies (Backend)

### 🧪 Core

- Node.js  
- Fastify  
- TypeScript  

---

### 🗄️ Database

- PostgreSQL  
- Prisma *(em implementação)*  

---

### 🧹 Qualidade de Código

- ESLint  
- Prettier  

---

## 🗄️ Database (STATUS REAL)

### ✅ Modelagem

- ✔️ Estrutura final definida (nível produção — 11/10)  
- ✔️ Normalização correta  
- ✔️ Suporte a múltiplos sistemas RPG  
- ✔️ Multiclasse funcional  
- ✔️ Inventário baseado em instância  
- ✔️ Sistema de features unificado  

---

### ⚠️ Pontos Críticos já considerados

- ✔️ Limite de atributos (1–30)  
- ✔️ Limite de nível (1–20)  
- ✔️ Integridade de subclasses (via trigger)  
- ✔️ Ownership de features (CHECK constraint)  
- ✔️ Base preparada para escala  

---

### 🚧 Em andamento

- [ ] Tradução completa para `schema.prisma`  
- [ ] Criação de migrations reais  
- [ ] Implementação de constraints no PostgreSQL  

---

## 🧩 Database Capabilities

O banco já suporta:

- 🎭 Multiclasse complexa  
- 🧬 Sistemas de RPG diferentes  
- ⚔️ Itens customizados por personagem  
- 📜 Logs de campanha escaláveis  
- 🧠 Expansão futura (IA, sistemas novos)  

---

## 🌐 API (STATUS)

### ❌ Ainda não implementado

Nenhum endpoint conectado ao banco ainda.

---

### 🎯 Primeiros endpoints planejados

- POST `/users`  
- POST `/sessions`  
- GET `/campaigns`  
- POST `/campaigns`  

---

## 🎨 Frontend / Figma

### ✅ Pronto

- Fluxo de criação de campanha  

---

### 🟡 Em progresso

- Buscar campanhas  
- Tela inicial da mesa  

---

### 🔜 Próximo

- Tela da mesa (core do produto)  

---

## 🧠 Sistema RPG

### ✅ Definido

- Classes  
- Subclasses  
- Progressão (1–20)  
- Talentos (feats)  
- Estrutura de atributos  

---

### 🟡 Em evolução

- Balanceamento  
- Ajustes finos de progressão  

---

## ✅ Implemented Features

- ⚡ Fastify configurado  
- 🧱 Base do backend pronta  
- 🧪 Ambiente de desenvolvimento funcional  
- 🧠 Modelagem de domínio consolidada  

---

## 🎯 Current Focus

### 🔥 FASE ATUAL: INTEGRAÇÃO REAL

O projeto saiu do planejamento.

Agora está em:

👉 **conectar banco + backend + regras reais**

---

### Backend

- Prisma  
- Migrations  
- Primeiros módulos reais  

---

### Frontend

- Fluxo mínimo jogável  
- Integração com API  

---

## 🚀 Next Steps

### 🔴 Crítico

- [ ] Criar `schema.prisma`
- [ ] Rodar primeira migration
- [ ] Validar constraints no banco

---

### 🟠 Backend

- [ ] Criar módulo de users
- [ ] Implementar autenticação
- [ ] Criar services
- [ ] Integrar Zod

---

### 🟡 Produto

- [ ] Criar campanha via API
- [ ] Criar personagem
- [ ] Persistir dados reais

---

## ⚠️ Pontos de Atenção

### 📊 Escalabilidade

- `campaign_logs` crescerá rapidamente  
- Futuro: partitioning  

---

### 🧠 Versionamento

- Ainda básico  
- Futuro: versionamento real de sistemas RPG  

---

### ⚙️ Regras Complexas

Algumas regras NÃO podem depender só do backend:

- precisam existir no banco  
- e também ser validadas na API  

---

## 🧠 Architecture Notes

- Sistema já saiu do nível inicial  
- Complexidade controlada, mas crescente  
- Banco é o núcleo do sistema  

---

## 🏁 Estado Atual

👉 **PRONTO PARA IMPLEMENTAÇÃO REAL**

- Arquitetura sólida  
- Banco robusto  
- UI definida  

Falta:

👉 transformar tudo em código funcional

---