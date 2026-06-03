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
              spellcastingAbilityKey: z.string().nullable(),
              levelProgressions: z.array(
                z.object({
                  level: z.number(),
                  proficiencyBonus: z.number().nullable(),
                  cantripsKnown: z.number(),
                  spellsKnown: z.number(),
                  spellsPrepared: z.number(),
                  spellSlotsLevel1: z.number(),
                  spellSlotsLevel2: z.number(),
                  spellSlotsLevel3: z.number(),
                  spellSlotsLevel4: z.number(),
                  spellSlotsLevel5: z.number(),
                  spellSlotsLevel6: z.number(),
                  spellSlotsLevel7: z.number(),
                  spellSlotsLevel8: z.number(),
                  spellSlotsLevel9: z.number(),
                }),
              ),
              classSpells: z.array(
                z.object({
                  spellKey: z.string(),
                  minimumClassLevel: z.number(),
                  isAlwaysKnown: z.boolean(),
                }),
              ),
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
          skills: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              statId: z.string(),
              stat: z.object({
                id: z.string(),
                key: z.string(),
                name: z.string(),
                shortName: z.string(),
              }),
            }),
          ),
          spells: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              level: z.number(),
              school: z.string(),
              castingTime: z.string().nullable(),
              range: z.string().nullable(),
              duration: z.string().nullable(),
              components: z.array(z.string()),
              isRitual: z.boolean(),
              requiresConcentration: z.boolean(),
            }),
          ),
          equipment: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              category: z.string(),
              damage: z.string().nullable(),
              damageFormula: z.string().nullable(),
              damageType: z.string().nullable(),
              defense: z.number().nullable(),
              cost: z.string().nullable(),
              weight: z.number().nullable(),
              properties: z.string().nullable(),
              attackType: z.string(),
              attackAbilityKey: z.string().nullable(),
              alternativeAbilityKey: z.string().nullable(),
              weaponGroup: z.string().nullable(),
              normalRange: z.number().nullable(),
              longRange: z.number().nullable(),
              isFinesse: z.boolean(),
              isThrown: z.boolean(),
              isTwoHanded: z.boolean(),
              isVersatile: z.boolean(),
              versatileDamageFormula: z.string().nullable(),
              attackBonus: z.number(),
              damageBonus: z.number(),
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

      const [classes, ancestries, backgrounds, skills, spells, equipment] =
        await Promise.all([
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
              spellcastingAbilityKey: true,
              subclassSelectionLevel: true,
              levelProgressions: {
                orderBy: {
                  level: "asc",
                },
                select: {
                  level: true,
                  proficiencyBonus: true,
                  cantripsKnown: true,
                  spellsKnown: true,
                  spellsPrepared: true,
                  spellSlotsLevel1: true,
                  spellSlotsLevel2: true,
                  spellSlotsLevel3: true,
                  spellSlotsLevel4: true,
                  spellSlotsLevel5: true,
                  spellSlotsLevel6: true,
                  spellSlotsLevel7: true,
                  spellSlotsLevel8: true,
                  spellSlotsLevel9: true,
                },
              },
              classSpells: {
                orderBy: [
                  {
                    minimumClassLevel: "asc",
                  },
                  {
                    spell: {
                      level: "asc",
                    },
                  },
                  {
                    spell: {
                      name: "asc",
                    },
                  },
                ],
                select: {
                  minimumClassLevel: true,
                  isAlwaysKnown: true,
                  spell: {
                    select: {
                      key: true,
                    },
                  },
                },
              },
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

          prisma.skill.findMany({
            where: {
              systemId,
            },
            orderBy: {
              name: "asc",
            },
            select: {
              id: true,
              key: true,
              name: true,
              description: true,
              statId: true,
              stat: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                  shortName: true,
                },
              },
            },
          }),

          prisma.spell.findMany({
            where: {
              systemId,
            },
            orderBy: [
              {
                level: "asc",
              },
              {
                name: "asc",
              },
            ],
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
            },
          }),

          prisma.equipment.findMany({
            where: {
              systemId,
            },
            orderBy: [
              {
                category: "asc",
              },
              {
                order: "asc",
              },
              {
                name: "asc",
              },
            ],
            select: {
              id: true,
              key: true,
              name: true,
              description: true,
              category: true,
              damage: true,
              damageFormula: true,
              damageType: true,
              defense: true,
              cost: true,
              weight: true,
              properties: true,
              attackType: true,
              attackAbilityKey: true,
              alternativeAbilityKey: true,
              weaponGroup: true,
              normalRange: true,
              longRange: true,
              isFinesse: true,
              isThrown: true,
              isTwoHanded: true,
              isVersatile: true,
              versatileDamageFormula: true,
              attackBonus: true,
              damageBonus: true,
            },
          }),
        ]);

      const normalizedClasses = classes.map((characterClass) => {
        return {
          id: characterClass.id,
          key: characterClass.key,
          name: characterClass.name,
          description: characterClass.description,
          hitDie: characterClass.hitDie,
          spellcastingAbilityKey: characterClass.spellcastingAbilityKey,
          subclassSelectionLevel: characterClass.subclassSelectionLevel,
          levelProgressions: characterClass.levelProgressions.map(
            (progression) => ({
              level: progression.level,
              proficiencyBonus: progression.proficiencyBonus,
              cantripsKnown: progression.cantripsKnown,
              spellsKnown: progression.spellsKnown,
              spellsPrepared: progression.spellsPrepared,
              spellSlotsLevel1: progression.spellSlotsLevel1,
              spellSlotsLevel2: progression.spellSlotsLevel2,
              spellSlotsLevel3: progression.spellSlotsLevel3,
              spellSlotsLevel4: progression.spellSlotsLevel4,
              spellSlotsLevel5: progression.spellSlotsLevel5,
              spellSlotsLevel6: progression.spellSlotsLevel6,
              spellSlotsLevel7: progression.spellSlotsLevel7,
              spellSlotsLevel8: progression.spellSlotsLevel8,
              spellSlotsLevel9: progression.spellSlotsLevel9,
            }),
          ),
          classSpells: characterClass.classSpells.map((classSpell) => ({
            spellKey: classSpell.spell.key,
            minimumClassLevel: classSpell.minimumClassLevel,
            isAlwaysKnown: classSpell.isAlwaysKnown,
          })),
        };
      });

      const normalizedSpells = spells.map((spell) => {
        const components =
          typeof spell.components === "string"
            ? spell.components
                .split(",")
                .map((component) => component.trim())
                .filter(Boolean)
            : [];

        return {
          id: spell.id,
          key: spell.key,
          name: spell.name,
          description: spell.description,
          level: spell.level,
          school: String(spell.school),
          castingTime: spell.castingTime,
          range: spell.range,
          duration: spell.duration,
          components,
          isRitual: spell.isRitual,
          requiresConcentration: spell.requiresConcentration,
        };
      });

      const normalizedEquipment = equipment.map((item) => {
        return {
          id: item.id,
          key: item.key,
          name: item.name,
          description: item.description,
          category: String(item.category),
          damage: item.damage,
          damageFormula: item.damageFormula,
          damageType: item.damageType,
          defense: item.defense,
          cost: item.cost,
          weight: item.weight,
          properties: item.properties,
          attackType: String(item.attackType),
          attackAbilityKey: item.attackAbilityKey,
          alternativeAbilityKey: item.alternativeAbilityKey,
          weaponGroup: item.weaponGroup ? String(item.weaponGroup) : null,
          normalRange: item.normalRange,
          longRange: item.longRange,
          isFinesse: item.isFinesse,
          isThrown: item.isThrown,
          isTwoHanded: item.isTwoHanded,
          isVersatile: item.isVersatile,
          versatileDamageFormula: item.versatileDamageFormula,
          attackBonus: item.attackBonus,
          damageBonus: item.damageBonus,
        };
      });

      return reply.status(200).send({
        system,
        classes: normalizedClasses,
        ancestries,
        backgrounds,
        skills,
        spells: normalizedSpells,
        equipment: normalizedEquipment,
      });
    },
  });
}
