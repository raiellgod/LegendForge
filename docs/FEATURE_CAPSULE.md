------------------------------------
Capsule 1
------------------------------------

Instal dependencies:
 - node 24.13.1
 - typescript 5.9.3
 - type/node 24.10.13
 - prettier 3.8.1
 - eslint 9.39.2
 - git init
 - tsc init
 - tsx 4.21.0
 - create eslint/config 1.11.0
    - opções : JavaScript / To check syntax and find problems/ JavaScript modules (import/export)/ none of these/ Yes / Node/ JavaScript/ Yes/ Pnpm
 - eslint-config-prettier 10.1.8
    - configurar com o import "import eslintConfigPrettier from 'eslint-config-prettier/flat'" e o "eslintConfigPrettier," no corpo
 - eslint-plugin-simple-import-sort 12.1.1
    - configurar com o import "import simpleImportSort from 'eslint-plugin-simple-import-sort'" e o objeto  " {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },"  no corpo


Itens 
 - tsconfig.json alterada
 - pasta src criada
 - index.ts criado
 - index.ts alterado
 - pasta dist
 - index.js criado
 - package.json reconfigurada
 - run dev já funcionando
 -.npmrc


✅ finalizado e funcionando

------------------------------------
Capsule 2
------------------------------------


instalação
  - fatify 5.7.4
  - zod 4.3.6
  - fastify-type-provider-zod 6.1.0
  - fastify/swagger 9.7.0 
  - fastify/swagger-ui 5.2.5