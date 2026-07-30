"use client";

import type {
  CharacterBuilderDraft,
  CharacterBuilderModalProps,
  CharacterBuilderOptions,
} from "@/features/character-builder/types/character-builder-types";

import { DEFAULT_CHARACTER_ATTRIBUTES } from "@/features/character-builder/constants/character-builder-constants";
import { characterBuilderSteps } from "@/features/character-builder/constants/character-builder-steps";

import { formatAttributeModifier } from "@/features/character-builder/utils/attributes";
import {
  getDefaultGenderFromPronouns,
  getGenderedCharacterOptionName,
  getSelectedOptionLabelByPronouns,
  shouldReplaceGenderAutomatically,
} from "@/features/character-builder/utils/builder-gender";
import { getCharacterBuilderValidationState } from "@/features/character-builder/utils/builder-validation";
import { isCharacterProgressionChoiceResolved } from "@/features/character-builder/utils/progression-choices";
import {
  getStartingEquipmentItemsFromDraft,
  getStartingGoldFromDraft,
} from "@/features/character-builder/utils/equipment";

import { CharacterBuilderOptionCards } from "@/features/character-builder/components/CharacterBuilderOptionCards";
import { CharacterClassLevelDistributionPanel } from "@/features/character-builder/components/CharacterClassLevelDistributionPanel";

import { BuilderSummaryRow } from "@/features/character-builder/summary/BuilderSummaryRow";
import { StartingEquipmentSummaryPanel } from "@/features/character-builder/summary/StartingEquipmentSummaryPanel";
import { CharacterAboutSummaryPanel } from "@/features/character-builder/summary/CharacterAboutSummaryPanel";

import { CharacterConceptStep } from "@/features/character-builder/steps/CharacterConceptStep";
import { CharacterAttributesStep } from "@/features/character-builder/steps/CharacterAttributesStep";
import { CharacterSkillsStep } from "@/features/character-builder/steps/CharacterSkillsStep";
import { CharacterLanguagesStep } from "@/features/character-builder/steps/CharacterLanguagesStep";
import { CharacterSpellsStep } from "@/features/character-builder/steps/CharacterSpellsStep";
import { CharacterFeaturesStep } from "@/features/character-builder/steps/CharacterFeaturesStep";
import { CharacterProgressionStep } from "@/features/character-builder/steps/CharacterProgressionStep";
import { CharacterEquipmentStep } from "@/features/character-builder/steps/CharacterEquipmentStep";
import { CharacterAboutStep } from "@/features/character-builder/steps/CharacterAboutStep";
import { CharacterReviewStep } from "@/features/character-builder/steps/CharacterReviewStep";

