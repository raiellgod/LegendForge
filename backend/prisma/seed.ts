import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";

const SYSTEM_NAME = "Meu sistema";
const SYSTEM_SLUG = "meu-sistema";

function createKeyFromName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getProficiencyBonusByLevel(level: number) {
  if (level >= 17) {
    return 6;
  }

  if (level >= 13) {
    return 5;
  }

  if (level >= 9) {
    return 4;
  }

  if (level >= 5) {
    return 3;
  }

  return 2;
}

type SpellSlotProgression = {
  spellSlotsLevel1: number;
  spellSlotsLevel2: number;
  spellSlotsLevel3: number;
  spellSlotsLevel4: number;
  spellSlotsLevel5: number;
  spellSlotsLevel6: number;
  spellSlotsLevel7: number;
  spellSlotsLevel8: number;
  spellSlotsLevel9: number;
};

type ClassMagicProgression = SpellSlotProgression & {
  cantripsKnown: number;
  spellsKnown: number;
  spellsPrepared: number;
};

const zeroSpellSlots: SpellSlotProgression = {
  spellSlotsLevel1: 0,
  spellSlotsLevel2: 0,
  spellSlotsLevel3: 0,
  spellSlotsLevel4: 0,
  spellSlotsLevel5: 0,
  spellSlotsLevel6: 0,
  spellSlotsLevel7: 0,
  spellSlotsLevel8: 0,
  spellSlotsLevel9: 0,
};

function getFullCasterSpellSlots(level: number): SpellSlotProgression {
  const spellSlotsByLevel: Record<number, SpellSlotProgression> = {
    1: {
      spellSlotsLevel1: 2,
      spellSlotsLevel2: 0,
      spellSlotsLevel3: 0,
      spellSlotsLevel4: 0,
      spellSlotsLevel5: 0,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    2: {
      spellSlotsLevel1: 3,
      spellSlotsLevel2: 0,
      spellSlotsLevel3: 0,
      spellSlotsLevel4: 0,
      spellSlotsLevel5: 0,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    3: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 2,
      spellSlotsLevel3: 0,
      spellSlotsLevel4: 0,
      spellSlotsLevel5: 0,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    4: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 0,
      spellSlotsLevel4: 0,
      spellSlotsLevel5: 0,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    5: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 2,
      spellSlotsLevel4: 0,
      spellSlotsLevel5: 0,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    6: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 0,
      spellSlotsLevel5: 0,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    7: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 1,
      spellSlotsLevel5: 0,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    8: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 2,
      spellSlotsLevel5: 0,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    9: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 1,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    10: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 2,
      spellSlotsLevel6: 0,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    11: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 2,
      spellSlotsLevel6: 1,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    12: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 2,
      spellSlotsLevel6: 1,
      spellSlotsLevel7: 0,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    13: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 2,
      spellSlotsLevel6: 1,
      spellSlotsLevel7: 1,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    14: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 2,
      spellSlotsLevel6: 1,
      spellSlotsLevel7: 1,
      spellSlotsLevel8: 0,
      spellSlotsLevel9: 0,
    },
    15: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 2,
      spellSlotsLevel6: 1,
      spellSlotsLevel7: 1,
      spellSlotsLevel8: 1,
      spellSlotsLevel9: 0,
    },
    16: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 2,
      spellSlotsLevel6: 1,
      spellSlotsLevel7: 1,
      spellSlotsLevel8: 1,
      spellSlotsLevel9: 0,
    },
    17: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 2,
      spellSlotsLevel6: 1,
      spellSlotsLevel7: 1,
      spellSlotsLevel8: 1,
      spellSlotsLevel9: 1,
    },
    18: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 3,
      spellSlotsLevel6: 1,
      spellSlotsLevel7: 1,
      spellSlotsLevel8: 1,
      spellSlotsLevel9: 1,
    },
    19: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 3,
      spellSlotsLevel6: 2,
      spellSlotsLevel7: 1,
      spellSlotsLevel8: 1,
      spellSlotsLevel9: 1,
    },
    20: {
      spellSlotsLevel1: 4,
      spellSlotsLevel2: 3,
      spellSlotsLevel3: 3,
      spellSlotsLevel4: 3,
      spellSlotsLevel5: 3,
      spellSlotsLevel6: 2,
      spellSlotsLevel7: 2,
      spellSlotsLevel8: 1,
      spellSlotsLevel9: 1,
    },
  };

  return spellSlotsByLevel[level] ?? zeroSpellSlots;
}

function getHalfCasterSpellSlots(level: number): SpellSlotProgression {
  if (level < 2) {
    return zeroSpellSlots;
  }

  const casterLevel = Math.ceil(level / 2);

  return getFullCasterSpellSlots(casterLevel);
}

function getKnownCasterProgression(level: number) {
  return {
    cantripsKnown: level >= 10 ? 4 : level >= 4 ? 3 : 2,
    spellsKnown: Math.min(15, level + 3),
    spellsPrepared: 0,
  };
}

function getPreparedCasterProgression(level: number) {
  return {
    cantripsKnown: level >= 10 ? 5 : level >= 4 ? 4 : 3,
    spellsKnown: 0,
    spellsPrepared: Math.max(1, level + 2),
  };
}

function getHalfCasterProgression(level: number) {
  if (level < 2) {
    return {
      cantripsKnown: 0,
      spellsKnown: 0,
      spellsPrepared: 0,
    };
  }

  return {
    cantripsKnown: 0,
    spellsKnown: Math.max(2, Math.ceil(level / 2) + 1),
    spellsPrepared: 0,
  };
}

function getClassMagicProgression(
  classKey: string,
  level: number,
): ClassMagicProgression {
  if (["bard", "sorcerer", "warlock", "necromancer"].includes(classKey)) {
    return {
      ...getKnownCasterProgression(level),
      ...getFullCasterSpellSlots(level),
    };
  }

  if (["devotee", "druid", "wizard"].includes(classKey)) {
    return {
      ...getPreparedCasterProgression(level),
      ...getFullCasterSpellSlots(level),
    };
  }

  if (["oathbound", "ranger", "technomancer"].includes(classKey)) {
    return {
      ...getHalfCasterProgression(level),
      ...getHalfCasterSpellSlots(level),
    };
  }

  return {
    cantripsKnown: 0,
    spellsKnown: 0,
    spellsPrepared: 0,
    ...zeroSpellSlots,
  };
}

