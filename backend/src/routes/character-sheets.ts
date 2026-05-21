import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { getAuthenticatedSession } from "../lib/get-authenticated-session.js";
import { prisma } from "../lib/prisma.js";

export async function characterSheetsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

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
        include: {
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
        },
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
        include: {
          campaignActor: true,
          system: true,
          ancestry: true,
          background: true,
          characterClass: true,
          subclass: true,
        },
      });

      return reply.status(201).send({ characterSheet });
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
      const data = request.body;

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

      if (data.classId) {
        const characterClass = await prisma.characterClass.findFirst({
          where: {
            id: data.classId,
            systemId: characterSheet.systemId,
          },
        });

        if (!characterClass) {
          return reply.status(404).send({
            message: "Character class not found for this system",
          });
        }
      }

      if (data.ancestryId) {
        const ancestry = await prisma.ancestry.findFirst({
          where: {
            id: data.ancestryId,
            systemId: characterSheet.systemId,
          },
        });

        if (!ancestry) {
          return reply.status(404).send({
            message: "Ancestry not found for this system",
          });
        }
      }

      if (data.backgroundId) {
        const background = await prisma.background.findFirst({
          where: {
            id: data.backgroundId,
            systemId: characterSheet.systemId,
          },
        });

        if (!background) {
          return reply.status(404).send({
            message: "Background not found for this system",
          });
        }
      }

      if (data.subclassId) {
        const subclass = await prisma.characterSubclass.findFirst({
          where: {
            id: data.subclassId,
            systemId: characterSheet.systemId,
          },
        });

        if (!subclass) {
          return reply.status(404).send({
            message: "Subclass not found for this system",
          });
        }
      }

      const sanitizedData = {
        ...data,
        pronouns:
          data.pronouns === undefined
            ? undefined
            : data.pronouns?.trim() || null,
        concept:
          data.concept === undefined ? undefined : data.concept?.trim() || null,
        portraitUrl:
          data.portraitUrl === undefined
            ? undefined
            : data.portraitUrl?.trim() || null,
        tokenImageUrl:
          data.tokenImageUrl === undefined
            ? undefined
            : data.tokenImageUrl?.trim() || null,
        alignment:
          data.alignment === undefined
            ? undefined
            : data.alignment?.trim() || null,
        faith:
          data.faith === undefined ? undefined : data.faith?.trim() || null,
        lifestyle:
          data.lifestyle === undefined
            ? undefined
            : data.lifestyle?.trim() || null,
        hair: data.hair === undefined ? undefined : data.hair?.trim() || null,
        skin: data.skin === undefined ? undefined : data.skin?.trim() || null,
        eyes: data.eyes === undefined ? undefined : data.eyes?.trim() || null,
        height:
          data.height === undefined ? undefined : data.height?.trim() || null,
        weight:
          data.weight === undefined ? undefined : data.weight?.trim() || null,
        age: data.age === undefined ? undefined : data.age?.trim() || null,
        gender:
          data.gender === undefined ? undefined : data.gender?.trim() || null,
        bonds:
          data.bonds === undefined ? undefined : data.bonds?.trim() || null,
        flaws:
          data.flaws === undefined ? undefined : data.flaws?.trim() || null,
        ideals:
          data.ideals === undefined ? undefined : data.ideals?.trim() || null,
        personality:
          data.personality === undefined
            ? undefined
            : data.personality?.trim() || null,
        backstory:
          data.backstory === undefined
            ? undefined
            : data.backstory?.trim() || null,
        notes:
          data.notes === undefined ? undefined : data.notes?.trim() || null,
        gmNotes:
          data.gmNotes === undefined ? undefined : data.gmNotes?.trim() || null,
      };

      const updatedCharacterSheet = await prisma.characterSheet.update({
        where: {
          id: sheetId,
        },
        data: sanitizedData,
        include: {
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
        },
      });

      return reply.status(200).send({
        characterSheet: updatedCharacterSheet,
      });
    },
  );
}
