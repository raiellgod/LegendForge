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
              primaryRole: z.string().nullable(),
              hitDie: z.number().nullable(),
              spellcastingAbilityKey: z.string().nullable(),
              subclassSelectionLevel: z.number().nullable(),
              classSkillChoiceCount: z.number(),
              weaponProficiencyKeys: z.array(z.string()),
              protectionProficiencyKeys: z.array(z.string()),
              toolProficiencyKeys: z.array(z.string()),
              levelProgressions: z.array(
                z.object({
                  level: z.number(),
                  proficiencyBonus: z.number().nullable(),
                  progressionChoiceCount: z.number(),
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
                  spellLimits: z.array(
                    z.object({
                      spellLevel: z.number(),
                      spellsKnown: z.number(),
                      spellsPrepared: z.number(),
                    }),
                  ),
                }),
              ),
              classSpells: z.array(
                z.object({
                  spellKey: z.string(),
                  minimumClassLevel: z.number(),
                  isAlwaysKnown: z.boolean(),
                }),
              ),
              subclasses: z.array(
                z.object({
                  id: z.string(),
                  key: z.string(),
                  name: z.string(),
                  description: z.string().nullable(),
                  classId: z.string(),
                  order: z.number(),
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
              attributeBonuses: z.record(z.string(), z.number()),
              languageKeys: z.array(z.string()),
            }),
          ),
          subAncestries: z.array(
            z.object({
              id: z.string(),
              ancestryId: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              sizeCategoryOverride: z.string().nullable(),
              attributeBonuses: z.record(z.string(), z.number()),
              languageKeys: z.array(z.string()),
              order: z.number(),
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
              languageKeys: z.array(z.string()),
              startingGold: z.number(),
              attributeBonuses: z.record(z.string(), z.number()),
            }),
          ),
          languages: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
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
          features: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              sourceType: z.string(),
              level: z.number().nullable(),
              order: z.number(),
              ancestryId: z.string().nullable(),
              subAncestryId: z.string().nullable(),
              classId: z.string().nullable(),
              subclassId: z.string().nullable(),
              levelProgressionId: z.string().nullable(),
            }),
          ),
          talents: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              isRepeatable: z.boolean(),
              prerequisites: z.record(z.string(), z.unknown()),
              attributeBonuses: z.record(z.string(), z.number()),
              order: z.number(),
            }),
          ),
          featureChoiceGroups: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              choiceCount: z.number(),
              order: z.number(),
              ancestryId: z.string().nullable(),
              subAncestryId: z.string().nullable(),
              backgroundId: z.string().nullable(),
              classId: z.string().nullable(),
              subclassId: z.string().nullable(),
              levelProgressionId: z.string().nullable(),
              options: z.array(
                z.object({
                  id: z.string(),
                  order: z.number(),
                  feature: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    sourceType: z.string(),
                    level: z.number().nullable(),
                    order: z.number(),
                    ancestryId: z.string().nullable(),
                    subAncestryId: z.string().nullable(),
                    classId: z.string().nullable(),
                    subclassId: z.string().nullable(),
                    levelProgressionId: z.string().nullable(),
                  }),
                }),
              ),
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

      const [
        classes,
        ancestries,
        subAncestries,
        backgrounds,
        languages,
        skills,
        spells,
        features,
        talents,
        featureChoiceGroups,
        equipment,
      ] = await Promise.all([
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
            primaryRole: true,
            hitDie: true,
            spellcastingAbilityKey: true,
            subclassSelectionLevel: true,
            classSkillChoiceCount: true,
            weaponProficiencyKeys: true,
            protectionProficiencyKeys: true,
            toolProficiencyKeys: true,
            levelProgressions: {
              orderBy: {
                level: "asc",
              },
              select: {
                level: true,
                proficiencyBonus: true,
                progressionChoiceCount: true,
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
                spellLimits: {
                  orderBy: {
                    spellLevel: "asc",
                  },
                  select: {
                    spellLevel: true,
                    spellsKnown: true,
                    spellsPrepared: true,
                  },
                },
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
            subclasses: {
              orderBy: {
                order: "asc",
              },
              select: {
                id: true,
                key: true,
                name: true,
                description: true,
                classId: true,
                order: true,
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
            attributeBonuses: true,
            languageKeys: true,
          },
        }),

        prisma.subAncestry.findMany({
          where: {
            systemId,
          },
          orderBy: [
            {
              order: "asc",
            },
            {
              name: "asc",
            },
          ],
          select: {
            id: true,
            ancestryId: true,
            key: true,
            name: true,
            description: true,
            sizeCategoryOverride: true,
            attributeBonuses: true,
            languageKeys: true,
            order: true,
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
            languageKeys: true,
            startingGold: true,
            attributeBonuses: true,
          },
        }),

        prisma.language.findMany({
          where: {
            systemId,
          },
          orderBy: [
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
        prisma.feature.findMany({
          where: {
            systemId,
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
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            sourceType: true,
            level: true,
            order: true,
            ancestryId: true,
            subAncestryId: true,
            classId: true,
            subclassId: true,
            levelProgressionId: true,
          },
        }),

        prisma.talent.findMany({
          where: {
            systemId,
          },
          orderBy: [
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
            isRepeatable: true,
            prerequisites: true,
            attributeBonuses: true,
            order: true,
          },
        }),

        prisma.featureChoiceGroup.findMany({
          where: {
            systemId,
          },
          orderBy: [
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
            choiceCount: true,
            order: true,
            ancestryId: true,
            subAncestryId: true,
            backgroundId: true,
            classId: true,
            subclassId: true,
            levelProgressionId: true,
            options: {
              orderBy: [
                {
                  order: "asc",
                },
                {
                  feature: {
                    name: "asc",
                  },
                },
              ],
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
                    subAncestryId: true,
                    classId: true,
                    subclassId: true,
                    levelProgressionId: true,
                  },
                },
              },
            },
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
          primaryRole: characterClass.primaryRole,
          hitDie: characterClass.hitDie,
          spellcastingAbilityKey: characterClass.spellcastingAbilityKey,
          subclassSelectionLevel: characterClass.subclassSelectionLevel,
          classSkillChoiceCount: characterClass.classSkillChoiceCount,
          weaponProficiencyKeys: characterClass.weaponProficiencyKeys,
          protectionProficiencyKeys: characterClass.protectionProficiencyKeys,
          toolProficiencyKeys: characterClass.toolProficiencyKeys,
          levelProgressions: characterClass.levelProgressions.map(
            (progression) => ({
              level: progression.level,
              proficiencyBonus: progression.proficiencyBonus,
              progressionChoiceCount: progression.progressionChoiceCount,
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
              spellLimits: progression.spellLimits.map((spellLimit) => ({
                spellLevel: spellLimit.spellLevel,
                spellsKnown: spellLimit.spellsKnown,
                spellsPrepared: spellLimit.spellsPrepared,
              })),
            }),
          ),
          classSpells: characterClass.classSpells.map((classSpell) => ({
            spellKey: classSpell.spell.key,
            minimumClassLevel: classSpell.minimumClassLevel,
            isAlwaysKnown: classSpell.isAlwaysKnown,
          })),
          subclasses: characterClass.subclasses.map((subclass) => ({
            id: subclass.id,
            key: subclass.key,
            name: subclass.name,
            description: subclass.description,
            classId: subclass.classId,
            order: subclass.order,
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

      function normalizeAttributeBonuses(
        attributeBonuses: unknown,
      ): Record<string, number> {
        if (!attributeBonuses || typeof attributeBonuses !== "object") {
          return {};
        }

        return Object.fromEntries(
          Object.entries(attributeBonuses).filter(([, value]) => {
            return typeof value === "number" && Number.isFinite(value);
          }),
        );
      }

            function normalizeTalentPrerequisites(
        prerequisites: unknown,
      ): Record<string, unknown> {
        if (
          !prerequisites ||
          typeof prerequisites !== "object" ||
          Array.isArray(prerequisites)
        ) {
          return {};
        }

        return { ...prerequisites };
      }

      const normalizedAncestries = ancestries.map((ancestry) => ({
        ...ancestry,
        attributeBonuses: normalizeAttributeBonuses(ancestry.attributeBonuses),
      }));

      const normalizedSubAncestries = subAncestries.map((subAncestry) => ({
        ...subAncestry,
        sizeCategoryOverride: subAncestry.sizeCategoryOverride
          ? String(subAncestry.sizeCategoryOverride)
          : null,
        attributeBonuses: normalizeAttributeBonuses(
          subAncestry.attributeBonuses,
        ),
      }));

      const normalizedBackgrounds = backgrounds.map((background) => ({
        ...background,
        attributeBonuses: normalizeAttributeBonuses(
          background.attributeBonuses,
        ),
      }));

            const normalizedTalents = talents.map((talent) => ({
        ...talent,
        prerequisites: normalizeTalentPrerequisites(talent.prerequisites),
        attributeBonuses: normalizeAttributeBonuses(talent.attributeBonuses),
      }));

      return reply.status(200).send({
        system,
        classes: normalizedClasses,
        ancestries: normalizedAncestries,
        subAncestries: normalizedSubAncestries,
        backgrounds: normalizedBackgrounds,
        languages,
        skills,
        spells: normalizedSpells,
        features,
        talents: normalizedTalents,
        featureChoiceGroups,
        equipment: normalizedEquipment,
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/systems/:systemId/library",
    schema: {
      tags: ["Systems"],
      description: "List reusable library content for a RPG system",
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
          summary: z.object({
            equipmentCount: z.number(),
            spellCount: z.number(),
            npcTemplateCount: z.number(),
            creatureTemplateCount: z.number(),
            characterTemplateCount: z.number(),
          }),
          equipment: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              imageUrl: z.string().nullable(),
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
              order: z.number(),
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
              order: z.number(),
            }),
          ),
          npcTemplates: z.array(z.any()),
          creatureTemplates: z.array(z.any()),
          characterTemplates: z.array(
            z.object({
              id: z.string(),
              key: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              pronouns: z.string().nullable(),
              concept: z.string().nullable(),
              portraitUrl: z.string().nullable(),
              tokenImageUrl: z.string().nullable(),
              tokenImageFit: z.string(),
              level: z.number(),
              maxHitPoints: z.number(),
              armorClass: z.number(),
              speed: z.number(),
              classEquipmentMode: z.string(),
              backgroundEquipmentMode: z.string(),
              startingGold: z.number(),
              alignment: z.string().nullable(),
              faith: z.string().nullable(),
              lifestyle: z.string().nullable(),
              hair: z.string().nullable(),
              skin: z.string().nullable(),
              eyes: z.string().nullable(),
              height: z.string().nullable(),
              weight: z.string().nullable(),
              age: z.string().nullable(),
              gender: z.string().nullable(),
              bonds: z.string().nullable(),
              flaws: z.string().nullable(),
              ideals: z.string().nullable(),
              personality: z.string().nullable(),
              backstory: z.string().nullable(),
              organizations: z.string().nullable(),
              allies: z.string().nullable(),
              enemies: z.string().nullable(),
              notes: z.string().nullable(),
              otherNotes: z.string().nullable(),
              order: z.number(),
              ancestry: z
                .object({
                  id: z.string(),
                  key: z.string(),
                  name: z.string(),
                })
                .nullable(),
              subAncestry: z
                .object({
                  id: z.string(),
                  key: z.string(),
                  name: z.string(),
                })
                .nullable(),
              background: z
                .object({
                  id: z.string(),
                  key: z.string(),
                  name: z.string(),
                })
                .nullable(),
              classes: z.array(
                z.object({
                  id: z.string(),
                  classId: z.string(),
                  subclassId: z.string().nullable(),
                  level: z.number(),
                  isPrimary: z.boolean(),
                  order: z.number(),
                  characterClass: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                    hitDie: z.number().nullable(),
                    spellcastingAbilityKey: z.string().nullable(),
                  }),
                  subclass: z
                    .object({
                      id: z.string(),
                      key: z.string(),
                      name: z.string(),
                    })
                    .nullable(),
                }),
              ),
              stats: z.array(
                z.object({
                  id: z.string(),
                  baseValue: z.number(),
                  bonusValue: z.number(),
                  overrideValue: z.number().nullable(),
                  isSavingThrowProficient: z.boolean(),
                  stat: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                    shortName: z.string(),
                  }),
                }),
              ),
              skills: z.array(
                z.object({
                  id: z.string(),
                  isProficient: z.boolean(),
                  expertiseLevel: z.number(),
                  bonusValue: z.number(),
                  overrideValue: z.number().nullable(),
                  source: z.string().nullable(),
                  skill: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                  }),
                }),
              ),
              spells: z.array(
                z.object({
                  id: z.string(),
                  classId: z.string().nullable(),
                  source: z.string().nullable(),
                  isPrepared: z.boolean(),
                  isAlwaysPrepared: z.boolean(),
                  uses: z.number().nullable(),
                  maxUses: z.number().nullable(),
                  notes: z.string().nullable(),
                  spell: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                    level: z.number(),
                    school: z.string(),
                  }),
                  characterClass: z
                    .object({
                      id: z.string(),
                      key: z.string(),
                      name: z.string(),
                    })
                    .nullable(),
                }),
              ),
              equipment: z.array(
                z.object({
                  id: z.string(),
                  quantity: z.number(),
                  isEquipped: z.boolean(),
                  isAttuned: z.boolean(),
                  source: z.string().nullable(),
                  notes: z.string().nullable(),
                  equipment: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                    category: z.string(),
                    imageUrl: z.string().nullable(),
                  }),
                }),
              ),
              languages: z.array(
                z.object({
                  id: z.string(),
                  source: z.string().nullable(),
                  language: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                  }),
                }),
              ),
              featureChoices: z.array(
                z.object({
                  id: z.string(),
                  source: z.string(),
                  choiceGroup: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                  }),
                  feature: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                  }),
                }),
              ),
              progressionChoices: z.array(
                z.object({
                  id: z.string(),
                  classId: z.string(),
                  talentId: z.string().nullable(),
                  classLevel: z.number(),
                  choiceIndex: z.number(),
                  type: z.string().nullable(),
                  attributeIncreaseMode: z.string().nullable(),
                  attributeIncreases: z.record(z.string(), z.number()),
                  characterClass: z.object({
                    id: z.string(),
                    key: z.string(),
                    name: z.string(),
                  }),
                  talent: z
                    .object({
                      id: z.string(),
                      key: z.string(),
                      name: z.string(),
                    })
                    .nullable(),
                }),
              ),
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

      const [
        equipment,
        spells,
        npcTemplates,
        creatureTemplates,
        characterTemplates,
      ] = await Promise.all([
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
            imageUrl: true,
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
            order: true,
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
        }),
        prisma.npcTemplate.findMany({
          where: {
            systemId,
          },
          orderBy: [
            { order: "asc" },
            { name: "asc" },
          ],
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
        }),
        prisma.creatureTemplate.findMany({
          where: {
            systemId,
          },
          orderBy: [
            { order: "asc" },
            { name: "asc" },
          ],
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
        }),
        prisma.characterTemplate.findMany({
          where: {
            systemId,
          },
          orderBy: [
            {
              order: "asc",
            },
            {
              name: "asc",
            },
          ],
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
                    hitDie: true,
                    spellcastingAbilityKey: true,
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
                stat: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                    shortName: true,
                  },
                },
              },
            },
            skills: {
              include: {
                skill: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                  },
                },
              },
            },
            spells: {
              include: {
                spell: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                    level: true,
                    school: true,
                  },
                },
                characterClass: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                  },
                },
              },
            },
            equipment: {
              include: {
                equipment: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                    category: true,
                    imageUrl: true,
                  },
                },
              },
            },
            languages: {
              include: {
                language: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                  },
                },
              },
            },
            featureChoices: {
              include: {
                choiceGroup: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                  },
                },
                feature: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                  },
                },
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
                talent: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      const normalizedEquipment = equipment.map((item) => ({
        ...item,
        category: String(item.category),
        attackType: String(item.attackType),
        weaponGroup: item.weaponGroup ? String(item.weaponGroup) : null,
      }));

      const normalizedSpells = spells.map((spell) => {
        const components = spell.components
          ? spell.components
              .split(",")
              .map((component) => component.trim())
              .filter(Boolean)
          : [];

        return {
          ...spell,
          school: String(spell.school),
          components,
        };
      });

      function normalizeNumberRecord(value: unknown): Record<string, number> {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return {};
        }

        const normalized: Record<string, number> = {};

        for (const [key, entryValue] of Object.entries(value)) {
          if (
            typeof entryValue === "number" &&
            Number.isFinite(entryValue)
          ) {
            normalized[key] = entryValue;
          }
        }

        return normalized;
      }

      const normalizedCharacterTemplates = characterTemplates.map(
        (template) => ({
          ...template,
          spells: template.spells.map((spellEntry) => ({
            ...spellEntry,
            spell: {
              ...spellEntry.spell,
              school: String(spellEntry.spell.school),
            },
          })),
          equipment: template.equipment.map((equipmentEntry) => ({
            ...equipmentEntry,
            equipment: {
              ...equipmentEntry.equipment,
              category: String(equipmentEntry.equipment.category),
            },
          })),
          progressionChoices: template.progressionChoices.map((choice) => ({
            ...choice,
            type: choice.type ? String(choice.type) : null,
            attributeIncreaseMode: choice.attributeIncreaseMode
              ? String(choice.attributeIncreaseMode)
              : null,
            attributeIncreases: normalizeNumberRecord(
              choice.attributeIncreases,
            ),
          })),
        }),
      );

      return reply.status(200).send({
        system,
        summary: {
          equipmentCount: normalizedEquipment.length,
          spellCount: normalizedSpells.length,
          npcTemplateCount: npcTemplates.length,
          creatureTemplateCount: creatureTemplates.length,
          characterTemplateCount: normalizedCharacterTemplates.length,
        },
        equipment: normalizedEquipment,
        spells: normalizedSpells,
        npcTemplates,
        creatureTemplates,
        characterTemplates: normalizedCharacterTemplates,
      });
    },
  });

}
