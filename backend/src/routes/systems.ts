import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { getAuthenticatedSession } from "../lib/get-authenticated-session.js";
import { prisma } from "../lib/prisma.js";

export async function systemRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/systems",
    schema: {
      tags: ["Systems"],
      description: "List available RPG systems",
      response: {
        200: z.object({
          systems: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string().nullable(),
              version: z.number(),
              createdAt: z.string(),
              stats: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                }),
              ),
              skills: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  statId: z.string(),
                  stat: z.object({
                    id: z.string(),
                    name: z.string(),
                  }),
                }),
              ),
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

      const systems = await prisma.gameSystem.findMany({
        orderBy: {
          name: "asc",
        },
        include: {
          stats: {
            orderBy: {
              name: "asc",
            },
            select: {
              id: true,
              name: true,
            },
          },
          skills: {
            orderBy: {
              name: "asc",
            },
            select: {
              id: true,
              name: true,
              statId: true,
              stat: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return reply.status(200).send({
        systems: systems.map((system) => ({
          id: system.id,
          name: system.name,
          slug: system.slug,
          version: system.version,
          createdAt: system.createdAt.toISOString(),
          stats: system.stats,
          skills: system.skills,
        })),
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/systems/:systemId/character-options",
    schema: {
      tags: ["Systems"],
      description: "List character builder options for a RPG system",
      params: z.object({
        systemId: z.string().uuid("Invalid system id"),
      }),
      response: {
        200: z.object({
          system: z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string().nullable(),
            version: z.number(),
          }),
          classes: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              hitDie: z.number().nullable(),
            }),
          ),
          ancestries: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              defaultSizeCategory: z.string(),
            }),
          ),
          backgrounds: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              skillKeys: z.array(z.string()),
              toolNames: z.array(z.string()),
              languageChoiceCount: z.number(),
              startingGold: z.number(),
            }),
          ),
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

      const { systemId } = request.params;

      const system = await prisma.gameSystem.findUnique({
        where: {
          id: systemId,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          version: true,
        },
      });

      if (!system) {
        return reply.status(404).send({
          message: "System not found",
        });
      }

      const [classes, ancestries, backgrounds] = await Promise.all([
        prisma.characterClass.findMany({
          where: {
            systemId,
          },
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            hitDie: true,
          },
        }),

        prisma.ancestry.findMany({
          where: {
            systemId,
          },
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            defaultSizeCategory: true,
          },
        }),

        prisma.background.findMany({
          where: {
            systemId,
          },
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            skillKeys: true,
            toolNames: true,
            languageChoiceCount: true,
            startingGold: true,
          },
        }),
      ]);

      return reply.status(200).send({
        system,
        classes,
        ancestries,
        backgrounds,
      });
    },
  });
}
