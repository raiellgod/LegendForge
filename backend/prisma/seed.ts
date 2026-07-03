import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";
import { ancestries } from "./seed-data/ancestries.js";
import { backgrounds } from "./seed-data/backgrounds.js";
import { classSpellAccess } from "./seed-data/class-spells.js";
import { classes } from "./seed-data/classes.js";
import { equipment } from "./seed-data/equipment.js";
import { features } from "./seed-data/features.js";
import { skills } from "./seed-data/skills.js";
import { spells } from "./seed-data/spells.js";
import { stats } from "./seed-data/stats.js";
import { subclasses } from "./seed-data/subclasses.js";

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
        attributeBonuses: ancestryData.attributeBonuses,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: ancestryData.name,
        key: ancestryData.key,
        description: ancestryData.description,
        defaultSizeCategory: ancestryData.defaultSizeCategory,
        attributeBonuses: ancestryData.attributeBonuses,
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
        startingGold: backgroundData.startingGold,
        attributeBonuses: backgroundData.attributeBonuses,
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
