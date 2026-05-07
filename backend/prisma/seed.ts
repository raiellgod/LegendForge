import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";

const SYSTEM_NAME = "Meu sistema";
const SYSTEM_SLUG = "meu-sistema";

const stats = [
  "Força",
  "Destreza",
  "Constituição",
  "Inteligência",
  "Sabedoria",
  "Carisma",
] as const;

const skills = [
  {
    name: "Acrobacia",
    statName: "Destreza",
  },
  {
    name: "Arcanismo",
    statName: "Inteligência",
  },
  {
    name: "Atletismo",
    statName: "Força",
  },
  {
    name: "Atuação",
    statName: "Carisma",
  },
  {
    name: "Blefar",
    statName: "Carisma",
  },
  {
    name: "Furtividade",
    statName: "Destreza",
  },
  {
    name: "História",
    statName: "Inteligência",
  },
  {
    name: "Intimidação",
    statName: "Carisma",
  },
  {
    name: "Intuição",
    statName: "Sabedoria",
  },
  {
    name: "Investigação",
    statName: "Inteligência",
  },
  {
    name: "Lidar com Animais",
    statName: "Sabedoria",
  },
  {
    name: "Medicina",
    statName: "Sabedoria",
  },
  {
    name: "Natureza",
    statName: "Inteligência",
  },
  {
    name: "Percepção",
    statName: "Sabedoria",
  },
  {
    name: "Persuasão",
    statName: "Carisma",
  },
  {
    name: "Prestidigitação",
    statName: "Destreza",
  },
  {
    name: "Religião",
    statName: "Inteligência",
  },
  {
    name: "Sobrevivência",
    statName: "Sabedoria",
  },
] as const;

async function main() {
  const system = await prisma.gameSystem.upsert({
    where: {
      name: SYSTEM_NAME,
    },
    update: {
      slug: SYSTEM_SLUG,
      version: 1,
    },
    create: {
      name: SYSTEM_NAME,
      slug: SYSTEM_SLUG,
      version: 1,
    },
  });

  console.log(`Sistema criado/atualizado: ${system.name}`);

  const createdStats = new Map<string, string>();

  for (const statName of stats) {
    const stat = await prisma.stat.upsert({
      where: {
        systemId_name: {
          systemId: system.id,
          name: statName,
        },
      },
      update: {},
      create: {
        systemId: system.id,
        name: statName,
      },
    });

    createdStats.set(stat.name, stat.id);

    console.log(`Atributo criado/validado: ${stat.name}`);
  }

  for (const skill of skills) {
    const statId = createdStats.get(skill.statName);

    if (!statId) {
      throw new Error(
        `Atributo "${skill.statName}" não encontrado para a perícia "${skill.name}".`,
      );
    }

    const createdSkill = await prisma.skill.upsert({
      where: {
        systemId_name: {
          systemId: system.id,
          name: skill.name,
        },
      },
      update: {
        statId,
      },
      create: {
        systemId: system.id,
        statId,
        name: skill.name,
      },
    });

    console.log(
      `Perícia criada/validada: ${createdSkill.name} → ${skill.statName}`,
    );
  }

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
