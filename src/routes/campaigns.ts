import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../lib/prisma.js'

async function getAuthenticatedSession(request: {
  headers: {
    authorization?: string
  }
}) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.replace('Bearer ', '').trim()

  const session = await prisma.session.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt < new Date()) {
    return null
  }

  return session
}

export async function campaignRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/campaigns',
    schema: {
      tags: ['Campaigns'],
      description: 'Create a new campaign',
      body: z.object({
        name: z
          .string()
          .min(3, 'Campaign name must have at least 3 characters'),
        isPublic: z.boolean().optional(),
      }),
      response: {
        201: z.object({
          campaign: z.object({
            id: z.string(),
            name: z.string(),
            ownerId: z.string(),
            isPublic: z.boolean(),
            isActive: z.boolean(),
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
      const session = await getAuthenticatedSession(request)

      if (!session?.user) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      const inviteCode = crypto.randomUUID().slice(0, 8)

      const campaign = await prisma.campaign.create({
        data: {
          name: request.body.name,
          ownerId: session.user.id,
          isPublic: request.body.isPublic ?? false,
          inviteCode,
          participants: {
            create: {
              userId: session.user.id,
              role: 'GM',
            },
          },
        },
      })

      return reply.status(201).send({
        campaign: {
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
        },
      })
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/campaigns',
    schema: {
      tags: ['Campaigns'],
      description: 'List campaigns for authenticated user',
      response: {
        200: z.object({
          campaigns: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              ownerId: z.string(),
              isPublic: z.boolean(),
              isActive: z.boolean(),
              inviteCode: z.string().nullable(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
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

      const campaigns = await prisma.campaign.findMany({
        where: {
          OR: [
            {
              ownerId: session.user.id,
            },
            {
              participants: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return reply.status(200).send({
        campaigns: campaigns.map((campaign) => ({
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
        })),
      })
    },
  })

    app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/campaigns/:id',
    schema: {
      tags: ['Campaigns'],
      description: 'Get a campaign by id',
      params: z.object({
        id: z.string().uuid('Invalid campaign id'),
      }),
      response: {
        200: z.object({
          campaign: z.object({
            id: z.string(),
            name: z.string(),
            ownerId: z.string(),
            isPublic: z.boolean(),
            isActive: z.boolean(),
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
      const session = await getAuthenticatedSession(request)

      if (!session?.user) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
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
                },
              },
            },
          ],
        },
      })

      if (!campaign) {
        return reply.status(404).send({
          message: 'Campaign not found',
        })
      }

      return reply.status(200).send({
        campaign: {
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
        },
      })
    },
  })

    app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/campaigns/:id',
    schema: {
      tags: ['Campaigns'],
      description: 'Update a campaign',
      params: z.object({
        id: z.string().uuid('Invalid campaign id'),
      }),
      body: z
        .object({
          name: z
            .string()
            .min(3, 'Campaign name must have at least 3 characters')
            .optional(),
          isPublic: z.boolean().optional(),
        })
        .refine(
          (data) => data.name !== undefined || data.isPublic !== undefined,
          {
            message: 'At least one field must be provided',
          },
        ),
      response: {
        200: z.object({
          campaign: z.object({
            id: z.string(),
            name: z.string(),
            ownerId: z.string(),
            isPublic: z.boolean(),
            isActive: z.boolean(),
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
      },
    },
    handler: async (request, reply) => {
      const session = await getAuthenticatedSession(request)

      if (!session?.user) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      const campaign = await prisma.campaign.findUnique({
        where: {
          id: request.params.id,
        },
      })

      if (!campaign) {
        return reply.status(404).send({
          message: 'Campaign not found',
        })
      }

      if (campaign.ownerId !== session.user.id) {
        return reply.status(403).send({
          message: 'Forbidden',
        })
      }

      const updatedCampaign = await prisma.campaign.update({
        where: {
          id: campaign.id,
        },
        data: {
          name: request.body.name,
          isPublic: request.body.isPublic,
        },
      })

      return reply.status(200).send({
        campaign: {
          ...updatedCampaign,
          createdAt: updatedCampaign.createdAt.toISOString(),
          updatedAt: updatedCampaign.updatedAt.toISOString(),
        },
      })
    },
  })

    app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/campaigns/:id',
    schema: {
      tags: ['Campaigns'],
      description: 'Delete a campaign',
      params: z.object({
        id: z.string().uuid('Invalid campaign id'),
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
      const session = await getAuthenticatedSession(request)

      if (!session?.user) {
        return reply.status(401).send({
          message: 'Unauthorized',
        })
      }

      const campaign = await prisma.campaign.findUnique({
        where: {
          id: request.params.id,
        },
      })

      if (!campaign) {
        return reply.status(404).send({
          message: 'Campaign not found',
        })
      }

      if (campaign.ownerId !== session.user.id) {
        return reply.status(403).send({
          message: 'Forbidden',
        })
      }

      await prisma.campaign.delete({
        where: {
          id: campaign.id,
        },
      })

      return reply.status(200).send({
        message: 'Campaign deleted successfully',
      })
    },
  })
}