const stats = [
  {
    name: "Força",
    key: "strength",
    shortName: "FOR",
    description:
      "Mede potência física, capacidade atlética bruta, carga e impacto corporal.",
  },
  {
    name: "Destreza",
    key: "dexterity",
    shortName: "DES",
    description:
      "Mede agilidade, reflexos, precisão manual, equilíbrio e velocidade corporal.",
  },
  {
    name: "Constituição",
    key: "constitution",
    shortName: "CON",
    description:
      "Mede vigor, resistência física, saúde, fôlego e tolerância a desgaste.",
  },
  {
    name: "Inteligência",
    key: "intelligence",
    shortName: "INT",
    description:
      "Mede raciocínio, memória, estudo, lógica, análise e conhecimento técnico.",
  },
  {
    name: "Sabedoria",
    key: "wisdom",
    shortName: "SAB",
    description:
      "Mede percepção, intuição, instinto, leitura emocional e sintonia com o ambiente.",
  },
  {
    name: "Carisma",
    key: "charisma",
    shortName: "CAR",
    description:
      "Mede presença, força de personalidade, influência social, expressão e liderança.",
  },
] as const;

const skills = [
  { name: "Acrobacia", statName: "Destreza" },
  { name: "Arcanismo", statName: "Inteligência" },
  { name: "Atletismo", statName: "Força" },
  { name: "Atuação", statName: "Carisma" },
  { name: "Blefar", statName: "Carisma" },
  { name: "Furtividade", statName: "Destreza" },
  { name: "História", statName: "Inteligência" },
  { name: "Intimidação", statName: "Carisma" },
  { name: "Intuição", statName: "Sabedoria" },
  { name: "Investigação", statName: "Inteligência" },
  { name: "Lidar com Animais", statName: "Sabedoria" },
  { name: "Medicina", statName: "Sabedoria" },
  { name: "Natureza", statName: "Inteligência" },
  { name: "Percepção", statName: "Sabedoria" },
  { name: "Persuasão", statName: "Carisma" },
  { name: "Prestidigitação", statName: "Destreza" },
  { name: "Religião", statName: "Inteligência" },
  { name: "Sobrevivência", statName: "Sabedoria" },
] as const;

const ancestries = [
  {
    name: "Humanis",
    key: "humanis",
    description:
      "Povo versátil e adaptável, marcado pela sobrevivência após o colapso do velho mundo.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Sylvaris",
    key: "sylvaris",
    description:
      "Linhagem de traços élficos, sensibilidade arcana e forte conexão com ambientes transformados pela magia.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Durandir",
    key: "durandir",
    description:
      "Povo resistente, robusto e associado a comunidades subterrâneas, metalurgia e sobrevivência em regiões severas.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Brutakar",
    key: "brutakar",
    description:
      "Linhagem forte e imponente, frequentemente ligada à resistência física e presença intimidadora.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Faunari",
    key: "faunari",
    description:
      "Povo de traços feéricos e animalescos, associado a mobilidade, expressão cultural e instinto natural.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Sintéticos",
    key: "sinteticos",
    description:
      "Seres parcialmente artificiais ou reconstruídos, ligados a tecnologia antiga, implantes e sobrevivência mecânica.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Minuri",
    key: "minuri",
    description:
      "Povo de baixa estatura, ágil e discreto, conhecido por adaptação social e coragem inesperada.",
    defaultSizeCategory: "SMALL",
  },
] as const;

const classes = [
  {
    name: "Bárbaro",
    key: "barbarian",
    primaryRole: "Marcial",
    hitDie: 12,
    spellcastingAbilityKey: null,
    description:
      "Combatente feroz movido por fúria, instinto e resistência física extrema.",
  },
  {
    name: "Bardo",
    key: "bard",
    primaryRole: "Suporte",
    hitDie: 8,
    spellcastingAbilityKey: "charisma",
    description:
      "Artista arcano que inspira aliados, manipula emoções e transforma expressão em poder.",
  },
  {
    name: "Bruxo",
    key: "warlock",
    primaryRole: "Oculto",
    hitDie: 8,
    spellcastingAbilityKey: "charisma",
    description:
      "Conjurador ligado a forças misteriosas, maldições, pactos e segredos arcanos perigosos.",
  },
  {
    name: "Devoto",
    key: "devotee",
    primaryRole: "Suporte",
    hitDie: 8,
    spellcastingAbilityKey: "wisdom",
    description:
      "Canaliza poder de uma fé, ideal, entidade, tradição espiritual ou força superior para curar, proteger e purificar.",
  },
  {
    name: "Druida",
    key: "druid",
    primaryRole: "Natural",
    hitDie: 8,
    spellcastingAbilityKey: "wisdom",
    description:
      "Conjurador ligado às forças naturais, mutações, animais, ciclos vitais e terrenos selvagens.",
  },
  {
    name: "Feiticeiro",
    key: "sorcerer",
    primaryRole: "Arcano",
    hitDie: 6,
    spellcastingAbilityKey: "charisma",
    description:
      "Conjurador de magia inata, guiado por sangue, mutação, herança ou poder interior instintivo.",
  },
  {
    name: "Guerreiro",
    key: "fighter",
    primaryRole: "Marcial",
    hitDie: 10,
    spellcastingAbilityKey: null,
    description:
      "Especialista em combate, armas, armaduras, disciplina marcial e adaptação tática.",
  },
  {
    name: "Ladino",
    key: "rogue",
    primaryRole: "Especialista",
    hitDie: 8,
    spellcastingAbilityKey: null,
    description:
      "Especialista em furtividade, precisão, truques, mobilidade e ataques oportunistas.",
  },
  {
    name: "Mago",
    key: "wizard",
    primaryRole: "Arcano",
    hitDie: 6,
    spellcastingAbilityKey: "intelligence",
    description:
      "Estudioso da magia, rituais, grimórios, fórmulas arcanas e conhecimento sobrenatural.",
  },
  {
    name: "Monge",
    key: "monk",
    primaryRole: "Marcial",
    hitDie: 8,
    spellcastingAbilityKey: null,
    description:
      "Combatente disciplinado que usa corpo, mente, velocidade e energia interior como armas.",
  },
  {
    name: "Juramentado",
    key: "oathbound",
    primaryRole: "Defensor",
    hitDie: 10,
    spellcastingAbilityKey: "charisma",
    description:
      "Guerreiro místico sustentado por juramentos, convicções e a força de uma promessa inquebrável.",
  },
  {
    name: "Patrulheiro",
    key: "ranger",
    primaryRole: "Explorador",
    hitDie: 10,
    spellcastingAbilityKey: "wisdom",
    description:
      "Explorador, rastreador e combatente versátil treinado para sobreviver em regiões hostis.",
  },
  {
    name: "Tecnomante",
    key: "technomancer",
    primaryRole: "Tecnológico",
    hitDie: 8,
    spellcastingAbilityKey: "intelligence",
    description:
      "Especialista em tecnologia antiga, dispositivos, engenhocas, alquimia e tecno-magia.",
  },
  {
    name: "Necromante",
    key: "necromancer",
    primaryRole: "Sombrio",
    hitDie: 6,
    spellcastingAbilityKey: "intelligence",
    description:
      "Conjurador da morte, espíritos, ossos, dreno vital, cadáveres e forças necromânticas.",
  },
] as const;

