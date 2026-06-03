import type {
  CharacterAttributeKey,
  CharacterSheetStatResponse,
} from "@/features/character-builder/types/character-builder-types";

export type ReadySheetStat = CharacterSheetStatResponse & {
  stat: {
    key: CharacterAttributeKey | string;
    name?: string;
    shortName?: string;
  };
};

export type ReadySheetSkill = {
  isProficient: boolean;
  expertiseLevel?: number | null;
  bonusValue?: number | null;
  overrideValue?: number | null;
  skill: {
    key: string;
    name: string;
    stat: {
      key: CharacterAttributeKey | string;
    };
  };
};

export type ReadySheetEquipmentAttack = {
  attackType?: string | null;
  attackAbilityKey?: string | null;
  alternativeAbilityKey?: string | null;
  weaponGroup?: string | null;
  attackBonus?: number | null;
  damageBonus?: number | null;
  isFinesse?: boolean | null;
};

export function getAttributeModifier(value: number | null | undefined) {
  if (typeof value !== "number") {
    return 0;
  }

  return Math.floor((value - 10) / 2);
}

export function formatSignedNumber(value: number) {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

export function getProficiencyBonusByLevel(level: number | null | undefined) {
  const safeLevel =
    typeof level === "number" && Number.isFinite(level) ? level : 1;

  if (safeLevel >= 17) {
    return 6;
  }

  if (safeLevel >= 13) {
    return 5;
  }

  if (safeLevel >= 9) {
    return 4;
  }

  if (safeLevel >= 5) {
    return 3;
  }

  return 2;
}

export function getAttributeValueFromStats(
  stats: ReadySheetStat[],
  attributeKey: CharacterAttributeKey,
) {
  return (
    stats.find((sheetStat) => sheetStat.stat.key === attributeKey)?.baseValue ??
    null
  );
}

export function getAttributeModifierFromStats(
  stats: ReadySheetStat[],
  attributeKey: CharacterAttributeKey,
) {
  return getAttributeModifier(getAttributeValueFromStats(stats, attributeKey));
}

export function getInitiativeBonus(stats: ReadySheetStat[]) {
  return getAttributeModifierFromStats(stats, "dexterity");
}

export function getSavingThrowBonus({
  stats,
  attributeKey,
  level,
  isProficient,
  bonusValue = 0,
  overrideValue = null,
}: {
  stats: ReadySheetStat[];
  attributeKey: CharacterAttributeKey;
  level: number;
  isProficient: boolean;
  bonusValue?: number | null;
  overrideValue?: number | null;
}) {
  if (typeof overrideValue === "number") {
    return overrideValue;
  }

  const attributeModifier = getAttributeModifierFromStats(stats, attributeKey);
  const proficiencyBonus = isProficient ? getProficiencyBonusByLevel(level) : 0;

  return attributeModifier + proficiencyBonus + (bonusValue ?? 0);
}

export function getSkillBonus({
  stats,
  skill,
  level,
}: {
  stats: ReadySheetStat[];
  skill: ReadySheetSkill;
  level: number;
}) {
  if (typeof skill.overrideValue === "number") {
    return skill.overrideValue;
  }

  const attributeKey = skill.skill.stat.key as CharacterAttributeKey;
  const attributeModifier = getAttributeModifierFromStats(stats, attributeKey);

  const proficiencyMultiplier =
    skill.isProficient && skill.expertiseLevel && skill.expertiseLevel > 0
      ? skill.expertiseLevel
      : skill.isProficient
        ? 1
        : 0;

  const proficiencyBonus =
    getProficiencyBonusByLevel(level) * proficiencyMultiplier;

  return attributeModifier + proficiencyBonus + (skill.bonusValue ?? 0);
}

export function getPassivePerception({
  stats,
  skills,
  level,
}: {
  stats: ReadySheetStat[];
  skills: ReadySheetSkill[];
  level: number;
}) {
  const perceptionSkill = skills.find(
    (sheetSkill) => sheetSkill.skill.key === "percepcao",
  );

  if (perceptionSkill) {
    return 10 + getSkillBonus({ stats, skill: perceptionSkill, level });
  }

  return 10 + getAttributeModifierFromStats(stats, "wisdom");
}

export function getSpellcastingAbilityKey(
  spellcastingAbilityKey: string | null | undefined,
) {
  if (!isCharacterAttributeKey(spellcastingAbilityKey)) {
    return null;
  }

  return spellcastingAbilityKey;
}

export function getSpellcastingAbilityModifier({
  stats,
  spellcastingAbilityKey,
}: {
  stats: ReadySheetStat[];
  spellcastingAbilityKey: string | null | undefined;
}) {
  const attributeKey = getSpellcastingAbilityKey(spellcastingAbilityKey);

  if (!attributeKey) {
    return null;
  }

  return getAttributeModifierFromStats(stats, attributeKey);
}

export function getSpellSaveDc({
  stats,
  level,
  spellcastingAbilityKey,
}: {
  stats: ReadySheetStat[];
  level: number;
  spellcastingAbilityKey: string | null | undefined;
}) {
  const spellcastingModifier = getSpellcastingAbilityModifier({
    stats,
    spellcastingAbilityKey,
  });

  if (spellcastingModifier === null) {
    return null;
  }

  return 8 + getProficiencyBonusByLevel(level) + spellcastingModifier;
}

export function getSpellAttackBonus({
  stats,
  level,
  spellcastingAbilityKey,
}: {
  stats: ReadySheetStat[];
  level: number;
  spellcastingAbilityKey: string | null | undefined;
}) {
  const spellcastingModifier = getSpellcastingAbilityModifier({
    stats,
    spellcastingAbilityKey,
  });

  if (spellcastingModifier === null) {
    return null;
  }

  return getProficiencyBonusByLevel(level) + spellcastingModifier;
}

export function getEquipmentAttackAbilityKey({
  equipment,
  stats,
}: {
  equipment: ReadySheetEquipmentAttack;
  stats: ReadySheetStat[];
}) {
  const mainAbilityKey = isCharacterAttributeKey(equipment.attackAbilityKey)
    ? equipment.attackAbilityKey
    : null;

  const alternativeAbilityKey = isCharacterAttributeKey(
    equipment.alternativeAbilityKey,
  )
    ? equipment.alternativeAbilityKey
    : null;

  if (!mainAbilityKey && !alternativeAbilityKey) {
    return null;
  }

  if (!alternativeAbilityKey || !equipment.isFinesse || !mainAbilityKey) {
    return mainAbilityKey ?? alternativeAbilityKey;
  }

  const mainModifier = getAttributeModifierFromStats(stats, mainAbilityKey);
  const alternativeModifier = getAttributeModifierFromStats(
    stats,
    alternativeAbilityKey,
  );

  return alternativeModifier > mainModifier
    ? alternativeAbilityKey
    : mainAbilityKey;
}

export function getEquipmentAttackBonus({
  stats,
  level,
  equipment,
  isProficient = true,
}: {
  stats: ReadySheetStat[];
  level: number;
  equipment: ReadySheetEquipmentAttack;
  isProficient?: boolean;
}) {
  if (!equipment.attackType || equipment.attackType === "NONE") {
    return null;
  }

  const attackAbilityKey = getEquipmentAttackAbilityKey({
    equipment,
    stats,
  });

  if (!attackAbilityKey) {
    return null;
  }

  const attributeModifier = getAttributeModifierFromStats(
    stats,
    attackAbilityKey,
  );

  const proficiencyBonus = isProficient
    ? getProficiencyBonusByLevel(level)
    : 0;

  return attributeModifier + proficiencyBonus + (equipment.attackBonus ?? 0);
}

export function getEquipmentDamageExpression({
  damageFormula,
  damageFallback,
  damageBonus = 0,
}: {
  damageFormula?: string | null;
  damageFallback?: string | null;
  damageBonus?: number | null;
}) {
  const baseDamage = damageFormula?.trim() || damageFallback?.trim() || "";

  if (!baseDamage) {
    return null;
  }

  const normalizedDamage = baseDamage.toLowerCase().replace(/\s+/g, "");
  const damageExpression =
    normalizedDamage.match(/\d*d\d+(?:[+-]\d+)?/)?.[0] ?? null;

  if (!damageExpression) {
    return null;
  }

  const safeDamageBonus =
    typeof damageBonus === "number" && Number.isFinite(damageBonus)
      ? damageBonus
      : 0;

  if (safeDamageBonus === 0) {
    return damageExpression;
  }

  return `${damageExpression}${safeDamageBonus > 0 ? "+" : ""}${safeDamageBonus}`;
}

const ATTRIBUTE_LABELS: Record<CharacterAttributeKey, string> = {
  strength: "Força",
  dexterity: "Destreza",
  constitution: "Constituição",
  intelligence: "Inteligência",
  wisdom: "Sabedoria",
  charisma: "Carisma",
};

const ATTRIBUTE_SHORT_LABELS: Record<CharacterAttributeKey, string> = {
  strength: "FOR",
  dexterity: "DES",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "SAB",
  charisma: "CAR",
};

export function isCharacterAttributeKey(
  value: string | null | undefined,
): value is CharacterAttributeKey {
  return (
    value === "strength" ||
    value === "dexterity" ||
    value === "constitution" ||
    value === "intelligence" ||
    value === "wisdom" ||
    value === "charisma"
  );
}

export function getAttributeLabel(attributeKey: CharacterAttributeKey) {
  return ATTRIBUTE_LABELS[attributeKey];
}

export function getAttributeShortLabel(attributeKey: CharacterAttributeKey) {
  return ATTRIBUTE_SHORT_LABELS[attributeKey];
}