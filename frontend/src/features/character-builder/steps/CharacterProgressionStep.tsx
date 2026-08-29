import type {
  CharacterAttributeKey,
  CharacterBuilderAncestryOption,
  CharacterBuilderBackgroundOption,
  CharacterBuilderClassOption,
  CharacterBuilderDraft,
  CharacterBuilderProgressionChoice,
  CharacterBuilderTalentOption,
} from "@/features/character-builder/types/character-builder-types";

import { isCharacterProgressionChoiceResolved } from "@/features/character-builder/utils/progression-choices";

import {
  doesProgressionAttributeBonusExceedMaximum,
  getCharacterAttributeBreakdown,
  isCharacterAttributeKey,
} from "@/features/character-builder/utils/attributes";

import { validateTalentPrerequisites } from "@/features/character-builder/utils/talent-prerequisites";

type CharacterProgressionStepProps = {
  draft: CharacterBuilderDraft;
  classes: CharacterBuilderClassOption[];
  ancestries: CharacterBuilderAncestryOption[];
  backgrounds: CharacterBuilderBackgroundOption[];
  talents: CharacterBuilderTalentOption[];
  isLoading: boolean;
  error: string | null;
  onChangeProgressionChoices: (
    progressionChoices: CharacterBuilderProgressionChoice[],
  ) => void;
};

const ATTRIBUTE_LABELS: Record<CharacterAttributeKey, string> = {
  strength: "Força",
  dexterity: "Destreza",
  constitution: "Constituição",
  intelligence: "Inteligência",
  wisdom: "Sabedoria",
  charisma: "Carisma",
};

const ATTRIBUTE_KEYS = Object.keys(ATTRIBUTE_LABELS) as CharacterAttributeKey[];