const subclasses = [
  {
    classKey: "barbarian",
    name: "Fúria do Colapso",
    key: "collapse-fury",
    description:
      "Canaliza brutalidade, dor e sobrevivência em uma fúria nascida de ruínas, perdas e violência extrema.",
  },
  {
    classKey: "barbarian",
    name: "Coração Bestial",
    key: "beast-heart",
    description:
      "Assume instintos animalescos, resistência selvagem e força primal, aproximando o corpo de uma fera viva.",
  },
  {
    classKey: "bard",
    name: "Colégio dos Ecos",
    key: "college-of-echoes",
    description:
      "Usa memórias, canções antigas e ecos emocionais para inspirar aliados, perturbar inimigos e preservar histórias perdidas.",
  },
  {
    classKey: "bard",
    name: "Colégio da Máscara",
    key: "college-of-masks",
    description:
      "Domina atuação, disfarces, manipulação social e magia performática, tornando identidade uma arma.",
  },
  {
    classKey: "warlock",
    name: "Marca da Entidade",
    key: "entity-mark",
    description:
      "Carrega a marca de uma força oculta que concede poder em troca de influência, presença ou dívida.",
  },
  {
    classKey: "warlock",
    name: "Véu do Agouro",
    key: "omen-veil",
    description:
      "Manipula maldições, presságios, sombras e azar, envolvendo inimigos em sinais de queda inevitável.",
  },
  {
    classKey: "devotee",
    name: "Caminho do Alvorecer",
    key: "path-of-dawn",
    description:
      "Canaliza restauração, proteção e purificação, tornando-se uma presença de esperança contra forças corruptoras.",
  },
  {
    classKey: "devotee",
    name: "Caminho dos Ancestrais",
    key: "path-of-ancestors",
    description:
      "Busca poder em memórias, espíritos, linhagens e tradições antigas, ouvindo vozes que ainda resistem ao esquecimento.",
  },
  {
    classKey: "druid",
    name: "Círculo da Mutação",
    key: "circle-of-mutation",
    description:
      "Abraça transformações naturais e mágicas surgidas em um mundo alterado, adaptando corpo e magia ao ambiente.",
  },
  {
    classKey: "druid",
    name: "Círculo das Feras",
    key: "circle-of-beasts",
    description:
      "Aproxima-se de predadores, companheiros animais e instintos selvagens, lutando ao lado da natureza viva.",
  },
  {
    classKey: "sorcerer",
    name: "Sangue Arcano",
    key: "arcane-blood",
    description:
      "O poder mágico nasce do sangue, da herança, da mutação ou de uma força interior impossível de negar.",
  },
  {
    classKey: "sorcerer",
    name: "Pulso Instável",
    key: "unstable-pulse",
    description:
      "Carrega magia volátil, explosiva e difícil de controlar, liberando surtos de energia imprevisível.",
  },
  {
    classKey: "fighter",
    name: "Mestre de Armas",
    key: "weapon-master",
    description:
      "Especialista em armas, posturas de combate, precisão marcial e domínio técnico em batalha.",
  },
  {
    classKey: "fighter",
    name: "Veterano da Cinza",
    key: "ash-veteran",
    description:
      "Sobreviveu a conflitos brutais e domina táticas de campo, carregando cicatrizes de guerras antigas.",
  },
  {
    classKey: "rogue",
    name: "Sombra Urbana",
    key: "urban-shadow",
    description:
      "Especialista em infiltração, fuga, furtividade e sobrevivência em cidades, fortalezas e becos perigosos.",
  },
  {
    classKey: "rogue",
    name: "Punhal Silencioso",
    key: "silent-dagger",
    description:
      "Foca em ataques precisos, emboscadas e eliminação rápida, vencendo antes que o inimigo perceba o perigo.",
  },
  {
    classKey: "wizard",
    name: "Escola da Ruína",
    key: "school-of-ruin",
    description:
      "Estuda magia destrutiva, colapso arcano e fórmulas de impacto direto capazes de quebrar defesas.",
  },
  {
    classKey: "wizard",
    name: "Escola do Véu",
    key: "school-of-veil",
    description:
      "Manipula ilusões, ocultação, disfarces mágicos e percepção, tornando a realidade algo incerto.",
  },
  {
    classKey: "monk",
    name: "Via do Pulso",
    key: "pulse-way",
    description:
      "Aprimora corpo, respiração, velocidade e resistência interior, transformando disciplina em movimento perfeito.",
  },
  {
    classKey: "monk",
    name: "Via do Vazio",
    key: "void-way",
    description:
      "Busca silêncio mental, precisão espiritual e golpes quase impossíveis de prever.",
  },
  {
    classKey: "oathbound",
    name: "Juramento da Muralha",
    key: "wall-oath",
    description:
      "Protege aliados, mantém posições e transforma uma promessa em escudo contra qualquer ameaça.",
  },
  {
    classKey: "oathbound",
    name: "Juramento da Cinza",
    key: "ash-oath",
    description:
      "Carrega um juramento nascido da perda, vingança e reconstrução, lutando para que a queda não se repita.",
  },
  {
    classKey: "ranger",
    name: "Andarilho das Ruínas",
    key: "ruin-walker",
    description:
      "Explora cidades quebradas, zonas perigosas e rastros deixados pelo colapso, encontrando caminho onde outros se perdem.",
  },
  {
    classKey: "ranger",
    name: "Caçador de Aberrações",
    key: "aberration-hunter",
    description:
      "Especialista em rastrear, estudar e derrubar criaturas mutadas, anômalas ou corrompidas.",
  },
  {
    classKey: "technomancer",
    name: "Engenheiro Arcano",
    key: "arcane-engineer",
    description:
      "Mistura tecnologia antiga, circuitos, runas e improviso mecânico para criar dispositivos instáveis e poderosos.",
  },
  {
    classKey: "technomancer",
    name: "Alquimista de Campo",
    key: "field-alchemist",
    description:
      "Cria misturas, reagentes, explosivos, remédios e ferramentas úteis em combate e exploração.",
  },
  {
    classKey: "necromancer",
    name: "Ceifador Ósseo",
    key: "bone-reaper",
    description:
      "Usa ossos, lâminas fúnebres e energia da morte em combate direto, transformando restos mortais em arma.",
  },
  {
    classKey: "necromancer",
    name: "Pastor dos Mortos",
    key: "shepherd-of-the-dead",
    description:
      "Conduz espíritos, cadáveres e ecos dos mortos como extensões de sua vontade.",
  },
] as const;

