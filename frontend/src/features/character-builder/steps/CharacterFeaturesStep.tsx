import { useEffect, useMemo } from "react";

import type {
  CharacterBuilderAncestryOption,
  CharacterBuilderBackgroundOption,
  CharacterBuilderClassDraftEntry,
  CharacterBuilderClassOption,
  CharacterBuilderFeatureChoiceGroup,
  CharacterBuilderFeatureChoiceSelection,
} from "../types/character-builder-types";

type CharacterFeaturesStepProps = {
  featureChoiceGroups: CharacterBuilderFeatureChoiceGroup[];
  classes: CharacterBuilderClassOption[];
  classEntries: CharacterBuilderClassDraftEntry[];
  selectedClass: CharacterBuilderClassOption | undefined;
  selectedAncestry: CharacterBuilderAncestryOption | undefined;
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
  characterLevel: number;
  selections: CharacterBuilderFeatureChoiceSelection[];
  isLoading: boolean;
  error: string | null;
  onChangeSelections: (
    selections: CharacterBuilderFeatureChoiceSelection[],
  ) => void;
};

function normalizeCharacterLevel(level: number) {
  if (!Number.isFinite(level)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.trunc(level)));
}

function getEffectiveClassEntries({
  classEntries,
  selectedClass,
  characterLevel,
}: {
  classEntries: CharacterBuilderClassDraftEntry[];
  selectedClass: CharacterBuilderClassOption | undefined;
  characterLevel: number;
}) {
  if (classEntries.length > 0) {
    return [...classEntries].sort(
      (firstEntry, secondEntry) => firstEntry.order - secondEntry.order,
    );
  }

  if (!selectedClass) {
    return [];
  }

  return [
    {
      id: "primary",
      classId: selectedClass.id,
      className: selectedClass.name,
      subclassId: null,
      subclassName: null,
      level: normalizeCharacterLevel(characterLevel),
      isPrimary: true,
      order: 0,
    },
  ];
}

function isFeatureChoiceGroupApplicable({
  choiceGroup,
  classes,
  classEntries,
  ancestryId,
  backgroundId,
}: {
  choiceGroup: CharacterBuilderFeatureChoiceGroup;
  classes: CharacterBuilderClassOption[];
  classEntries: CharacterBuilderClassDraftEntry[];
  ancestryId: string | null;
  backgroundId: string | null;
}) {
  if (choiceGroup.ancestryId && choiceGroup.ancestryId !== ancestryId) {
    return false;
  }

  if (choiceGroup.backgroundId && choiceGroup.backgroundId !== backgroundId) {
    return false;
  }

  if (
    choiceGroup.classId &&
    !classEntries.some(
      (classEntry) => classEntry.classId === choiceGroup.classId,
    )
  ) {
    return false;
  }

  if (
    choiceGroup.subclassId &&
    !classEntries.some(
      (classEntry) => classEntry.subclassId === choiceGroup.subclassId,
    )
  ) {
    return false;
  }

  if (choiceGroup.levelProgressionId && choiceGroup.classId) {
    const matchingClassEntry = classEntries.find((classEntry) => {
      return classEntry.classId === choiceGroup.classId;
    });

    if (!matchingClassEntry) {
      return false;
    }

    const characterClass = classes.find((currentClass) => {
      return currentClass.id === choiceGroup.classId;
    });

    if (!characterClass) {
      return false;
    }

    const safeClassLevel = normalizeCharacterLevel(
      matchingClassEntry.level,
    );

    const hasAvailableProgression = characterClass.levelProgressions.some(
      (progression) => progression.level <= safeClassLevel,
    );

    if (!hasAvailableProgression) {
      return false;
    }
  }

  return true;
}

