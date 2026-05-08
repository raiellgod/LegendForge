import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { getAuthenticatedSession } from '../lib/get-authenticated-session.js'
import { prisma } from '../lib/prisma.js'

export async function systemRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/systems',
    schema: {
      tags: ['Systems'],
      description: 'List available RPG systems',
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
                })
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
                })
              ),
            })
          ),
        }),
        401: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request)

      if (!session?.user) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      const systems = await prisma.gameSystem.findMany({
        orderBy: {
          name: 'asc',
        },
        include: {
          stats: {
            orderBy: {
              name: 'asc',
            },
            select: {
              id: true,
              name: true,
            },
          },
          skills: {
            orderBy: {
              name: 'asc',
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
      })

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
      })
    },
  })
}