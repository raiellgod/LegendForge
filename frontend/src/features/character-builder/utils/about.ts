import type { CharacterBuilderDraft } from "../types/character-builder-types";

export type CharacterPronounLanguageKey = "feminine" | "masculine" | "neutral";

export type CharacterPronounLanguage = {
  key: CharacterPronounLanguageKey;
  selected: string;
  chosen: string;
  trained: string;
  prepared: string;
  known: string;
  created: string;
  finalized: string;
  empty: string;
  ownerLabel: string;
};

export const CHARACTER_PRONOUN_LANGUAGE: Record<
  CharacterPronounLanguageKey,
  CharacterPronounLanguage
> = {
  feminine: {
    key: "feminine",
    selected: "Selecionada",
    chosen: "Escolhida",
    trained: "Treinada",
    prepared: "Preparada",
    known: "Conhecida",
    created: "Criada",
    finalized: "Finalizada",
    empty: "Vazia",
    ownerLabel: "Personagem da jogadora",
  },
  masculine: {
    key: "masculine",
    selected: "Selecionado",
    chosen: "Escolhido",
    trained: "Treinado",
    prepared: "Preparado",
    known: "Conhecido",
    created: "Criado",
    finalized: "Finalizado",
    empty: "Vazio",
    ownerLabel: "Personagem do jogador",
  },
  neutral: {
    key: "neutral",
    selected: "Selecionade",
    chosen: "Escolhide",
    trained: "Treinade",
    prepared: "Preparade",
    known: "Conhecide",
    created: "Criade",
    finalized: "Finalizade",
    empty: "Vazie",
    ownerLabel: "Personagem de jogadore",
  },
};

export function getCharacterPronounLanguage(
  pronouns: string,
): CharacterPronounLanguage {
  if (pronouns === "ele / dele") {
    return CHARACTER_PRONOUN_LANGUAGE.masculine;
  }

  if (pronouns === "elu / delu") {
    return CHARACTER_PRONOUN_LANGUAGE.neutral;
  }

  return CHARACTER_PRONOUN_LANGUAGE.feminine;
}

export function getGenderedCharacterWord({
  pronouns,
  feminine,
  masculine,
  neutral,
}: {
  pronouns: string;
  feminine: string;
  masculine: string;
  neutral: string;
}) {
  const language = getCharacterPronounLanguage(pronouns);

  if (language.key === "masculine") {
    return masculine;
  }

  if (language.key === "neutral") {
    return neutral;
  }

  return feminine;
}

export function hasAboutValue(value: string) {
  return value.trim().length > 0;
}

export function countFilledAboutFields(draft: CharacterBuilderDraft) {
  const fields = [
    draft.pronouns,
    draft.concept,
    draft.alignment,
    draft.faith,
    draft.lifestyle,
    draft.hair,
    draft.skin,
    draft.eyes,
    draft.height,
    draft.weight,
    draft.age,
    draft.gender,
    draft.bonds,
    draft.flaws,
    draft.ideals,
    draft.personality,
    draft.backstory,
    draft.notes,
    draft.gmNotes,
  ];

  return fields.filter(hasAboutValue).length;
}

export function getPhysicalSummary(draft: CharacterBuilderDraft) {
  const values = [
    draft.hair ? `Cabelo: ${draft.hair}` : "",
    draft.skin ? `Pele: ${draft.skin}` : "",
    draft.eyes ? `Olhos: ${draft.eyes}` : "",
    draft.height ? `Altura: ${draft.height}` : "",
    draft.weight ? `Peso: ${draft.weight}` : "",
    draft.age ? `Idade: ${draft.age}` : "",
    draft.gender ? `Gênero: ${draft.gender}` : "",
  ].filter(Boolean);

  return values.length > 0 ? values.join(" • ") : "Não definida";
}

export function getNarrativeSummary(draft: CharacterBuilderDraft) {
  const values = [
    draft.alignment ? `Alinhamento: ${draft.alignment}` : "",
    draft.faith ? `Fé: ${draft.faith}` : "",
    draft.lifestyle ? `Estilo: ${draft.lifestyle}` : "",
  ].filter(Boolean);

  return values.length > 0 ? values.join(" • ") : "Não definida";
}

export function getPersonalitySummary(draft: CharacterBuilderDraft) {
  const values = [
    draft.bonds ? `Vínculos: ${draft.bonds}` : "",
    draft.flaws ? `Defeitos: ${draft.flaws}` : "",
    draft.ideals ? `Ideais: ${draft.ideals}` : "",
    draft.personality ? `Traços: ${draft.personality}` : "",
  ].filter(Boolean);

  return values.length > 0
    ? values.join(" • ")
    : "Personalidade ainda não preenchida.";
}