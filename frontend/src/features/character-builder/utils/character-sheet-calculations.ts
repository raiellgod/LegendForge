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