const features = [
  {
    sourceType: "ANCESTRY",
    ancestryKey: "humanis",
    classKey: null,
    subclassKey: null,
    level: null,
    name: "Adaptabilidade",
    key: "humanis-adaptability",
    description:
      "Humanis aprendem rápido, improvisam sob pressão e se adaptam a diferentes culturas, perigos e caminhos de vida.",
  },
  {
    sourceType: "ANCESTRY",
    ancestryKey: "sylvaris",
    classKey: null,
    subclassKey: null,
    level: null,
    name: "Sentidos Refinados",
    key: "sylvaris-refined-senses",
    description:
      "Sylvaris possuem percepção aguçada e sensibilidade a detalhes sutis do ambiente.",
  },
  {
    sourceType: "CLASS",
    ancestryKey: null,
    classKey: "fighter",
    subclassKey: null,
    level: 1,
    name: "Disciplina Marcial",
    key: "fighter-martial-discipline",
    description:
      "Guerreiros iniciam sua jornada com treinamento sólido em armas, armaduras e leitura de combate.",
  },
  {
    sourceType: "CLASS",
    ancestryKey: null,
    classKey: "necromancer",
    subclassKey: null,
    level: 1,
    name: "Toque Fúnebre",
    key: "necromancer-funeral-touch",
    description:
      "Necromantes aprendem a sentir, manipular e perturbar a energia que separa vida, morte e memória.",
  },
  {
    sourceType: "SUBCLASS",
    ancestryKey: null,
    classKey: "necromancer",
    subclassKey: "shepherd-of-the-dead",
    level: 3,
    name: "Voz dos Túmulos",
    key: "shepherd-of-the-dead-grave-voice",
    description:
      "Pastores dos Mortos conseguem ouvir ecos persistentes dos falecidos e usar esses sussurros como orientação.",
  },
] as const;

const spells = [
  {
    name: "Luz Menor",
    key: "minor-light",
    level: 0,
    school: "EVOCATION",
    castingTime: "1 ação",
    range: "Toque",
    duration: "1 hora",
    components: "V, S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Cria uma pequena fonte de luz mágica em um objeto, símbolo ou ponto tocado pelo conjurador.",
  },
  {
    name: "Toque Fúnebre",
    key: "funeral-touch",
    level: 0,
    school: "NECROMANCY",
    castingTime: "1 ação",
    range: "Toque",
    duration: "Instantânea",
    components: "V, S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Canaliza energia fúnebre pelo toque, causando 1d8 necrótico e perturbando a força vital de uma criatura.",
  },
  {
    name: "Faísca Arcana",
    key: "arcane-spark",
    level: 0,
    school: "EVOCATION",
    castingTime: "1 ação",
    range: "18 metros",
    duration: "Instantânea",
    components: "V, S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Dispara uma pequena faísca de energia arcana contra uma criatura visível, causando 1d6 energético.",
  },
  {
    name: "Rajada Mental",
    key: "mind-burst",
    level: 0,
    school: "ENCHANTMENT",
    castingTime: "1 ação",
    range: "18 metros",
    duration: "Instantânea",
    components: "V",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Projeta uma pressão psíquica breve contra uma mente próxima, causando 1d6 psíquico.",
  },
  {
    name: "Chama Instável",
    key: "unstable-flame",
    level: 0,
    school: "EVOCATION",
    castingTime: "1 ação",
    range: "18 metros",
    duration: "Instantânea",
    components: "V, S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Cria uma chama mutável que salta contra o alvo, causando 1d8 ígneo.",
  },
  {
    name: "Mãos Sombrias",
    key: "shadow-hands",
    level: 0,
    school: "NECROMANCY",
    castingTime: "1 ação",
    range: "9 metros",
    duration: "Instantânea",
    components: "S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Sombras em forma de mãos agarram brevemente um alvo, causando 1d6 necrótico.",
  },
  {
    name: "Véu Ilusório",
    key: "illusory-veil",
    level: 1,
    school: "ILLUSION",
    castingTime: "1 ação",
    range: "Pessoal",
    duration: "10 minutos",
    components: "V, S",
    isRitual: false,
    requiresConcentration: true,
    description:
      "Distorce a percepção ao redor do conjurador, criando uma camada sutil de disfarce, sombra ou ocultação.",
  },
  {
    name: "Pulso Arcano",
    key: "arcane-pulse",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 ação",
    range: "18 metros",
    duration: "Instantânea",
    components: "V, S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Libera um impacto de energia arcana instável contra um alvo ou ponto visível, causando 1d10 energético.",
  },
  {
    name: "Sussurros dos Mortos",
    key: "dead-whispers",
    level: 1,
    school: "NECROMANCY",
    castingTime: "1 minuto",
    range: "Pessoal",
    duration: "1 minuto",
    components: "V, S, M",
    isRitual: true,
    requiresConcentration: false,
    description:
      "Permite ouvir ecos breves deixados por uma alma, cadáver ou lugar marcado pela morte recente.",
  },
  {
    name: "Dardo de Energia",
    key: "energy-dart",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 ação",
    range: "36 metros",
    duration: "Instantânea",
    components: "V, S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Cria três dardos de energia que atingem criaturas visíveis, causando 1d4+1 energético cada.",
  },
  {
    name: "Curar Ferimentos",
    key: "mend-wounds",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 ação",
    range: "Toque",
    duration: "Instantânea",
    components: "V, S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Canaliza energia restauradora pelo toque, recuperando 1d8 pontos de vida.",
  },
  {
    name: "Escudo Reativo",
    key: "reactive-shield",
    level: 1,
    school: "ABJURATION",
    castingTime: "1 reação",
    range: "Pessoal",
    duration: "1 rodada",
    components: "V, S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Ergue uma barreira instantânea contra um ataque, aumentando temporariamente a defesa do conjurador.",
  },
  {
    name: "Raízes Prendentes",
    key: "binding-roots",
    level: 1,
    school: "CONJURATION",
    castingTime: "1 ação",
    range: "18 metros",
    duration: "1 minuto",
    components: "V, S",
    isRitual: false,
    requiresConcentration: true,
    description:
      "Raízes mutadas irrompem do chão e tentam prender criaturas em uma área pequena.",
  },
  {
    name: "Comando Sombrio",
    key: "dark-command",
    level: 1,
    school: "ENCHANTMENT",
    castingTime: "1 ação",
    range: "18 metros",
    duration: "1 rodada",
    components: "V",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Impõe uma ordem breve carregada de energia sombria a uma criatura que possa ouvir o conjurador.",
  },
  {
    name: "Marca do Agouro",
    key: "omen-mark",
    level: 1,
    school: "DIVINATION",
    castingTime: "1 ação bônus",
    range: "18 metros",
    duration: "1 minuto",
    components: "V",
    isRitual: false,
    requiresConcentration: true,
    description:
      "Marca uma criatura com um presságio visível apenas ao conjurador, facilitando ataques e leituras contra ela.",
  },
  {
    name: "Onda Trovejante",
    key: "thunder-wave",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 ação",
    range: "Pessoal",
    duration: "Instantânea",
    components: "V, S",
    isRitual: false,
    requiresConcentration: false,
    description:
      "Libera uma onda de impacto sonoro ao redor do conjurador, causando 2d8 trovejante e empurrando criaturas próximas.",
  },
] as const;

