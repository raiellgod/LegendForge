import { CHARACTER_ATTRIBUTE_DEFINITIONS } from "../constants/character-builder-constants";

import type {
  CharacterAttributeKey,
  CharacterBuilderAttributes,
  CharacterSheetStatResponse,
} from "../types/character-builder-types";

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

  return Math.max(3, Math.min(20, Math.round(value)));
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