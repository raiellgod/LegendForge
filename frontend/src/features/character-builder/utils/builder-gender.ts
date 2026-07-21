type CharacterBuilderGrammaticalGender =
  | "masculine"
  | "feminine"
  | "neutral";

type GenderedCharacterOptionName = {
  masculine: string;
  feminine: string;
  neutral: string;
};

function normalizeCharacterOptionName(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const GENDERED_CHARACTER_OPTION_NAMES_BY_KEY: Record<
  string,
  GenderedCharacterOptionName
> = {
  // Classes
  barbarian: {
    masculine: "Bárbaro",
    feminine: "Bárbara",
    neutral: "Bárbare",
  },
  bard: {
    masculine: "Bardo",
    feminine: "Barda",
    neutral: "Barde",
  },
  warlock: {
    masculine: "Bruxo",
    feminine: "Bruxa",
    neutral: "Bruxe",
  },
  devotee: {
    masculine: "Devoto",
    feminine: "Devota",
    neutral: "Devote",
  },
  druid: {
    masculine: "Druida",
    feminine: "Druida",
    neutral: "Druide",
  },
  sorcerer: {
    masculine: "Feiticeiro",
    feminine: "Feiticeira",
    neutral: "Feiticeire",
  },
  fighter: {
    masculine: "Guerreiro",
    feminine: "Guerreira",
    neutral: "Guerreire",
  },
  rogue: {
    masculine: "Ladino",
    feminine: "Ladina",
    neutral: "Ladine",
  },
  wizard: {
    masculine: "Mago",
    feminine: "Maga",
    neutral: "Mague",
  },
  monk: {
    masculine: "Monge",
    feminine: "Monja",
    neutral: "Monje",
  },
  oathbound: {
    masculine: "Juramentado",
    feminine: "Juramentada",
    neutral: "Juramentade",
  },
  ranger: {
    masculine: "Patrulheiro",
    feminine: "Patrulheira",
    neutral: "Patrulheire",
  },
  technomancer: {
    masculine: "Tecnomante",
    feminine: "Tecnomante",
    neutral: "Tecnomante",
  },
  necromancer: {
    masculine: "Necromante",
    feminine: "Necromante",
    neutral: "Necromante",
  },

  // Ancestralidades: nomes de povos/linhagens do sistema, mantidos como nomes próprios.
  humanis: {
    masculine: "Humanis",
    feminine: "Humanis",
    neutral: "Humanis",
  },
  sylvaris: {
    masculine: "Sylvaris",
    feminine: "Sylvaris",
    neutral: "Sylvaris",
  },
  durandir: {
    masculine: "Durandir",
    feminine: "Durandir",
    neutral: "Durandir",
  },
  brutakar: {
    masculine: "Brutakar",
    feminine: "Brutakar",
    neutral: "Brutakar",
  },
  faunari: {
    masculine: "Faunari",
    feminine: "Faunari",
    neutral: "Faunari",
  },
  sinteticos: {
    masculine: "Sintéticos",
    feminine: "Sintéticos",
    neutral: "Sintéticos",
  },
  minuri: {
    masculine: "Minuri",
    feminine: "Minuri",
    neutral: "Minuri",
  },

  // Antecedentes
  "veil-devotee": {
    masculine: "Devoto do Véu",
    feminine: "Devota do Véu",
    neutral: "Devote do Véu",
  },
  "omen-marked": {
    masculine: "Marcado pelo Agouro",
    feminine: "Marcada pelo Agouro",
    neutral: "Marcade pelo Agouro",
  },
  "guild-artisan": {
    masculine: "Artesão de Guilda",
    feminine: "Artesã de Guilda",
    neutral: "Artesane de Guilda",
  },
  "wandering-minstrel": {
    masculine: "Menestrel Errante",
    feminine: "Menestrel Errante",
    neutral: "Menestrel Errante",
  },
  "court-fraud": {
    masculine: "Farsante de Corte",
    feminine: "Farsante de Corte",
    neutral: "Farsante de Corte",
  },
  "alley-blade": {
    masculine: "Lâmina de Beco",
    feminine: "Lâmina de Beco",
    neutral: "Lâmina de Beco",
  },
  "wilds-recluse": {
    masculine: "Recluso dos Ermos",
    feminine: "Reclusa dos Ermos",
    neutral: "Recluse dos Ermos",
  },
  "frontier-walker": {
    masculine: "Andarilho das Fronteiras",
    feminine: "Andarilha das Fronteiras",
    neutral: "Andarilhe das Fronteiras",
  },
  "village-champion": {
    masculine: "Campeão da Aldeia",
    feminine: "Campeã da Aldeia",
    neutral: "Campeane da Aldeia",
  },
  "black-tide-navigator": {
    masculine: "Navegante de Marés Negras",
    feminine: "Navegante de Marés Negras",
    neutral: "Navegante de Marés Negras",
  },
  "crest-blood": {
    masculine: "Sangue de Brasão",
    feminine: "Sangue de Brasão",
    neutral: "Sangue de Brasão",
  },
  "gutter-child": {
    masculine: "Filho da Sarjeta",
    feminine: "Filha da Sarjeta",
    neutral: "Filhe da Sarjeta",
  },
  "arcane-archivist": {
    masculine: "Arquivista Arcano",
    feminine: "Arquivista Arcana",
    neutral: "Arquivista Arcane",
  },
  "ash-veteran-background": {
    masculine: "Veterano da Cinza",
    feminine: "Veterana da Cinza",
    neutral: "Veterane da Cinza",
  },
  "distant-lands-pilgrim": {
    masculine: "Peregrino de Terras Distantes",
    feminine: "Peregrina de Terras Distantes",
    neutral: "Peregrine de Terras Distantes",
  },
  "relic-hunter": {
    masculine: "Caçador de Relíquias",
    feminine: "Caçadora de Relíquias",
    neutral: "Caçadore de Relíquias",
  },
  "collapse-survivor": {
    masculine: "Sobrevivente do Colapso",
    feminine: "Sobrevivente do Colapso",
    neutral: "Sobrevivente do Colapso",
  },
  "masterless-squire": {
    masculine: "Escudeiro Sem Senhor",
    feminine: "Escudeira Sem Senhor",
    neutral: "Escudeire Sem Senhor",
  },
};

const GENDERED_CHARACTER_OPTION_NAMES_BY_NORMALIZED_NAME =
  Object.fromEntries(
    Object.values(GENDERED_CHARACTER_OPTION_NAMES_BY_KEY).flatMap(
      (genderedName) =>
        [
          genderedName.masculine,
          genderedName.feminine,
          genderedName.neutral,
        ].map((name) => [
          normalizeCharacterOptionName(name),
          genderedName,
        ]),
    ),
  ) as Record<string, GenderedCharacterOptionName>;

export function getCharacterBuilderGrammaticalGender(
  pronouns: string,
): CharacterBuilderGrammaticalGender {
  const normalizedPronouns = pronouns.trim().toLowerCase();

  if (
    normalizedPronouns === "ela / dela" ||
    normalizedPronouns === "ela/dela"
  ) {
    return "feminine";
  }

  if (
    normalizedPronouns === "elu / delu" ||
    normalizedPronouns === "elu/delu"
  ) {
    return "neutral";
  }

  return "masculine";
}

export function getGenderedCharacterOptionName({
  key,
  name,
  pronouns,
}: {
  key?: string | null;
  name: string;
  pronouns: string;
}) {
  const grammaticalGender =
    getCharacterBuilderGrammaticalGender(pronouns);

  const genderedNameByKey = key
    ? GENDERED_CHARACTER_OPTION_NAMES_BY_KEY[key]
    : undefined;

  if (genderedNameByKey) {
    return genderedNameByKey[grammaticalGender];
  }

  const genderedNameByFallbackName =
    GENDERED_CHARACTER_OPTION_NAMES_BY_NORMALIZED_NAME[
      normalizeCharacterOptionName(name)
    ];

  if (genderedNameByFallbackName) {
    return genderedNameByFallbackName[grammaticalGender];
  }

  return name;
}

export function getDefaultGenderFromPronouns(pronouns: string) {
  const normalizedPronouns = pronouns.trim().toLowerCase();

  if (
    normalizedPronouns === "ele / dele" ||
    normalizedPronouns === "ele/dele"
  ) {
    return "Masculino";
  }

  if (
    normalizedPronouns === "ela / dela" ||
    normalizedPronouns === "ela/dela"
  ) {
    return "Feminino";
  }

  if (
    normalizedPronouns === "elu / delu" ||
    normalizedPronouns === "elu/delu"
  ) {
    return "Não binário";
  }

  return "";
}

export function shouldReplaceGenderAutomatically(
  currentGender: string,
) {
  const normalizedGender = currentGender.trim().toLowerCase();

  return (
    normalizedGender === "" ||
    normalizedGender === "masculino" ||
    normalizedGender === "feminino" ||
    normalizedGender === "não binário" ||
    normalizedGender === "nao binario" ||
    normalizedGender === "neutro"
  );
}

export function getSelectedOptionLabelByPronouns(
  pronouns: string,
) {
  const grammaticalGender =
    getCharacterBuilderGrammaticalGender(pronouns);

  if (grammaticalGender === "feminine") {
    return "Selecionada";
  }

  if (grammaticalGender === "neutral") {
    return "Selecionade";
  }

  return "Selecionado";
}