function getFeatureChoiceGroupSourceLabel({
  choiceGroup,
  classes,
  selectedAncestry,
  selectedBackground,
}: {
  choiceGroup: CharacterBuilderFeatureChoiceGroup;
  classes: CharacterBuilderClassOption[];
  selectedAncestry: CharacterBuilderAncestryOption | undefined;
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
}) {
  if (choiceGroup.subclassId) {
    const subclass = classes
      .flatMap((characterClass) => characterClass.subclasses)
      .find((currentSubclass) => {
        return currentSubclass.id === choiceGroup.subclassId;
      });

    return subclass?.name ?? "Subclasse";
  }

  if (choiceGroup.classId) {
    const characterClass = classes.find((currentClass) => {
      return currentClass.id === choiceGroup.classId;
    });

    return characterClass?.name ?? "Classe";
  }

  if (choiceGroup.ancestryId) {
    return selectedAncestry?.name ?? "Ancestralidade";
  }

  if (choiceGroup.backgroundId) {
    return selectedBackground?.name ?? "Antecedente";
  }

  return "Outra fonte";
}

function areFeatureSelectionsEqual(
  firstSelections: CharacterBuilderFeatureChoiceSelection[],
  secondSelections: CharacterBuilderFeatureChoiceSelection[],
) {
  if (firstSelections.length !== secondSelections.length) {
    return false;
  }

  return firstSelections.every((selection, index) => {
    const comparisonSelection = secondSelections[index];

    return (
      comparisonSelection?.choiceGroupId === selection.choiceGroupId &&
      comparisonSelection.featureId === selection.featureId
    );
  });
}

