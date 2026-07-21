import {
  CHARACTER_ATTRIBUTE_DEFINITIONS,
  STANDARD_ARRAY_ATTRIBUTE_VALUES,
} from "@/features/character-builder/constants/character-builder-constants";

import { characterBuilderSteps } from "@/features/character-builder/constants/character-builder-steps";

import type {
  CharacterBuilderDraft,
  CharacterBuilderOptions,
} from "@/features/character-builder/types/character-builder-types";

import { isCantrip } from "@/features/character-builder/utils/spells";

type CharacterBuilderClassOption =
  CharacterBuilderOptions["classes"][number];

type CharacterBuilderAncestryOption =
  CharacterBuilderOptions["ancestries"][number];

type CharacterBuilderBackgroundOption =
  CharacterBuilderOptions["backgrounds"][number];

type GetCharacterBuilderValidationStateParams = {
  draft: CharacterBuilderDraft;
  options: CharacterBuilderOptions;
  selectedClass: CharacterBuilderClassOption | undefined;
  selectedAncestry: CharacterBuilderAncestryOption | undefined;
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
  selectedClassDisplayName: string;
};

export function getCharacterBuilderValidationState({
  draft,
  options,
  selectedClass,
  selectedAncestry,
  selectedBackground,
  selectedClassDisplayName,
}: GetCharacterBuilderValidationStateParams) {
  const orderedClassEntries = [...draft.classEntries].sort(
    (firstEntry, secondEntry) => firstEntry.order - secondEntry.order,
  );

  const pendingSubclassEntries = orderedClassEntries.filter(
    (classEntry) => {
      const characterClass = options.classes.find(
        (currentClass) => currentClass.id === classEntry.classId,
      );

      const subclassSelectionLevel =
        characterClass?.subclassSelectionLevel ?? null;

      return (
        typeof subclassSelectionLevel === "number" &&
        classEntry.level >= subclassSelectionLevel &&
        !classEntry.subclassId
      );
    },
  );

  const hasPendingSubclassChoices =
    pendingSubclassEntries.length > 0;

  const spellValidationClassEntries =
    orderedClassEntries.length > 0
      ? orderedClassEntries
      : selectedClass
        ? [
            {
              id: "primary",
              classId: selectedClass.id,
              className: selectedClass.name,
              subclassId: null,
              subclassName: null,
              level: draft.level,
              isPrimary: true,
              order: 0,
            },
          ]
        : [];

  const requiredKnownSpellLimitsByLevel =
    new Map<number, number>();

  for (const classEntry of spellValidationClassEntries) {
    const classOption = options.classes.find(
      (currentClass) =>
        currentClass.id === classEntry.classId,
    );

    if (!classOption) {
      continue;
    }

    const safeClassLevel = Math.max(
      1,
      Math.min(20, Math.trunc(classEntry.level)),
    );

    const progression = classOption.levelProgressions.find(
      (currentProgression) =>
        currentProgression.level === safeClassLevel,
    );

    for (const spellLimit of progression?.spellLimits ?? []) {
      if (spellLimit.spellsKnown <= 0) {
        continue;
      }

      requiredKnownSpellLimitsByLevel.set(
        spellLimit.spellLevel,
        (requiredKnownSpellLimitsByLevel.get(
          spellLimit.spellLevel,
        ) ?? 0) + spellLimit.spellsKnown,
      );
    }
  }

  const validSelectedBuilderSpells = options.spells.filter(
    (spell) => {
      if (!draft.spellKeys.includes(spell.key)) {
        return false;
      }

      return spellValidationClassEntries.some(
        (classEntry) => {
          const classOption = options.classes.find(
            (currentClass) =>
              currentClass.id === classEntry.classId,
          );

          if (!classOption) {
            return false;
          }

          const safeClassLevel = Math.max(
            1,
            Math.min(
              20,
              Math.trunc(classEntry.level),
            ),
          );

          const progression =
            classOption.levelProgressions.find(
              (currentProgression) =>
                currentProgression.level ===
                safeClassLevel,
            );

          const spellLimit =
            progression?.spellLimits.find(
              (currentSpellLimit) =>
                currentSpellLimit.spellLevel ===
                spell.level,
            );

          const classSpell =
            classOption.classSpells.find(
              (currentClassSpell) =>
                currentClassSpell.spellKey ===
                spell.key,
            );

          return (
            Boolean(classSpell) &&
            (classSpell?.minimumClassLevel ?? 1) <=
              safeClassLevel &&
            (spellLimit?.spellsKnown ?? 0) > 0
          );
        },
      );
    },
  );

  const selectedKnownSpellCountsByLevel =
    new Map<number, number>();

  for (const spell of validSelectedBuilderSpells) {
    selectedKnownSpellCountsByLevel.set(
      spell.level,
      (selectedKnownSpellCountsByLevel.get(
        spell.level,
      ) ?? 0) + 1,
    );
  }

  const pendingKnownSpellChoices = Array.from(
    requiredKnownSpellLimitsByLevel.entries(),
  )
    .filter(([, required]) => required > 0)
    .sort(
      ([firstSpellLevel], [secondSpellLevel]) =>
        firstSpellLevel - secondSpellLevel,
    )
    .map(([spellLevel, required]) => {
      const selected =
        selectedKnownSpellCountsByLevel.get(
          spellLevel,
        ) ?? 0;

      return {
        spellLevel,
        required,
        selected,
        missing: Math.max(0, required - selected),
      };
    })
    .filter(
      (choiceStatus) => choiceStatus.missing > 0,
    );

  const missingKnownSpellCount =
    pendingKnownSpellChoices.reduce(
      (totalMissing, choiceStatus) =>
        totalMissing + choiceStatus.missing,
      0,
    );

  const hasPendingKnownSpellChoices =
    pendingKnownSpellChoices.length > 0;

  const applicableFeatureChoiceGroups =
    options.featureChoiceGroups
      .filter((choiceGroup) => {
        if (
          choiceGroup.ancestryId &&
          choiceGroup.ancestryId !==
            selectedAncestry?.id
        ) {
          return false;
        }

        if (
          choiceGroup.backgroundId &&
          choiceGroup.backgroundId !==
            selectedBackground?.id
        ) {
          return false;
        }

        if (
          choiceGroup.classId &&
          !spellValidationClassEntries.some(
            (classEntry) =>
              classEntry.classId ===
              choiceGroup.classId,
          )
        ) {
          return false;
        }

        if (
          choiceGroup.subclassId &&
          !spellValidationClassEntries.some(
            (classEntry) =>
              classEntry.subclassId ===
              choiceGroup.subclassId,
          )
        ) {
          return false;
        }

        if (
          choiceGroup.levelProgressionId &&
          choiceGroup.classId
        ) {
          const matchingClassEntry =
            spellValidationClassEntries.find(
              (classEntry) =>
                classEntry.classId ===
                choiceGroup.classId,
            );

          if (!matchingClassEntry) {
            return false;
          }

          const characterClass =
            options.classes.find(
              (currentClass) =>
                currentClass.id ===
                choiceGroup.classId,
            );

          if (!characterClass) {
            return false;
          }

          const safeClassLevel = Math.max(
            1,
            Math.min(
              20,
              Math.trunc(
                matchingClassEntry.level,
              ),
            ),
          );

          const hasAvailableProgression =
            characterClass.levelProgressions.some(
              (progression) =>
                progression.level <= safeClassLevel,
            );

          if (!hasAvailableProgression) {
            return false;
          }
        }

        return true;
      })
      .sort((firstGroup, secondGroup) => {
        return (
          firstGroup.order - secondGroup.order ||
          firstGroup.name.localeCompare(
            secondGroup.name,
            "pt-BR",
          )
        );
      });

  const featureChoiceStatuses =
    applicableFeatureChoiceGroups.map(
      (choiceGroup) => {
        const validSelections =
          draft.featureChoiceSelections.filter(
            (selection) => {
              if (
                selection.choiceGroupId !==
                choiceGroup.id
              ) {
                return false;
              }

              return choiceGroup.options.some(
                (option) =>
                  option.feature.id ===
                  selection.featureId,
              );
            },
          );

        const selected = validSelections.length;

        const missing = Math.max(
          0,
          choiceGroup.choiceCount - selected,
        );

        return {
          choiceGroupId: choiceGroup.id,
          choiceGroupName: choiceGroup.name,
          required: choiceGroup.choiceCount,
          selected,
          missing,
          isComplete:
            selected === choiceGroup.choiceCount,
        };
      },
    );

  const pendingFeatureChoiceStatuses =
    featureChoiceStatuses.filter(
      (choiceStatus) => !choiceStatus.isComplete,
    );

  const missingFeatureChoiceCount =
    pendingFeatureChoiceStatuses.reduce(
      (totalMissing, choiceStatus) =>
        totalMissing + choiceStatus.missing,
      0,
    );

  const hasPendingFeatureChoices =
    pendingFeatureChoiceStatuses.length > 0;

  const primaryClassEntry =
    orderedClassEntries.find(
      (classEntry) => classEntry.isPrimary,
    ) ??
    orderedClassEntries[0] ??
    null;

  const classEntriesSummary =
    orderedClassEntries.length > 0
      ? orderedClassEntries
          .map(
            (classEntry) =>
              `${classEntry.className} ${classEntry.level}`,
          )
          .join(" / ")
      : selectedClassDisplayName || "Não definida";

  const classEntriesTotalLevel =
    orderedClassEntries.reduce(
      (totalLevel, classEntry) =>
        totalLevel + classEntry.level,
      0,
    );

  const classLevelDistributionStatus =
    orderedClassEntries.length === 0
      ? "Nenhuma classe definida"
      : classEntriesTotalLevel === draft.level
        ? "Distribuição válida"
        : `Distribuição incompleta: ${classEntriesTotalLevel}/${draft.level}`;

  const requiredSkillChoiceCount =
    selectedClass?.classSkillChoiceCount ?? 0;

  const requiredLanguageChoiceCount =
    selectedBackground?.languageChoiceCount ?? 0;

  const automaticLanguageKeys = Array.from(
    new Set([
      ...(selectedAncestry?.languageKeys ?? []),
      ...(selectedBackground?.languageKeys ?? []),
    ]),
  );

  const selectedSkillCount = draft.skillKeys.length;

  const selectedLanguageChoiceCount =
    draft.languageKeys.length;

  const selectedSpellCount = draft.spellKeys.length;

  const selectedCantripCount =
    draft.spellKeys.filter((spellKey) => {
      const spell = options.spells.find(
        (currentSpell) =>
          currentSpell.key === spellKey,
      );

      return spell ? isCantrip(spell) : false;
    }).length;

  const selectedLeveledSpellCount =
    selectedSpellCount - selectedCantripCount;

  const assignedAttributeValues =
    CHARACTER_ATTRIBUTE_DEFINITIONS.map(
      (attribute) =>
        draft.attributes[attribute.key],
    ).filter(
      (value): value is number => value !== null,
    );

  const attributeTotal =
    assignedAttributeValues.reduce(
      (total, value) => total + value,
      0,
    );

  const strongestAttribute =
    assignedAttributeValues.length > 0
      ? CHARACTER_ATTRIBUTE_DEFINITIONS.reduce(
          (strongest, attribute) => {
            const currentValue =
              draft.attributes[attribute.key];

            const strongestValue =
              draft.attributes[strongest.key];

            if (currentValue === null) {
              return strongest;
            }

            if (
              strongestValue === null ||
              currentValue > strongestValue
            ) {
              return attribute;
            }

            return strongest;
          },
          CHARACTER_ATTRIBUTE_DEFINITIONS[0]!,
        )
      : null;

  function isStepComplete(stepId: string) {
    if (stepId === "concept") {
      return Boolean(draft.name.trim());
    }

    if (stepId === "class") {
      return (
        Boolean(draft.classId) &&
        !hasPendingSubclassChoices
      );
    }

    if (stepId === "ancestry") {
      return Boolean(draft.ancestryId);
    }

    if (stepId === "background") {
      return Boolean(draft.backgroundId);
    }

    if (stepId === "attributes") {
      const attributeValues =
        CHARACTER_ATTRIBUTE_DEFINITIONS.map(
          (attribute) =>
            draft.attributes[attribute.key],
        );

      const allAttributesWereChosen =
        attributeValues.every(
          (value): value is number =>
            value !== null,
        );

      if (!allAttributesWereChosen) {
        return false;
      }

      const usesOnlyStandardArrayValues =
        attributeValues.every((value) =>
          STANDARD_ARRAY_ATTRIBUTE_VALUES.includes(
            value,
          ),
        );

      const usesEachValueOnlyOnce =
        new Set(attributeValues).size ===
        STANDARD_ARRAY_ATTRIBUTE_VALUES.length;

      return (
        usesOnlyStandardArrayValues &&
        usesEachValueOnlyOnce
      );
    }

    if (stepId === "skills") {
      return (
        Boolean(draft.classId) &&
        draft.skillKeys.length >=
          requiredSkillChoiceCount
      );
    }

    if (stepId === "languages") {
      return (
        draft.languageKeys.length >=
        requiredLanguageChoiceCount
      );
    }

    if (stepId === "spells") {
      return !hasPendingKnownSpellChoices;
    }

    if (stepId === "features") {
      return !hasPendingFeatureChoices;
    }

    return true;
  }

  function getStepValidationMessage(
    stepId: string,
  ) {
    if (
      stepId === "concept" &&
      !draft.name.trim()
    ) {
      return "Informe o nome do personagem antes de avançar.";
    }

    if (stepId === "class" && !draft.classId) {
      return "Escolha uma classe antes de avançar.";
    }

    if (
      stepId === "class" &&
      hasPendingSubclassChoices
    ) {
      const pendingClassNames =
        pendingSubclassEntries
          .map(
            (classEntry) =>
              classEntry.className,
          )
          .join(", ");

      return `Escolha a subclasse obrigatória de: ${pendingClassNames}.`;
    }

    if (
      stepId === "ancestry" &&
      !draft.ancestryId
    ) {
      return "Escolha uma ancestralidade antes de avançar.";
    }

    if (
      stepId === "background" &&
      !draft.backgroundId
    ) {
      return "Escolha um antecedente antes de avançar.";
    }

    if (
      stepId === "attributes" &&
      !isStepComplete("attributes")
    ) {
      return "Distribua os valores fixos 15, 14, 13, 12, 10 e 8 sem repetir nenhum valor.";
    }

    if (
      stepId === "skills" &&
      !isStepComplete("skills")
    ) {
      return `Escolha ${requiredSkillChoiceCount} perícias da classe. O antecedente apenas sugere opções. Atualmente você escolheu ${selectedSkillCount}.`;
    }

    if (
      stepId === "languages" &&
      !isStepComplete("languages")
    ) {
      return `Escolha ${requiredLanguageChoiceCount} idioma(s) extra(s) do antecedente. Idiomas fixos da ancestralidade e do antecedente já aparecem como automáticos. Atualmente você escolheu ${selectedLanguageChoiceCount}.`;
    }

    if (
      stepId === "spells" &&
      hasPendingKnownSpellChoices
    ) {
      const pendingLevelsText =
        pendingKnownSpellChoices
          .map((choiceStatus) => {
            const levelLabel =
              choiceStatus.spellLevel === 0
                ? "truques"
                : `nível ${choiceStatus.spellLevel}`;

            return `${levelLabel}: faltam ${choiceStatus.missing}`;
          })
          .join("; ");

      return `Complete as escolhas de magias conhecidas antes de avançar. ${pendingLevelsText}.`;
    }

    if (
      stepId === "features" &&
      hasPendingFeatureChoices
    ) {
      const pendingGroupsText =
        pendingFeatureChoiceStatuses
          .map((choiceStatus) => {
            return `${choiceStatus.choiceGroupName}: faltam ${choiceStatus.missing}`;
          })
          .join("; ");

      return `Complete as escolhas de features antes de avançar. ${pendingGroupsText}.`;
    }

    return null;
  }

  function canEnterStep(stepId: string) {
    const targetStepIndex =
      characterBuilderSteps.findIndex(
        (step) => step.id === stepId,
      );

    if (targetStepIndex <= 0) {
      return true;
    }

    return characterBuilderSteps
      .slice(0, targetStepIndex)
      .every((step) =>
        isStepComplete(step.id),
      );
  }

  const finalizationValidationMessages: string[] =
    [];

  if (hasPendingSubclassChoices) {
    finalizationValidationMessages.push(
      `Escolha a subclasse obrigatória de: ${pendingSubclassEntries
        .map(
          (classEntry) =>
            classEntry.className,
        )
        .join(", ")}.`,
    );
  }

  if (hasPendingKnownSpellChoices) {
    finalizationValidationMessages.push(
      `Complete as escolhas de magias conhecidas. Ainda faltam ${missingKnownSpellCount} escolha(s).`,
    );
  }

  if (hasPendingFeatureChoices) {
    finalizationValidationMessages.push(
      `Complete as escolhas de features. Ainda faltam ${missingFeatureChoiceCount} escolha(s).`,
    );
  }

  const finalizationValidationMessage =
    finalizationValidationMessages.length > 0
      ? finalizationValidationMessages.join(" ")
      : null;

  const canFinalizeCharacterSheet =
    finalizationValidationMessages.length === 0;

  return {
    orderedClassEntries,
    pendingSubclassEntries,
    hasPendingSubclassChoices,

    spellValidationClassEntries,
    requiredKnownSpellLimitsByLevel,
    validSelectedBuilderSpells,
    selectedKnownSpellCountsByLevel,
    pendingKnownSpellChoices,
    missingKnownSpellCount,
    hasPendingKnownSpellChoices,

    applicableFeatureChoiceGroups,
    featureChoiceStatuses,
    pendingFeatureChoiceStatuses,
    missingFeatureChoiceCount,
    hasPendingFeatureChoices,

    primaryClassEntry,
    classEntriesSummary,
    classEntriesTotalLevel,
    classLevelDistributionStatus,

    requiredSkillChoiceCount,
    requiredLanguageChoiceCount,
    automaticLanguageKeys,

    selectedSkillCount,
    selectedLanguageChoiceCount,
    selectedSpellCount,
    selectedCantripCount,
    selectedLeveledSpellCount,

    assignedAttributeValues,
    attributeTotal,
    strongestAttribute,

    isStepComplete,
    getStepValidationMessage,
    canEnterStep,

    finalizationValidationMessages,
    finalizationValidationMessage,
    canFinalizeCharacterSheet,
  };
}