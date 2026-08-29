# LegendForge — Contexto para criação paralela de seeds

## Uso
Este arquivo é para um chat paralelo de conteúdo. O chat deve criar lore e propostas de seed, não alterar arquitetura, schema, rotas ou frontend.

## Regras fixas
- Não inventar campos de banco.
- Não renomear fields/keys atuais sem autorização.
- `key` sempre única, em kebab-case e sem acentos.
- Quando uma ideia exigir modelagem inexistente, marcar `FUTURO / REQUER MODELAGEM`.
- Separar sempre: lore, mecânica, dependências e pendências.
- O universo mistura pós-apocalipse, mutação, magia e tecnologia antiga escassa.
- Armas de fogo existem.
- Não copiar literalmente conteúdo protegido de outras IPs; usar referências apenas como inspiração.

## Universo-base
Capital multicultural: Nigrum Alvor.
Povos recorrentes: Humanis, Sylvaris, Ignivar, Brutakar, Faunari, Sintéticos, Durandir, Minuri, Yokari e Gnomyx.
Híbridos já citados na lore: Sylthar, Bruthan e Yokanth.

## Formato de entrega do chat paralelo
1. Conteúdo proposto.
2. Seed sugerido.
3. Dependências por `key`.
4. Conflitos/decisões.
5. Checklist de consistência.

## Organização recomendada
Abra um chat separado para cada domínio:
1. Itens/equipamentos
2. Classes
3. Subclasses
4. Ancestralidades
5. Sub-ancestralidades
6. Magias
7. Antecedentes
8. NPCs
9. Monstros/criaturas

O seed atual é modularizado em `backend/prisma/seed-data/`, e `backend/prisma/seed.ts` funciona como orquestrador.

Arquivos já usados no seed incluem:
`ancestries.ts`, `backgrounds.ts`, `classes.ts`, `subclasses.ts`, `spells.ts`, `class-spells.ts`, `equipment.ts`, `features.ts`, `feature-choice-groups.ts`, `languages.ts`, `skills.ts`, `stats.ts`, `talents.ts` e `sub-ancestries.ts`.

NPCs e criaturas ainda não têm modelagem final própria; seus arquivos deste pacote são de planejamento, não seed Prisma definitivo.