const classSpellAccess = [
  {
    classKey: "bard",
    spellKeys: [
      "minor-light",
      "arcane-spark",
      "mind-burst",
      "illusory-veil",
      "arcane-pulse",
      "energy-dart",
      "reactive-shield",
      "omen-mark",
      "thunder-wave",
    ],
    minimumClassLevel: 1,
  },
  {
    classKey: "warlock",
    spellKeys: [
      "funeral-touch",
      "mind-burst",
      "shadow-hands",
      "illusory-veil",
      "dead-whispers",
      "dark-command",
      "omen-mark",
    ],
    minimumClassLevel: 1,
  },
  {
    classKey: "devotee",
    spellKeys: [
      "minor-light",
      "funeral-touch",
      "mend-wounds",
      "dead-whispers",
      "dark-command",
      "reactive-shield",
    ],
    minimumClassLevel: 1,
  },
  {
    classKey: "druid",
    spellKeys: [
      "minor-light",
      "unstable-flame",
      "binding-roots",
      "mend-wounds",
      "dead-whispers",
    ],
    minimumClassLevel: 1,
  },
  {
    classKey: "sorcerer",
    spellKeys: [
      "minor-light",
      "arcane-spark",
      "unstable-flame",
      "mind-burst",
      "arcane-pulse",
      "energy-dart",
      "reactive-shield",
      "thunder-wave",
    ],
    minimumClassLevel: 1,
  },
  {
    classKey: "wizard",
    spellKeys: [
      "minor-light",
      "funeral-touch",
      "arcane-spark",
      "mind-burst",
      "unstable-flame",
      "shadow-hands",
      "illusory-veil",
      "arcane-pulse",
      "dead-whispers",
      "energy-dart",
      "reactive-shield",
      "binding-roots",
      "dark-command",
      "omen-mark",
      "thunder-wave",
    ],
    minimumClassLevel: 1,
  },
  {
    classKey: "oathbound",
    spellKeys: ["minor-light", "mend-wounds", "reactive-shield"],
    minimumClassLevel: 2,
  },
  {
    classKey: "ranger",
    spellKeys: ["minor-light", "unstable-flame", "binding-roots", "mend-wounds"],
    minimumClassLevel: 2,
  },
  {
    classKey: "technomancer",
    spellKeys: [
      "minor-light",
      "arcane-spark",
      "arcane-pulse",
      "energy-dart",
      "reactive-shield",
    ],
    minimumClassLevel: 2,
  },
  {
    classKey: "necromancer",
    spellKeys: [
      "funeral-touch",
      "shadow-hands",
      "mind-burst",
      "dead-whispers",
      "dark-command",
      "omen-mark",
      "illusory-veil",
    ],
    minimumClassLevel: 1,
  },
] as const;

const equipment = [
  {
    name: "Adaga",
    key: "dagger",
    category: "WEAPON",
    damage: "1d4 perfurante",
    defense: null,
    cost: "2 moedas",
    weight: 0.5,
    properties: "Leve, arremesso",
    description:
      "Lâmina curta e fácil de ocultar, comum entre viajantes, ladinos e sobreviventes urbanos.",
  },
  {
    name: "Espada Longa",
    key: "longsword",
    category: "WEAPON",
    damage: "1d8 cortante",
    defense: null,
    cost: "15 moedas",
    weight: 1.5,
    properties: "Versátil",
    description:
      "Arma marcial equilibrada, usada por guerreiros, juramentados e combatentes treinados.",
  },
  {
    name: "Machado Pesado",
    key: "heavy-axe",
    category: "WEAPON",
    damage: "1d12 cortante",
    defense: null,
    cost: "30 moedas",
    weight: 3,
    properties: "Duas mãos, pesado",
    description:
      "Arma brutal capaz de partir madeira, osso e metal enfraquecido.",
  },
  {
    name: "Arco Curto",
    key: "shortbow",
    category: "WEAPON",
    damage: "1d6 perfurante",
    defense: null,
    cost: "25 moedas",
    weight: 1,
    properties: "Distância, duas mãos",
    description: "Arma simples para caça, patrulha e combate à distância.",
  },
  {
    name: "Armadura de Couro",
    key: "leather-armor",
    category: "ARMOR",
    damage: null,
    defense: 1,
    cost: "10 moedas",
    weight: 2,
    properties: "Leve",
    description:
      "Proteção leve feita de couro tratado, comum entre exploradores e viajantes.",
  },
  {
    name: "Cota Reforçada",
    key: "reinforced-mail",
    category: "ARMOR",
    damage: null,
    defense: 3,
    cost: "50 moedas",
    weight: 8,
    properties: "Média",
    description:
      "Armadura reforçada com placas, anéis metálicos e peças reaproveitadas.",
  },
  {
    name: "Escudo Simples",
    key: "simple-shield",
    category: "SHIELD",
    damage: null,
    defense: 1,
    cost: "10 moedas",
    weight: 3,
    properties: "Uma mão",
    description:
      "Escudo comum usado para bloquear golpes, proteger aliados e manter posição.",
  },
  {
    name: "Kit de Sobrevivência",
    key: "survival-kit",
    category: "GEAR",
    damage: null,
    defense: null,
    cost: "15 moedas",
    weight: 2,
    properties: "Exploração",
    description:
      "Conjunto básico com corda, pederneira, anzóis, lâmina pequena e suprimentos simples.",
  },
  {
    name: "Bolsa de Aventureiro",
    key: "adventurer-pouch",
    category: "GEAR",
    damage: null,
    defense: null,
    cost: "5 moedas",
    weight: 0.5,
    properties: "Carga, organização",
    description:
      "Bolsa resistente para moedas, rações pequenas, mapas, ferramentas leves e objetos pessoais.",
  },
  {
    name: "Pacote de Explorador",
    key: "explorer-pack",
    category: "GEAR",
    damage: null,
    defense: null,
    cost: "10 moedas",
    weight: 3,
    properties: "Exploração, viagem",
    description:
      "Mochila com itens básicos para viagem, acampamento e sobrevivência fora da cidade.",
  },
  {
    name: "Pé de Cabra",
    key: "crowbar",
    category: "TOOL",
    damage: null,
    defense: null,
    cost: "2 moedas",
    weight: 2,
    properties: "Arrombamento, força",
    description:
      "Barra metálica simples usada para forçar portas, mover obstáculos e improvisar alavancas.",
  },
  {
    name: "Ferramentas de Ladrão",
    key: "thieves-tools",
    category: "TOOL",
    damage: null,
    defense: null,
    cost: "25 moedas",
    weight: 1,
    properties: "Fechaduras, armadilhas",
    description:
      "Conjunto discreto de gazuas, pinças e instrumentos usados para fechaduras e mecanismos delicados.",
  },
  {
    name: "Ferramentas de Tecnomante",
    key: "technomancer-tools",
    category: "TOOL",
    damage: null,
    defense: null,
    cost: "40 moedas",
    weight: 3,
    properties: "Tecnológico, reparo",
    description:
      "Instrumentos usados para reparar circuitos antigos, improvisar dispositivos e manipular peças instáveis.",
  },
  {
    name: "Tônico de Campo",
    key: "field-tonic",
    category: "CONSUMABLE",
    damage: null,
    defense: null,
    cost: "25 moedas",
    weight: 0.2,
    properties: "Uso único, recuperação",
    description:
      "Mistura alquímica simples usada para recuperar fôlego e estabilizar ferimentos leves.",
  },
  {
    name: "Relíquia Quebrada",
    key: "broken-relic",
    category: "RELIC",
    damage: null,
    defense: null,
    cost: "Variável",
    weight: 1,
    properties: "Raro, instável, misterioso",
    description:
      "Fragmento de tecnologia ou magia antiga. Seu uso exato depende de estudo, risco e contexto narrativo.",
  },
] as const;