export function CharacterFeaturesStep({
  featureChoiceGroups,
  classes,
  classEntries,
  selectedClass,
  selectedAncestry,
  selectedBackground,
  characterLevel,
  selections,
  isLoading,
  error,
  onChangeSelections,
}: CharacterFeaturesStepProps) {
  const effectiveClassEntries = useMemo(() => {
    return getEffectiveClassEntries({
      classEntries,
      selectedClass,
      characterLevel,
    });
  }, [classEntries, selectedClass, characterLevel]);

  const applicableChoiceGroups = useMemo(() => {
    return featureChoiceGroups
      .filter((choiceGroup) => {
        return isFeatureChoiceGroupApplicable({
          choiceGroup,
          classes,
          classEntries: effectiveClassEntries,
          ancestryId: selectedAncestry?.id ?? null,
          backgroundId: selectedBackground?.id ?? null,
        });
      })
      .sort((firstGroup, secondGroup) => {
        return (
          firstGroup.order - secondGroup.order ||
          firstGroup.name.localeCompare(secondGroup.name, "pt-BR")
        );
      });
  }, [
    featureChoiceGroups,
    classes,
    effectiveClassEntries,
    selectedAncestry,
    selectedBackground,
  ]);

  const applicableChoiceGroupIds = useMemo(() => {
    return new Set(
      applicableChoiceGroups.map((choiceGroup) => choiceGroup.id),
    );
  }, [applicableChoiceGroups]);

  const validSelections = useMemo(() => {
    return selections.filter((selection) => {
      if (!applicableChoiceGroupIds.has(selection.choiceGroupId)) {
        return false;
      }

      const choiceGroup = applicableChoiceGroups.find((currentGroup) => {
        return currentGroup.id === selection.choiceGroupId;
      });

      return choiceGroup?.options.some((option) => {
        return option.feature.id === selection.featureId;
      });
    });
  }, [
    selections,
    applicableChoiceGroupIds,
    applicableChoiceGroups,
  ]);

  useEffect(() => {
    if (!areFeatureSelectionsEqual(selections, validSelections)) {
      onChangeSelections(validSelections);
    }
  }, [selections, validSelections, onChangeSelections]);

  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando escolhas de features...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm font-bold text-red-200">
        {error}
      </div>
    );
  }

  if (applicableChoiceGroups.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
          Não se aplica
        </p>

        <h4 className="mt-2 text-lg font-black text-zinc-100">
          Nenhuma escolha de feature disponível
        </h4>

        <p className="mt-2 max-w-3xl text-sm font-bold leading-relaxed text-zinc-400">
          As fontes e os níveis atuais do personagem não concedem escolhas
          opcionais de features. Recursos automáticos continuam sendo
          adicionados normalmente.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <section className="rounded-2xl border border-forge-gold/20 bg-black/20 p-5 shadow-[-5px_5px_0_rgba(0,0,0,0.24)]">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-forge-gold">
          Escolhas de features
        </p>

        <h4 className="mt-2 text-xl font-black text-zinc-100">
          Defina recursos opcionais
        </h4>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
          Escolha estilos, técnicas ou especializações concedidas pelas fontes
          atuais do personagem. Features automáticas não precisam ser
          selecionadas aqui.
        </p>
      </section>

      {applicableChoiceGroups.map((choiceGroup) => {
        const groupSelections = validSelections.filter((selection) => {
          return selection.choiceGroupId === choiceGroup.id;
        });

        const selectedFeatureIds = new Set(
          groupSelections.map((selection) => selection.featureId),
        );

        const selectedCount = groupSelections.length;
        const remainingCount = Math.max(
          0,
          choiceGroup.choiceCount - selectedCount,
        );

        const isGroupComplete =
          selectedCount === choiceGroup.choiceCount;

        const sourceLabel = getFeatureChoiceGroupSourceLabel({
          choiceGroup,
          classes,
          selectedAncestry,
          selectedBackground,
        });

        return (
          <section
            key={choiceGroup.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold/80">
                    {sourceLabel}
                  </p>

                  <span
                    className={[
                      "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]",
                      isGroupComplete
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                        : "border-amber-400/30 bg-amber-500/10 text-amber-100",
                    ].join(" ")}
                  >
                    {isGroupComplete ? "Completo" : "Pendente"}
                  </span>
                </div>

                <h4 className="mt-2 text-lg font-black text-zinc-100">
                  {choiceGroup.name}
                </h4>

                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
                  {choiceGroup.description ??
                    "Escolha uma das opções disponíveis para este grupo."}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/30 px-4 py-3 text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  Escolhas
                </p>

                <p className="mt-1 text-lg font-black text-forge-gold">
                  {selectedCount}/{choiceGroup.choiceCount}
                </p>

                <p className="mt-1 text-xs font-bold text-zinc-500">
                  {remainingCount === 0
                    ? "Limite preenchido"
                    : `${remainingCount} restante(s)`}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {choiceGroup.options.map((option) => {
                const feature = option.feature;
                const isSelected = selectedFeatureIds.has(feature.id);
                const isLimitReached =
                  !isSelected &&
                  selectedCount >= choiceGroup.choiceCount;

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={isLimitReached}
                    onClick={() => {
                      if (isSelected) {
                        onChangeSelections(
                          validSelections.filter((selection) => {
                            return !(
                              selection.choiceGroupId === choiceGroup.id &&
                              selection.featureId === feature.id
                            );
                          }),
                        );

                        return;
                      }

                      if (isLimitReached) {
                        return;
                      }

                      onChangeSelections([
                        ...validSelections,
                        {
                          choiceGroupId: choiceGroup.id,
                          featureId: feature.id,
                        },
                      ]);
                    }}
                    title={
                      isLimitReached
                        ? `O limite de ${choiceGroup.choiceCount} escolha(s) já foi atingido.`
                        : feature.description ??
                          "Feature sem descrição cadastrada."
                    }
                    className={[
                      "rounded-2xl border p-4 text-left shadow-[-4px_4px_0_rgba(0,0,0,0.2)] transition",
                      isSelected
                        ? "border-forge-gold bg-forge-gold/10"
                        : "border-zinc-800 bg-black/20 hover:-translate-y-0.5 hover:border-forge-gold/50",
                      isLimitReached
                        ? "cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-zinc-800"
                        : "",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={[
                            "text-base font-black",
                            isSelected
                              ? "text-forge-gold"
                              : "text-zinc-100",
                          ].join(" ")}
                        >
                          {feature.name}
                        </p>

                        <p className="mt-2 text-xs font-bold leading-relaxed text-zinc-400">
                          {feature.description ??
                            "Sem descrição cadastrada."}
                        </p>
                      </div>

                      {isSelected ? (
                        <span className="shrink-0 rounded-full border border-forge-gold bg-forge-gold px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-black">
                          Escolhida
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}