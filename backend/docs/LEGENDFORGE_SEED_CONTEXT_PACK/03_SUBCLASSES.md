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

# Subclasses
Arquivo-alvo atual: `backend/prisma/seed-data/subclasses.ts`

## Formato mínimo seguro para planejamento
```ts
{
  classKey: "class-key",
  name: "Nome",
  key: "subclass-key",
  description: "Descrição."
}
```

Toda subclasse pertence a uma classe específica. Em multiclasse, a subclasse é vinculada à `CharacterSheetClass`, não ao personagem global.

Entregar: classe mãe, fantasia, estilo de jogo, feature de entrada, progressão temática, magias concedidas, escolhas internas e dependências de `features.ts`/`feature-choice-groups.ts`.
