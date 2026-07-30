import type {
  CharacterAttributeKey,
  CharacterBuilderAncestryOption,
  CharacterBuilderClassOption,
  CharacterBuilderDraft,
  CharacterBuilderTalentOption,
} from "@/features/character-builder/types/character-builder-types";

export type TalentPrerequisiteCheckStatus =
  | "MET"
  | "UNMET"
  | "UNKNOWN";

export type TalentPrerequisiteCheck = {
  key: string;
  label: string;
  status: TalentPrerequisiteCheckStatus;
};

export type TalentPrerequisiteValidationResult = {
  checks: TalentPrerequisiteCheck[];
  isSelectable: boolean;
  hasUnknownChecks: boolean;
};

const ATTRIBUTE_LABELS: Record<CharacterAttributeKey, string> = {
  strength: "Força",
  dexterity: "Destreza",
  constitution: "Constituição",
  intelligence: "Inteligência",
  wisdom: "Sabedoria",
  charisma: "Carisma",
};

function formatRuleKey(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getSelectedCharacterClasses({
  draft,
  classes,
}: {
  draft: CharacterBuilderDraft;
  classes: CharacterBuilderClassOption[];
}) {
  const classesById = new Map(
    classes.map((characterClass) => [
      characterClass.id,
      characterClass,
    ]),
  );

  return draft.classEntries
    .map((classEntry) => {
      const characterClass = classesById.get(classEntry.classId);

      if (!characterClass) {
        return null;
      }

      return {
        classEntry,
        characterClass,
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        classEntry: CharacterBuilderDraft["classEntries"][number];
        characterClass: CharacterBuilderClassOption;
      } => Boolean(entry),
    );
}

export function validateTalentPrerequisites({
  talent,
  talents,
  draft,
  classes,
  ancestries,
  currentChoiceTalentId,
}: {
  talent: CharacterBuilderTalentOption;
  talents: CharacterBuilderTalentOption[];
  draft: CharacterBuilderDraft;
  classes: CharacterBuilderClassOption[];
  ancestries: CharacterBuilderAncestryOption[];
  currentChoiceTalentId: string | null;
}): TalentPrerequisiteValidationResult {
  const checks: TalentPrerequisiteCheck[] = [];

  const prerequisites = talent.prerequisites;

  const selectedClasses = getSelectedCharacterClasses({
    draft,
    classes,
  });

  const selectedClassKeys = new Set(
    selectedClasses.map(({ characterClass }) => characterClass.key),
  );

  const selectedSubclassKeys = new Set(
    selectedClasses
      .map(({ classEntry, characterClass }) => {
        if (!classEntry.subclassId) {
          return null;
        }

        return (
          characterClass.subclasses.find(
            (subclass) => subclass.id === classEntry.subclassId,
          )?.key ?? null
        );
      })
      .filter((key): key is string => Boolean(key)),
  );

  const selectedAncestry =
    ancestries.find((ancestry) => ancestry.id === draft.ancestryId) ??
    null;

  const talentsById = new Map(
    talents.map((currentTalent) => [
      currentTalent.id,
      currentTalent,
    ]),
  );

  const selectedTalentKeys = new Set(
    draft.progressionChoices
      .filter((choice) => {
        return choice.talentId !== currentChoiceTalentId;
      })
      .map((choice) => {
        if (!choice.talentId) {
          return null;
        }

        return talentsById.get(choice.talentId)?.key ?? null;
      })
      .filter((key): key is string => Boolean(key)),
  );

  if (prerequisites.minimumCharacterLevel !== undefined) {
    const isMet =
      draft.level >= prerequisites.minimumCharacterLevel;

    checks.push({
      key: "minimum-character-level",
      label: `Nível ${prerequisites.minimumCharacterLevel} ou superior`,
      status: isMet ? "MET" : "UNMET",
    });
  }

  for (const [attributeKey, minimumValue] of Object.entries(
    prerequisites.minimumAttributes ?? {},
  )) {
    const typedAttributeKey = attributeKey as CharacterAttributeKey;
    const currentValue = draft.attributes[typedAttributeKey];

    checks.push({
      key: `minimum-attribute-${attributeKey}`,
      label: `${ATTRIBUTE_LABELS[typedAttributeKey]} ${minimumValue}+`,
      status:
        typeof currentValue === "number" &&
        currentValue >= minimumValue
          ? "MET"
          : "UNMET",
    });
  }

  for (const classKey of prerequisites.requiredClassKeys ?? []) {
    checks.push({
      key: `required-class-${classKey}`,
      label: `Classe: ${formatRuleKey(classKey)}`,
      status: selectedClassKeys.has(classKey) ? "MET" : "UNMET",
    });
  }

  for (const subclassKey of prerequisites.requiredSubclassKeys ?? []) {
    checks.push({
      key: `required-subclass-${subclassKey}`,
      label: `Subclasse: ${formatRuleKey(subclassKey)}`,
      status: selectedSubclassKeys.has(subclassKey)
        ? "MET"
        : "UNMET",
    });
  }

  for (const ancestryKey of prerequisites.requiredAncestryKeys ?? []) {
    checks.push({
      key: `required-ancestry-${ancestryKey}`,
      label: `Ancestralidade: ${formatRuleKey(ancestryKey)}`,
      status:
        selectedAncestry?.key === ancestryKey ? "MET" : "UNMET",
    });
  }

  for (const requiredTalentKey of prerequisites.requiredTalentKeys ?? []) {
    checks.push({
      key: `required-talent-${requiredTalentKey}`,
      label: `Talento: ${formatRuleKey(requiredTalentKey)}`,
      status: selectedTalentKeys.has(requiredTalentKey)
        ? "MET"
        : "UNMET",
    });
  }

  if (prerequisites.requiresSpellcasting !== undefined) {
    const hasSpellcastingClass = selectedClasses.some(
      ({ characterClass }) =>
        characterClass.spellcastingAbilityKey !== null,
    );

    checks.push({
      key: "requires-spellcasting",
      label: prerequisites.requiresSpellcasting
        ? "Requer conjuração"
        : "Não pode possuir conjuração",
      status:
        hasSpellcastingClass === prerequisites.requiresSpellcasting
          ? "MET"
          : "UNMET",
    });
  }

  for (const proficiencyKey of prerequisites.requiredProficiencyKeys ?? []) {
    checks.push({
      key: `required-proficiency-${proficiencyKey}`,
      label: `Proficiência: ${formatRuleKey(proficiencyKey)}`,
      status: "UNKNOWN",
    });
  }

  const hasUnmetChecks = checks.some(
    (check) => check.status === "UNMET",
  );

  const hasUnknownChecks = checks.some(
    (check) => check.status === "UNKNOWN",
  );

  return {
    checks,
    isSelectable: !hasUnmetChecks,
    hasUnknownChecks,
  };
}