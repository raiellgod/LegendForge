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

# Classes
Arquivo-alvo atual: `backend/prisma/seed-data/classes.ts`

## Estrutura atual conhecida
```ts
{
  name: string;
  key: string;
  primaryRole: string;
  hitDie: number;
  spellcastingAbilityKey: "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma" | null;
  subclassSelectionLevel: number | null;
  classSkillChoiceCount: number;
  weaponProficiencyKeys: string[];
  protectionProficiencyKeys: string[];
  toolProficiencyKeys: string[];
  description: string;
}
```

Classes recorrentes: Artífice/Tecnomante, Bárbaro, Bardo, Bruxo, Clérigo, Druida, Feiticeiro, Guerreiro, Ladino, Mago, Monge, Juramentado, Patrulheiro e Necromante.

Ao criar classe, devolver também: fantasia central, papel de combate, papel fora de combate, atributos prioritários, dado de vida, proficiências, nível de subclasse, progressão 1–20 conceitual, features necessárias, subclasses sugeridas e lista temática de magias quando aplicável.
