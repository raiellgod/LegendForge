export const talents = [
  {
    key: "vigor-aprimorado",
    name: "Vigor Aprimorado",
    description:
      "O personagem desenvolveu resistência física excepcional. Aumenta permanentemente sua Constituição em 1.",
    attributeBonuses: {
      constitution: 1,
    },
    prerequisites: {},
    isRepeatable: false,
  },
  {
    key: "mente-aguçada",
    name: "Mente Aguçada",
    description:
      "Treinamento intelectual intenso aprimorou a memória, o raciocínio e a capacidade de análise do personagem. Aumenta permanentemente sua Inteligência em 1.",
    attributeBonuses: {
      intelligence: 1,
    },
    prerequisites: {
      minimumAttributes: {
        intelligence: 13,
      },
    },
    isRepeatable: false,
  },
  {
    key: "especialista-marcial",
    name: "Especialista Marcial",
    description:
      "O personagem aprofundou seu domínio de combate, disciplina e leitura tática do campo de batalha.",
    attributeBonuses: {},
    prerequisites: {
      requiredClassKeys: ["fighter"],
    },
    isRepeatable: false,
  },
  {
    key: "iniciado-arcano",
    name: "Iniciado Arcano",
    description:
      "O personagem aprofundou seu contato com forças mágicas e desenvolveu maior compreensão sobre conjuração.",
    attributeBonuses: {},
    prerequisites: {
      requiresSpellcasting: true,
    },
    isRepeatable: false,
  },
  {
    key: "treinamento-especial",
    name: "Treinamento Especial",
    description:
      "O personagem concluiu um novo ciclo de treinamento especializado. Este talento pode ser escolhido novamente em marcos posteriores.",
    attributeBonuses: {},
    prerequisites: {},
    isRepeatable: true,
  },
] as const;