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

# Sub-ancestralidades
Arquivo-alvo atual: `backend/prisma/seed-data/sub-ancestries.ts`

## Estrutura atual
```ts
{
  ancestryKey: string;
  name: string;
  key: string;
  description: string;
  sizeCategoryOverride: string | null;
  attributeBonuses: {
    strength?: number; dexterity?: number; constitution?: number;
    intelligence?: number; wisdom?: number; charisma?: number;
  };
  languageKeys: string[];
}
```

Exemplos já testados:
- Sylvaris Alto → INT +1
- Sylvaris Sombrio → CAR +1
- Sylvaris Silvestre → SAB +1

Não duplicar bônus da ancestralidade principal.
O sistema já remove efeitos antigos ao trocar sub-ancestralidade e limpa a escolha ao trocar de ancestralidade.

Entregar: ancestralidade mãe, diferença física/cultural, diferença mecânica, bônus, idioma, feature própria sugerida e justificativa narrativa.
