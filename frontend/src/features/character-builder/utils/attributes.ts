import { CHARACTER_ATTRIBUTE_DEFINITIONS } from "../constants/character-builder-constants";

import type {
  CharacterAttributeKey,
  CharacterBuilderAncestryOption,
  CharacterBuilderAttributes,
  CharacterBuilderBackgroundOption,
  CharacterBuilderDraft,
  CharacterBuilderProgressionChoice,
  CharacterBuilderTalentOption,
  CharacterSheetStatResponse,
} from "../types/character-builder-types";

export const MAX_STANDARD_CHARACTER_ATTRIBUTE = 20;

export type CharacterAttributeBreakdown = {
  baseValue: number | null;
  ancestryBonus: number;
  backgroundBonus: number;
  progressionBonus: number;
  talentBonus: number;
  totalBonus: number;
  finalValue: number | null;
};

type CharacterAttributeCalculationOptions = {
  draft: CharacterBuilderDraft;
  talents: CharacterBuilderTalentOption[];
  selectedAncestry?: CharacterBuilderAncestryOption;
  selectedBackground?: CharacterBuilderBackgroundOption;
  excludedProgressionChoice?: CharacterBuilderProgressionChoice;
};

export function calculateAttributeModifier(value: number) {
  return Math.floor((value - 10) / 2);
}

export function formatAttributeModifier(value: number | null) {
  if (value === null) {
    return "—";
  }

  const modifier = calculateAttributeModifier(value);

  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function clampAttributeValue(value: number) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(
    3,
    Math.min(MAX_STANDARD_CHARACTER_ATTRIBUTE, Math.round(value)),
  );
}

export function getPersistableCharacterAttributes(
  attributes: CharacterBuilderAttributes,
) {
  return Object.fromEntries(
    Object.entries(attributes).filter(([, value]) => value !== null),
  );
}

export function isCharacterAttributeKey(
  key: string,
): key is CharacterAttributeKey {
  return CHARACTER_ATTRIBUTE_DEFINITIONS.some(
    (attribute) => attribute.key === key,
  );
}

function isSameProgressionChoice(
  firstChoice: CharacterBuilderProgressionChoice,
  secondChoice: CharacterBuilderProgressionChoice,
) {
  return (
    firstChoice.classEntryId === secondChoice.classEntryId &&
    firstChoice.classLevel === secondChoice.classLevel &&
    firstChoice.choiceIndex === secondChoice.choiceIndex
  );
}

export function getCharacterAttributeBreakdown({
  attributeKey,
  draft,
  talents,
  selectedAncestry,
  selectedBackground,
  excludedProgressionChoice,
}: CharacterAttributeCalculationOptions & {
  attributeKey: CharacterAttributeKey;
}): CharacterAttributeBreakdown {
  const ancestryBonus =
    selectedAncestry?.attributeBonuses[attributeKey] ?? 0;

  const backgroundBonus =
    selectedBackground?.attributeBonuses[attributeKey] ?? 0;

  const talentsById = new Map(
    talents.map((talent) => [talent.id, talent]),
  );

  let progressionBonus = 0;
  let talentBonus = 0;

  for (const progressionChoice of draft.progressionChoices) {
    if (
      excludedProgressionChoice &&
      isSameProgressionChoice(
        progressionChoice,
        excludedProgressionChoice,
      )
    ) {
      continue;
    }

    if (progressionChoice.type === "ATTRIBUTE_INCREASE") {
      progressionBonus +=
        progressionChoice.attributeIncreases[attributeKey] ?? 0;

      continue;
    }

    if (
      progressionChoice.type === "TALENT" &&
      progressionChoice.talentId
    ) {
      const talent = talentsById.get(progressionChoice.talentId);

      talentBonus += talent?.attributeBonuses[attributeKey] ?? 0;
    }
  }

  const baseValue = draft.attributes[attributeKey];

  const totalBonus =
    ancestryBonus +
    backgroundBonus +
    progressionBonus +
    talentBonus;

  const finalValue =
    typeof baseValue === "number"
      ? baseValue + totalBonus
      : null;

  return {
    baseValue,
    ancestryBonus,
    backgroundBonus,
    progressionBonus,
    talentBonus,
    totalBonus,
    finalValue,
  };
}

export function getConsolidatedCharacterAttributes(
  options: CharacterAttributeCalculationOptions,
): CharacterBuilderAttributes {
  return Object.fromEntries(
    CHARACTER_ATTRIBUTE_DEFINITIONS.map((attribute) => {
      const breakdown = getCharacterAttributeBreakdown({
        ...options,
        attributeKey: attribute.key,
      });

      return [attribute.key, breakdown.finalValue];
    }),
  ) as CharacterBuilderAttributes;
}

export function doesProgressionAttributeBonusExceedMaximum({
  attributeKey,
  bonusValue,
  draft,
  talents,
  selectedAncestry,
  selectedBackground,
  excludedProgressionChoice,
}: CharacterAttributeCalculationOptions & {
  attributeKey: CharacterAttributeKey;
  bonusValue: number;
}) {
  const breakdownBeforeChoice = getCharacterAttributeBreakdown({
    attributeKey,
    draft,
    talents,
    selectedAncestry,
    selectedBackground,
    excludedProgressionChoice,
  });

  if (breakdownBeforeChoice.finalValue === null) {
    return false;
  }

  return (
    breakdownBeforeChoice.finalValue + bonusValue >
    MAX_STANDARD_CHARACTER_ATTRIBUTE
  );
}

export function getAttributeValueByStatKey(
  attributes: CharacterBuilderAttributes,
  statKey: string,
) {
  if (!isCharacterAttributeKey(statKey)) {
    return null;
  }

  return attributes[statKey];
}

export function getCharacterAttributesFromStats(
  stats?: CharacterSheetStatResponse[] | null,
  defaultAttributes?: CharacterBuilderAttributes,
): CharacterBuilderAttributes {
  const attributes = {
    ...(defaultAttributes ?? {
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null,
    }),
  };

  stats?.forEach((sheetStat) => {
    const key = sheetStat.stat.key;

    if (!isCharacterAttributeKey(key)) {
      return;
    }

    attributes[key] = clampAttributeValue(sheetStat.baseValue);
  });

  return attributes;
}