export function CharacterBuilderModal({
  isOpen,
  activeStepId,
  draft,
  options,
  isLoadingOptions,
  optionsError,
  savedCharacterSheetId,
  savedCharacterSheetStatus,
  isSavingDraft,
  isFinalizingSheet,
  saveError,
  saveSuccess,
  onSaveDraft,
  onFinalizeSheet,
  onChangeDraft,
  onSelectOption,
  onChangeStep,
  onClose,
}: CharacterBuilderModalProps) {
  if (!isOpen) {
    return null;
  }

  const activeStep =
    characterBuilderSteps.find((step) => step.id === activeStepId) ??
    characterBuilderSteps[0];

  const activeStepIndex = characterBuilderSteps.findIndex(
    (step) => step.id === activeStep.id,
  );

  const previousStep = characterBuilderSteps[activeStepIndex - 1];
  const nextStep = characterBuilderSteps[activeStepIndex + 1];

  function updateDraft<K extends keyof CharacterBuilderDraft>(
    key: K,
    value: CharacterBuilderDraft[K],
  ) {
    const nextDraft: CharacterBuilderDraft = {
      ...draft,
      [key]: value,
    };

    if (key === "pronouns" && typeof value === "string") {
      const nextGender = getDefaultGenderFromPronouns(value);

      if (shouldReplaceGenderAutomatically(draft.gender)) {
        nextDraft.gender = nextGender;
      }
    }

    onChangeDraft(nextDraft);
  }

  const selectedClass = options.classes.find(
    (option) => option.id === draft.classId,
  );

  const selectedAncestry = options.ancestries.find(
    (option) => option.id === draft.ancestryId,
  );

  const selectedBackground = options.backgrounds.find(
    (option) => option.id === draft.backgroundId,
  );

  const selectedClassDisplayName = selectedClass
    ? getGenderedCharacterOptionName({
        key: selectedClass.key,
        name: selectedClass.name,
        pronouns: draft.pronouns,
      })
    : draft.className
      ? getGenderedCharacterOptionName({
          name: draft.className,
          pronouns: draft.pronouns,
        })
      : "";

  const selectedAncestryDisplayName = selectedAncestry
    ? getGenderedCharacterOptionName({
        key: selectedAncestry.key,
        name: selectedAncestry.name,
        pronouns: draft.pronouns,
      })
    : draft.ancestryName
      ? getGenderedCharacterOptionName({
          name: draft.ancestryName,
          pronouns: draft.pronouns,
        })
      : "";

  const selectedBackgroundDisplayName = selectedBackground
    ? getGenderedCharacterOptionName({
        key: selectedBackground.key,
        name: selectedBackground.name,
        pronouns: draft.pronouns,
      })
    : draft.backgroundName
      ? getGenderedCharacterOptionName({
          name: draft.backgroundName,
          pronouns: draft.pronouns,
        })
      : "";

  const genderedSelectedClass = selectedClass
    ? {
        ...selectedClass,
        name: selectedClassDisplayName,
      }
    : undefined;

  const genderedSelectedAncestry = selectedAncestry
    ? {
        ...selectedAncestry,
        name: selectedAncestryDisplayName,
      }
    : undefined;

  const genderedSelectedBackground = selectedBackground
    ? {
        ...selectedBackground,
        name: selectedBackgroundDisplayName,
      }
    : undefined;

  const selectedOptionLabel = getSelectedOptionLabelByPronouns(draft.pronouns);

  const {
    orderedClassEntries,
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

    consolidatedAttributes,
    assignedAttributeValues,
    attributeTotal,
    strongestAttribute,

    getStepValidationMessage,
    canEnterStep,

    finalizationValidationMessage,
    canFinalizeCharacterSheet,
  } = getCharacterBuilderValidationState({
    draft,
    options,
    selectedClass,
    selectedAncestry,
    selectedBackground,
    selectedClassDisplayName,
  });

  const resolvedProgressionChoiceCount = draft.progressionChoices.filter(
    (choice) => isCharacterProgressionChoiceResolved(choice),
  ).length;

  const pendingProgressionChoiceCount =
    draft.progressionChoices.length - resolvedProgressionChoiceCount;

  function syncDraftLevelWithClassEntries(
    nextDraft: CharacterBuilderDraft,
  ): CharacterBuilderDraft {
    if (nextDraft.classEntries.length === 0) {
      return nextDraft;
    }

    return {
      ...nextDraft,
      level: Math.max(
        1,
        Math.min(
          20,
          nextDraft.classEntries.reduce(
            (totalLevel, classEntry) => totalLevel + classEntry.level,
            0,
          ),
        ),
      ),
    };
  }

  function setPrimaryClassEntry(classEntryId: string) {
    if (draft.classEntries.length <= 1) {
      return;
    }

    const currentPrimaryClassEntry = draft.classEntries.find(
      (classEntry) => classEntry.isPrimary,
    );

    if (currentPrimaryClassEntry?.id === classEntryId) {
      return;
    }

    const nextPrimaryClassEntry = draft.classEntries.find(
      (classEntry) => classEntry.id === classEntryId,
    );

    if (!nextPrimaryClassEntry) {
      return;
    }

    const nextClassEntries = draft.classEntries.map((classEntry) => ({
      ...classEntry,
      isPrimary: classEntry.id === classEntryId,
    }));

    onChangeDraft(
      syncDraftLevelWithClassEntries({
        ...draft,
        classId: nextPrimaryClassEntry.classId,
        className: nextPrimaryClassEntry.className,
        classEntries: nextClassEntries,
        spellKeys: [],
      }),
    );
  }

  function setSubclassForClassEntry(classEntryId: string, subclassId: string) {
    const targetClassEntry = draft.classEntries.find(
      (classEntry) => classEntry.id === classEntryId,
    );

    if (!targetClassEntry) {
      return;
    }

    const targetClass = options.classes.find(
      (characterClass) => characterClass.id === targetClassEntry.classId,
    );

    if (!targetClass) {
      return;
    }

    const selectedSubclass =
      targetClass.subclasses.find((subclass) => subclass.id === subclassId) ??
      null;

    const nextClassEntries = draft.classEntries.map((classEntry) => {
      if (classEntry.id !== classEntryId) {
        return classEntry;
      }

      return {
        ...classEntry,
        subclassId: selectedSubclass?.id ?? null,
        subclassName: selectedSubclass?.name ?? null,
      };
    });

    onChangeDraft({
      ...draft,
      classEntries: nextClassEntries,
    });
  }

  function removeClassFromDraft(classEntryId: string) {
    if (draft.classEntries.length <= 1) {
      return;
    }

    const classEntryToRemove = draft.classEntries.find(
      (classEntry) => classEntry.id === classEntryId,
    );

    if (!classEntryToRemove) {
      return;
    }

    const remainingClassEntries = draft.classEntries
      .filter((classEntry) => classEntry.id !== classEntryId)
      .map((classEntry, index) => ({
        ...classEntry,
        order: index,
      }));

    const currentPrimaryWasRemoved = classEntryToRemove.isPrimary;

    const nextPrimaryClassEntry = currentPrimaryWasRemoved
      ? remainingClassEntries[0]
      : (remainingClassEntries.find((classEntry) => classEntry.isPrimary) ??
        remainingClassEntries[0]);

    if (!nextPrimaryClassEntry) {
      return;
    }

    const nextClassEntries = remainingClassEntries.map((classEntry) => ({
      ...classEntry,
      isPrimary: classEntry.id === nextPrimaryClassEntry.id,
    }));

    onChangeDraft(
      syncDraftLevelWithClassEntries({
        ...draft,
        classId: nextPrimaryClassEntry.classId,
        className: nextPrimaryClassEntry.className,
        classEntries: nextClassEntries,
        spellKeys: [],
      }),
    );
  }

  function selectClassForDraft(
    option: CharacterBuilderOptions["classes"][number],
  ) {
    const alreadySelectedClassEntry = draft.classEntries.find(
      (classEntry) => classEntry.classId === option.id,
    );

    if (alreadySelectedClassEntry) {
      removeClassFromDraft(alreadySelectedClassEntry.id);
      return;
    }

    const nextClassLevel = draft.classEntries.length === 0 ? draft.level : 1;

    if (draft.classEntries.length === 0) {
      onChangeDraft(
        syncDraftLevelWithClassEntries({
          ...draft,
          classId: option.id,
          className: option.name,
          classEntries: [
            {
              id: "primary",
              classId: option.id,
              className: option.name,
              subclassId: null,
              subclassName: null,
              level: nextClassLevel,
              isPrimary: true,
              order: 0,
            },
          ],
          spellKeys: [],
        }),
      );

      onSelectOption("class", option);
      return;
    }

    const nextClassEntries = [
      ...draft.classEntries,
      {
        id: `class-${option.id}`,
        classId: option.id,
        className: option.name,
        subclassId: null,
        subclassName: null,
        level: nextClassLevel,
        isPrimary: false,
        order: draft.classEntries.length,
      },
    ];

    onChangeDraft(
      syncDraftLevelWithClassEntries({
        ...draft,
        classEntries: nextClassEntries,
        spellKeys: [],
      }),
    );

    onSelectOption("class", option);
  }

  const currentStepValidationMessage = getStepValidationMessage(activeStep.id);

  const canGoToNextStep = !currentStepValidationMessage;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="flex h-[min(820px,92vh)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-amber-400/30 bg-[#140719] shadow-[-12px_12px_0_rgba(0,0,0,0.5)]">
        <header className="flex items-start justify-between gap-4 border-b border-amber-400/20 bg-black/20 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300/70">
              Forja de Personagem
            </p>

            <h2 className="mt-2 text-2xl font-black text-zinc-100">
              Criar personagem
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">
              Monte a ficha em etapas. Conceito, classe, ancestralidade,
              antecedente e atributos já podem ser salvos no rascunho da ficha.
            </p>

            <div className="mt-3 space-y-2">
              {saveError ? (
                <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-200">
                  {saveError}
                </p>
              ) : null}

              {saveSuccess ? (
                <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-200">
                  {saveSuccess}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSavingDraft || savedCharacterSheetStatus === "READY"}
              className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-sm font-black text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savedCharacterSheetStatus === "READY"
                ? "Ficha finalizada"
                : isSavingDraft
                  ? "Salvando..."
                  : savedCharacterSheetId
                    ? "Atualizar rascunho"
                    : "Salvar rascunho"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-red-400/70 hover:text-red-200"
            >
              Fechar
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr]">
          <aside className="min-h-0 overflow-y-auto border-r border-amber-400/20 bg-black/20 p-4">
            <p className="px-2 text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">
              Etapas
            </p>

            <div className="mt-4 space-y-2">
              {characterBuilderSteps.map((step, index) => {
                const isActive = step.id === activeStep.id;
                const isCompleted = index < activeStepIndex;
                const canEnterThisStep = canEnterStep(step.id);

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={!canEnterThisStep}
                    onClick={() => {
                      if (canEnterThisStep) {
                        onChangeStep(step.id);
                      }
                    }}
                    className={[
                      "w-full rounded-xl border p-3 text-left transition",
                      "shadow-[-4px_4px_0_rgba(0,0,0,0.25)]",
                      !canEnterThisStep
                        ? "cursor-not-allowed border-zinc-900 bg-zinc-950/30 text-zinc-600 opacity-55"
                        : isActive
                          ? "border-amber-300 bg-amber-300/10 text-amber-100"
                          : "border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-amber-400/40 hover:bg-zinc-900/70",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black",
                          isActive
                            ? "bg-amber-300 text-zinc-950"
                            : isCompleted
                              ? "bg-emerald-500 text-zinc-950"
                              : "bg-zinc-800 text-zinc-400",
                        ].join(" ")}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </span>

                      <div>
                        <p className="text-sm font-black">{step.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto p-6">
            <section className="rounded-2xl border border-amber-400/25 bg-zinc-950/50 p-6 shadow-[-8px_8px_0_rgba(0,0,0,0.35)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300/70">
                    Etapa {activeStepIndex + 1} de{" "}
                    {characterBuilderSteps.length}
                  </p>

                  <h3 className="mt-2 text-3xl font-black text-zinc-100">
                    {activeStep.title}
                  </h3>

                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300">
                    {activeStep.description}
                  </p>

                  {currentStepValidationMessage ||
                  (activeStep.id === "review" &&
                    finalizationValidationMessage) ? (
                    <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-100">
                      {currentStepValidationMessage ??
                        finalizationValidationMessage}
                    </p>
                  ) : (
                    <p className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-100">
                      Etapa pronta para avançar.
                    </p>
                  )}
                </div>

                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em]",
                    savedCharacterSheetId
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                      : "border-amber-400/30 bg-amber-300/10 text-amber-200",
                  ].join(" ")}
                >
                  {savedCharacterSheetStatus === "READY"
                    ? "Pronta"
                    : savedCharacterSheetId
                      ? "Salvo"
                      : "Rascunho"}
                </span>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="rounded-2xl border border-zinc-800 bg-black/25 p-5">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-400">
                    Conteúdo da etapa
                  </p>

                  {activeStep.id === "concept" ? (
                    <div className="space-y-4">
                      <CharacterConceptStep
                        draft={draft}
                        onChangeDraftField={updateDraft}
                      />

                      <section
                        className="rounded-2xl border border-zinc-800 bg-black/20 p-4 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]"
                        title="Use para personagens de one-shot ou campanhas que começam acima do nível 1."
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.22em] text-forge-gold">
                              Nível inicial
                            </p>

                            <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-400">
                              Para campanhas comuns, mantenha nível 1. Para
                              one-shots, escolha o nível inicial combinado com o
                              Mestre.
                            </p>
                          </div>

                          <div className="w-28 shrink-0">
                            <label className="block">
                              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                                Nível
                              </span>

                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={draft.level}
                                onChange={(event) => {
                                  const nextLevel = Math.max(
                                    1,
                                    Math.min(
                                      20,
                                      Number(event.target.value) || 1,
                                    ),
                                  );

                                  if (draft.classEntries.length === 0) {
                                    onChangeDraft({
                                      ...draft,
                                      level: nextLevel,
                                    });

                                    return;
                                  }

                                  const nextClassEntries =
                                    draft.classEntries.map((classEntry) =>
                                      classEntry.isPrimary
                                        ? {
                                            ...classEntry,
                                            level: Math.max(
                                              1,
                                              Math.min(
                                                20,
                                                nextLevel -
                                                  draft.classEntries
                                                    .filter(
                                                      (currentClassEntry) =>
                                                        currentClassEntry.id !==
                                                        classEntry.id,
                                                    )
                                                    .reduce(
                                                      (
                                                        totalLevel,
                                                        currentClassEntry,
                                                      ) =>
                                                        totalLevel +
                                                        currentClassEntry.level,
                                                      0,
                                                    ),
                                              ),
                                            ),
                                          }
                                        : classEntry,
                                    );

                                  onChangeDraft(
                                    syncDraftLevelWithClassEntries({
                                      ...draft,
                                      classEntries: nextClassEntries,
                                      spellKeys: [],
                                    }),
                                  );
                                }}
                                className="mt-1.5 h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 text-sm font-black text-zinc-100 outline-none transition focus:border-forge-gold"
                              />
                            </label>
                          </div>
                        </div>
                      </section>
                    </div>
                  ) : activeStep.id === "class" ? (
                    <div className="space-y-4">
                      <CharacterClassLevelDistributionPanel
                        classEntries={draft.classEntries}
                        totalLevel={draft.level}
                        onSetPrimaryClassEntry={setPrimaryClassEntry}
                        onChangeClassEntryLevel={(classEntryId, nextLevel) => {
                          const nextClassEntries = draft.classEntries.map(
                            (classEntry) => {
                              if (classEntry.id !== classEntryId) {
                                return classEntry;
                              }

                              const characterClass = options.classes.find(
                                (currentClass) =>
                                  currentClass.id === classEntry.classId,
                              );

                              const subclassSelectionLevel =
                                characterClass?.subclassSelectionLevel ?? null;

                              const shouldRemoveSubclass =
                                typeof subclassSelectionLevel === "number" &&
                                nextLevel < subclassSelectionLevel;

                              return {
                                ...classEntry,
                                level: nextLevel,
                                subclassId: shouldRemoveSubclass
                                  ? null
                                  : classEntry.subclassId,
                                subclassName: shouldRemoveSubclass
                                  ? null
                                  : classEntry.subclassName,
                              };
                            },
                          );

                          onChangeDraft(
                            syncDraftLevelWithClassEntries({
                              ...draft,
                              classEntries: nextClassEntries,
                              spellKeys: [],
                            }),
                          );
                        }}
                      />

                      {orderedClassEntries.length > 0 ? (
                        <section className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-forge-gold">
                              Subclasses
                            </p>

                            <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-500">
                              Cada classe escolhe sua própria subclasse quando
                              alcança o nível exigido por aquela classe.
                            </p>
                          </div>

                          <div className="mt-4 grid gap-3">
                            {orderedClassEntries.map((classEntry) => {
                              const characterClass = options.classes.find(
                                (currentClass) =>
                                  currentClass.id === classEntry.classId,
                              );

                              if (!characterClass) {
                                return null;
                              }

                              const subclassSelectionLevel =
                                characterClass.subclassSelectionLevel;

                              const hasSubclassSelectionLevel =
                                typeof subclassSelectionLevel === "number";

                              const isSubclassUnlocked =
                                hasSubclassSelectionLevel &&
                                classEntry.level >= subclassSelectionLevel;

                              const hasSubclassOptions =
                                characterClass.subclasses.length > 0;

                              return (
                                <article
                                  key={classEntry.id}
                                  className={[
                                    "rounded-xl border p-3",
                                    isSubclassUnlocked
                                      ? classEntry.subclassId
                                        ? "border-emerald-400/25 bg-emerald-500/10"
                                        : "border-amber-400/25 bg-amber-500/10"
                                      : "border-white/10 bg-black/25",
                                  ].join(" ")}
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-black text-zinc-100">
                                        {classEntry.className}{" "}
                                        {classEntry.level}
                                      </p>

                                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                                        {classEntry.isPrimary
                                          ? "Classe principal"
                                          : "Classe adicional"}
                                      </p>
                                    </div>

                                    {hasSubclassSelectionLevel ? (
                                      <span
                                        className={[
                                          "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]",
                                          isSubclassUnlocked
                                            ? "border-forge-gold/30 bg-forge-gold/10 text-forge-gold"
                                            : "border-white/10 bg-black/25 text-zinc-500",
                                        ].join(" ")}
                                      >
                                        Subclasse no nível{" "}
                                        {subclassSelectionLevel}
                                      </span>
                                    ) : (
                                      <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-500">
                                        Sem nível definido
                                      </span>
                                    )}
                                  </div>

                                  {!hasSubclassSelectionLevel ? (
                                    <p className="mt-3 text-xs font-semibold leading-relaxed text-zinc-500">
                                      Esta classe ainda não possui nível de
                                      escolha de subclasse configurado.
                                    </p>
                                  ) : !isSubclassUnlocked ? (
                                    <p className="mt-3 text-xs font-semibold leading-relaxed text-zinc-500">
                                      A escolha será liberada quando esta classe
                                      alcançar o nível {subclassSelectionLevel}.
                                    </p>
                                  ) : !hasSubclassOptions ? (
                                    <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-100">
                                      A classe alcançou o nível de subclasse,
                                      mas não possui subclasses cadastradas.
                                    </p>
                                  ) : (
                                    <label className="mt-3 block">
                                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                                        Subclasse
                                      </span>

                                      <select
                                        value={classEntry.subclassId ?? ""}
                                        onChange={(event) =>
                                          setSubclassForClassEntry(
                                            classEntry.id,
                                            event.target.value,
                                          )
                                        }
                                        className="mt-2 h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 text-sm font-black text-zinc-100 outline-none transition focus:border-forge-gold"
                                      >
                                        <option value="">
                                          Escolha uma subclasse
                                        </option>

                                        {characterClass.subclasses.map(
                                          (subclass) => (
                                            <option
                                              key={subclass.id}
                                              value={subclass.id}
                                            >
                                              {subclass.name}
                                            </option>
                                          ),
                                        )}
                                      </select>

                                      {classEntry.subclassId ? (
                                        <p className="mt-2 text-xs font-semibold text-emerald-200">
                                          Subclasse escolhida:{" "}
                                          {classEntry.subclassName}
                                        </p>
                                      ) : (
                                        <p className="mt-2 text-xs font-semibold text-amber-100">
                                          Esta escolha está pendente.
                                        </p>
                                      )}
                                    </label>
                                  )}
                                </article>
                              );
                            })}
                          </div>
                        </section>
                      ) : null}

                      <CharacterBuilderOptionCards
                        title="Classes disponíveis"
                        description="Escolha a função principal do personagem na aventura."
                        options={options.classes}
                        isLoading={isLoadingOptions}
                        error={optionsError}
                        emptyMessage="Nenhuma classe encontrada para este sistema."
                        selectedId=""
                        selectedIds={draft.classEntries.map(
                          (classEntry) => classEntry.classId,
                        )}
                        selectedLabel={selectedOptionLabel}
                        getOptionSelectionKind={(option) => {
                          const classEntry = draft.classEntries.find(
                            (currentClassEntry) =>
                              currentClassEntry.classId === option.id,
                          );

                          if (!classEntry) {
                            return null;
                          }

                          return classEntry.isPrimary
                            ? "primary"
                            : "additional";
                        }}
                        getSelectedLabel={(option) => {
                          const classEntry = draft.classEntries.find(
                            (currentClassEntry) =>
                              currentClassEntry.classId === option.id,
                          );

                          if (!classEntry) {
                            return selectedOptionLabel;
                          }

                          return classEntry.isPrimary
                            ? "Principal"
                            : "Adicionada";
                        }}
                        getOptionName={(option) =>
                          getGenderedCharacterOptionName({
                            key: option.key,
                            name: option.name,
                            pronouns: draft.pronouns,
                          })
                        }
                        getOptionTitle={(option) => {
                          const hitDieText = option.hitDie
                            ? `Dado de vida: d${option.hitDie}.`
                            : "Dado de vida: em breve.";
                          const optionName = getGenderedCharacterOptionName({
                            key: option.key,
                            name: option.name,
                            pronouns: draft.pronouns,
                          });

                          return `${optionName}: ${
                            option.description ?? "Sem descrição cadastrada."
                          } ${hitDieText} Stats importantes: em breve. Features da classe: em breve.`;
                        }}
                        onSelect={(option) => {
                          selectClassForDraft(option);
                        }}
                      />
                    </div>
                  ) : activeStep.id === "ancestry" ? (
                    <CharacterBuilderOptionCards
                      title="Ancestralidades disponíveis"
                      description="Escolha a origem biológica, cultural ou mutada do personagem."
                      options={options.ancestries}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      emptyMessage="Nenhuma ancestralidade encontrada para este sistema."
                      selectedId={draft.ancestryId}
                      selectedLabel={selectedOptionLabel}
                      getOptionName={(option) =>
                        getGenderedCharacterOptionName({
                          key: option.key,
                          name: option.name,
                          pronouns: draft.pronouns,
                        })
                      }
                      getOptionTitle={(option) => {
                        const sizeText = option.defaultSizeCategory
                          ? `Tamanho padrão: ${option.defaultSizeCategory}.`
                          : "Tamanho padrão: em breve.";
                        const optionName = getGenderedCharacterOptionName({
                          key: option.key,
                          name: option.name,
                          pronouns: draft.pronouns,
                        });

                        return `${optionName}: ${
                          option.description ?? "Sem descrição cadastrada."
                        } ${sizeText} Features da ancestralidade: em breve.`;
                      }}
                      onSelect={(option) => {
                        updateDraft("ancestryId", option.id);
                        updateDraft("ancestryName", option.name);
                        onSelectOption("ancestry", option);
                      }}
                    />
                  ) : activeStep.id === "background" ? (
                    <CharacterBuilderOptionCards
                      title="Antecedentes disponíveis"
                      description="Escolha de onde o personagem veio antes da aventura começar."
                      options={options.backgrounds}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      emptyMessage="Nenhum antecedente encontrado para este sistema."
                      selectedId={draft.backgroundId}
                      selectedLabel={selectedOptionLabel}
                      getOptionName={(option) =>
                        getGenderedCharacterOptionName({
                          key: option.key,
                          name: option.name,
                          pronouns: draft.pronouns,
                        })
                      }
                      getOptionTitle={(option) => {
                        const suggestedSkillNames =
                          option.skillKeys
                            ?.map((skillKey) => {
                              const skill = options.skills.find(
                                (currentSkill) => currentSkill.key === skillKey,
                              );

                              return skill?.name ?? skillKey;
                            })
                            .join(", ") || "nenhuma perícia sugerida";
                        const optionName = getGenderedCharacterOptionName({
                          key: option.key,
                          name: option.name,
                          pronouns: draft.pronouns,
                        });

                        return `${optionName}: ${
                          option.description ?? "Sem descrição cadastrada."
                        } Perícias sugeridas: ${suggestedSkillNames}. Features do antecedente: em breve.`;
                      }}
                      onSelect={(option) => {
                        updateDraft("backgroundId", option.id);
                        updateDraft("backgroundName", option.name);
                        onSelectOption("background", option);
                      }}
                    />
                  ) : activeStep.id === "attributes" ? (
                    <CharacterAttributesStep
                      attributes={draft.attributes}
                      onChangeAttribute={(attributeKey, value) => {
                        updateDraft("attributes", {
                          ...draft.attributes,
                          [attributeKey]: value,
                        });
                      }}
                      onResetAttributes={() => {
                        updateDraft("attributes", DEFAULT_CHARACTER_ATTRIBUTES);
                      }}
                    />
                  ) : activeStep.id === "skills" ? (
                    <CharacterSkillsStep
                      skills={options.skills}
                      selectedBackground={genderedSelectedBackground}
                      attributes={draft.attributes}
                      selectedSkillKeys={draft.skillKeys}
                      requiredSkillChoiceCount={requiredSkillChoiceCount}
                      characterLevel={draft.level}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      onToggleSkill={(skillKey) => {
                        const isSelected = draft.skillKeys.includes(skillKey);

                        if (
                          !isSelected &&
                          draft.skillKeys.length >= requiredSkillChoiceCount
                        ) {
                          return;
                        }

                        updateDraft(
                          "skillKeys",
                          isSelected
                            ? draft.skillKeys.filter((currentSkillKey) => {
                                return currentSkillKey !== skillKey;
                              })
                            : [...draft.skillKeys, skillKey],
                        );
                      }}
                    />
                  ) : activeStep.id === "languages" ? (
                    <CharacterLanguagesStep
                      languages={options.languages}
                      selectedLanguageKeys={draft.languageKeys}
                      automaticLanguageKeys={automaticLanguageKeys}
                      requiredLanguageChoiceCount={requiredLanguageChoiceCount}
                      selectedAncestry={genderedSelectedAncestry}
                      selectedBackground={genderedSelectedBackground}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      onToggleLanguage={(languageKey) => {
                        const isSelected =
                          draft.languageKeys.includes(languageKey);

                        if (
                          !isSelected &&
                          draft.languageKeys.length >=
                            requiredLanguageChoiceCount
                        ) {
                          return;
                        }

                        updateDraft(
                          "languageKeys",
                          isSelected
                            ? draft.languageKeys.filter(
                                (currentLanguageKey) => {
                                  return currentLanguageKey !== languageKey;
                                },
                              )
                            : [...draft.languageKeys, languageKey],
                        );
                      }}
                    />
                  ) : activeStep.id === "spells" ? (
                    <CharacterSpellsStep
                      spells={options.spells}
                      classes={options.classes}
                      classEntries={draft.classEntries}
                      selectedClass={genderedSelectedClass}
                      selectedSpellKeys={draft.spellKeys}
                      characterLevel={draft.level}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      onToggleSpell={(spellKey) => {
                        const isSelected = draft.spellKeys.includes(spellKey);

                        updateDraft(
                          "spellKeys",
                          isSelected
                            ? draft.spellKeys.filter((currentSpellKey) => {
                                return currentSpellKey !== spellKey;
                              })
                            : [...draft.spellKeys, spellKey],
                        );
                      }}
                    />
                  ) : activeStep.id === "features" ? (
                    <CharacterFeaturesStep
                      featureChoiceGroups={options.featureChoiceGroups}
                      classes={options.classes}
                      classEntries={draft.classEntries}
                      selectedClass={genderedSelectedClass}
                      selectedAncestry={genderedSelectedAncestry}
                      selectedBackground={genderedSelectedBackground}
                      characterLevel={draft.level}
                      selections={draft.featureChoiceSelections}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      onChangeSelections={(featureChoiceSelections) => {
                        updateDraft(
                          "featureChoiceSelections",
                          featureChoiceSelections,
                        );
                      }}
                    />
                  ) : activeStep.id === "progression" ? (
                    <CharacterProgressionStep
                      draft={draft}
                      classes={options.classes}
                      ancestries={options.ancestries}
                      backgrounds={options.backgrounds}
                      talents={options.talents}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      onChangeProgressionChoices={(progressionChoices) => {
                        updateDraft("progressionChoices", progressionChoices);
                      }}
                    />
                  ) : activeStep.id === "equipment" ? (
                    <CharacterEquipmentStep
                      equipment={options.equipment}
                      selectedClass={genderedSelectedClass}
                      selectedBackground={genderedSelectedBackground}
                      draft={draft}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      onChangeEquipmentMode={(key, value) => {
                        updateDraft(key, value);
                      }}
                    />
                  ) : activeStep.id === "about" ? (
                    <CharacterAboutStep
                      draft={draft}
                      onChangeDraftField={updateDraft}
                    />
                  ) : activeStep.id === "review" ? (
                    <CharacterReviewStep
                      draft={draft}
                      options={options}
                      selectedClass={genderedSelectedClass}
                      selectedAncestry={genderedSelectedAncestry}
                      selectedBackground={genderedSelectedBackground}
                    />
                  ) : (
                    <div className="mt-5 rounded-xl border border-dashed border-amber-400/25 bg-[#1f0d27]/60 p-8 text-center">
                      <p className="text-lg font-black text-zinc-100">
                        {activeStep.title} será construído aqui
                      </p>

                      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
                        Esta etapa ainda está em modo visual. Nos próximos
                        micros vamos trocar este espaço por campos reais, cards,
                        listas e seleções conectadas ao sistema.
                      </p>
                    </div>
                  )}
                </div>

                <aside className="rounded-2xl border border-zinc-800 bg-black/25 p-5">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-400">
                    Resumo da ficha
                  </p>

                  <div className="mt-5 space-y-3 text-sm">
                    <BuilderSummaryRow
                      label="Classes"
                      value={classEntriesSummary}
                    />

                    <div
                      className={[
                        "rounded-xl border p-3",
                        orderedClassEntries.length > 0 &&
                        classEntriesTotalLevel === draft.level
                          ? "border-emerald-400/30 bg-emerald-500/10"
                          : "border-amber-400/30 bg-amber-500/10",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                            Distribuição de níveis
                          </p>

                          <p className="mt-1 text-xs font-bold leading-relaxed text-zinc-400">
                            {classLevelDistributionStatus}
                          </p>
                        </div>

                        <span
                          className={[
                            "rounded-lg border px-2 py-1 text-xs font-black",
                            orderedClassEntries.length > 0 &&
                            classEntriesTotalLevel === draft.level
                              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                              : "border-amber-400/30 bg-amber-500/15 text-amber-100",
                          ].join(" ")}
                        >
                          {classEntriesTotalLevel}/{draft.level}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {orderedClassEntries.length > 0 ? (
                          orderedClassEntries.map((classEntry) => (
                            <div
                              key={classEntry.id}
                              className="rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="break-words text-xs font-black text-zinc-100">
                                    {classEntry.className}
                                  </p>

                                  <span
                                    className={[
                                      "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em]",
                                      classEntry.isPrimary
                                        ? "border-forge-gold/40 bg-forge-gold/15 text-forge-gold"
                                        : "border-white/10 bg-black/20 text-zinc-500",
                                    ].join(" ")}
                                  >
                                    {classEntry.isPrimary
                                      ? "Classe principal"
                                      : "Classe adicional"}
                                  </span>
                                </div>

                                <span className="shrink-0 text-xs font-black text-forge-gold">
                                  Nível {classEntry.level}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="rounded-lg border border-dashed border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-zinc-500">
                            Escolha uma classe para iniciar a distribuição.
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled
                        className="mt-4 w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600"
                        title="Use os cards abaixo para adicionar outra classe ao personagem."
                      >
                        + Use os cards abaixo para adicionar classe
                      </button>
                    </div>

                    <BuilderSummaryRow
                      label="Estrutura de classe"
                      value={
                        orderedClassEntries.length > 1
                          ? `${orderedClassEntries.length} classes`
                          : orderedClassEntries.length === 1
                            ? "Classe única"
                            : "Não definida"
                      }
                    />

                    <BuilderSummaryRow
                      label="Classe principal"
                      value={primaryClassEntry?.className ?? "—"}
                    />

                    <BuilderSummaryRow
                      label="Nível da classe principal"
                      value={
                        primaryClassEntry
                          ? String(primaryClassEntry.level)
                          : "—"
                      }
                    />

                    <BuilderSummaryRow
                      label="Classe"
                      value={selectedClassDisplayName || "Não definida"}
                    />

                    <BuilderSummaryRow
                      label="Ancestralidade"
                      value={selectedAncestryDisplayName || "Não definida"}
                    />

                    <BuilderSummaryRow
                      label="Antecedente"
                      value={selectedBackgroundDisplayName || "Não definido"}
                    />

                    <BuilderSummaryRow
                      label="Atributos"
                      value={
                        assignedAttributeValues.length > 0
                          ? `Total ${attributeTotal}`
                          : "Não distribuídos"
                      }
                    />

                    <BuilderSummaryRow
                      label="Maior atributo"
                      value={
                        strongestAttribute
                          ? `${strongestAttribute.shortName} ${
                              consolidatedAttributes[strongestAttribute.key]
                            } (${formatAttributeModifier(
                              consolidatedAttributes[strongestAttribute.key],
                            )})`
                          : "Não definido"
                      }
                    />

                    <BuilderSummaryRow
                      label="Perícias"
                      value={`${selectedSkillCount}/${requiredSkillChoiceCount} escolhidas`}
                    />

                    <BuilderSummaryRow
                      label="Idiomas"
                      value={`${automaticLanguageKeys.length + selectedLanguageChoiceCount} total (${selectedLanguageChoiceCount}/${requiredLanguageChoiceCount} escolhas)`}
                    />

                    <BuilderSummaryRow
                      label="Magias"
                      value={`${selectedSpellCount} escolhidas`}
                    />

                    <BuilderSummaryRow
                      label="Truques/Magias"
                      value={`${selectedCantripCount}/${selectedLeveledSpellCount}`}
                    />

                    <BuilderSummaryRow
                      label="Progressão"
                      value={
                        draft.progressionChoices.length === 0
                          ? "Nenhum marco"
                          : `${resolvedProgressionChoiceCount} resolvidas · ${pendingProgressionChoiceCount} pendentes`
                      }
                    />

                    <BuilderSummaryRow
                      label="Equipamentos"
                      value={`${
                        getStartingEquipmentItemsFromDraft(draft, options)
                          .length
                      } tipos`}
                    />

                    <BuilderSummaryRow
                      label="Moedas iniciais"
                      value={`${getStartingGoldFromDraft(draft, options)} moedas`}
                    />

                    {activeStep.id === "equipment" ? (
                      <StartingEquipmentSummaryPanel
                        draft={draft}
                        options={options}
                      />
                    ) : null}

                    {activeStep.id === "about" ? (
                      <CharacterAboutSummaryPanel draft={draft} />
                    ) : null}

                    <BuilderSummaryRow
                      label="Nível"
                      value={String(draft.level)}
                    />

                    <BuilderSummaryRow
                      label="Status"
                      value={
                        savedCharacterSheetStatus === "READY"
                          ? "Pronta"
                          : savedCharacterSheetId
                            ? "Salvo"
                            : "Rascunho"
                      }
                    />

                    {savedCharacterSheetId ? (
                      <BuilderSummaryRow
                        label="Ficha"
                        value="Criada no banco"
                      />
                    ) : null}
                  </div>
                </aside>
              </div>
            </section>
          </main>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-amber-400/20 bg-black/30 px-6 py-4">
          <button
            type="button"
            disabled={!previousStep}
            onClick={() => {
              if (previousStep) {
                onChangeStep(previousStep.id);
              }
            }}
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-2 text-sm font-black text-zinc-300 transition hover:border-amber-400/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Anterior
          </button>

          <div className="hidden items-center gap-2 md:flex">
            {characterBuilderSteps.map((step, index) => {
              const canEnterThisStep = canEnterStep(step.id);

              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!canEnterThisStep}
                  onClick={() => {
                    if (canEnterThisStep) {
                      onChangeStep(step.id);
                    }
                  }}
                  className={[
                    "h-3 w-8 rounded-full transition",
                    !canEnterThisStep
                      ? "cursor-not-allowed bg-zinc-800 opacity-40"
                      : step.id === activeStep.id
                        ? "bg-amber-300"
                        : index < activeStepIndex
                          ? "bg-emerald-500"
                          : "bg-zinc-700 hover:bg-zinc-600",
                  ].join(" ")}
                  aria-label={`Ir para etapa ${step.title}`}
                />
              );
            })}
          </div>

          <button
            type="button"
            disabled={
              nextStep
                ? !canGoToNextStep
                : !canFinalizeCharacterSheet ||
                  isFinalizingSheet ||
                  savedCharacterSheetStatus === "READY"
            }
            onClick={() => {
              if (nextStep && canGoToNextStep) {
                onChangeStep(nextStep.id);
                return;
              }

              if (!nextStep && canFinalizeCharacterSheet) {
                onFinalizeSheet();
              }
            }}
            className="rounded-xl border border-amber-400/40 bg-amber-300 px-4 py-2 text-sm font-black text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {nextStep
              ? "Próxima →"
              : savedCharacterSheetStatus === "READY"
                ? "Ficha pronta"
                : isFinalizingSheet
                  ? "Finalizando..."
                  : "Finalizar ficha"}
          </button>
        </footer>
      </div>
    </div>
  );
}