export function CharacterProgressionStep({
  draft,
  classes,
  ancestries,
  backgrounds,
  talents,
  isLoading,
  error,
  onChangeProgressionChoices,
}: CharacterProgressionStepProps) {
  const orderedChoices = [...draft.progressionChoices].sort(
    (firstChoice, secondChoice) => {
      const firstClassEntry = draft.classEntries.find(
        (classEntry) => classEntry.id === firstChoice.classEntryId,
      );

      const secondClassEntry = draft.classEntries.find(
        (classEntry) => classEntry.id === secondChoice.classEntryId,
      );

      const firstOrder = firstClassEntry?.order ?? 0;
      const secondOrder = secondClassEntry?.order ?? 0;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      if (firstChoice.classLevel !== secondChoice.classLevel) {
        return firstChoice.classLevel - secondChoice.classLevel;
      }

      return firstChoice.choiceIndex - secondChoice.choiceIndex;
    },
  );

  const resolvedChoiceCount = orderedChoices.filter((choice) => {
    return isCharacterProgressionChoiceResolved(choice);
  }).length;

  const pendingChoiceCount = orderedChoices.length - resolvedChoiceCount;

  const selectedAncestry = ancestries.find(
    (ancestry) => ancestry.id === draft.ancestryId,
  );

  const selectedBackground = backgrounds.find(
    (background) => background.id === draft.backgroundId,
  );

  function changeChoiceType(
    targetChoice: CharacterBuilderProgressionChoice,
    nextType: CharacterBuilderProgressionChoice["type"],
  ) {
    const nextProgressionChoices = draft.progressionChoices.map(
      (currentChoice) => {
        const isTargetChoice =
          currentChoice.classEntryId === targetChoice.classEntryId &&
          currentChoice.classLevel === targetChoice.classLevel &&
          currentChoice.choiceIndex === targetChoice.choiceIndex;

        if (!isTargetChoice) {
          return currentChoice;
        }

        if (currentChoice.type === nextType) {
          return currentChoice;
        }

        if (nextType === "ATTRIBUTE_INCREASE") {
          return {
            ...currentChoice,
            type: "ATTRIBUTE_INCREASE" as const,
            attributeIncreaseMode: null,
            attributeIncreases: {},
            talentId: null,
          };
        }

        if (nextType === "TALENT") {
          return {
            ...currentChoice,
            type: "TALENT" as const,
            attributeIncreaseMode: null,
            attributeIncreases: {},
            talentId: null,
          };
        }

        return {
          ...currentChoice,
          type: null,
          attributeIncreaseMode: null,
          attributeIncreases: {},
          talentId: null,
        };
      },
    );

    onChangeProgressionChoices(nextProgressionChoices);
  }

  function changeAttributeIncreaseMode(
    targetChoice: CharacterBuilderProgressionChoice,
    nextMode: CharacterBuilderProgressionChoice["attributeIncreaseMode"],
  ) {
    const nextProgressionChoices = draft.progressionChoices.map(
      (currentChoice) => {
        const isTargetChoice =
          currentChoice.classEntryId === targetChoice.classEntryId &&
          currentChoice.classLevel === targetChoice.classLevel &&
          currentChoice.choiceIndex === targetChoice.choiceIndex;

        if (!isTargetChoice) {
          return currentChoice;
        }

        if (
          currentChoice.type === "ATTRIBUTE_INCREASE" &&
          currentChoice.attributeIncreaseMode === nextMode
        ) {
          return currentChoice;
        }

        return {
          ...currentChoice,
          type: "ATTRIBUTE_INCREASE" as const,
          attributeIncreaseMode: nextMode,
          attributeIncreases: {},
          talentId: null,
        };
      },
    );

    onChangeProgressionChoices(nextProgressionChoices);
  }

  function selectAttributeIncrease(
    targetChoice: CharacterBuilderProgressionChoice,
    attributeKey: CharacterAttributeKey,
  ) {
    const targetBonusValue =
      targetChoice.attributeIncreaseMode === "FOCUSED"
        ? 2
        : targetChoice.attributeIncreaseMode === "SPLIT"
          ? 1
          : 0;

    if (
      targetBonusValue > 0 &&
      doesProgressionAttributeBonusExceedMaximum({
        attributeKey,
        bonusValue: targetBonusValue,
        draft,
        talents,
        selectedAncestry,
        selectedBackground,
        excludedProgressionChoice: targetChoice,
      })
    ) {
      return;
    }

    const nextProgressionChoices = draft.progressionChoices.map(
      (currentChoice) => {
        const isTargetChoice =
          currentChoice.classEntryId === targetChoice.classEntryId &&
          currentChoice.classLevel === targetChoice.classLevel &&
          currentChoice.choiceIndex === targetChoice.choiceIndex;

        if (!isTargetChoice || currentChoice.type !== "ATTRIBUTE_INCREASE") {
          return currentChoice;
        }

        if (currentChoice.attributeIncreaseMode === "FOCUSED") {
          return {
            ...currentChoice,
            attributeIncreases: {
              [attributeKey]: 2,
            },
          };
        }

        if (currentChoice.attributeIncreaseMode !== "SPLIT") {
          return currentChoice;
        }

        const isAlreadySelected =
          currentChoice.attributeIncreases[attributeKey] === 1;

        if (isAlreadySelected) {
          const nextAttributeIncreases = {
            ...currentChoice.attributeIncreases,
          };

          delete nextAttributeIncreases[attributeKey];

          return {
            ...currentChoice,
            attributeIncreases: nextAttributeIncreases,
          };
        }

        const selectedAttributeCount = Object.values(
          currentChoice.attributeIncreases,
        ).filter((value) => value === 1).length;

        if (selectedAttributeCount >= 2) {
          return currentChoice;
        }

        return {
          ...currentChoice,
          attributeIncreases: {
            ...currentChoice.attributeIncreases,
            [attributeKey]: 1,
          },
        };
      },
    );

    onChangeProgressionChoices(nextProgressionChoices);
  }

  function selectTalent(
    targetChoice: CharacterBuilderProgressionChoice,
    talentId: string,
  ) {
    const selectedTalent = talents.find((talent) => talent.id === talentId);

    if (!selectedTalent) {
      return;
    }

    const talentExceedsAttributeMaximum = Object.entries(
      selectedTalent.attributeBonuses,
    ).some(([attributeKey, bonusValue]) => {
      if (
        !isCharacterAttributeKey(attributeKey) ||
        typeof bonusValue !== "number"
      ) {
        return false;
      }

      return doesProgressionAttributeBonusExceedMaximum({
        attributeKey,
        bonusValue,
        draft,
        talents,
        selectedAncestry,
        selectedBackground,
        excludedProgressionChoice: targetChoice,
      });
    });

    if (talentExceedsAttributeMaximum) {
      return;
    }

    const prerequisiteValidation = validateTalentPrerequisites({
      talent: selectedTalent,
      talents,
      draft,
      classes,
      ancestries,
      currentChoiceTalentId: targetChoice.talentId,
    });

    if (!prerequisiteValidation.isSelectable) {
      return;
    }

    const isTalentAlreadySelected = draft.progressionChoices.some(
      (currentChoice) => {
        const isSameChoice =
          currentChoice.classEntryId === targetChoice.classEntryId &&
          currentChoice.classLevel === targetChoice.classLevel &&
          currentChoice.choiceIndex === targetChoice.choiceIndex;

        return !isSameChoice && currentChoice.talentId === talentId;
      },
    );

    if (isTalentAlreadySelected && !selectedTalent.isRepeatable) {
      return;
    }

    const nextProgressionChoices = draft.progressionChoices.map(
      (currentChoice) => {
        const isTargetChoice =
          currentChoice.classEntryId === targetChoice.classEntryId &&
          currentChoice.classLevel === targetChoice.classLevel &&
          currentChoice.choiceIndex === targetChoice.choiceIndex;

        if (!isTargetChoice) {
          return currentChoice;
        }

        if (
          currentChoice.type === "TALENT" &&
          currentChoice.talentId === talentId
        ) {
          return currentChoice;
        }

        return {
          ...currentChoice,
          type: "TALENT" as const,
          attributeIncreaseMode: null,
          attributeIncreases: {},
          talentId,
        };
      },
    );

    onChangeProgressionChoices(nextProgressionChoices);
  }

  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando escolhas de progressão.
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

  if (orderedChoices.length === 0) {
    return (
      <div className="mt-5 space-y-5">
        <section className="rounded-2xl border border-forge-gold/25 bg-gradient-to-br from-[#211027] to-black/40 p-5 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-forge-gold/80">
            Progressão
          </p>

          <h3 className="mt-2 text-xl font-black text-zinc-100">
            Nenhuma escolha de progressão disponível
          </h3>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            As classes e níveis atuais deste personagem não concedem escolhas
            entre aumento de atributo e talento.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <section className="rounded-2xl border border-forge-gold/25 bg-gradient-to-br from-[#211027] to-black/40 p-5 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-forge-gold/80">
              Progressão
            </p>

            <h3 className="mt-2 text-xl font-black text-zinc-100">
              Aumentos de atributo e talentos
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              Cada marco concede uma escolha. Escolha aumentar os atributos do
              personagem ou adquirir um talento.
            </p>
          </div>

          <div className="grid min-w-48 grid-cols-2 gap-2">
            <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300/80">
                Resolvidas
              </p>

              <p className="mt-1 text-2xl font-black text-emerald-200">
                {resolvedChoiceCount}
              </p>
            </div>

            <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300/80">
                Pendentes
              </p>

              <p className="mt-1 text-2xl font-black text-amber-200">
                {pendingChoiceCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {orderedChoices.map((choice) => {
          const choiceKey = [
            choice.classEntryId,
            choice.classLevel,
            choice.choiceIndex,
          ].join(":");

          const selectedTalent =
            choice.talentId !== null
              ? talents.find((talent) => talent.id === choice.talentId)
              : undefined;

          const attributeIncreaseEntries = Object.entries(
            choice.attributeIncreases,
          ).filter((entry): entry is [CharacterAttributeKey, number] => {
            const [, value] = entry;

            return (
              typeof value === "number" && Number.isFinite(value) && value !== 0
            );
          });

          const isResolved = isCharacterProgressionChoiceResolved(choice);
          const hasSelectedType = choice.type !== null;

          const selectedSplitAttributeCount = Object.values(
            choice.attributeIncreases,
          ).filter((value) => value === 1).length;

          const orderedTalents = [...talents].sort(
            (firstTalent, secondTalent) => {
              if (firstTalent.order !== secondTalent.order) {
                return firstTalent.order - secondTalent.order;
              }

              return firstTalent.name.localeCompare(secondTalent.name);
            },
          );

          return (
            <article
              key={choiceKey}
              className={[
                "rounded-2xl border p-5 shadow-[-5px_5px_0_rgba(0,0,0,0.24)]",
                isResolved
                  ? "border-emerald-400/25 bg-emerald-500/5"
                  : "border-amber-400/25 bg-amber-500/5",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-forge-gold/75">
                    {choice.className}
                  </p>

                  <h4 className="mt-2 text-lg font-black text-zinc-100">
                    Marco do nível {choice.classLevel}
                  </h4>

                  {choice.choiceIndex > 0 ? (
                    <p className="mt-1 text-xs font-bold text-zinc-500">
                      Escolha {choice.choiceIndex + 1} deste nível
                    </p>
                  ) : null}
                </div>

                <span
                  className={[
                    "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
                    isResolved
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                      : "border-amber-400/30 bg-amber-500/10 text-amber-200",
                  ].join(" ")}
                >
                  {isResolved
                    ? "Resolvida"
                    : hasSelectedType
                      ? "Em configuração"
                      : "Pendente"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    changeChoiceType(choice, "ATTRIBUTE_INCREASE");
                  }}
                  className={[
                    "rounded-xl border p-4 text-left transition",
                    choice.type === "ATTRIBUTE_INCREASE"
                      ? "border-sky-300 bg-sky-500/15 text-sky-100"
                      : "border-zinc-700 bg-black/20 text-zinc-300 hover:border-sky-400/50 hover:bg-sky-500/5",
                  ].join(" ")}
                >
                  <p className="text-sm font-black">Aumento de Atributo</p>

                  <p className="mt-2 text-xs font-semibold leading-5 text-zinc-400">
                    Escolha +2 em um atributo ou +1 em dois atributos
                    diferentes.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    changeChoiceType(choice, "TALENT");
                  }}
                  className={[
                    "rounded-xl border p-4 text-left transition",
                    choice.type === "TALENT"
                      ? "border-violet-300 bg-violet-500/15 text-violet-100"
                      : "border-zinc-700 bg-black/20 text-zinc-300 hover:border-violet-400/50 hover:bg-violet-500/5",
                  ].join(" ")}
                >
                  <p className="text-sm font-black">Talento</p>

                  <p className="mt-2 text-xs font-semibold leading-5 text-zinc-400">
                    Adquira uma capacidade especial, respeitando seus
                    pré-requisitos.
                  </p>
                </button>
              </div>

              {choice.type === null ? (
                <div className="mt-4 rounded-xl border border-dashed border-zinc-700 bg-black/20 p-4">
                  <p className="text-sm font-bold text-zinc-300">
                    Escolha uma opção para continuar
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Aumento de Atributo e Talento utilizam o mesmo marco de
                    progressão.
                  </p>
                </div>
              ) : null}

              {choice.type === "ATTRIBUTE_INCREASE" ? (
                <div className="mt-4 rounded-xl border border-sky-400/20 bg-sky-500/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300/80">
                    Aumento de atributo selecionado
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Escolha como os dois pontos deste marco serão distribuídos.
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        changeAttributeIncreaseMode(choice, "FOCUSED");
                      }}
                      className={[
                        "rounded-xl border p-4 text-left transition",
                        choice.attributeIncreaseMode === "FOCUSED"
                          ? "border-sky-300 bg-sky-500/20 text-sky-100"
                          : "border-zinc-700 bg-black/20 text-zinc-300 hover:border-sky-400/50 hover:bg-sky-500/10",
                      ].join(" ")}
                    >
                      <p className="text-sm font-black">Aumento focado</p>

                      <p className="mt-2 text-xs font-semibold leading-5 text-zinc-400">
                        Conceda +2 em um único atributo.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        changeAttributeIncreaseMode(choice, "SPLIT");
                      }}
                      className={[
                        "rounded-xl border p-4 text-left transition",
                        choice.attributeIncreaseMode === "SPLIT"
                          ? "border-sky-300 bg-sky-500/20 text-sky-100"
                          : "border-zinc-700 bg-black/20 text-zinc-300 hover:border-sky-400/50 hover:bg-sky-500/10",
                      ].join(" ")}
                    >
                      <p className="text-sm font-black">Aumento dividido</p>

                      <p className="mt-2 text-xs font-semibold leading-5 text-zinc-400">
                        Conceda +1 em dois atributos diferentes.
                      </p>
                    </button>
                  </div>

                  {choice.attributeIncreaseMode ? (
                    <div className="mt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300/80">
                          Escolha os atributos
                        </p>

                        <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-sky-100">
                          {choice.attributeIncreaseMode === "FOCUSED"
                            ? attributeIncreaseEntries.length === 1
                              ? "1/1 selecionado"
                              : "0/1 selecionado"
                            : `${selectedSplitAttributeCount}/2 selecionados`}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {ATTRIBUTE_KEYS.map((attributeKey) => {
                          const increaseValue =
                            choice.attributeIncreases[attributeKey] ?? 0;

                          const isSelected = increaseValue > 0;

                          const increaseAmount =
                            choice.attributeIncreaseMode === "FOCUSED" ? 2 : 1;

                          const exceedsAttributeMaximum =
                            doesProgressionAttributeBonusExceedMaximum({
                              attributeKey,
                              bonusValue: increaseAmount,
                              draft,
                              talents,
                              selectedAncestry,
                              selectedBackground,
                              excludedProgressionChoice: choice,
                            });

                          const attributeBreakdownBeforeChoice =
                            getCharacterAttributeBreakdown({
                              attributeKey,
                              draft,
                              talents,
                              selectedAncestry,
                              selectedBackground,
                              excludedProgressionChoice: choice,
                            });

                          const reachedSplitSelectionLimit =
                            choice.attributeIncreaseMode === "SPLIT" &&
                            !isSelected &&
                            selectedSplitAttributeCount >= 2;

                          const isDisabled =
                            reachedSplitSelectionLimit ||
                            (!isSelected && exceedsAttributeMaximum);

                          return (
                            <button
                              key={attributeKey}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                selectAttributeIncrease(choice, attributeKey);
                              }}
                              className={[
                                "rounded-xl border px-3 py-3 text-left transition",
                                isSelected
                                  ? "border-sky-300 bg-sky-500/20 text-sky-100"
                                  : isDisabled
                                    ? "cursor-not-allowed border-zinc-800 bg-zinc-950/30 text-zinc-600 opacity-50"
                                    : "border-zinc-700 bg-black/20 text-zinc-300 hover:border-sky-400/50 hover:bg-sky-500/10",
                              ].join(" ")}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-black">
                                    {ATTRIBUTE_LABELS[attributeKey]}
                                  </p>

                                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                                    Valor antes deste marco:{" "}
                                    {attributeBreakdownBeforeChoice.finalValue ??
                                      "—"}
                                  </p>
                                </div>

                                <span
                                  className={[
                                    "flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-black",
                                    isSelected
                                      ? "border-sky-300/40 bg-sky-300 text-zinc-950"
                                      : "border-zinc-700 bg-zinc-950/70 text-zinc-500",
                                  ].join(" ")}
                                >
                                  {isSelected ? `+${increaseValue}` : "—"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-sky-400/20 bg-black/20 p-4 text-sm text-zinc-500">
                      Escolha aumento focado ou aumento dividido para continuar.
                    </p>
                  )}

                  {attributeIncreaseEntries.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {attributeIncreaseEntries.map(
                        ([attributeKey, increaseValue]) => (
                          <span
                            key={attributeKey}
                            className="rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-100"
                          >
                            {ATTRIBUTE_LABELS[attributeKey]} +{increaseValue}
                          </span>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {choice.type === "TALENT" ? (
                <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300/80">
                        Escolha um talento
                      </p>

                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Talentos concedem capacidades especiais e podem possuir
                        pré-requisitos próprios.
                      </p>
                    </div>

                    {selectedTalent ? (
                      <span className="rounded-full border border-violet-300/30 bg-violet-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-violet-100">
                        {selectedTalent.name}
                      </span>
                    ) : (
                      <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">
                        Pendente
                      </span>
                    )}
                  </div>

                  {orderedTalents.length === 0 ? (
                    <p className="mt-4 rounded-xl border border-dashed border-zinc-700 bg-black/20 p-4 text-sm text-zinc-500">
                      Nenhum talento foi cadastrado para este sistema.
                    </p>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      {orderedTalents.map((talent) => {
                        const isSelected = choice.talentId === talent.id;

                        const isSelectedInAnotherChoice =
                          draft.progressionChoices.some((currentChoice) => {
                            const isSameChoice =
                              currentChoice.classEntryId ===
                                choice.classEntryId &&
                              currentChoice.classLevel === choice.classLevel &&
                              currentChoice.choiceIndex === choice.choiceIndex;

                            return (
                              !isSameChoice &&
                              currentChoice.talentId === talent.id
                            );
                          });

                        const isBlockedByRepeatability =
                          isSelectedInAnotherChoice && !talent.isRepeatable;

                        const prerequisiteValidation =
                          validateTalentPrerequisites({
                            talent,
                            talents,
                            draft,
                            classes,
                            ancestries,
                            currentChoiceTalentId: choice.talentId,
                          });

                        const isBlockedByPrerequisites =
                          !prerequisiteValidation.isSelectable;

                        const isBlockedByAttributeMaximum = Object.entries(
                          talent.attributeBonuses,
                        ).some(([attributeKey, bonusValue]) => {
                          if (
                            !isCharacterAttributeKey(attributeKey) ||
                            typeof bonusValue !== "number"
                          ) {
                            return false;
                          }

                          return doesProgressionAttributeBonusExceedMaximum({
                            attributeKey,
                            bonusValue,
                            draft,
                            talents,
                            selectedAncestry,
                            selectedBackground,
                            excludedProgressionChoice: choice,
                          });
                        });

                        const isDisabled =
                          isBlockedByRepeatability ||
                          isBlockedByPrerequisites ||
                          isBlockedByAttributeMaximum;

                        const attributeBonusEntries = Object.entries(
                          talent.attributeBonuses,
                        ).filter(
                          (entry): entry is [CharacterAttributeKey, number] => {
                            const [, value] = entry;

                            return (
                              typeof value === "number" &&
                              Number.isFinite(value) &&
                              value !== 0
                            );
                          },
                        );

                        return (
                          <button
                            key={talent.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              selectTalent(choice, talent.id);
                            }}
                            className={[
                              "rounded-xl border p-4 text-left transition",
                              isSelected
                                ? "border-violet-300 bg-violet-500/20 text-violet-100"
                                : isDisabled
                                  ? "cursor-not-allowed border-zinc-800 bg-zinc-950/30 text-zinc-600 opacity-55"
                                  : "border-zinc-700 bg-black/20 text-zinc-300 hover:border-violet-400/50 hover:bg-violet-500/10",
                            ].join(" ")}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-black">
                                  {talent.name}
                                </p>

                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                                  {talent.isRepeatable
                                    ? "Talento repetível"
                                    : "Talento não repetível"}
                                </p>
                              </div>

                              <span
                                className={[
                                  "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]",
                                  isSelected
                                    ? "border-violet-300/40 bg-violet-300 text-zinc-950"
                                    : isBlockedByRepeatability
                                      ? "border-zinc-700 bg-zinc-900 text-zinc-500"
                                      : "border-violet-400/25 bg-violet-500/10 text-violet-200",
                                ].join(" ")}
                              >
                                {isSelected
                                  ? "Escolhido"
                                  : isBlockedByRepeatability
                                    ? "Já adquirido"
                                    : isBlockedByPrerequisites
                                      ? "Bloqueado"
                                      : isBlockedByAttributeMaximum
                                        ? "Limite 20"
                                        : prerequisiteValidation.hasUnknownChecks
                                          ? "Verificação parcial"
                                          : "Disponível"}
                              </span>
                            </div>

                            {talent.description ? (
                              <p className="mt-3 text-xs font-semibold leading-5 text-zinc-400">
                                {talent.description}
                              </p>
                            ) : (
                              <p className="mt-3 text-xs font-semibold text-zinc-500">
                                Sem descrição cadastrada.
                              </p>
                            )}

                            {attributeBonusEntries.length > 0 ? (
                              <div className="mt-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300/80">
                                  Bônus de atributo
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {attributeBonusEntries.map(
                                    ([attributeKey, bonusValue]) => (
                                      <span
                                        key={attributeKey}
                                        className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-100"
                                      >
                                        {ATTRIBUTE_LABELS[attributeKey]} +
                                        {bonusValue}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            ) : null}

                            <div className="mt-3 border-t border-white/10 pt-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-300/75">
                                Pré-requisitos
                              </p>

                              {prerequisiteValidation.checks.length === 0 ? (
                                <p className="mt-2 text-xs font-semibold text-emerald-200">
                                  Nenhum pré-requisito.
                                </p>
                              ) : (
                                <div className="mt-2 grid gap-2">
                                  {prerequisiteValidation.checks.map(
                                    (check) => (
                                      <div
                                        key={check.key}
                                        className={[
                                          "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
                                          check.status === "MET"
                                            ? "border-emerald-400/20 bg-emerald-500/10"
                                            : check.status === "UNMET"
                                              ? "border-red-400/20 bg-red-500/10"
                                              : "border-amber-400/20 bg-amber-500/10",
                                        ].join(" ")}
                                      >
                                        <span className="text-xs font-bold text-zinc-300">
                                          {check.label}
                                        </span>

                                        <span
                                          className={[
                                            "text-[9px] font-black uppercase tracking-[0.12em]",
                                            check.status === "MET"
                                              ? "text-emerald-200"
                                              : check.status === "UNMET"
                                                ? "text-red-200"
                                                : "text-amber-200",
                                          ].join(" ")}
                                        >
                                          {check.status === "MET"
                                            ? "Atendido"
                                            : check.status === "UNMET"
                                              ? "Não atendido"
                                              : "Verificação futura"}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