const backgrounds = [
  {
    name: "Devoto do Véu",
    key: "veil-devotee",
    description:
      "Antigo servidor de uma ordem, templo, culto ou tradição espiritual. Conhece ritos, símbolos, dogmas e segredos que nem sempre deveriam ser revelados.",
    skillKeys: ["intuicao", "religiao"],
    toolNames: [],
    languageChoiceCount: 2,
    startingGold: 15,
  },
  {
    name: "Marcado pelo Agouro",
    key: "omen-marked",
    description:
      "Você sobreviveu a um evento inexplicável: uma maldição, aparição, entidade, massacre ou presságio. Desde então, algo no mundo parece observar seus passos.",
    skillKeys: ["investigacao", "religiao"],
    toolNames: [],
    languageChoiceCount: 1,
    startingGold: 10,
  },
  {
    name: "Artesão de Guilda",
    key: "guild-artisan",
    description:
      "Você aprendeu um ofício respeitado em oficinas, forjas, ateliês ou casas de ofício. Sabe negociar, avaliar materiais e reconhecer trabalho bem-feito.",
    skillKeys: ["intuicao", "persuasao"],
    toolNames: ["Uma ferramenta de artesão"],
    languageChoiceCount: 1,
    startingGold: 15,
  },
  {
    name: "Menestrel Errante",
    key: "wandering-minstrel",
    description:
      "Você viveu de música, histórias, poesia, teatro ou sátira. Viu salões nobres, tavernas violentas e estradas longas demais para uma única vida.",
    skillKeys: ["atuacao", "persuasao"],
    toolNames: ["Um instrumento musical", "Kit de disfarce"],
    languageChoiceCount: 0,
    startingGold: 15,
  },
  {
    name: "Farsante de Corte",
    key: "court-fraud",
    description:
      "Você dominou mentiras elegantes, documentos falsos, máscaras sociais e jogos de influência. Pode ter servido a nobres, criminosos ou a si mesmo.",
    skillKeys: ["blefar", "prestidigitacao"],
    toolNames: ["Kit de disfarce", "Kit de falsificação"],
    languageChoiceCount: 0,
    startingGold: 15,
  },
  {
    name: "Lâmina de Beco",
    key: "alley-blade",
    description:
      "Você cresceu entre becos, dívidas, contrabando, furtos e violência silenciosa. Sabe como sobreviver quando a lei não entra em certas ruas.",
    skillKeys: ["furtividade", "blefar"],
    toolNames: ["Ferramentas de ladrão", "Um tipo de kit de jogo"],
    languageChoiceCount: 0,
    startingGold: 15,
  },
  {
    name: "Recluso dos Ermos",
    key: "wilds-recluse",
    description:
      "Você se afastou da civilização por fé, trauma, estudo ou exílio. Aprendeu a viver com pouco, observar sinais e ouvir o silêncio.",
    skillKeys: ["medicina", "religiao"],
    toolNames: ["Kit de herbalismo"],
    languageChoiceCount: 1,
    startingGold: 5,
  },
  {
    name: "Andarilho das Fronteiras",
    key: "frontier-walker",
    description:
      "Você conhece trilhas, ruínas, regiões hostis e caminhos esquecidos. Talvez tenha sido guia, caçador, exilado ou explorador.",
    skillKeys: ["atletismo", "sobrevivencia"],
    toolNames: ["Um instrumento musical ou ferramenta simples"],
    languageChoiceCount: 1,
    startingGold: 10,
  },
  {
    name: "Campeão da Aldeia",
    key: "village-champion",
    description:
      "Antes de ser aventureiro, você foi alguém do povo: defendeu uma vila, enfrentou um tirano local ou fez algo que virou história em uma região pequena.",
    skillKeys: ["lidar-com-animais", "sobrevivencia"],
    toolNames: ["Ferramentas de artesão ou veículos terrestres"],
    languageChoiceCount: 0,
    startingGold: 10,
  },
  {
    name: "Navegante de Marés Negras",
    key: "black-tide-navigator",
    description:
      "Você serviu em navios, portos, rios perigosos ou rotas marítimas. Conhece tempestades, contrabando, disciplina e superstição de marinheiro.",
    skillKeys: ["atletismo", "percepcao"],
    toolNames: ["Ferramentas de navegador", "Veículos aquáticos"],
    languageChoiceCount: 0,
    startingGold: 10,
  },
  {
    name: "Sangue de Brasão",
    key: "crest-blood",
    description:
      "Você nasceu ou foi criado entre casas nobres, linhagens antigas, títulos, juramentos e intrigas. Seu nome pode abrir portas — ou atrair lâminas.",
    skillKeys: ["historia", "persuasao"],
    toolNames: ["Um tipo de kit de jogo"],
    languageChoiceCount: 1,
    startingGold: 25,
  },
  {
    name: "Filho da Sarjeta",
    key: "gutter-child",
    description:
      "Você cresceu sem proteção real, dependendo de astúcia, roubo pequeno, favores e fuga. A rua foi sua escola e sua primeira inimiga.",
    skillKeys: ["furtividade", "prestidigitacao"],
    toolNames: ["Kit de disfarce", "Ferramentas de ladrão"],
    languageChoiceCount: 0,
    startingGold: 10,
  },
  {
    name: "Arquivista Arcano",
    key: "arcane-archivist",
    description:
      "Você passou anos entre livros, ruínas, bibliotecas, grimórios ou registros proibidos. Sabe que conhecimento é poder — e perigo.",
    skillKeys: ["arcanismo", "historia"],
    toolNames: [],
    languageChoiceCount: 2,
    startingGold: 10,
  },
  {
    name: "Veterano da Cinza",
    key: "ash-veteran-background",
    description:
      "Você viu guerra, cerco, massacre ou campanha militar. Carrega disciplina, cicatrizes e a memória de ordens que talvez nunca devessem ter sido obedecidas.",
    skillKeys: ["atletismo", "intimidacao"],
    toolNames: ["Um tipo de jogo", "Veículos terrestres"],
    languageChoiceCount: 0,
    startingGold: 10,
  },
  {
    name: "Peregrino de Terras Distantes",
    key: "distant-lands-pilgrim",
    description:
      "Você veio de longe: outra cultura, reino, ilha, deserto, plano ou região isolada. Sua presença carrega costumes e histórias pouco conhecidas.",
    skillKeys: ["intuicao", "percepcao"],
    toolNames: ["Um instrumento musical ou jogo"],
    languageChoiceCount: 1,
    startingGold: 5,
  },
  {
    name: "Caçador de Relíquias",
    key: "relic-hunter",
    description:
      "Você procurava artefatos, tumbas, ruínas, tecnologia antiga ou objetos amaldiçoados antes de se tornar aventureiro. Sabe que todo tesouro cobra preço.",
    skillKeys: ["investigacao", "arcanismo"],
    toolNames: ["Ferramentas de ladrão ou cartógrafo"],
    languageChoiceCount: 1,
    startingGold: 15,
  },
  {
    name: "Sobrevivente do Colapso",
    key: "collapse-survivor",
    description:
      "Você perdeu lar, família, ordem ou cidade em uma tragédia. Sobreviveu onde outros caíram e aprendeu a nunca confiar totalmente na estabilidade do mundo.",
    skillKeys: ["sobrevivencia", "percepcao"],
    toolNames: ["Kit de herbalismo ou ferramentas de artesão"],
    languageChoiceCount: 0,
    startingGold: 5,
  },
  {
    name: "Escudeiro Sem Senhor",
    key: "masterless-squire",
    description:
      "Você serviu um cavaleiro, ordem, casa nobre ou guerreiro famoso, mas nunca herdou glória. Agora busca provar que não nasceu apenas para carregar armas alheias.",
    skillKeys: ["atletismo", "historia"],
    toolNames: ["Um tipo de jogo ou veículos terrestres"],
    languageChoiceCount: 1,
    startingGold: 10,
  },
] as const;

