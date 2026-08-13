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

  const characterProgressionAttributeIncreasesSchema = z.object({
    strength: z.number().int().min(0).max(2).optional(),
    dexterity: z.number().int().min(0).max(2).optional(),
    constitution: z.number().int().min(0).max(2).optional(),
    intelligence: z.number().int().min(0).max(2).optional(),
    wisdom: z.number().int().min(0).max(2).optional(),
    charisma: z.number().int().min(0).max(2).optional(),
  });

  const characterTalentMinimumAttributesSchema = z.object({
    strength: z.number().int().min(1).max(20).optional(),
    dexterity: z.number().int().min(1).max(20).optional(),
    constitution: z.number().int().min(1).max(20).optional(),
    intelligence: z.number().int().min(1).max(20).optional(),
    wisdom: z.number().int().min(1).max(20).optional(),
    charisma: z.number().int().min(1).max(20).optional(),
  });

  const characterTalentPrerequisitesSchema = z
    .object({
      minimumCharacterLevel: z.number().int().min(1).max(20).optional(),

      minimumAttributes: characterTalentMinimumAttributesSchema.optional(),

      requiredClassKeys: z.array(z.string().min(1)).optional(),
      requiredSubclassKeys: z.array(z.string().min(1)).optional(),
      requiredAncestryKeys: z.array(z.string().min(1)).optional(),
      requiredProficiencyKeys: z.array(z.string().min(1)).optional(),
      requiredTalentKeys: z.array(z.string().min(1)).optional(),

      requiresSpellcasting: z.boolean().optional(),
    })
    .passthrough();

  const characterProgressionChoicesSchema = z
    .array(
      z.object({
        classId: z.string().uuid("Invalid progression choice class id"),
        classLevel: z.number().int().min(1).max(20),
        choiceIndex: z.number().int().min(0).max(20),

        type: z.enum(["ATTRIBUTE_INCREASE", "TALENT"]).nullable(),

        attributeIncreaseMode: z.enum(["FOCUSED", "SPLIT"]).nullable(),

        attributeIncreases: characterProgressionAttributeIncreasesSchema,

        talentId: z
          .string()
          .uuid("Invalid progression choice talent id")
          .nullable(),
      }),
    )
    .max(100)
    .optional();

  type CharacterProgressionChoiceInput = NonNullable<
    z.infer<typeof characterProgressionChoicesSchema>
  >[number];

  type CharacterTalentPrerequisites = z.infer<
    typeof characterTalentPrerequisitesSchema
  >;

  type RequiredCharacterProgressionChoice = {
    classId: string;
    className: string;
    classLevel: number;
    choiceIndex: number;
  };

  function getCharacterProgressionChoiceIdentity(
    choice:
      | CharacterProgressionChoiceInput
      | RequiredCharacterProgressionChoice,
  ) {
    return `${choice.classId}:${choice.classLevel}:${choice.choiceIndex}`;
  }

  function normalizeCharacterProgressionChoices(
    progressionChoices: z.infer<typeof characterProgressionChoicesSchema>,
  ) {
    if (progressionChoices === undefined) {
      return {
        entries: [] as CharacterProgressionChoiceInput[],
        error: null as string | null,
      };
    }

    const choicesByIdentity = new Map<
      string,
      CharacterProgressionChoiceInput
    >();

    for (const choice of progressionChoices) {
      const identity = getCharacterProgressionChoiceIdentity(choice);

      if (choicesByIdentity.has(identity)) {
        return {
          entries: [] as CharacterProgressionChoiceInput[],
          error:
            `Duplicate progression choice for class ${choice.classId}, ` +
            `class level ${choice.classLevel}, choice index ${choice.choiceIndex}`,
        };
      }

      choicesByIdentity.set(identity, {
        ...choice,
        attributeIncreases: {
          ...choice.attributeIncreases,
        },
      });
    }

    const entries = Array.from(choicesByIdentity.values()).sort(
      (firstChoice, secondChoice) => {
        const classComparison = firstChoice.classId.localeCompare(
          secondChoice.classId,
        );

        if (classComparison !== 0) {
          return classComparison;
        }

        if (firstChoice.classLevel !== secondChoice.classLevel) {
          return firstChoice.classLevel - secondChoice.classLevel;
        }

        return firstChoice.choiceIndex - secondChoice.choiceIndex;
      },
    );

    return {
      entries,
      error: null as string | null,
    };
  }

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
    progressionChoices?: z.infer<typeof characterProgressionChoicesSchema>;
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

  type CharacterAttributeValueMap = Partial<
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

  function normalizeCharacterTalentPrerequisites(
    prerequisites: unknown,
  ): CharacterTalentPrerequisites {
    const parsedPrerequisites =
      characterTalentPrerequisitesSchema.safeParse(prerequisites);

    if (!parsedPrerequisites.success) {
      return {};
    }

    return parsedPrerequisites.data;
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

  async function validateRequiredCharacterProgressionChoices({
    systemId,
    classEntries,
    progressionChoices,
    wasProvided,
  }: {
    systemId: string;
    classEntries: CharacterClassEntryInput[];
    progressionChoices: CharacterProgressionChoiceInput[];
    wasProvided: boolean;
  }) {
    if (!wasProvided) {
      return null;
    }

    if (classEntries.length === 0) {
      if (progressionChoices.length > 0) {
        return "Progression choices require at least one character class";
      }

      return null;
    }

    const characterClasses = await prisma.characterClass.findMany({
      where: {
        systemId,
        id: {
          in: classEntries.map((classEntry) => classEntry.classId),
        },
      },
      select: {
        id: true,
        name: true,
        levelProgressions: {
          where: {
            progressionChoiceCount: {
              gt: 0,
            },
          },
          select: {
            level: true,
            progressionChoiceCount: true,
          },
          orderBy: {
            level: "asc",
          },
        },
      },
    });

    const classesById = new Map(
      characterClasses.map((characterClass) => [
        characterClass.id,
        characterClass,
      ]),
    );

    const requiredChoices: RequiredCharacterProgressionChoice[] = [];

    for (const classEntry of classEntries) {
      const characterClass = classesById.get(classEntry.classId);

      if (!characterClass) {
        return "Character class not found for this system";
      }

      const applicableProgressions = characterClass.levelProgressions.filter(
        (progression) => {
          return progression.level <= classEntry.level;
        },
      );

      for (const progression of applicableProgressions) {
        for (
          let choiceIndex = 0;
          choiceIndex < progression.progressionChoiceCount;
          choiceIndex += 1
        ) {
          requiredChoices.push({
            classId: characterClass.id,
            className: characterClass.name,
            classLevel: progression.level,
            choiceIndex,
          });
        }
      }
    }

    const requiredChoicesByIdentity = new Map(
      requiredChoices.map((choice) => [
        getCharacterProgressionChoiceIdentity(choice),
        choice,
      ]),
    );

    const providedChoicesByIdentity = new Map(
      progressionChoices.map((choice) => [
        getCharacterProgressionChoiceIdentity(choice),
        choice,
      ]),
    );

    const unexpectedChoice = progressionChoices.find((choice) => {
      const identity = getCharacterProgressionChoiceIdentity(choice);

      return !requiredChoicesByIdentity.has(identity);
    });

    if (unexpectedChoice) {
      return (
        `Unexpected progression choice for class ${unexpectedChoice.classId}, ` +
        `class level ${unexpectedChoice.classLevel}, ` +
        `choice index ${unexpectedChoice.choiceIndex}`
      );
    }

    const missingChoice = requiredChoices.find((choice) => {
      const identity = getCharacterProgressionChoiceIdentity(choice);

      return !providedChoicesByIdentity.has(identity);
    });

    if (missingChoice) {
      return (
        `Missing progression choice for class "${missingChoice.className}", ` +
        `class level ${missingChoice.classLevel}, ` +
        `choice index ${missingChoice.choiceIndex}`
      );
    }

    if (progressionChoices.length !== requiredChoices.length) {
      return (
        `This character requires ${requiredChoices.length} progression ` +
        `choice(s), but ${progressionChoices.length} were provided`
      );
    }

    return null;
  }

  function validateFocusedCharacterProgressionChoices(
    progressionChoices: CharacterProgressionChoiceInput[],
  ) {
    for (const choice of progressionChoices) {
      if (
        choice.type !== "ATTRIBUTE_INCREASE" ||
        choice.attributeIncreaseMode !== "FOCUSED"
      ) {
        continue;
      }

      const positiveAttributeIncreases = Object.entries(
        choice.attributeIncreases,
      ).filter(([, increaseValue]) => {
        return typeof increaseValue === "number" && increaseValue > 0;
      });

      const isValidFocusedIncrease =
        positiveAttributeIncreases.length === 1 &&
        positiveAttributeIncreases[0]?.[1] === 2;

      if (!isValidFocusedIncrease) {
        return (
          `Focused attribute increase for class ${choice.classId}, ` +
          `class level ${choice.classLevel}, ` +
          `choice index ${choice.choiceIndex} must grant exactly +2 ` +
          `to one attribute`
        );
      }
    }

    return null;
  }

  function validateSplitCharacterProgressionChoices(
    progressionChoices: CharacterProgressionChoiceInput[],
  ) {
    for (const choice of progressionChoices) {
      if (
        choice.type !== "ATTRIBUTE_INCREASE" ||
        choice.attributeIncreaseMode !== "SPLIT"
      ) {
        continue;
      }

      const positiveAttributeIncreases = Object.entries(
        choice.attributeIncreases,
      ).filter(([, increaseValue]) => {
        return typeof increaseValue === "number" && increaseValue > 0;
      });

      const isValidSplitIncrease =
        positiveAttributeIncreases.length === 2 &&
        positiveAttributeIncreases.every(([, increaseValue]) => {
          return increaseValue === 1;
        });

      if (!isValidSplitIncrease) {
        return (
          `Split attribute increase for class ${choice.classId}, ` +
          `class level ${choice.classLevel}, ` +
          `choice index ${choice.choiceIndex} must grant exactly +1 ` +
          `to two different attributes`
        );
      }
    }

    return null;
  }

  function validateResolvedCharacterProgressionChoices(
    progressionChoices: CharacterProgressionChoiceInput[],
  ) {
    for (const choice of progressionChoices) {
      if (choice.type === null) {
        return (
          `Progression choice for class ${choice.classId}, ` +
          `class level ${choice.classLevel}, ` +
          `choice index ${choice.choiceIndex} is still pending`
        );
      }

      const positiveAttributeIncreases = Object.entries(
        choice.attributeIncreases,
      ).filter(([, increaseValue]) => {
        return typeof increaseValue === "number" && increaseValue > 0;
      });

      if (choice.type === "ATTRIBUTE_INCREASE") {
        if (choice.attributeIncreaseMode === null) {
          return (
            `Attribute increase for class ${choice.classId}, ` +
            `class level ${choice.classLevel}, ` +
            `choice index ${choice.choiceIndex} must include an increase mode`
          );
        }

        if (choice.talentId !== null) {
          return (
            `Attribute increase for class ${choice.classId}, ` +
            `class level ${choice.classLevel}, ` +
            `choice index ${choice.choiceIndex} cannot include a talent`
          );
        }

        continue;
      }

      if (choice.attributeIncreaseMode !== null) {
        return (
          `Talent choice for class ${choice.classId}, ` +
          `class level ${choice.classLevel}, ` +
          `choice index ${choice.choiceIndex} cannot include an ` +
          `attribute increase mode`
        );
      }

      if (positiveAttributeIncreases.length > 0) {
        return (
          `Talent choice for class ${choice.classId}, ` +
          `class level ${choice.classLevel}, ` +
          `choice index ${choice.choiceIndex} cannot include ` +
          `attribute increases`
        );
      }

      if (!choice.talentId) {
        return (
          `Talent choice for class ${choice.classId}, ` +
          `class level ${choice.classLevel}, ` +
          `choice index ${choice.choiceIndex} must include a talent`
        );
      }
    }

    return null;
  }

  async function validateCharacterProgressionTalents({
    systemId,
    progressionChoices,
  }: {
    systemId: string;
    progressionChoices: CharacterProgressionChoiceInput[];
  }) {
    const talentChoices = progressionChoices.filter((choice) => {
      return choice.type === "TALENT";
    });

    if (talentChoices.length === 0) {
      return null;
    }

    const choiceWithoutTalent = talentChoices.find((choice) => {
      return !choice.talentId;
    });

    if (choiceWithoutTalent) {
      return (
        `Talent progression choice for class ${choiceWithoutTalent.classId}, ` +
        `class level ${choiceWithoutTalent.classLevel}, ` +
        `choice index ${choiceWithoutTalent.choiceIndex} must include a talent`
      );
    }

    const talentIds = Array.from(
      new Set(
        talentChoices
          .map((choice) => choice.talentId)
          .filter((talentId): talentId is string => {
            return Boolean(talentId);
          }),
      ),
    );

    const talents = await prisma.talent.findMany({
      where: {
        systemId,
        id: {
          in: talentIds,
        },
      },
      select: {
        id: true,
        name: true,
        isRepeatable: true,
      },
    });

    const talentsById = new Map(talents.map((talent) => [talent.id, talent]));

    const existingTalentIds = new Set(talentsById.keys());

    const invalidTalentChoice = talentChoices.find((choice) => {
      return (
        typeof choice.talentId === "string" &&
        !existingTalentIds.has(choice.talentId)
      );
    });

    if (invalidTalentChoice) {
      return (
        `Talent ${invalidTalentChoice.talentId} was not found ` +
        `for this character system`
      );
    }

    const talentSelectionCountById = new Map<string, number>();

    for (const choice of talentChoices) {
      if (!choice.talentId) {
        continue;
      }

      talentSelectionCountById.set(
        choice.talentId,
        (talentSelectionCountById.get(choice.talentId) ?? 0) + 1,
      );
    }

    for (const [
      talentId,
      selectionCount,
    ] of talentSelectionCountById.entries()) {
      if (selectionCount <= 1) {
        continue;
      }

      const talent = talentsById.get(talentId);

      if (!talent || talent.isRepeatable) {
        continue;
      }

      return (
        `Talent "${talent.name}" cannot be selected more than once. ` +
        `It was selected ${selectionCount} times`
      );
    }

    return null;
  }

  async function validateCharacterProgressionTalentPrerequisites({
    systemId,
    characterLevel,
    classEntries,
    ancestryId,
    attributes,
    progressionChoices,
  }: {
    systemId: string;
    characterLevel: number;
    classEntries: CharacterClassEntryInput[];
    ancestryId: string | null;
    attributes: CharacterAttributeValueMap;
    progressionChoices: CharacterProgressionChoiceInput[];
  }) {
    const talentChoices = progressionChoices.filter(
      (
        choice,
      ): choice is CharacterProgressionChoiceInput & {
        type: "TALENT";
        talentId: string;
      } => {
        return choice.type === "TALENT" && Boolean(choice.talentId);
      },
    );

    if (talentChoices.length === 0) {
      return null;
    }

    const selectedTalentIds = Array.from(
      new Set(talentChoices.map((choice) => choice.talentId)),
    );

    const selectedClassIds = Array.from(
      new Set(classEntries.map((classEntry) => classEntry.classId)),
    );

    const selectedSubclassIds = Array.from(
      new Set(
        classEntries
          .map((classEntry) => classEntry.subclassId)
          .filter((subclassId): subclassId is string => {
            return Boolean(subclassId);
          }),
      ),
    );

    const [talents, characterClasses, subclasses, ancestry] = await Promise.all(
      [
        prisma.talent.findMany({
          where: {
            systemId,
            id: {
              in: selectedTalentIds,
            },
          },
          select: {
            id: true,
            key: true,
            name: true,
            prerequisites: true,
          },
        }),

        selectedClassIds.length > 0
          ? prisma.characterClass.findMany({
              where: {
                systemId,
                id: {
                  in: selectedClassIds,
                },
              },
              select: {
                id: true,
                key: true,
                spellcastingAbilityKey: true,
              },
            })
          : Promise.resolve([]),

        selectedSubclassIds.length > 0
          ? prisma.characterSubclass.findMany({
              where: {
                systemId,
                id: {
                  in: selectedSubclassIds,
                },
              },
              select: {
                id: true,
                key: true,
              },
            })
          : Promise.resolve([]),

        ancestryId
          ? prisma.ancestry.findFirst({
              where: {
                id: ancestryId,
                systemId,
              },
              select: {
                id: true,
                key: true,
              },
            })
          : Promise.resolve(null),
      ],
    );

    const talentsById = new Map(talents.map((talent) => [talent.id, talent]));

    const selectedClassKeys = new Set(
      characterClasses.map((characterClass) => characterClass.key),
    );

    const selectedSubclassKeys = new Set(
      subclasses.map((subclass) => subclass.key),
    );

    const hasSpellcastingClass = characterClasses.some((characterClass) => {
      return characterClass.spellcastingAbilityKey !== null;
    });

    for (const talentChoice of talentChoices) {
      const talent = talentsById.get(talentChoice.talentId);

      if (!talent) {
        continue;
      }

      const prerequisites = normalizeCharacterTalentPrerequisites(
        talent.prerequisites,
      );

      if (
        prerequisites.minimumCharacterLevel !== undefined &&
        characterLevel < prerequisites.minimumCharacterLevel
      ) {
        return (
          `Talent "${talent.name}" requires character level ` +
          `${prerequisites.minimumCharacterLevel} or higher`
        );
      }

      for (const [attributeKey, minimumValue] of Object.entries(
        prerequisites.minimumAttributes ?? {},
      )) {
        if (
          !isCharacterAttributeKey(attributeKey) ||
          typeof minimumValue !== "number"
        ) {
          continue;
        }

        const currentValue = attributes[attributeKey];

        if (typeof currentValue !== "number" || currentValue < minimumValue) {
          return (
            `Talent "${talent.name}" requires attribute ` +
            `${attributeKey} ${minimumValue} or higher`
          );
        }
      }

      for (const requiredClassKey of prerequisites.requiredClassKeys ?? []) {
        if (!selectedClassKeys.has(requiredClassKey)) {
          return (
            `Talent "${talent.name}" requires class ` + `"${requiredClassKey}"`
          );
        }
      }

      for (const requiredSubclassKey of prerequisites.requiredSubclassKeys ??
        []) {
        if (!selectedSubclassKeys.has(requiredSubclassKey)) {
          return (
            `Talent "${talent.name}" requires subclass ` +
            `"${requiredSubclassKey}"`
          );
        }
      }

      for (const requiredAncestryKey of prerequisites.requiredAncestryKeys ??
        []) {
        if (ancestry?.key !== requiredAncestryKey) {
          return (
            `Talent "${talent.name}" requires ancestry ` +
            `"${requiredAncestryKey}"`
          );
        }
      }

      const otherSelectedTalentKeys = new Set(
        talentChoices
          .filter((otherChoice) => {
            return (
              getCharacterProgressionChoiceIdentity(otherChoice) !==
              getCharacterProgressionChoiceIdentity(talentChoice)
            );
          })
          .map((otherChoice) => {
            return talentsById.get(otherChoice.talentId)?.key ?? null;
          })
          .filter((talentKey): talentKey is string => {
            return Boolean(talentKey);
          }),
      );

      for (const requiredTalentKey of prerequisites.requiredTalentKeys ?? []) {
        if (!otherSelectedTalentKeys.has(requiredTalentKey)) {
          return (
            `Talent "${talent.name}" requires talent ` +
            `"${requiredTalentKey}"`
          );
        }
      }

      if (
        prerequisites.requiresSpellcasting !== undefined &&
        hasSpellcastingClass !== prerequisites.requiresSpellcasting
      ) {
        return prerequisites.requiresSpellcasting
          ? `Talent "${talent.name}" requires spellcasting`
          : `Talent "${talent.name}" cannot be selected by a spellcaster`;
      }
    }

    return null;
  }
  async function getCharacterProgressionAttributeBonuses({
    systemId,
    progressionChoices,
  }: {
    systemId: string;
    progressionChoices: CharacterProgressionChoiceInput[];
  }) {
    const progressionAttributeBonuses =
      progressionChoices.reduce<CharacterAttributeBonusMap>(
        (currentBonuses, choice) => {
          if (choice.type !== "ATTRIBUTE_INCREASE") {
            return currentBonuses;
          }

          return mergeAttributeBonusMaps(
            currentBonuses,
            normalizeAttributeBonusMap(choice.attributeIncreases),
          );
        },
        {},
      );

    const talentChoices = progressionChoices.filter(
      (
        choice,
      ): choice is CharacterProgressionChoiceInput & {
        type: "TALENT";
        talentId: string;
      } => {
        return choice.type === "TALENT" && Boolean(choice.talentId);
      },
    );

    const uniqueTalentIds = Array.from(
      new Set(talentChoices.map((choice) => choice.talentId)),
    );

    const talents =
      uniqueTalentIds.length > 0
        ? await prisma.talent.findMany({
            where: {
              systemId,
              id: {
                in: uniqueTalentIds,
              },
            },
            select: {
              id: true,
              attributeBonuses: true,
            },
          })
        : [];

    const talentsById = new Map(talents.map((talent) => [talent.id, talent]));

    const talentAttributeBonuses = mergeAttributeBonusMaps(
      ...talentChoices.map((choice) => {
        const talent = talentsById.get(choice.talentId);

        return normalizeAttributeBonusMap(talent?.attributeBonuses);
      }),
    );

    return mergeAttributeBonusMaps(
      progressionAttributeBonuses,
      talentAttributeBonuses,
    );
  }

  async function validateCharacterProgressionAttributeMaximum({
    systemId,
    attributes,
    sourceAttributeBonuses,
    progressionChoices,
  }: {
    systemId: string;
    attributes: CharacterAttributeValueMap;
    sourceAttributeBonuses: CharacterAttributeBonusMap;
    progressionChoices: CharacterProgressionChoiceInput[];
  }) {
    const progressionAttributeBonuses =
      await getCharacterProgressionAttributeBonuses({
        systemId,
        progressionChoices,
      });

    const consolidatedAttributeBonuses = mergeAttributeBonusMaps(
      sourceAttributeBonuses,
      progressionAttributeBonuses,
    );

    for (const [attributeKey, baseValue] of Object.entries(attributes)) {
      if (
        !isCharacterAttributeKey(attributeKey) ||
        typeof baseValue !== "number"
      ) {
        continue;
      }

      const finalValue =
        baseValue + (consolidatedAttributeBonuses[attributeKey] ?? 0);

      if (finalValue > 20) {
        return (
          `Attribute ${attributeKey} cannot exceed 20 through standard ` +
          `progression bonuses. Received final value ${finalValue}`
        );
      }
    }

    return null;
  }

  function getAttributeModifier(value: number | null | undefined) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return 0;
    }

    return Math.floor((value - 10) / 2);
  }

  function getProficiencyBonusByCharacterLevel(
    level: number | null | undefined,
  ) {
    const safeLevel = normalizeCharacterLevel(level);

    return 2 + Math.floor((safeLevel - 1) / 4);
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
  };

  function getCharacterSheetClassFeatureSources(
    characterSheet: CharacterSheetFeatureSource & {
      classes?: CharacterSheetClassFeatureSource[];
    },
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
    characterSheet: CharacterSheetFeatureSource & {
      classes?: CharacterSheetClassFeatureSource[];
    },
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

  async function getFeaturesUnlockedForClassAtLevel({
    systemId,
    classId,
    subclassId,
    targetClassLevel,
  }: {
    systemId: string;
    classId: string;
    subclassId: string | null;
    targetClassLevel: number;
  }) {
    const featureConditions: Prisma.FeatureWhereInput[] = [
      {
        classId,
        subclassId: null,
        level: targetClassLevel,
      },
    ];

    if (subclassId) {
      featureConditions.push({
        subclassId,
        level: targetClassLevel,
      });
    }

    return prisma.feature.findMany({
      where: {
        systemId,
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

  async function getFeatureChoiceGroupsUnlockedForClassAtLevel({
    systemId,
    classId,
    subclassId,
    targetClassLevel,
  }: {
    systemId: string;
    classId: string;
    subclassId: string | null;
    targetClassLevel: number;
  }) {
    return prisma.featureChoiceGroup.findMany({
      where: {
        systemId,
        levelProgression: {
          classId,
          level: targetClassLevel,
        },
        AND: [
          {
            OR: [{ classId: null }, { classId }],
          },
          {
            OR: [
              { subclassId: null },
              ...(subclassId ? [{ subclassId }] : []),
            ],
          },
        ],
      },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        choiceCount: true,
        order: true,
        classId: true,
        subclassId: true,
        levelProgressionId: true,
        options: {
          select: {
            id: true,
            order: true,
            feature: {
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
            },
          },
          orderBy: {
            order: "asc",
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
  }

  function getSpellSlotPlanEntries(
    progression:
      | {
          spellSlotsLevel1: number;
          spellSlotsLevel2: number;
          spellSlotsLevel3: number;
          spellSlotsLevel4: number;
          spellSlotsLevel5: number;
          spellSlotsLevel6: number;
          spellSlotsLevel7: number;
          spellSlotsLevel8: number;
          spellSlotsLevel9: number;
        }
      | null
      | undefined,
  ) {
    if (!progression) {
      return [];
    }

    return [
      { spellLevel: 1, total: progression.spellSlotsLevel1 },
      { spellLevel: 2, total: progression.spellSlotsLevel2 },
      { spellLevel: 3, total: progression.spellSlotsLevel3 },
      { spellLevel: 4, total: progression.spellSlotsLevel4 },
      { spellLevel: 5, total: progression.spellSlotsLevel5 },
      { spellLevel: 6, total: progression.spellSlotsLevel6 },
      { spellLevel: 7, total: progression.spellSlotsLevel7 },
      { spellLevel: 8, total: progression.spellSlotsLevel8 },
      { spellLevel: 9, total: progression.spellSlotsLevel9 },
    ].filter((slotEntry) => slotEntry.total > 0);
  }

  async function getLevelUpChoiceOptions({
    characterSheetId,
    systemId,
    classId,
    nextClassLevel,
    requiresSubclassChoice,
    progressionChoiceCount,
    cantripsKnownIncrease,
    spellsKnownIncrease,
    currentAttributes,
  }: {
    characterSheetId: string;
    systemId: string;
    classId: string;
    nextClassLevel: number;
    requiresSubclassChoice: boolean;
    progressionChoiceCount: number;
    cantripsKnownIncrease: number;
    spellsKnownIncrease: number;
    currentAttributes: CharacterAttributeValueMap;
  }) {
    const [characterClass, talents, selectedTalents, knownClassSpells] =
      await Promise.all([
        prisma.characterClass.findFirst({
          where: {
            id: classId,
            systemId,
          },
          select: {
            subclasses: {
              select: {
                id: true,
                key: true,
                name: true,
                description: true,
                classId: true,
                order: true,
              },
              orderBy: [{ order: "asc" }, { name: "asc" }],
            },
            classSpells: {
              where: {
                minimumClassLevel: {
                  lte: nextClassLevel,
                },
              },
              select: {
                minimumClassLevel: true,
                isAlwaysKnown: true,
                spell: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                    description: true,
                    level: true,
                    school: true,
                    castingTime: true,
                    range: true,
                    duration: true,
                    components: true,
                    isRitual: true,
                    requiresConcentration: true,
                    order: true,
                  },
                },
              },
              orderBy: [
                {
                  spell: {
                    level: "asc",
                  },
                },
                {
                  spell: {
                    order: "asc",
                  },
                },
                {
                  spell: {
                    name: "asc",
                  },
                },
              ],
            },
          },
        }),

        progressionChoiceCount > 0
          ? prisma.talent.findMany({
              where: {
                systemId,
              },
              select: {
                id: true,
                key: true,
                name: true,
                description: true,
                isRepeatable: true,
                prerequisites: true,
                attributeBonuses: true,
                order: true,
              },
              orderBy: [{ order: "asc" }, { name: "asc" }],
            })
          : Promise.resolve([]),

        progressionChoiceCount > 0
          ? prisma.characterSheetProgressionChoice.findMany({
              where: {
                characterSheetId,
                talentId: {
                  not: null,
                },
              },
              select: {
                talentId: true,
              },
            })
          : Promise.resolve([]),

        cantripsKnownIncrease > 0 || spellsKnownIncrease > 0
          ? prisma.characterSheetSpell.findMany({
              where: {
                characterSheetId,
                classId,
              },
              select: {
                spellId: true,
              },
            })
          : Promise.resolve([]),
      ]);

    const selectedTalentIds = selectedTalents
      .map((choice) => choice.talentId)
      .filter((talentId): talentId is string => Boolean(talentId));

    const selectedTalentCountById = new Map<string, number>();

    for (const talentId of selectedTalentIds) {
      selectedTalentCountById.set(
        talentId,
        (selectedTalentCountById.get(talentId) ?? 0) + 1,
      );
    }

    const talentOptions = talents.map((talent) => {
      const selectedCount = selectedTalentCountById.get(talent.id) ?? 0;
      const isAlreadySelected = selectedCount > 0;
      const isSelectable = talent.isRepeatable || !isAlreadySelected;

      return {
        ...talent,
        prerequisites: normalizeCharacterTalentPrerequisites(
          talent.prerequisites,
        ),
        attributeBonuses: normalizeAttributeBonusMap(talent.attributeBonuses),
        selectedCount,
        isAlreadySelected,
        isSelectable,
        blockedReason: isSelectable
          ? null
          : "Este talento já foi escolhido e não pode ser repetido.",
      };
    });

    const knownSpellIds = new Set(
      knownClassSpells.map((knownSpell) => knownSpell.spellId),
    );

    const availableSpellEntries = (characterClass?.classSpells ?? []).filter(
      (classSpell) => !knownSpellIds.has(classSpell.spell.id),
    );

    const cantripOptions = availableSpellEntries
      .filter((classSpell) => classSpell.spell.level === 0)
      .map((classSpell) => ({
        ...classSpell.spell,
        minimumClassLevel: classSpell.minimumClassLevel,
        isAlwaysKnown: classSpell.isAlwaysKnown,
      }));

    const spellOptions = availableSpellEntries
      .filter((classSpell) => classSpell.spell.level > 0)
      .map((classSpell) => ({
        ...classSpell.spell,
        minimumClassLevel: classSpell.minimumClassLevel,
        isAlwaysKnown: classSpell.isAlwaysKnown,
      }));

    return {
      subclass: {
        required: requiresSubclassChoice,
        options: characterClass?.subclasses ?? [],
      },

      progression: {
        requiredChoiceCount: progressionChoiceCount,
        currentAttributes,
        talents: talentOptions,
      },

      featureChoices: {
        // Os grupos e suas opções continuam no featureChoicesPlan.
        usesFeatureChoicesPlan: true,
      },

      spells: {
        requiredCantripCount: Math.max(0, cantripsKnownIncrease),
        requiredSpellCount: Math.max(0, spellsKnownIncrease),
        cantrips: cantripOptions,
        spells: spellOptions,
      },
    };
  }

  async function getLevelUpPreviewsForCharacterSheet(
    characterSheet: CharacterSheetFeatureSource & {
      id: string;
      classes?: Array<{
        id: string;
        classId: string;
        subclassId: string | null;
        level: number;
        isPrimary: boolean;
        characterClass: {
          id: string;
          name: string;
          hitDie: number | null;
          subclassSelectionLevel: number | null;
          levelProgressions: Array<{
            level: number;
            proficiencyBonus: number | null;
            progressionChoiceCount: number;
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
            spellLimits: Array<{
              spellLevel: number;
              spellsKnown: number;
              spellsPrepared: number;
            }>;
          }>;
        };
        subclass: {
          id: string;
          name: string;
        } | null;
      }>;
      hitPoints: number;
      maxHitPoints: number;
      stats: Array<{
        baseValue: number;
        bonusValue: number | null;
        overrideValue: number | null;
        stat: {
          key: string;
        };
      }>;
    },
  ) {
    const classEntries = characterSheet.classes ?? [];

    const constitutionStat =
      characterSheet.stats.find((sheetStat) => {
        return sheetStat.stat.key === "constitution";
      }) ?? null;

    const constitutionValue = constitutionStat
      ? (constitutionStat.overrideValue ??
        constitutionStat.baseValue + (constitutionStat.bonusValue ?? 0))
      : null;

    const constitutionModifier = getAttributeModifier(constitutionValue);

    const currentAttributes = characterSheet.stats.reduce<CharacterAttributeValueMap>(
      (attributeMap, sheetStat) => {
        const statKey = sheetStat.stat.key;

        if (!isCharacterAttributeKey(statKey)) {
          return attributeMap;
        }

        attributeMap[statKey] =
          sheetStat.overrideValue ??
          sheetStat.baseValue + (sheetStat.bonusValue ?? 0);

        return attributeMap;
      },
      {},
    );

    return Promise.all(
      classEntries.map(async (classEntry) => {
        const currentCharacterLevel = characterSheet.level;
        const nextCharacterLevel = currentCharacterLevel + 1;

        const currentProficiencyBonus =
          getProficiencyBonusByCharacterLevel(currentCharacterLevel);

        const nextProficiencyBonus =
          getProficiencyBonusByCharacterLevel(nextCharacterLevel);

        const proficiencyPlan = {
          currentCharacterLevel,
          nextCharacterLevel,
          currentProficiencyBonus,
          nextProficiencyBonus,
          bonusIncrease: nextProficiencyBonus - currentProficiencyBonus,
          hasChanged: nextProficiencyBonus !== currentProficiencyBonus,
        };

        const currentClassLevel = classEntry.level;
        const nextClassLevel = currentClassLevel + 1;

        const currentProgression =
          classEntry.characterClass.levelProgressions.find(
            (progression) => progression.level === currentClassLevel,
          ) ?? null;

        const nextProgression =
          classEntry.characterClass.levelProgressions.find(
            (progression) => progression.level === nextClassLevel,
          ) ?? null;

        const currentSpellSlots = getSpellSlotPlanEntries(currentProgression);
        const nextSpellSlots = getSpellSlotPlanEntries(nextProgression);

        const currentCantripsKnown = currentProgression?.cantripsKnown ?? 0;
        const nextCantripsKnown = nextProgression?.cantripsKnown ?? 0;

        const currentSpellsKnown = currentProgression?.spellsKnown ?? 0;
        const nextSpellsKnown = nextProgression?.spellsKnown ?? 0;

        const currentSpellsPrepared = currentProgression?.spellsPrepared ?? 0;
        const nextSpellsPrepared = nextProgression?.spellsPrepared ?? 0;

        const hasSpellSlotChanges =
          JSON.stringify(currentSpellSlots) !== JSON.stringify(nextSpellSlots);

        const spellcastingPlan = {
          currentClassLevel,
          nextClassLevel,

          currentCantripsKnown,
          nextCantripsKnown,
          cantripsKnownIncrease: nextCantripsKnown - currentCantripsKnown,

          currentSpellsKnown,
          nextSpellsKnown,
          spellsKnownIncrease: nextSpellsKnown - currentSpellsKnown,

          currentSpellsPrepared,
          nextSpellsPrepared,
          spellsPreparedIncrease:
            nextSpellsPrepared - currentSpellsPrepared,

          currentSpellSlots,
          nextSpellSlots,

          hasSpellcastingChanges:
            currentCantripsKnown !== nextCantripsKnown ||
            currentSpellsKnown !== nextSpellsKnown ||
            currentSpellsPrepared !== nextSpellsPrepared ||
            hasSpellSlotChanges,
        };

        const newFeatures = await getFeaturesUnlockedForClassAtLevel({
          systemId: characterSheet.systemId,
          classId: classEntry.classId,
          subclassId: classEntry.subclassId,
          targetClassLevel: nextClassLevel,
        });

        const featuresPlan = {
          currentClassLevel,
          nextClassLevel,
          unlockedFeatures: newFeatures,
          unlockedFeatureCount: newFeatures.length,
          hasUnlockedFeatures: newFeatures.length > 0,
        };

        const unlockedFeatureChoiceGroups =
          await getFeatureChoiceGroupsUnlockedForClassAtLevel({
            systemId: characterSheet.systemId,
            classId: classEntry.classId,
            subclassId: classEntry.subclassId,
            targetClassLevel: nextClassLevel,
          });

        const pendingFeatureChoiceCount = unlockedFeatureChoiceGroups.reduce(
          (currentTotal, choiceGroup) => {
            return currentTotal + Math.max(0, choiceGroup.choiceCount);
          },
          0,
        );

        const featureChoicesPlan = {
          currentClassLevel,
          nextClassLevel,
          unlockedChoiceGroups: unlockedFeatureChoiceGroups,
          unlockedChoiceGroupCount: unlockedFeatureChoiceGroups.length,
          pendingChoiceCount: pendingFeatureChoiceCount,
          requiresFeatureChoices: pendingFeatureChoiceCount > 0,
        };

        const subclassSelectionLevel =
          classEntry.characterClass.subclassSelectionLevel ?? null;

        const isSubclassChoiceAvailable =
          typeof subclassSelectionLevel === "number" &&
          nextClassLevel >= subclassSelectionLevel;

        const isSubclassChoicePending =
          isSubclassChoiceAvailable && !classEntry.subclass;

        const subclassPlan = {
          currentClassLevel,
          nextClassLevel,
          subclassSelectionLevel,
          currentSubclass: classEntry.subclass,
          isSubclassChoiceAvailable,
          isSubclassChoicePending,
          requiresSubclassChoice: isSubclassChoicePending,
        };

        const unlockedChoiceCount = Math.max(
          0,
          nextProgression?.progressionChoiceCount ?? 0,
        );

        const pendingChoices = Array.from(
          { length: unlockedChoiceCount },
          (_, choiceIndex) => ({
            classEntryId: classEntry.id,
            classId: classEntry.classId,
            className: classEntry.characterClass.name,
            classLevel: nextClassLevel,
            choiceIndex,
          }),
        );

        const progressionChoicesPlan = {
          currentClassLevel,
          nextClassLevel,
          unlockedChoiceCount,
          requiresProgressionChoices: unlockedChoiceCount > 0,
          pendingChoices,
        };

        const choiceOptions = await getLevelUpChoiceOptions({
          characterSheetId: characterSheet.id,
          systemId: characterSheet.systemId,
          classId: classEntry.classId,
          nextClassLevel,
          requiresSubclassChoice: subclassPlan.requiresSubclassChoice,
          progressionChoiceCount: unlockedChoiceCount,
          cantripsKnownIncrease: spellcastingPlan.cantripsKnownIncrease,
          spellsKnownIncrease: spellcastingPlan.spellsKnownIncrease,
          currentAttributes,
        });

        const hitDie = classEntry.characterClass.hitDie;

        const hitPointGain =
          typeof hitDie === "number" && hitDie > 0
            ? Math.max(1, hitDie + constitutionModifier)
            : null;

        const hitPointsPlan =
          hitPointGain === null
            ? null
            : {
                currentHitPoints: characterSheet.hitPoints,
                currentMaxHitPoints: characterSheet.maxHitPoints,
                hitDie,
                constitutionValue,
                constitutionModifier,
                hitPointGain,
                nextHitPoints: characterSheet.hitPoints + hitPointGain,
                nextMaxHitPoints: characterSheet.maxHitPoints + hitPointGain,
              };

        const pendingSubclassChoiceCount =
          subclassPlan.requiresSubclassChoice ? 1 : 0;

        const pendingProgressionChoiceCount =
          progressionChoicesPlan.unlockedChoiceCount;

        const totalPendingChoiceCount =
          pendingSubclassChoiceCount +
          featureChoicesPlan.pendingChoiceCount +
          pendingProgressionChoiceCount;

        const levelUpPlan = {
          currentCharacterLevel,
          nextCharacterLevel,
          currentClassLevel,
          nextClassLevel,

          classEntry: {
            id: classEntry.id,
            classId: classEntry.classId,
            className: classEntry.characterClass.name,
            subclass: classEntry.subclass,
            isPrimary: classEntry.isPrimary,
          },

          canPreviewNextLevel:
            nextCharacterLevel <= 20 &&
            nextClassLevel <= 20 &&
            Boolean(nextProgression),

          hitPoints: hitPointsPlan,
          proficiency: proficiencyPlan,
          features: featuresPlan,
          featureChoices: featureChoicesPlan,
          spellcasting: spellcastingPlan,
          subclass: subclassPlan,
          progressionChoices: progressionChoicesPlan,
          choiceOptions,

          requirements: {
            requiresSubclassChoice: subclassPlan.requiresSubclassChoice,
            requiresFeatureChoices: featureChoicesPlan.requiresFeatureChoices,
            requiresProgressionChoices:
              progressionChoicesPlan.requiresProgressionChoices,

            pendingSubclassChoiceCount,
            pendingFeatureChoiceCount: featureChoicesPlan.pendingChoiceCount,
            pendingProgressionChoiceCount,
            totalPendingChoiceCount,

            hasPendingChoices: totalPendingChoiceCount > 0,
          },
        };

        return {
          classEntryId: classEntry.id,
          classId: classEntry.classId,
          className: classEntry.characterClass.name,
          subclass: classEntry.subclass,
          isPrimary: classEntry.isPrimary,

          currentCharacterLevel,
          nextCharacterLevel,

          currentClassLevel,
          nextClassLevel,

          currentProgression,
          nextProgression,
          newFeatures,
          hitPointsPlan,
          proficiencyPlan,
          featuresPlan,
          featureChoicesPlan,
          spellcastingPlan,
          subclassPlan,
          progressionChoicesPlan,
          choiceOptions,
          levelUpPlan,

          subclassSelectionLevel,
          isSubclassChoiceAvailable,
          isSubclassChoicePending,

          canPreviewNextLevel:
            nextCharacterLevel <= 20 &&
            nextClassLevel <= 20 &&
            Boolean(nextProgression),
        };
      }),
    );
  }

  async function withAvailableFeatures<
    T extends CharacterSheetFeatureSource & {
      id: string;
      classes?: Array<
        CharacterSheetClassFeatureSource & {
          id: string;
          isPrimary: boolean;
          characterClass: {
            id: string;
            name: string;
            hitDie: number | null;
            subclassSelectionLevel: number | null;
            levelProgressions: Array<{
              level: number;
              proficiencyBonus: number | null;
              progressionChoiceCount: number;
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
              spellLimits: Array<{
                spellLevel: number;
                spellsKnown: number;
                spellsPrepared: number;
              }>;
            }>;
          };
          subclass: {
            id: string;
            name: string;
          } | null;
        }
      >;
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
      hitPoints: number;
      maxHitPoints: number;
      stats: Array<{
        baseValue: number;
        bonusValue: number | null;
        overrideValue: number | null;
        stat: {
          key: string;
        };
      }>;
    },
  >(characterSheet: T) {
    const features =
      await getAvailableFeaturesForCharacterSheet(characterSheet);

    const levelUpPreviews =
      await getLevelUpPreviewsForCharacterSheet(characterSheet);

    return {
      ...characterSheet,
      features,
      levelUpPreviews,
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

  async function upsertCharacterSheetProgressionChoices(
    characterSheetId: string,
    entries: CharacterProgressionChoiceInput[],
  ) {
    if (entries.length === 0) {
      return;
    }

    await prisma.$transaction(
      entries.map((choice) =>
        prisma.characterSheetProgressionChoice.upsert({
          where: {
            characterSheetId_classId_classLevel_choiceIndex: {
              characterSheetId,
              classId: choice.classId,
              classLevel: choice.classLevel,
              choiceIndex: choice.choiceIndex,
            },
          },
          create: {
            characterSheetId,
            classId: choice.classId,
            classLevel: choice.classLevel,
            choiceIndex: choice.choiceIndex,
            type: choice.type,
            attributeIncreaseMode: choice.attributeIncreaseMode,
            attributeIncreases:
              choice.attributeIncreases as Prisma.InputJsonValue,
            talentId: choice.talentId,
          },
          update: {
            type: choice.type,
            attributeIncreaseMode: choice.attributeIncreaseMode,
            attributeIncreases:
              choice.attributeIncreases as Prisma.InputJsonValue,
            talentId: choice.talentId,
          },
        }),
      ),
    );
  }

  async function removeObsoleteCharacterSheetProgressionChoices(
    characterSheetId: string,
    entries: CharacterProgressionChoiceInput[],
  ) {
    if (entries.length === 0) {
      await prisma.characterSheetProgressionChoice.deleteMany({
        where: {
          characterSheetId,
        },
      });

      return;
    }

    await prisma.characterSheetProgressionChoice.deleteMany({
      where: {
        characterSheetId,
        NOT: {
          OR: entries.map((choice) => ({
            classId: choice.classId,
            classLevel: choice.classLevel,
            choiceIndex: choice.choiceIndex,
          })),
        },
      },
    });
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
    progressionChoices: {
      include: {
        characterClass: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        talent: true,
      },
      orderBy: [
        {
          classId: "asc",
        },
        {
          classLevel: "asc",
        },
        {
          choiceIndex: "asc",
        },
      ],
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
          progressionChoices: characterProgressionChoicesSchema,
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
        progressionChoices,
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

      const normalizedProgressionChoicesResult =
        normalizeCharacterProgressionChoices(progressionChoices);

      if (normalizedProgressionChoicesResult.error) {
        return reply.status(400).send({
          message: normalizedProgressionChoicesResult.error,
        });
      }

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

      const progressionChoicesValidationError =
        await validateRequiredCharacterProgressionChoices({
          systemId,
          classEntries: normalizedClassEntriesResult.entries,
          progressionChoices: normalizedProgressionChoicesResult.entries,
          wasProvided: progressionChoices !== undefined,
        });

      if (progressionChoicesValidationError) {
        return reply.status(400).send({
          message: progressionChoicesValidationError,
        });
      }

      const focusedProgressionChoicesValidationError =
        validateFocusedCharacterProgressionChoices(
          normalizedProgressionChoicesResult.entries,
        );

      if (focusedProgressionChoicesValidationError) {
        return reply.status(400).send({
          message: focusedProgressionChoicesValidationError,
        });
      }

      const splitProgressionChoicesValidationError =
        validateSplitCharacterProgressionChoices(
          normalizedProgressionChoicesResult.entries,
        );

      if (splitProgressionChoicesValidationError) {
        return reply.status(400).send({
          message: splitProgressionChoicesValidationError,
        });
      }

      const progressionTalentsValidationError =
        await validateCharacterProgressionTalents({
          systemId,
          progressionChoices: normalizedProgressionChoicesResult.entries,
        });

      if (progressionTalentsValidationError) {
        return reply.status(400).send({
          message: progressionTalentsValidationError,
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

      const progressionAttributeBonuses =
        await getCharacterProgressionAttributeBonuses({
          systemId,
          progressionChoices: normalizedProgressionChoicesResult.entries,
        });

      const consolidatedAttributeBonuses = mergeAttributeBonusMaps(
        sourceAttributeBonuses,
        progressionAttributeBonuses,
      );

      const progressionAttributeMaximumError =
        await validateCharacterProgressionAttributeMaximum({
          systemId,
          attributes: attributes ?? {},
          sourceAttributeBonuses,
          progressionChoices: normalizedProgressionChoicesResult.entries,
        });

      if (progressionAttributeMaximumError) {
        return reply.status(400).send({
          message: progressionAttributeMaximumError,
        });
      }

      const talentPrerequisitesValidationError =
        await validateCharacterProgressionTalentPrerequisites({
          systemId,
          characterLevel: effectiveLevel,
          classEntries: normalizedClassEntriesResult.entries,
          ancestryId: selectedAncestry?.id ?? null,
          attributes: attributes ?? {},
          progressionChoices: normalizedProgressionChoicesResult.entries,
        });

      if (talentPrerequisitesValidationError) {
        return reply.status(400).send({
          message: talentPrerequisitesValidationError,
        });
      }

      const attributeEntriesResult = await getCharacterAttributeEntries(
        systemId,
        attributes,
        consolidatedAttributeBonuses,
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

      const initialConstitutionValue =
        typeof attributes?.constitution === "number"
          ? attributes.constitution +
            (consolidatedAttributeBonuses.constitution ?? 0)
          : null;

      const initialMaxHitPoints = calculateInitialMaxHitPointsForClassEntries({
        classEntries: normalizedClassEntriesResult.entries,
        classHitDiceById,
        fallbackHitDie: selectedCharacterClass?.hitDie ?? null,
        fallbackLevel: effectiveLevel,
        constitutionValue: initialConstitutionValue,
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

      if (progressionChoices !== undefined) {
        await upsertCharacterSheetProgressionChoices(
          characterSheet.id,
          normalizedProgressionChoicesResult.entries,
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
            progressionChoices: characterProgressionChoicesSchema,
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
        progressionChoices,
        equipmentItems,
        classEntries,
        ...sheetData
      } = request.body;

      const normalizedProgressionChoicesResult =
        normalizeCharacterProgressionChoices(progressionChoices);

      if (normalizedProgressionChoicesResult.error) {
        return reply.status(400).send({
          message: normalizedProgressionChoicesResult.error,
        });
      }

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
          classes: {
            select: {
              classId: true,
              subclassId: true,
              level: true,
              isPrimary: true,
              order: true,
            },
            orderBy: [
              {
                isPrimary: "desc",
              },
              {
                order: "asc",
              },
            ],
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
          stats: {
            select: {
              baseValue: true,
              stat: {
                select: {
                  key: true,
                },
              },
            },
          },
          progressionChoices: {
            select: {
              classId: true,
              classLevel: true,
              choiceIndex: true,
              type: true,
              attributeIncreaseMode: true,
              attributeIncreases: true,
              talentId: true,
            },
            orderBy: [
              {
                classId: "asc",
              },
              {
                classLevel: "asc",
              },
              {
                choiceIndex: "asc",
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

      const effectiveProgressionClassEntries =
        classEntries !== undefined
          ? normalizedClassEntriesResult.entries
          : characterSheet.classes.map((classEntry) => ({
              classId: classEntry.classId,
              subclassId: classEntry.subclassId,
              level: classEntry.level,
              isPrimary: classEntry.isPrimary,
              order: classEntry.order,
            }));

      const progressionChoicesValidationError =
        await validateRequiredCharacterProgressionChoices({
          systemId: characterSheet.systemId,
          classEntries: effectiveProgressionClassEntries,
          progressionChoices: normalizedProgressionChoicesResult.entries,
          wasProvided: progressionChoices !== undefined,
        });

      if (progressionChoicesValidationError) {
        return reply.status(400).send({
          message: progressionChoicesValidationError,
        });
      }

      const focusedProgressionChoicesValidationError =
        validateFocusedCharacterProgressionChoices(
          normalizedProgressionChoicesResult.entries,
        );

      if (focusedProgressionChoicesValidationError) {
        return reply.status(400).send({
          message: focusedProgressionChoicesValidationError,
        });
      }

      const splitProgressionChoicesValidationError =
        validateSplitCharacterProgressionChoices(
          normalizedProgressionChoicesResult.entries,
        );

      if (splitProgressionChoicesValidationError) {
        return reply.status(400).send({
          message: splitProgressionChoicesValidationError,
        });
      }

      const progressionTalentsValidationError =
        progressionChoices !== undefined
          ? await validateCharacterProgressionTalents({
              systemId: characterSheet.systemId,
              progressionChoices: normalizedProgressionChoicesResult.entries,
            })
          : null;

      if (progressionTalentsValidationError) {
        return reply.status(400).send({
          message: progressionTalentsValidationError,
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

      const currentProgressionChoices: CharacterProgressionChoiceInput[] =
        characterSheet.progressionChoices.map((choice) => ({
          classId: choice.classId,
          classLevel: choice.classLevel,
          choiceIndex: choice.choiceIndex,
          type: choice.type,
          attributeIncreaseMode: choice.attributeIncreaseMode,
          attributeIncreases: normalizeAttributeBonusMap(
            choice.attributeIncreases,
          ),
          talentId: choice.talentId,
        }));

      const effectiveProgressionChoices =
        progressionChoices !== undefined
          ? normalizedProgressionChoicesResult.entries
          : currentProgressionChoices;

      const progressionAttributeBonuses =
        await getCharacterProgressionAttributeBonuses({
          systemId: characterSheet.systemId,
          progressionChoices: effectiveProgressionChoices,
        });

      const consolidatedAttributeBonuses = mergeAttributeBonusMaps(
        sourceAttributeBonuses,
        progressionAttributeBonuses,
      );

      const currentBaseAttributes = Object.fromEntries(
        characterSheet.stats
          .filter((sheetStat) => {
            return isCharacterAttributeKey(sheetStat.stat.key);
          })
          .map((sheetStat) => {
            return [sheetStat.stat.key, sheetStat.baseValue];
          }),
      ) as CharacterAttributeValueMap;

      const effectiveAttributes: CharacterAttributeValueMap = {
        ...currentBaseAttributes,
        ...(attributes ?? {}),
      };

      const progressionAttributeMaximumError =
        progressionChoices !== undefined ||
        attributes !== undefined ||
        sheetData.ancestryId !== undefined ||
        sheetData.backgroundId !== undefined
          ? await validateCharacterProgressionAttributeMaximum({
              systemId: characterSheet.systemId,
              attributes: effectiveAttributes,
              sourceAttributeBonuses,
              progressionChoices: effectiveProgressionChoices,
            })
          : null;

      if (progressionAttributeMaximumError) {
        return reply.status(400).send({
          message: progressionAttributeMaximumError,
        });
      }

      const talentPrerequisitesValidationError =
        progressionChoices !== undefined
          ? await validateCharacterProgressionTalentPrerequisites({
              systemId: characterSheet.systemId,
              characterLevel: sheetData.level ?? characterSheet.level,
              classEntries: effectiveProgressionClassEntries,
              ancestryId: selectedAncestry?.id ?? null,
              attributes: effectiveAttributes,
              progressionChoices: normalizedProgressionChoicesResult.entries,
            })
          : null;

      if (talentPrerequisitesValidationError) {
        return reply.status(400).send({
          message: talentPrerequisitesValidationError,
        });
      }

      const attributeEntriesResult = await getCharacterAttributeEntries(
        characterSheet.systemId,
        attributes,
        consolidatedAttributeBonuses,
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

      const shouldRecalculateInitialHitPoints =
        characterSheet.status === "DRAFT" &&
        (classEntries !== undefined ||
          sheetData.classId !== undefined ||
          sheetData.level !== undefined ||
          attributes?.constitution !== undefined ||
          sheetData.ancestryId !== undefined ||
          sheetData.backgroundId !== undefined ||
          progressionChoices !== undefined);

      const nextConstitutionBaseValue =
        effectiveAttributes.constitution ?? null;

      const nextConstitutionValue =
        typeof nextConstitutionBaseValue === "number"
          ? nextConstitutionBaseValue +
            (consolidatedAttributeBonuses.constitution ?? 0)
          : null;

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
        sheetData.backgroundId !== undefined ||
        progressionChoices !== undefined;

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
                  ? (consolidatedAttributeBonuses[statKey] ?? 0)
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

      if (progressionChoices !== undefined) {
        await removeObsoleteCharacterSheetProgressionChoices(
          sheetId,
          normalizedProgressionChoicesResult.entries,
        );

        await upsertCharacterSheetProgressionChoices(
          sheetId,
          normalizedProgressionChoicesResult.entries,
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
        body: z.object({
          classEntryId: z
            .string()
            .uuid("Invalid character sheet class id"),

          subclassId: z
            .string()
            .uuid("Invalid subclass id")
            .nullable(),

          progressionChoices: z
            .array(
              z.object({
                classId: z.string().uuid("Invalid progression choice class id"),
                classLevel: z.number().int().min(1).max(20),
                choiceIndex: z.number().int().min(0).max(20),
                type: z.enum(["ATTRIBUTE_INCREASE", "TALENT"]),
                attributeIncreaseMode: z
                  .enum(["FOCUSED", "SPLIT"])
                  .nullable(),
                attributeIncreases:
                  characterProgressionAttributeIncreasesSchema,
                talentId: z
                  .string()
                  .uuid("Invalid progression choice talent id")
                  .nullable(),
              }),
            )
            .max(100),

          featureChoiceSelections: z
            .array(
              z.object({
                choiceGroupId: z
                  .string()
                  .uuid("Invalid feature choice group id"),
                featureId: z.string().uuid("Invalid feature id"),
              }),
            )
            .max(100),

          cantripIds: z
            .array(z.string().uuid("Invalid cantrip id"))
            .max(100),

          spellIds: z
            .array(z.string().uuid("Invalid spell id"))
            .max(100),
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
      const {
        classEntryId,
        subclassId,
        progressionChoices,
        featureChoiceSelections,
        cantripIds,
        spellIds,
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
                  levelProgressions: {
                    include: {
                      spellLimits: true,
                    },
                  },
                  classSpells: {
                    include: {
                      spell: true,
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
          spells: true,
          featureChoices: true,
          progressionChoices: true,
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
        characterSheet.classes.find(
          (classEntry) => classEntry.id === classEntryId,
        ) ?? null;

      if (!selectedClassEntry) {
        return reply.status(400).send({
          message: "Selected character class entry was not found",
        });
      }

      const currentClassLevel = selectedClassEntry.level;
      const nextClassLevel = currentClassLevel + 1;
      const currentCharacterLevel = characterSheet.level;
      const nextCharacterLevel = currentCharacterLevel + 1;

      if (nextClassLevel > 20) {
        return reply.status(400).send({
          message: "Selected class is already at maximum level",
        });
      }

      const currentProgression =
        selectedClassEntry.characterClass.levelProgressions.find(
          (progression) => progression.level === currentClassLevel,
        ) ?? null;

      const nextProgression =
        selectedClassEntry.characterClass.levelProgressions.find(
          (progression) => progression.level === nextClassLevel,
        ) ?? null;

      if (!nextProgression) {
        return reply.status(400).send({
          message:
            "Selected class has no progression registered for the next level",
        });
      }

      /*
       * 4.7.13 — validação da escolha de subclasse.
       *
       * A subclasse só é aceita quando este avanço realmente libera a escolha.
       * Para classes que já possuem subclasse, o payload deve permanecer null.
       */
      const subclassSelectionLevel =
        selectedClassEntry.characterClass.subclassSelectionLevel ?? null;

      const requiresSubclassChoice =
        typeof subclassSelectionLevel === "number" &&
        nextClassLevel >= subclassSelectionLevel &&
        !selectedClassEntry.subclassId;

      if (requiresSubclassChoice && !subclassId) {
        return reply.status(400).send({
          message: "This Level Up requires a subclass choice",
        });
      }

      if (!requiresSubclassChoice && subclassId) {
        return reply.status(400).send({
          message: "This Level Up does not allow a new subclass choice",
        });
      }

      let selectedSubclass: {
        id: string;
        classId: string;
      } | null = null;

      if (subclassId) {
        selectedSubclass = await prisma.characterSubclass.findFirst({
          where: {
            id: subclassId,
            systemId: characterSheet.systemId,
            classId: selectedClassEntry.classId,
          },
          select: {
            id: true,
            classId: true,
          },
        });

        if (!selectedSubclass) {
          return reply.status(400).send({
            message: "Subclass not found for the selected class and system",
          });
        }
      }

      const effectiveSubclassId =
        selectedSubclass?.id ?? selectedClassEntry.subclassId ?? null;

      const advancedClassEntries: CharacterClassEntryInput[] =
        characterSheet.classes.map((classEntry) => ({
          classId: classEntry.classId,
          subclassId:
            classEntry.id === selectedClassEntry.id
              ? effectiveSubclassId
              : classEntry.subclassId,
          level:
            classEntry.id === selectedClassEntry.id
              ? nextClassLevel
              : classEntry.level,
          isPrimary: classEntry.isPrimary,
          order: classEntry.order,
        }));

      const classValidationError = await validateCharacterSheetClassEntries({
        systemId: characterSheet.systemId,
        classEntries: advancedClassEntries,
      });

      if (classValidationError) {
        return reply.status(400).send({
          message: classValidationError,
        });
      }

      /*
       * 4.7.13 — escolhas de progressão.
       *
       * O payload contém somente as escolhas liberadas neste avanço.
       * As escolhas anteriores são preservadas e usadas na validação do
       * histórico completo do personagem.
       */
      const normalizedNewProgressionChoicesResult =
        normalizeCharacterProgressionChoices(progressionChoices);

      if (normalizedNewProgressionChoicesResult.error) {
        return reply.status(400).send({
          message: normalizedNewProgressionChoicesResult.error,
        });
      }

      const newProgressionChoices =
        normalizedNewProgressionChoicesResult.entries;

      const requiredProgressionChoiceCount = Math.max(
        0,
        nextProgression.progressionChoiceCount ?? 0,
      );

      if (newProgressionChoices.length !== requiredProgressionChoiceCount) {
        return reply.status(400).send({
          message:
            `This Level Up requires ${requiredProgressionChoiceCount} ` +
            `progression choice(s), but ${newProgressionChoices.length} were provided`,
        });
      }

      for (const choice of newProgressionChoices) {
        if (
          choice.classId !== selectedClassEntry.classId ||
          choice.classLevel !== nextClassLevel ||
          choice.choiceIndex < 0 ||
          choice.choiceIndex >= requiredProgressionChoiceCount
        ) {
          return reply.status(400).send({
            message:
              "Progression choice does not belong to the selected class Level Up",
          });
        }
      }

      const resolvedProgressionError =
        validateResolvedCharacterProgressionChoices(newProgressionChoices);

      if (resolvedProgressionError) {
        return reply.status(400).send({
          message: resolvedProgressionError,
        });
      }

      const focusedProgressionError =
        validateFocusedCharacterProgressionChoices(newProgressionChoices);

      if (focusedProgressionError) {
        return reply.status(400).send({
          message: focusedProgressionError,
        });
      }

      const splitProgressionError =
        validateSplitCharacterProgressionChoices(newProgressionChoices);

      if (splitProgressionError) {
        return reply.status(400).send({
          message: splitProgressionError,
        });
      }

      const existingProgressionChoices: CharacterProgressionChoiceInput[] =
        characterSheet.progressionChoices.map((choice) => ({
          classId: choice.classId,
          classLevel: choice.classLevel,
          choiceIndex: choice.choiceIndex,
          type: choice.type,
          attributeIncreaseMode: choice.attributeIncreaseMode,
          attributeIncreases: normalizeAttributeBonusMap(
            choice.attributeIncreases,
          ),
          talentId: choice.talentId,
        }));

      const allProgressionChoices = [
        ...existingProgressionChoices.filter((existingChoice) => {
          return !newProgressionChoices.some(
            (newChoice) =>
              getCharacterProgressionChoiceIdentity(newChoice) ===
              getCharacterProgressionChoiceIdentity(existingChoice),
          );
        }),
        ...newProgressionChoices,
      ];

      const requiredProgressionError =
        await validateRequiredCharacterProgressionChoices({
          systemId: characterSheet.systemId,
          classEntries: advancedClassEntries,
          progressionChoices: allProgressionChoices,
          wasProvided: true,
        });

      if (requiredProgressionError) {
        return reply.status(400).send({
          message: requiredProgressionError,
        });
      }

      const progressionTalentError = await validateCharacterProgressionTalents({
        systemId: characterSheet.systemId,
        progressionChoices: allProgressionChoices,
      });

      if (progressionTalentError) {
        return reply.status(400).send({
          message: progressionTalentError,
        });
      }

      const currentAttributes =
        characterSheet.stats.reduce<CharacterAttributeValueMap>(
          (attributeMap, sheetStat) => {
            const statKey = sheetStat.stat.key;

            if (!isCharacterAttributeKey(statKey)) {
              return attributeMap;
            }

            attributeMap[statKey] =
              sheetStat.overrideValue ??
              sheetStat.baseValue + (sheetStat.bonusValue ?? 0);

            return attributeMap;
          },
          {},
        );

      const talentPrerequisiteError =
        await validateCharacterProgressionTalentPrerequisites({
          systemId: characterSheet.systemId,
          characterLevel: nextCharacterLevel,
          classEntries: advancedClassEntries,
          ancestryId: characterSheet.ancestryId,
          attributes: currentAttributes,
          progressionChoices: allProgressionChoices,
        });

      if (talentPrerequisiteError) {
        return reply.status(400).send({
          message: talentPrerequisiteError,
        });
      }

      const progressionAttributeMaximumError =
        await validateCharacterProgressionAttributeMaximum({
          systemId: characterSheet.systemId,
          attributes: currentAttributes,
          sourceAttributeBonuses: {},
          progressionChoices: newProgressionChoices,
        });

      if (progressionAttributeMaximumError) {
        return reply.status(400).send({
          message: progressionAttributeMaximumError,
        });
      }

      const newProgressionAttributeBonuses =
        await getCharacterProgressionAttributeBonuses({
          systemId: characterSheet.systemId,
          progressionChoices: newProgressionChoices,
        });

      /*
       * 4.7.13 — escolhas internas de features.
       *
       * Validamos somente os grupos liberados exatamente neste avanço. Os
       * grupos anteriores permanecem intactos.
       */
      const unlockedFeatureChoiceGroups =
        await getFeatureChoiceGroupsUnlockedForClassAtLevel({
          systemId: characterSheet.systemId,
          classId: selectedClassEntry.classId,
          subclassId: selectedClassEntry.subclassId,
          targetClassLevel: nextClassLevel,
        });

      const unlockedFeatureChoiceGroupsById = new Map(
        unlockedFeatureChoiceGroups.map((choiceGroup) => [
          choiceGroup.id,
          choiceGroup,
        ]),
      );

      const uniqueFeatureChoiceSelections = Array.from(
        new Map(
          featureChoiceSelections.map((selection) => [
            `${selection.choiceGroupId}:${selection.featureId}`,
            selection,
          ]),
        ).values(),
      );

      if (
        uniqueFeatureChoiceSelections.length !== featureChoiceSelections.length
      ) {
        return reply.status(400).send({
          message: "Duplicate feature choice selections are not allowed",
        });
      }

      const unexpectedFeatureChoice = uniqueFeatureChoiceSelections.find(
        (selection) =>
          !unlockedFeatureChoiceGroupsById.has(selection.choiceGroupId),
      );

      if (unexpectedFeatureChoice) {
        return reply.status(400).send({
          message:
            "Feature choice does not belong to a group unlocked by this Level Up",
        });
      }

      for (const choiceGroup of unlockedFeatureChoiceGroups) {
        const groupSelections = uniqueFeatureChoiceSelections.filter(
          (selection) => selection.choiceGroupId === choiceGroup.id,
        );

        if (groupSelections.length !== choiceGroup.choiceCount) {
          return reply.status(400).send({
            message:
              `The feature choice group "${choiceGroup.name}" requires ` +
              `${choiceGroup.choiceCount} choice(s), but ` +
              `${groupSelections.length} were provided`,
          });
        }

        const allowedFeatureIds = new Set(
          choiceGroup.options.map((option) => option.feature.id),
        );

        const invalidFeatureSelection = groupSelections.find(
          (selection) => !allowedFeatureIds.has(selection.featureId),
        );

        if (invalidFeatureSelection) {
          return reply.status(400).send({
            message:
              `Feature does not belong to the choice group "${choiceGroup.name}"`,
          });
        }
      }

      /*
       * 4.7.13 — novas magias conhecidas.
       *
       * Os IDs enviados devem pertencer à lista da classe, estar liberados
       * pelo novo nível e ainda não existir na ficha.
       */
      const uniqueCantripIds = Array.from(new Set(cantripIds));
      const uniqueSpellIds = Array.from(new Set(spellIds));

      if (uniqueCantripIds.length !== cantripIds.length) {
        return reply.status(400).send({
          message: "Duplicate cantrip choices are not allowed",
        });
      }

      if (uniqueSpellIds.length !== spellIds.length) {
        return reply.status(400).send({
          message: "Duplicate spell choices are not allowed",
        });
      }

      const duplicatedAcrossSpellGroups = uniqueCantripIds.find((spellId) =>
        uniqueSpellIds.includes(spellId),
      );

      if (duplicatedAcrossSpellGroups) {
        return reply.status(400).send({
          message: "The same spell cannot be selected twice in one Level Up",
        });
      }

      const currentCantripsKnown = currentProgression?.cantripsKnown ?? 0;
      const nextCantripsKnown = nextProgression.cantripsKnown ?? 0;
      const requiredCantripCount = Math.max(
        0,
        nextCantripsKnown - currentCantripsKnown,
      );

      const currentSpellsKnown = currentProgression?.spellsKnown ?? 0;
      const nextSpellsKnown = nextProgression.spellsKnown ?? 0;
      const requiredSpellCount = Math.max(
        0,
        nextSpellsKnown - currentSpellsKnown,
      );

      if (uniqueCantripIds.length !== requiredCantripCount) {
        return reply.status(400).send({
          message:
            `This Level Up requires ${requiredCantripCount} new cantrip(s), ` +
            `but ${uniqueCantripIds.length} were provided`,
        });
      }

      if (uniqueSpellIds.length !== requiredSpellCount) {
        return reply.status(400).send({
          message:
            `This Level Up requires ${requiredSpellCount} new known spell(s), ` +
            `but ${uniqueSpellIds.length} were provided`,
        });
      }

      const selectedSpellIds = [...uniqueCantripIds, ...uniqueSpellIds];

      const selectedSpells =
        selectedSpellIds.length > 0
          ? await prisma.spell.findMany({
              where: {
                systemId: characterSheet.systemId,
                id: {
                  in: selectedSpellIds,
                },
              },
              select: {
                id: true,
                name: true,
                level: true,
              },
            })
          : [];

      if (selectedSpells.length !== selectedSpellIds.length) {
        return reply.status(400).send({
          message: "One or more selected spells were not found for this system",
        });
      }

      const selectedSpellsById = new Map(
        selectedSpells.map((spell) => [spell.id, spell]),
      );

      const invalidCantrip = uniqueCantripIds.find(
        (spellId) => selectedSpellsById.get(spellId)?.level !== 0,
      );

      if (invalidCantrip) {
        return reply.status(400).send({
          message: "A selected cantrip is not a level 0 spell",
        });
      }

      const invalidKnownSpell = uniqueSpellIds.find(
        (spellId) => (selectedSpellsById.get(spellId)?.level ?? 0) <= 0,
      );

      if (invalidKnownSpell) {
        return reply.status(400).send({
          message: "A selected known spell must be level 1 or higher",
        });
      }

      const classSpellsBySpellId = new Map(
        selectedClassEntry.characterClass.classSpells.map((classSpell) => [
          classSpell.spellId,
          classSpell,
        ]),
      );

      const unavailableSpellId = selectedSpellIds.find((spellId) => {
        const classSpell = classSpellsBySpellId.get(spellId);

        return (
          !classSpell ||
          (classSpell.minimumClassLevel ?? 1) > nextClassLevel
        );
      });

      if (unavailableSpellId) {
        return reply.status(400).send({
          message:
            "A selected spell is not available to this class at the next level",
        });
      }

      const alreadyKnownSpellIds = new Set(
        characterSheet.spells.map((characterSpell) => characterSpell.spellId),
      );

      const alreadyKnownSpellId = selectedSpellIds.find((spellId) =>
        alreadyKnownSpellIds.has(spellId),
      );

      if (alreadyKnownSpellId) {
        return reply.status(400).send({
          message: "A selected spell is already known by this character",
        });
      }

      /*
       * 4.7.13 — PV.
       *
       * Regra oficial do MVP: dado máximo da classe + modificador atual de CON,
       * preservando o dano sofrido porque PV atual e máximo sobem pelo mesmo
       * valor.
       */
      const constitutionStat =
        characterSheet.stats.find(
          (sheetStat) => sheetStat.stat.key === "constitution",
        ) ?? null;

      const constitutionValue = constitutionStat
        ? (constitutionStat.overrideValue ??
          constitutionStat.baseValue + (constitutionStat.bonusValue ?? 0))
        : null;

      const constitutionModifier = getAttributeModifier(constitutionValue);
      const hitDie = selectedClassEntry.characterClass.hitDie;

      if (typeof hitDie !== "number" || hitDie <= 0) {
        return reply.status(400).send({
          message: "Selected class has no valid hit die for Level Up",
        });
      }

      const hitPointGain = Math.max(1, hitDie + constitutionModifier);
      const nextHitPoints = characterSheet.hitPoints + hitPointGain;
      const nextMaxHitPoints = characterSheet.maxHitPoints + hitPointGain;

      /*
       * 4.7.13.11 — aplicação transacional.
       *
       * Nenhuma alteração abaixo é persistida parcialmente: nível, PV,
       * subclasse, atributos/talentos, feature choices e magias são aplicados
       * na mesma transação.
       */
      await prisma.$transaction(async (transaction) => {
        await transaction.characterSheet.update({
          where: {
            id: characterSheet.id,
          },
          data: {
            level: nextCharacterLevel,
            hitPoints: nextHitPoints,
            maxHitPoints: nextMaxHitPoints,
            levelUpAvailable: false,
            ...(selectedClassEntry.isPrimary && selectedSubclass
              ? {
                  subclassId: selectedSubclass.id,
                }
              : {}),
          },
        });

        await transaction.characterSheetClass.update({
          where: {
            id: selectedClassEntry.id,
          },
          data: {
            level: nextClassLevel,
            ...(selectedSubclass
              ? {
                  subclassId: selectedSubclass.id,
                }
              : {}),
          },
        });

        for (const [attributeKey, increaseValue] of Object.entries(
          newProgressionAttributeBonuses,
        )) {
          if (
            !isCharacterAttributeKey(attributeKey) ||
            typeof increaseValue !== "number" ||
            increaseValue === 0
          ) {
            continue;
          }

          const currentStat = characterSheet.stats.find(
            (sheetStat) => sheetStat.stat.key === attributeKey,
          );

          if (!currentStat) {
            throw new Error(
              `Character attribute ${attributeKey} was not found during Level Up`,
            );
          }

          await transaction.characterSheetStat.update({
            where: {
              characterSheetId_statId: {
                characterSheetId: characterSheet.id,
                statId: currentStat.statId,
              },
            },
            data: {
              bonusValue: (currentStat.bonusValue ?? 0) + increaseValue,
            },
          });
        }

        for (const choice of newProgressionChoices) {
          await transaction.characterSheetProgressionChoice.upsert({
            where: {
              characterSheetId_classId_classLevel_choiceIndex: {
                characterSheetId: characterSheet.id,
                classId: choice.classId,
                classLevel: choice.classLevel,
                choiceIndex: choice.choiceIndex,
              },
            },
            create: {
              characterSheetId: characterSheet.id,
              classId: choice.classId,
              classLevel: choice.classLevel,
              choiceIndex: choice.choiceIndex,
              type: choice.type,
              attributeIncreaseMode: choice.attributeIncreaseMode,
              attributeIncreases:
                choice.attributeIncreases as Prisma.InputJsonValue,
              talentId: choice.talentId,
            },
            update: {
              type: choice.type,
              attributeIncreaseMode: choice.attributeIncreaseMode,
              attributeIncreases:
                choice.attributeIncreases as Prisma.InputJsonValue,
              talentId: choice.talentId,
            },
          });
        }

        if (uniqueFeatureChoiceSelections.length > 0) {
          await transaction.characterSheetFeatureChoice.createMany({
            data: uniqueFeatureChoiceSelections.map((selection) => ({
              characterSheetId: characterSheet.id,
              choiceGroupId: selection.choiceGroupId,
              featureId: selection.featureId,
              source: "builder",
            })),
            skipDuplicates: true,
          });
        }

        if (selectedSpellIds.length > 0) {
          await transaction.characterSheetSpell.createMany({
            data: selectedSpellIds.map((spellId) => ({
              characterSheetId: characterSheet.id,
              spellId,
              classId: selectedClassEntry.classId,
              source: "class",
            })),
            skipDuplicates: true,
          });
        }
      });

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

    const featureChoiceGroups = await prisma.featureChoiceGroup.findMany({
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

    const applicableFeatureChoiceGroups = featureChoiceGroups.filter(
      (choiceGroup) => {
        const matchesAncestry =
          !choiceGroup.ancestryId ||
          choiceGroup.ancestryId === characterSheet.ancestryId;

        const matchesBackground =
          !choiceGroup.backgroundId ||
          choiceGroup.backgroundId === characterSheet.backgroundId;

        const matchesClass =
          !choiceGroup.classId ||
          classEntries.some(
            (classEntry) => classEntry.classId === choiceGroup.classId,
          );

        const matchesSubclass =
          !choiceGroup.subclassId ||
          classEntries.some(
            (classEntry) => classEntry.subclassId === choiceGroup.subclassId,
          );

        const matchesLevelProgression =
          !choiceGroup.levelProgression ||
          classEntries.some((classEntry) => {
            return (
              classEntry.classId === choiceGroup.levelProgression?.classId &&
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
      },
    );

    const builderFeatureChoices = characterSheet.featureChoices.filter(
      (featureChoice) => featureChoice.source === "builder",
    );

    for (const choiceGroup of applicableFeatureChoiceGroups) {
      const groupSelections = builderFeatureChoices.filter(
        (featureChoice) => featureChoice.choiceGroupId === choiceGroup.id,
      );

      const uniqueSelectedFeatureIds = new Set(
        groupSelections.map((featureChoice) => featureChoice.featureId),
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
        body: z.object({
          progressionChoices: characterProgressionChoicesSchema.unwrap(),
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

      const { progressionChoices } = request.body;

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

      const normalizedProgressionChoicesResult =
        normalizeCharacterProgressionChoices(progressionChoices);

      if (normalizedProgressionChoicesResult.error) {
        return reply.status(400).send({
          message: normalizedProgressionChoicesResult.error,
        });
      }

      const effectiveProgressionClassEntries: CharacterClassEntryInput[] =
        characterSheet.classes.length > 0
          ? characterSheet.classes.map((classEntry) => ({
              classId: classEntry.classId,
              subclassId: classEntry.subclassId,
              level: classEntry.level,
              isPrimary: classEntry.isPrimary,
              order: classEntry.order,
            }))
          : characterSheet.classId
            ? [
                {
                  classId: characterSheet.classId,
                  subclassId: characterSheet.subclassId,
                  level: characterSheet.level,
                  isPrimary: true,
                  order: 0,
                },
              ]
            : [];

      const progressionValidationErrors: string[] = [];

      const requiredProgressionChoicesValidationError =
        await validateRequiredCharacterProgressionChoices({
          systemId: characterSheet.systemId,
          classEntries: effectiveProgressionClassEntries,
          progressionChoices: normalizedProgressionChoicesResult.entries,
          wasProvided: true,
        });

      if (requiredProgressionChoicesValidationError) {
        progressionValidationErrors.push(
          requiredProgressionChoicesValidationError,
        );
      }

      const resolvedProgressionChoicesValidationError =
        validateResolvedCharacterProgressionChoices(
          normalizedProgressionChoicesResult.entries,
        );

      if (resolvedProgressionChoicesValidationError) {
        progressionValidationErrors.push(
          resolvedProgressionChoicesValidationError,
        );
      }

      const focusedProgressionChoicesValidationError =
        validateFocusedCharacterProgressionChoices(
          normalizedProgressionChoicesResult.entries,
        );

      if (focusedProgressionChoicesValidationError) {
        progressionValidationErrors.push(
          focusedProgressionChoicesValidationError,
        );
      }

      const splitProgressionChoicesValidationError =
        validateSplitCharacterProgressionChoices(
          normalizedProgressionChoicesResult.entries,
        );

      if (splitProgressionChoicesValidationError) {
        progressionValidationErrors.push(
          splitProgressionChoicesValidationError,
        );
      }

      const progressionTalentsValidationError =
        await validateCharacterProgressionTalents({
          systemId: characterSheet.systemId,
          progressionChoices: normalizedProgressionChoicesResult.entries,
        });

      if (progressionTalentsValidationError) {
        progressionValidationErrors.push(progressionTalentsValidationError);
      }

      const currentBaseAttributes = Object.fromEntries(
        characterSheet.stats
          .filter((sheetStat) => {
            return isCharacterAttributeKey(sheetStat.stat.key);
          })
          .map((sheetStat) => {
            return [sheetStat.stat.key, sheetStat.baseValue];
          }),
      ) as CharacterAttributeValueMap;

      const sourceAttributeBonuses = mergeAttributeBonusMaps(
        normalizeAttributeBonusMap(characterSheet.ancestry?.attributeBonuses),
        normalizeAttributeBonusMap(characterSheet.background?.attributeBonuses),
      );

      const progressionAttributeMaximumError =
        await validateCharacterProgressionAttributeMaximum({
          systemId: characterSheet.systemId,
          attributes: currentBaseAttributes,
          sourceAttributeBonuses,
          progressionChoices: normalizedProgressionChoicesResult.entries,
        });

      if (progressionAttributeMaximumError) {
        progressionValidationErrors.push(progressionAttributeMaximumError);
      }

      const talentPrerequisitesValidationError =
        await validateCharacterProgressionTalentPrerequisites({
          systemId: characterSheet.systemId,
          characterLevel: characterSheet.level,
          classEntries: effectiveProgressionClassEntries,
          ancestryId: characterSheet.ancestryId,
          attributes: currentBaseAttributes,
          progressionChoices: normalizedProgressionChoicesResult.entries,
        });

      if (talentPrerequisitesValidationError) {
        progressionValidationErrors.push(talentPrerequisitesValidationError);
      }

      const validationErrors = [
        ...(await getReadyValidationErrors(characterSheet)),
        ...progressionValidationErrors,
      ];

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
