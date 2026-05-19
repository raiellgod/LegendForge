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

const subclasses = [
  {
    classKey: "barbarian",
    name: "Fúria do Colapso",
    key: "collapse-fury",
    description:
      "Canaliza brutalidade, dor e sobrevivência em uma fúria nascida de ruínas, perdas e violência extrema.",
  },
  {
    classKey: "barbarian",
    name: "Coração Bestial",
    key: "beast-heart",
    description:
      "Assume instintos animalescos, resistência selvagem e força primal, aproximando o corpo de uma fera viva.",
  },
  {
    classKey: "bard",
    name: "Colégio dos Ecos",
    key: "college-of-echoes",
    description:
      "Usa memórias, canções antigas e ecos emocionais para inspirar aliados, perturbar inimigos e preservar histórias perdidas.",
  },
  {
    classKey: "bard",
    name: "Colégio da Máscara",
    key: "college-of-masks",
    description:
      "Domina atuação, disfarces, manipulação social e magia performática, tornando identidade uma arma.",
  },
  {
    classKey: "warlock",
    name: "Marca da Entidade",
    key: "entity-mark",
    description:
      "Carrega a marca de uma força oculta que concede poder em troca de influência, presença ou dívida.",
  },
  {
    classKey: "warlock",
    name: "Véu do Agouro",
    key: "omen-veil",
    description:
      "Manipula maldições, presságios, sombras e azar, envolvendo inimigos em sinais de queda inevitável.",
  },
  {
    classKey: "devotee",
    name: "Caminho do Alvorecer",
    key: "path-of-dawn",
    description:
      "Canaliza restauração, proteção e purificação, tornando-se uma presença de esperança contra forças corruptoras.",
  },
  {
    classKey: "devotee",
    name: "Caminho dos Ancestrais",
    key: "path-of-ancestors",
    description:
      "Busca poder em memórias, espíritos, linhagens e tradições antigas, ouvindo vozes que ainda resistem ao esquecimento.",
  },
  {
    classKey: "druid",
    name: "Círculo da Mutação",
    key: "circle-of-mutation",
    description:
      "Abraça transformações naturais e mágicas surgidas em um mundo alterado, adaptando corpo e magia ao ambiente.",
  },
  {
    classKey: "druid",
    name: "Círculo das Feras",
    key: "circle-of-beasts",
    description:
      "Aproxima-se de predadores, companheiros animais e instintos selvagens, lutando ao lado da natureza viva.",
  },
  {
    classKey: "sorcerer",
    name: "Sangue Arcano",
    key: "arcane-blood",
    description:
      "O poder mágico nasce do sangue, da herança, da mutação ou de uma força interior impossível de negar.",
  },
  {
    classKey: "sorcerer",
    name: "Pulso Instável",
    key: "unstable-pulse",
    description:
      "Carrega magia volátil, explosiva e difícil de controlar, liberando surtos de energia imprevisível.",
  },
  {
    classKey: "fighter",
    name: "Mestre de Armas",
    key: "weapon-master",
    description:
      "Especialista em armas, posturas de combate, precisão marcial e domínio técnico em batalha.",
  },
  {
    classKey: "fighter",
    name: "Veterano da Cinza",
    key: "ash-veteran",
    description:
      "Sobreviveu a conflitos brutais e domina táticas de campo, carregando cicatrizes de guerras antigas.",
  },
  {
    classKey: "rogue",
    name: "Sombra Urbana",
    key: "urban-shadow",
    description:
      "Especialista em infiltração, fuga, furtividade e sobrevivência em cidades, fortalezas e becos perigosos.",
  },
  {
    classKey: "rogue",
    name: "Punhal Silencioso",
    key: "silent-dagger",
    description:
      "Foca em ataques precisos, emboscadas e eliminação rápida, vencendo antes que o inimigo perceba o perigo.",
  },
  {
    classKey: "wizard",
    name: "Escola da Ruína",
    key: "school-of-ruin",
    description:
      "Estuda magia destrutiva, colapso arcano e fórmulas de impacto direto capazes de quebrar defesas.",
  },
  {
    classKey: "wizard",
    name: "Escola do Véu",
    key: "school-of-veil",
    description:
      "Manipula ilusões, ocultação, disfarces mágicos e percepção, tornando a realidade algo incerto.",
  },
  {
    classKey: "monk",
    name: "Via do Pulso",
    key: "pulse-way",
    description:
      "Aprimora corpo, respiração, velocidade e resistência interior, transformando disciplina em movimento perfeito.",
  },
  {
    classKey: "monk",
    name: "Via do Vazio",
    key: "void-way",
    description:
      "Busca silêncio mental, precisão espiritual e golpes quase impossíveis de prever.",
  },
  {
    classKey: "oathbound",
    name: "Juramento da Muralha",
    key: "wall-oath",
    description:
      "Protege aliados, mantém posições e transforma uma promessa em escudo contra qualquer ameaça.",
  },
  {
    classKey: "oathbound",
    name: "Juramento da Cinza",
    key: "ash-oath",
    description:
      "Carrega um juramento nascido da perda, vingança e reconstrução, lutando para que a queda não se repita.",
  },
  {
    classKey: "ranger",
    name: "Andarilho das Ruínas",
    key: "ruin-walker",
    description:
      "Explora cidades quebradas, zonas perigosas e rastros deixados pelo colapso, encontrando caminho onde outros se perdem.",
  },
  {
    classKey: "ranger",
    name: "Caçador de Aberrações",
    key: "aberration-hunter",
    description:
      "Especialista em rastrear, estudar e derrubar criaturas mutadas, anômalas ou corrompidas.",
  },
  {
    classKey: "technomancer",
    name: "Engenheiro Arcano",
    key: "arcane-engineer",
    description:
      "Mistura tecnologia antiga, circuitos, runas e improviso mecânico para criar dispositivos instáveis e poderosos.",
  },
  {
    classKey: "technomancer",
    name: "Alquimista de Campo",
    key: "field-alchemist",
    description:
      "Cria misturas, reagentes, explosivos, remédios e ferramentas úteis em combate e exploração.",
  },
  {
    classKey: "necromancer",
    name: "Ceifador Ósseo",
    key: "bone-reaper",
    description:
      "Usa ossos, lâminas fúnebres e energia da morte em combate direto, transformando restos mortais em arma.",
  },
  {
    classKey: "necromancer",
    name: "Pastor dos Mortos",
    key: "shepherd-of-the-dead",
    description:
      "Conduz espíritos, cadáveres e ecos dos mortos como extensões de sua vontade.",
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

    const createdClasses = new Map<string, string>();

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

        createdClasses.set(classData.key, characterClass.id);

    console.log(`Classe criada/validada: ${characterClass.name}`);
  }

    for (const [index, subclassData] of subclasses.entries()) {
    const classId = createdClasses.get(subclassData.classKey);

    if (!classId) {
      throw new Error(
        `Classe "${subclassData.classKey}" não encontrada para a subclasse "${subclassData.name}".`,
      );
    }

    const subclass = await prisma.characterSubclass.upsert({
      where: {
        classId_key: {
          classId,
          key: subclassData.key,
        },
      },
      update: {
        systemId: system.id,
        name: subclassData.name,
        description: subclassData.description,
        order: index + 1,
      },
      create: {
        systemId: system.id,
        classId,
        name: subclassData.name,
        key: subclassData.key,
        description: subclassData.description,
        order: index + 1,
      },
    });

    console.log(`Subclasse criada/validada: ${subclass.name}`);
  }
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
