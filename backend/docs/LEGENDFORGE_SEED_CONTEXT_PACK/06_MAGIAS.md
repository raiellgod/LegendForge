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

# Magias
Arquivos: `spells.ts` e `class-spells.ts`

## Campos atualmente expostos
```ts
{
  name: string;
  key: string;
  description: string;
  level: number;
  school: string;
  castingTime: string | null;
  range: string | null;
  duration: string | null;
  components: string | string[];
  isRitual: boolean;
  requiresConcentration: boolean;
}
```

## Regras canônicas
- Builder escolhe magias conhecidas.
- Preparadas são estado separado/futuro.
- Magias concedidas pelo GM não contam no limite normal.
- `ClassSpell` define acesso de classe.
- Em multiclasse, o builder usa a união das listas permitidas.
- Origem interna da classe é preservada, mas não precisa poluir o card.

Entregar para cada magia: nível, escola, casting time, alcance, duração, componentes, ritual/concentração, efeito, escalonamento, classes com acesso e nível mínimo se aplicável.
