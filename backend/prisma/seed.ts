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

const ancestries = [
  {
    name: "Humanis",
    key: "humanis",
    description:
      "Povo versátil e adaptável, marcado pela sobrevivência após o colapso do velho mundo.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Sylvaris",
    key: "sylvaris",
    description:
      "Linhagem de traços élficos, sensibilidade arcana e forte conexão com ambientes transformados pela magia.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Durandir",
    key: "durandir",
    description:
      "Povo resistente, robusto e associado a comunidades subterrâneas, metalurgia e sobrevivência em regiões severas.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Brutakar",
    key: "brutakar",
    description:
      "Linhagem forte e imponente, frequentemente ligada à resistência física e presença intimidadora.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Faunari",
    key: "faunari",
    description:
      "Povo de traços feéricos e animalescos, associado a mobilidade, expressão cultural e instinto natural.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Sintéticos",
    key: "sinteticos",
    description:
      "Seres parcialmente artificiais ou reconstruídos, ligados a tecnologia antiga, implantes e sobrevivência mecânica.",
    defaultSizeCategory: "MEDIUM",
  },
  {
    name: "Minuri",
    key: "minuri",
    description:
      "Povo de baixa estatura, ágil e discreto, conhecido por adaptação social e coragem inesperada.",
    defaultSizeCategory: "SMALL",
  },
] as const;

const classes = [
  {
    name: "Bárbaro",
    key: "barbarian",
    primaryRole: "Marcial",
    hitDie: 12,
    description:
      "Combatente feroz movido por fúria, instinto e resistência física extrema.",
  },
  {
    name: "Bardo",
    key: "bard",
    primaryRole: "Suporte",
    hitDie: 8,
    description:
      "Artista arcano que inspira aliados, manipula emoções e transforma expressão em poder.",
  },
  {
    name: "Bruxo",
    key: "warlock",
    primaryRole: "Oculto",
    hitDie: 8,
    description:
      "Conjurador ligado a forças misteriosas, maldições, pactos e segredos arcanos perigosos.",
  },
  {
    name: "Devoto",
    key: "devotee",
    primaryRole: "Suporte",
    hitDie: 8,
    description:
      "Canaliza poder de uma fé, ideal, entidade, tradição espiritual ou força superior para curar, proteger e purificar.",
  },
  {
    name: "Druida",
    key: "druid",
    primaryRole: "Natural",
    hitDie: 8,
    description:
      "Conjurador ligado às forças naturais, mutações, animais, ciclos vitais e terrenos selvagens.",
  },
  {
    name: "Feiticeiro",
    key: "sorcerer",
    primaryRole: "Arcano",
    hitDie: 6,
    description:
      "Conjurador de magia inata, guiado por sangue, mutação, herança ou poder interior instintivo.",
  },
  {
    name: "Guerreiro",
    key: "fighter",
    primaryRole: "Marcial",
    hitDie: 10,
    description:
      "Especialista em combate, armas, armaduras, disciplina marcial e adaptação tática.",
  },
  {
    name: "Ladino",
    key: "rogue",
    primaryRole: "Especialista",
    hitDie: 8,
    description:
      "Especialista em furtividade, precisão, truques, mobilidade e ataques oportunistas.",
  },
  {
    name: "Mago",
    key: "wizard",
    primaryRole: "Arcano",
    hitDie: 6,
    description:
      "Estudioso da magia, rituais, grimórios, fórmulas arcanas e conhecimento sobrenatural.",
  },
  {
    name: "Monge",
    key: "monk",
    primaryRole: "Marcial",
    hitDie: 8,
    description:
      "Combatente disciplinado que usa corpo, mente, velocidade e energia interior como armas.",
  },
  {
    name: "Juramentado",
    key: "oathbound",
    primaryRole: "Defensor",
    hitDie: 10,
    description:
      "Guerreiro místico sustentado por juramentos, convicções e a força de uma promessa inquebrável.",
  },
  {
    name: "Patrulheiro",
    key: "ranger",
    primaryRole: "Explorador",
    hitDie: 10,
    description:
      "Explorador, rastreador e combatente versátil treinado para sobreviver em regiões hostis.",
  },
  {
    name: "Tecnomante",
    key: "technomancer",
    primaryRole: "Tecnológico",
    hitDie: 8,
    description:
      "Especialista em tecnologia antiga, dispositivos, engenhocas, alquimia e tecno-magia.",
  },
  {
    name: "Necromante",
    key: "necromancer",
    primaryRole: "Sombrio",
    hitDie: 6,
    description:
      "Conjurador da morte, espíritos, ossos, dreno vital, cadáveres e forças necromânticas.",
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

    for (const [index, ancestryData] of ancestries.entries()) {
    const ancestry = await prisma.ancestry.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: ancestryData.key,
        },
      },
      update: {
        name: ancestryData.name,
        description: ancestryData.description,
        defaultSizeCategory: ancestryData.defaultSizeCategory,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: ancestryData.name,
        key: ancestryData.key,
        description: ancestryData.description,
        defaultSizeCategory: ancestryData.defaultSizeCategory,
        order: index + 1,
      },
    });

       console.log(`Ancestralidade criada/validada: ${ancestry.name}`);
  }

  for (const [index, classData] of classes.entries()) {
    const characterClass = await prisma.characterClass.upsert({
      where: {
        systemId_key: {
          systemId: system.id,
          key: classData.key,
        },
      },
      update: {
        name: classData.name,
        description: classData.description,
        primaryRole: classData.primaryRole,
        hitDie: classData.hitDie,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        name: classData.name,
        key: classData.key,
        description: classData.description,
        primaryRole: classData.primaryRole,
        hitDie: classData.hitDie,
        order: index + 1,
      },
    });

    console.log(`Classe criada/validada: ${characterClass.name}`);
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
