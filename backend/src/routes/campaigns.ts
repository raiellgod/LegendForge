import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { getAuthenticatedSession } from "../lib/get-authenticated-session.js";
import { prisma } from "../lib/prisma.js";

function normalizeCharacterTemplateAttributeIncreases(
  value: unknown,
): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized: Record<string, number> = {};

  for (const [key, entryValue] of Object.entries(value)) {
    if (typeof entryValue === "number" && Number.isFinite(entryValue)) {
      normalized[key] = entryValue;
    }
  }

  return normalized;
}


const npcCreatureDefenseInputSchema = z.object({
  kind: z.enum(["RESISTANCE", "IMMUNITY", "VULNERABILITY"]),
  damageType: z.string().min(1).max(80),
  notes: z.string().max(500).optional(),
});

const npcCreatureSenseInputSchema = z.object({
  name: z.string().min(1).max(80),
  range: z.number().int().min(0).nullable().optional(),
  notes: z.string().max(500).optional(),
});

const npcCreatureTraitInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(4000),
});

const npcCreatureActionInputSchema = z.object({
  kind: z.enum(["ACTION", "BONUS_ACTION", "REACTION"]),
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(4000),
  uses: z.number().int().min(0).nullable().optional(),
  maxUses: z.number().int().min(0).nullable().optional(),
  recharge: z.string().max(120).optional(),
});

const npcCreatureAttackInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(4000).optional(),
  attackType: z.enum(["MELEE", "RANGED", "THROWN", "MAGIC", "OTHER"]),
  attackAbilityKey: z.string().max(40).optional(),
  attackBonus: z.number().int(),
  damageFormula: z.string().max(80).optional(),
  damageBonus: z.number().int(),
  damageType: z.string().max(80).optional(),
  secondaryDamageFormula: z.string().max(80).optional(),
  secondaryDamageType: z.string().max(80).optional(),
  normalRange: z.number().int().min(0).nullable().optional(),
  longRange: z.number().int().min(0).nullable().optional(),
  reach: z.number().int().min(0).nullable().optional(),
  target: z.string().max(200).optional(),
  saveAbilityKey: z.string().max(40).optional(),
  saveDc: z.number().int().min(0).nullable().optional(),
  onHit: z.string().max(4000).optional(),
  notes: z.string().max(2000).optional(),
});

const npcCreatureMultiattackInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(4000).optional(),
  entries: z.array(
    z.object({
      targetType: z.enum(["ATTACK", "ACTION"]),
      targetName: z.string().min(1).max(120),
      quantity: z.number().int().min(1).max(20),
      notes: z.string().max(500).optional(),
    }),
  ),
});

const npcCreatureMagicalAbilityInputSchema = z.object({
  spellKey: z.string().max(120).optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(4000).optional(),
  abilityKey: z.string().max(40).optional(),
  attackBonus: z.number().int().nullable().optional(),
  saveDc: z.number().int().min(0).nullable().optional(),
  damageFormula: z.string().max(80).optional(),
  damageBonus: z.number().int(),
  damageType: z.string().max(80).optional(),
  range: z.string().max(120).optional(),
  target: z.string().max(200).optional(),
  uses: z.number().int().min(0).nullable().optional(),
  maxUses: z.number().int().min(0).nullable().optional(),
  recharge: z.string().max(120).optional(),
  isPassive: z.boolean(),
  notes: z.string().max(2000).optional(),
});

const commonNpcCreatureSheetInputSchema = z.object({
  name: z.string().min(1).max(80),
  initials: z.string().min(1).max(3).optional(),
  description: z.string().max(1000).optional(),
  location: z.enum(["TABLE", "LIBRARY"]),
  size: z.enum(["TINY", "SMALL", "MEDIUM", "LARGE", "HUGE", "GARGANTUAN"]),
  portraitUrl: z.string().optional(),
  tokenImageUrl: z.string().optional(),
  tokenImageFit: z.enum(["COVER", "CONTAIN", "FILL"]),
  armorClass: z.number().int().min(0),
  hitPoints: z.number().int().min(0),
  maxHitPoints: z.number().int().min(1),
  temporaryHp: z.number().int().min(0),
  speed: z.number().int().min(0),
  climbSpeed: z.number().int().min(0),
  swimSpeed: z.number().int().min(0),
  flySpeed: z.number().int().min(0),
  burrowSpeed: z.number().int().min(0),
  attributes: z.record(z.string(), z.number().int().min(1).max(30)),
  savingThrowKeys: z.array(z.string()),
  skillKeys: z.array(z.string()),
  expertiseSkillKeys: z.array(z.string()),
  skillOverrides: z.record(z.string(), z.number().int()),
  defenses: z.array(npcCreatureDefenseInputSchema),
  senses: z.array(npcCreatureSenseInputSchema),
  languageKeys: z.array(z.string()),
  traits: z.array(npcCreatureTraitInputSchema),
  actions: z.array(npcCreatureActionInputSchema),
  attacks: z.array(npcCreatureAttackInputSchema),
  multiattacks: z.array(npcCreatureMultiattackInputSchema),
  magicalAbilities: z.array(npcCreatureMagicalAbilityInputSchema),
});

const optionalUuidSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().uuid().optional(),
);

const npcSheetInputSchema = commonNpcCreatureSheetInputSchema.extend({
  ancestryId: optionalUuidSchema,
  subAncestryId: optionalUuidSchema,
  backgroundId: optionalUuidSchema,
  classes: z
    .array(
      z.object({
        classId: z.string().uuid(),
        subclassId: optionalUuidSchema,
        level: z.number().int().min(1).max(20),
        isPrimary: z.boolean(),
      }),
    )
    .max(20),
  role: z.string().max(500).optional(),
  faction: z.string().max(1000).optional(),
  personality: z.string().max(3000).optional(),
  motivation: z.string().max(3000).optional(),
  behavior: z.string().max(3000).optional(),
  tactics: z.string().max(3000).optional(),
  lore: z.string().max(10000).optional(),
  notes: z.string().max(5000).optional(),
});

const creatureSheetInputSchema = commonNpcCreatureSheetInputSchema.extend({
  creatureType: z.string().max(300).optional(),
  habitat: z.string().max(2000).optional(),
  behavior: z.string().max(3000).optional(),
  tactics: z.string().max(3000).optional(),
  lore: z.string().max(10000).optional(),
  notes: z.string().max(5000).optional(),
  challengeRating: z.string().max(40).optional(),
  experienceReward: z.number().int().min(0),
});

function getActorInitials(name: string, initials?: string) {
  const normalizedInitials = initials?.trim().toUpperCase();

  if (normalizedInitials) {
    return normalizedInitials.slice(0, 3);
  }

  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "AT"
  );
}

