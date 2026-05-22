import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

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

  type CharacterAttributeKey =
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma";

  async function getCharacterAttributeEntries(
    systemId: string,
    attributes: z.infer<typeof characterAttributesSchema>,
  ) {
    if (!attributes) {
      return {
        entries: [] as Array<{
          value: number;
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
          value: number;
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
        value,
        statId: statsByKey.get(key)!.id,
      })),
      error: null,
    };
  }

  async function upsertCharacterSheetStats(
    characterSheetId: string,
    entries: Array<{
      value: number;
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
            baseValue: entry.value,
          },
          update: {
            baseValue: entry.value,
          },
        }),
      ),
    );
  }

  async function getCharacterSkillEntries(
    systemId: string,
    skillKeys: z.infer<typeof characterSkillKeysSchema>,
  ) {
    if (!skillKeys) {
      return {
        entries: [] as Array<{
          skillId: string;
        }>,
        error: null as string | null,
      };
    }

    const uniqueSkillKeys = Array.from(new Set(skillKeys));

    if (uniqueSkillKeys.length === 0) {
      return {
        entries: [] as Array<{
          skillId: string;
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
      })),
      error: null,
    };
  }

  async function replaceCharacterSheetSkills(
    characterSheetId: string,
    entries: Array<{
      skillId: string;
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
          },
        }),
      ),
    ]);
  }

  async function getCharacterSpellEntries(
    systemId: string,
    spellKeys: z.infer<typeof characterSpellKeysSchema>,
  ) {
    if (!spellKeys) {
      return {
        entries: [] as Array<{
          spellId: string;
        }>,
        error: null as string | null,
      };
    }

    const uniqueSpellKeys = Array.from(new Set(spellKeys));

    if (uniqueSpellKeys.length === 0) {
      return {
        entries: [] as Array<{
          spellId: string;
        }>,
        error: null as string | null,
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

    return {
      entries: uniqueSpellKeys.map((key) => ({
        spellId: spellsByKey.get(key)!.id,
      })),
      error: null,
    };
  }

  async function replaceCharacterSheetSpells(
    characterSheetId: string,
    entries: Array<{
      spellId: string;
    }>,
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
            source: "builder",
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
    characterClass: true,
    subclass: true,
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
      },
    },
    equipment: {
      include: {
        equipment: true,
      },
    },
  };

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
        include: {
          campaignActor: true,
          ancestry: true,
          background: true,
          characterClass: true,
          subclass: true,
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
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return reply.status(200).send({ characterSheets });
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

      return reply.status(200).send({ characterSheet });
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

      if (classId) {
        const characterClass = await prisma.characterClass.findFirst({
          where: {
            id: classId,
            systemId,
          },
        });

        if (!characterClass) {
          return reply.status(404).send({
            message: "Character class not found for this system",
          });
        }
      }

      if (ancestryId) {
        const ancestry = await prisma.ancestry.findFirst({
          where: {
            id: ancestryId,
            systemId,
          },
        });

        if (!ancestry) {
          return reply.status(404).send({
            message: "Ancestry not found for this system",
          });
        }
      }

      if (backgroundId) {
        const background = await prisma.background.findFirst({
          where: {
            id: backgroundId,
            systemId,
          },
        });

        if (!background) {
          return reply.status(404).send({
            message: "Background not found for this system",
          });
        }
      }

      const attributeEntriesResult = await getCharacterAttributeEntries(
        systemId,
        attributes,
      );

      if (attributeEntriesResult.error) {
        return reply.status(400).send({
          message: attributeEntriesResult.error,
        });
      }

      const skillEntriesResult = await getCharacterSkillEntries(
        systemId,
        skillKeys,
      );

      if (skillEntriesResult.error) {
        return reply.status(400).send({
          message: skillEntriesResult.error,
        });
      }

      const spellEntriesResult = await getCharacterSpellEntries(
        systemId,
        spellKeys,
      );

      if (spellEntriesResult.error) {
        return reply.status(400).send({
          message: spellEntriesResult.error,
        });
      }

      const characterSheet = await prisma.characterSheet.create({
        data: {
          campaignId,
          systemId,
          campaignActorId: campaignActorId ?? null,
          ownerId: session.user.id,

          classId: classId ?? null,
          ancestryId: ancestryId ?? null,
          backgroundId: backgroundId ?? null,

          name,
          pronouns: pronouns?.trim() || null,
          concept: concept?.trim() || null,
          portraitUrl: portraitUrl?.trim() || null,
          tokenImageUrl: tokenImageUrl?.trim() || null,
          tokenImageFit: tokenImageFit ?? "FILL",
        },
      });

      await upsertCharacterSheetStats(
        characterSheet.id,
        attributeEntriesResult.entries,
      );

      if (skillKeys !== undefined) {
        await replaceCharacterSheetSkills(
          characterSheet.id,
          skillEntriesResult.entries,
        );
      }

      if (spellKeys !== undefined) {
        await replaceCharacterSheetSpells(
          characterSheet.id,
          spellEntriesResult.entries,
        );
      }

      const characterSheetWithRelations =
        await prisma.characterSheet.findUniqueOrThrow({
          where: {
            id: characterSheet.id,
          },
          include: characterSheetInclude,
        });

      return reply.status(201).send({
        characterSheet: characterSheetWithRelations,
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
            notes: z.string().nullable().optional(),
            gmNotes: z.string().nullable().optional(),

            status: z.enum(["DRAFT", "READY", "ARCHIVED"]).optional(),
          })
          .refine((data) => Object.keys(data).length > 0, {
            message: "At least one field must be provided",
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
      const { attributes, skillKeys, spellKeys, ...sheetData } = request.body;

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

      if (sheetData.classId) {
        const characterClass = await prisma.characterClass.findFirst({
          where: {
            id: sheetData.classId,
            systemId: characterSheet.systemId,
          },
        });

        if (!characterClass) {
          return reply.status(404).send({
            message: "Character class not found for this system",
          });
        }
      }

      if (sheetData.ancestryId) {
        const ancestry = await prisma.ancestry.findFirst({
          where: {
            id: sheetData.ancestryId,
            systemId: characterSheet.systemId,
          },
        });

        if (!ancestry) {
          return reply.status(404).send({
            message: "Ancestry not found for this system",
          });
        }
      }

      if (sheetData.backgroundId) {
        const background = await prisma.background.findFirst({
          where: {
            id: sheetData.backgroundId,
            systemId: characterSheet.systemId,
          },
        });

        if (!background) {
          return reply.status(404).send({
            message: "Background not found for this system",
          });
        }
      }

      if (sheetData.subclassId) {
        const subclass = await prisma.characterSubclass.findFirst({
          where: {
            id: sheetData.subclassId,
            systemId: characterSheet.systemId,
          },
        });

        if (!subclass) {
          return reply.status(404).send({
            message: "Subclass not found for this system",
          });
        }
      }

      const attributeEntriesResult = await getCharacterAttributeEntries(
        characterSheet.systemId,
        attributes,
      );

      if (attributeEntriesResult.error) {
        return reply.status(400).send({
          message: attributeEntriesResult.error,
        });
      }

      const skillEntriesResult = await getCharacterSkillEntries(
        characterSheet.systemId,
        skillKeys,
      );

      if (skillEntriesResult.error) {
        return reply.status(400).send({
          message: skillEntriesResult.error,
        });
      }

      const spellEntriesResult = await getCharacterSpellEntries(
        characterSheet.systemId,
        spellKeys,
      );

      if (spellEntriesResult.error) {
        return reply.status(400).send({
          message: spellEntriesResult.error,
        });
      }

      const sanitizedData = {
        ...sheetData,
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
          sheetData.hair === undefined ? undefined : sheetData.hair?.trim() || null,
        skin:
          sheetData.skin === undefined ? undefined : sheetData.skin?.trim() || null,
        eyes:
          sheetData.eyes === undefined ? undefined : sheetData.eyes?.trim() || null,
        height:
          sheetData.height === undefined
            ? undefined
            : sheetData.height?.trim() || null,
        weight:
          sheetData.weight === undefined
            ? undefined
            : sheetData.weight?.trim() || null,
        age:
          sheetData.age === undefined ? undefined : sheetData.age?.trim() || null,
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
        notes:
          sheetData.notes === undefined
            ? undefined
            : sheetData.notes?.trim() || null,
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

      if (attributes !== undefined) {
        await upsertCharacterSheetStats(
          sheetId,
          attributeEntriesResult.entries,
        );
      }

      if (skillKeys !== undefined) {
        await replaceCharacterSheetSkills(
          sheetId,
          skillEntriesResult.entries,
        );
      }

      if (spellKeys !== undefined) {
        await replaceCharacterSheetSpells(
          sheetId,
          spellEntriesResult.entries,
        );
      }

      const updatedCharacterSheet =
        await prisma.characterSheet.findUniqueOrThrow({
          where: {
            id: sheetId,
          },
          include: characterSheetInclude,
        });

      return reply.status(200).send({
        characterSheet: updatedCharacterSheet,
      });
    },
  );
}