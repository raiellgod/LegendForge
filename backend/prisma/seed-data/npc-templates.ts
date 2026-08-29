type NpcTemplateSeed = {
  key: string;
  name: string;
  initials: string | null;
  description: string | null;
  portraitUrl: string | null;
  tokenImageUrl: string | null;
  tokenImageFit: "COVER" | "CONTAIN" | "FILL";
  size: "TINY" | "SMALL" | "MEDIUM" | "LARGE" | "HUGE" | "GARGANTUAN";
  role: string | null;
  faction: string | null;
  personality: string | null;
  motivation: string | null;
  behavior: string | null;
  tactics: string | null;
  lore: string | null;
  notes: string | null;
  armorClass: number;
  hitPoints: number;
  maxHitPoints: number;
  temporaryHp: number;
  speed: number;
  climbSpeed: number;
  swimSpeed: number;
  flySpeed: number;
  burrowSpeed: number;
  stats: Record<string, number>;
  defenses: Array<{
    kind: "RESISTANCE" | "IMMUNITY" | "VULNERABILITY";
    damageType: string;
    notes: string | null;
  }>;
  senses: Array<{ name: string; range: number | null; notes: string | null }>;
  traits: Array<{ name: string; description: string }>;
  actions: Array<{
    kind: "ACTION" | "BONUS_ACTION" | "REACTION";
    name: string;
    description: string;
    uses: number | null;
    maxUses: number | null;
    recharge: string | null;
  }>;
  attacks: Array<{
    name: string;
    description: string | null;
    attackType: "MELEE" | "RANGED" | "THROWN" | "MAGIC" | "OTHER";
    attackAbilityKey: string | null;
    attackBonus: number;
    damageFormula: string | null;
    damageBonus: number;
    damageType: string | null;
    reach: number | null;
    target: string | null;
    onHit: string | null;
    notes: string | null;
  }>;
  multiattacks: Array<{
    name: string;
    description: string | null;
    entries: Array<{
      targetType: "ATTACK" | "ACTION";
      targetName: string;
      quantity: number;
      notes: string | null;
    }>;
  }>;
};

export const npcTemplates: readonly NpcTemplateSeed[] = [
  {
    key: "mercador-de-ruinas",
    name: "Mercador de Ruínas",
    initials: "MR",
    description:
      "Comerciante itinerante especializado em sucata, peças recuperadas e suprimentos encontrados nas zonas devastadas.",
    portraitUrl: null,
    tokenImageUrl: null,
    tokenImageFit: "COVER",
    size: "MEDIUM",
    role: "Mercador e contato itinerante",
    faction: null,
    personality: "Pragmático, observador e cuidadoso com desconhecidos.",
    motivation: "Manter rotas comerciais abertas e sobreviver às ruínas.",
    behavior: "Evita confrontos desnecessários e tenta negociar antes de lutar.",
    tactics: "Procura cobertura e tenta fugir se o combate ficar desfavorável.",
    lore: "Conhece rotas, preços e histórias das zonas devastadas.",
    notes: null,
    armorClass: 11,
    hitPoints: 9,
    maxHitPoints: 9,
    temporaryHp: 0,
    speed: 30,
    climbSpeed: 0,
    swimSpeed: 0,
    flySpeed: 0,
    burrowSpeed: 0,
    stats: {
      strength: 9,
      dexterity: 12,
      constitution: 10,
      intelligence: 14,
      wisdom: 13,
      charisma: 15,
    },
    defenses: [],
    senses: [{ name: "Percepção comum", range: null, notes: null }],
    traits: [
      {
        name: "Olho para Sucata",
        description:
          "Reconhece rapidamente materiais reutilizáveis, peças valiosas e equipamentos com potencial de reparo.",
      },
    ],
    actions: [],
    attacks: [
      {
        name: "Faca de defesa",
        description: "Ataque simples usado apenas quando a negociação falha.",
        attackType: "MELEE",
        attackAbilityKey: "dexterity",
        attackBonus: 3,
        damageFormula: "1d4",
        damageBonus: 1,
        damageType: "perfurante",
        reach: 1,
        target: "1 alvo",
        onHit: null,
        notes: null,
      },
    ],
    multiattacks: [],
  },
  {
    key: "informante-de-nigrum-alvor",
    name: "Informante de Nigrum Alvor",
    initials: "INA",
    description:
      "Contato discreto que negocia rumores, rotas seguras e informações sobre facções, autoridades e mercados clandestinos de Nigrum Alvor.",
    portraitUrl: null,
    tokenImageUrl: null,
    tokenImageFit: "COVER",
    size: "MEDIUM",
    role: "Informante",
    faction: null,
    personality: "Discreto, desconfiado e sempre atento às saídas.",
    motivation: "Acumular favores e informação sem se tornar alvo.",
    behavior: "Evita revelar mais do que o necessário.",
    tactics: "Prioriza fuga e ocultação.",
    lore: "Mantém uma rede informal de contatos em Nigrum Alvor.",
    notes: null,
    armorClass: 12,
    hitPoints: 8,
    maxHitPoints: 8,
    temporaryHp: 0,
    speed: 30,
    climbSpeed: 0,
    swimSpeed: 0,
    flySpeed: 0,
    burrowSpeed: 0,
    stats: {
      strength: 8,
      dexterity: 14,
      constitution: 10,
      intelligence: 15,
      wisdom: 14,
      charisma: 13,
    },
    defenses: [],
    senses: [],
    traits: [
      {
        name: "Rede de Rumores",
        description:
          "Costuma conhecer rumores recentes, nomes importantes e mudanças de poder em Nigrum Alvor.",
      },
    ],
    actions: [],
    attacks: [],
    multiattacks: [],
  },
  {
    key: "sucateiro-tecnomante",
    name: "Sucateiro Tecnomante",
    initials: "ST",
    description:
      "Especialista em reaproveitar tecnologia antiga, reparar dispositivos instáveis e reconhecer componentes valiosos em meio aos escombros.",
    portraitUrl: null,
    tokenImageUrl: null,
    tokenImageFit: "COVER",
    size: "MEDIUM",
    role: "Especialista técnico",
    faction: null,
    personality: "Curioso, metódico e fascinado por tecnologia antiga.",
    motivation: "Recuperar conhecimento tecnológico perdido.",
    behavior: "Investiga dispositivos antes de tomar decisões.",
    tactics: "Usa distância, cobertura e ferramentas improvisadas.",
    lore: "Conhece princípios de tecnologia pré-guerra e adaptações tecnomânticas.",
    notes: null,
    armorClass: 12,
    hitPoints: 12,
    maxHitPoints: 12,
    temporaryHp: 0,
    speed: 30,
    climbSpeed: 0,
    swimSpeed: 0,
    flySpeed: 0,
    burrowSpeed: 0,
    stats: {
      strength: 9,
      dexterity: 13,
      constitution: 12,
      intelligence: 16,
      wisdom: 13,
      charisma: 10,
    },
    defenses: [],
    senses: [],
    traits: [
      {
        name: "Diagnóstico Técnico",
        description:
          "Consegue avaliar rapidamente falhas, riscos e usos possíveis de dispositivos tecnológicos.",
      },
    ],
    actions: [],
    attacks: [],
    multiattacks: [],
  },
];