function nullableTrimmed(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function getCampaignForGm(campaignId: string, userId: string) {
  return prisma.campaign.findFirst({
    where: {
      id: campaignId,
      OR: [
        { ownerId: userId },
        {
          participants: {
            some: {
              userId,
              role: "GM",
              status: "APPROVED",
            },
          },
        },
      ],
    },
    include: {
      participants: {
        where: {
          userId,
          role: "GM",
          status: "APPROVED",
        },
        take: 1,
      },
    },
  });
}

async function resolveNpcOriginAndClasses(
  systemId: string,
  input: z.infer<typeof npcSheetInputSchema>,
) {
  const [ancestry, subAncestry, background, classes] = await Promise.all([
    input.ancestryId
      ? prisma.ancestry.findFirst({
          where: {
            id: input.ancestryId,
            systemId,
          },
        })
      : null,
    input.subAncestryId
      ? prisma.subAncestry.findFirst({
          where: {
            id: input.subAncestryId,
            systemId,
          },
        })
      : null,
    input.backgroundId
      ? prisma.background.findFirst({
          where: {
            id: input.backgroundId,
            systemId,
          },
        })
      : null,
    input.classes.length > 0
      ? prisma.characterClass.findMany({
          where: {
            systemId,
            id: {
              in: input.classes.map((entry) => entry.classId),
            },
          },
          include: {
            subclasses: true,
          },
        })
      : [],
  ]);

  if (input.ancestryId && !ancestry) {
    throw new Error("A ancestralidade selecionada não pertence ao sistema.");
  }

  if (input.subAncestryId && !subAncestry) {
    throw new Error(
      "A sub-ancestralidade selecionada não pertence ao sistema.",
    );
  }

  if (subAncestry && !ancestry) {
    throw new Error(
      "Uma sub-ancestralidade exige uma ancestralidade principal.",
    );
  }

  if (
    subAncestry &&
    ancestry &&
    subAncestry.ancestryId !== ancestry.id
  ) {
    throw new Error(
      "A sub-ancestralidade selecionada não pertence à ancestralidade escolhida.",
    );
  }

  if (input.backgroundId && !background) {
    throw new Error("O antecedente selecionado não pertence ao sistema.");
  }

  const uniqueClassIds = new Set(input.classes.map((entry) => entry.classId));

  if (uniqueClassIds.size !== input.classes.length) {
    throw new Error("Uma mesma classe não pode ser adicionada duas vezes.");
  }

  if (classes.length !== input.classes.length) {
    throw new Error("Uma ou mais classes não pertencem ao sistema.");
  }

  const totalLevel = input.classes.reduce(
    (sum, classEntry) => sum + classEntry.level,
    0,
  );

  if (totalLevel > 20) {
    throw new Error(
      "A soma dos níveis de classe do NPC não pode ultrapassar 20.",
    );
  }

  const primaryCount = input.classes.filter(
    (classEntry) => classEntry.isPrimary,
  ).length;

  if (input.classes.length > 0 && primaryCount !== 1) {
    throw new Error(
      "NPCs com classes precisam ter exatamente uma classe principal.",
    );
  }

  const classById = new Map(classes.map((entry) => [entry.id, entry]));

  for (const classEntry of input.classes) {
    if (!classEntry.subclassId) {
      continue;
    }

    const characterClass = classById.get(classEntry.classId);
    const validSubclass = characterClass?.subclasses.some(
      (subclass) => subclass.id === classEntry.subclassId,
    );

    if (!validSubclass) {
      throw new Error(
        "Uma das subclasses selecionadas não pertence à classe correspondente.",
      );
    }
  }

  return {
    ancestry,
    subAncestry,
    background,
  };
}

async function resolveNpcCreatureSystemContent(
  systemId: string,
  input: z.infer<typeof commonNpcCreatureSheetInputSchema>,
) {
  const attributeKeys = Object.keys(input.attributes);
  const uniqueSkillKeys = Array.from(new Set(input.skillKeys));
  const uniqueLanguageKeys = Array.from(new Set(input.languageKeys));
  const uniqueSpellKeys = Array.from(
    new Set(
      input.magicalAbilities
        .map((ability) => ability.spellKey?.trim())
        .filter((key): key is string => Boolean(key)),
    ),
  );

  const [stats, skills, languages, spells] = await Promise.all([
    prisma.stat.findMany({
      where: {
        systemId,
        key: { in: attributeKeys },
      },
    }),
    prisma.skill.findMany({
      where: {
        systemId,
        key: { in: uniqueSkillKeys },
      },
    }),
    prisma.language.findMany({
      where: {
        systemId,
        key: { in: uniqueLanguageKeys },
      },
    }),
    prisma.spell.findMany({
      where: {
        systemId,
        key: { in: uniqueSpellKeys },
      },
    }),
  ]);

  if (stats.length !== attributeKeys.length) {
    throw new Error("Um ou mais atributos não pertencem ao sistema da campanha.");
  }

  if (skills.length !== uniqueSkillKeys.length) {
    throw new Error("Uma ou mais perícias não pertencem ao sistema da campanha.");
  }

  if (languages.length !== uniqueLanguageKeys.length) {
    throw new Error("Um ou mais idiomas não pertencem ao sistema da campanha.");
  }

  if (spells.length !== uniqueSpellKeys.length) {
    throw new Error("Uma ou mais magias informadas não pertencem ao sistema da campanha.");
  }

  return {
    stats,
    skills,
    languages,
    spells,
  };
}

export async function campaignRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/campaigns",
    schema: {
      tags: ["Campaigns"],
      description: "Create a new campaign",
      body: z.object({
        name: z
          .string()
          .min(3, "Campaign name must have at least 3 characters"),

        description: z.string().optional(),

        coverImage: z.string().optional(),

        systemId: z.string().uuid().optional(),

        isPublic: z.boolean().optional(),

        maxPlayers: z
          .number()
          .int()
          .min(1, "Campaign must allow at least 1 player")
          .max(10, "Campaign cannot allow more than 10 players")
          .optional(),
      }),
      response: {
        201: z.object({
          campaign: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            coverImage: z.string().nullable(),
            ownerId: z.string(),
            systemId: z.string().nullable(),
            isPublic: z.boolean(),
            isActive: z.boolean(),
            maxPlayers: z.number(),
            inviteCode: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const inviteCode = crypto.randomUUID().slice(0, 8);

      const campaign = await prisma.campaign.create({
        data: {
          name: request.body.name,
          description: request.body.description,
          coverImage: request.body.coverImage,
          systemId: request.body.systemId,
          ownerId: session.user.id,
          isPublic: request.body.isPublic ?? false,
          maxPlayers: request.body.maxPlayers ?? 5,
          inviteCode,
          participants: {
            create: {
              userId: session.user.id,
              role: "GM",
              status: "APPROVED",
            },
          },
        },
      });

      return reply.status(201).send({
        campaign: {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          coverImage: campaign.coverImage,
          ownerId: campaign.ownerId,
          systemId: campaign.systemId,
          isPublic: campaign.isPublic,
          isActive: campaign.isActive,
          maxPlayers: campaign.maxPlayers,
          inviteCode: campaign.inviteCode,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
        },
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/campaigns",
    schema: {
      tags: ["Campaigns"],
      description: "List campaigns for authenticated user",
      response: {
        200: z.object({
          campaigns: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              coverImage: z.string().nullable(),
              isActive: z.boolean(),
              nextSession: z
                .object({
                  scheduledAt: z.string(),
                })
                .nullable(),
            }),
          ),
        }),
        401: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaigns = await prisma.campaign.findMany({
        where: {
          isActive: true,
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
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sessions: {
            where: {
              scheduledAt: {
                gte: new Date(),
              },
            },
            orderBy: {
              scheduledAt: "asc",
            },
            take: 1,
          },
        },
      });

      return reply.send({
        campaigns: campaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          coverImage: campaign.coverImage,
          isActive: campaign.isActive,
          nextSession: campaign.sessions[0]?.scheduledAt
            ? {
                scheduledAt: campaign.sessions[0].scheduledAt.toISOString(),
              }
            : null,
        })),
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/campaigns/public",
    schema: {
      tags: ["Campaigns"],
      description: "List public active campaigns available to join",
      querystring: z.object({
        q: z.string().optional(),
      }),
      response: {
        200: z.object({
          campaigns: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              coverImage: z.string().nullable(),
              ownerId: z.string(),
              systemId: z.string().nullable(),
              inviteCode: z.string().nullable(),
              createdAt: z.string(),

              owner: z.object({
                id: z.string(),
                name: z.string(),
                image: z.string().nullable(),
              }),

              system: z
                .object({
                  id: z.string(),
                  name: z.string(),
                  slug: z.string().nullable(),
                  version: z.number(),
                })
                .nullable(),

              playersCount: z.number(),
              maxPlayers: z.number(),
              availableSlots: z.number(),
              isFull: z.boolean(),
              canJoin: z.boolean(),

              nextSession: z
                .object({
                  scheduledAt: z.string().nullable(),
                })
                .nullable(),
            }),
          ),
        }),
        401: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const search = request.query.q?.trim();

      const campaigns = await prisma.campaign.findMany({
        where: {
          isPublic: true,
          isActive: true,
          NOT: {
            participants: {
              some: {
                userId: session.user.id,
                status: "APPROVED",
              },
            },
          },
          ...(search
            ? {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    description: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          system: {
            select: {
              id: true,
              name: true,
              slug: true,
              version: true,
            },
          },
          sessions: {
            where: {
              scheduledAt: {
                gte: new Date(),
              },
              isFinished: false,
            },
            orderBy: {
              scheduledAt: "asc",
            },
            take: 1,
            select: {
              scheduledAt: true,
            },
          },
          _count: {
            select: {
              participants: {
                where: {
                  role: "PLAYER",
                  status: "APPROVED",
                },
              },
            },
          },
        },
      });

      return reply.status(200).send({
        campaigns: campaigns.map((campaign) => {
          const playersCount = campaign._count.participants;
          const availableSlots = Math.max(
            campaign.maxPlayers - playersCount,
            0,
          );
          const isFull = availableSlots === 0;
          const canJoin = !isFull;

          return {
            id: campaign.id,
            name: campaign.name,
            description: campaign.description,
            coverImage: campaign.coverImage,
            ownerId: campaign.ownerId,
            systemId: campaign.systemId,
            inviteCode: campaign.inviteCode,
            createdAt: campaign.createdAt.toISOString(),

            owner: campaign.owner,
            system: campaign.system,

            playersCount,
            maxPlayers: campaign.maxPlayers,
            availableSlots,
            isFull,
            canJoin,

            nextSession: campaign.sessions[0]
              ? {
                  scheduledAt: campaign.sessions[0].scheduledAt
                    ? campaign.sessions[0].scheduledAt.toISOString()
                    : null,
                }
              : null,
          };
        }),
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/campaigns/:id",
    schema: {
      tags: ["Campaigns"],
      description: "Get a campaign by id",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
      }),
      response: {
        200: z.object({
          campaign: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            coverImage: z.string().nullable(),
            ownerId: z.string(),
            systemId: z.string().nullable(),
            isPublic: z.boolean(),
            isActive: z.boolean(),
            maxPlayers: z.number(),
            inviteCode: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
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

      return reply.status(200).send({
        campaign: {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          coverImage: campaign.coverImage,
          ownerId: campaign.ownerId,
          systemId: campaign.systemId,
          isPublic: campaign.isPublic,
          isActive: campaign.isActive,
          maxPlayers: campaign.maxPlayers,
          inviteCode: campaign.inviteCode,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
        },
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/campaigns/:id/actors",
    schema: {
      tags: ["Campaigns"],
      description: "List campaign actors",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
      }),
      response: {
        200: z.object({
          actors: z.array(
            z.object({
              id: z.string(),
              campaignId: z.string(),
              ownerId: z.string().nullable(),
              type: z.string(),
              location: z.string(),
              name: z.string(),
              initials: z.string(),
              description: z.string().nullable(),
              portraitUrl: z.string().nullable(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
          ),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
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
      const isApprovedParticipant = Boolean(currentParticipant);
      const isOwner = campaign.ownerId === session.user.id;

      if (!isOwner && !isApprovedParticipant) {
        return reply.status(403).send({
          message: "Forbidden",
        });
      }

      const isGM = currentParticipant?.role === "GM";

      const actors = await prisma.campaignActor.findMany({
        where: {
          campaignId: campaign.id,
          ...(isGM
            ? {}
            : {
                type: "PLAYER_CHARACTER",
                location: "TABLE",
              }),
        },
        orderBy: [
          {
            type: "asc",
          },
          {
            name: "asc",
          },
        ],
      });

      return reply.status(200).send({
        actors: actors.map((actor) => ({
          id: actor.id,
          campaignId: actor.campaignId,
          ownerId: actor.ownerId,
          type: actor.type,
          location: actor.location,
          name: actor.name,
          initials: actor.initials,
          description: actor.description,
          portraitUrl: actor.portraitUrl,
          createdAt: actor.createdAt.toISOString(),
          updatedAt: actor.updatedAt.toISOString(),
        })),
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/campaigns/:id/npc-templates/:templateId/import",
    schema: {
      tags: ["Campaigns"],
      description:
        "Import a complete NPC template into the campaign as an independent actor and NpcSheet",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
        templateId: z.string().uuid("Invalid NPC template id"),
      }),
      response: {
        201: z.object({
          actor: z.any(),
          npcSheet: z.any(),
        }),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
        409: z.object({ message: z.string() }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
          OR: [
            { ownerId: session.user.id },
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
        return reply.status(404).send({ message: "Campaign not found" });
      }

      const isOwner = campaign.ownerId === session.user.id;
      const isGM = campaign.participants[0]?.role === "GM";

      if (!isOwner && !isGM) {
        return reply.status(403).send({
          message: "Only GMs can import NPC templates",
        });
      }

      if (!campaign.systemId) {
        return reply.status(409).send({ message: "Campaign has no system" });
      }

      const npcTemplate = await prisma.npcTemplate.findFirst({
        where: {
          id: request.params.templateId,
          systemId: campaign.systemId,
        },
        include: {
          ancestry: {
            select: { id: true, key: true, name: true },
          },
          subAncestry: {
            select: { id: true, key: true, name: true },
          },
          background: {
            select: { id: true, key: true, name: true },
          },
          classes: {
            orderBy: { order: "asc" },
            include: {
              characterClass: {
                select: { id: true, key: true, name: true },
              },
              subclass: {
                select: { id: true, key: true, name: true },
              },
            },
          },
          stats: {
            include: { stat: true },
          },
          skills: {
            include: { skill: { include: { stat: true } } },
          },
          defenses: true,
          senses: true,
          languages: {
            include: { language: true },
          },
          traits: { orderBy: { order: "asc" } },
          actions: { orderBy: { order: "asc" } },
          attacks: { orderBy: { order: "asc" } },
          multiattacks: {
            orderBy: { order: "asc" },
            include: {
              entries: {
                orderBy: { order: "asc" },
                include: {
                  attack: { select: { id: true, name: true } },
                  action: { select: { id: true, name: true } },
                },
              },
            },
          },
          magicalAbilities: {
            orderBy: { order: "asc" },
            include: {
              spell: {
                select: { id: true, key: true, name: true, level: true },
              },
            },
          },
        },
      });

      if (!npcTemplate) {
        return reply.status(404).send({
          message: "NPC template not found for campaign system",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const actor = await tx.campaignActor.create({
          data: {
            campaignId: campaign.id,
            ownerId: null,
            type: "NPC",
            location: "LIBRARY",
            name: npcTemplate.name,
            initials:
              npcTemplate.initials ??
              getActorInitials(npcTemplate.name),
            description: npcTemplate.description,
            portraitUrl: npcTemplate.portraitUrl,
          },
        });

        const npcSheet = await tx.npcSheet.create({
          data: {
            campaignId: campaign.id,
            systemId: campaign.systemId!,
            campaignActorId: actor.id,
            ancestryId: npcTemplate.ancestryId,
            subAncestryId: npcTemplate.subAncestryId,
            backgroundId: npcTemplate.backgroundId,
            size: npcTemplate.size,
            role: npcTemplate.role,
            faction: npcTemplate.faction,
            personality: npcTemplate.personality,
            motivation: npcTemplate.motivation,
            behavior: npcTemplate.behavior,
            tactics: npcTemplate.tactics,
            lore: npcTemplate.lore,
            notes: npcTemplate.notes,
            portraitUrl: npcTemplate.portraitUrl,
            tokenImageUrl: npcTemplate.tokenImageUrl,
            tokenImageFit: npcTemplate.tokenImageFit,
            armorClass: npcTemplate.armorClass,
            hitPoints: npcTemplate.hitPoints,
            maxHitPoints: npcTemplate.maxHitPoints,
            temporaryHp: npcTemplate.temporaryHp,
            speed: npcTemplate.speed,
            climbSpeed: npcTemplate.climbSpeed,
            swimSpeed: npcTemplate.swimSpeed,
            flySpeed: npcTemplate.flySpeed,
            burrowSpeed: npcTemplate.burrowSpeed,
          },
        });

        if (npcTemplate.classes.length > 0) {
          await tx.npcSheetClass.createMany({
            data: npcTemplate.classes.map((entry) => ({
              npcSheetId: npcSheet.id,
              classId: entry.classId,
              subclassId: entry.subclassId,
              level: entry.level,
              isPrimary: entry.isPrimary,
              order: entry.order,
            })),
          });
        }

        if (npcTemplate.stats.length > 0) {
          await tx.npcSheetStat.createMany({
            data: npcTemplate.stats.map((entry) => ({
              npcSheetId: npcSheet.id,
              statId: entry.statId,
              baseValue: entry.baseValue,
              bonusValue: entry.bonusValue,
              overrideValue: entry.overrideValue,
              isSavingThrowProficient: entry.isSavingThrowProficient,
              savingThrowBonus: entry.savingThrowBonus,
              savingThrowOverride: entry.savingThrowOverride,
            })),
          });
        }

        if (npcTemplate.skills.length > 0) {
          await tx.npcSheetSkill.createMany({
            data: npcTemplate.skills.map((entry) => ({
              npcSheetId: npcSheet.id,
              skillId: entry.skillId,
              isProficient: entry.isProficient,
              expertiseLevel: entry.expertiseLevel,
              bonusValue: entry.bonusValue,
              overrideValue: entry.overrideValue,
              source: entry.source,
            })),
          });
        }

        if (npcTemplate.defenses.length > 0) {
          await tx.npcSheetDefense.createMany({
            data: npcTemplate.defenses.map((entry) => ({
              npcSheetId: npcSheet.id,
              kind: entry.kind,
              damageType: entry.damageType,
              notes: entry.notes,
            })),
          });
        }

        if (npcTemplate.senses.length > 0) {
          await tx.npcSheetSense.createMany({
            data: npcTemplate.senses.map((entry) => ({
              npcSheetId: npcSheet.id,
              name: entry.name,
              range: entry.range,
              notes: entry.notes,
            })),
          });
        }

        if (npcTemplate.languages.length > 0) {
          await tx.npcSheetLanguage.createMany({
            data: npcTemplate.languages.map((entry) => ({
              npcSheetId: npcSheet.id,
              languageId: entry.languageId,
              notes: entry.notes,
            })),
          });
        }

        if (npcTemplate.traits.length > 0) {
          await tx.npcSheetTrait.createMany({
            data: npcTemplate.traits.map((entry) => ({
              npcSheetId: npcSheet.id,
              name: entry.name,
              description: entry.description,
              order: entry.order,
            })),
          });
        }

        const actionIdMap = new Map<string, string>();
        for (const action of npcTemplate.actions) {
          const createdAction = await tx.npcSheetAction.create({
            data: {
              npcSheetId: npcSheet.id,
              kind: action.kind,
              name: action.name,
              description: action.description,
              uses: action.uses,
              maxUses: action.maxUses,
              recharge: action.recharge,
              order: action.order,
            },
          });
          actionIdMap.set(action.id, createdAction.id);
        }

        const attackIdMap = new Map<string, string>();
        for (const attack of npcTemplate.attacks) {
          const createdAttack = await tx.npcSheetAttack.create({
            data: {
              npcSheetId: npcSheet.id,
              name: attack.name,
              description: attack.description,
              attackType: attack.attackType,
              attackAbilityKey: attack.attackAbilityKey,
              attackBonus: attack.attackBonus,
              damageFormula: attack.damageFormula,
              damageBonus: attack.damageBonus,
              damageType: attack.damageType,
              secondaryDamageFormula: attack.secondaryDamageFormula,
              secondaryDamageType: attack.secondaryDamageType,
              normalRange: attack.normalRange,
              longRange: attack.longRange,
              reach: attack.reach,
              target: attack.target,
              saveAbilityKey: attack.saveAbilityKey,
              saveDc: attack.saveDc,
              onHit: attack.onHit,
              notes: attack.notes,
              order: attack.order,
            },
          });
          attackIdMap.set(attack.id, createdAttack.id);
        }

        for (const multiattack of npcTemplate.multiattacks) {
          const createdMultiattack = await tx.npcSheetMultiattack.create({
            data: {
              npcSheetId: npcSheet.id,
              name: multiattack.name,
              description: multiattack.description,
              order: multiattack.order,
            },
          });

          for (const entry of multiattack.entries) {
            await tx.npcSheetMultiattackEntry.create({
              data: {
                multiattackId: createdMultiattack.id,
                attackId: entry.attackId
                  ? attackIdMap.get(entry.attackId) ?? null
                  : null,
                actionId: entry.actionId
                  ? actionIdMap.get(entry.actionId) ?? null
                  : null,
                quantity: entry.quantity,
                order: entry.order,
                notes: entry.notes,
              },
            });
          }
        }

        for (const ability of npcTemplate.magicalAbilities) {
          await tx.npcSheetMagicalAbility.create({
            data: {
              npcSheetId: npcSheet.id,
              spellId: ability.spellId,
              name: ability.name,
              description: ability.description,
              abilityKey: ability.abilityKey,
              attackBonus: ability.attackBonus,
              saveDc: ability.saveDc,
              damageFormula: ability.damageFormula,
              damageBonus: ability.damageBonus,
              damageType: ability.damageType,
              range: ability.range,
              target: ability.target,
              uses: ability.uses,
              maxUses: ability.maxUses,
              recharge: ability.recharge,
              isPassive: ability.isPassive,
              notes: ability.notes,
              order: ability.order,
            },
          });
        }

        return { actor, npcSheetId: npcSheet.id };
      });

      const npcSheet = await prisma.npcSheet.findUniqueOrThrow({
        where: { id: result.npcSheetId },
        include: {
          ancestry: {
            select: { id: true, key: true, name: true },
          },
          subAncestry: {
            select: { id: true, key: true, name: true },
          },
          background: {
            select: { id: true, key: true, name: true },
          },
          classes: {
            orderBy: { order: "asc" },
            include: {
              characterClass: {
                select: { id: true, key: true, name: true },
              },
              subclass: {
                select: { id: true, key: true, name: true },
              },
            },
          },
          stats: {
            include: { stat: true },
          },
          skills: {
            include: { skill: { include: { stat: true } } },
          },
          defenses: true,
          senses: true,
          languages: {
            include: { language: true },
          },
          traits: { orderBy: { order: "asc" } },
          actions: { orderBy: { order: "asc" } },
          attacks: { orderBy: { order: "asc" } },
          multiattacks: {
            orderBy: { order: "asc" },
            include: {
              entries: {
                orderBy: { order: "asc" },
                include: {
                  attack: { select: { id: true, name: true } },
                  action: { select: { id: true, name: true } },
                },
              },
            },
          },
          magicalAbilities: {
            orderBy: { order: "asc" },
            include: {
              spell: {
                select: { id: true, key: true, name: true, level: true },
              },
            },
          },
        },
      });

      return reply.status(201).send({
        actor: result.actor,
        npcSheet,
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/campaigns/:id/creature-templates/:templateId/import",
    schema: {
      tags: ["Campaigns"],
      description:
        "Import a complete creature template into the campaign as an independent actor and CreatureSheet",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
        templateId: z.string().uuid("Invalid creature template id"),
      }),
      response: {
        201: z.object({
          actor: z.any(),
          creatureSheet: z.any(),
        }),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
        409: z.object({ message: z.string() }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
          OR: [
            { ownerId: session.user.id },
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
        return reply.status(404).send({ message: "Campaign not found" });
      }

      const isOwner = campaign.ownerId === session.user.id;
      const isGM = campaign.participants[0]?.role === "GM";

      if (!isOwner && !isGM) {
        return reply.status(403).send({
          message: "Only GMs can import creature templates",
        });
      }

      if (!campaign.systemId) {
        return reply.status(409).send({ message: "Campaign has no system" });
      }

      const creatureTemplate = await prisma.creatureTemplate.findFirst({
        where: {
          id: request.params.templateId,
          systemId: campaign.systemId,
        },
        include: {
          stats: {
            include: { stat: true },
          },
          skills: {
            include: { skill: { include: { stat: true } } },
          },
          defenses: true,
          senses: true,
          languages: {
            include: { language: true },
          },
          traits: { orderBy: { order: "asc" } },
          actions: { orderBy: { order: "asc" } },
          attacks: { orderBy: { order: "asc" } },
          multiattacks: {
            orderBy: { order: "asc" },
            include: {
              entries: {
                orderBy: { order: "asc" },
                include: {
                  attack: { select: { id: true, name: true } },
                  action: { select: { id: true, name: true } },
                },
              },
            },
          },
          magicalAbilities: {
            orderBy: { order: "asc" },
            include: {
              spell: {
                select: { id: true, key: true, name: true, level: true },
              },
            },
          },
        },
      });

      if (!creatureTemplate) {
        return reply.status(404).send({
          message: "Creature template not found for campaign system",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const actor = await tx.campaignActor.create({
          data: {
            campaignId: campaign.id,
            ownerId: null,
            type: "CREATURE",
            location: "LIBRARY",
            name: creatureTemplate.name,
            initials:
              creatureTemplate.initials ??
              getActorInitials(creatureTemplate.name),
            description: creatureTemplate.description,
            portraitUrl: creatureTemplate.portraitUrl,
          },
        });

        const creatureSheet = await tx.creatureSheet.create({
          data: {
            campaignId: campaign.id,
            systemId: campaign.systemId!,
            campaignActorId: actor.id,
            size: creatureTemplate.size,
            creatureType: creatureTemplate.creatureType,
            habitat: creatureTemplate.habitat,
            behavior: creatureTemplate.behavior,
            tactics: creatureTemplate.tactics,
            lore: creatureTemplate.lore,
            notes: creatureTemplate.notes,
            portraitUrl: creatureTemplate.portraitUrl,
            tokenImageUrl: creatureTemplate.tokenImageUrl,
            tokenImageFit: creatureTemplate.tokenImageFit,
            armorClass: creatureTemplate.armorClass,
            hitPoints: creatureTemplate.hitPoints,
            maxHitPoints: creatureTemplate.maxHitPoints,
            temporaryHp: creatureTemplate.temporaryHp,
            speed: creatureTemplate.speed,
            climbSpeed: creatureTemplate.climbSpeed,
            swimSpeed: creatureTemplate.swimSpeed,
            flySpeed: creatureTemplate.flySpeed,
            burrowSpeed: creatureTemplate.burrowSpeed,
            challengeRating: creatureTemplate.challengeRating,
            experienceReward: creatureTemplate.experienceReward,
          },
        });

        if (creatureTemplate.stats.length > 0) {
          await tx.creatureSheetStat.createMany({
            data: creatureTemplate.stats.map((entry) => ({
              creatureSheetId: creatureSheet.id,
              statId: entry.statId,
              baseValue: entry.baseValue,
              bonusValue: entry.bonusValue,
              overrideValue: entry.overrideValue,
              isSavingThrowProficient: entry.isSavingThrowProficient,
              savingThrowBonus: entry.savingThrowBonus,
              savingThrowOverride: entry.savingThrowOverride,
            })),
          });
        }

        if (creatureTemplate.skills.length > 0) {
          await tx.creatureSheetSkill.createMany({
            data: creatureTemplate.skills.map((entry) => ({
              creatureSheetId: creatureSheet.id,
              skillId: entry.skillId,
              isProficient: entry.isProficient,
              expertiseLevel: entry.expertiseLevel,
              bonusValue: entry.bonusValue,
              overrideValue: entry.overrideValue,
              source: entry.source,
            })),
          });
        }

        if (creatureTemplate.defenses.length > 0) {
          await tx.creatureSheetDefense.createMany({
            data: creatureTemplate.defenses.map((entry) => ({
              creatureSheetId: creatureSheet.id,
              kind: entry.kind,
              damageType: entry.damageType,
              notes: entry.notes,
            })),
          });
        }

        if (creatureTemplate.senses.length > 0) {
          await tx.creatureSheetSense.createMany({
            data: creatureTemplate.senses.map((entry) => ({
              creatureSheetId: creatureSheet.id,
              name: entry.name,
              range: entry.range,
              notes: entry.notes,
            })),
          });
        }

        if (creatureTemplate.languages.length > 0) {
          await tx.creatureSheetLanguage.createMany({
            data: creatureTemplate.languages.map((entry) => ({
              creatureSheetId: creatureSheet.id,
              languageId: entry.languageId,
              notes: entry.notes,
            })),
          });
        }

        if (creatureTemplate.traits.length > 0) {
          await tx.creatureSheetTrait.createMany({
            data: creatureTemplate.traits.map((entry) => ({
              creatureSheetId: creatureSheet.id,
              name: entry.name,
              description: entry.description,
              order: entry.order,
            })),
          });
        }

        const actionIdMap = new Map<string, string>();
        for (const action of creatureTemplate.actions) {
          const createdAction = await tx.creatureSheetAction.create({
            data: {
              creatureSheetId: creatureSheet.id,
              kind: action.kind,
              name: action.name,
              description: action.description,
              uses: action.uses,
              maxUses: action.maxUses,
              recharge: action.recharge,
              order: action.order,
            },
          });
          actionIdMap.set(action.id, createdAction.id);
        }

        const attackIdMap = new Map<string, string>();
        for (const attack of creatureTemplate.attacks) {
          const createdAttack = await tx.creatureSheetAttack.create({
            data: {
              creatureSheetId: creatureSheet.id,
              name: attack.name,
              description: attack.description,
              attackType: attack.attackType,
              attackAbilityKey: attack.attackAbilityKey,
              attackBonus: attack.attackBonus,
              damageFormula: attack.damageFormula,
              damageBonus: attack.damageBonus,
              damageType: attack.damageType,
              secondaryDamageFormula: attack.secondaryDamageFormula,
              secondaryDamageType: attack.secondaryDamageType,
              normalRange: attack.normalRange,
              longRange: attack.longRange,
              reach: attack.reach,
              target: attack.target,
              saveAbilityKey: attack.saveAbilityKey,
              saveDc: attack.saveDc,
              onHit: attack.onHit,
              notes: attack.notes,
              order: attack.order,
            },
          });
          attackIdMap.set(attack.id, createdAttack.id);
        }

        for (const multiattack of creatureTemplate.multiattacks) {
          const createdMultiattack =
            await tx.creatureSheetMultiattack.create({
              data: {
                creatureSheetId: creatureSheet.id,
                name: multiattack.name,
                description: multiattack.description,
                order: multiattack.order,
              },
            });

          for (const entry of multiattack.entries) {
            await tx.creatureSheetMultiattackEntry.create({
              data: {
                multiattackId: createdMultiattack.id,
                attackId: entry.attackId
                  ? attackIdMap.get(entry.attackId) ?? null
                  : null,
                actionId: entry.actionId
                  ? actionIdMap.get(entry.actionId) ?? null
                  : null,
                quantity: entry.quantity,
                order: entry.order,
                notes: entry.notes,
              },
            });
          }
        }

        for (const ability of creatureTemplate.magicalAbilities) {
          await tx.creatureSheetMagicalAbility.create({
            data: {
              creatureSheetId: creatureSheet.id,
              spellId: ability.spellId,
              name: ability.name,
              description: ability.description,
              abilityKey: ability.abilityKey,
              attackBonus: ability.attackBonus,
              saveDc: ability.saveDc,
              damageFormula: ability.damageFormula,
              damageBonus: ability.damageBonus,
              damageType: ability.damageType,
              range: ability.range,
              target: ability.target,
              uses: ability.uses,
              maxUses: ability.maxUses,
              recharge: ability.recharge,
              isPassive: ability.isPassive,
              notes: ability.notes,
              order: ability.order,
            },
          });
        }

        return { actor, creatureSheetId: creatureSheet.id };
      });

      const creatureSheet = await prisma.creatureSheet.findUniqueOrThrow({
        where: { id: result.creatureSheetId },
        include: {
          stats: {
            include: { stat: true },
          },
          skills: {
            include: { skill: { include: { stat: true } } },
          },
          defenses: true,
          senses: true,
          languages: {
            include: { language: true },
          },
          traits: { orderBy: { order: "asc" } },
          actions: { orderBy: { order: "asc" } },
          attacks: { orderBy: { order: "asc" } },
          multiattacks: {
            orderBy: { order: "asc" },
            include: {
              entries: {
                orderBy: { order: "asc" },
                include: {
                  attack: { select: { id: true, name: true } },
                  action: { select: { id: true, name: true } },
                },
              },
            },
          },
          magicalAbilities: {
            orderBy: { order: "asc" },
            include: {
              spell: {
                select: { id: true, key: true, name: true, level: true },
              },
            },
          },
        },
      });

      return reply.status(201).send({
        actor: result.actor,
        creatureSheet,
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/campaigns/:id/character-templates/:templateId/import",
    schema: {
      tags: ["Campaigns"],
      description:
        "Instantiate a CharacterTemplate as an independent CampaignActor and CharacterSheet",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
        templateId: z.string().uuid("Invalid character template id"),
      }),
      response: {
        201: z.object({
          actor: z.object({
            id: z.string(),
            campaignId: z.string(),
            ownerId: z.string().nullable(),
            type: z.string(),
            location: z.string(),
            name: z.string(),
            initials: z.string(),
            description: z.string().nullable(),
            portraitUrl: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
          characterSheetId: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        409: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
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
          message: "Only GMs can instantiate character templates",
        });
      }

      if (!campaign.systemId) {
        return reply.status(409).send({
          message: "Campaign has no system",
        });
      }

      const characterTemplate = await prisma.characterTemplate.findFirst({
        where: {
          id: request.params.templateId,
          systemId: campaign.systemId,
        },
        include: {
          classes: {
            orderBy: {
              order: "asc",
            },
          },
          stats: true,
          skills: true,
          spells: true,
          equipment: true,
          languages: true,
          featureChoices: true,
          progressionChoices: true,
        },
      });

      if (!characterTemplate) {
        return reply.status(404).send({
          message: "Character template not found for campaign system",
        });
      }

      if (characterTemplate.classes.length === 0) {
        return reply.status(409).send({
          message: "Character template has no class entries",
        });
      }

      const primaryClassEntry =
        characterTemplate.classes.find((classEntry) => classEntry.isPrimary) ??
        characterTemplate.classes[0];

      const initials = characterTemplate.name
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();

      const result = await prisma.$transaction(async (tx) => {
        const actor = await tx.campaignActor.create({
          data: {
            campaignId: campaign.id,
            ownerId: null,
            type: "PLAYER_CHARACTER",
            location: "TABLE",
            name: characterTemplate.name,
            initials: initials || "PC",
            description: characterTemplate.description,
            portraitUrl: characterTemplate.portraitUrl,
          },
        });

        const characterSheet = await tx.characterSheet.create({
          data: {
            campaignId: campaign.id,
            systemId: campaign.systemId!,
            campaignActorId: actor.id,
            ownerId: null,
            ancestryId: characterTemplate.ancestryId,
            subAncestryId: characterTemplate.subAncestryId,
            backgroundId: characterTemplate.backgroundId,
            classId: primaryClassEntry.classId,
            subclassId: primaryClassEntry.subclassId,
            status: "READY",

            name: characterTemplate.name,
            pronouns: characterTemplate.pronouns,
            concept: characterTemplate.concept,
            portraitUrl: characterTemplate.portraitUrl,
            tokenImageUrl: characterTemplate.tokenImageUrl,
            tokenImageFit: characterTemplate.tokenImageFit,

            level: characterTemplate.level,
            experience: 0,
            levelUpAvailable: false,
            hitPoints: characterTemplate.maxHitPoints,
            maxHitPoints: characterTemplate.maxHitPoints,
            temporaryHp: 0,
            hitDiceUsed: 0,
            deathSaveSuccesses: 0,
            deathSaveFailures: 0,
            armorClass: characterTemplate.armorClass,
            speed: characterTemplate.speed,
            inspiration: false,
            classEquipmentMode: characterTemplate.classEquipmentMode,
            backgroundEquipmentMode: characterTemplate.backgroundEquipmentMode,
            startingGold: characterTemplate.startingGold,

            alignment: characterTemplate.alignment,
            faith: characterTemplate.faith,
            lifestyle: characterTemplate.lifestyle,

            hair: characterTemplate.hair,
            skin: characterTemplate.skin,
            eyes: characterTemplate.eyes,
            height: characterTemplate.height,
            weight: characterTemplate.weight,
            age: characterTemplate.age,
            gender: characterTemplate.gender,

            bonds: characterTemplate.bonds,
            flaws: characterTemplate.flaws,
            ideals: characterTemplate.ideals,
            personality: characterTemplate.personality,
            backstory: characterTemplate.backstory,
            organizations: characterTemplate.organizations,
            allies: characterTemplate.allies,
            enemies: characterTemplate.enemies,
            notes: characterTemplate.notes,
            otherNotes: characterTemplate.otherNotes,
            gmNotes: null,

            classes: {
              create: characterTemplate.classes.map((classEntry) => ({
                classId: classEntry.classId,
                subclassId: classEntry.subclassId,
                level: classEntry.level,
                isPrimary: classEntry.id === primaryClassEntry.id,
                order: classEntry.order,
              })),
            },

            stats: {
              create: characterTemplate.stats.map((statEntry) => ({
                statId: statEntry.statId,
                baseValue: statEntry.baseValue,
                bonusValue: statEntry.bonusValue,
                overrideValue: statEntry.overrideValue,
                isSavingThrowProficient:
                  statEntry.isSavingThrowProficient,
              })),
            },

            skills: {
              create: characterTemplate.skills.map((skillEntry) => ({
                skillId: skillEntry.skillId,
                isProficient: skillEntry.isProficient,
                expertiseLevel: skillEntry.expertiseLevel,
                bonusValue: skillEntry.bonusValue,
                overrideValue: skillEntry.overrideValue,
                source: skillEntry.source,
              })),
            },

            spells: {
              create: characterTemplate.spells.map((spellEntry) => ({
                spellId: spellEntry.spellId,
                classId: spellEntry.classId,
                source: spellEntry.source,
                isPrepared: spellEntry.isPrepared,
                isAlwaysPrepared: spellEntry.isAlwaysPrepared,
                uses: spellEntry.uses,
                maxUses: spellEntry.maxUses,
                notes: spellEntry.notes,
              })),
            },

            equipment: {
              create: characterTemplate.equipment.map((equipmentEntry) => ({
                equipmentId: equipmentEntry.equipmentId,
                quantity: equipmentEntry.quantity,
                isEquipped: equipmentEntry.isEquipped,
                isAttuned: equipmentEntry.isAttuned,
                source: equipmentEntry.source,
                notes: equipmentEntry.notes,
              })),
            },

            languages: {
              create: characterTemplate.languages.map((languageEntry) => ({
                languageId: languageEntry.languageId,
                source: languageEntry.source,
              })),
            },

            featureChoices: {
              create: characterTemplate.featureChoices.map((choiceEntry) => ({
                choiceGroupId: choiceEntry.choiceGroupId,
                featureId: choiceEntry.featureId,
                source: choiceEntry.source,
              })),
            },

            progressionChoices: {
              create: characterTemplate.progressionChoices.map(
                (choiceEntry) => ({
                  classId: choiceEntry.classId,
                  talentId: choiceEntry.talentId,
                  classLevel: choiceEntry.classLevel,
                  choiceIndex: choiceEntry.choiceIndex,
                  type: choiceEntry.type,
                  attributeIncreaseMode: choiceEntry.attributeIncreaseMode,
                  attributeIncreases:
                    normalizeCharacterTemplateAttributeIncreases(
                      choiceEntry.attributeIncreases,
                    ),
                }),
              ),
            },
          },
        });

        return {
          actor,
          characterSheetId: characterSheet.id,
        };
      });

      return reply.status(201).send({
        actor: {
          id: result.actor.id,
          campaignId: result.actor.campaignId,
          ownerId: result.actor.ownerId,
          type: result.actor.type,
          location: result.actor.location,
          name: result.actor.name,
          initials: result.actor.initials,
          description: result.actor.description,
          portraitUrl: result.actor.portraitUrl,
          createdAt: result.actor.createdAt.toISOString(),
          updatedAt: result.actor.updatedAt.toISOString(),
        },
        characterSheetId: result.characterSheetId,
      });
    },
  });


  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/campaigns/:id/npc-sheets",
    schema: {
      tags: ["Campaigns"],
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: z.object({
          npcSheets: z.array(z.any()),
        }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
          OR: [
            { ownerId: session.user.id },
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
        return reply.status(404).send({ message: "Campaign not found" });
      }

      const canSeeGmSheets =
        campaign.ownerId === session.user.id ||
        campaign.participants[0]?.role === "GM";

      if (!canSeeGmSheets) {
        return reply.status(200).send({ npcSheets: [] });
      }

      const npcSheets = await prisma.npcSheet.findMany({
        where: {
          campaignId: campaign.id,
        },
        include: {
          ancestry: {
            select: {
              id: true,
              key: true,
              name: true,
            },
          },
          subAncestry: {
            select: {
              id: true,
              key: true,
              name: true,
            },
          },
          background: {
            select: {
              id: true,
              key: true,
              name: true,
            },
          },
          classes: {
            orderBy: {
              order: "asc",
            },
            include: {
              characterClass: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                },
              },
              subclass: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                },
              },
            },
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
          defenses: true,
          senses: true,
          languages: {
            include: {
              language: true,
            },
          },
          traits: {
            orderBy: { order: "asc" },
          },
          actions: {
            orderBy: { order: "asc" },
          },
          attacks: {
            orderBy: { order: "asc" },
          },
          multiattacks: {
            orderBy: { order: "asc" },
            include: {
              entries: {
                orderBy: { order: "asc" },
                include: {
                  attack: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  action: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          magicalAbilities: {
            orderBy: { order: "asc" },
            include: {
              spell: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                  level: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return reply.status(200).send({ npcSheets });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/campaigns/:id/creature-sheets",
    schema: {
      tags: ["Campaigns"],
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: z.object({
          creatureSheets: z.array(z.any()),
        }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
          OR: [
            { ownerId: session.user.id },
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
        return reply.status(404).send({ message: "Campaign not found" });
      }

      const canSeeGmSheets =
        campaign.ownerId === session.user.id ||
        campaign.participants[0]?.role === "GM";

      if (!canSeeGmSheets) {
        return reply.status(200).send({ creatureSheets: [] });
      }

      const creatureSheets = await prisma.creatureSheet.findMany({
        where: {
          campaignId: campaign.id,
        },
        include: {
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
          defenses: true,
          senses: true,
          languages: {
            include: {
              language: true,
            },
          },
          traits: {
            orderBy: { order: "asc" },
          },
          actions: {
            orderBy: { order: "asc" },
          },
          attacks: {
            orderBy: { order: "asc" },
          },
          multiattacks: {
            orderBy: { order: "asc" },
            include: {
              entries: {
                orderBy: { order: "asc" },
                include: {
                  attack: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  action: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          magicalAbilities: {
            orderBy: { order: "asc" },
            include: {
              spell: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                  level: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return reply.status(200).send({ creatureSheets });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/campaigns/:id/npc-sheets",
    schema: {
      tags: ["Campaigns"],
      description: "Create a complete NPC actor and NpcSheet",
      params: z.object({
        id: z.string().uuid(),
      }),
      body: npcSheetInputSchema,
      response: {
        201: z.object({
          actor: z.any(),
          npcSheet: z.any(),
        }),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
        409: z.object({ message: z.string() }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const campaign = await getCampaignForGm(request.params.id, session.user.id);

      if (!campaign) {
        return reply.status(404).send({ message: "Campaign not found" });
      }

      const isOwner = campaign.ownerId === session.user.id;
      const isGM = campaign.participants[0]?.role === "GM";

      if (!isOwner && !isGM) {
        return reply.status(403).send({
          message: "Only GMs can create NPC sheets",
        });
      }

      if (!campaign.systemId) {
        return reply.status(409).send({
          message: "Campaign has no system",
        });
      }

      let systemContent;
      let originAndClasses;

      try {
        [systemContent, originAndClasses] = await Promise.all([
          resolveNpcCreatureSystemContent(
            campaign.systemId,
            request.body,
          ),
          resolveNpcOriginAndClasses(
            campaign.systemId,
            request.body,
          ),
        ]);
      } catch (error) {
        return reply.status(400).send({
          message:
            error instanceof Error
              ? error.message
              : "Invalid system content",
        });
      }

      const statByKey = new Map(
        systemContent.stats.map((stat) => [stat.key, stat]),
      );
      const skillByKey = new Map(
        systemContent.skills.map((skill) => [skill.key, skill]),
      );
      const languageByKey = new Map(
        systemContent.languages.map((language) => [language.key, language]),
      );
      const spellByKey = new Map(
        systemContent.spells.map((spell) => [spell.key, spell]),
      );

      const result = await prisma.$transaction(async (tx) => {
        const actor = await tx.campaignActor.create({
          data: {
            campaignId: campaign.id,
            ownerId: null,
            type: "NPC",
            location: request.body.location,
            name: request.body.name.trim(),
            initials: getActorInitials(
              request.body.name,
              request.body.initials,
            ),
            description: nullableTrimmed(request.body.description),
            portraitUrl: nullableTrimmed(request.body.portraitUrl),
          },
        });

        const npcSheet = await tx.npcSheet.create({
          data: {
            campaignId: campaign.id,
            systemId: campaign.systemId!,
            campaignActorId: actor.id,
            ancestryId: originAndClasses.ancestry?.id ?? null,
            subAncestryId: originAndClasses.subAncestry?.id ?? null,
            backgroundId: originAndClasses.background?.id ?? null,
            size: request.body.size,
            role: nullableTrimmed(request.body.role),
            faction: nullableTrimmed(request.body.faction),
            personality: nullableTrimmed(request.body.personality),
            motivation: nullableTrimmed(request.body.motivation),
            behavior: nullableTrimmed(request.body.behavior),
            tactics: nullableTrimmed(request.body.tactics),
            lore: nullableTrimmed(request.body.lore),
            notes: nullableTrimmed(request.body.notes),
            portraitUrl: nullableTrimmed(request.body.portraitUrl),
            tokenImageUrl: nullableTrimmed(request.body.tokenImageUrl),
            tokenImageFit: request.body.tokenImageFit,
            armorClass: request.body.armorClass,
            hitPoints: Math.min(
              request.body.hitPoints,
              request.body.maxHitPoints,
            ),
            maxHitPoints: request.body.maxHitPoints,
            temporaryHp: request.body.temporaryHp,
            speed: request.body.speed,
            climbSpeed: request.body.climbSpeed,
            swimSpeed: request.body.swimSpeed,
            flySpeed: request.body.flySpeed,
            burrowSpeed: request.body.burrowSpeed,
          },
        });

        if (request.body.classes.length > 0) {
          await tx.npcSheetClass.createMany({
            data: request.body.classes.map((classEntry, order) => ({
              npcSheetId: npcSheet.id,
              classId: classEntry.classId,
              subclassId: classEntry.subclassId || null,
              level: classEntry.level,
              isPrimary: classEntry.isPrimary,
              order,
            })),
          });
        }

        await tx.npcSheetStat.createMany({
          data: Object.entries(request.body.attributes).map(
            ([statKey, baseValue]) => {
              const stat = statByKey.get(statKey);

              if (!stat) {
                throw new Error(`Stat not found: ${statKey}`);
              }

              return {
                npcSheetId: npcSheet.id,
                statId: stat.id,
                baseValue,
                bonusValue: 0,
                overrideValue: null,
                isSavingThrowProficient:
                  request.body.savingThrowKeys.includes(statKey),
                savingThrowBonus: 0,
                savingThrowOverride: null,
              };
            },
          ),
        });

        if (request.body.skillKeys.length > 0) {
          await tx.npcSheetSkill.createMany({
            data: request.body.skillKeys.map((skillKey) => {
              const skill = skillByKey.get(skillKey);

              if (!skill) {
                throw new Error(`Skill not found: ${skillKey}`);
              }

              return {
                npcSheetId: npcSheet.id,
                skillId: skill.id,
                isProficient: true,
                expertiseLevel: request.body.expertiseSkillKeys.includes(
                  skillKey,
                )
                  ? 1
                  : 0,
                bonusValue: 0,
                overrideValue:
                  request.body.skillOverrides[skillKey] ?? null,
                source: "manual",
              };
            }),
          });
        }

        if (request.body.defenses.length > 0) {
          await tx.npcSheetDefense.createMany({
            data: request.body.defenses.map((defense) => ({
              npcSheetId: npcSheet.id,
              kind: defense.kind,
              damageType: defense.damageType.trim(),
              notes: nullableTrimmed(defense.notes),
            })),
          });
        }

        if (request.body.senses.length > 0) {
          await tx.npcSheetSense.createMany({
            data: request.body.senses.map((sense) => ({
              npcSheetId: npcSheet.id,
              name: sense.name.trim(),
              range: sense.range ?? null,
              notes: nullableTrimmed(sense.notes),
            })),
          });
        }

        if (request.body.languageKeys.length > 0) {
          await tx.npcSheetLanguage.createMany({
            data: request.body.languageKeys.map((languageKey) => {
              const language = languageByKey.get(languageKey);

              if (!language) {
                throw new Error(`Language not found: ${languageKey}`);
              }

              return {
                npcSheetId: npcSheet.id,
                languageId: language.id,
                notes: null,
              };
            }),
          });
        }

        if (request.body.traits.length > 0) {
          await tx.npcSheetTrait.createMany({
            data: request.body.traits.map((trait, order) => ({
              npcSheetId: npcSheet.id,
              name: trait.name.trim(),
              description: trait.description.trim(),
              order,
            })),
          });
        }

        const createdActions = [];
        for (const [order, action] of request.body.actions.entries()) {
          createdActions.push(
            await tx.npcSheetAction.create({
              data: {
                npcSheetId: npcSheet.id,
                kind: action.kind,
                name: action.name.trim(),
                description: action.description.trim(),
                uses: action.uses ?? null,
                maxUses: action.maxUses ?? null,
                recharge: nullableTrimmed(action.recharge),
                order,
              },
            }),
          );
        }

        const createdAttacks = [];
        for (const [order, attack] of request.body.attacks.entries()) {
          createdAttacks.push(
            await tx.npcSheetAttack.create({
              data: {
                npcSheetId: npcSheet.id,
                name: attack.name.trim(),
                description: nullableTrimmed(attack.description),
                attackType: attack.attackType,
                attackAbilityKey: nullableTrimmed(
                  attack.attackAbilityKey,
                ),
                attackBonus: attack.attackBonus,
                damageFormula: nullableTrimmed(attack.damageFormula),
                damageBonus: attack.damageBonus,
                damageType: nullableTrimmed(attack.damageType),
                secondaryDamageFormula: nullableTrimmed(
                  attack.secondaryDamageFormula,
                ),
                secondaryDamageType: nullableTrimmed(
                  attack.secondaryDamageType,
                ),
                normalRange: attack.normalRange ?? null,
                longRange: attack.longRange ?? null,
                reach: attack.reach ?? null,
                target: nullableTrimmed(attack.target),
                saveAbilityKey: nullableTrimmed(
                  attack.saveAbilityKey,
                ),
                saveDc: attack.saveDc ?? null,
                onHit: nullableTrimmed(attack.onHit),
                notes: nullableTrimmed(attack.notes),
                order,
              },
            }),
          );
        }

        const actionByName = new Map(
          createdActions.map((action) => [action.name, action]),
        );
        const attackByName = new Map(
          createdAttacks.map((attack) => [attack.name, attack]),
        );

        for (const [order, multiattack] of request.body.multiattacks.entries()) {
          const createdMultiattack = await tx.npcSheetMultiattack.create({
            data: {
              npcSheetId: npcSheet.id,
              name: multiattack.name.trim(),
              description: nullableTrimmed(multiattack.description),
              order,
            },
          });

          for (const [entryOrder, entry] of multiattack.entries.entries()) {
            const attack =
              entry.targetType === "ATTACK"
                ? attackByName.get(entry.targetName.trim())
                : null;
            const action =
              entry.targetType === "ACTION"
                ? actionByName.get(entry.targetName.trim())
                : null;

            if (!attack && !action) {
              throw new Error(
                `Entrada de multiataque não encontrada: ${entry.targetName}`,
              );
            }

            await tx.npcSheetMultiattackEntry.create({
              data: {
                multiattackId: createdMultiattack.id,
                attackId: attack?.id ?? null,
                actionId: action?.id ?? null,
                quantity: entry.quantity,
                order: entryOrder,
                notes: nullableTrimmed(entry.notes),
              },
            });
          }
        }

        for (const [order, ability] of request.body.magicalAbilities.entries()) {
          const spellKey = ability.spellKey?.trim();
          const spell = spellKey ? spellByKey.get(spellKey) : null;

          await tx.npcSheetMagicalAbility.create({
            data: {
              npcSheetId: npcSheet.id,
              spellId: spell?.id ?? null,
              name: ability.name.trim(),
              description: nullableTrimmed(ability.description),
              abilityKey: nullableTrimmed(ability.abilityKey),
              attackBonus: ability.attackBonus ?? null,
              saveDc: ability.saveDc ?? null,
              damageFormula: nullableTrimmed(ability.damageFormula),
              damageBonus: ability.damageBonus,
              damageType: nullableTrimmed(ability.damageType),
              range: nullableTrimmed(ability.range),
              target: nullableTrimmed(ability.target),
              uses: ability.uses ?? null,
              maxUses: ability.maxUses ?? null,
              recharge: nullableTrimmed(ability.recharge),
              isPassive: ability.isPassive,
              notes: nullableTrimmed(ability.notes),
              order,
            },
          });
        }

        return {
          actor,
          npcSheetId: npcSheet.id,
        };
      });

      const npcSheet = await prisma.npcSheet.findUniqueOrThrow({
        where: {
          id: result.npcSheetId,
        },
        include: {
          ancestry: {
            select: { id: true, key: true, name: true },
          },
          subAncestry: {
            select: { id: true, key: true, name: true },
          },
          background: {
            select: { id: true, key: true, name: true },
          },
          classes: {
            orderBy: { order: "asc" },
            include: {
              characterClass: {
                select: { id: true, key: true, name: true },
              },
              subclass: {
                select: { id: true, key: true, name: true },
              },
            },
          },
          stats: { include: { stat: true } },
          skills: {
            include: {
              skill: {
                include: { stat: true },
              },
            },
          },
          defenses: true,
          senses: true,
          languages: { include: { language: true } },
          traits: { orderBy: { order: "asc" } },
          actions: { orderBy: { order: "asc" } },
          attacks: { orderBy: { order: "asc" } },
          multiattacks: {
            orderBy: { order: "asc" },
            include: {
              entries: {
                orderBy: { order: "asc" },
                include: {
                  attack: { select: { id: true, name: true } },
                  action: { select: { id: true, name: true } },
                },
              },
            },
          },
          magicalAbilities: {
            orderBy: { order: "asc" },
            include: {
              spell: {
                select: { id: true, key: true, name: true, level: true },
              },
            },
          },
        },
      });

      return reply.status(201).send({
        actor: result.actor,
        npcSheet,
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/campaigns/:id/creature-sheets",
    schema: {
      tags: ["Campaigns"],
      description: "Create a complete creature actor and CreatureSheet",
      params: z.object({
        id: z.string().uuid(),
      }),
      body: creatureSheetInputSchema,
      response: {
        201: z.object({
          actor: z.any(),
          creatureSheet: z.any(),
        }),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
        409: z.object({ message: z.string() }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const campaign = await getCampaignForGm(request.params.id, session.user.id);

      if (!campaign) {
        return reply.status(404).send({ message: "Campaign not found" });
      }

      const isOwner = campaign.ownerId === session.user.id;
      const isGM = campaign.participants[0]?.role === "GM";

      if (!isOwner && !isGM) {
        return reply.status(403).send({
          message: "Only GMs can create creature sheets",
        });
      }

      if (!campaign.systemId) {
        return reply.status(409).send({
          message: "Campaign has no system",
        });
      }

      let systemContent;

      try {
        systemContent = await resolveNpcCreatureSystemContent(
          campaign.systemId,
          request.body,
        );
      } catch (error) {
        return reply.status(400).send({
          message:
            error instanceof Error
              ? error.message
              : "Invalid system content",
        });
      }

      const statByKey = new Map(
        systemContent.stats.map((stat) => [stat.key, stat]),
      );
      const skillByKey = new Map(
        systemContent.skills.map((skill) => [skill.key, skill]),
      );
      const languageByKey = new Map(
        systemContent.languages.map((language) => [language.key, language]),
      );
      const spellByKey = new Map(
        systemContent.spells.map((spell) => [spell.key, spell]),
      );

      const result = await prisma.$transaction(async (tx) => {
        const actor = await tx.campaignActor.create({
          data: {
            campaignId: campaign.id,
            ownerId: null,
            type: "CREATURE",
            location: request.body.location,
            name: request.body.name.trim(),
            initials: getActorInitials(
              request.body.name,
              request.body.initials,
            ),
            description: nullableTrimmed(request.body.description),
            portraitUrl: nullableTrimmed(request.body.portraitUrl),
          },
        });

        const creatureSheet = await tx.creatureSheet.create({
          data: {
            campaignId: campaign.id,
            systemId: campaign.systemId!,
            campaignActorId: actor.id,
            size: request.body.size,
            creatureType: nullableTrimmed(request.body.creatureType),
            habitat: nullableTrimmed(request.body.habitat),
            behavior: nullableTrimmed(request.body.behavior),
            tactics: nullableTrimmed(request.body.tactics),
            lore: nullableTrimmed(request.body.lore),
            notes: nullableTrimmed(request.body.notes),
            portraitUrl: nullableTrimmed(request.body.portraitUrl),
            tokenImageUrl: nullableTrimmed(request.body.tokenImageUrl),
            tokenImageFit: request.body.tokenImageFit,
            armorClass: request.body.armorClass,
            hitPoints: Math.min(
              request.body.hitPoints,
              request.body.maxHitPoints,
            ),
            maxHitPoints: request.body.maxHitPoints,
            temporaryHp: request.body.temporaryHp,
            speed: request.body.speed,
            climbSpeed: request.body.climbSpeed,
            swimSpeed: request.body.swimSpeed,
            flySpeed: request.body.flySpeed,
            burrowSpeed: request.body.burrowSpeed,
            challengeRating: nullableTrimmed(request.body.challengeRating),
            experienceReward: request.body.experienceReward,
          },
        });

        await tx.creatureSheetStat.createMany({
          data: Object.entries(request.body.attributes).map(
            ([statKey, baseValue]) => {
              const stat = statByKey.get(statKey);

              if (!stat) {
                throw new Error(`Stat not found: ${statKey}`);
              }

              return {
                creatureSheetId: creatureSheet.id,
                statId: stat.id,
                baseValue,
                bonusValue: 0,
                overrideValue: null,
                isSavingThrowProficient:
                  request.body.savingThrowKeys.includes(statKey),
                savingThrowBonus: 0,
                savingThrowOverride: null,
              };
            },
          ),
        });

        if (request.body.skillKeys.length > 0) {
          await tx.creatureSheetSkill.createMany({
            data: request.body.skillKeys.map((skillKey) => {
              const skill = skillByKey.get(skillKey);

              if (!skill) {
                throw new Error(`Skill not found: ${skillKey}`);
              }

              return {
                creatureSheetId: creatureSheet.id,
                skillId: skill.id,
                isProficient: true,
                expertiseLevel: request.body.expertiseSkillKeys.includes(
                  skillKey,
                )
                  ? 1
                  : 0,
                bonusValue: 0,
                overrideValue:
                  request.body.skillOverrides[skillKey] ?? null,
                source: "manual",
              };
            }),
          });
        }

        if (request.body.defenses.length > 0) {
          await tx.creatureSheetDefense.createMany({
            data: request.body.defenses.map((defense) => ({
              creatureSheetId: creatureSheet.id,
              kind: defense.kind,
              damageType: defense.damageType.trim(),
              notes: nullableTrimmed(defense.notes),
            })),
          });
        }

        if (request.body.senses.length > 0) {
          await tx.creatureSheetSense.createMany({
            data: request.body.senses.map((sense) => ({
              creatureSheetId: creatureSheet.id,
              name: sense.name.trim(),
              range: sense.range ?? null,
              notes: nullableTrimmed(sense.notes),
            })),
          });
        }

        if (request.body.languageKeys.length > 0) {
          await tx.creatureSheetLanguage.createMany({
            data: request.body.languageKeys.map((languageKey) => {
              const language = languageByKey.get(languageKey);

              if (!language) {
                throw new Error(`Language not found: ${languageKey}`);
              }

              return {
                creatureSheetId: creatureSheet.id,
                languageId: language.id,
                notes: null,
              };
            }),
          });
        }

        if (request.body.traits.length > 0) {
          await tx.creatureSheetTrait.createMany({
            data: request.body.traits.map((trait, order) => ({
              creatureSheetId: creatureSheet.id,
              name: trait.name.trim(),
              description: trait.description.trim(),
              order,
            })),
          });
        }

        const createdActions = [];
        for (const [order, action] of request.body.actions.entries()) {
          createdActions.push(
            await tx.creatureSheetAction.create({
              data: {
                creatureSheetId: creatureSheet.id,
                kind: action.kind,
                name: action.name.trim(),
                description: action.description.trim(),
                uses: action.uses ?? null,
                maxUses: action.maxUses ?? null,
                recharge: nullableTrimmed(action.recharge),
                order,
              },
            }),
          );
        }

        const createdAttacks = [];
        for (const [order, attack] of request.body.attacks.entries()) {
          createdAttacks.push(
            await tx.creatureSheetAttack.create({
              data: {
                creatureSheetId: creatureSheet.id,
                name: attack.name.trim(),
                description: nullableTrimmed(attack.description),
                attackType: attack.attackType,
                attackAbilityKey: nullableTrimmed(
                  attack.attackAbilityKey,
                ),
                attackBonus: attack.attackBonus,
                damageFormula: nullableTrimmed(attack.damageFormula),
                damageBonus: attack.damageBonus,
                damageType: nullableTrimmed(attack.damageType),
                secondaryDamageFormula: nullableTrimmed(
                  attack.secondaryDamageFormula,
                ),
                secondaryDamageType: nullableTrimmed(
                  attack.secondaryDamageType,
                ),
                normalRange: attack.normalRange ?? null,
                longRange: attack.longRange ?? null,
                reach: attack.reach ?? null,
                target: nullableTrimmed(attack.target),
                saveAbilityKey: nullableTrimmed(
                  attack.saveAbilityKey,
                ),
                saveDc: attack.saveDc ?? null,
                onHit: nullableTrimmed(attack.onHit),
                notes: nullableTrimmed(attack.notes),
                order,
              },
            }),
          );
        }

        const actionByName = new Map(
          createdActions.map((action) => [action.name, action]),
        );
        const attackByName = new Map(
          createdAttacks.map((attack) => [attack.name, attack]),
        );

        for (const [order, multiattack] of request.body.multiattacks.entries()) {
          const createdMultiattack =
            await tx.creatureSheetMultiattack.create({
              data: {
                creatureSheetId: creatureSheet.id,
                name: multiattack.name.trim(),
                description: nullableTrimmed(multiattack.description),
                order,
              },
            });

          for (const [entryOrder, entry] of multiattack.entries.entries()) {
            const attack =
              entry.targetType === "ATTACK"
                ? attackByName.get(entry.targetName.trim())
                : null;
            const action =
              entry.targetType === "ACTION"
                ? actionByName.get(entry.targetName.trim())
                : null;

            if (!attack && !action) {
              throw new Error(
                `Entrada de multiataque não encontrada: ${entry.targetName}`,
              );
            }

            await tx.creatureSheetMultiattackEntry.create({
              data: {
                multiattackId: createdMultiattack.id,
                attackId: attack?.id ?? null,
                actionId: action?.id ?? null,
                quantity: entry.quantity,
                order: entryOrder,
                notes: nullableTrimmed(entry.notes),
              },
            });
          }
        }

        for (const [order, ability] of request.body.magicalAbilities.entries()) {
          const spellKey = ability.spellKey?.trim();
          const spell = spellKey ? spellByKey.get(spellKey) : null;

          await tx.creatureSheetMagicalAbility.create({
            data: {
              creatureSheetId: creatureSheet.id,
              spellId: spell?.id ?? null,
              name: ability.name.trim(),
              description: nullableTrimmed(ability.description),
              abilityKey: nullableTrimmed(ability.abilityKey),
              attackBonus: ability.attackBonus ?? null,
              saveDc: ability.saveDc ?? null,
              damageFormula: nullableTrimmed(ability.damageFormula),
              damageBonus: ability.damageBonus,
              damageType: nullableTrimmed(ability.damageType),
              range: nullableTrimmed(ability.range),
              target: nullableTrimmed(ability.target),
              uses: ability.uses ?? null,
              maxUses: ability.maxUses ?? null,
              recharge: nullableTrimmed(ability.recharge),
              isPassive: ability.isPassive,
              notes: nullableTrimmed(ability.notes),
              order,
            },
          });
        }

        return {
          actor,
          creatureSheetId: creatureSheet.id,
        };
      });

      const creatureSheet = await prisma.creatureSheet.findUniqueOrThrow({
        where: {
          id: result.creatureSheetId,
        },
        include: {
          stats: { include: { stat: true } },
          skills: {
            include: {
              skill: {
                include: { stat: true },
              },
            },
          },
          defenses: true,
          senses: true,
          languages: { include: { language: true } },
          traits: { orderBy: { order: "asc" } },
          actions: { orderBy: { order: "asc" } },
          attacks: { orderBy: { order: "asc" } },
          multiattacks: {
            orderBy: { order: "asc" },
            include: {
              entries: {
                orderBy: { order: "asc" },
                include: {
                  attack: { select: { id: true, name: true } },
                  action: { select: { id: true, name: true } },
                },
              },
            },
          },
          magicalAbilities: {
            orderBy: { order: "asc" },
            include: {
              spell: {
                select: { id: true, key: true, name: true, level: true },
              },
            },
          },
        },
      });

      return reply.status(201).send({
        actor: result.actor,
        creatureSheet,
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/campaigns/:id/actors",
    schema: {
      tags: ["Campaigns"],
      description: "Create a campaign actor",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
      }),
      body: z.object({
        name: z.string().min(1, "Actor name is required").max(80),
        type: z.enum(["PLAYER_CHARACTER", "NPC", "CREATURE"]),
        location: z.enum(["TABLE", "LIBRARY", "ARCHIVED"]).optional(),
        initials: z.string().min(1).max(3).optional(),
        description: z.string().max(1000).nullable().optional(),
        portraitUrl: z.string().nullable().optional(),
        ownerId: z.string().nullable().optional(),
      }),
      response: {
        201: z.object({
          actor: z.object({
            id: z.string(),
            campaignId: z.string(),
            ownerId: z.string().nullable(),
            type: z.string(),
            location: z.string(),
            name: z.string(),
            initials: z.string(),
            description: z.string().nullable(),
            portraitUrl: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
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
      const isApprovedParticipant = Boolean(currentParticipant);
      const isOwner = campaign.ownerId === session.user.id;

      if (!isOwner && !isApprovedParticipant) {
        return reply.status(403).send({
          message: "Forbidden",
        });
      }

      const isGM = currentParticipant?.role === "GM";

      if (!isGM && request.body.type !== "PLAYER_CHARACTER") {
        return reply.status(403).send({
          message: "Only GMs can create NPCs or creatures",
        });
      }

      const ownerId =
        request.body.type === "PLAYER_CHARACTER"
          ? (request.body.ownerId ?? session.user.id)
          : null;

      if (!isGM && ownerId !== session.user.id) {
        return reply.status(403).send({
          message: "Players can only create actors for themselves",
        });
      }

      const actor = await prisma.campaignActor.create({
        data: {
          campaignId: campaign.id,
          ownerId,
          type: request.body.type,
          location: request.body.location ?? "TABLE",
          name: request.body.name,
          initials:
            request.body.initials ??
            request.body.name
              .trim()
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 3)
              .toUpperCase(),
          description: request.body.description,
          portraitUrl: request.body.portraitUrl,
        },
      });

      return reply.status(201).send({
        actor: {
          id: actor.id,
          campaignId: actor.campaignId,
          ownerId: actor.ownerId,
          type: actor.type,
          location: actor.location,
          name: actor.name,
          initials: actor.initials,
          description: actor.description,
          portraitUrl: actor.portraitUrl,
          createdAt: actor.createdAt.toISOString(),
          updatedAt: actor.updatedAt.toISOString(),
        },
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/campaigns/:id/tokens",
    schema: {
      tags: ["Campaigns"],
      description: "List campaign scene tokens",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
      }),
      response: {
        200: z.object({
          tokens: z.array(
            z.object({
              id: z.string(),
              campaignId: z.string(),
              actorId: z.string(),
              name: z.string(),
              initials: z.string(),
              type: z.string(),
              imageUrl: z.string().nullable(),
              imageFit: z.string(),
              x: z.number(),
              y: z.number(),
              width: z.number(),
              height: z.number(),
              createdAt: z.string(),
              updatedAt: z.string(),
              actor: z.object({
                id: z.string(),
                ownerId: z.string().nullable(),
                type: z.string(),
                location: z.string(),
                name: z.string(),
                initials: z.string(),
                portraitUrl: z.string().nullable(),
              }),
            }),
          ),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
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

      const isOwner = campaign.ownerId === session.user.id;

      if (!isOwner) {
        const participant = await prisma.participant.findFirst({
          where: {
            campaignId: campaign.id,
            userId: session.user.id,
            status: "APPROVED",
          },
        });

        if (!participant) {
          return reply.status(403).send({
            message: "Forbidden",
          });
        }
      }

      const tokens = await prisma.sceneToken.findMany({
        where: {
          campaignId: campaign.id,
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          actor: {
            select: {
              id: true,
              ownerId: true,
              type: true,
              location: true,
              name: true,
              initials: true,
              portraitUrl: true,
            },
          },
        },
      });

      return reply.status(200).send({
        tokens: tokens.map((token) => ({
          id: token.id,
          campaignId: token.campaignId,
          actorId: token.actorId,
          name: token.name,
          initials: token.initials,
          type: token.type,
          imageUrl: token.imageUrl,
          imageFit: token.imageFit,
          x: token.x,
          y: token.y,
          width: token.width,
          height: token.height,
          createdAt: token.createdAt.toISOString(),
          updatedAt: token.updatedAt.toISOString(),
          actor: {
            id: token.actor.id,
            ownerId: token.actor.ownerId,
            type: token.actor.type,
            location: token.actor.location,
            name: token.actor.name,
            initials: token.actor.initials,
            portraitUrl: token.actor.portraitUrl,
          },
        })),
      });
    },
  });

    app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/campaigns/:campaignId/tokens/:tokenId",
    schema: {
      tags: ["Campaigns"],
      description: "Update a scene token",
      params: z.object({
        campaignId: z.string().uuid("Invalid campaign id"),
        tokenId: z.string().uuid("Invalid token id"),
      }),
      body: z
        .object({
          name: z.string().min(1).max(80).optional(),
          initials: z.string().min(1).max(3).optional(),
          imageUrl: z.string().nullable().optional(),
          imageFit: z.enum(["COVER", "CONTAIN", "FILL"]).optional(),
          x: z.number().int().min(0).optional(),
          y: z.number().int().min(0).optional(),
          width: z.number().int().min(40).max(512).optional(),
          height: z.number().int().min(40).max(512).optional(),
        })
        .refine(
          (data) =>
            data.name !== undefined ||
            data.initials !== undefined ||
            data.imageUrl !== undefined ||
            data.imageFit !== undefined ||
            data.x !== undefined ||
            data.y !== undefined ||
            data.width !== undefined ||
            data.height !== undefined,
          {
            message: "At least one field must be provided",
          },
        ),
      response: {
        200: z.object({
          token: z.object({
            id: z.string(),
            campaignId: z.string(),
            actorId: z.string(),
            name: z.string(),
            initials: z.string(),
            type: z.string(),
            imageUrl: z.string().nullable(),
            imageFit: z.string(),
            x: z.number(),
            y: z.number(),
            width: z.number(),
            height: z.number(),
            createdAt: z.string(),
            updatedAt: z.string(),
            actor: z.object({
              id: z.string(),
              ownerId: z.string().nullable(),
              type: z.string(),
              location: z.string(),
              name: z.string(),
              initials: z.string(),
              portraitUrl: z.string().nullable(),
            }),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.campaignId,
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
      const isGM = currentParticipant?.role === "GM";

      const token = await prisma.sceneToken.findFirst({
        where: {
          id: request.params.tokenId,
          campaignId: campaign.id,
        },
        include: {
          actor: {
            select: {
              id: true,
              ownerId: true,
              type: true,
              location: true,
              name: true,
              initials: true,
              portraitUrl: true,
            },
          },
        },
      });

      if (!token) {
        return reply.status(404).send({
          message: "Token not found",
        });
      }

      if (!isGM) {
        const isActorOwner = token.actor.ownerId === session.user.id;

        if (!isActorOwner) {
          return reply.status(403).send({
            message: "Players can only move their own tokens",
          });
        }

        const playerTriedToEditVisualFields =
          request.body.name !== undefined ||
          request.body.initials !== undefined ||
          request.body.imageUrl !== undefined ||
          request.body.imageFit !== undefined ||
          request.body.width !== undefined ||
          request.body.height !== undefined;

        if (playerTriedToEditVisualFields) {
          return reply.status(403).send({
            message: "Players can only update token position",
          });
        }
      }

      const updatedToken = await prisma.sceneToken.update({
        where: {
          id: token.id,
        },
        data: {
          name: request.body.name,
          initials: request.body.initials,
          imageUrl: request.body.imageUrl,
          imageFit: request.body.imageFit,
          x: request.body.x,
          y: request.body.y,
          width: request.body.width,
          height: request.body.height,
        },
        include: {
          actor: {
            select: {
              id: true,
              ownerId: true,
              type: true,
              location: true,
              name: true,
              initials: true,
              portraitUrl: true,
            },
          },
        },
      });

      return reply.status(200).send({
        token: {
          id: updatedToken.id,
          campaignId: updatedToken.campaignId,
          actorId: updatedToken.actorId,
          name: updatedToken.name,
          initials: updatedToken.initials,
          type: updatedToken.type,
          imageUrl: updatedToken.imageUrl,
          imageFit: updatedToken.imageFit,
          x: updatedToken.x,
          y: updatedToken.y,
          width: updatedToken.width,
          height: updatedToken.height,
          createdAt: updatedToken.createdAt.toISOString(),
          updatedAt: updatedToken.updatedAt.toISOString(),
          actor: {
            id: updatedToken.actor.id,
            ownerId: updatedToken.actor.ownerId,
            type: updatedToken.actor.type,
            location: updatedToken.actor.location,
            name: updatedToken.actor.name,
            initials: updatedToken.actor.initials,
            portraitUrl: updatedToken.actor.portraitUrl,
          },
        },
      });
    },
  });

    app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/campaigns/:campaignId/tokens/:tokenId",
    schema: {
      tags: ["Campaigns"],
      description: "Delete a scene token",
      params: z.object({
        campaignId: z.string().uuid("Invalid campaign id"),
        tokenId: z.string().uuid("Invalid token id"),
      }),
      response: {
        200: z.object({
          message: z.string(),
          deletedTokenId: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.campaignId,
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
      const isGM = currentParticipant?.role === "GM";

      if (!isGM) {
        return reply.status(403).send({
          message: "Only GMs can delete scene tokens",
        });
      }

      const token = await prisma.sceneToken.findFirst({
        where: {
          id: request.params.tokenId,
          campaignId: campaign.id,
        },
      });

      if (!token) {
        return reply.status(404).send({
          message: "Token not found",
        });
      }

      await prisma.sceneToken.delete({
        where: {
          id: token.id,
        },
      });

      return reply.status(200).send({
        message: "Scene token deleted",
        deletedTokenId: token.id,
      });
    },
  });

  

    app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/campaigns/:id/tokens",
    schema: {
      tags: ["Campaigns"],
      description: "Create a scene token",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
      }),
      body: z.object({
        actorId: z.string().uuid("Invalid actor id"),
        name: z.string().min(1).max(80).optional(),
        initials: z.string().min(1).max(3).optional(),
        imageUrl: z.string().nullable().optional(),
        imageFit: z.enum(["COVER", "CONTAIN", "FILL"]).optional(),
        x: z.number().int().min(0).optional(),
        y: z.number().int().min(0).optional(),
        width: z.number().int().min(40).max(512).optional(),
        height: z.number().int().min(40).max(512).optional(),
      }),
      response: {
        201: z.object({
          token: z.object({
            id: z.string(),
            campaignId: z.string(),
            actorId: z.string(),
            name: z.string(),
            initials: z.string(),
            type: z.string(),
            imageUrl: z.string().nullable(),
            imageFit: z.string(),
            x: z.number(),
            y: z.number(),
            width: z.number(),
            height: z.number(),
            createdAt: z.string(),
            updatedAt: z.string(),
            actor: z.object({
              id: z.string(),
              ownerId: z.string().nullable(),
              type: z.string(),
              location: z.string(),
              name: z.string(),
              initials: z.string(),
              portraitUrl: z.string().nullable(),
            }),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        409: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
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
      const isGM = currentParticipant?.role === "GM";

      if (!isGM) {
        return reply.status(403).send({
          message: "Only GMs can create scene tokens",
        });
      }

      const actor = await prisma.campaignActor.findFirst({
        where: {
          id: request.body.actorId,
          campaignId: campaign.id,
        },
      });

      if (!actor) {
        return reply.status(404).send({
          message: "Actor not found",
        });
      }

      if (actor.location !== "TABLE") {
        return reply.status(409).send({
          message: "Only actors on the table can receive scene tokens",
        });
      }

      const token = await prisma.sceneToken.create({
        data: {
          campaignId: campaign.id,
          actorId: actor.id,
          name: request.body.name ?? actor.name,
          initials: request.body.initials ?? actor.initials,
          type: actor.type,
          imageUrl: request.body.imageUrl ?? actor.portraitUrl,
          imageFit: request.body.imageFit ?? "COVER",
          x: request.body.x ?? 300,
          y: request.body.y ?? 340,
          width: request.body.width ?? 80,
          height: request.body.height ?? 80,
        },
        include: {
          actor: {
            select: {
              id: true,
              ownerId: true,
              type: true,
              location: true,
              name: true,
              initials: true,
              portraitUrl: true,
            },
          },
        },
      });

      return reply.status(201).send({
        token: {
          id: token.id,
          campaignId: token.campaignId,
          actorId: token.actorId,
          name: token.name,
          initials: token.initials,
          type: token.type,
          imageUrl: token.imageUrl,
          imageFit: token.imageFit,
          x: token.x,
          y: token.y,
          width: token.width,
          height: token.height,
          createdAt: token.createdAt.toISOString(),
          updatedAt: token.updatedAt.toISOString(),
          actor: {
            id: token.actor.id,
            ownerId: token.actor.ownerId,
            type: token.actor.type,
            location: token.actor.location,
            name: token.actor.name,
            initials: token.actor.initials,
            portraitUrl: token.actor.portraitUrl,
          },
        },
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/campaigns/:campaignId/actors/:actorId",
    schema: {
      tags: ["Campaigns"],
      description: "Update a campaign actor",
      params: z.object({
        campaignId: z.string().uuid("Invalid campaign id"),
        actorId: z.string().uuid("Invalid actor id"),
      }),
      body: z
        .object({
          name: z.string().min(1).max(80).optional(),
          initials: z.string().min(1).max(3).optional(),
          description: z.string().max(1000).nullable().optional(),
          portraitUrl: z.string().nullable().optional(),
          location: z.enum(["TABLE", "LIBRARY", "ARCHIVED"]).optional(),
        })
        .refine(
          (data) =>
            data.name !== undefined ||
            data.initials !== undefined ||
            data.description !== undefined ||
            data.portraitUrl !== undefined ||
            data.location !== undefined,
          {
            message: "At least one field must be provided",
          },
        ),
      response: {
        200: z.object({
          actor: z.object({
            id: z.string(),
            campaignId: z.string(),
            ownerId: z.string().nullable(),
            type: z.string(),
            location: z.string(),
            name: z.string(),
            initials: z.string(),
            description: z.string().nullable(),
            portraitUrl: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.campaignId,
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
      const isApprovedParticipant = Boolean(currentParticipant);
      const isOwner = campaign.ownerId === session.user.id;

      if (!isOwner && !isApprovedParticipant) {
        return reply.status(403).send({
          message: "Forbidden",
        });
      }

      const isGM = currentParticipant?.role === "GM";

      const actor = await prisma.campaignActor.findFirst({
        where: {
          id: request.params.actorId,
          campaignId: campaign.id,
        },
      });

      if (!actor) {
        return reply.status(404).send({
          message: "Actor not found",
        });
      }

      if (!isGM) {
        const isActorOwner = actor.ownerId === session.user.id;

        if (!isActorOwner || actor.type !== "PLAYER_CHARACTER") {
          return reply.status(403).send({
            message: "Players can only update their own player character",
          });
        }

        if (request.body.location !== undefined) {
          return reply.status(403).send({
            message: "Players cannot move actors between table and library",
          });
        }
      }

      if (
        isGM &&
        actor.type === "PLAYER_CHARACTER" &&
        request.body.location !== undefined
      ) {
        return reply.status(403).send({
          message: "Player characters cannot be moved to library yet",
        });
      }

      const updatedActor = await prisma.$transaction(async (tx) => {
        const nextActor = await tx.campaignActor.update({
          where: {
            id: actor.id,
          },
          data: {
            name: request.body.name,
            initials: request.body.initials,
            description: request.body.description,
            portraitUrl: request.body.portraitUrl,
            location: request.body.location,
          },
        });

        if (
          actor.type === "PLAYER_CHARACTER" &&
          (request.body.name !== undefined ||
            request.body.portraitUrl !== undefined)
        ) {
          await tx.characterSheet.updateMany({
            where: {
              campaignId: campaign.id,
              campaignActorId: actor.id,
            },
            data: {
              name: request.body.name,
              portraitUrl: request.body.portraitUrl,
            },
          });
        }

        return nextActor;
      });

      return reply.status(200).send({
        actor: {
          id: updatedActor.id,
          campaignId: updatedActor.campaignId,
          ownerId: updatedActor.ownerId,
          type: updatedActor.type,
          location: updatedActor.location,
          name: updatedActor.name,
          initials: updatedActor.initials,
          description: updatedActor.description,
          portraitUrl: updatedActor.portraitUrl,
          createdAt: updatedActor.createdAt.toISOString(),
          updatedAt: updatedActor.updatedAt.toISOString(),
        },
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/campaigns/:campaignId/actors/:actorId",
    schema: {
      tags: ["Campaigns"],
      description:
        "Delete an unassigned player-character campaign instance and its sheet",
      params: z.object({
        campaignId: z.string().uuid("Invalid campaign id"),
        actorId: z.string().uuid("Invalid actor id"),
      }),
      response: {
        200: z.object({
          deletedActorId: z.string(),
          deletedCharacterSheetId: z.string().nullable(),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        409: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.campaignId,
          OR: [
            {
              ownerId: session.user.id,
            },
            {
              participants: {
                some: {
                  userId: session.user.id,
                  role: "GM",
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
              role: "GM",
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

      const isOwner = campaign.ownerId === session.user.id;
      const isGM = campaign.participants[0]?.role === "GM";

      if (!isOwner && !isGM) {
        return reply.status(403).send({
          message: "Only GMs can delete campaign character instances",
        });
      }

      const actor = await prisma.campaignActor.findFirst({
        where: {
          id: request.params.actorId,
          campaignId: campaign.id,
        },
        include: {
          characterSheet: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!actor) {
        return reply.status(404).send({
          message: "Actor not found",
        });
      }

      if (actor.type !== "PLAYER_CHARACTER" || actor.ownerId !== null) {
        return reply.status(409).send({
          message:
            "Only unassigned player-character instances can be deleted by this action",
        });
      }

      const deletedCharacterSheetId = actor.characterSheet?.id ?? null;

      await prisma.$transaction(async (tx) => {
        if (deletedCharacterSheetId) {
          await tx.characterSheet.delete({
            where: {
              id: deletedCharacterSheetId,
            },
          });
        }

        await tx.campaignActor.delete({
          where: {
            id: actor.id,
          },
        });
      });

      return reply.status(200).send({
        deletedActorId: actor.id,
        deletedCharacterSheetId,
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/campaigns/:id",
    schema: {
      tags: ["Campaigns"],
      description: "Update a campaign",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
      }),
      body: z
        .object({
          name: z
            .string()
            .min(3, "Campaign name must have at least 3 characters")
            .optional(),

          description: z.string().nullable().optional(),

          coverImage: z.string().nullable().optional(),

          systemId: z.string().uuid().nullable().optional(),

          isPublic: z.boolean().optional(),

          maxPlayers: z
            .number()
            .int()
            .min(1, "Campaign must allow at least 1 player")
            .max(10, "Campaign cannot allow more than 10 players")
            .optional(),
        })
        .refine(
          (data) =>
            data.name !== undefined ||
            data.description !== undefined ||
            data.coverImage !== undefined ||
            data.systemId !== undefined ||
            data.isPublic !== undefined ||
            data.maxPlayers !== undefined,
          {
            message: "At least one field must be provided",
          },
        ),
      response: {
        200: z.object({
          campaign: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            coverImage: z.string().nullable(),
            ownerId: z.string(),
            systemId: z.string().nullable(),
            isPublic: z.boolean(),
            isActive: z.boolean(),
            maxPlayers: z.number(),
            inviteCode: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        409: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: request.params.id,
          ownerId: session.user.id,
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      if (campaign.ownerId !== session.user.id) {
        return reply.status(403).send({
          message: "Forbidden",
        });
      }

      if (
        request.body.systemId !== undefined &&
        campaign.systemId !== null &&
        request.body.systemId !== campaign.systemId
      ) {
        return reply.status(409).send({
          message:
            "Campaign system cannot be changed after it has been defined",
        });
      }

      if (request.body.maxPlayers !== undefined) {
        const approvedPlayersCount = await prisma.participant.count({
          where: {
            campaignId: campaign.id,
            role: "PLAYER",
            status: "APPROVED",
          },
        });

        if (request.body.maxPlayers < approvedPlayersCount) {
          return reply.status(409).send({
            message:
              "Campaign max players cannot be lower than the current approved players count",
          });
        }
      }

      const updatedCampaign = await prisma.campaign.update({
        where: {
          id: campaign.id,
        },
        data: {
          name: request.body.name,
          description: request.body.description,
          coverImage: request.body.coverImage,
          systemId: request.body.systemId,
          isPublic: request.body.isPublic,
          maxPlayers: request.body.maxPlayers,
        },
      });

      return reply.status(200).send({
        campaign: {
          id: updatedCampaign.id,
          name: updatedCampaign.name,
          description: updatedCampaign.description,
          coverImage: updatedCampaign.coverImage,
          ownerId: updatedCampaign.ownerId,
          systemId: updatedCampaign.systemId,
          isPublic: updatedCampaign.isPublic,
          isActive: updatedCampaign.isActive,
          maxPlayers: updatedCampaign.maxPlayers,
          inviteCode: updatedCampaign.inviteCode,
          createdAt: updatedCampaign.createdAt.toISOString(),
          updatedAt: updatedCampaign.updatedAt.toISOString(),
        },
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/campaigns/:id",
    schema: {
      tags: ["Campaigns"],
      description: "Delete campaign",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
      }),
      response: {
        200: z.object({
          message: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findUnique({
        where: {
          id: request.params.id,
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      if (campaign.ownerId !== session.user.id) {
        return reply.status(403).send({
          message: "Forbidden",
        });
      }

      await prisma.campaign.delete({
        where: {
          id: campaign.id,
        },
      });

      return reply.status(200).send({
        message: "Campaign deleted successfully",
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/campaigns/join",
    schema: {
      tags: ["Campaigns"],
      description: "Join a campaign using campaign id or invite code",
      body: z
        .object({
          campaignId: z.string().uuid().optional(),
          inviteCode: z
            .string()
            .min(3, "Invite code must have at least 3 characters")
            .max(20, "Invite code must have at most 20 characters")
            .optional(),
        })
        .refine((data) => data.campaignId || data.inviteCode, {
          message: "Campaign id or invite code is required",
        }),
      response: {
        201: z.object({
          participant: z.object({
            id: z.string(),
            campaignId: z.string(),
            userId: z.string(),
            role: z.string(),
            status: z.string(),
            joinedAt: z.string(),
            removedAt: z.string().nullable(),
            createdAt: z.string(),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        409: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaignWhere = request.body.campaignId
        ? {
            id: request.body.campaignId,
          }
        : {
            inviteCode: request.body.inviteCode,
          };

      const campaign = await prisma.campaign.findFirst({
        where: campaignWhere,
        include: {
          participants: {
            where: {
              userId: session.user.id,
              status: {
                not: "REMOVED",
              },
            },
          },
          _count: {
            select: {
              participants: {
                where: {
                  role: "PLAYER",
                  status: "APPROVED",
                },
              },
            },
          },
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      if (!campaign.isActive) {
        return reply.status(403).send({
          message: "Campaign is inactive",
        });
      }

      const isJoiningByInviteCode = Boolean(request.body.inviteCode);

      if (!campaign.isPublic && !isJoiningByInviteCode) {
        return reply.status(403).send({
          message: "Campaign is private",
        });
      }

      const alreadyParticipant = campaign.participants[0];

      if (alreadyParticipant) {
        return reply.status(409).send({
          message: "User already in this campaign",
        });
      }

      const playersCount = campaign._count.participants;

      if (playersCount >= campaign.maxPlayers) {
        return reply.status(409).send({
          message: "Campaign is full",
        });
      }

      const participantStatus = request.body.inviteCode
        ? "APPROVED"
        : "PENDING";

      const participant = await prisma.participant.create({
        data: {
          userId: session.user.id,
          campaignId: campaign.id,
          role: "PLAYER",
          status: participantStatus,
        },
      });

      return reply.status(201).send({
        participant: {
          id: participant.id,
          campaignId: participant.campaignId,
          userId: participant.userId,
          role: participant.role,
          status: participant.status,
          joinedAt: participant.joinedAt.toISOString(),
          removedAt: participant.removedAt
            ? participant.removedAt.toISOString()
            : null,
          createdAt: participant.createdAt.toISOString(),
        },
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/campaigns/:id/participants",
    schema: {
      tags: ["Campaigns"],
      description: "List campaign participants",
      params: z.object({
        id: z.string().uuid("Invalid campaign id"),
      }),
      response: {
        200: z.object({
          participants: z.array(
            z.object({
              id: z.string(),
              campaignId: z.string(),
              userId: z.string(),
              role: z.string(),
              status: z.string(),
              joinedAt: z.string(),
              removedAt: z.string().nullable(),
              createdAt: z.string(),
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                image: z.string().nullable(),
              }),
            }),
          ),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        501: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findUnique({
        where: {
          id: request.params.id,
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      const isOwner = campaign.ownerId === session.user.id;

      const participant = await prisma.participant.findFirst({
        where: {
          campaignId: campaign.id,
          userId: session.user.id,
        },
      });

      if (!isOwner && !participant) {
        return reply.status(403).send({
          message: "Forbidden",
        });
      }

      const canManageParticipants = isOwner || participant?.role === "GM";

      const participants = await prisma.participant.findMany({
        where: {
          campaignId: campaign.id,
          status: canManageParticipants
            ? {
                in: ["APPROVED", "PENDING"],
              }
            : "APPROVED",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return reply.status(200).send({
        participants: participants.map((participant) => ({
          ...participant,
          joinedAt: participant.joinedAt.toISOString(),
          removedAt: participant.removedAt
            ? participant.removedAt.toISOString()
            : null,
          createdAt: participant.createdAt.toISOString(),
        })),
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/campaigns/:campaignId/participants/:participantId/role",
    schema: {
      tags: ["Campaigns"],
      description: "Update participant role",
      params: z.object({
        campaignId: z.string().uuid("Invalid campaign id"),
        participantId: z.string().uuid("Invalid participant id"),
      }),
      body: z.object({
        role: z.enum(["GM", "PLAYER"]),
      }),
      response: {
        200: z.object({
          participant: z.object({
            id: z.string(),
            campaignId: z.string(),
            userId: z.string(),
            role: z.string(),
            status: z.string(),
            joinedAt: z.string(),
            removedAt: z.string().nullable(),
            createdAt: z.string(),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findUnique({
        where: {
          id: request.params.campaignId,
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      if (campaign.ownerId !== session.user.id) {
        return reply.status(403).send({
          message: "Only the campaign owner can change participant roles",
        });
      }

      const participant = await prisma.participant.findFirst({
        where: {
          id: request.params.participantId,
          campaignId: campaign.id,
          status: "APPROVED",
        },
      });

      if (!participant) {
        return reply.status(404).send({
          message: "Participant not found",
        });
      }

      const updatedParticipant = await prisma.$transaction(async (tx) => {
        if (request.body.role === "GM") {
          await tx.participant.updateMany({
            where: {
              campaignId: campaign.id,
              role: "GM",
              status: "APPROVED",
              NOT: {
                id: participant.id,
              },
            },
            data: {
              role: "PLAYER",
            },
          });
        }

        return tx.participant.update({
          where: {
            id: participant.id,
          },
          data: {
            role: request.body.role,
          },
        });
      });

      return reply.status(200).send({
        participant: {
          id: updatedParticipant.id,
          campaignId: updatedParticipant.campaignId,
          userId: updatedParticipant.userId,
          role: updatedParticipant.role,
          status: updatedParticipant.status,
          joinedAt: updatedParticipant.joinedAt.toISOString(),
          removedAt: updatedParticipant.removedAt
            ? updatedParticipant.removedAt.toISOString()
            : null,
          createdAt: updatedParticipant.createdAt.toISOString(),
        },
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/campaigns/:campaignId/participants/:participantId/status",
    schema: {
      tags: ["Campaigns"],
      description: "Update participant status",
      params: z.object({
        campaignId: z.string().uuid("Invalid campaign id"),
        participantId: z.string().uuid("Invalid participant id"),
      }),
      body: z.object({
        status: z.enum(["APPROVED", "REJECTED"]),
      }),
      response: {
        200: z.object({
          participant: z.object({
            id: z.string(),
            campaignId: z.string(),
            userId: z.string(),
            role: z.string(),
            status: z.string(),
            joinedAt: z.string(),
            removedAt: z.string().nullable(),
            createdAt: z.string(),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        409: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findUnique({
        where: {
          id: request.params.campaignId,
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      const requesterParticipant = await prisma.participant.findFirst({
        where: {
          campaignId: campaign.id,
          userId: session.user.id,
          status: "APPROVED",
        },
      });

      const isOwner = campaign.ownerId === session.user.id;
      const isGM = requesterParticipant?.role === "GM";

      if (!isOwner && !isGM) {
        return reply.status(403).send({
          message:
            "Only the campaign owner or GM can update participant status",
        });
      }

      const participant = await prisma.participant.findFirst({
        where: {
          id: request.params.participantId,
          campaignId: campaign.id,
        },
      });

      if (!participant) {
        return reply.status(404).send({
          message: "Participant not found",
        });
      }

      if (participant.status !== "PENDING") {
        return reply.status(409).send({
          message: "Only pending participants can be approved or rejected",
        });
      }

      if (request.body.status === "APPROVED") {
        const approvedPlayersCount = await prisma.participant.count({
          where: {
            campaignId: campaign.id,
            role: "PLAYER",
            status: "APPROVED",
          },
        });

        if (approvedPlayersCount >= campaign.maxPlayers) {
          return reply.status(409).send({
            message: "Campaign is full",
          });
        }
      }

      const updatedParticipant = await prisma.participant.update({
        where: {
          id: participant.id,
        },
        data: {
          status: request.body.status,
        },
      });

      return reply.status(200).send({
        participant: {
          id: updatedParticipant.id,
          campaignId: updatedParticipant.campaignId,
          userId: updatedParticipant.userId,
          role: updatedParticipant.role,
          status: updatedParticipant.status,
          joinedAt: updatedParticipant.joinedAt.toISOString(),
          removedAt: updatedParticipant.removedAt
            ? updatedParticipant.removedAt.toISOString()
            : null,
          createdAt: updatedParticipant.createdAt.toISOString(),
        },
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/campaigns/:campaignId/participants/:participantId",
    schema: {
      tags: ["Campaigns"],
      description: "Remove participant from campaign",
      params: z.object({
        campaignId: z.string().uuid("Invalid campaign id"),
        participantId: z.string().uuid("Invalid participant id"),
      }),
      response: {
        200: z.object({
          message: z.string(),
          participant: z.object({
            id: z.string(),
            campaignId: z.string(),
            userId: z.string(),
            role: z.string(),
            status: z.string(),
            joinedAt: z.string(),
            removedAt: z.string().nullable(),
            createdAt: z.string(),
          }),
        }),
        400: z.object({
          message: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request);

      if (!session?.user) {
        return reply.status(401).send({
          message: "Unauthorized",
        });
      }

      const campaign = await prisma.campaign.findUnique({
        where: {
          id: request.params.campaignId,
        },
      });

      if (!campaign) {
        return reply.status(404).send({
          message: "Campaign not found",
        });
      }

      const requesterParticipant = await prisma.participant.findFirst({
        where: {
          campaignId: campaign.id,
          userId: session.user.id,
          status: "APPROVED",
        },
      });

      const isOwner = campaign.ownerId === session.user.id;
      const isGM = requesterParticipant?.role === "GM";

      if (!isOwner && !isGM) {
        return reply.status(403).send({
          message: "Only the campaign owner or GM can remove participants",
        });
      }

      const participant = await prisma.participant.findFirst({
        where: {
          id: request.params.participantId,
          campaignId: campaign.id,
          status: "APPROVED",
        },
      });

      if (!participant) {
        return reply.status(404).send({
          message: "Participant not found",
        });
      }

      if (participant.userId === campaign.ownerId) {
        return reply.status(400).send({
          message: "Campaign owner cannot be removed from the campaign",
        });
      }

      if (!isOwner && participant.role === "GM") {
        return reply.status(403).send({
          message: "Only the campaign owner can remove a GM",
        });
      }

      const removedParticipant = await prisma.participant.update({
        where: {
          id: participant.id,
        },
        data: {
          status: "REMOVED",
          removedAt: new Date(),
          role: "PLAYER",
        },
      });

      return reply.status(200).send({
        message: "Participant removed successfully",
        participant: {
          id: removedParticipant.id,
          campaignId: removedParticipant.campaignId,
          userId: removedParticipant.userId,
          role: removedParticipant.role,
          status: removedParticipant.status,
          joinedAt: removedParticipant.joinedAt.toISOString(),
          removedAt: removedParticipant.removedAt
            ? removedParticipant.removedAt.toISOString()
            : null,
          createdAt: removedParticipant.createdAt.toISOString(),
        },
      });
    },
  });
}
