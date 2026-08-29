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

# Itens e equipamentos
Arquivo-alvo atual: `backend/prisma/seed-data/equipment.ts`

## Campos atuais conhecidos
```ts
{
  name: string;
  key: string;
  description: string;
  imageUrl?: string | null;
  category: string;
  damage?: string | null;
  damageFormula?: string | null;
  damageType?: string | null;
  defense?: number | null;
  cost?: string | null;
  weight?: number | null;
  properties?: string | null;
  attackType: "NONE" | "MELEE" | "RANGED" | "THROWN";
  attackAbilityKey?: string | null;
  alternativeAbilityKey?: string | null;
  weaponGroup?: "SIMPLE" | "MARTIAL" | "IMPROVISED" | "NATURAL" | "TECH" | "RELIC" | null;
  normalRange?: number | null;
  longRange?: number | null;
  isFinesse: boolean;
  isThrown: boolean;
  isTwoHanded: boolean;
  isVersatile: boolean;
  versatileDamageFormula?: string | null;
  attackBonus: number;
  damageBonus: number;
}
```

## Regras
- Armadura é proteção/revestimento mecânico, não roupa visual.
- Tecnologia antiga pode usar `TECH`/`RELIC`.
- `imageUrl` pode seguir `/images/equipment/<key>.png`.
- Se um consumível exigir efeito estruturado ainda inexistente, descrever em `properties` e marcar futura modelagem.

## Entrega adicional
Para cada item: categoria, raridade conceitual, preço, peso, uso, origem no mundo e dependências.
