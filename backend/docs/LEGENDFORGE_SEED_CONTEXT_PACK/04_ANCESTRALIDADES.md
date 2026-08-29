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

# Ancestralidades
Arquivo-alvo atual: `backend/prisma/seed-data/ancestries.ts`

## Estrutura atual
```ts
{
  name: string;
  key: string;
  description: string;
  defaultSizeCategory: "SMALL" | "MEDIUM" | string;
  attributeBonuses: {
    strength?: number; dexterity?: number; constitution?: number;
    intelligence?: number; wisdom?: number; charisma?: number;
  };
  languageKeys: string[];
}
```

Povos já estabelecidos: Humanis, Sylvaris, Durandir, Brutakar, Faunari, Sintéticos, Minuri, Ignivar, Yokari e Gnomyx.

Variações internas devem preferir `SubAncestry`, não uma ancestralidade duplicada.

Entregar: origem pós-colapso, aparência, cultura, região/cidade, relação com magia/tecnologia, tamanho, bônus, idiomas, features sugeridas e sub-ancestralidades candidatas.