async function main() {
  const system = await prisma.gameSystem.upsert({
    where: {
      name: SYSTEM_NAME,
    },
    update: {
      slug: SYSTEM_SLUG,
      version: 1,
    },
    create: {
      name: SYSTEM_NAME,
      slug: SYSTEM_SLUG,
      version: 1,
    },
  });

  console.log(`Sistema criado/atualizado: ${system.name}`);

  const createdStats = new Map<string, string>();
  const createdAncestries = new Map<string, string>();
  const createdClasses = new Map<string, string>();
  const createdSubclasses = new Map<string, string>();
  const createdLevelProgressions = new Map<string, string>();
  const createdSpells = new Map<string, string>();

  for (const [index, statData] of stats.entries()) {
    const stat = await prisma.stat.upsert({
      where: {
        systemId_name: {
          systemId: system.id,
          name: statData.name,
        },
      },
      update: {
        key: statData.key,
        shortName: statData.shortName,
        description: statData.description,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: statData.name,
        key: statData.key,
        shortName: statData.shortName,
        description: statData.description,
        order: index + 1,
      },
    });

    createdStats.set(stat.name, stat.id);

    console.log(`Atributo criado/validado: ${stat.name}`);
  }

  for (const [index, skillData] of skills.entries()) {
    const skillKey = createKeyFromName(skillData.name);
    const statId = createdStats.get(skillData.statName);

    if (!statId) {
      throw new Error(
        `Atributo "${skillData.statName}" não encontrado para a perícia "${skillData.name}".`,
      );
    }

    const skill = await prisma.skill.upsert({
      where: {
        systemId_name: {
          systemId: system.id,
          name: skillData.name,
        },
      },
      update: {
        statId,
        key: skillKey,
        description: null,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        statId,
        name: skillData.name,
        key: skillKey,
        description: null,
        order: index + 1,
      },
    });

    console.log(
      `Perícia criada/validada: ${skill.name} → ${skillData.statName}`,
    );
  }

  for (const [index, ancestryData] of ancestries.entries()) {
    const ancestry = await prisma.ancestry.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: ancestryData.key,
        },
      },
      update: {
        name: ancestryData.name,
        description: ancestryData.description,
        defaultSizeCategory: ancestryData.defaultSizeCategory,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: ancestryData.name,
        key: ancestryData.key,
        description: ancestryData.description,
        defaultSizeCategory: ancestryData.defaultSizeCategory,
        order: index + 1,
      },
    });

    createdAncestries.set(ancestryData.key, ancestry.id);

    console.log(`Ancestralidade criada/validada: ${ancestry.name}`);
  }

  for (const [index, classData] of classes.entries()) {
    const characterClass = await prisma.characterClass.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: classData.key,
        },
      },
      update: {
        name: classData.name,
        description: classData.description,
        primaryRole: classData.primaryRole,
        hitDie: classData.hitDie,
        spellcastingAbilityKey: classData.spellcastingAbilityKey,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: classData.name,
        key: classData.key,
        description: classData.description,
        primaryRole: classData.primaryRole,
        hitDie: classData.hitDie,
        spellcastingAbilityKey: classData.spellcastingAbilityKey,
        order: index + 1,
      },
    });

    createdClasses.set(classData.key, characterClass.id);

    console.log(`Classe criada/validada: ${characterClass.name}`);
  }

  for (const classData of classes) {
    const classId = createdClasses.get(classData.key);

    if (!classId) {
      throw new Error(
        `Classe "${classData.key}" não encontrada para criar progressão.`,
      );
    }

    for (let level = 1; level <= 20; level += 1) {
      const magicProgression = getClassMagicProgression(classData.key, level);

      const progression = await prisma.levelProgression.upsert({
        where: {
          classId_level: {
            classId,
            level,
          },
        },
        update: {
          systemId: system.id,
          proficiencyBonus: getProficiencyBonusByLevel(level),
          cantripsKnown: magicProgression.cantripsKnown,
          spellsKnown: magicProgression.spellsKnown,
          spellsPrepared: magicProgression.spellsPrepared,
          spellSlotsLevel1: magicProgression.spellSlotsLevel1,
          spellSlotsLevel2: magicProgression.spellSlotsLevel2,
          spellSlotsLevel3: magicProgression.spellSlotsLevel3,
          spellSlotsLevel4: magicProgression.spellSlotsLevel4,
          spellSlotsLevel5: magicProgression.spellSlotsLevel5,
          spellSlotsLevel6: magicProgression.spellSlotsLevel6,
          spellSlotsLevel7: magicProgression.spellSlotsLevel7,
          spellSlotsLevel8: magicProgression.spellSlotsLevel8,
          spellSlotsLevel9: magicProgression.spellSlotsLevel9,
        },
        create: {
          systemId: system.id,
          classId,
          level,
          proficiencyBonus: getProficiencyBonusByLevel(level),
          cantripsKnown: magicProgression.cantripsKnown,
          spellsKnown: magicProgression.spellsKnown,
          spellsPrepared: magicProgression.spellsPrepared,
          spellSlotsLevel1: magicProgression.spellSlotsLevel1,
          spellSlotsLevel2: magicProgression.spellSlotsLevel2,
          spellSlotsLevel3: magicProgression.spellSlotsLevel3,
          spellSlotsLevel4: magicProgression.spellSlotsLevel4,
          spellSlotsLevel5: magicProgression.spellSlotsLevel5,
          spellSlotsLevel6: magicProgression.spellSlotsLevel6,
          spellSlotsLevel7: magicProgression.spellSlotsLevel7,
          spellSlotsLevel8: magicProgression.spellSlotsLevel8,
          spellSlotsLevel9: magicProgression.spellSlotsLevel9,
        },
      });

      createdLevelProgressions.set(`${classData.key}:${level}`, progression.id);

      console.log(
        `Progressão validada: ${classData.name} nível ${progression.level}`,
      );
    }
  }

  for (const [index, subclassData] of subclasses.entries()) {
    const classId = createdClasses.get(subclassData.classKey);

    if (!classId) {
      throw new Error(
        `Classe "${subclassData.classKey}" não encontrada para a subclasse "${subclassData.name}".`,
      );
    }

    const subclass = await prisma.characterSubclass.upsert({
      where: {
        classId_key: {
          classId,
          key: subclassData.key,
        },
      },
      update: {
        systemId: system.id,
        name: subclassData.name,
        description: subclassData.description,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        classId,
        name: subclassData.name,
        key: subclassData.key,
        description: subclassData.description,
        order: index + 1,
      },
    });

    createdSubclasses.set(
      `${subclassData.classKey}:${subclassData.key}`,
      subclass.id,
    );

    console.log(`Subclasse criada/validada: ${subclass.name}`);
  }

  for (const [index, featureData] of features.entries()) {
    const ancestryId = featureData.ancestryKey
      ? createdAncestries.get(featureData.ancestryKey)
      : null;

    const classId = featureData.classKey
      ? createdClasses.get(featureData.classKey)
      : null;

    const subclassId =
      featureData.classKey && featureData.subclassKey
        ? createdSubclasses.get(
            `${featureData.classKey}:${featureData.subclassKey}`,
          )
        : null;

    const levelProgressionId =
      featureData.classKey && featureData.level
        ? createdLevelProgressions.get(
            `${featureData.classKey}:${featureData.level}`,
          )
        : null;

    if (featureData.ancestryKey && !ancestryId) {
      throw new Error(
        `Ancestralidade "${featureData.ancestryKey}" não encontrada para a feature "${featureData.name}".`,
      );
    }

    if (featureData.classKey && !classId) {
      throw new Error(
        `Classe "${featureData.classKey}" não encontrada para a feature "${featureData.name}".`,
      );
    }

    if (featureData.subclassKey && !subclassId) {
      throw new Error(
        `Subclasse "${featureData.subclassKey}" não encontrada para a feature "${featureData.name}".`,
      );
    }

    const feature = await prisma.feature.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: featureData.key,
        },
      },
      update: {
        ancestryId,
        classId,
        subclassId,
        levelProgressionId,
        sourceType: featureData.sourceType,
        name: featureData.name,
        description: featureData.description,
        level: featureData.level,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        ancestryId,
        classId,
        subclassId,
        levelProgressionId,
        sourceType: featureData.sourceType,
        name: featureData.name,
        key: featureData.key,
        description: featureData.description,
        level: featureData.level,
        order: index + 1,
      },
    });

    console.log(`Feature criada/validada: ${feature.name}`);
  }

  for (const [index, spellData] of spells.entries()) {
    const spell = await prisma.spell.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: spellData.key,
        },
      },
      update: {
        name: spellData.name,
        description: spellData.description,
        level: spellData.level,
        school: spellData.school,
        castingTime: spellData.castingTime,
        range: spellData.range,
        duration: spellData.duration,
        components: spellData.components,
        isRitual: spellData.isRitual,
        requiresConcentration: spellData.requiresConcentration,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: spellData.name,
        key: spellData.key,
        description: spellData.description,
        level: spellData.level,
        school: spellData.school,
        castingTime: spellData.castingTime,
        range: spellData.range,
        duration: spellData.duration,
        components: spellData.components,
        isRitual: spellData.isRitual,
        requiresConcentration: spellData.requiresConcentration,
        order: index + 1,
      },
    });

        createdSpells.set(spellData.key, spell.id);

    console.log(`Magia criada/validada: ${spell.name}`);
  }

    for (const classSpellData of classSpellAccess) {
    const classId = createdClasses.get(classSpellData.classKey);

    if (!classId) {
      throw new Error(
        `Classe "${classSpellData.classKey}" não encontrada para vincular magias.`,
      );
    }

    for (const spellKey of classSpellData.spellKeys) {
      const spellId = createdSpells.get(spellKey);

      if (!spellId) {
        throw new Error(
          `Magia "${spellKey}" não encontrada para a classe "${classSpellData.classKey}".`,
        );
      }

      const classSpell = await prisma.classSpell.upsert({
        where: {
          classId_spellId: {
            classId,
            spellId,
          },
        },
        update: {
          minimumClassLevel: classSpellData.minimumClassLevel,
          isAlwaysKnown: false,
        },
        create: {
          classId,
          spellId,
          minimumClassLevel: classSpellData.minimumClassLevel,
          isAlwaysKnown: false,
        },
      });

      console.log(
        `Magia de classe validada: ${classSpellData.classKey} → ${spellKey} nível mínimo ${classSpell.minimumClassLevel}`,
      );
    }
  }
  
  for (const [index, equipmentData] of equipment.entries()) {
    const item = await prisma.equipment.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: equipmentData.key,
        },
      },
      update: {
        name: equipmentData.name,
        category: equipmentData.category,
        description: equipmentData.description,
        cost: equipmentData.cost,
        weight: equipmentData.weight,
        damage: equipmentData.damage,
        defense: equipmentData.defense,
        properties: equipmentData.properties,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: equipmentData.name,
        key: equipmentData.key,
        category: equipmentData.category,
        description: equipmentData.description,
        cost: equipmentData.cost,
        weight: equipmentData.weight,
        damage: equipmentData.damage,
        defense: equipmentData.defense,
        properties: equipmentData.properties,
        order: index + 1,
      },
    });

    console.log(`Equipamento criado/validado: ${item.name}`);
  }

  for (const [index, backgroundData] of backgrounds.entries()) {
    const background = await prisma.background.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: backgroundData.key,
        },
      },
      update: {
        name: backgroundData.name,
        description: backgroundData.description,
        skillKeys: [...backgroundData.skillKeys],
        toolNames: [...backgroundData.toolNames],
        languageChoiceCount: backgroundData.languageChoiceCount,
        startingGold: backgroundData.startingGold,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: backgroundData.name,
        key: backgroundData.key,
        description: backgroundData.description,
        skillKeys: [...backgroundData.skillKeys],
        toolNames: [...backgroundData.toolNames],
        languageChoiceCount: backgroundData.languageChoiceCount,
        startingGold: backgroundData.startingGold,
        order: index + 1,
      },
    });

    console.log(`Antecedente criado/validado: ${background.name}`);
  }

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
