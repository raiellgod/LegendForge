import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { getAuthenticatedSession } from "../lib/get-authenticated-session.js";
import { prisma } from "../lib/prisma.js";

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
          ...campaign,
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
          nextSession: campaign.sessions[0]
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
      description: "List public active campaigns",
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
              participantsCount: z.number(),
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
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });

      return reply.status(200).send({
        campaigns: campaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          coverImage: campaign.coverImage,
          ownerId: campaign.ownerId,
          systemId: campaign.systemId,
          inviteCode: campaign.inviteCode,
          createdAt: campaign.createdAt.toISOString(),
          owner: campaign.owner,
          participantsCount: campaign._count.participants,
        })),
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
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
        },
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
        })
        .refine(
          (data) =>
            data.name !== undefined ||
            data.description !== undefined ||
            data.coverImage !== undefined ||
            data.systemId !== undefined ||
            data.isPublic !== undefined,
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
        },
      });

      return reply.status(200).send({
        campaign: {
          ...updatedCampaign,
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
      description: "Join a campaign using invite code",
      body: z.object({
        inviteCode: z
          .string()
          .min(3, "Invite code must have at least 3 characters")
          .max(20, "Invite code must have at most 20 characters"),
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
          inviteCode: request.body.inviteCode,
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

      const alreadyParticipant = await prisma.participant.findFirst({
        where: {
          campaignId: campaign.id,
          userId: session.user.id,
          status: {
            not: "REMOVED",
          },
        },
      });

      if (alreadyParticipant) {
        return reply.status(409).send({
          message: "User already in this campaign",
        });
      }

      const participant = await prisma.participant.create({
        data: {
          userId: session.user.id,
          campaignId: campaign.id,
          role: "PLAYER",
          status: "APPROVED",
        },
      });

      return reply.status(201).send({
        participant: {
          ...participant,
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

      const participants = await prisma.participant.findMany({
        where: {
          campaignId: campaign.id,
          status: "APPROVED",
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
          message: "Forbidden",
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

      if (request.body.role === "GM") {
        // 1. procurar GM atual
        const currentGM = await prisma.participant.findFirst({
          where: {
            campaignId: campaign.id,
            role: "GM",
            NOT: {
              id: participant.id,
            },
          },
        });

        // 2. se existir, rebaixar para PLAYER
        if (currentGM) {
          await prisma.participant.update({
            where: {
              id: currentGM.id,
            },
            data: {
              role: "PLAYER",
            },
          });
        }
      }

      const updatedParticipant = await prisma.$transaction(async (tx) => {
        if (request.body.role === "GM") {
          await tx.participant.updateMany({
            where: {
              campaignId: campaign.id,
              role: "GM",
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
          ...updatedParticipant,
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

      if (campaign.ownerId !== session.user.id) {
        return reply.status(403).send({
          message: "Forbidden",
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

      if (participant.userId === campaign.ownerId) {
        return reply.status(400).send({
          message: "Owner cannot be removed",
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.participant.delete({
          where: {
            id: participant.id,
          },
        });

        if (participant.role === "GM") {
          const ownerParticipant = await tx.participant.findFirst({
            where: {
              campaignId: campaign.id,
              userId: campaign.ownerId,
            },
          });

          if (ownerParticipant) {
            await tx.participant.update({
              where: {
                id: ownerParticipant.id,
              },
              data: {
                role: "GM",
              },
            });
          }
        }
      });

      return reply.status(200).send({
        message: "Participant removed successfully",
      });
    },
  });
}
