import { calculateAttributeModifier, getAttributeValueByStatKey } from "./attributes";

import type { CharacterBuilderAttributes } from "../types/character-builder-types";

export function formatNumberModifier(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function getProficiencyBonusByLevel(level: number) {
  if (level >= 17) {
    return 6;
  }

  if (level >= 13) {
    return 5;
  }

  if (level >= 9) {
    return 4;
  }

  if (level >= 5) {
    return 3;
  }

  return 2;
}

export function getSkillCalculation({
  attributes,
  statKey,
  isProficient,
  level,
}: {
  attributes: CharacterBuilderAttributes;
  statKey: string;
  isProficient: boolean;
  level: number;
}) {
  const attributeValue = getAttributeValueByStatKey(attributes, statKey);
  const proficiencyBonus = isProficient ? getProficiencyBonusByLevel(level) : 0;

  if (attributeValue === null) {
    return {
      attributeModifier: null as number | null,
      proficiencyBonus,
      total: null as number | null,
      formattedAttributeModifier: "—",
      formattedProficiencyBonus: isProficient
        ? formatNumberModifier(proficiencyBonus)
        : "—",
      formattedTotal: "—",
    };
  }

  const attributeModifier = calculateAttributeModifier(attributeValue);
  const total = attributeModifier + proficiencyBonus;

  return {
    attributeModifier,
    proficiencyBonus,
    total,
    formattedAttributeModifier: formatNumberModifier(attributeModifier),
    formattedProficiencyBonus: isProficient
      ? formatNumberModifier(proficiencyBonus)
      : "—",
    formattedTotal: formatNumberModifier(total),
  };
}

export function getCharacterSkillKeysFromSkills(
  skills?: Array<{
    skill: {
      key: string;
    };
  }> | null,
) {
  return skills?.map((sheetSkill) => sheetSkill.skill.key) ?? [];
}