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

# Monstros e criaturas — planejamento de bestiário
`CreatureSheet`/Bestiário definitivo ainda é futuro. NÃO tratar este formato como Prisma.

```ts
type CreatureSeedDraft = {
  name: string;
  key: string;
  category: string;
  description: string;
  origin: string;
  size: string;
  threatTier: string;
  armorClass?: number;
  hitPointsConcept?: string;
  movement?: string[];
  attributes?: Record<string, number>;
  senses?: string[];
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  attacks?: Array<{ name: string; concept: string; damageConcept?: string }>;
  actions?: string[];
  reactions?: string[];
  traits?: string[];
  spellKeys?: string[];
  loot?: string[];
  habitat?: string[];
  behavior?: string;
  artBrief?: string;
};
```

Priorizar criaturas de zonas irradiadas, florestas mutadas, ruínas urbanas, subterrâneos, regiões mágicas instáveis, laboratórios antigos, tecnologia abandonada e distorções espirituais.

Entregar: visual, origem, comportamento, habitat, função de encontro, ameaça, ataques, habilidades, fraquezas/resistências, loot e ganchos narrativos.
