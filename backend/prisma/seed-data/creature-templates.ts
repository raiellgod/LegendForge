type CreatureTemplateSeed = {
  key: string;
  name: string;
  initials: string | null;
  description: string | null;
  portraitUrl: string | null;
  tokenImageUrl: string | null;
  tokenImageFit: "COVER" | "CONTAIN" | "FILL";
  size: "TINY" | "SMALL" | "MEDIUM" | "LARGE" | "HUGE" | "GARGANTUAN";
  creatureType: string | null;
  habitat: string | null;
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
  challengeRating: string | null;
  experienceReward: number;
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

export const creatureTemplates: readonly CreatureTemplateSeed[] = [
  {
    key: "cao-irradiado",
    name: "Cão Irradiado",
    initials: "CI",
    description:
      "Canídeo deformado pela radiação e pelas mutações do pós-guerra, agressivo quando acuado e frequentemente encontrado em bandos nas ruínas.",
    portraitUrl: null,
    tokenImageUrl: null,
    tokenImageFit: "COVER",
    size: "SMALL",
    creatureType: "Besta mutante",
    habitat: "Ruínas irradiadas e áreas urbanas abandonadas.",
    behavior: "Caça em bandos e reage agressivamente a invasores.",
    tactics: "Cerca alvos isolados e tenta derrubá-los rapidamente.",
    lore: "Descendente de cães sobreviventes alterados por gerações de radiação e mutações.",
    notes: null,
    armorClass: 12,
    hitPoints: 11,
    maxHitPoints: 11,
    temporaryHp: 0,
    speed: 40,
    climbSpeed: 0,
    swimSpeed: 0,
    flySpeed: 0,
    burrowSpeed: 0,
    challengeRating: "1/4",
    experienceReward: 50,
    stats: {
      strength: 13,
      dexterity: 14,
      constitution: 12,
      intelligence: 3,
      wisdom: 12,
      charisma: 6,
    },
    defenses: [],
    senses: [{ name: "Faro aguçado", range: null, notes: null }],
    traits: [
      {
        name: "Faro Irradiado",
        description:
          "Possui olfato extremamente sensível, capaz de seguir rastros mesmo em ambientes contaminados.",
      },
    ],
    actions: [],
    attacks: [
      {
        name: "Mordida",
        description: null,
        attackType: "MELEE",
        attackAbilityKey: "strength",
        attackBonus: 3,
        damageFormula: "1d6",
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
    key: "rastejante-de-ruina",
    name: "Rastejante de Ruína",
    initials: "RR",
    description:
      "Predador baixo e ágil adaptado a túneis, porões e estruturas desabadas, conhecido por atacar a partir de espaços estreitos.",
    portraitUrl: null,
    tokenImageUrl: null,
    tokenImageFit: "COVER",
    size: "SMALL",
    creatureType: "Predador mutante",
    habitat: "Túneis, porões e estruturas desabadas.",
    behavior: "Permanece oculto até perceber uma presa vulnerável.",
    tactics: "Ataca de surpresa e recua por passagens estreitas.",
    lore: "Sua anatomia comprimida favorece a vida em espaços onde criaturas maiores não conseguem entrar.",
    notes: null,
    armorClass: 13,
    hitPoints: 9,
    maxHitPoints: 9,
    temporaryHp: 0,
    speed: 30,
    climbSpeed: 20,
    swimSpeed: 0,
    flySpeed: 0,
    burrowSpeed: 0,
    challengeRating: "1/4",
    experienceReward: 50,
    stats: {
      strength: 11,
      dexterity: 15,
      constitution: 11,
      intelligence: 4,
      wisdom: 13,
      charisma: 5,
    },
    defenses: [],
    senses: [{ name: "Visão no escuro", range: 18, notes: null }],
    traits: [],
    actions: [],
    attacks: [
      {
        name: "Garras",
        description: null,
        attackType: "MELEE",
        attackAbilityKey: "dexterity",
        attackBonus: 4,
        damageFormula: "1d4",
        damageBonus: 2,
        damageType: "cortante",
        reach: 1,
        target: "1 alvo",
        onHit: null,
        notes: null,
      },
    ],
    multiattacks: [],
  },
  {
    key: "eco-mutante",
    name: "Eco Mutante",
    initials: "EM",
    description:
      "Criatura instável marcada por mutações arcanas, capaz de sobreviver em zonas onde radiação e magia se misturam de forma imprevisível.",
    portraitUrl: null,
    tokenImageUrl: null,
    tokenImageFit: "COVER",
    size: "MEDIUM",
    creatureType: "Aberração mutante",
    habitat: "Zonas de convergência entre radiação e fenômenos arcanos.",
    behavior: "Alterna períodos de imobilidade com surtos violentos.",
    tactics: "Usa energia instável para desorganizar grupos antes de atacar.",
    lore: "É um dos exemplos mais perigosos de mutação causada pela interação entre magia e radiação.",
    notes: null,
    armorClass: 13,
    hitPoints: 22,
    maxHitPoints: 22,
    temporaryHp: 0,
    speed: 30,
    climbSpeed: 0,
    swimSpeed: 0,
    flySpeed: 0,
    burrowSpeed: 0,
    challengeRating: "1",
    experienceReward: 200,
    stats: {
      strength: 14,
      dexterity: 12,
      constitution: 15,
      intelligence: 8,
      wisdom: 12,
      charisma: 7,
    },
    defenses: [
      {
        kind: "RESISTANCE",
        damageType: "radiação",
        notes: "Adaptação às zonas contaminadas.",
      },
    ],
    senses: [],
    traits: [
      {
        name: "Instabilidade Arcana",
        description:
          "A energia que atravessa seu corpo reage de forma imprevisível a ameaças e efeitos mágicos.",
      },
    ],
    actions: [],
    attacks: [
      {
        name: "Impacto Mutante",
        description: null,
        attackType: "MELEE",
        attackAbilityKey: "strength",
        attackBonus: 4,
        damageFormula: "1d8",
        damageBonus: 2,
        damageType: "contundente",
        reach: 1,
        target: "1 alvo",
        onHit: null,
        notes: null,
      },
    ],
    multiattacks: [],
  },
];
