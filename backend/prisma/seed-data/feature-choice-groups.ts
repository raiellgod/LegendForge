export const featureChoiceGroups = [
  {
    key: "fighter-combat-style-level-1",
    name: "Estilo de Combate",
    description:
      "Escolha um estilo que representa o treinamento marcial inicial do Guerreiro.",
    choiceCount: 1,
    order: 1,

    ancestryKey: null,
    backgroundKey: null,
    classKey: "fighter",
    subclassKey: null,
    level: 1,

    optionFeatureKeys: [
      "combat-style-archery",
      "combat-style-defense",
      "combat-style-dueling",
      "combat-style-two-weapon-fighting",
    ],
  },
] as const;