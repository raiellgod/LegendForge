import type {
  CharacterBuilderClassDraftEntry,
  CharacterBuilderClassOption,
  CharacterBuilderProgressionChoice,
} from "@/features/character-builder/types/character-builder-types";

export type RequiredCharacterProgressionChoice = {
  classEntryId: string;
  classId: string;
  className: string;
  classLevel: number;
  choiceIndex: number;
};

export function getCharacterProgressionChoiceKey({
  classEntryId,
  classLevel,
  choiceIndex,
}: RequiredCharacterProgressionChoice) {
  return `${classEntryId}:${classLevel}:${choiceIndex}`;
}

function areAttributeIncreaseMapsEqual(
  firstMap: CharacterBuilderProgressionChoice["attributeIncreases"],
  secondMap: CharacterBuilderProgressionChoice["attributeIncreases"],
) {
  const attributeKeys = new Set([
    ...Object.keys(firstMap),
    ...Object.keys(secondMap),
  ]);

  for (const attributeKey of attributeKeys) {
    const firstValue =
      firstMap[
        attributeKey as keyof CharacterBuilderProgressionChoice["attributeIncreases"]
      ] ?? 0;

    const secondValue =
      secondMap[
        attributeKey as keyof CharacterBuilderProgressionChoice["attributeIncreases"]
      ] ?? 0;

    if (firstValue !== secondValue) {
      return false;
    }
  }

  return true;
}

function areProgressionChoicesEqual(
  firstChoices: CharacterBuilderProgressionChoice[],
  secondChoices: CharacterBuilderProgressionChoice[],
) {
  if (firstChoices.length !== secondChoices.length) {
    return false;
  }

  return firstChoices.every((firstChoice, index) => {
    const secondChoice = secondChoices[index];

    if (!secondChoice) {
      return false;
    }

    return (
      firstChoice.classEntryId === secondChoice.classEntryId &&
      firstChoice.classId === secondChoice.classId &&
      firstChoice.className === secondChoice.className &&
      firstChoice.classLevel === secondChoice.classLevel &&
      firstChoice.choiceIndex === secondChoice.choiceIndex &&
      firstChoice.type === secondChoice.type &&
      firstChoice.attributeIncreaseMode ===
        secondChoice.attributeIncreaseMode &&
      firstChoice.talentId === secondChoice.talentId &&
      areAttributeIncreaseMapsEqual(
        firstChoice.attributeIncreases,
        secondChoice.attributeIncreases,
      )
    );
  });
}

export function getRequiredCharacterProgressionChoices({
  classEntries,
  classes,
}: {
  classEntries: CharacterBuilderClassDraftEntry[];
  classes: CharacterBuilderClassOption[];
}): RequiredCharacterProgressionChoice[] {
  const classesById = new Map(
    classes.map((characterClass) => [characterClass.id, characterClass]),
  );

  return [...classEntries]
    .sort((firstEntry, secondEntry) => {
      return firstEntry.order - secondEntry.order;
    })
    .flatMap((classEntry) => {
      const characterClass = classesById.get(classEntry.classId);

      if (!characterClass) {
        return [];
      }

      return characterClass.levelProgressions
        .filter((progression) => {
          return (
            progression.level <= classEntry.level &&
            progression.progressionChoiceCount > 0
          );
        })
        .sort((firstProgression, secondProgression) => {
          return firstProgression.level - secondProgression.level;
        })
        .flatMap((progression) => {
          return Array.from(
            {
              length: progression.progressionChoiceCount,
            },
            (_, choiceIndex) => ({
              classEntryId: classEntry.id,
              classId: classEntry.classId,
              className: classEntry.className,
              classLevel: progression.level,
              choiceIndex,
            }),
          );
        });
    });
}

export function synchronizeCharacterProgressionChoices({
  requiredChoices,
  currentChoices,
}: {
  requiredChoices: RequiredCharacterProgressionChoice[];
  currentChoices: CharacterBuilderProgressionChoice[];
}): CharacterBuilderProgressionChoice[] {
  const currentChoicesByKey = new Map(
    currentChoices.map((choice) => [
      getCharacterProgressionChoiceKey(choice),
      choice,
    ]),
  );

  const synchronizedChoices = requiredChoices.map((requiredChoice) => {
    const choiceKey = getCharacterProgressionChoiceKey(requiredChoice);
    const currentChoice = currentChoicesByKey.get(choiceKey);

    if (!currentChoice) {
      return {
        ...requiredChoice,
        type: null,
        attributeIncreaseMode: null,
        attributeIncreases: {},
        talentId: null,
      } satisfies CharacterBuilderProgressionChoice;
    }

    return {
      ...currentChoice,
      classEntryId: requiredChoice.classEntryId,
      classId: requiredChoice.classId,
      className: requiredChoice.className,
      classLevel: requiredChoice.classLevel,
      choiceIndex: requiredChoice.choiceIndex,
    };
  });

  if (areProgressionChoicesEqual(currentChoices, synchronizedChoices)) {
    return currentChoices;
  }

  return synchronizedChoices;
}

export function isCharacterProgressionChoiceResolved(
  choice: CharacterBuilderProgressionChoice,
) {
  if (choice.type === "TALENT") {
    return Boolean(choice.talentId);
  }

  if (choice.type !== "ATTRIBUTE_INCREASE") {
    return false;
  }

  const attributeIncreaseValues = Object.values(
    choice.attributeIncreases,
  ).filter((value): value is number => {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  });

  if (choice.attributeIncreaseMode === "FOCUSED") {
    return (
      attributeIncreaseValues.length === 1 &&
      attributeIncreaseValues[0] === 2
    );
  }

  if (choice.attributeIncreaseMode === "SPLIT") {
    return (
      attributeIncreaseValues.length === 2 &&
      attributeIncreaseValues.every((value) => value === 1)
    );
  }

  return false;
}