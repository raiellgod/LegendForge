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
- Prisma
- PostgreSQL
- Better Auth
- Zod
- Swagger
- Scalar API Reference
- Docker

### 🎨 Frontend

- Next.js
- React
- Tailwind CSS
- TypeScript
- Better Auth Client
- Figma

---

## 📊 Current State

- ✅ Backend funcional com Fastify
- ✅ Docker/PostgreSQL funcionando
- ✅ Prisma configurado e conectado ao banco
- ✅ Banco sincronizado com `db push`
- ✅ Prisma Client gerado
- ✅ Prisma Studio funcionando
- ✅ Better Auth integrado ao banco
- ✅ Registro e login funcionando
- ✅ Sessões persistidas no banco
- ✅ Backend lendo sessão por cookie com `auth.api.getSession`
- ✅ Frontend chamando rotas protegidas com `credentials: "include"`
- ✅ Documentação interativa via Scalar/Swagger
- ✅ Home logada `/campaigns` funcionando
- ✅ Criação inicial de campanha funcionando
- ✅ Tela `/campaigns/[id]/edit` iniciada
- 🚧 Busca de campanhas pendente
- 🚧 Página de jogo pendente
- ⚠️ Backend ainda sem camada de services completa

---

## 🎯 Next Tasks (FOCO ATUAL)

### 🔥 PRIORIDADE CRÍTICA (AGORA)

- [ ] Consolidar backend de campanhas
- [ ] Ajustar `GET /campaigns/:id` para retornar `description` e `coverImage`
- [ ] Ajustar `PATCH /campaigns/:id` para atualizar:
  - name
  - description
  - coverImage
  - isPublic
- [ ] Criar rota para campanhas públicas/busca
- [ ] Validar fluxo:
  - Login → `/campaigns`
  - Criar campanha → `/campaigns/:id/edit`
  - Editar campanha → persistir mudanças

---

### 🧠 BACKEND (PRÓXIMA ETAPA)

- [ ] Criar `GET /campaigns/public`
- [ ] Melhorar `POST /campaigns/join`
- [ ] Definir status de participante
- [ ] Criar camada de services quando regras crescerem
- [ ] Padronizar responses de erro
- [ ] Revisar permissões de GM/PLAYER
- [ ] Preparar upload real de imagem no futuro

---

### 🧩 FEATURES INICIAIS

- [x] Auth real
- [x] Home logada de campanhas
- [x] Criar campanha
- [x] Entrar como GM automaticamente ao criar campanha
- [x] Tela inicial de edição/finalização da campanha
- [ ] Buscar campanha
- [ ] Entrar em campanha pública/por convite
- [ ] Criar página de jogo
- [ ] Criar personagens

---

### 🔐 AUTENTICAÇÃO

- [x] Registro
- [x] Login
- [x] Persistência de sessão
- [x] Backend usando sessão do Better Auth
- [x] Frontend enviando cookies
- [ ] Refinar tratamento de erro de sessão expirada
- [ ] Revisar logout e redirects finais

---

### 🎨 FRONTEND

- [x] Home pública
- [x] Login
- [x] Registro
- [x] Header privado
- [x] Fundo parchment
- [x] Botão base
- [x] `/campaigns`
- [x] `/campaigns/create`
- [x] `/campaigns/[id]/edit`
- [ ] `/campaigns/search`
- [ ] `/campaigns/[id]/play`
- [ ] Responsividade fina
- [ ] Upload real de capa

---

## ⚡ Quick Context

O projeto saiu da fase de:

❌ planejamento  
❌ modelagem isolada  
❌ auth desconectado  
❌ frontend mockado  

E entrou em:

✅ **fluxo real de campanha funcionando**

---

## 🧠 Foco Atual

- Não avançar features grandes em cima de backend incompleto.
- Consolidar campanhas.
- Evitar mock quando já existe API.
- Manter cada etapa funcional.

---

## ⚠️ Regras Importantes

> Auth é o núcleo do sistema.  
> Campanhas dependem diretamente de `user.id`.

> Backend é a fonte da verdade.  
> Frontend deve consumir API real sempre que possível.

---

## 🛠️ Comandos úteis

### Backend

```bash
cd backend
docker compose up -d
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm run dev
```

### Prisma Studio

```bash
cd backend
pnpm prisma studio
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Limpar cache do Next

```bash
cd frontend
rm -rf .next
pnpm run dev
```

### Observação local

O frontend está usando:

```json
"dev": "next dev --webpack"
```

para evitar instabilidade local com Turbopack.

---

## 🚀 Estado Atual

👉 **AUTH + CAMPAIGN FRONTEND FLOW WORKING**

- Auth funcionando
- Banco integrado
- API respondendo
- Home de campanhas conectada
- Criação de campanha funcionando
- Tela inicial de edição criada
- Próximo passo: consolidar backend de campanhas e busca
