import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import type { Prisma } from "../generated/prisma/client.js";
import { getAuthenticatedSession } from "../lib/get-authenticated-session.js";
import { prisma } from "../lib/prisma.js";

export async function characterSheetsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  const characterAttributesSchema = z
    .object({
      strength: z.number().int().min(3).max(20).optional(),
      dexterity: z.number().int().min(3).max(20).optional(),
      constitution: z.number().int().min(3).max(20).optional(),
      intelligence: z.number().int().min(3).max(20).optional(),
      wisdom: z.number().int().min(3).max(20).optional(),
      charisma: z.number().int().min(3).max(20).optional(),
    })
    .optional();

  const characterSkillKeysSchema = z.array(z.string()).optional();
  const characterSpellKeysSchema = z.array(z.string()).optional();
  const characterLanguageKeysSchema = z.array(z.string()).optional();

  const characterFeatureChoiceSelectionsSchema = z
    .array(
      z.object({
        choiceGroupId: z.string().uuid("Invalid feature choice group id"),
        featureId: z.string().uuid("Invalid feature id"),
      }),
    )
    .max(100)
    .optional();

  const characterClassEntriesSchema = z
    .array(
      z.object({
        classId: z.string().uuid("Invalid class id"),
        subclassId: z
          .string()
          .uuid("Invalid subclass id")
          .nullable()
          .optional(),
        level: z.number().int().min(1).max(20),
        isPrimary: z.boolean().optional(),
        order: z.number().int().min(0).max(20).optional(),
      }),
    )
    .max(20)
    .optional();

  type CharacterClassEntryInput = NonNullable<
    z.infer<typeof characterClassEntriesSchema>
  >[number];

  type CharacterProficiencySource =
    | "builder"
    | "class"
    | "background"
    | "ancestry"
    | "feature"
    | "manual";

  type CharacterSpellEntry = {
    spellId: string;
    classId: string | null;
    source: CharacterProficiencySource;
  };

  type CharacterFeatureChoiceEntry = {
    choiceGroupId: string;
    featureId: string;
    source: "builder";
  };

  const characterProficiencySourcePriority: Record<
    CharacterProficiencySource,
    number
  > = {
    background: 60,
    class: 50,
    ancestry: 40,
    feature: 30,
    builder: 20,
    manual: 10,
  };

  const characterEquipmentItemsSchema = z
    .array(
      z.object({
        key: z.string().min(1),
        quantity: z.number().int().min(1).max(99).default(1),
        source: z.string().max(80).optional(),
        notes: z.string().max(200).optional(),
        isEquipped: z.boolean().optional(),
      }),
    )
    .optional();

  type CharacterSheetRouteParams = {
    campaignId: string;
    sheetId: string;
  };

  type CharacterSheetUpdateBody = {
    classId?: string | null;
    ancestryId?: string | null;
    backgroundId?: string | null;
    subclassId?: string | null;
    classEntries?: z.infer<typeof characterClassEntriesSchema>;

    name?: string;
    pronouns?: string | null;
    concept?: string | null;
    portraitUrl?: string | null;
    tokenImageUrl?: string | null;
    tokenImageFit?: "COVER" | "CONTAIN" | "FILL";

    attributes?: z.infer<typeof characterAttributesSchema>;
    skillKeys?: z.infer<typeof characterSkillKeysSchema>;
    spellKeys?: z.infer<typeof characterSpellKeysSchema>;
    languageKeys?: z.infer<typeof characterLanguageKeysSchema>;
    featureChoiceSelections?: z.infer<
      typeof characterFeatureChoiceSelectionsSchema
    >;
    equipmentItems?: z.infer<typeof characterEquipmentItemsSchema>;

    classEquipmentMode?: "PACKAGE" | "GOLD";
    backgroundEquipmentMode?: "PACKAGE" | "GOLD";
    startingGold?: number;

    level?: number;
    experience?: number;
    hitPoints?: number;
    maxHitPoints?: number;
    temporaryHp?: number;
    armorClass?: number;
    speed?: number;
    inspiration?: boolean;

    alignment?: string | null;
    faith?: string | null;
    lifestyle?: string | null;

    hair?: string | null;
    skin?: string | null;
    eyes?: string | null;
    height?: string | null;
    weight?: string | null;
    age?: string | null;
    gender?: string | null;

    bonds?: string | null;
    flaws?: string | null;
    ideals?: string | null;
    personality?: string | null;
    backstory?: string | null;
    organizations?: string | null;
    allies?: string | null;
    enemies?: string | null;
    notes?: string | null;
    otherNotes?: string | null;
    gmNotes?: string | null;

    status?: "DRAFT" | "READY" | "ARCHIVED";
  };

  type CharacterAttributeKey =
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma";

  const characterAttributeKeys = new Set<CharacterAttributeKey>([
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ]);

  type CharacterAttributeBonusMap = Partial<
    Record<CharacterAttributeKey, number>
  >;

  function isCharacterAttributeKey(key: string): key is CharacterAttributeKey {
    return characterAttributeKeys.has(key as CharacterAttributeKey);
  }

  function normalizeAttributeBonusMap(
    attributeBonuses: unknown,
  ): CharacterAttributeBonusMap {
    if (!attributeBonuses || typeof attributeBonuses !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(attributeBonuses).filter(([key, value]) => {
        return (
          isCharacterAttributeKey(key) &&
          typeof value === "number" &&
          Number.isFinite(value)
        );
      }),
    ) as CharacterAttributeBonusMap;
  }

  function mergeAttributeBonusMaps(
    ...bonusMaps: CharacterAttributeBonusMap[]
  ): CharacterAttributeBonusMap {
    return bonusMaps.reduce<CharacterAttributeBonusMap>(
      (mergedMap, bonusMap) => {
        for (const [key, value] of Object.entries(bonusMap)) {
          if (!isCharacterAttributeKey(key)) {
            continue;
          }

          mergedMap[key] = (mergedMap[key] ?? 0) + value;
        }

        return mergedMap;
      },
      {},
    );
  }

  async function getCharacterAttributeEntries(
    systemId: string,
    attributes: z.infer<typeof characterAttributesSchema>,
    attributeBonuses: CharacterAttributeBonusMap,
  ) {
    if (!attributes) {
      return {
        entries: [] as Array<{
          baseValue: number;
          bonusValue: number;
          statId: string;
        }>,
        error: null as string | null,
      };
    }

    const attributeEntries = Object.entries(attributes).filter(
      ([, value]) => value !== undefined,
    ) as Array<[CharacterAttributeKey, number]>;

    if (attributeEntries.length === 0) {
      return {
        entries: [] as Array<{
          baseValue: number;
          bonusValue: number;
          statId: string;
        }>,
        error: null as string | null,
      };
    }

    const stats = await prisma.stat.findMany({
      where: {
        systemId,
        key: {
          in: attributeEntries.map(([key]) => key),
        },
      },
      select: {
        id: true,
        key: true,
      },
    });

    const statsByKey = new Map(stats.map((stat) => [stat.key, stat]));

    const missingAttribute = attributeEntries.find(
      ([key]) => !statsByKey.has(key),
    );

    if (missingAttribute) {
      return {
        entries: [],
        error: `Attribute ${missingAttribute[0]} not found for this system`,
      };
    }

    return {
      entries: attributeEntries.map(([key, value]) => ({
        baseValue: value,
        bonusValue: attributeBonuses[key] ?? 0,
        statId: statsByKey.get(key)!.id,
      })),
      error: null,
    };
  }

  async function upsertCharacterSheetStats(
    characterSheetId: string,
    entries: Array<{
      baseValue: number;
      bonusValue: number;
      statId: string;
    }>,
  ) {
    if (entries.length === 0) {
      return;
    }

    await prisma.$transaction(
      entries.map((entry) =>
        prisma.characterSheetStat.upsert({
          where: {
            characterSheetId_statId: {
              characterSheetId,
              statId: entry.statId,
            },
          },
          create: {
            characterSheetId,
            statId: entry.statId,
            baseValue: entry.baseValue,
            bonusValue: entry.bonusValue,
          },
          update: {
            baseValue: entry.baseValue,
            bonusValue: entry.bonusValue,
          },
        }),
      ),
    );
  }

  async function getCharacterSkillEntries({
    systemId,
    skillKeys,
    source = "builder",
  }: {
    systemId: string;
    skillKeys: z.infer<typeof characterSkillKeysSchema>;
    source?: CharacterProficiencySource;
  }) {
    if (!skillKeys) {
      return {
        entries: [] as Array<{
          skillId: string;
          source: CharacterProficiencySource;
        }>,
        error: null as string | null,
      };
    }

    const uniqueSkillKeys = Array.from(new Set(skillKeys));

    if (uniqueSkillKeys.length === 0) {
      return {
        entries: [] as Array<{
          skillId: string;
          source: CharacterProficiencySource;
        }>,
        error: null as string | null,
      };
    }

    const skills = await prisma.skill.findMany({
      where: {
        systemId,
        key: {
          in: uniqueSkillKeys,
        },
      },
      select: {
        id: true,
        key: true,
      },
    });

    const skillsByKey = new Map(skills.map((skill) => [skill.key, skill]));

    const missingSkillKey = uniqueSkillKeys.find(
      (skillKey) => !skillsByKey.has(skillKey),
    );

    if (missingSkillKey) {
      return {
        entries: [],
        error: `Skill ${missingSkillKey} not found for this system`,
      };
    }

    return {
      entries: uniqueSkillKeys.map((key) => ({
        skillId: skillsByKey.get(key)!.id,
        source,
      })),
      error: null,
    };
  }

  function mergeCharacterSkillEntries(
    ...entryGroups: Array<
      Array<{
        skillId: string;
        source: CharacterProficiencySource;
      }>
    >
  ) {
    const entriesBySkillId = new Map<
      string,
      {
        skillId: string;
        source: CharacterProficiencySource;
      }
    >();

    for (const entries of entryGroups) {
      for (const entry of entries) {
        const currentEntry = entriesBySkillId.get(entry.skillId);

        if (!currentEntry) {
          entriesBySkillId.set(entry.skillId, entry);
          continue;
        }

        const currentPriority =
          characterProficiencySourcePriority[currentEntry.source];

        const nextPriority = characterProficiencySourcePriority[entry.source];

        if (nextPriority > currentPriority) {
          entriesBySkillId.set(entry.skillId, entry);
        }
      }
    }

    return Array.from(entriesBySkillId.values());
  }

  function getClassSkillChoiceCount(
    characterClass:
      | {
          classSkillChoiceCount: number;
        }
      | null
      | undefined,
  ) {
    return Math.max(0, characterClass?.classSkillChoiceCount ?? 0);
  }

  function getUniqueSkillKeyCount(
    skillKeys: z.infer<typeof characterSkillKeysSchema>,
  ) {
    if (!skillKeys) {
      return 0;
    }

    return new Set(skillKeys).size;
  }

  function validateDraftSkillChoiceLimit({
    skillKeys,
    characterClass,
  }: {
    skillKeys: z.infer<typeof characterSkillKeysSchema>;
    characterClass:
      | {
          classSkillChoiceCount: number;
        }
      | null
      | undefined;
  }) {
    if (skillKeys === undefined) {
      return null;
    }

    const requiredSkillChoiceCount = getClassSkillChoiceCount(characterClass);
    const selectedSkillCount = getUniqueSkillKeyCount(skillKeys);

    if (selectedSkillCount > requiredSkillChoiceCount) {
      return `This class allows ${requiredSkillChoiceCount} skill choices, but ${selectedSkillCount} were provided.`;
    }

    return null;
  }

  async function replaceCharacterSheetSkills(
    characterSheetId: string,
    entries: Array<{
      skillId: string;
      source: CharacterProficiencySource;
    }>,
  ) {
    await prisma.$transaction([
      prisma.characterSheetSkill.deleteMany({
        where: {
          characterSheetId,
        },
      }),

      ...entries.map((entry) =>
        prisma.characterSheetSkill.create({
          data: {
            characterSheetId,
            skillId: entry.skillId,
            isProficient: true,
            source: entry.source,
          },
        }),
      ),
    ]);
  }

  function normalizeCharacterLevel(level: number | null | undefined) {
    if (typeof level !== "number" || !Number.isFinite(level)) {
      return 1;
    }

    return Math.max(1, Math.min(20, Math.trunc(level)));
  }

  function normalizeCharacterSheetClassEntries({
    classEntries,
    fallbackClassId,
    fallbackSubclassId,
    fallbackLevel,
  }: {
    classEntries: z.infer<typeof characterClassEntriesSchema>;
    fallbackClassId: string | null | undefined;
    fallbackSubclassId: string | null | undefined;
    fallbackLevel: number | null | undefined;
  }) {
    if (!classEntries || classEntries.length === 0) {
      const safeLevel = normalizeCharacterLevel(fallbackLevel);

      return {
        entries: [] as CharacterClassEntryInput[],
        primaryClassId: fallbackClassId ?? null,
        primarySubclassId: fallbackSubclassId ?? null,
        totalLevel: safeLevel,
        error: null as string | null,
      };
    }

    const classIds = classEntries.map((classEntry) => classEntry.classId);
    const uniqueClassIds = new Set(classIds);

    if (uniqueClassIds.size !== classIds.length) {
      return {
        entries: [] as CharacterClassEntryInput[],
        primaryClassId: null,
        primarySubclassId: null,
        totalLevel: 1,
        error: "Duplicate classes are not allowed",
      };
    }

    const totalLevel = classEntries.reduce(
      (currentTotal, classEntry) => currentTotal + classEntry.level,
      0,
    );

    if (totalLevel < 1 || totalLevel > 20) {
      return {
        entries: [] as CharacterClassEntryInput[],
        primaryClassId: null,
        primarySubclassId: null,
        totalLevel: 1,
        error: "Total character level must be between 1 and 20",
      };
    }

    const explicitPrimaryEntries = classEntries.filter(
      (classEntry) => classEntry.isPrimary,
    );

    if (explicitPrimaryEntries.length > 1) {
      return {
        entries: [] as CharacterClassEntryInput[],
        primaryClassId: null,
        primarySubclassId: null,
        totalLevel: 1,
        error: "Only one class can be marked as primary",
      };
    }

    const orderedEntries = [...classEntries].sort(
      (firstEntry, secondEntry) =>
        (firstEntry.order ?? 0) - (secondEntry.order ?? 0),
    );

    const primaryEntry = explicitPrimaryEntries[0] ?? orderedEntries[0];

    if (!primaryEntry) {
      return {
        entries: [] as CharacterClassEntryInput[],
        primaryClassId: null,
        primarySubclassId: null,
        totalLevel: 1,
        error: "At least one class entry is required",
      };
    }

    return {
      entries: orderedEntries.map((classEntry, index) => ({
        ...classEntry,
        order: index,
        isPrimary: classEntry.classId === primaryEntry.classId,
        subclassId: classEntry.subclassId ?? null,
      })),
      primaryClassId: primaryEntry.classId,
      primarySubclassId: primaryEntry.subclassId ?? null,
      totalLevel,
      error: null,
    };
  }

  async function validateCharacterSheetClassEntries({
    systemId,
    classEntries,
  }: {
    systemId: string;
    classEntries: CharacterClassEntryInput[];
  }) {
    if (classEntries.length === 0) {
      return null;
    }

    const classes = await prisma.characterClass.findMany({
      where: {
        systemId,
        id: {
          in: classEntries.map((classEntry) => classEntry.classId),
        },
      },
      select: {
        id: true,
      },
    });

    const classIds = new Set(
      classes.map((characterClass) => characterClass.id),
    );

    const missingClassEntry = classEntries.find(
      (classEntry) => !classIds.has(classEntry.classId),
    );

    if (missingClassEntry) {
      return "Character class not found for this system";
    }

    const entriesWithSubclass = classEntries.filter(
      (classEntry) => classEntry.subclassId,
    );

    if (entriesWithSubclass.length === 0) {
      return null;
    }

    const subclasses = await prisma.characterSubclass.findMany({
      where: {
        systemId,
        id: {
          in: entriesWithSubclass
            .map((classEntry) => classEntry.subclassId)
            .filter((subclassId): subclassId is string => Boolean(subclassId)),
        },
      },
      select: {
        id: true,
        classId: true,
      },
    });

    const subclassesById = new Map(
      subclasses.map((subclass) => [subclass.id, subclass]),
    );

    const invalidSubclassEntry = entriesWithSubclass.find((classEntry) => {
      if (!classEntry.subclassId) {
        return false;
      }

      const subclass = subclassesById.get(classEntry.subclassId);

      return !subclass || subclass.classId !== classEntry.classId;
    });

    if (invalidSubclassEntry) {
      return "Subclass not found for this class and system";
    }

    return null;
  }

  function getAttributeModifier(value: number | null | undefined) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return 0;
    }

    return Math.floor((value - 10) / 2);
  }

  function calculateInitialMaxHitPoints({
    hitDie,
    level,
    constitutionValue,
  }: {
    hitDie: number | null | undefined;
    level: number | null | undefined;
    constitutionValue: number | null | undefined;
  }) {
    if (typeof hitDie !== "number" || hitDie <= 0) {
      return 0;
    }

    const safeLevel = normalizeCharacterLevel(level);
    const constitutionModifier = getAttributeModifier(constitutionValue);

    const hitPointsPerLevel = Math.max(1, hitDie + constitutionModifier);

    return hitPointsPerLevel * safeLevel;
  }

  function calculateInitialMaxHitPointsForClassEntries({
    classEntries,
    classHitDiceById,
    fallbackHitDie,
    fallbackLevel,
    constitutionValue,
  }: {
    classEntries: CharacterClassEntryInput[];
    classHitDiceById: Map<string, number | null>;
    fallbackHitDie: number | null | undefined;
    fallbackLevel: number | null | undefined;
    constitutionValue: number | null | undefined;
  }) {
    const constitutionModifier = getAttributeModifier(constitutionValue);

    if (classEntries.length === 0) {
      return calculateInitialMaxHitPoints({
        hitDie: fallbackHitDie,
        level: fallbackLevel,
        constitutionValue,
      });
    }

    return classEntries.reduce((totalHitPoints, classEntry) => {
      const hitDie = classHitDiceById.get(classEntry.classId);

      if (typeof hitDie !== "number" || hitDie <= 0) {
        return totalHitPoints;
      }

      const hitPointsPerLevel = Math.max(1, hitDie + constitutionModifier);

      return totalHitPoints + hitPointsPerLevel * classEntry.level;
    }, 0);
  }

  function getKnownSpellLimitForSpellLevel({
    progression,
    spellLevel,
  }: {
    progression:
      | {
          spellLimits: Array<{
            spellLevel: number;
            spellsKnown: number;
          }>;
        }
      | null
      | undefined;
    spellLevel: number;
  }) {
    const spellLimit = progression?.spellLimits.find(
      (currentSpellLimit) => currentSpellLimit.spellLevel === spellLevel,
    );

    return spellLimit?.spellsKnown ?? 0;
  }

  async function getCharacterSpellEntries({
    systemId,
    spellKeys,
    classEntries,
  }: {
    systemId: string;
    spellKeys: z.infer<typeof characterSpellKeysSchema>;
    classEntries: CharacterClassEntryInput[];
  }) {
    if (!spellKeys) {
      return {
        entries: [] as CharacterSpellEntry[],
        error: null as string | null,
      };
    }

    const uniqueSpellKeys = Array.from(new Set(spellKeys));

    if (uniqueSpellKeys.length === 0) {
      return {
        entries: [] as CharacterSpellEntry[],
        error: null as string | null,
      };
    }

    if (classEntries.length === 0) {
      return {
        entries: [],
        error: "Choose at least one class before choosing spells",
      };
    }

    const characterClasses = await prisma.characterClass.findMany({
      where: {
        systemId,
        id: {
          in: classEntries.map((classEntry) => classEntry.classId),
        },
      },
      include: {
        levelProgressions: {
          include: {
            spellLimits: true,
          },
        },
        classSpells: true,
      },
    });

    const classesById = new Map(
      characterClasses.map((characterClass) => [
        characterClass.id,
        characterClass,
      ]),
    );

    const missingClassEntry = classEntries.find(
      (classEntry) => !classesById.has(classEntry.classId),
    );

    if (missingClassEntry) {
      return {
        entries: [],
        error: "Character class not found for this system",
      };
    }

    const spells = await prisma.spell.findMany({
      where: {
        systemId,
        key: {
          in: uniqueSpellKeys,
        },
      },
      select: {
        id: true,
        key: true,
        name: true,
        level: true,
      },
    });

    const spellsByKey = new Map(spells.map((spell) => [spell.key, spell]));

    const missingSpellKey = uniqueSpellKeys.find(
      (spellKey) => !spellsByKey.has(spellKey),
    );

    if (missingSpellKey) {
      return {
        entries: [],
        error: `Spell ${missingSpellKey} not found for this system`,
      };
    }

    const entries: CharacterSpellEntry[] = [];

    for (const spellKey of uniqueSpellKeys) {
      const spell = spellsByKey.get(spellKey)!;

      const compatibleClassEntry = classEntries.find((classEntry) => {
        const characterClass = classesById.get(classEntry.classId);

        if (!characterClass) {
          return false;
        }

        const safeClassLevel = normalizeCharacterLevel(classEntry.level);

        const progression =
          characterClass.levelProgressions.find(
            (currentProgression) => currentProgression.level === safeClassLevel,
          ) ?? null;

        if (!progression) {
          return false;
        }

        const classSpell = characterClass.classSpells.find(
          (currentClassSpell) => currentClassSpell.spellId === spell.id,
        );

        if (!classSpell) {
          return false;
        }

        if ((classSpell.minimumClassLevel ?? 1) > safeClassLevel) {
          return false;
        }

        return (
          getKnownSpellLimitForSpellLevel({
            progression,
            spellLevel: spell.level,
          }) > 0
        );
      });

      if (!compatibleClassEntry) {
        return {
          entries: [],
          error: `Spell ${spell.name} is not available for the selected classes at their current levels`,
        };
      }

      entries.push({
        spellId: spell.id,
        classId: compatibleClassEntry.classId,
        source: "class",
      });
    }

    return {
      entries,
      error: null,
    };
  }

  async function replaceCharacterSheetSpells(
    characterSheetId: string,
    entries: CharacterSpellEntry[],
  ) {
    await prisma.$transaction([
      prisma.characterSheetSpell.deleteMany({
        where: {
          characterSheetId,
        },
      }),

      ...entries.map((entry) =>
        prisma.characterSheetSpell.create({
          data: {
            characterSheetId,
            spellId: entry.spellId,
            classId: entry.classId,
            source: entry.source,
          },
        }),
      ),
    ]);
  }

  async function getCharacterLanguageEntries({
    systemId,
    languageKeys,
    source = "builder",
  }: {
    systemId: string;
    languageKeys: z.infer<typeof characterLanguageKeysSchema>;
    source?: CharacterProficiencySource;
  }) {
    if (!languageKeys) {
      return {
        entries: [] as Array<{
          languageId: string;
          source: CharacterProficiencySource;
        }>,
        error: null as string | null,
      };
    }

    const uniqueLanguageKeys = Array.from(new Set(languageKeys));

    if (uniqueLanguageKeys.length === 0) {
      return {
        entries: [] as Array<{
          languageId: string;
          source: CharacterProficiencySource;
        }>,
        error: null as string | null,
      };
    }

    const languages = await prisma.language.findMany({
      where: {
        systemId,
        key: {
          in: uniqueLanguageKeys,
        },
      },
      select: {
        id: true,
        key: true,
      },
    });

    const languagesByKey = new Map(
      languages.map((language) => [language.key, language]),
    );

    const missingLanguageKey = uniqueLanguageKeys.find(
      (languageKey) => !languagesByKey.has(languageKey),
    );

    if (missingLanguageKey) {
      return {
        entries: [],
        error: `Language ${missingLanguageKey} not found for this system`,
      };
    }

    return {
      entries: uniqueLanguageKeys.map((key) => ({
        languageId: languagesByKey.get(key)!.id,
        source,
      })),
      error: null,
    };
  }

  async function replaceCharacterSheetLanguages(
    characterSheetId: string,
    entries: Array<{
      languageId: string;
      source: CharacterProficiencySource;
    }>,
  ) {
    await prisma.$transaction([
      prisma.characterSheetLanguage.deleteMany({
        where: {
          characterSheetId,
        },
      }),

      ...entries.map((entry) =>
        prisma.characterSheetLanguage.create({
          data: {
            characterSheetId,
            languageId: entry.languageId,
            source: entry.source,
          },
        }),
      ),
    ]);
  }

  async function getCharacterEquipmentEntries(
    systemId: string,
    equipmentItems: z.infer<typeof characterEquipmentItemsSchema>,
  ) {
    if (!equipmentItems) {
      return {
        entries: [] as Array<{
          equipmentId: string;
          quantity: number;
          source: string | null;
          notes: string | null;
          isEquipped: boolean;
        }>,
        error: null as string | null,
      };
    }

    const normalizedItems = equipmentItems.map((item) => ({
      key: item.key,
      quantity: item.quantity,
      source: item.source?.trim() || "builder",
      notes: item.notes?.trim() || null,
      isEquipped: item.isEquipped ?? false,
    }));

    if (normalizedItems.length === 0) {
      return {
        entries: [] as Array<{
          equipmentId: string;
          quantity: number;
          source: string | null;
          notes: string | null;
          isEquipped: boolean;
        }>,
        error: null as string | null,
      };
    }

    const uniqueEquipmentKeys = Array.from(
      new Set(normalizedItems.map((item) => item.key)),
    );

    const equipment = await prisma.equipment.findMany({
      where: {
        systemId,
        key: {
          in: uniqueEquipmentKeys,
        },
      },
      select: {
        id: true,
        key: true,
      },
    });

    const equipmentByKey = new Map(equipment.map((item) => [item.key, item]));

    const missingEquipmentKey = uniqueEquipmentKeys.find(
      (equipmentKey) => !equipmentByKey.has(equipmentKey),
    );

    if (missingEquipmentKey) {
      return {
        entries: [],
        error: `Equipment ${missingEquipmentKey} not found for this system`,
      };
    }

    const groupedItems = new Map<
      string,
      {
        equipmentId: string;
        quantity: number;
        source: string | null;
        notes: string | null;
        isEquipped: boolean;
      }
    >();

    for (const item of normalizedItems) {
      const equipmentId = equipmentByKey.get(item.key)!.id;
      const currentItem = groupedItems.get(equipmentId);

      if (currentItem) {
        currentItem.quantity += item.quantity;
        currentItem.isEquipped = currentItem.isEquipped || item.isEquipped;
        continue;
      }

      groupedItems.set(equipmentId, {
        equipmentId,
        quantity: item.quantity,
        source: item.source,
        notes: item.notes,
        isEquipped: item.isEquipped,
      });
    }

    return {
      entries: Array.from(groupedItems.values()),
      error: null,
    };
  }

  async function replaceCharacterSheetEquipment(
    characterSheetId: string,
    entries: Array<{
      equipmentId: string;
      quantity: number;
      source: string | null;
      notes: string | null;
      isEquipped: boolean;
    }>,
  ) {
    await prisma.$transaction([
      prisma.characterSheetEquipment.deleteMany({
        where: {
          characterSheetId,
        },
      }),

      ...entries.map((entry) =>
        prisma.characterSheetEquipment.create({
          data: {
            characterSheetId,
            equipmentId: entry.equipmentId,
            quantity: entry.quantity,
            source: entry.source,
            notes: entry.notes,
            isEquipped: entry.isEquipped,
          },
        }),
      ),
    ]);
  }

  async function syncCharacterSheetClasses({
    characterSheetId,
    classEntries,
    fallbackClassId,
    fallbackSubclassId,
    fallbackLevel,
  }: {
    characterSheetId: string;
    classEntries: CharacterClassEntryInput[];
    fallbackClassId: string | null;
    fallbackSubclassId: string | null;
    fallbackLevel: number;
  }) {
    const entriesToSync =
      classEntries.length > 0
        ? classEntries
        : fallbackClassId
          ? [
              {
                classId: fallbackClassId,
                subclassId: fallbackSubclassId,
                level: fallbackLevel,
                isPrimary: true,
                order: 0,
              },
            ]
          : [];

    if (entriesToSync.length === 0) {
      await prisma.characterSheetClass.deleteMany({
        where: {
          characterSheetId,
        },
      });

      return;
    }

    const primaryEntry =
      entriesToSync.find((classEntry) => classEntry.isPrimary) ??
      entriesToSync[0];

    const normalizedEntries = entriesToSync.map((classEntry, index) => ({
      ...classEntry,
      subclassId: classEntry.subclassId ?? null,
      isPrimary: classEntry.classId === primaryEntry.classId,
      order: index,
    }));

    await prisma.$transaction([
      prisma.characterSheetClass.deleteMany({
        where: {
          characterSheetId,
          classId: {
            notIn: normalizedEntries.map((classEntry) => classEntry.classId),
          },
        },
      }),

      ...normalizedEntries.map((classEntry) =>
        prisma.characterSheetClass.upsert({
          where: {
            characterSheetId_classId: {
              characterSheetId,
              classId: classEntry.classId,
            },
          },
          create: {
            characterSheetId,
            classId: classEntry.classId,
            subclassId: classEntry.subclassId,
            level: classEntry.level,
            isPrimary: classEntry.isPrimary,
            order: classEntry.order,
          },
          update: {
            subclassId: classEntry.subclassId,
            level: classEntry.level,
            isPrimary: classEntry.isPrimary,
            order: classEntry.order,
          },
        }),
      ),
    ]);
  }

  type CharacterSheetClassFeatureSource = {
    classId: string;
    subclassId: string | null;
    level: number;
  };

  type CharacterSheetFeatureSource = {
    systemId: string;
    ancestryId: string | null;
    classId: string | null;
    subclassId: string | null;
    level: number;
    classes?: CharacterSheetClassFeatureSource[];
  };

  function getCharacterSheetClassFeatureSources(
    characterSheet: CharacterSheetFeatureSource,
  ) {
    if (characterSheet.classes && characterSheet.classes.length > 0) {
      return characterSheet.classes.map((classEntry) => ({
        classId: classEntry.classId,
        subclassId: classEntry.subclassId,
        level: classEntry.level,
      }));
    }

    if (!characterSheet.classId) {
      return [];
    }

    return [
      {
        classId: characterSheet.classId,
        subclassId: characterSheet.subclassId,
        level: characterSheet.level,
      },
    ];
  }

  async function getAvailableFeaturesForCharacterSheet(
    characterSheet: CharacterSheetFeatureSource,
  ) {
    const featureConditions = [];

    if (characterSheet.ancestryId) {
      featureConditions.push({
        ancestryId: characterSheet.ancestryId,
      });
    }

    const classFeatureSources =
      getCharacterSheetClassFeatureSources(characterSheet);

    for (const classFeatureSource of classFeatureSources) {
      featureConditions.push({
        classId: classFeatureSource.classId,
        subclassId: null,
        level: {
          lte: classFeatureSource.level,
        },
      });

      if (classFeatureSource.subclassId) {
        featureConditions.push({
          subclassId: classFeatureSource.subclassId,
          level: {
            lte: classFeatureSource.level,
          },
        });
      }
    }

    if (featureConditions.length === 0) {
      return [];
    }

    return prisma.feature.findMany({
      where: {
        systemId: characterSheet.systemId,
        OR: featureConditions,
      },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        sourceType: true,
        level: true,
        order: true,
        ancestryId: true,
        classId: true,
        subclassId: true,
        levelProgressionId: true,
      },
      orderBy: [
        {
          sourceType: "asc",
        },
        {
          level: "asc",
        },
        {
          order: "asc",
        },
        {
          name: "asc",
        },
      ],
    });
  }

  async function getFeaturesUnlockedAtLevel(
    characterSheet: CharacterSheetFeatureSource,
    targetLevel: number,
  ) {
    const featureConditions = [];

    if (characterSheet.classId) {
      featureConditions.push({
        classId: characterSheet.classId,
        subclassId: null,
        level: targetLevel,
      });
    }

    if (characterSheet.subclassId) {
      featureConditions.push({
        subclassId: characterSheet.subclassId,
        level: targetLevel,
      });
    }

    if (featureConditions.length === 0) {
      return [];
    }

    return prisma.feature.findMany({
      where: {
        systemId: characterSheet.systemId,
        OR: featureConditions,
      },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        sourceType: true,
        level: true,
        order: true,
        ancestryId: true,
        classId: true,
        subclassId: true,
        levelProgressionId: true,
      },
      orderBy: [
        {
          sourceType: "asc",
        },
        {
          order: "asc",
        },
        {
          name: "asc",
        },
      ],
    });
  }

  async function getLevelUpPreviewForCharacterSheet(
    characterSheet: CharacterSheetFeatureSource & {
      characterClass: {
        levelProgressions: Array<{
          level: number;
          proficiencyBonus: number | null;
          cantripsKnown: number;
          spellsKnown: number;
          spellsPrepared: number;
          spellSlotsLevel1: number;
          spellSlotsLevel2: number;
          spellSlotsLevel3: number;
          spellSlotsLevel4: number;
          spellSlotsLevel5: number;
          spellSlotsLevel6: number;
          spellSlotsLevel7: number;
          spellSlotsLevel8: number;
          spellSlotsLevel9: number;
        }>;
        subclassSelectionLevel: number | null;
      } | null;
      subclass: {
        id: string;
        name: string;
      } | null;
    },
  ) {
    const currentLevel = characterSheet.level;
    const nextLevel = currentLevel + 1;

    const currentProgression =
      characterSheet.characterClass?.levelProgressions.find(
        (progression) => progression.level === currentLevel,
      ) ?? null;

    const nextProgression =
      characterSheet.characterClass?.levelProgressions.find(
        (progression) => progression.level === nextLevel,
      ) ?? null;

    const newFeatures = await getFeaturesUnlockedAtLevel(
      characterSheet,
      nextLevel,
    );

    const subclassSelectionLevel =
      characterSheet.characterClass?.subclassSelectionLevel ?? null;

    const isSubclassChoiceAvailable =
      typeof subclassSelectionLevel === "number" &&
      nextLevel >= subclassSelectionLevel;

    const isSubclassChoicePending =
      isSubclassChoiceAvailable && !characterSheet.subclass;

    return {
      currentLevel,
      nextLevel,
      currentProgression,
      nextProgression,
      newFeatures,
      subclass: characterSheet.subclass,
      subclassSelectionLevel,
      isSubclassChoiceAvailable,
      isSubclassChoicePending,
      canPreviewNextLevel: Boolean(nextProgression),
    };
  }

  async function withAvailableFeatures<
    T extends CharacterSheetFeatureSource & {
      classes?: CharacterSheetClassFeatureSource[];
      characterClass: {
        levelProgressions: Array<{
          level: number;
          proficiencyBonus: number | null;
          cantripsKnown: number;
          spellsKnown: number;
          spellsPrepared: number;
          spellSlotsLevel1: number;
          spellSlotsLevel2: number;
          spellSlotsLevel3: number;
          spellSlotsLevel4: number;
          spellSlotsLevel5: number;
          spellSlotsLevel6: number;
          spellSlotsLevel7: number;
          spellSlotsLevel8: number;
          spellSlotsLevel9: number;
        }>;
        subclassSelectionLevel: number | null;
      } | null;
      subclass: {
        id: string;
        name: string;
      } | null;
    },
  >(characterSheet: T) {
    const features =
      await getAvailableFeaturesForCharacterSheet(characterSheet);
    const levelUpPreview =
      await getLevelUpPreviewForCharacterSheet(characterSheet);

    return {
      ...characterSheet,
      features,
      levelUpPreview,
    };
  }

  async function getCharacterFeatureChoiceEntries({
    systemId,
    featureChoiceSelections,
    classEntries,
    fallbackClassId,
    fallbackSubclassId,
    fallbackLevel,
    ancestryId,
    backgroundId,
  }: {
    systemId: string;
    featureChoiceSelections: z.infer<
      typeof characterFeatureChoiceSelectionsSchema
    >;
    classEntries: CharacterClassEntryInput[];
    fallbackClassId: string | null | undefined;
    fallbackSubclassId: string | null | undefined;
    fallbackLevel: number | null | undefined;
    ancestryId: string | null | undefined;
    backgroundId: string | null | undefined;
  }) {
    if (featureChoiceSelections === undefined) {
      return {
        entries: [] as CharacterFeatureChoiceEntry[],
        error: null as string | null,
      };
    }

    const uniqueSelections = Array.from(
      new Map(
        featureChoiceSelections.map((selection) => [
          `${selection.choiceGroupId}:${selection.featureId}`,
          selection,
        ]),
      ).values(),
    );

    if (uniqueSelections.length === 0) {
      return {
        entries: [] as CharacterFeatureChoiceEntry[],
        error: null as string | null,
      };
    }

    const choiceGroupIds = Array.from(
      new Set(uniqueSelections.map((selection) => selection.choiceGroupId)),
    );

    const choiceGroups = await prisma.featureChoiceGroup.findMany({
      where: {
        systemId,
        id: {
          in: choiceGroupIds,
        },
      },
      include: {
        options: {
          select: {
            featureId: true,
          },
        },
        levelProgression: {
          select: {
            classId: true,
            level: true,
          },
        },
      },
    });

    const choiceGroupsById = new Map(
      choiceGroups.map((choiceGroup) => [choiceGroup.id, choiceGroup]),
    );

    const missingChoiceGroupId = choiceGroupIds.find(
      (choiceGroupId) => !choiceGroupsById.has(choiceGroupId),
    );

    if (missingChoiceGroupId) {
      return {
        entries: [],
        error: "Feature choice group not found for this character system",
      };
    }

    const effectiveClassEntries =
      classEntries.length > 0
        ? classEntries
        : fallbackClassId
          ? [
              {
                classId: fallbackClassId,
                subclassId: fallbackSubclassId ?? null,
                level: normalizeCharacterLevel(fallbackLevel),
                isPrimary: true,
                order: 0,
              },
            ]
          : [];

    const applicableSelections: CharacterFeatureChoiceEntry[] = [];

    for (const selection of uniqueSelections) {
      const choiceGroup = choiceGroupsById.get(selection.choiceGroupId);

      if (!choiceGroup) {
        continue;
      }

      const featureBelongsToGroup = choiceGroup.options.some(
        (option) => option.featureId === selection.featureId,
      );

      if (!featureBelongsToGroup) {
        return {
          entries: [],
          error: `Feature does not belong to the choice group "${choiceGroup.name}"`,
        };
      }

      const matchesAncestry =
        !choiceGroup.ancestryId || choiceGroup.ancestryId === ancestryId;

      const matchesBackground =
        !choiceGroup.backgroundId || choiceGroup.backgroundId === backgroundId;

      const matchesClass =
        !choiceGroup.classId ||
        effectiveClassEntries.some(
          (classEntry) => classEntry.classId === choiceGroup.classId,
        );

      const matchesSubclass =
        !choiceGroup.subclassId ||
        effectiveClassEntries.some(
          (classEntry) => classEntry.subclassId === choiceGroup.subclassId,
        );

      const matchesLevelProgression =
        !choiceGroup.levelProgression ||
        effectiveClassEntries.some(
          (classEntry) =>
            classEntry.classId === choiceGroup.levelProgression?.classId &&
            classEntry.level >= (choiceGroup.levelProgression?.level ?? 1),
        );

      const isChoiceGroupApplicable =
        matchesAncestry &&
        matchesBackground &&
        matchesClass &&
        matchesSubclass &&
        matchesLevelProgression;

      // Escolhas antigas e incompatíveis são removidas quando a
      // classe, subclasse, ancestralidade ou antecedente muda.
      if (!isChoiceGroupApplicable) {
        continue;
      }

      applicableSelections.push({
        choiceGroupId: selection.choiceGroupId,
        featureId: selection.featureId,
        source: "builder",
      });
    }

    const selectionCountByGroupId = new Map<string, number>();

    for (const selection of applicableSelections) {
      selectionCountByGroupId.set(
        selection.choiceGroupId,
        (selectionCountByGroupId.get(selection.choiceGroupId) ?? 0) + 1,
      );
    }

    for (const [
      choiceGroupId,
      selectedCount,
    ] of selectionCountByGroupId.entries()) {
      const choiceGroup = choiceGroupsById.get(choiceGroupId);

      if (!choiceGroup) {
        continue;
      }

      if (selectedCount > choiceGroup.choiceCount) {
        return {
          entries: [],
          error: `The feature choice group "${choiceGroup.name}" allows ${choiceGroup.choiceCount} choice(s), but ${selectedCount} were provided`,
        };
      }
    }

    return {
      entries: applicableSelections,
      error: null,
    };
  }

  async function replaceCharacterSheetFeatureChoices(
    characterSheetId: string,
    entries: CharacterFeatureChoiceEntry[],
  ) {
    await prisma.$transaction([
      prisma.characterSheetFeatureChoice.deleteMany({
        where: {
          characterSheetId,
          source: "builder",
        },
      }),

      ...entries.map((entry) =>
        prisma.characterSheetFeatureChoice.create({
          data: {
            characterSheetId,
            choiceGroupId: entry.choiceGroupId,
            featureId: entry.featureId,
            source: entry.source,
          },
        }),
      ),
    ]);
  }

  const characterSheetInclude = {
    campaignActor: true,
    system: true,
    ancestry: true,
    background: true,
    characterClass: {
      include: {
        levelProgressions: {
          orderBy: {
            level: "asc",
          },
          include: {
            spellLimits: {
              orderBy: {
                spellLevel: "asc",
              },
            },
          },
        },
      },
    },
    subclass: true,
    classes: {
      include: {
        characterClass: {
          include: {
            levelProgressions: {
              orderBy: {
                level: "asc",
              },
              include: {
                spellLimits: {
                  orderBy: {
                    spellLevel: "asc",
                  },
                },
              },
            },
          },
        },
        subclass: true,
      },
      orderBy: [
        {
          isPrimary: "desc",
        },
        {
          order: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    },
    stats: {
      include: {
        stat: true,
      },
    },
    skills: {
      include: {
        skill: {
          include: {
            stat: true,
          },
        },
      },
    },
    spells: {
      include: {
        spell: true,
        characterClass: {
          select: {
            id: true,
            key: true,
            name: true,
            spellcastingAbilityKey: true,
          },
        },
      },
      orderBy: {
        spell: {
          order: "asc",
        },
      },
    },
    languages: {
      include: {
        language: true,
      },
    },
    equipment: {
      include: {
        equipment: true,
      },
    },
    featureChoices: {
      include: {
        choiceGroup: true,
        feature: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    },
  } satisfies Prisma.CharacterSheetInclude;

  server.get(
    "/campaigns/:campaignId/character-sheets",
    {
      schema: {
        tags: ["Character Sheets"],
        description: "List campaign character sheets",
        params: z.object({
          campaignId: z.string().uuid("Invalid campaign id"),
        }),
      },
    },
    async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const { campaignId } = request.params;

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          OR: [
            {
              ownerId: session.user.id,
            },
            {
              participants: {
                some: {
                  userId: session.user.id,
                  status: "APPROVED",
                },
              },
            },
          ],
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      const characterSheets = await prisma.characterSheet.findMany({
        where: {
          campaignId,
        },
        include: characterSheetInclude,
        orderBy: {
          createdAt: "desc",
        },
      });

      const characterSheetsWithFeatures = await Promise.all(
        characterSheets.map((characterSheet) =>
          withAvailableFeatures(characterSheet),
        ),
      );

      return reply.status(200).send({
        characterSheets: characterSheetsWithFeatures,
      });
    },
  );

  server.get(
    "/campaigns/:campaignId/character-sheets/:sheetId",
    {
      schema: {
        tags: ["Character Sheets"],
        description: "Get a campaign character sheet by id",
        params: z.object({
          campaignId: z.string().uuid("Invalid campaign id"),
          sheetId: z.string().uuid("Invalid character sheet id"),
        }),
      },
    },
    async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const { campaignId, sheetId } = request.params;

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          OR: [
            {
              ownerId: session.user.id,
            },
            {
              participants: {
                some: {
                  userId: session.user.id,
                  status: "APPROVED",
                },
              },
            },
          ],
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      const characterSheet = await prisma.characterSheet.findFirst({
        where: {
          id: sheetId,
          campaignId,
        },
        include: characterSheetInclude,
      });

      if (!characterSheet) {
        return reply.status(404).send({
          message: "Character sheet not found",
        });
      }

      const characterSheetWithFeatures =
        await withAvailableFeatures(characterSheet);

      return reply.status(200).send({
        characterSheet: characterSheetWithFeatures,
      });
    },
  );

  server.post(
    "/campaigns/:campaignId/character-sheets",
    {
      schema: {
        tags: ["Character Sheets"],
        description: "Create a campaign character sheet",
        params: z.object({
          campaignId: z.string().uuid("Invalid campaign id"),
        }),
        body: z.object({
          campaignActorId: z
            .string()
            .uuid("Invalid campaign actor id")
            .optional(),

          systemId: z.string().uuid("Invalid system id"),

          classId: z.string().uuid("Invalid class id").nullable().optional(),
          classEntries: characterClassEntriesSchema,
          ancestryId: z
            .string()
            .uuid("Invalid ancestry id")
            .nullable()
            .optional(),
          backgroundId: z
            .string()
            .uuid("Invalid background id")
            .nullable()
            .optional(),

          name: z.string().min(1).max(120),
          pronouns: z.string().max(80).optional(),
          concept: z.string().max(500).optional(),
          portraitUrl: z.string().trim().optional(),
          tokenImageUrl: z.string().trim().optional(),
          tokenImageFit: z.enum(["COVER", "CONTAIN", "FILL"]).optional(),

          attributes: characterAttributesSchema,
          skillKeys: characterSkillKeysSchema,
          spellKeys: characterSpellKeysSchema,
          languageKeys: characterLanguageKeysSchema,
          featureChoiceSelections: characterFeatureChoiceSelectionsSchema,
          equipmentItems: characterEquipmentItemsSchema,
          classEquipmentMode: z.enum(["PACKAGE", "GOLD"]).optional(),
          backgroundEquipmentMode: z.enum(["PACKAGE", "GOLD"]).optional(),
          startingGold: z.number().int().min(0).optional(),
          level: z.number().int().min(1).max(20).optional(),

          alignment: z.string().nullable().optional(),
          faith: z.string().nullable().optional(),
          lifestyle: z.string().nullable().optional(),

          hair: z.string().nullable().optional(),
          skin: z.string().nullable().optional(),
          eyes: z.string().nullable().optional(),
          height: z.string().nullable().optional(),
          weight: z.string().nullable().optional(),
          age: z.string().nullable().optional(),
          gender: z.string().nullable().optional(),

          bonds: z.string().nullable().optional(),
          flaws: z.string().nullable().optional(),
          ideals: z.string().nullable().optional(),
          personality: z.string().nullable().optional(),
          backstory: z.string().nullable().optional(),
          organizations: z.string().nullable().optional(),
          allies: z.string().nullable().optional(),
          enemies: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
          otherNotes: z.string().nullable().optional(),
          gmNotes: z.string().nullable().optional(),
        }),
      },
    },
    async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const { campaignId } = request.params;

      const {
        campaignActorId,
        systemId,
        classId,
        classEntries,
        ancestryId,
        backgroundId,
        name,
        pronouns,
        concept,
        portraitUrl,
        tokenImageUrl,
        tokenImageFit,
        attributes,
        skillKeys,
        spellKeys,
        languageKeys,
        featureChoiceSelections,
        equipmentItems,
        classEquipmentMode,
        backgroundEquipmentMode,
        startingGold,
        level,
        alignment,
        faith,
        lifestyle,
        hair,
        skin,
        eyes,
        height,
        weight,
        age,
        gender,
        bonds,
        flaws,
        ideals,
        personality,
        backstory,
        organizations,
        allies,
        enemies,
        notes,
        otherNotes,
        gmNotes,
      } = request.body;

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          OR: [
            {
              ownerId: session.user.id,
            },
            {
              participants: {
                some: {
                  userId: session.user.id,
                  status: "APPROVED",
                },
              },
            },
          ],
        },
        include: {
          participants: {
            where: {
              userId: session.user.id,
              status: "APPROVED",
            },
            take: 1,
          },
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      if (campaignActorId) {
        const actor = await prisma.campaignActor.findFirst({
          where: {
            id: campaignActorId,
            campaignId,
          },
          include: {
            characterSheet: true,
          },
        });

        if (!actor) {
          return reply.status(404).send({
            message: "Campaign actor not found",
          });
        }

        if (actor.characterSheet) {
          return reply.status(409).send({
            message: "This campaign actor already has a character sheet",
          });
        }

        const isOwner = campaign.ownerId === session.user.id;
        const currentParticipant = campaign.participants[0];
        const isGM = currentParticipant?.role === "GM";
        const isActorOwner = actor.ownerId === session.user.id;

        if (!isOwner && !isGM && !isActorOwner) {
          return reply.status(403).send({
            message: "You can only create sheets for your own character",
          });
        }
      }

      const system = await prisma.gameSystem.findUnique({
        where: {
          id: systemId,
        },
      });

      if (!system) {
        return reply.status(404).send({
          message: "Game system not found",
        });
      }

      const normalizedClassEntriesResult = normalizeCharacterSheetClassEntries({
        classEntries,
        fallbackClassId: classId,
        fallbackSubclassId: null,
        fallbackLevel: level ?? 1,
      });

      if (normalizedClassEntriesResult.error) {
        return reply.status(400).send({
          message: normalizedClassEntriesResult.error,
        });
      }

      const classEntriesValidationError =
        await validateCharacterSheetClassEntries({
          systemId,
          classEntries: normalizedClassEntriesResult.entries,
        });

      if (classEntriesValidationError) {
        return reply.status(400).send({
          message: classEntriesValidationError,
        });
      }

      const effectiveClassId = normalizedClassEntriesResult.primaryClassId;
      const effectiveSubclassId =
        normalizedClassEntriesResult.primarySubclassId;
      const effectiveLevel = normalizedClassEntriesResult.totalLevel;

      const selectedCharacterClass = effectiveClassId
        ? await prisma.characterClass.findFirst({
            where: {
              id: effectiveClassId,
              systemId,
            },
            select: {
              id: true,
              hitDie: true,
              classSkillChoiceCount: true,
            },
          })
        : null;

      const selectedCharacterClassesForHitPoints =
        normalizedClassEntriesResult.entries.length > 0
          ? await prisma.characterClass.findMany({
              where: {
                systemId,
                id: {
                  in: normalizedClassEntriesResult.entries.map(
                    (classEntry) => classEntry.classId,
                  ),
                },
              },
              select: {
                id: true,
                hitDie: true,
              },
            })
          : [];

      const classHitDiceById = new Map(
        selectedCharacterClassesForHitPoints.map((characterClass) => [
          characterClass.id,
          characterClass.hitDie,
        ]),
      );

      if (effectiveClassId && !selectedCharacterClass) {
        return reply.status(404).send({
          message: "Character class not found for this system",
        });
      }

      const skillChoiceLimitError = validateDraftSkillChoiceLimit({
        skillKeys,
        characterClass: selectedCharacterClass,
      });

      if (skillChoiceLimitError) {
        return reply.status(400).send({
          message: skillChoiceLimitError,
        });
      }

      const selectedAncestry = ancestryId
        ? await prisma.ancestry.findFirst({
            where: {
              id: ancestryId,
              systemId,
            },
            select: {
              id: true,
              attributeBonuses: true,
            },
          })
        : null;

      if (ancestryId && !selectedAncestry) {
        return reply.status(404).send({
          message: "Ancestry not found for this system",
        });
      }

      const selectedBackground = backgroundId
        ? await prisma.background.findFirst({
            where: {
              id: backgroundId,
              systemId,
            },
            select: {
              id: true,
              attributeBonuses: true,
              skillKeys: true,
            },
          })
        : null;

      if (backgroundId && !selectedBackground) {
        return reply.status(404).send({
          message: "Background not found for this system",
        });
      }

      const sourceAttributeBonuses = mergeAttributeBonusMaps(
        normalizeAttributeBonusMap(selectedAncestry?.attributeBonuses),
        normalizeAttributeBonusMap(selectedBackground?.attributeBonuses),
      );

      const attributeEntriesResult = await getCharacterAttributeEntries(
        systemId,
        attributes,
        sourceAttributeBonuses,
      );

      if (attributeEntriesResult.error) {
        return reply.status(400).send({
          message: attributeEntriesResult.error,
        });
      }

      const skillEntriesResult = await getCharacterSkillEntries({
        systemId,
        skillKeys,
        source: "builder",
      });

      if (skillEntriesResult.error) {
        return reply.status(400).send({
          message: skillEntriesResult.error,
        });
      }

      const mergedSkillEntries = mergeCharacterSkillEntries(
        skillEntriesResult.entries,
      );

      const spellEntriesResult = await getCharacterSpellEntries({
        systemId,
        spellKeys,
        classEntries: normalizedClassEntriesResult.entries,
      });

      if (spellEntriesResult.error) {
        return reply.status(400).send({
          message: spellEntriesResult.error,
        });
      }

      const languageEntriesResult = await getCharacterLanguageEntries({
        systemId,
        languageKeys,
        source: "builder",
      });

      if (languageEntriesResult.error) {
        return reply.status(400).send({
          message: languageEntriesResult.error,
        });
      }

      const equipmentEntriesResult = await getCharacterEquipmentEntries(
        systemId,
        equipmentItems,
      );

      if (equipmentEntriesResult.error) {
        return reply.status(400).send({
          message: equipmentEntriesResult.error,
        });
      }

      const featureChoiceEntriesResult = await getCharacterFeatureChoiceEntries(
        {
          systemId,
          featureChoiceSelections,
          classEntries: normalizedClassEntriesResult.entries,
          fallbackClassId: effectiveClassId,
          fallbackSubclassId: effectiveSubclassId,
          fallbackLevel: effectiveLevel,
          ancestryId: ancestryId ?? null,
          backgroundId: backgroundId ?? null,
        },
      );

      if (featureChoiceEntriesResult.error) {
        return reply.status(400).send({
          message: featureChoiceEntriesResult.error,
        });
      }

      const initialMaxHitPoints = calculateInitialMaxHitPointsForClassEntries({
        classEntries: normalizedClassEntriesResult.entries,
        classHitDiceById,
        fallbackHitDie: selectedCharacterClass?.hitDie ?? null,
        fallbackLevel: effectiveLevel,
        constitutionValue: attributes?.constitution ?? null,
      });

      const characterSheet = await prisma.characterSheet.create({
        data: {
          campaignId,
          systemId,
          campaignActorId: campaignActorId ?? null,
          ownerId: session.user.id,

          classId: effectiveClassId,
          subclassId: effectiveSubclassId,
          ancestryId: ancestryId ?? null,
          backgroundId: backgroundId ?? null,

          name,
          pronouns: pronouns?.trim() || null,
          concept: concept?.trim() || null,
          portraitUrl: portraitUrl?.trim() || null,
          tokenImageUrl: tokenImageUrl?.trim() || null,
          tokenImageFit: tokenImageFit ?? "FILL",
          level: effectiveLevel,
          hitPoints: initialMaxHitPoints,
          maxHitPoints: initialMaxHitPoints,
          classEquipmentMode: classEquipmentMode ?? "PACKAGE",
          backgroundEquipmentMode: backgroundEquipmentMode ?? "PACKAGE",
          startingGold: startingGold ?? 0,

          alignment: alignment?.trim() || null,
          faith: faith?.trim() || null,
          lifestyle: lifestyle?.trim() || null,

          hair: hair?.trim() || null,
          skin: skin?.trim() || null,
          eyes: eyes?.trim() || null,
          height: height?.trim() || null,
          weight: weight?.trim() || null,
          age: age?.trim() || null,
          gender: gender?.trim() || null,

          bonds: bonds?.trim() || null,
          flaws: flaws?.trim() || null,
          ideals: ideals?.trim() || null,
          personality: personality?.trim() || null,
          backstory: backstory?.trim() || null,
          organizations: organizations?.trim() || null,
          allies: allies?.trim() || null,
          enemies: enemies?.trim() || null,
          notes: notes?.trim() || null,
          otherNotes: otherNotes?.trim() || null,
          gmNotes: gmNotes?.trim() || null,
        },
      });

      await upsertCharacterSheetStats(
        characterSheet.id,
        attributeEntriesResult.entries,
      );

      if (skillKeys !== undefined) {
        await replaceCharacterSheetSkills(
          characterSheet.id,
          mergedSkillEntries,
        );
      }

      if (spellKeys !== undefined) {
        await replaceCharacterSheetSpells(
          characterSheet.id,
          spellEntriesResult.entries,
        );
      }

      if (languageKeys !== undefined) {
        await replaceCharacterSheetLanguages(
          characterSheet.id,
          languageEntriesResult.entries,
        );
      }

      if (equipmentItems !== undefined) {
        await replaceCharacterSheetEquipment(
          characterSheet.id,
          equipmentEntriesResult.entries,
        );
      }

      if (featureChoiceSelections !== undefined) {
        await replaceCharacterSheetFeatureChoices(
          characterSheet.id,
          featureChoiceEntriesResult.entries,
        );
      }

      await syncCharacterSheetClasses({
        characterSheetId: characterSheet.id,
        classEntries: normalizedClassEntriesResult.entries,
        fallbackClassId: characterSheet.classId,
        fallbackSubclassId: characterSheet.subclassId,
        fallbackLevel: characterSheet.level,
      });

      const characterSheetWithRelations =
        await prisma.characterSheet.findUniqueOrThrow({
          where: {
            id: characterSheet.id,
          },
          include: characterSheetInclude,
        });

      const characterSheetWithFeatures = await withAvailableFeatures(
        characterSheetWithRelations,
      );

      return reply.status(201).send({
        characterSheet: characterSheetWithFeatures,
      });
    },
  );

  server.patch(
    "/campaigns/:campaignId/character-sheets/:sheetId",
    {
      schema: {
        tags: ["Character Sheets"],
        description: "Update a campaign character sheet",
        params: z.object({
          campaignId: z.string().uuid("Invalid campaign id"),
          sheetId: z.string().uuid("Invalid character sheet id"),
        }),
        body: z
          .object({
            classId: z.string().uuid("Invalid class id").nullable().optional(),
            classEntries: characterClassEntriesSchema,
            ancestryId: z
              .string()
              .uuid("Invalid ancestry id")
              .nullable()
              .optional(),
            backgroundId: z
              .string()
              .uuid("Invalid background id")
              .nullable()
              .optional(),
            subclassId: z
              .string()
              .uuid("Invalid subclass id")
              .nullable()
              .optional(),

            name: z.string().min(1).max(120).optional(),
            pronouns: z.string().max(80).nullable().optional(),
            concept: z.string().max(500).nullable().optional(),
            portraitUrl: z.string().trim().nullable().optional(),
            tokenImageUrl: z.string().trim().nullable().optional(),
            tokenImageFit: z.enum(["COVER", "CONTAIN", "FILL"]).optional(),

            attributes: characterAttributesSchema,
            skillKeys: characterSkillKeysSchema,
            spellKeys: characterSpellKeysSchema,
            languageKeys: characterLanguageKeysSchema,
            featureChoiceSelections: characterFeatureChoiceSelectionsSchema,
            equipmentItems: characterEquipmentItemsSchema,
            classEquipmentMode: z.enum(["PACKAGE", "GOLD"]).optional(),
            backgroundEquipmentMode: z.enum(["PACKAGE", "GOLD"]).optional(),
            startingGold: z.number().int().min(0).optional(),

            level: z.number().int().min(1).max(20).optional(),
            experience: z.number().int().min(0).optional(),
            hitPoints: z.number().int().min(0).optional(),
            maxHitPoints: z.number().int().min(0).optional(),
            temporaryHp: z.number().int().min(0).optional(),
            armorClass: z.number().int().min(0).optional(),
            speed: z.number().int().min(0).optional(),
            inspiration: z.boolean().optional(),

            alignment: z.string().nullable().optional(),
            faith: z.string().nullable().optional(),
            lifestyle: z.string().nullable().optional(),

            hair: z.string().nullable().optional(),
            skin: z.string().nullable().optional(),
            eyes: z.string().nullable().optional(),
            height: z.string().nullable().optional(),
            weight: z.string().nullable().optional(),
            age: z.string().nullable().optional(),
            gender: z.string().nullable().optional(),

            bonds: z.string().nullable().optional(),
            flaws: z.string().nullable().optional(),
            ideals: z.string().nullable().optional(),
            personality: z.string().nullable().optional(),
            backstory: z.string().nullable().optional(),
            organizations: z.string().nullable().optional(),
            allies: z.string().nullable().optional(),
            enemies: z.string().nullable().optional(),
            notes: z.string().nullable().optional(),
            otherNotes: z.string().nullable().optional(),
            gmNotes: z.string().nullable().optional(),

            status: z.enum(["DRAFT", "READY", "ARCHIVED"]).optional(),
          })
          .refine((data) => Object.keys(data).length > 0, {
            message: "At least one field must be provided",
          }),
      },
    },
    async (
      request: FastifyRequest<{
        Params: CharacterSheetRouteParams;
        Body: CharacterSheetUpdateBody;
      }>,
      reply: FastifyReply,
    ) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const { campaignId, sheetId } = request.params;
      const {
        attributes,
        skillKeys,
        spellKeys,
        languageKeys,
        featureChoiceSelections,
        equipmentItems,
        classEntries,
        ...sheetData
      } = request.body;

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          OR: [
            {
              ownerId: session.user.id,
            },
            {
              participants: {
                some: {
                  userId: session.user.id,
                  status: "APPROVED",
                },
              },
            },
          ],
        },
        include: {
          participants: {
            where: {
              userId: session.user.id,
              status: "APPROVED",
            },
            take: 1,
          },
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      const characterSheet = await prisma.characterSheet.findFirst({
        where: {
          id: sheetId,
          campaignId,
        },
        include: {
          campaignActor: true,
          characterClass: {
            select: {
              id: true,
              hitDie: true,
              classSkillChoiceCount: true,
            },
          },
          ancestry: {
            select: {
              id: true,
              attributeBonuses: true,
            },
          },
          background: {
            select: {
              id: true,
              attributeBonuses: true,
              skillKeys: true,
            },
          },
        },
      });

      if (!characterSheet) {
        return reply.status(404).send({
          message: "Character sheet not found",
        });
      }

      const currentParticipant = campaign.participants[0];
      const isOwner = campaign.ownerId === session.user.id;
      const isGM = currentParticipant?.role === "GM";
      const isSheetOwner = characterSheet.ownerId === session.user.id;

      if (!isOwner && !isGM && !isSheetOwner) {
        return reply.status(403).send({
          message: "You cannot edit this character sheet",
        });
      }

      if (characterSheet.status !== "DRAFT") {
        return reply.status(400).send({
          message:
            "Somente fichas em rascunho podem ser alteradas pelo builder.",
        });
      }

      const normalizedClassEntriesResult = normalizeCharacterSheetClassEntries({
        classEntries,
        fallbackClassId: sheetData.classId ?? characterSheet.classId,
        fallbackSubclassId: sheetData.subclassId ?? characterSheet.subclassId,
        fallbackLevel: sheetData.level ?? characterSheet.level,
      });

      if (normalizedClassEntriesResult.error) {
        return reply.status(400).send({
          message: normalizedClassEntriesResult.error,
        });
      }

      const classEntriesValidationError =
        await validateCharacterSheetClassEntries({
          systemId: characterSheet.systemId,
          classEntries: normalizedClassEntriesResult.entries,
        });

      if (classEntriesValidationError) {
        return reply.status(400).send({
          message: classEntriesValidationError,
        });
      }

      if (classEntries !== undefined) {
        sheetData.classId = normalizedClassEntriesResult.primaryClassId;
        sheetData.subclassId = normalizedClassEntriesResult.primarySubclassId;
        sheetData.level = normalizedClassEntriesResult.totalLevel;
      }

      const selectedCharacterClass =
        sheetData.classId === undefined
          ? characterSheet.characterClass
          : sheetData.classId
            ? await prisma.characterClass.findFirst({
                where: {
                  id: sheetData.classId,
                  systemId: characterSheet.systemId,
                },
                select: {
                  id: true,
                  hitDie: true,
                  classSkillChoiceCount: true,
                },
              })
            : null;

      const selectedCharacterClassesForHitPoints =
        normalizedClassEntriesResult.entries.length > 0
          ? await prisma.characterClass.findMany({
              where: {
                systemId: characterSheet.systemId,
                id: {
                  in: normalizedClassEntriesResult.entries.map(
                    (classEntry) => classEntry.classId,
                  ),
                },
              },
              select: {
                id: true,
                hitDie: true,
              },
            })
          : [];

      const classHitDiceById = new Map(
        selectedCharacterClassesForHitPoints.map((characterClass) => [
          characterClass.id,
          characterClass.hitDie,
        ]),
      );

      if (sheetData.classId && !selectedCharacterClass) {
        return reply.status(404).send({
          message: "Character class not found for this system",
        });
      }

      const skillChoiceLimitError = validateDraftSkillChoiceLimit({
        skillKeys,
        characterClass: selectedCharacterClass,
      });

      if (skillChoiceLimitError) {
        return reply.status(400).send({
          message: skillChoiceLimitError,
        });
      }

      const selectedAncestry =
        sheetData.ancestryId === undefined
          ? characterSheet.ancestry
          : sheetData.ancestryId
            ? await prisma.ancestry.findFirst({
                where: {
                  id: sheetData.ancestryId,
                  systemId: characterSheet.systemId,
                },
                select: {
                  id: true,
                  attributeBonuses: true,
                },
              })
            : null;

      if (sheetData.ancestryId && !selectedAncestry) {
        return reply.status(404).send({
          message: "Ancestry not found for this system",
        });
      }

      const selectedBackground =
        sheetData.backgroundId === undefined
          ? characterSheet.background
          : sheetData.backgroundId
            ? await prisma.background.findFirst({
                where: {
                  id: sheetData.backgroundId,
                  systemId: characterSheet.systemId,
                },
                select: {
                  id: true,
                  attributeBonuses: true,
                  skillKeys: true,
                },
              })
            : null;

      if (sheetData.backgroundId && !selectedBackground) {
        return reply.status(404).send({
          message: "Background not found for this system",
        });
      }

      if (sheetData.subclassId) {
        const selectedClassId = sheetData.classId ?? characterSheet.classId;
        const selectedLevel = sheetData.level ?? characterSheet.level;

        if (!selectedClassId) {
          return reply.status(400).send({
            message: "Choose a class before choosing a subclass",
          });
        }

        const characterClass = await prisma.characterClass.findFirst({
          where: {
            id: selectedClassId,
            systemId: characterSheet.systemId,
          },
        });

        if (!characterClass) {
          return reply.status(404).send({
            message: "Character class not found for this system",
          });
        }

        const subclassSelectionLevel =
          characterClass.subclassSelectionLevel ?? 1;

        if (selectedLevel < subclassSelectionLevel) {
          return reply.status(400).send({
            message: `Subclass can only be chosen at level ${subclassSelectionLevel}`,
          });
        }

        const subclass = await prisma.characterSubclass.findFirst({
          where: {
            id: sheetData.subclassId,
            systemId: characterSheet.systemId,
            classId: selectedClassId,
          },
        });

        if (!subclass) {
          return reply.status(404).send({
            message: "Subclass not found for this class and system",
          });
        }
      }

      const sourceAttributeBonuses = mergeAttributeBonusMaps(
        normalizeAttributeBonusMap(selectedAncestry?.attributeBonuses),
        normalizeAttributeBonusMap(selectedBackground?.attributeBonuses),
      );

      const attributeEntriesResult = await getCharacterAttributeEntries(
        characterSheet.systemId,
        attributes,
        sourceAttributeBonuses,
      );

      if (attributeEntriesResult.error) {
        return reply.status(400).send({
          message: attributeEntriesResult.error,
        });
      }

      const skillEntriesResult = await getCharacterSkillEntries({
        systemId: characterSheet.systemId,
        skillKeys,
        source: "builder",
      });

      if (skillEntriesResult.error) {
        return reply.status(400).send({
          message: skillEntriesResult.error,
        });
      }

      const mergedSkillEntries = mergeCharacterSkillEntries(
        skillEntriesResult.entries,
      );

      const spellEntriesResult = await getCharacterSpellEntries({
        systemId: characterSheet.systemId,
        spellKeys,
        classEntries: normalizedClassEntriesResult.entries,
      });

      if (spellEntriesResult.error) {
        return reply.status(400).send({
          message: spellEntriesResult.error,
        });
      }

      const languageEntriesResult = await getCharacterLanguageEntries({
        systemId: characterSheet.systemId,
        languageKeys,
        source: "builder",
      });

      if (languageEntriesResult.error) {
        return reply.status(400).send({
          message: languageEntriesResult.error,
        });
      }

      const equipmentEntriesResult = await getCharacterEquipmentEntries(
        characterSheet.systemId,
        equipmentItems,
      );

      if (equipmentEntriesResult.error) {
        return reply.status(400).send({
          message: equipmentEntriesResult.error,
        });
      }

      const featureChoiceEntriesResult = await getCharacterFeatureChoiceEntries(
        {
          systemId: characterSheet.systemId,
          featureChoiceSelections,
          classEntries: normalizedClassEntriesResult.entries,
          fallbackClassId: sheetData.classId ?? characterSheet.classId,
          fallbackSubclassId: sheetData.subclassId ?? characterSheet.subclassId,
          fallbackLevel: sheetData.level ?? characterSheet.level,
          ancestryId: selectedAncestry?.id ?? null,
          backgroundId: selectedBackground?.id ?? null,
        },
      );

      if (featureChoiceEntriesResult.error) {
        return reply.status(400).send({
          message: featureChoiceEntriesResult.error,
        });
      }

      const currentConstitutionStat = await prisma.characterSheetStat.findFirst(
        {
          where: {
            characterSheetId: sheetId,
            stat: {
              key: "constitution",
            },
          },
          select: {
            baseValue: true,
          },
        },
      );

      const shouldRecalculateInitialHitPoints =
        characterSheet.status === "DRAFT" &&
        (classEntries !== undefined ||
          sheetData.classId !== undefined ||
          sheetData.level !== undefined ||
          attributes?.constitution !== undefined);

      const nextConstitutionValue =
        attributes?.constitution ?? currentConstitutionStat?.baseValue ?? null;

      const recalculatedInitialMaxHitPoints = shouldRecalculateInitialHitPoints
        ? calculateInitialMaxHitPointsForClassEntries({
            classEntries: normalizedClassEntriesResult.entries,
            classHitDiceById,
            fallbackHitDie: selectedCharacterClass?.hitDie ?? null,
            fallbackLevel: sheetData.level ?? characterSheet.level,
            constitutionValue: nextConstitutionValue,
          })
        : null;

      const sanitizedData = {
        ...sheetData,
        ...(recalculatedInitialMaxHitPoints !== null
          ? {
              hitPoints: recalculatedInitialMaxHitPoints,
              maxHitPoints: recalculatedInitialMaxHitPoints,
            }
          : {}),
        pronouns:
          sheetData.pronouns === undefined
            ? undefined
            : sheetData.pronouns?.trim() || null,
        concept:
          sheetData.concept === undefined
            ? undefined
            : sheetData.concept?.trim() || null,
        portraitUrl:
          sheetData.portraitUrl === undefined
            ? undefined
            : sheetData.portraitUrl?.trim() || null,
        tokenImageUrl:
          sheetData.tokenImageUrl === undefined
            ? undefined
            : sheetData.tokenImageUrl?.trim() || null,
        alignment:
          sheetData.alignment === undefined
            ? undefined
            : sheetData.alignment?.trim() || null,
        faith:
          sheetData.faith === undefined
            ? undefined
            : sheetData.faith?.trim() || null,
        lifestyle:
          sheetData.lifestyle === undefined
            ? undefined
            : sheetData.lifestyle?.trim() || null,
        hair:
          sheetData.hair === undefined
            ? undefined
            : sheetData.hair?.trim() || null,
        skin:
          sheetData.skin === undefined
            ? undefined
            : sheetData.skin?.trim() || null,
        eyes:
          sheetData.eyes === undefined
            ? undefined
            : sheetData.eyes?.trim() || null,
        height:
          sheetData.height === undefined
            ? undefined
            : sheetData.height?.trim() || null,
        weight:
          sheetData.weight === undefined
            ? undefined
            : sheetData.weight?.trim() || null,
        age:
          sheetData.age === undefined
            ? undefined
            : sheetData.age?.trim() || null,
        gender:
          sheetData.gender === undefined
            ? undefined
            : sheetData.gender?.trim() || null,
        bonds:
          sheetData.bonds === undefined
            ? undefined
            : sheetData.bonds?.trim() || null,
        flaws:
          sheetData.flaws === undefined
            ? undefined
            : sheetData.flaws?.trim() || null,
        ideals:
          sheetData.ideals === undefined
            ? undefined
            : sheetData.ideals?.trim() || null,
        personality:
          sheetData.personality === undefined
            ? undefined
            : sheetData.personality?.trim() || null,
        backstory:
          sheetData.backstory === undefined
            ? undefined
            : sheetData.backstory?.trim() || null,
        organizations:
          sheetData.organizations === undefined
            ? undefined
            : sheetData.organizations?.trim() || null,
        allies:
          sheetData.allies === undefined
            ? undefined
            : sheetData.allies?.trim() || null,
        enemies:
          sheetData.enemies === undefined
            ? undefined
            : sheetData.enemies?.trim() || null,
        notes:
          sheetData.notes === undefined
            ? undefined
            : sheetData.notes?.trim() || null,
        otherNotes:
          sheetData.otherNotes === undefined
            ? undefined
            : sheetData.otherNotes?.trim() || null,
        gmNotes:
          sheetData.gmNotes === undefined
            ? undefined
            : sheetData.gmNotes?.trim() || null,
      };

      const shouldUpdateCharacterSheet = Object.values(sanitizedData).some(
        (value) => value !== undefined,
      );

      if (shouldUpdateCharacterSheet) {
        await prisma.characterSheet.update({
          where: {
            id: sheetId,
          },
          data: sanitizedData,
        });
      }

      const shouldRefreshAttributeBonuses =
        attributes !== undefined ||
        sheetData.ancestryId !== undefined ||
        sheetData.backgroundId !== undefined;

      if (shouldRefreshAttributeBonuses) {
        if (attributes !== undefined) {
          await upsertCharacterSheetStats(
            sheetId,
            attributeEntriesResult.entries,
          );
        } else {
          const currentStats = await prisma.characterSheetStat.findMany({
            where: {
              characterSheetId: sheetId,
            },
            include: {
              stat: {
                select: {
                  key: true,
                },
              },
            },
          });

          await upsertCharacterSheetStats(
            sheetId,
            currentStats.map((currentStat) => {
              const statKey = currentStat.stat.key;

              return {
                statId: currentStat.statId,
                baseValue: currentStat.baseValue,
                bonusValue: isCharacterAttributeKey(statKey)
                  ? (sourceAttributeBonuses[statKey] ?? 0)
                  : 0,
              };
            }),
          );
        }
      }

      if (skillKeys !== undefined) {
        await replaceCharacterSheetSkills(sheetId, mergedSkillEntries);
      }

      if (spellKeys !== undefined) {
        await replaceCharacterSheetSpells(sheetId, spellEntriesResult.entries);
      }

      if (languageKeys !== undefined) {
        await replaceCharacterSheetLanguages(
          sheetId,
          languageEntriesResult.entries,
        );
      }

      if (equipmentItems !== undefined) {
        await replaceCharacterSheetEquipment(
          sheetId,
          equipmentEntriesResult.entries,
        );
      }

      if (featureChoiceSelections !== undefined) {
        await replaceCharacterSheetFeatureChoices(
          sheetId,
          featureChoiceEntriesResult.entries,
        );
      }

      const updatedCharacterSheet =
        await prisma.characterSheet.findUniqueOrThrow({
          where: {
            id: sheetId,
          },
          include: characterSheetInclude,
        });

      await syncCharacterSheetClasses({
        characterSheetId: updatedCharacterSheet.id,
        classEntries: normalizedClassEntriesResult.entries,
        fallbackClassId: updatedCharacterSheet.classId,
        fallbackSubclassId: updatedCharacterSheet.subclassId,
        fallbackLevel: updatedCharacterSheet.level,
      });

      const updatedCharacterSheetWithRelations =
        await prisma.characterSheet.findUniqueOrThrow({
          where: {
            id: updatedCharacterSheet.id,
          },
          include: characterSheetInclude,
        });

      const updatedCharacterSheetWithFeatures = await withAvailableFeatures(
        updatedCharacterSheetWithRelations,
      );

      return reply.status(200).send({
        characterSheet: updatedCharacterSheetWithFeatures,
      });
    },
  );

  server.patch(
    "/campaigns/:campaignId/character-sheets/:sheetId/level-up-availability",
    {
      schema: {
        tags: ["Character Sheets"],
        description: "Set character sheet Level Up availability",
        params: z.object({
          campaignId: z.string().uuid("Invalid campaign id"),
          sheetId: z.string().uuid("Invalid character sheet id"),
        }),
        body: z.object({
          levelUpAvailable: z.boolean(),
        }),
      },
    },
    async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const { campaignId, sheetId } = request.params;
      const { levelUpAvailable } = request.body;

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          OR: [
            {
              ownerId: session.user.id,
            },
            {
              participants: {
                some: {
                  userId: session.user.id,
                  status: "APPROVED",
                },
              },
            },
          ],
        },
        include: {
          participants: {
            where: {
              userId: session.user.id,
              status: "APPROVED",
            },
            take: 1,
          },
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      const currentParticipant = campaign.participants[0];
      const isOwner = campaign.ownerId === session.user.id;
      const isGM = currentParticipant?.role === "GM";

      if (!isOwner && !isGM) {
        return reply.status(403).send({
          message:
            "Only the campaign owner or GM can change Level Up availability",
        });
      }

      const characterSheet = await prisma.characterSheet.findFirst({
        where: {
          id: sheetId,
          campaignId,
        },
      });

      if (!characterSheet) {
        return reply.status(404).send({
          message: "Character sheet not found",
        });
      }

      const updatedCharacterSheet = await prisma.characterSheet.update({
        where: {
          id: characterSheet.id,
        },
        data: {
          levelUpAvailable,
        },
        include: characterSheetInclude,
      });

      const updatedCharacterSheetWithFeatures = await withAvailableFeatures(
        updatedCharacterSheet,
      );

      return reply.status(200).send({
        characterSheet: updatedCharacterSheetWithFeatures,
      });
    },
  );

  server.post(
    "/campaigns/:campaignId/character-sheets/:sheetId/level-up",
    {
      schema: {
        tags: ["Character Sheets"],
        description: "Confirm character sheet level up",
        params: z.object({
          campaignId: z.string().uuid("Invalid campaign id"),
          sheetId: z.string().uuid("Invalid character sheet id"),
        }),
        body: z
          .object({
            classEntryId: z
              .string()
              .uuid("Invalid character sheet class id")
              .optional(),
          })
          .optional(),
      },
    },
    async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const { campaignId, sheetId } = request.params;
      const { classEntryId } = request.body ?? {};

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          OR: [
            {
              ownerId: session.user.id,
            },
            {
              participants: {
                some: {
                  userId: session.user.id,
                  status: "APPROVED",
                },
              },
            },
          ],
        },
        include: {
          participants: {
            where: {
              userId: session.user.id,
              status: "APPROVED",
            },
            take: 1,
          },
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      const currentParticipant = campaign.participants[0];
      const isOwner = campaign.ownerId === session.user.id;
      const isGM = currentParticipant?.role === "GM";

      if (!isOwner && !isGM) {
        return reply.status(403).send({
          message: "Only the campaign owner or GM can confirm Level Up",
        });
      }

      const characterSheet = await prisma.characterSheet.findFirst({
        where: {
          id: sheetId,
          campaignId,
        },
        include: {
          classes: {
            include: {
              characterClass: {
                include: {
                  levelProgressions: true,
                },
              },
            },
            orderBy: [
              {
                isPrimary: "desc",
              },
              {
                order: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
          },
        },
      });

      if (!characterSheet) {
        return reply.status(404).send({
          message: "Character sheet not found",
        });
      }

      if (characterSheet.status !== "READY") {
        return reply.status(400).send({
          message: "Only ready character sheets can level up",
        });
      }

      if (characterSheet.level >= 20) {
        return reply.status(400).send({
          message: "Character is already at maximum level",
        });
      }

      const selectedClassEntry =
        (classEntryId
          ? characterSheet.classes.find(
              (classEntry) => classEntry.id === classEntryId,
            )
          : null) ??
        characterSheet.classes.find((classEntry) => classEntry.isPrimary) ??
        characterSheet.classes[0] ??
        null;

      if (!selectedClassEntry) {
        return reply.status(400).send({
          message: "Character sheet has no class to level up",
        });
      }

      const nextClassLevel = selectedClassEntry.level + 1;
      const nextCharacterLevel = characterSheet.level + 1;

      if (nextClassLevel > 20) {
        return reply.status(400).send({
          message: "Selected class is already at maximum level",
        });
      }

      const hasNextClassProgression =
        selectedClassEntry.characterClass.levelProgressions.some(
          (progression) => progression.level === nextClassLevel,
        );

      if (!hasNextClassProgression) {
        return reply.status(400).send({
          message:
            "Selected class has no progression registered for the next level",
        });
      }

      await prisma.$transaction([
        prisma.characterSheet.update({
          where: {
            id: characterSheet.id,
          },
          data: {
            level: nextCharacterLevel,
            levelUpAvailable: false,
          },
        }),

        prisma.characterSheetClass.update({
          where: {
            id: selectedClassEntry.id,
          },
          data: {
            level: nextClassLevel,
          },
        }),
      ]);

      const updatedCharacterSheet =
        await prisma.characterSheet.findUniqueOrThrow({
          where: {
            id: characterSheet.id,
          },
          include: characterSheetInclude,
        });

      const updatedCharacterSheetWithFeatures = await withAvailableFeatures(
        updatedCharacterSheet,
      );

      return reply.status(200).send({
        characterSheet: updatedCharacterSheetWithFeatures,
      });
    },
  );

  function getActorInitialsFromName(name: string) {
    const initials = name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return initials || "PC";
  }

  async function getReadyValidationErrors(characterSheet: {
    systemId: string;
    name: string;
    level: number;
    classId: string | null;
    subclassId: string | null;
    ancestryId: string | null;
    backgroundId: string | null;
    ancestry: {
      languageKeys: string[];
    } | null;
    background: {
      languageChoiceCount: number;
      languageKeys: string[];
    } | null;
    characterClass: {
      classSkillChoiceCount: number;
      subclassSelectionLevel: number | null;
      levelProgressions: Array<{
        level: number;
        spellLimits: Array<{
          spellLevel: number;
          spellsKnown: number;
        }>;
      }>;
    } | null;
    classes: Array<{
      classId: string;
      level: number;
      subclassId: string | null;
      characterClass: {
        name: string;
        subclassSelectionLevel: number | null;
        levelProgressions: Array<{
          level: number;
          spellLimits: Array<{
            spellLevel: number;
            spellsKnown: number;
          }>;
        }>;
      };
    }>;
    stats: Array<{
      stat: {
        key: string;
      };
    }>;
    skills: Array<{
      source: string | null;
    }>;
    spells: Array<{
      source: string | null;
      spell: {
        level: number;
      };
    }>;
    languages: Array<{
      source: string | null;
      language: {
        key: string;
      };
    }>;
    featureChoices: Array<{
      choiceGroupId: string;
      featureId: string;
      source: string;
    }>;
  }) {
    const errors: string[] = [];

    if (!characterSheet.name.trim()) {
      errors.push("Informe o nome do personagem.");
    }

    if (!characterSheet.classId) {
      errors.push("Escolha uma classe.");
    }

    if (!characterSheet.ancestryId) {
      errors.push("Escolha uma ancestralidade.");
    }

    if (!characterSheet.backgroundId) {
      errors.push("Escolha um antecedente.");
    }

    const classEntries =
      characterSheet.classes.length > 0
        ? characterSheet.classes
        : characterSheet.classId
          ? [
              {
                classId: characterSheet.classId,
                level: characterSheet.level,
                subclassId: characterSheet.subclassId,
                characterClass: {
                  name: "Classe principal",
                  subclassSelectionLevel:
                    characterSheet.characterClass?.subclassSelectionLevel ??
                    null,
                  levelProgressions:
                    characterSheet.characterClass?.levelProgressions ?? [],
                },
              },
            ]
          : [];

    const pendingSubclassEntries = classEntries.filter((classEntry) => {
      const subclassSelectionLevel =
        classEntry.characterClass.subclassSelectionLevel;

      return (
        typeof subclassSelectionLevel === "number" &&
        classEntry.level >= subclassSelectionLevel &&
        !classEntry.subclassId
      );
    });

    for (const pendingClassEntry of pendingSubclassEntries) {
      errors.push(
        `Escolha uma subclasse para ${pendingClassEntry.characterClass.name} antes de finalizar a ficha.`,
      );
    }

    const requiredStatKeys = [
      "strength",
      "dexterity",
      "constitution",
      "intelligence",
      "wisdom",
      "charisma",
    ];

    const sheetStatKeys = new Set(
      characterSheet.stats.map((sheetStat) => sheetStat.stat.key),
    );

    const hasAllRequiredStats = requiredStatKeys.every((statKey) =>
      sheetStatKeys.has(statKey),
    );

    if (!hasAllRequiredStats) {
      errors.push("Distribua todos os seis atributos.");
    }

    const requiredSkillChoiceCount = getClassSkillChoiceCount(
      characterSheet.characterClass,
    );

    const builderSkillChoiceCount = characterSheet.skills.filter(
      (skill) => skill.source === "builder",
    ).length;

    if (builderSkillChoiceCount !== requiredSkillChoiceCount) {
      errors.push(
        `Escolha exatamente ${requiredSkillChoiceCount} perícias da classe antes de finalizar a ficha.`,
      );
    }

    const requiredKnownSpellLimitsByLevel = new Map<number, number>();

    for (const classEntry of classEntries) {
      const safeClassLevel = normalizeCharacterLevel(classEntry.level);

      const progression =
        classEntry.characterClass.levelProgressions.find(
          (currentProgression) => currentProgression.level === safeClassLevel,
        ) ?? null;

      for (const spellLimit of progression?.spellLimits ?? []) {
        if (spellLimit.spellsKnown <= 0) {
          continue;
        }

        requiredKnownSpellLimitsByLevel.set(
          spellLimit.spellLevel,
          (requiredKnownSpellLimitsByLevel.get(spellLimit.spellLevel) ?? 0) +
            spellLimit.spellsKnown,
        );
      }
    }

    const selectedKnownSpellCountsByLevel = new Map<number, number>();

    for (const characterSpell of characterSheet.spells) {
      // Magias manuais ou concedidas pelo mestre não entram nos
      // limites de escolhas do builder.
      if (
        characterSpell.source !== "class" &&
        characterSpell.source !== "builder"
      ) {
        continue;
      }

      const spellLevel = characterSpell.spell.level;

      selectedKnownSpellCountsByLevel.set(
        spellLevel,
        (selectedKnownSpellCountsByLevel.get(spellLevel) ?? 0) + 1,
      );
    }

    for (const [
      spellLevel,
      requiredKnownSpellCount,
    ] of requiredKnownSpellLimitsByLevel.entries()) {
      const selectedKnownSpellCount =
        selectedKnownSpellCountsByLevel.get(spellLevel) ?? 0;

      if (selectedKnownSpellCount === requiredKnownSpellCount) {
        continue;
      }

      const spellLevelLabel =
        spellLevel === 0 ? "truque(s)" : `magia(s) de nível ${spellLevel}`;

      if (selectedKnownSpellCount < requiredKnownSpellCount) {
        errors.push(
          `Escolha exatamente ${requiredKnownSpellCount} ${spellLevelLabel} conhecido(s) antes de finalizar a ficha. Atualmente foram escolhidos ${selectedKnownSpellCount}.`,
        );

        continue;
      }

      errors.push(
        `O limite de ${requiredKnownSpellCount} ${spellLevelLabel} conhecido(s) foi ultrapassado. Atualmente existem ${selectedKnownSpellCount}.`,
      );
    }

    for (const [
      spellLevel,
      selectedKnownSpellCount,
    ] of selectedKnownSpellCountsByLevel.entries()) {
      const requiredKnownSpellCount =
        requiredKnownSpellLimitsByLevel.get(spellLevel) ?? 0;

      if (selectedKnownSpellCount <= 0 || requiredKnownSpellCount > 0) {
        continue;
      }

      const spellLevelLabel =
        spellLevel === 0 ? "truque(s)" : `magia(s) de nível ${spellLevel}`;

      errors.push(
        `As classes escolhidas não permitem ${spellLevelLabel} conhecido(s) nos níveis atuais.`,
      );
    }

    const automaticLanguageKeys = new Set([
      ...(characterSheet.ancestry?.languageKeys ?? []),
      ...(characterSheet.background?.languageKeys ?? []),
    ]);

    const builderLanguageKeys = characterSheet.languages
      .filter((languageEntry) => languageEntry.source === "builder")
      .map((languageEntry) => languageEntry.language.key);

    const uniqueBuilderLanguageKeys = new Set(builderLanguageKeys);

    if (uniqueBuilderLanguageKeys.size !== builderLanguageKeys.length) {
      errors.push("Remova idiomas duplicados antes de finalizar a ficha.");
    }

    const duplicatedAutomaticLanguageKey = builderLanguageKeys.find(
      (languageKey) => automaticLanguageKeys.has(languageKey),
    );

    if (duplicatedAutomaticLanguageKey) {
      errors.push(
        "Idiomas automáticos da ancestralidade ou do antecedente não devem ser escolhidos novamente como idioma extra.",
      );
    }

    const requiredLanguageChoiceCount = Math.max(
      0,
      characterSheet.background?.languageChoiceCount ?? 0,
    );

    if (uniqueBuilderLanguageKeys.size !== requiredLanguageChoiceCount) {
      errors.push(
        `Escolha exatamente ${requiredLanguageChoiceCount} idioma(s) extra(s) do antecedente antes de finalizar a ficha.`,
      );
    }

    const featureChoiceGroups =
      await prisma.featureChoiceGroup.findMany({
        where: {
          systemId: characterSheet.systemId,
        },
        include: {
          options: {
            select: {
              featureId: true,
            },
          },
          levelProgression: {
            select: {
              classId: true,
              level: true,
            },
          },
        },
        orderBy: [
          {
            order: "asc",
          },
          {
            name: "asc",
          },
        ],
      });

    const applicableFeatureChoiceGroups =
      featureChoiceGroups.filter((choiceGroup) => {
        const matchesAncestry =
          !choiceGroup.ancestryId ||
          choiceGroup.ancestryId === characterSheet.ancestryId;

        const matchesBackground =
          !choiceGroup.backgroundId ||
          choiceGroup.backgroundId === characterSheet.backgroundId;

        const matchesClass =
          !choiceGroup.classId ||
          classEntries.some(
            (classEntry) =>
              classEntry.classId === choiceGroup.classId,
          );

        const matchesSubclass =
          !choiceGroup.subclassId ||
          classEntries.some(
            (classEntry) =>
              classEntry.subclassId === choiceGroup.subclassId,
          );

        const matchesLevelProgression =
          !choiceGroup.levelProgression ||
          classEntries.some((classEntry) => {
            return (
              classEntry.classId ===
                choiceGroup.levelProgression?.classId &&
              normalizeCharacterLevel(classEntry.level) >=
                (choiceGroup.levelProgression?.level ?? 1)
            );
          });

        return (
          matchesAncestry &&
          matchesBackground &&
          matchesClass &&
          matchesSubclass &&
          matchesLevelProgression
        );
      });

    const builderFeatureChoices =
      characterSheet.featureChoices.filter(
        (featureChoice) => featureChoice.source === "builder",
      );

    for (const choiceGroup of applicableFeatureChoiceGroups) {
      const groupSelections = builderFeatureChoices.filter(
        (featureChoice) =>
          featureChoice.choiceGroupId === choiceGroup.id,
      );

      const uniqueSelectedFeatureIds = new Set(
        groupSelections.map(
          (featureChoice) => featureChoice.featureId,
        ),
      );

      const allowedFeatureIds = new Set(
        choiceGroup.options.map((option) => option.featureId),
      );

      const invalidSelectedFeatureId = Array.from(
        uniqueSelectedFeatureIds,
      ).find((featureId) => !allowedFeatureIds.has(featureId));

      if (invalidSelectedFeatureId) {
        errors.push(
          `Existe uma opção inválida selecionada no grupo "${choiceGroup.name}".`,
        );

        continue;
      }

      const selectedCount = uniqueSelectedFeatureIds.size;

      if (selectedCount === choiceGroup.choiceCount) {
        continue;
      }

      if (selectedCount < choiceGroup.choiceCount) {
        errors.push(
          `Escolha exatamente ${choiceGroup.choiceCount} opção(ões) no grupo "${choiceGroup.name}" antes de finalizar a ficha. Atualmente foram escolhidas ${selectedCount}.`,
        );

        continue;
      }

      errors.push(
        `O grupo "${choiceGroup.name}" permite exatamente ${choiceGroup.choiceCount} escolha(s), mas possui ${selectedCount}.`,
      );
    }

    return errors;
  }

  server.post(
    "/campaigns/:campaignId/character-sheets/:sheetId/finalize",
    {
      schema: {
        tags: ["Character Sheets"],
        description:
          "Finalize a draft character sheet and ensure it has a campaign actor",
        params: z.object({
          campaignId: z.string().uuid("Invalid campaign id"),
          sheetId: z.string().uuid("Invalid character sheet id"),
        }),
      },
    },
    async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const { campaignId, sheetId } = request.params;

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          OR: [
            {
              ownerId: session.user.id,
            },
            {
              participants: {
                some: {
                  userId: session.user.id,
                  status: "APPROVED",
                },
              },
            },
          ],
        },
        include: {
          participants: {
            where: {
              userId: session.user.id,
              status: "APPROVED",
            },
            take: 1,
          },
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      const characterSheet = await prisma.characterSheet.findFirst({
        where: {
          id: sheetId,
          campaignId,
        },
        include: characterSheetInclude,
      });

      if (!characterSheet) {
        return reply.status(404).send({
          message: "Character sheet not found",
        });
      }

      const currentParticipant = campaign.participants[0];
      const isOwner = campaign.ownerId === session.user.id;
      const isGM = currentParticipant?.role === "GM";
      const isSheetOwner = characterSheet.ownerId === session.user.id;

      if (!isOwner && !isGM && !isSheetOwner) {
        return reply.status(403).send({
          message: "You cannot finalize this character sheet",
        });
      }

      if (characterSheet.status !== "DRAFT") {
        return reply.status(400).send({
          message: "Somente fichas em rascunho podem ser finalizadas.",
        });
      }

      const validationErrors =
        await getReadyValidationErrors(characterSheet);

      if (validationErrors.length > 0) {
        return reply.status(400).send({
          message:
            "A ficha ainda não possui os dados mínimos para ser finalizada.",
          errors: validationErrors,
        });
      }

      const actorName = characterSheet.name.trim();
      const actorInitials = getActorInitialsFromName(actorName);
      const actorOwnerId = characterSheet.ownerId ?? session.user.id;
      const actorDescription = characterSheet.concept?.trim() || null;
      const actorPortraitUrl =
        characterSheet.portraitUrl?.trim() ||
        characterSheet.tokenImageUrl?.trim() ||
        null;

      const finalizedCharacterSheet = await prisma.$transaction(async (tx) => {
        const campaignActor = characterSheet.campaignActorId
          ? await tx.campaignActor.update({
              where: {
                id: characterSheet.campaignActorId,
              },
              data: {
                name: actorName,
                initials: actorInitials,
                description: actorDescription,
                portraitUrl: actorPortraitUrl,
                type: "PLAYER_CHARACTER",
                location: "TABLE",
                ownerId: actorOwnerId,
              },
            })
          : await tx.campaignActor.create({
              data: {
                campaignId,
                ownerId: actorOwnerId,
                type: "PLAYER_CHARACTER",
                location: "TABLE",
                name: actorName,
                initials: actorInitials,
                description: actorDescription,
                portraitUrl: actorPortraitUrl,
              },
            });

        return tx.characterSheet.update({
          where: {
            id: sheetId,
          },
          data: {
            status: "READY",
            campaignActorId: campaignActor.id,
          },
          include: characterSheetInclude,
        });
      });

      const finalizedCharacterSheetWithFeatures = await withAvailableFeatures(
        finalizedCharacterSheet,
      );

      return reply.status(200).send({
        characterSheet: finalizedCharacterSheetWithFeatures,
      });
    },
  );
}
