import type {
  CharacterBuilderAttributes,
  CharacterAttributeKey,
} from "../types/character-builder-types";

export const STANDARD_ARRAY_ATTRIBUTE_VALUES = [15, 14, 13, 12, 10, 8];

export const DEFAULT_CHARACTER_ATTRIBUTES: CharacterBuilderAttributes = {
  strength: null,
  dexterity: null,
  constitution: null,
  intelligence: null,
  wisdom: null,
  charisma: null,
};

export const CHARACTER_ATTRIBUTE_DEFINITIONS: Array<{
  key: CharacterAttributeKey;
  name: string;
  shortName: string;
  description: string;
}> = [
  {
    key: "strength",
    name: "Força",
    shortName: "FOR",
    description:
      "Poder físico, empurrões, carga, ataques corpo a corpo e feitos brutos.",
  },
  {
    key: "dexterity",
    name: "Destreza",
    shortName: "DES",
    description:
      "Reflexos, precisão, furtividade, equilíbrio e agilidade em combate.",
  },
  {
    key: "constitution",
    name: "Constituição",
    shortName: "CON",
    description:
      "Resistência, vigor, fôlego, saúde e capacidade de suportar dor.",
  },
  {
    key: "intelligence",
    name: "Inteligência",
    shortName: "INT",
    description:
      "Raciocínio, memória, investigação, conhecimento e lógica arcana.",
  },
  {
    key: "wisdom",
    name: "Sabedoria",
    shortName: "SAB",
    description:
      "Percepção, instinto, intuição, sobrevivência e leitura do ambiente.",
  },
  {
    key: "charisma",
    name: "Carisma",
    shortName: "CAR",
    description:
      "Presença, liderança, influência, expressão artística e força de vontade social.",
  },
];

export const CHARACTER_BUILDER_LEVEL = 1;

export const PRONOUN_OPTIONS = ["ela / dela", "ele / dele", "elu / delu"];

export const ALIGNMENT_OPTIONS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
];

export const GENDER_OPTIONS = ["Masculino", "Feminino", "Não binário"];

export const LIFESTYLE_OPTIONS = [
  "Miserável",
  "Pobre",
  "Modesto",
  "Confortável",
  "Rico",
  "Aristocrático",
  "Nômade",
  "Militar",
  "Clandestino",
];