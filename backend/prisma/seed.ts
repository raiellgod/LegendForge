import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";
import { ancestries } from "./seed-data/ancestries.js";
import { backgrounds } from "./seed-data/backgrounds.js";
import { classSpellAccess } from "./seed-data/class-spells.js";
import { classes } from "./seed-data/classes.js";
import { creatureTemplates } from "./seed-data/creature-templates.js";
import { equipment } from "./seed-data/equipment.js";
import { featureChoiceGroups } from "./seed-data/feature-choice-groups.js";
import { features } from "./seed-data/features.js";
import { languages } from "./seed-data/languages.js";
import { npcTemplates } from "./seed-data/npc-templates.js";
import { skills } from "./seed-data/skills.js";
import { spells } from "./seed-data/spells.js";
import { stats } from "./seed-data/stats.js";
import { subAncestries } from "./seed-data/sub-ancestries.js";
import { subclasses } from "./seed-data/subclasses.js";
import { talents } from "./seed-data/talents.js";

const SYSTEM_NAME = "5e Homebrew — Ecos da Ruína";
const SYSTEM_SLUG = "meu-sistema";

function createKeyFromName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getProgressionChoiceCountByClassLevel(
  classKey: string,
  level: number,
) {
  void classKey;

  return level === 4 || level === 8 ? 1 : 0;
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

type SpellKnownPreparedLimit = {
  spellLevel: number;
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

function getHighestSpellSlotLevel(spellSlots: SpellSlotProgression) {
  const spellSlotEntries = [
    [1, spellSlots.spellSlotsLevel1],
    [2, spellSlots.spellSlotsLevel2],
    [3, spellSlots.spellSlotsLevel3],
    [4, spellSlots.spellSlotsLevel4],
    [5, spellSlots.spellSlotsLevel5],
    [6, spellSlots.spellSlotsLevel6],
    [7, spellSlots.spellSlotsLevel7],
    [8, spellSlots.spellSlotsLevel8],
    [9, spellSlots.spellSlotsLevel9],
  ] as const;

  const highestEntry = [...spellSlotEntries]
    .reverse()
    .find(([, slotCount]) => slotCount > 0);

  return highestEntry?.[0] ?? 0;
}

function distributeLeveledSpellCountBySpellLevel({
  totalSpellCount,
  highestSpellLevel,
}: {
  totalSpellCount: number;
  highestSpellLevel: number;
}) {
  if (totalSpellCount <= 0 || highestSpellLevel <= 0) {
    return new Map<number, number>();
  }

  const spellCountsByLevel = new Map<number, number>();

  for (let spellLevel = 1; spellLevel <= highestSpellLevel; spellLevel += 1) {
    spellCountsByLevel.set(spellLevel, 0);
  }

  for (let index = 0; index < totalSpellCount; index += 1) {
    const spellLevel = (index % highestSpellLevel) + 1;

    spellCountsByLevel.set(
      spellLevel,
      (spellCountsByLevel.get(spellLevel) ?? 0) + 1,
    );
  }

  return spellCountsByLevel;
}

function getSpellLimitsBySpellLevel(
  magicProgression: ClassMagicProgression,
): SpellKnownPreparedLimit[] {
  const highestSpellLevel = getHighestSpellSlotLevel(magicProgression);

  const knownLeveledSpellCounts = distributeLeveledSpellCountBySpellLevel({
    totalSpellCount: magicProgression.spellsKnown,
    highestSpellLevel,
  });

  const preparedLeveledSpellCounts = distributeLeveledSpellCountBySpellLevel({
    totalSpellCount: magicProgression.spellsPrepared,
    highestSpellLevel,
  });

  const spellLimits: SpellKnownPreparedLimit[] = [
    {
      spellLevel: 0,
      spellsKnown: magicProgression.cantripsKnown,
      spellsPrepared: 0,
    },
  ];

  for (let spellLevel = 1; spellLevel <= highestSpellLevel; spellLevel += 1) {
    spellLimits.push({
      spellLevel,
      spellsKnown: knownLeveledSpellCounts.get(spellLevel) ?? 0,
      spellsPrepared: preparedLeveledSpellCounts.get(spellLevel) ?? 0,
    });
  }

  return spellLimits;
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

async function main() {
  const system = await prisma.gameSystem.upsert({
    where: {
      slug: SYSTEM_SLUG,
    },
    update: {
      name: SYSTEM_NAME,
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
  const createdSubAncestries = new Map<string, string>();
  const createdClasses = new Map<string, string>();
  const createdSubclasses = new Map<string, string>();
  const createdLevelProgressions = new Map<string, string>();
  const createdFeatures = new Map<string, string>();
  const createdSpells = new Map<string, string>();

  for (const [index, npcTemplateData] of npcTemplates.entries()) {
    const npcTemplate = await prisma.npcTemplate.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: npcTemplateData.key,
        },
      },
      update: {
        name: npcTemplateData.name,
        initials: npcTemplateData.initials,
        description: npcTemplateData.description,
        portraitUrl: npcTemplateData.portraitUrl,
        tokenImageUrl: npcTemplateData.tokenImageUrl,
        tokenImageFit: npcTemplateData.tokenImageFit,
        size: npcTemplateData.size,
        role: npcTemplateData.role,
        faction: npcTemplateData.faction,
        personality: npcTemplateData.personality,
        motivation: npcTemplateData.motivation,
        behavior: npcTemplateData.behavior,
        tactics: npcTemplateData.tactics,
        lore: npcTemplateData.lore,
        notes: npcTemplateData.notes,
        armorClass: npcTemplateData.armorClass,
        hitPoints: npcTemplateData.hitPoints,
        maxHitPoints: npcTemplateData.maxHitPoints,
        temporaryHp: npcTemplateData.temporaryHp,
        speed: npcTemplateData.speed,
        climbSpeed: npcTemplateData.climbSpeed,
        swimSpeed: npcTemplateData.swimSpeed,
        flySpeed: npcTemplateData.flySpeed,
        burrowSpeed: npcTemplateData.burrowSpeed,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        key: npcTemplateData.key,
        name: npcTemplateData.name,
        initials: npcTemplateData.initials,
        description: npcTemplateData.description,
        portraitUrl: npcTemplateData.portraitUrl,
        tokenImageUrl: npcTemplateData.tokenImageUrl,
        tokenImageFit: npcTemplateData.tokenImageFit,
        size: npcTemplateData.size,
        role: npcTemplateData.role,
        faction: npcTemplateData.faction,
        personality: npcTemplateData.personality,
        motivation: npcTemplateData.motivation,
        behavior: npcTemplateData.behavior,
        tactics: npcTemplateData.tactics,
        lore: npcTemplateData.lore,
        notes: npcTemplateData.notes,
        armorClass: npcTemplateData.armorClass,
        hitPoints: npcTemplateData.hitPoints,
        maxHitPoints: npcTemplateData.maxHitPoints,
        temporaryHp: npcTemplateData.temporaryHp,
        speed: npcTemplateData.speed,
        climbSpeed: npcTemplateData.climbSpeed,
        swimSpeed: npcTemplateData.swimSpeed,
        flySpeed: npcTemplateData.flySpeed,
        burrowSpeed: npcTemplateData.burrowSpeed,
        order: index + 1,
      },
    });

    console.log(`Template de NPC criado/validado: ${npcTemplate.name}`);
  }

  for (const [index, creatureTemplateData] of creatureTemplates.entries()) {
    const creatureTemplate = await prisma.creatureTemplate.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: creatureTemplateData.key,
        },
      },
      update: {
        name: creatureTemplateData.name,
        initials: creatureTemplateData.initials,
        description: creatureTemplateData.description,
        portraitUrl: creatureTemplateData.portraitUrl,
        tokenImageUrl: creatureTemplateData.tokenImageUrl,
        tokenImageFit: creatureTemplateData.tokenImageFit,
        size: creatureTemplateData.size,
        creatureType: creatureTemplateData.creatureType,
        habitat: creatureTemplateData.habitat,
        behavior: creatureTemplateData.behavior,
        tactics: creatureTemplateData.tactics,
        lore: creatureTemplateData.lore,
        notes: creatureTemplateData.notes,
        armorClass: creatureTemplateData.armorClass,
        hitPoints: creatureTemplateData.hitPoints,
        maxHitPoints: creatureTemplateData.maxHitPoints,
        temporaryHp: creatureTemplateData.temporaryHp,
        speed: creatureTemplateData.speed,
        climbSpeed: creatureTemplateData.climbSpeed,
        swimSpeed: creatureTemplateData.swimSpeed,
        flySpeed: creatureTemplateData.flySpeed,
        burrowSpeed: creatureTemplateData.burrowSpeed,
        challengeRating: creatureTemplateData.challengeRating,
        experienceReward: creatureTemplateData.experienceReward,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        key: creatureTemplateData.key,
        name: creatureTemplateData.name,
        initials: creatureTemplateData.initials,
        description: creatureTemplateData.description,
        portraitUrl: creatureTemplateData.portraitUrl,
        tokenImageUrl: creatureTemplateData.tokenImageUrl,
        tokenImageFit: creatureTemplateData.tokenImageFit,
        size: creatureTemplateData.size,
        creatureType: creatureTemplateData.creatureType,
        habitat: creatureTemplateData.habitat,
        behavior: creatureTemplateData.behavior,
        tactics: creatureTemplateData.tactics,
        lore: creatureTemplateData.lore,
        notes: creatureTemplateData.notes,
        armorClass: creatureTemplateData.armorClass,
        hitPoints: creatureTemplateData.hitPoints,
        maxHitPoints: creatureTemplateData.maxHitPoints,
        temporaryHp: creatureTemplateData.temporaryHp,
        speed: creatureTemplateData.speed,
        climbSpeed: creatureTemplateData.climbSpeed,
        swimSpeed: creatureTemplateData.swimSpeed,
        flySpeed: creatureTemplateData.flySpeed,
        burrowSpeed: creatureTemplateData.burrowSpeed,
        challengeRating: creatureTemplateData.challengeRating,
        experienceReward: creatureTemplateData.experienceReward,
        order: index + 1,
      },
    });

    console.log(
      `Template de criatura criado/validado: ${creatureTemplate.name}`,
    );
  }

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

  const canonicalCommonLanguage = await prisma.language.findUnique({
    where: {
      systemId_key: {
        systemId: system.id,
        key: "common",
      },
    },
  });

  const legacyCommonLanguageByName = await prisma.language.findFirst({
    where: {
      systemId: system.id,
      name: "Comum",
    },
  });

  if (!canonicalCommonLanguage && legacyCommonLanguageByName) {
    await prisma.language.update({
      where: {
        id: legacyCommonLanguageByName.id,
      },
      data: {
        key: "common",
        name: "Comum",
        description:
          "Idioma comum usado como língua franca entre povos, cidades e viajantes.",
      },
    });

    console.log("Idioma legado migrado para key canonical: common");
  }

  for (const [index, languageData] of languages.entries()) {
    const language = await prisma.language.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: languageData.key,
        },
      },
      update: {
        name: languageData.name,
        description: languageData.description,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: languageData.name,
        key: languageData.key,
        description: languageData.description,
        order: index + 1,
      },
    });

    console.log(`Idioma criado/validado: ${language.name}`);
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
        attributeBonuses: ancestryData.attributeBonuses,
        languageKeys: [...ancestryData.languageKeys],
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: ancestryData.name,
        key: ancestryData.key,
        description: ancestryData.description,
        defaultSizeCategory: ancestryData.defaultSizeCategory,
        attributeBonuses: ancestryData.attributeBonuses,
        languageKeys: [...ancestryData.languageKeys],
        order: index + 1,
      },
    });

    createdAncestries.set(ancestryData.key, ancestry.id);

    console.log(`Ancestralidade criada/validada: ${ancestry.name}`);
  }

  for (const [index, subAncestryData] of subAncestries.entries()) {
    const ancestryId = createdAncestries.get(subAncestryData.ancestryKey);

    if (!ancestryId) {
      throw new Error(
        `Ancestralidade "${subAncestryData.ancestryKey}" não encontrada para a sub-ancestralidade "${subAncestryData.name}".`,
      );
    }

    const subAncestry = await prisma.subAncestry.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: subAncestryData.key,
        },
      },
      update: {
        ancestryId,
        name: subAncestryData.name,
        description: subAncestryData.description,
        sizeCategoryOverride: subAncestryData.sizeCategoryOverride,
        attributeBonuses: subAncestryData.attributeBonuses,
        languageKeys: [...subAncestryData.languageKeys],
        order: index + 1,
      },
      create: {
        systemId: system.id,
        ancestryId,
        name: subAncestryData.name,
        key: subAncestryData.key,
        description: subAncestryData.description,
        sizeCategoryOverride: subAncestryData.sizeCategoryOverride,
        attributeBonuses: subAncestryData.attributeBonuses,
        languageKeys: [...subAncestryData.languageKeys],
        order: index + 1,
      },
    });

    createdSubAncestries.set(subAncestryData.key, subAncestry.id);

    console.log(
      `Sub-ancestralidade criada/validada: ${subAncestry.name} → ${subAncestryData.ancestryKey}`,
    );
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
        subclassSelectionLevel: classData.subclassSelectionLevel,
        classSkillChoiceCount: classData.classSkillChoiceCount,
        weaponProficiencyKeys: [...classData.weaponProficiencyKeys],
        protectionProficiencyKeys: [...classData.protectionProficiencyKeys],
        toolProficiencyKeys: [...classData.toolProficiencyKeys],
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
        subclassSelectionLevel: classData.subclassSelectionLevel,
        classSkillChoiceCount: classData.classSkillChoiceCount,
        weaponProficiencyKeys: [...classData.weaponProficiencyKeys],
        protectionProficiencyKeys: [...classData.protectionProficiencyKeys],
        toolProficiencyKeys: [...classData.toolProficiencyKeys],
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
          progressionChoiceCount: getProgressionChoiceCountByClassLevel(
            classData.key,
            level,
          ),
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
          progressionChoiceCount: getProgressionChoiceCountByClassLevel(
            classData.key,
            level,
          ),
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

      const spellLimits = getSpellLimitsBySpellLevel(magicProgression);

      await prisma.$transaction([
        prisma.levelProgressionSpellLimit.deleteMany({
          where: {
            levelProgressionId: progression.id,
          },
        }),

        ...spellLimits.map((spellLimit) =>
          prisma.levelProgressionSpellLimit.create({
            data: {
              levelProgressionId: progression.id,
              spellLevel: spellLimit.spellLevel,
              spellsKnown: spellLimit.spellsKnown,
              spellsPrepared: spellLimit.spellsPrepared,
            },
          }),
        ),
      ]);

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

    createdFeatures.set(featureData.key, feature.id);

    console.log(`Feature criada/validada: ${feature.name}`);
  }

  for (const groupData of featureChoiceGroups) {
    const ancestryId = groupData.ancestryKey
      ? createdAncestries.get(groupData.ancestryKey)
      : null;

    const backgroundId = groupData.backgroundKey
      ? await prisma.background
          .findUnique({
            where: {
              systemId_key: {
                systemId: system.id,
                key: groupData.backgroundKey,
              },
            },
            select: {
              id: true,
            },
          })
          .then((background) => background?.id ?? null)
      : null;

    const classId = groupData.classKey
      ? createdClasses.get(groupData.classKey)
      : null;

    const subclassId =
      groupData.classKey && groupData.subclassKey
        ? createdSubclasses.get(
            `${groupData.classKey}:${groupData.subclassKey}`,
          )
        : null;

    const levelProgressionId =
      groupData.classKey && groupData.level
        ? createdLevelProgressions.get(
            `${groupData.classKey}:${groupData.level}`,
          )
        : null;

    if (groupData.ancestryKey && !ancestryId) {
      throw new Error(
        `Ancestralidade "${groupData.ancestryKey}" não encontrada para o grupo "${groupData.name}".`,
      );
    }

    if (groupData.backgroundKey && !backgroundId) {
      throw new Error(
        `Antecedente "${groupData.backgroundKey}" não encontrado para o grupo "${groupData.name}".`,
      );
    }

    if (groupData.classKey && !classId) {
      throw new Error(
        `Classe "${groupData.classKey}" não encontrada para o grupo "${groupData.name}".`,
      );
    }

    if (groupData.subclassKey && !subclassId) {
      throw new Error(
        `Subclasse "${groupData.subclassKey}" não encontrada para o grupo "${groupData.name}".`,
      );
    }

    if (groupData.level && groupData.classKey && !levelProgressionId) {
      throw new Error(
        `Progressão "${groupData.classKey}:${groupData.level}" não encontrada para o grupo "${groupData.name}".`,
      );
    }

    if (groupData.choiceCount < 1) {
      throw new Error(
        `O grupo "${groupData.name}" precisa exigir pelo menos uma escolha.`,
      );
    }

    if (groupData.choiceCount > groupData.optionFeatureKeys.length) {
      throw new Error(
        `O grupo "${groupData.name}" exige mais escolhas do que possui opções.`,
      );
    }

    const choiceGroup = await prisma.featureChoiceGroup.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: groupData.key,
        },
      },
      update: {
        ancestryId,
        backgroundId,
        classId,
        subclassId,
        levelProgressionId,
        name: groupData.name,
        description: groupData.description,
        choiceCount: groupData.choiceCount,
        order: groupData.order,
      },
      create: {
        systemId: system.id,
        ancestryId,
        backgroundId,
        classId,
        subclassId,
        levelProgressionId,
        key: groupData.key,
        name: groupData.name,
        description: groupData.description,
        choiceCount: groupData.choiceCount,
        order: groupData.order,
      },
    });

    const optionFeatureIds = groupData.optionFeatureKeys.map((featureKey) => {
      const featureId = createdFeatures.get(featureKey);

      if (!featureId) {
        throw new Error(
          `Feature "${featureKey}" não encontrada para o grupo "${groupData.name}".`,
        );
      }

      return {
        featureKey,
        featureId,
      };
    });

    await prisma.$transaction([
      prisma.featureChoiceOption.deleteMany({
        where: {
          choiceGroupId: choiceGroup.id,
        },
      }),

      ...optionFeatureIds.map(({ featureId }, optionIndex) =>
        prisma.featureChoiceOption.create({
          data: {
            choiceGroupId: choiceGroup.id,
            featureId,
            order: optionIndex + 1,
          },
        }),
      ),
    ]);

    console.log(
      `Grupo de escolha validado: ${choiceGroup.name} → ${optionFeatureIds.length} opções`,
    );
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
        imageUrl: equipmentData.imageUrl,
        cost: equipmentData.cost,
        weight: equipmentData.weight,
        damage: equipmentData.damage,
        damageFormula: equipmentData.damageFormula,
        damageType: equipmentData.damageType,
        defense: equipmentData.defense,
        properties: equipmentData.properties,
        attackType: equipmentData.attackType,
        attackAbilityKey: equipmentData.attackAbilityKey,
        alternativeAbilityKey: equipmentData.alternativeAbilityKey,
        weaponGroup: equipmentData.weaponGroup,
        normalRange: equipmentData.normalRange,
        longRange: equipmentData.longRange,
        isFinesse: equipmentData.isFinesse,
        isThrown: equipmentData.isThrown,
        isTwoHanded: equipmentData.isTwoHanded,
        isVersatile: equipmentData.isVersatile,
        versatileDamageFormula: equipmentData.versatileDamageFormula,
        attackBonus: equipmentData.attackBonus,
        damageBonus: equipmentData.damageBonus,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: equipmentData.name,
        key: equipmentData.key,
        category: equipmentData.category,
        description: equipmentData.description,
        imageUrl: equipmentData.imageUrl,
        cost: equipmentData.cost,
        weight: equipmentData.weight,
        damage: equipmentData.damage,
        damageFormula: equipmentData.damageFormula,
        damageType: equipmentData.damageType,
        defense: equipmentData.defense,
        properties: equipmentData.properties,
        attackType: equipmentData.attackType,
        attackAbilityKey: equipmentData.attackAbilityKey,
        alternativeAbilityKey: equipmentData.alternativeAbilityKey,
        weaponGroup: equipmentData.weaponGroup,
        normalRange: equipmentData.normalRange,
        longRange: equipmentData.longRange,
        isFinesse: equipmentData.isFinesse,
        isThrown: equipmentData.isThrown,
        isTwoHanded: equipmentData.isTwoHanded,
        isVersatile: equipmentData.isVersatile,
        versatileDamageFormula: equipmentData.versatileDamageFormula,
        attackBonus: equipmentData.attackBonus,
        damageBonus: equipmentData.damageBonus,
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
        languageKeys: [...backgroundData.languageKeys],
        startingGold: backgroundData.startingGold,
        attributeBonuses: backgroundData.attributeBonuses,
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
        languageKeys: [...backgroundData.languageKeys],
        startingGold: backgroundData.startingGold,
        attributeBonuses: backgroundData.attributeBonuses,
        order: index + 1,
      },
    });

    console.log(`Antecedente criado/validado: ${background.name}`);
  }

  for (const [index, talentData] of talents.entries()) {
    const talent = await prisma.talent.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: talentData.key,
        },
      },
      update: {
        name: talentData.name,
        description: talentData.description,
        prerequisites: talentData.prerequisites,
        attributeBonuses: talentData.attributeBonuses,
        isRepeatable: talentData.isRepeatable,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        key: talentData.key,
        name: talentData.name,
        description: talentData.description,
        prerequisites: talentData.prerequisites,
        attributeBonuses: talentData.attributeBonuses,
        isRepeatable: talentData.isRepeatable,
        order: index + 1,
      },
    });

    console.log(`Talento criado/validado: ${talent.name}`);
  }


  /*
   * 5.11.15 — CharacterTemplate mínimo.
   *
   * Este template é conteúdo somente leitura do GameSystem.
   * Ele representa uma configuração resolvida e reutilizável de personagem,
   * sem campaignId, ownerId, CampaignActor ou estado vivo de campanha.
   */
  const templateAncestry = await prisma.ancestry.findUnique({
    where: {
      systemId_key: {
        systemId: system.id,
        key: "humanis",
      },
    },
  });

  const templateBackground = await prisma.background.findUnique({
    where: {
      systemId_key: {
        systemId: system.id,
        key: "village-champion",
      },
    },
  });

  const templateClass = await prisma.characterClass.findUnique({
    where: {
      systemId_key: {
        systemId: system.id,
        key: "fighter",
      },
    },
  });

  if (!templateAncestry || !templateBackground || !templateClass) {
    throw new Error(
      "Não foi possível criar o CharacterTemplate mínimo: Humanis, Campeão da Aldeia ou Guerreiro não foi encontrado.",
    );
  }

  const templateStatBaseValues = {
    strength: 15,
    dexterity: 13,
    constitution: 14,
    intelligence: 10,
    wisdom: 12,
    charisma: 8,
  } as const;

  const templateStats = await prisma.stat.findMany({
    where: {
      systemId: system.id,
      key: {
        in: Object.keys(templateStatBaseValues),
      },
    },
    select: {
      id: true,
      key: true,
    },
  });

  if (templateStats.length !== Object.keys(templateStatBaseValues).length) {
    throw new Error(
      "Não foi possível criar o CharacterTemplate mínimo: nem todos os seis atributos foram encontrados.",
    );
  }

  const templateSkillSources = new Map<string, string>([
    ["forca-bruta", "background"],
    ["sobrevivencia", "background"],
    ["atletismo", "class"],
    ["intimidacao", "class"],
    ["percepcao", "class"],
  ]);

  const templateSkills = await prisma.skill.findMany({
    where: {
      systemId: system.id,
      key: {
        in: Array.from(templateSkillSources.keys()),
      },
    },
    select: {
      id: true,
      key: true,
    },
  });

  if (templateSkills.length !== templateSkillSources.size) {
    throw new Error(
      "Não foi possível criar o CharacterTemplate mínimo: uma ou mais perícias esperadas não foram encontradas.",
    );
  }

  const commonLanguage = await prisma.language.findUnique({
    where: {
      systemId_key: {
        systemId: system.id,
        key: "common",
      },
    },
  });

  if (!commonLanguage) {
    throw new Error(
      'Não foi possível criar o CharacterTemplate mínimo: idioma "common" não encontrado.',
    );
  }

  const templateEquipmentKeys = [
    "longsword",
    "leather-armor",
    "simple-shield",
    "adventurer-pouch",
  ];

  const templateEquipment = await prisma.equipment.findMany({
    where: {
      systemId: system.id,
      key: {
        in: templateEquipmentKeys,
      },
    },
    select: {
      id: true,
      key: true,
    },
  });

  if (templateEquipment.length !== templateEquipmentKeys.length) {
    throw new Error(
      "Não foi possível criar o CharacterTemplate mínimo: um ou mais equipamentos esperados não foram encontrados.",
    );
  }

  const characterTemplate = await prisma.characterTemplate.upsert({
    where: {
      systemId_key: {
        systemId: system.id,
        key: "humanis-village-champion",
      },
    },
    update: {
      ancestryId: templateAncestry.id,
      subAncestryId: null,
      backgroundId: templateBackground.id,
      name: "Campeão Humanis",
      description:
        "Personagem-template inicial do sistema: guerreiro Humanis preparado para servir como exemplo completo de ficha reutilizável.",
      pronouns: null,
      concept: "Veterano comunitário e defensor das regiões habitadas.",
      portraitUrl: null,
      tokenImageUrl: null,
      tokenImageFit: "COVER",
      level: 1,
      maxHitPoints: 12,
      armorClass: 12,
      speed: 30,
      classEquipmentMode: "PACKAGE",
      backgroundEquipmentMode: "PACKAGE",
      startingGold: templateBackground.startingGold,
      alignment: null,
      faith: null,
      lifestyle: null,
      hair: null,
      skin: null,
      eyes: null,
      height: null,
      weight: null,
      age: null,
      gender: null,
      bonds:
        "Protege comunidades que não possuem força suficiente para enfrentar os perigos das ruínas sozinhas.",
      flaws:
        "Tem dificuldade em abandonar uma posição quando acredita que alguém ainda depende de sua proteção.",
      ideals:
        "Sobrevivência coletiva exige disciplina, coragem e responsabilidade.",
      personality:
        "Prático, vigilante e acostumado a agir antes que uma ameaça alcance pessoas vulneráveis.",
      backstory:
        "Antes de se tornar aventureiro, ganhou respeito defendendo uma comunidade contra perigos das regiões devastadas.",
      organizations: null,
      allies: null,
      enemies: null,
      notes: "Template mínimo criado na Fase 5.11.",
      otherNotes: null,
      order: 1,
    },
    create: {
      systemId: system.id,
      ancestryId: templateAncestry.id,
      subAncestryId: null,
      backgroundId: templateBackground.id,
      key: "humanis-village-champion",
      name: "Campeão Humanis",
      description:
        "Personagem-template inicial do sistema: guerreiro Humanis preparado para servir como exemplo completo de ficha reutilizável.",
      pronouns: null,
      concept: "Veterano comunitário e defensor das regiões habitadas.",
      portraitUrl: null,
      tokenImageUrl: null,
      tokenImageFit: "COVER",
      level: 1,
      maxHitPoints: 12,
      armorClass: 12,
      speed: 30,
      classEquipmentMode: "PACKAGE",
      backgroundEquipmentMode: "PACKAGE",
      startingGold: templateBackground.startingGold,
      alignment: null,
      faith: null,
      lifestyle: null,
      hair: null,
      skin: null,
      eyes: null,
      height: null,
      weight: null,
      age: null,
      gender: null,
      bonds:
        "Protege comunidades que não possuem força suficiente para enfrentar os perigos das ruínas sozinhas.",
      flaws:
        "Tem dificuldade em abandonar uma posição quando acredita que alguém ainda depende de sua proteção.",
      ideals:
        "Sobrevivência coletiva exige disciplina, coragem e responsabilidade.",
      personality:
        "Prático, vigilante e acostumado a agir antes que uma ameaça alcance pessoas vulneráveis.",
      backstory:
        "Antes de se tornar aventureiro, ganhou respeito defendendo uma comunidade contra perigos das regiões devastadas.",
      organizations: null,
      allies: null,
      enemies: null,
      notes: "Template mínimo criado na Fase 5.11.",
      otherNotes: null,
      order: 1,
    },
  });

  await prisma.$transaction([
    prisma.characterTemplateClass.deleteMany({
      where: {
        templateId: characterTemplate.id,
      },
    }),
    prisma.characterTemplateStat.deleteMany({
      where: {
        templateId: characterTemplate.id,
      },
    }),
    prisma.characterTemplateSkill.deleteMany({
      where: {
        templateId: characterTemplate.id,
      },
    }),
    prisma.characterTemplateSpell.deleteMany({
      where: {
        templateId: characterTemplate.id,
      },
    }),
    prisma.characterTemplateEquipment.deleteMany({
      where: {
        templateId: characterTemplate.id,
      },
    }),
    prisma.characterTemplateLanguage.deleteMany({
      where: {
        templateId: characterTemplate.id,
      },
    }),
    prisma.characterTemplateFeatureChoice.deleteMany({
      where: {
        templateId: characterTemplate.id,
      },
    }),
    prisma.characterTemplateProgressionChoice.deleteMany({
      where: {
        templateId: characterTemplate.id,
      },
    }),
  ]);

  await prisma.characterTemplateClass.create({
    data: {
      templateId: characterTemplate.id,
      classId: templateClass.id,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
    },
  });

  await prisma.characterTemplateStat.createMany({
    data: templateStats.map((stat) => {
      const statKey = stat.key as keyof typeof templateStatBaseValues;

      return {
        templateId: characterTemplate.id,
        statId: stat.id,
        baseValue: templateStatBaseValues[statKey],
        bonusValue: 1,
        overrideValue: null,
        isSavingThrowProficient: false,
      };
    }),
  });

  await prisma.characterTemplateSkill.createMany({
    data: templateSkills.map((skill) => ({
      templateId: characterTemplate.id,
      skillId: skill.id,
      isProficient: true,
      expertiseLevel: 0,
      bonusValue: 0,
      overrideValue: null,
      source: templateSkillSources.get(skill.key) ?? "builder",
    })),
  });

  await prisma.characterTemplateLanguage.create({
    data: {
      templateId: characterTemplate.id,
      languageId: commonLanguage.id,
      source: "ancestry",
    },
  });

  await prisma.characterTemplateEquipment.createMany({
    data: templateEquipment.map((item) => {
      const isEquipped = [
        "longsword",
        "leather-armor",
        "simple-shield",
      ].includes(item.key);

      return {
        templateId: characterTemplate.id,
        equipmentId: item.id,
        quantity: 1,
        isEquipped,
        isAttuned: false,
        source: "class",
        notes:
          item.key === "adventurer-pouch"
            ? "Bolsa de viagem do personagem-template."
            : null,
      };
    }),
  });

  console.log(
    `CharacterTemplate criado/validado: ${characterTemplate.name}`,
  );

  const allTemplateStats = await prisma.stat.findMany({
    where: { systemId: system.id },
  });
  const templateStatByKey = new Map(
    allTemplateStats.map((stat) => [stat.key, stat]),
  );

  for (const npcTemplateData of npcTemplates) {
    const npcTemplate = await prisma.npcTemplate.findUniqueOrThrow({
      where: {
        systemId_key: {
          systemId: system.id,
          key: npcTemplateData.key,
        },
      },
    });

    await prisma.$transaction([
      prisma.npcTemplateMultiattackEntry.deleteMany({
        where: { multiattack: { npcTemplateId: npcTemplate.id } },
      }),
      prisma.npcTemplateMultiattack.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateMagicalAbility.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateAttack.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateAction.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateTrait.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateLanguage.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateSense.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateDefense.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateSkill.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateStat.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
      prisma.npcTemplateClass.deleteMany({
        where: { npcTemplateId: npcTemplate.id },
      }),
    ]);

    await prisma.npcTemplateStat.createMany({
      data: Object.entries(npcTemplateData.stats).map(
        ([statKey, baseValue]) => {
          const stat = templateStatByKey.get(statKey);

          if (!stat) {
            throw new Error(
              `Stat ${statKey} não encontrado para NpcTemplate ${npcTemplateData.key}`,
            );
          }

          return {
            npcTemplateId: npcTemplate.id,
            statId: stat.id,
            baseValue,
            bonusValue: 0,
            overrideValue: null,
            isSavingThrowProficient: false,
            savingThrowBonus: 0,
            savingThrowOverride: null,
          };
        },
      ),
    });

    if (npcTemplateData.defenses.length > 0) {
      await prisma.npcTemplateDefense.createMany({
        data: npcTemplateData.defenses.map((defense) => ({
          npcTemplateId: npcTemplate.id,
          kind: defense.kind,
          damageType: defense.damageType,
          notes: defense.notes,
        })),
      });
    }

    if (npcTemplateData.senses.length > 0) {
      await prisma.npcTemplateSense.createMany({
        data: npcTemplateData.senses.map((sense) => ({
          npcTemplateId: npcTemplate.id,
          name: sense.name,
          range: sense.range,
          notes: sense.notes,
        })),
      });
    }

    if (npcTemplateData.traits.length > 0) {
      await prisma.npcTemplateTrait.createMany({
        data: npcTemplateData.traits.map((trait, order) => ({
          npcTemplateId: npcTemplate.id,
          name: trait.name,
          description: trait.description,
          order,
        })),
      });
    }

    const createdActions = [];
    for (const [order, action] of npcTemplateData.actions.entries()) {
      createdActions.push(
        await prisma.npcTemplateAction.create({
          data: {
            npcTemplateId: npcTemplate.id,
            kind: action.kind,
            name: action.name,
            description: action.description,
            uses: action.uses,
            maxUses: action.maxUses,
            recharge: action.recharge,
            order,
          },
        }),
      );
    }

    const createdAttacks = [];
    for (const [order, attack] of npcTemplateData.attacks.entries()) {
      createdAttacks.push(
        await prisma.npcTemplateAttack.create({
          data: {
            npcTemplateId: npcTemplate.id,
            name: attack.name,
            description: attack.description,
            attackType: attack.attackType,
            attackAbilityKey: attack.attackAbilityKey,
            attackBonus: attack.attackBonus,
            damageFormula: attack.damageFormula,
            damageBonus: attack.damageBonus,
            damageType: attack.damageType,
            secondaryDamageFormula: null,
            secondaryDamageType: null,
            normalRange: null,
            longRange: null,
            reach: attack.reach,
            target: attack.target,
            saveAbilityKey: null,
            saveDc: null,
            onHit: attack.onHit,
            notes: attack.notes,
            order,
          },
        }),
      );
    }

    const actionByName = new Map(
      createdActions.map((action) => [action.name, action.id]),
    );
    const attackByName = new Map(
      createdAttacks.map((attack) => [attack.name, attack.id]),
    );

    for (const [order, multiattack] of npcTemplateData.multiattacks.entries()) {
      const createdMultiattack = await prisma.npcTemplateMultiattack.create({
        data: {
          npcTemplateId: npcTemplate.id,
          name: multiattack.name,
          description: multiattack.description,
          order,
        },
      });

      for (const [entryOrder, entry] of multiattack.entries.entries()) {
        await prisma.npcTemplateMultiattackEntry.create({
          data: {
            multiattackId: createdMultiattack.id,
            attackId:
              entry.targetType === "ATTACK"
                ? attackByName.get(entry.targetName) ?? null
                : null,
            actionId:
              entry.targetType === "ACTION"
                ? actionByName.get(entry.targetName) ?? null
                : null,
            quantity: entry.quantity,
            order: entryOrder,
            notes: entry.notes,
          },
        });
      }
    }

    console.log(`NpcTemplate completo validado: ${npcTemplate.name}`);
  }

  for (const creatureTemplateData of creatureTemplates) {
    const creatureTemplate = await prisma.creatureTemplate.findUniqueOrThrow({
      where: {
        systemId_key: {
          systemId: system.id,
          key: creatureTemplateData.key,
        },
      },
    });

    await prisma.$transaction([
      prisma.creatureTemplateMultiattackEntry.deleteMany({
        where: { multiattack: { creatureTemplateId: creatureTemplate.id } },
      }),
      prisma.creatureTemplateMultiattack.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
      prisma.creatureTemplateMagicalAbility.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
      prisma.creatureTemplateAttack.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
      prisma.creatureTemplateAction.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
      prisma.creatureTemplateTrait.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
      prisma.creatureTemplateLanguage.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
      prisma.creatureTemplateSense.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
      prisma.creatureTemplateDefense.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
      prisma.creatureTemplateSkill.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
      prisma.creatureTemplateStat.deleteMany({
        where: { creatureTemplateId: creatureTemplate.id },
      }),
    ]);

    await prisma.creatureTemplateStat.createMany({
      data: Object.entries(creatureTemplateData.stats).map(
        ([statKey, baseValue]) => {
          const stat = templateStatByKey.get(statKey);

          if (!stat) {
            throw new Error(
              `Stat ${statKey} não encontrado para CreatureTemplate ${creatureTemplateData.key}`,
            );
          }

          return {
            creatureTemplateId: creatureTemplate.id,
            statId: stat.id,
            baseValue,
            bonusValue: 0,
            overrideValue: null,
            isSavingThrowProficient: false,
            savingThrowBonus: 0,
            savingThrowOverride: null,
          };
        },
      ),
    });

    if (creatureTemplateData.defenses.length > 0) {
      await prisma.creatureTemplateDefense.createMany({
        data: creatureTemplateData.defenses.map((defense) => ({
          creatureTemplateId: creatureTemplate.id,
          kind: defense.kind,
          damageType: defense.damageType,
          notes: defense.notes,
        })),
      });
    }

    if (creatureTemplateData.senses.length > 0) {
      await prisma.creatureTemplateSense.createMany({
        data: creatureTemplateData.senses.map((sense) => ({
          creatureTemplateId: creatureTemplate.id,
          name: sense.name,
          range: sense.range,
          notes: sense.notes,
        })),
      });
    }

    if (creatureTemplateData.traits.length > 0) {
      await prisma.creatureTemplateTrait.createMany({
        data: creatureTemplateData.traits.map((trait, order) => ({
          creatureTemplateId: creatureTemplate.id,
          name: trait.name,
          description: trait.description,
          order,
        })),
      });
    }

    const createdActions = [];
    for (const [order, action] of creatureTemplateData.actions.entries()) {
      createdActions.push(
        await prisma.creatureTemplateAction.create({
          data: {
            creatureTemplateId: creatureTemplate.id,
            kind: action.kind,
            name: action.name,
            description: action.description,
            uses: action.uses,
            maxUses: action.maxUses,
            recharge: action.recharge,
            order,
          },
        }),
      );
    }

    const createdAttacks = [];
    for (const [order, attack] of creatureTemplateData.attacks.entries()) {
      createdAttacks.push(
        await prisma.creatureTemplateAttack.create({
          data: {
            creatureTemplateId: creatureTemplate.id,
            name: attack.name,
            description: attack.description,
            attackType: attack.attackType,
            attackAbilityKey: attack.attackAbilityKey,
            attackBonus: attack.attackBonus,
            damageFormula: attack.damageFormula,
            damageBonus: attack.damageBonus,
            damageType: attack.damageType,
            secondaryDamageFormula: null,
            secondaryDamageType: null,
            normalRange: null,
            longRange: null,
            reach: attack.reach,
            target: attack.target,
            saveAbilityKey: null,
            saveDc: null,
            onHit: attack.onHit,
            notes: attack.notes,
            order,
          },
        }),
      );
    }

    const actionByName = new Map(
      createdActions.map((action) => [action.name, action.id]),
    );
    const attackByName = new Map(
      createdAttacks.map((attack) => [attack.name, attack.id]),
    );

    for (const [order, multiattack] of creatureTemplateData.multiattacks.entries()) {
      const createdMultiattack =
        await prisma.creatureTemplateMultiattack.create({
          data: {
            creatureTemplateId: creatureTemplate.id,
            name: multiattack.name,
            description: multiattack.description,
            order,
          },
        });

      for (const [entryOrder, entry] of multiattack.entries.entries()) {
        await prisma.creatureTemplateMultiattackEntry.create({
          data: {
            multiattackId: createdMultiattack.id,
            attackId:
              entry.targetType === "ATTACK"
                ? attackByName.get(entry.targetName) ?? null
                : null,
            actionId:
              entry.targetType === "ACTION"
                ? actionByName.get(entry.targetName) ?? null
                : null,
            quantity: entry.quantity,
            order: entryOrder,
            notes: entry.notes,
          },
        });
      }
    }

    console.log(
      `CreatureTemplate completo validado: ${creatureTemplate.name}`,
    );
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
