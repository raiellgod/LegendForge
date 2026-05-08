# 📊 DEV STATE — LegendForge

---

## 📅 Last Update

06/05/2026

---

## 🧱 Project Structure

```txt
LegendForge/
├── backend/
│   ├── src/
│   │   ├── generated/prisma/
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── get-authenticated-session.ts
│   │   │   └── prisma.ts
│   │   ├── routes/
│   │   │   └── campaigns.ts
│   │   └── index.ts
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/ui/
│   │   │   ├── button.tsx
│   │   │   ├── header.tsx
│   │   │   └── parchment-background.tsx
│   │   │
│   │   ├── lib/
│   │   │   └── auth-client.ts
│   │   └── service/
│   │
│   ├── public/
│   └── package.json
│
├── docs/
└── README.md
```

---

## ⚙️ Dependencies

### Backend

- Node.js
- Fastify
- TypeScript
- Prisma
- PostgreSQL
- Better Auth
- Zod
- Swagger
- Scalar API Reference
- ESLint
- Prettier
- pnpm
- Docker

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth Client
- lucide-react
- ESLint
- pnpm

---

## 🗄️ Database — Status Real

### ✅ Implementado

- Better Auth tables:
  - user
  - session
  - account
  - verification
- GameSystem
- Stat
- Skill
- Campaign
- Participant
- GameSession

### ✅ Validado

- registro cria usuário
- login cria sessão
- sessão aparece no Prisma Studio
- campanhas são criadas com owner
- criador entra como participante GM
- home lista campanhas do usuário autenticado

### 🚧 Em andamento

- expandir schema completo do domínio RPG
- refinar constraints
- aplicar regras SQL avançadas
- melhorar modelo de convite/status
- preparar upload real de capa

---

## 🌐 API — Status

### ✅ Implementado

- Fastify configurado
- CORS funcionando para frontend local
- Better Auth exposto em `/api/auth/*`
- Swagger em `/swagger.json`
- Scalar em `/docs`
- Helper `getAuthenticatedSession` usando sessão real do Better Auth
- Rotas de campanha:
  - `POST /campaigns`
  - `GET /campaigns`
  - `GET /campaigns/:id`
  - `PATCH /campaigns/:id`
  - `DELETE /campaigns/:id`
  - `POST /campaigns/join`
  - `GET /campaigns/:id/participants`
  - `PATCH /campaigns/:campaignId/participants/:participantId/role`
  - `DELETE /campaigns/:campaignId/participants/:participantId`

### ⚠️ Ajustes pendentes

- garantir que `GET /campaigns/:id` retorna:
  - description
  - coverImage
- garantir que `PATCH /campaigns/:id` atualiza:
  - name
  - description
  - coverImage
  - isPublic
- criar endpoint para busca:
  - `GET /campaigns/public`
  - ou `GET /campaigns/search`

---

## 🎨 Frontend — Status

### ✅ Implementado

- Home pública
- Login
- Registro
- Header privado
- Background parchment
- Botão base com variants
- `/campaigns`
  - estado sem campanhas
  - estado com campanhas
  - cards reais
- `/campaigns/create`
  - cria campanha real
  - redireciona para edição
- `/campaigns/[id]/edit`
  - mostra nome da campanha
  - mostra placeholder/preview de capa
  - modal de imagem dentro da área da capa
  - mostra owner
  - botões de ação
  - select de sistema/ficha
  - campo de descrição visual

### 🚧 Próximas telas

- `/campaigns/search`
- `/campaigns/[id]/play`
- página de conta/assinatura
- páginas de conteúdo/configurações da campanha

---

## 🧠 Campanhas — Fluxo Atual

1. Usuário registra/loga.
2. Frontend redireciona para `/campaigns`.
3. `/campaigns` chama API com cookie de sessão.
4. Se não houver campanhas, mostra:
   - Iniciar uma nova aventura
   - Buscar uma aventura
   - Conheça-nos
5. Ao criar campanha:
   - usuário informa nome
   - POST `/campaigns`
   - backend cria campanha
   - backend cria participante GM
   - frontend redireciona para `/campaigns/:id/edit`
6. Tela de edição mostra:
   - capa/placeholder
   - nome do mundo
   - ações
   - descrição
   - owner

---

## ⚠️ Pontos de Atenção

### Tailwind/Next

- Em dev local, usar `next dev --webpack`.
- Cache `.next` pode precisar ser limpo em mudanças de configuração.
- Tailwind v4 usa:

```css
@import "tailwindcss";
```

e `postcss.config.mjs` com:

```js
"@tailwindcss/postcss": {}
```

### Imagem de capa

- Implementação atual usa string/base64 temporária.
- Futuro:
  - storage real
  - upload controlado
  - crop
  - validação de tamanho
  - remoção segura

### Backend

- Ainda sem camada de services.
- Rotas estão concentradas em `routes/campaigns.ts`.
- Próximo passo deve consolidar regras antes de crescer frontend.

---

## ✅ Implemented Features

- Auth real
- Sessão real com cookie
- Backend protegido por usuário autenticado
- Home logada de campanhas
- Criação de campanha
- Participante GM automático
- Edição inicial da campanha
- Upload visual/placeholder de capa
- Prisma Studio validando dados

---

## 🎯 Current Focus

### 🔥 FASE ATUAL

👉 **Campaign Backend Consolidation**

Agora o foco é:

- consolidar `GET /campaigns/:id`
- consolidar `PATCH /campaigns/:id`
- criar busca de campanhas
- preparar entrada em campanha
- depois criar tela `/campaigns/search`

---

## 🚀 Next Steps

### 🔴 Crítico

- [ ] Finalizar resposta completa de `GET /campaigns/:id`
- [ ] Finalizar update de campanha via `PATCH /campaigns/:id`
- [ ] Criar endpoint de busca pública
- [ ] Testar criação → edição → retorno à home
- [ ] Confirmar que card aparece na home após criar campanha

### 🟠 Backend

- [ ] Criar service de campaigns quando regras aumentarem
- [ ] Padronizar erros
- [ ] Refinar permissões owner/GM/player
- [ ] Melhorar join por inviteCode

### 🟡 Frontend

- [ ] Criar `/campaigns/search`
- [ ] Criar estados de loading/empty/error melhores
- [ ] Ajustar proporção da capa
- [ ] Refinar responsividade

---

## 🏁 Estado Atual

👉 **AUTH + CAMPAIGN FLOW FUNCIONANDO**

- Backend ativo
- Banco ativo
- Auth validado
- Frontend conectado
- Criação de campanha funcional
- Próximo foco: busca e regras de campanha
