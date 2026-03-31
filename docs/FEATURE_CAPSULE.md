# 📦 FEATURE CAPSULES — LegendForge

---

## 📌 About

Este arquivo registra o desenvolvimento incremental do projeto.

Cada cápsula representa:

- uma etapa pequena  
- funcional  
- testável  
- concluída  

---

# 🧱 Capsule 01 — Setup

## 🎯 Goal

Configurar o ambiente inicial de desenvolvimento do backend.

---

## ⚙️ Dependencies Installed

- Node — 24.13.1  
- TypeScript — 5.9.3  
- @types/node — 24.10.13  
- Prettier — 3.8.1  
- ESLint — 9.39.2  
- tsx — 4.21.0  

---

## 🛠️ Tooling & Config

- `git init`  
- `tsc --init`  
- ESLint configurado via CLI  
- Prettier integrado  
- `eslint-config-prettier` configurado  
- `eslint-plugin-simple-import-sort` configurado  

### Configurações importantes

- Importação do Prettier config:
```ts
import eslintConfigPrettier from 'eslint-config-prettier/flat'
```

- Plugin de ordenação de imports:
```ts
import simpleImportSort from 'eslint-plugin-simple-import-sort'
```

- Regras aplicadas:
```ts
{
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
}
```

---

## 🧪 Changes Made

- `tsconfig.json` ajustado  
- pasta `src/` criada  
- `index.ts` criado e modificado  
- pasta `dist/` gerada  
- `index.js` compilado  
- `package.json` configurado  
- script de desenvolvimento funcionando  
- `.npmrc` configurado  

---

## ✅ Result

- Ambiente de desenvolvimento funcional  
- TypeScript compilando corretamente  
- Lint e formatação ativos  
- Execução via `tsx` funcionando  

---

# ⚡ Capsule 02 — Backend Base

## 🎯 Goal

Adicionar base do backend com Fastify e ferramentas essenciais.

---

## ⚙️ Dependencies Installed

- Fastify — 5.7.4  
- Zod — 4.3.6  
- fastify-type-provider-zod — 6.1.0  
- @fastify/swagger — 9.7.0  
- @fastify/swagger-ui — 5.2.5  

---

## 🧪 Changes Made

- instalação do Fastify  
- integração inicial do Zod  
- configuração base de tipagem com Zod  
- adição de Swagger para documentação da API  

---

## ✅ Result

- API Fastify inicial funcionando  
- estrutura preparada para validação com Zod  
- documentação Swagger pronta para uso  

---

# 🧠 Capsule 03 — (Next)

## 🎯 Goal

Definir e implementar a camada de dados.

---

## 🔜 Planned

- modelagem do banco de dados  
- definição das entidades principais  
- configuração do Prisma  
- conexão com PostgreSQL  

---

## 📝 Notes

- manter abordagem incremental  
- validar cada etapa antes de avançar  