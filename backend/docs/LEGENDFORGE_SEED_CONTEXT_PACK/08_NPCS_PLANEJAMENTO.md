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

# NPCs — planejamento de conteúdo
`NpcSheet` definitivo ainda é futuro. NÃO tratar o formato abaixo como Prisma.

```ts
type NpcSeedDraft = {
  name: string;
  key: string;
  title?: string;
  ancestryKey?: string;
  subAncestryKey?: string;
  backgroundKey?: string;
  role: string;
  faction?: string;
  location?: string;
  description: string;
  personality: string;
  motivation: string;
  secret?: string;
  combatRole?: string;
  suggestedLevel?: number;
  classConcepts?: string[];
  spellKeys?: string[];
  equipmentKeys?: string[];
  portraitBrief?: string;
  tokenBrief?: string;
  notes?: string;
};
```

Categorias úteis: aliados, rivais, comerciantes, líderes, políticos, religiosos, militares, criminosos, pesquisadores, sobreviventes e antagonistas.

Entregar também: relação com PCs, gancho de aventura e possíveis versões/estágios do NPC.
