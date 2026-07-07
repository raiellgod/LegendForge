export const ancestries = [
  {
    name: "Humanis",
    key: "humanis",
    description:
      "Povo versátil e adaptável, marcado pela sobrevivência após o colapso do velho mundo.",
    defaultSizeCategory: "MEDIUM",
    attributeBonuses: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    },
    languageKeys: ["common"],
  },
  {
    name: "Sylvaris",
    key: "sylvaris",
    description:
      "Linhagem de traços élficos, sensibilidade arcana e forte conexão com ambientes transformados pela magia.",
    defaultSizeCategory: "MEDIUM",
    attributeBonuses: {
      dexterity: 2,
      intelligence: 1,
    },
    languageKeys: ["common", "sylvan"],
  },
  {
    name: "Durandir",
    key: "durandir",
    description:
      "Povo resistente, robusto e associado a comunidades subterrâneas, metalurgia e sobrevivência em regiões severas.",
    defaultSizeCategory: "MEDIUM",
    attributeBonuses: {
      constitution: 2,
      strength: 1,
    },
    languageKeys: ["common", "deep-speech"],
  },
  {
    name: "Brutakar",
    key: "brutakar",
    description:
      "Linhagem forte e imponente, frequentemente ligada à resistência física e presença intimidadora.",
    defaultSizeCategory: "MEDIUM",
    attributeBonuses: {
      strength: 2,
      constitution: 1,
    },
    languageKeys: ["common", "brutakar"],
  },
  {
    name: "Faunari",
    key: "faunari",
    description:
      "Povo de traços feéricos e animalescos, associado a mobilidade, expressão cultural e instinto natural.",
    defaultSizeCategory: "MEDIUM",
    attributeBonuses: {
      dexterity: 2,
      charisma: 1,
    },
    languageKeys: ["common", "faunari"],
  },
  {
    name: "Sintéticos",
    key: "sinteticos",
    description:
      "Seres parcialmente artificiais ou reconstruídos, ligados a tecnologia antiga, implantes e sobrevivência mecânica.",
    defaultSizeCategory: "MEDIUM",
    attributeBonuses: {
      constitution: 2,
      intelligence: 1,
    },
    languageKeys: ["common", "synthetic"],
  },
  {
    name: "Minuri",
    key: "minuri",
    description:
      "Povo de baixa estatura, ágil e discreto, conhecido por adaptação social e coragem inesperada.",
    defaultSizeCategory: "SMALL",
    attributeBonuses: {
      dexterity: 2,
      charisma: 1,
    },
    languageKeys: ["common", "minuri"],
  },
  {
    name: "Ignivar",
    key: "ignivar",
    description:
      "Linhagem marcada por calor interno, resiliência elemental e traços associados a fogo, cinzas, forjas ou energia instável.",
    defaultSizeCategory: "MEDIUM",
    attributeBonuses: {
      constitution: 2,
      charisma: 1,
    },
    languageKeys: ["common", "ignean"],
  },
  {
    name: "Yokari",
    key: "yokari",
    description:
      "Povo de herança espiritual e traços sobrenaturais, associado a presságios, tradições antigas, máscaras, espíritos e vínculos com o invisível.",
    defaultSizeCategory: "MEDIUM",
    attributeBonuses: {
      wisdom: 2,
      charisma: 1,
    },
    languageKeys: ["common", "yokari"],
  },
  {
    name: "Gnomyx",
    key: "gnomyx",
    description:
      "Povo pequeno, engenhoso e curioso, ligado a invenções, artifícios, improviso técnico, alquimia e estudo de ruínas antigas.",
    defaultSizeCategory: "SMALL",
    attributeBonuses: {
      intelligence: 2,
      dexterity: 1,
    },
    languageKeys: ["common", "gnomyx"],
  },
] as const;