import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";

const SYSTEM_NAME = "Meu sistema";
const SYSTEM_SLUG = "meu-sistema";

const stats = [
  {
    name: "Força",
    key: "strength",
    shortName: "FOR",
    description:
      "Mede potência física, capacidade atlética bruta, carga e impacto corporal.",
  },
  {
    name: "Destreza",
    key: "dexterity",
    shortName: "DES",
    description:
      "Mede agilidade, reflexos, precisão manual, equilíbrio e velocidade corporal.",
  },
  {
    name: "Constituição",
    key: "constitution",
    shortName: "CON",
    description:
      "Mede vigor, resistência física, saúde, fôlego e tolerância a desgaste.",
  },
  {
    name: "Inteligência",
    key: "intelligence",
    shortName: "INT",
    description:
      "Mede raciocínio, memória, estudo, lógica, análise e conhecimento técnico.",
  },
  {
    name: "Sabedoria",
    key: "wisdom",
    shortName: "SAB",
    description:
      "Mede percepção, intuição, instinto, leitura emocional e sintonia com o ambiente.",
  },
  {
    name: "Carisma",
    key: "charisma",
    shortName: "CAR",
    description:
      "Mede presença, força de personalidade, influência social, expressão e liderança.",
  },
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

  for (const [index, statData] of stats.entries()) {
  const stat = await prisma.stat.upsert({
    where: {
      systemId_name: {
        systemId: system.id,
        name: statData.name,
      },
    },
    update: {
      key: statData.key,
      shortName: statData.shortName,
      description: statData.description,
      order: index + 1,
    },
    create: {
      systemId: system.id,
      name: statData.name,
      key: statData.key,
      shortName: statData.shortName,
      description: statData.description,
      order: index + 1,
    },
  });

  createdStats.set(stat.name, stat.id);

  console.log(`Atributo criado/validado: ${stat.name}`);
}

  for (const skill of skills) {

    const skillKey = skill.name
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

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
  key: skillKey,
  description: null,
  order: skills.findIndex((currentSkill) => currentSkill.name === skill.name) + 1,
},
create: {
  systemId: system.id,
  statId,
  name: skill.name,
  key: skillKey,
  description: null,
  order: skills.findIndex((currentSkill) => currentSkill.name === skill.name) + 1,
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
