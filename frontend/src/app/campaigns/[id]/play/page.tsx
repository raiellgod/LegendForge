"use client";

import { FormEvent, PointerEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import type {
  CharacterBuilderDraft,
  CharacterBuilderModalProps,
  CharacterBuilderOptions,
  CharacterBuilderSelectableOption,
  CharacterReadySheet,
  CharacterSheetStatus,
} from "@/features/character-builder/types/character-builder-types";

import {
  CHARACTER_ATTRIBUTE_DEFINITIONS,
  DEFAULT_CHARACTER_ATTRIBUTES,
  STANDARD_ARRAY_ATTRIBUTE_VALUES,
} from "@/features/character-builder/constants/character-builder-constants";

import { characterBuilderSteps } from "@/features/character-builder/constants/character-builder-steps";

import {
  formatAttributeModifier,
  getPersistableCharacterAttributes,
} from "@/features/character-builder/utils/attributes";

import { isCantrip } from "@/features/character-builder/utils/spells";
import { getInitiativeBonus } from "@/features/character-builder/utils/character-sheet-calculations";

import {
  getStartingEquipmentItemsFromDraft,
  getStartingGoldFromDraft,
} from "@/features/character-builder/utils/equipment";

import { CharacterBuilderInfoIcon } from "@/features/character-builder/components/CharacterBuilderInfoIcon";
import { BuilderSummaryRow } from "@/features/character-builder/summary/BuilderSummaryRow";
import { StartingEquipmentSummaryPanel } from "@/features/character-builder/summary/StartingEquipmentSummaryPanel";
import { CharacterAboutSummaryPanel } from "@/features/character-builder/summary/CharacterAboutSummaryPanel";
import { CharacterConceptStep } from "@/features/character-builder/steps/CharacterConceptStep";
import { CharacterAttributesStep } from "@/features/character-builder/steps/CharacterAttributesStep";
import { CharacterSkillsStep } from "@/features/character-builder/steps/CharacterSkillsStep";
import { CharacterSpellsStep } from "@/features/character-builder/steps/CharacterSpellsStep";
import { CharacterEquipmentStep } from "@/features/character-builder/steps/CharacterEquipmentStep";
import { CharacterAboutStep } from "@/features/character-builder/steps/CharacterAboutStep";
import { CharacterReviewStep } from "@/features/character-builder/steps/CharacterReviewStep";

import type {
  Campaign,
  CampaignActor,
  CampaignParticipant,
  ChatMessage,
  ChatMode,
  DiceTerm,
  RightPanelTab,
  RollResult,
  RollVisibility,
  SceneToken,
  ToolMode,
  User,
} from "@/features/game-table/types/game-table-types";

import {
  getDisplayName,
  getInitials,
  getParticipantDisplayName,
} from "@/features/game-table/utils/user-utils";

import {
  getCharacterTypeLabel,
  getCharacterTypeStyles,
  getVisibleActorsForUser,
} from "@/features/game-table/utils/actor-utils";

import {
  DICE_OPTIONS,
  QUICK_ROLLS,
} from "@/features/game-table/constants/dice-constants";

import {
  buildExpressionFromTerms,
  createId,
  rollDiceExpression,
} from "@/features/game-table/utils/dice-utils";

import {
  createCampaignActor,
  createSceneToken,
  deleteSceneToken,
  getCampaign,
  getCampaignActors,
  getCampaignCharacterSheets,
  getCampaignParticipants,
  getCampaignTokens,
  updateCampaignActor,
  updateCampaignCharacterSheetImages,
  updateSceneToken,
} from "@/features/game-table/services/game-table-api";

import {
  getRightTabs,
  getToolbarItems,
} from "@/features/game-table/constants/table-ui-constants";

import { TableLeftToolbar } from "@/features/game-table/components/TableLeftToolbar";
import { TableRightPanel } from "@/features/game-table/components/TableRightPanel";
import { TableChatPanel } from "@/features/game-table/components/TableChatPanel";
import { TableRollsPanel } from "@/features/game-table/components/TableRollsPanel";
import { TableCharactersPanel } from "@/features/game-table/components/TableCharactersPanel";
import { TableJournalPanel } from "@/features/game-table/components/TableJournalPanel";
import { TableSettingsPanel } from "@/features/game-table/components/TableSettingsPanel";
import { TableSceneCanvas } from "@/features/game-table/components/TableSceneCanvas";

import {
  createEmptySimpleActorCreationDraft,
  NpcCreationModal,
  type SimpleActorCreationDraft,
} from "@/features/game-table/components/NpcCreationModal";

import { CreatureCreationModal } from "@/features/game-table/components/CreatureCreationModal";
import { CharacterCreationMenuModal } from "@/features/game-table/components/CharacterCreationMenuModal";
import { ActorLibraryModal } from "@/features/game-table/components/ActorLibraryModal";
import { ActorActionModal } from "@/features/game-table/components/ActorActionModal";
import {
  CharacterReadySheetModal,
  type CharacterReadySheetRollRequest,
} from "@/features/character-builder/components/CharacterReadySheetModal";

const TOKEN_GRID_SIZE_IN_PIXELS = 40;

const TOKEN_SIZE_OPTIONS = [
  {
    id: "small-medium",
    label: "Pequeno / Médio",
    description: "Ocupa 1 quadrado. Ideal para personagens comuns.",
    gridSize: 1,
  },
  {
    id: "large",
    label: "Grande",
    description: "Ocupa 2x2 quadrados.",
    gridSize: 2,
  },
  {
    id: "huge",
    label: "Enorme",
    description: "Ocupa 3x3 quadrados.",
    gridSize: 3,
  },
  {
    id: "gargantuan",
    label: "Colossal",
    description: "Ocupa 4x4 quadrados.",
    gridSize: 4,
  },
] as const;

function getTokenSizeInPixels(gridSize: number) {
  return gridSize * TOKEN_GRID_SIZE_IN_PIXELS;
}

function isLibraryCompatibleActor(actor: CampaignActor) {
  return actor.type === "NPC" || actor.type === "CREATURE";
}

function createEmptyCharacterBuilderDraft(): CharacterBuilderDraft {
  return {
    name: "",
    pronouns: "",
    concept: "",
    portraitUrl: "",
    tokenImageUrl: "",
    tokenImageFit: "FILL",

    classId: "",
    className: "",

    ancestryId: "",
    ancestryName: "",

    backgroundId: "",
    backgroundName: "",

    attributes: { ...DEFAULT_CHARACTER_ATTRIBUTES },
    skillKeys: [],
    spellKeys: [],
    equipmentItems: [],
    classEquipmentMode: "PACKAGE",
    backgroundEquipmentMode: "PACKAGE",
    startingGold: 0,

    alignment: "",
    faith: "",
    lifestyle: "",

    hair: "",
    skin: "",
    eyes: "",
    height: "",
    weight: "",
    age: "",
    gender: "",

    bonds: "",
    flaws: "",
    ideals: "",
    personality: "",
    backstory: "",
    notes: "",
    gmNotes: "",
  };
}

type CharacterBuilderGrammaticalGender = "masculine" | "feminine" | "neutral";

type GenderedCharacterOptionName = {
  masculine: string;
  feminine: string;
  neutral: string;
};

function normalizeCharacterOptionName(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const GENDERED_CHARACTER_OPTION_NAMES_BY_KEY: Record<
  string,
  GenderedCharacterOptionName
> = {
  // Classes
  barbarian: {
    masculine: "Bárbaro",
    feminine: "Bárbara",
    neutral: "Bárbare",
  },
  bard: {
    masculine: "Bardo",
    feminine: "Barda",
    neutral: "Barde",
  },
  warlock: {
    masculine: "Bruxo",
    feminine: "Bruxa",
    neutral: "Bruxe",
  },
  devotee: {
    masculine: "Devoto",
    feminine: "Devota",
    neutral: "Devote",
  },
  druid: {
    masculine: "Druida",
    feminine: "Druida",
    neutral: "Druide",
  },
  sorcerer: {
    masculine: "Feiticeiro",
    feminine: "Feiticeira",
    neutral: "Feiticeire",
  },
  fighter: {
    masculine: "Guerreiro",
    feminine: "Guerreira",
    neutral: "Guerreire",
  },
  rogue: {
    masculine: "Ladino",
    feminine: "Ladina",
    neutral: "Ladine",
  },
  wizard: {
    masculine: "Mago",
    feminine: "Maga",
    neutral: "Mague",
  },
  monk: {
    masculine: "Monge",
    feminine: "Monja",
    neutral: "Monje",
  },
  oathbound: {
    masculine: "Juramentado",
    feminine: "Juramentada",
    neutral: "Juramentade",
  },
  ranger: {
    masculine: "Patrulheiro",
    feminine: "Patrulheira",
    neutral: "Patrulheire",
  },
  technomancer: {
    masculine: "Tecnomante",
    feminine: "Tecnomante",
    neutral: "Tecnomante",
  },
  necromancer: {
    masculine: "Necromante",
    feminine: "Necromante",
    neutral: "Necromante",
  },

  // Ancestralidades: nomes de povos/linhagens do sistema, mantidos como nomes próprios.
  humanis: {
    masculine: "Humanis",
    feminine: "Humanis",
    neutral: "Humanis",
  },
  sylvaris: {
    masculine: "Sylvaris",
    feminine: "Sylvaris",
    neutral: "Sylvaris",
  },
  durandir: {
    masculine: "Durandir",
    feminine: "Durandir",
    neutral: "Durandir",
  },
  brutakar: {
    masculine: "Brutakar",
    feminine: "Brutakar",
    neutral: "Brutakar",
  },
  faunari: {
    masculine: "Faunari",
    feminine: "Faunari",
    neutral: "Faunari",
  },
  sinteticos: {
    masculine: "Sintéticos",
    feminine: "Sintéticos",
    neutral: "Sintéticos",
  },
  minuri: {
    masculine: "Minuri",
    feminine: "Minuri",
    neutral: "Minuri",
  },

  // Antecedentes
  "veil-devotee": {
    masculine: "Devoto do Véu",
    feminine: "Devota do Véu",
    neutral: "Devote do Véu",
  },
  "omen-marked": {
    masculine: "Marcado pelo Agouro",
    feminine: "Marcada pelo Agouro",
    neutral: "Marcade pelo Agouro",
  },
  "guild-artisan": {
    masculine: "Artesão de Guilda",
    feminine: "Artesã de Guilda",
    neutral: "Artesane de Guilda",
  },
  "wandering-minstrel": {
    masculine: "Menestrel Errante",
    feminine: "Menestrel Errante",
    neutral: "Menestrel Errante",
  },
  "court-fraud": {
    masculine: "Farsante de Corte",
    feminine: "Farsante de Corte",
    neutral: "Farsante de Corte",
  },
  "alley-blade": {
    masculine: "Lâmina de Beco",
    feminine: "Lâmina de Beco",
    neutral: "Lâmina de Beco",
  },
  "wilds-recluse": {
    masculine: "Recluso dos Ermos",
    feminine: "Reclusa dos Ermos",
    neutral: "Recluse dos Ermos",
  },
  "frontier-walker": {
    masculine: "Andarilho das Fronteiras",
    feminine: "Andarilha das Fronteiras",
    neutral: "Andarilhe das Fronteiras",
  },
  "village-champion": {
    masculine: "Campeão da Aldeia",
    feminine: "Campeã da Aldeia",
    neutral: "Campeane da Aldeia",
  },
  "black-tide-navigator": {
    masculine: "Navegante de Marés Negras",
    feminine: "Navegante de Marés Negras",
    neutral: "Navegante de Marés Negras",
  },
  "crest-blood": {
    masculine: "Sangue de Brasão",
    feminine: "Sangue de Brasão",
    neutral: "Sangue de Brasão",
  },
  "gutter-child": {
    masculine: "Filho da Sarjeta",
    feminine: "Filha da Sarjeta",
    neutral: "Filhe da Sarjeta",
  },
  "arcane-archivist": {
    masculine: "Arquivista Arcano",
    feminine: "Arquivista Arcana",
    neutral: "Arquivista Arcane",
  },
  "ash-veteran-background": {
    masculine: "Veterano da Cinza",
    feminine: "Veterana da Cinza",
    neutral: "Veterane da Cinza",
  },
  "distant-lands-pilgrim": {
    masculine: "Peregrino de Terras Distantes",
    feminine: "Peregrina de Terras Distantes",
    neutral: "Peregrine de Terras Distantes",
  },
  "relic-hunter": {
    masculine: "Caçador de Relíquias",
    feminine: "Caçadora de Relíquias",
    neutral: "Caçadore de Relíquias",
  },
  "collapse-survivor": {
    masculine: "Sobrevivente do Colapso",
    feminine: "Sobrevivente do Colapso",
    neutral: "Sobrevivente do Colapso",
  },
  "masterless-squire": {
    masculine: "Escudeiro Sem Senhor",
    feminine: "Escudeira Sem Senhor",
    neutral: "Escudeire Sem Senhor",
  },
};

const GENDERED_CHARACTER_OPTION_NAMES_BY_NORMALIZED_NAME = Object.fromEntries(
  Object.values(GENDERED_CHARACTER_OPTION_NAMES_BY_KEY).flatMap(
    (genderedName) =>
      [genderedName.masculine, genderedName.feminine, genderedName.neutral].map(
        (name) => [normalizeCharacterOptionName(name), genderedName],
      ),
  ),
) as Record<string, GenderedCharacterOptionName>;

function getCharacterBuilderGrammaticalGender(
  pronouns: string,
): CharacterBuilderGrammaticalGender {
  const normalizedPronouns = pronouns.trim().toLowerCase();

  if (
    normalizedPronouns === "ela / dela" ||
    normalizedPronouns === "ela/dela"
  ) {
    return "feminine";
  }

  if (
    normalizedPronouns === "elu / delu" ||
    normalizedPronouns === "elu/delu"
  ) {
    return "neutral";
  }

  return "masculine";
}

function getGenderedCharacterOptionName({
  key,
  name,
  pronouns,
}: {
  key?: string | null;
  name: string;
  pronouns: string;
}) {
  const grammaticalGender = getCharacterBuilderGrammaticalGender(pronouns);
  const genderedNameByKey = key
    ? GENDERED_CHARACTER_OPTION_NAMES_BY_KEY[key]
    : undefined;

  if (genderedNameByKey) {
    return genderedNameByKey[grammaticalGender];
  }

  const genderedNameByFallbackName =
    GENDERED_CHARACTER_OPTION_NAMES_BY_NORMALIZED_NAME[
      normalizeCharacterOptionName(name)
    ];

  if (genderedNameByFallbackName) {
    return genderedNameByFallbackName[grammaticalGender];
  }

  return name;
}

function getDefaultGenderFromPronouns(pronouns: string) {
  const normalizedPronouns = pronouns.trim().toLowerCase();

  if (
    normalizedPronouns === "ele / dele" ||
    normalizedPronouns === "ele/dele"
  ) {
    return "Masculino";
  }

  if (
    normalizedPronouns === "ela / dela" ||
    normalizedPronouns === "ela/dela"
  ) {
    return "Feminino";
  }

  if (
    normalizedPronouns === "elu / delu" ||
    normalizedPronouns === "elu/delu"
  ) {
    return "Não binário";
  }

  return "";
}

function shouldReplaceGenderAutomatically(currentGender: string) {
  const normalizedGender = currentGender.trim().toLowerCase();

  return (
    normalizedGender === "" ||
    normalizedGender === "masculino" ||
    normalizedGender === "feminino" ||
    normalizedGender === "não binário" ||
    normalizedGender === "nao binario" ||
    normalizedGender === "neutro"
  );
}

function getSelectedOptionLabelByPronouns(pronouns: string) {
  const grammaticalGender = getCharacterBuilderGrammaticalGender(pronouns);

  if (grammaticalGender === "feminine") {
    return "Selecionada";
  }

  if (grammaticalGender === "neutral") {
    return "Selecionade";
  }

  return "Selecionado";
}

function CharacterBuilderModal({
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

  const temporaryClassSkillChoiceCount = selectedClass ? 2 : 0;
  const backgroundSkillChoiceCount = selectedBackground?.skillKeys.length ?? 0;

  const requiredSkillChoiceCount =
    temporaryClassSkillChoiceCount + backgroundSkillChoiceCount;

  const selectedSkillCount = draft.skillKeys.length;
  const selectedSpellCount = draft.spellKeys.length;
  const selectedCantripCount = draft.spellKeys.filter((spellKey) => {
    const spell = options.spells.find(
      (currentSpell) => currentSpell.key === spellKey,
    );

    return spell ? isCantrip(spell) : false;
  }).length;
  const selectedLeveledSpellCount = selectedSpellCount - selectedCantripCount;

  const assignedAttributeValues = CHARACTER_ATTRIBUTE_DEFINITIONS.map(
    (attribute) => draft.attributes[attribute.key],
  ).filter((value): value is number => value !== null);

  const attributeTotal = assignedAttributeValues.reduce(
    (total, value) => total + value,
    0,
  );

  const strongestAttribute =
    assignedAttributeValues.length > 0
      ? CHARACTER_ATTRIBUTE_DEFINITIONS.reduce((strongest, attribute) => {
          const currentValue = draft.attributes[attribute.key];
          const strongestValue = draft.attributes[strongest.key];

          if (currentValue === null) {
            return strongest;
          }

          if (strongestValue === null || currentValue > strongestValue) {
            return attribute;
          }

          return strongest;
        }, CHARACTER_ATTRIBUTE_DEFINITIONS[0]!)
      : null;

  function isStepComplete(stepId: string) {
    if (stepId === "concept") {
      return Boolean(draft.name.trim());
    }

    if (stepId === "class") {
      return Boolean(draft.classId);
    }

    if (stepId === "ancestry") {
      return Boolean(draft.ancestryId);
    }

    if (stepId === "background") {
      return Boolean(draft.backgroundId);
    }

    if (stepId === "attributes") {
      const attributeValues = CHARACTER_ATTRIBUTE_DEFINITIONS.map(
        (attribute) => draft.attributes[attribute.key],
      );

      const allAttributesWereChosen = attributeValues.every(
        (value): value is number => value !== null,
      );

      if (!allAttributesWereChosen) {
        return false;
      }

      const usesOnlyStandardArrayValues = attributeValues.every((value) =>
        STANDARD_ARRAY_ATTRIBUTE_VALUES.includes(value),
      );

      const usesEachValueOnlyOnce =
        new Set(attributeValues).size ===
        STANDARD_ARRAY_ATTRIBUTE_VALUES.length;

      return usesOnlyStandardArrayValues && usesEachValueOnlyOnce;
    }

    if (stepId === "skills") {
      return draft.skillKeys.length >= requiredSkillChoiceCount;
    }

    return true;
  }

  function getStepValidationMessage(stepId: string) {
    if (stepId === "concept" && !draft.name.trim()) {
      return "Informe o nome do personagem antes de avançar.";
    }

    if (stepId === "class" && !draft.classId) {
      return "Escolha uma classe antes de avançar.";
    }

    if (stepId === "ancestry" && !draft.ancestryId) {
      return "Escolha uma ancestralidade antes de avançar.";
    }

    if (stepId === "background" && !draft.backgroundId) {
      return "Escolha um antecedente antes de avançar.";
    }

    if (stepId === "attributes" && !isStepComplete("attributes")) {
      return "Distribua os valores fixos 15, 14, 13, 12, 10 e 8 sem repetir nenhum valor.";
    }

    if (stepId === "skills" && !isStepComplete("skills")) {
      return `Escolha ${requiredSkillChoiceCount} perícias no total, somando classe e antecedente. Atualmente você escolheu ${selectedSkillCount}.`;
    }

    return null;
  }

  function canEnterStep(stepId: string) {
    const targetStepIndex = characterBuilderSteps.findIndex(
      (step) => step.id === stepId,
    );

    if (targetStepIndex <= 0) {
      return true;
    }

    return characterBuilderSteps
      .slice(0, targetStepIndex)
      .every((step) => isStepComplete(step.id));
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

                  {currentStepValidationMessage ? (
                    <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-100">
                      {currentStepValidationMessage}
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
                    <CharacterConceptStep
                      draft={draft}
                      onChangeDraftField={updateDraft}
                    />
                  ) : activeStep.id === "class" ? (
                    <CharacterBuilderOptionCards
                      title="Classes disponíveis"
                      description="Escolha a função principal do personagem na aventura."
                      options={options.classes}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      emptyMessage="Nenhuma classe encontrada para este sistema."
                      selectedId={draft.classId}
                      selectedLabel={selectedOptionLabel}
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
                        updateDraft("classId", option.id);
                        updateDraft("className", option.name);
                        onSelectOption("class", option);
                      }}
                    />
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
                  ) : activeStep.id === "spells" ? (
                    <CharacterSpellsStep
                      spells={options.spells}
                      selectedClass={genderedSelectedClass}
                      selectedSpellKeys={draft.spellKeys}
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
                      label="Nome"
                      value={draft.name || "Não definido"}
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
                              draft.attributes[strongestAttribute.key]
                            } (${formatAttributeModifier(
                              draft.attributes[strongestAttribute.key],
                            )})`
                          : "Não definido"
                      }
                    />

                    <BuilderSummaryRow
                      label="Perícias"
                      value={`${selectedSkillCount}/${requiredSkillChoiceCount} escolhidas`}
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

                    <BuilderSummaryRow label="Nível" value="1" />

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
            {characterBuilderSteps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => onChangeStep(step.id)}
                className={[
                  "h-3 w-8 rounded-full transition",
                  step.id === activeStep.id
                    ? "bg-amber-300"
                    : index < activeStepIndex
                      ? "bg-emerald-500"
                      : "bg-zinc-700",
                ].join(" ")}
                aria-label={`Ir para etapa ${step.title}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={
              nextStep
                ? !canGoToNextStep
                : isFinalizingSheet || savedCharacterSheetStatus === "READY"
            }
            onClick={() => {
              if (nextStep && canGoToNextStep) {
                onChangeStep(nextStep.id);
                return;
              }

              if (!nextStep) {
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

function CharacterBuilderOptionCards({
  title,
  description,
  options,
  isLoading,
  error,
  emptyMessage,
  selectedId,
  selectedLabel = "Selecionado",
  getOptionName,
  getOptionTitle,
  onSelect,
}: {
  title: string;
  description: string;
  options: CharacterBuilderSelectableOption[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  selectedId: string;
  selectedLabel?: string;
  getOptionName?: (option: CharacterBuilderSelectableOption) => string;
  getOptionTitle?: (option: CharacterBuilderSelectableOption) => string;
  onSelect: (option: CharacterBuilderSelectableOption) => void;
}) {
  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando opções...
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

  if (options.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm font-bold text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center gap-2" title={description}>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold/80">
          {title}
        </p>

        <span
          className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
          title={description}
          aria-label={`Informação sobre ${title}`}
        >
          i
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const optionDescription =
            option.description ?? "Sem descrição cadastrada.";

          const optionName = getOptionName?.(option) ?? option.name;

          const titleText =
            getOptionTitle?.(option) ?? `${optionName}: ${optionDescription}`;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              title={titleText}
              className={[
                "group min-h-28 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
                isSelected
                  ? "border-forge-gold bg-forge-gold/10 shadow-[-4px_4px_0_rgba(234,179,8,0.20)]"
                  : "border-forge-gold/15 bg-zinc-950/50 hover:border-forge-gold/70 hover:bg-forge-purple/20",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={[
                        "text-base font-black leading-tight",
                        isSelected
                          ? "text-forge-gold"
                          : "text-zinc-100 group-hover:text-forge-gold",
                      ].join(" ")}
                      title={optionName}
                    >
                      {optionName}
                    </h4>

                    <CharacterBuilderInfoIcon
                      title={titleText}
                      ariaLabel={`Informação sobre ${optionName}`}
                    />
                  </div>
                </div>

                {isSelected ? (
                  <span
                    className="shrink-0 rounded-full border border-forge-gold bg-forge-gold px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-black"
                    title="Opção selecionada"
                  >
                    {selectedLabel}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CampaignPlayPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [participants, setParticipants] = useState<CampaignParticipant[]>([]);

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const [activeTool, setActiveTool] = useState<ToolMode>("select");
  const [activeRightTab, setActiveRightTab] = useState<RightPanelTab>("chat");
  const [isCharacterCreationMenuOpen, setIsCharacterCreationMenuOpen] =
    useState(false);
  const [isNpcCreationModalOpen, setIsNpcCreationModalOpen] = useState(false);
  const [npcCreationDraft, setNpcCreationDraft] =
    useState<SimpleActorCreationDraft>(() =>
      createEmptySimpleActorCreationDraft(),
    );
  const [isSavingNpcCreation, setIsSavingNpcCreation] = useState(false);
  const [npcCreationError, setNpcCreationError] = useState<string | null>(null);
  const [isCreatureCreationModalOpen, setIsCreatureCreationModalOpen] =
    useState(false);
  const [creatureCreationDraft, setCreatureCreationDraft] =
    useState<SimpleActorCreationDraft>(() =>
      createEmptySimpleActorCreationDraft(),
    );
  const [isSavingCreatureCreation, setIsSavingCreatureCreation] =
    useState(false);
  const [creatureCreationError, setCreatureCreationError] = useState<
    string | null
  >(null);
  const [isCharacterBuilderOpen, setIsCharacterBuilderOpen] = useState(false);
  const [activeCharacterBuilderStep, setActiveCharacterBuilderStep] =
    useState("concept");
  const [characterBuilderDraft, setCharacterBuilderDraft] =
    useState<CharacterBuilderDraft>(() => createEmptyCharacterBuilderDraft());
  const [savedCharacterSheetId, setSavedCharacterSheetId] = useState<
    string | null
  >(null);
  const [savedCharacterSheetStatus, setSavedCharacterSheetStatus] =
    useState<CharacterSheetStatus | null>(null);
  const [isSavingCharacterDraft, setIsSavingCharacterDraft] = useState(false);
  const [isFinalizingCharacterSheet, setIsFinalizingCharacterSheet] =
    useState(false);
  const [characterDraftSaveError, setCharacterDraftSaveError] = useState<
    string | null
  >(null);
  const [characterDraftSaveSuccess, setCharacterDraftSaveSuccess] = useState<
    string | null
  >(null);
  const [characterBuilderOptions, setCharacterBuilderOptions] =
    useState<CharacterBuilderOptions>({
      classes: [],
      ancestries: [],
      backgrounds: [],
      skills: [],
      spells: [],
      equipment: [],
    });
  const [
    isLoadingCharacterBuilderOptions,
    setIsLoadingCharacterBuilderOptions,
  ] = useState(false);
  const [characterBuilderOptionsError, setCharacterBuilderOptionsError] =
    useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [scenePan, setScenePan] = useState({ x: 0, y: 0 });
  const [scenePanStart, setScenePanStart] = useState<{
    pointerX: number;
    pointerY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const [measureStart, setMeasureStart] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [measureEnd, setMeasureEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureMode, setMeasureMode] = useState<"line" | "circle">("line");
  const [drawStrokes, setDrawStrokes] = useState<
    {
      id: string;
      points: {
        x: number;
        y: number;
      }[];
    }[]
  >([]);

  const [currentDrawStroke, setCurrentDrawStroke] = useState<{
    id: string;
    points: {
      x: number;
      y: number;
    }[];
  } | null>(null);
  const [fogReveals, setFogReveals] = useState<
    {
      id: string;
      start: {
        x: number;
        y: number;
      };
      end: {
        x: number;
        y: number;
      };
    }[]
  >([]);

  const [currentFogReveal, setCurrentFogReveal] = useState<{
    id: string;
    start: {
      x: number;
      y: number;
    };
    end: {
      x: number;
      y: number;
    };
  } | null>(null);
  const [isLeftToolbarOpen, setIsLeftToolbarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<CampaignActor | null>(
    null,
  );
  const [actionActor, setActionActor] = useState<CampaignActor | null>(null);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

  const [campaignActors, setCampaignActors] = useState<CampaignActor[]>([]);

  const [characterSheets, setCharacterSheets] = useState<CharacterReadySheet[]>(
    [],
  );

  const [isSavingCharacterSheetImages, setIsSavingCharacterSheetImages] =
    useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<ChatMode>("public");
  const [whisperTargetId, setWhisperTargetId] = useState("");
  const [chatError, setChatError] = useState("");

  const [diceExpression, setDiceExpression] = useState("1d20");
  const [rollVisibility, setRollVisibility] =
    useState<RollVisibility>("private");
  const [rollError, setRollError] = useState("");
  const [customDiceSides, setCustomDiceSides] = useState(30);

  const [isCustomDiceOpen, setIsCustomDiceOpen] = useState(false);
  const [isDiceBuilderOpen, setIsDiceBuilderOpen] = useState(false);
  const [isAdvancedRollOpen, setIsAdvancedRollOpen] = useState(false);

  const [diceTerms, setDiceTerms] = useState<DiceTerm[]>([
    {
      id: createId(),
      quantity: 1,
      sides: 20,
    },
  ]);

  const [privateRolls, setPrivateRolls] = useState<RollResult[]>([]);

  const [sceneTokens, setSceneTokens] = useState<SceneToken[]>([]);

  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [pendingTokenPosition, setPendingTokenPosition] = useState<{
    tokenId: string;
    x: number;
    y: number;
  } | null>(null);

  const [, setActionMessage] = useState("");
  const [, setActionError] = useState("");

  const [isAssumingGm, setIsAssumingGm] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "system-welcome",
      author: "Sistema",
      kind: "system",
      content: "A mesa foi aberta. A aventura aguarda os jogadores.",
    },
  ]);

  useEffect(() => {
    async function loadTable() {
      try {
        const { data } = await authClient.getSession();

        if (!data?.user) {
          router.push("/login");
          return;
        }

        const loggedUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
        };

        setUser(loggedUser);

        const [campaign, participants, actors, tokens, characterSheets] =
          await Promise.all([
            getCampaign(params.id),
            getCampaignParticipants(params.id),
            getCampaignActors(params.id),
            getCampaignTokens(params.id),
            getCampaignCharacterSheets(params.id),
          ]);

        const currentUserParticipant = participants.find(
          (participant) => participant.userId === loggedUser.id,
        );

        const isOwner = campaign.ownerId === loggedUser.id;
        const isApprovedParticipant =
          currentUserParticipant?.status === "APPROVED";

        if (!isOwner && !isApprovedParticipant) {
          setAccessDenied(true);
          return;
        }

        setCampaign(campaign);
        setParticipants(participants);
        setCampaignActors(actors);
        setSceneTokens(tokens);
        setCharacterSheets(characterSheets);
      } catch (error) {
        console.error(error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    }

    loadTable();
  }, [params.id, router]);

  function handleChangeTool(nextTool: ToolMode) {
    if (nextTool !== "measure") {
      setMeasureStart(null);
      setMeasureEnd(null);
      setIsMeasuring(false);
    }

    setActiveTool(nextTool);
  }

  async function reloadParticipants() {
    if (!campaign) {
      return;
    }

    const participants = await getCampaignParticipants(campaign.id);
    setParticipants(participants);
  }

  const currentUserParticipant = participants.find(
    (participant) => participant.userId === user?.id,
  );

  const approvedParticipants = participants.filter(
    (participant) => participant.status === "APPROVED",
  );

  const approvedGms = approvedParticipants.filter(
    (participant) => participant.role === "GM",
  );

  const approvedPlayers = approvedParticipants.filter(
    (participant) => participant.role !== "GM",
  );

  const hasApprovedGm = approvedGms.length > 0;

  const isOwner = Boolean(user && campaign?.ownerId === user.id);
  const isApprovedParticipant = currentUserParticipant?.status === "APPROVED";
  const isGM = currentUserParticipant?.role === "GM";

  const canAccessTable = isOwner || isApprovedParticipant;
  const canSeeGmTools = isGM;
  const canManageCampaignInsideTable = isOwner && isGM;
  const canAssumeGm =
    isOwner && isApprovedParticipant && !isGM && !hasApprovedGm;

  const roleLabel = isGM ? "Mestre" : "Jogador";

  const visibleActors = getVisibleActorsForUser(campaignActors, isGM);
  const visibleTableActors = visibleActors.filter(
    (actor) => actor.location === "TABLE",
  );

  const myActors = visibleTableActors.filter((actor) => {
    if (!user) {
      return false;
    }

    return actor.ownerId === user.id;
  });

  const otherPlayerActors = visibleTableActors.filter((actor) => {
    if (actor.type !== "PLAYER_CHARACTER") {
      return false;
    }

    if (!user) {
      return true;
    }

    return actor.ownerId !== user.id;
  });

  const npcActors = visibleTableActors.filter((actor) => actor.type === "NPC");

  const creatureActors = visibleTableActors.filter(
    (actor) => actor.type === "CREATURE",
  );

  const libraryActors = campaignActors.filter(
    (actor) => actor.location === "LIBRARY" && isLibraryCompatibleActor(actor),
  );

  function getCharacterSheetByActor(actor: CampaignActor) {
    return (
      characterSheets.find(
        (characterSheet) => characterSheet.campaignActorId === actor.id,
      ) ?? null
    );
  }

  function getInitiativeBonusForActor(actor: CampaignActor) {
  if (actor.type !== "PLAYER_CHARACTER") {
    return 0;
  }

  const characterSheet = getCharacterSheetByActor(actor);

  if (!characterSheet) {
    return 0;
  }

  return getInitiativeBonus(characterSheet.stats);
}

  async function handleUpdateCharacterSheetImages(
    characterSheetId: string,
    data: {
      portraitUrl: string | null;
      tokenImageUrl: string | null;
      tokenImageFit: CharacterReadySheet["tokenImageFit"];
    },
  ) {
    setIsSavingCharacterSheetImages(true);

    try {
      const updatedCharacterSheet = await updateCampaignCharacterSheetImages(
        params.id,
        characterSheetId,
        data,
      );

      setCharacterSheets((currentSheets) =>
        currentSheets.map((currentSheet) =>
          currentSheet.id === updatedCharacterSheet.id
            ? updatedCharacterSheet
            : currentSheet,
        ),
      );

      const actorId = updatedCharacterSheet.campaignActorId;

      if (!actorId) {
        return;
      }

      const updatedActor = await updateCampaignActor(params.id, actorId, {
        portraitUrl: updatedCharacterSheet.portraitUrl,
      });

      setCampaignActors((currentActors) =>
        currentActors.map((currentActor) =>
          currentActor.id === updatedActor.id ? updatedActor : currentActor,
        ),
      );

      const tokensFromActor = sceneTokens.filter(
        (sceneToken) => sceneToken.actorId === actorId,
      );

      if (tokensFromActor.length > 0) {
        const updatedTokens = await Promise.all(
          tokensFromActor.map((token) =>
            updateSceneToken(params.id, token.id, {
              imageUrl: updatedCharacterSheet.tokenImageUrl,
              imageFit: updatedCharacterSheet.tokenImageFit,
            }),
          ),
        );

        setSceneTokens((currentTokens) =>
          currentTokens.map((currentToken) => {
            const updatedToken = updatedTokens.find(
              (token) => token.id === currentToken.id,
            );

            return updatedToken ?? currentToken;
          }),
        );
      }
    } finally {
      setIsSavingCharacterSheetImages(false);
    }
  }

  function canMoveToken(token: SceneToken) {
    if (isGM) {
      return true;
    }

    if (!user) {
      return false;
    }

    return token.actor.ownerId === user.id;
  }

  function canInteractWithToken(token: SceneToken) {
    return activeTool === "select" && canMoveToken(token);
  }

  function canCreateTokenForActor(actor: CampaignActor) {
    return isGM && actor.location === "TABLE";
  }

  function canOpenActorSheet(actor: CampaignActor) {
    if (isGM) {
      return true;
    }

    if (!user) {
      return false;
    }

    return actor.ownerId === user.id;
  }

  const whisperTargets = useMemo(() => {
    if (!user) {
      return [];
    }

    const selfTarget: CampaignParticipant = {
      id: "self-whisper-target",
      campaignId: campaign?.id ?? "current",
      userId: user.id,
      role: currentUserParticipant?.role ?? "PLAYER",
      status: "APPROVED",
      joinedAt: "",
      removedAt: null,
      createdAt: "",
      user: {
        id: user.id,
        name: `${getDisplayName(user)} (nota pessoal)`,
        email: user.email ?? "",
        image: user.image ?? null,
      },
    };

    if (isGM) {
      return [
        selfTarget,
        ...approvedParticipants.filter(
          (participant) => participant.userId !== user.id,
        ),
      ];
    }

    return [
      selfTarget,
      ...approvedGms.filter((participant) => participant.userId !== user.id),
    ];
  }, [
    approvedGms,
    approvedParticipants,
    campaign?.id,
    currentUserParticipant?.role,
    isGM,
    user,
  ]);

  const toolbarItems = useMemo(
    () => getToolbarItems({ canSeeGmTools }),
    [canSeeGmTools],
  );

  const rightTabs = useMemo(() => getRightTabs(), []);

  const customExpression = buildExpressionFromTerms(diceTerms);

  const activeToolLabel =
    toolbarItems.find((item) => item.id === activeTool)?.label ?? "Selecionar";

  const lastRoll = [...chatMessages]
    .reverse()
    .find((message) => message.kind === "roll");

  function handleStartScenePan(event: PointerEvent<HTMLDivElement>) {
    if (activeTool !== "pan") {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    setScenePanStart({
      pointerX: event.clientX,
      pointerY: event.clientY,
      panX: scenePan.x,
      panY: scenePan.y,
    });
  }

  function handleMoveScenePan(event: PointerEvent<HTMLDivElement>) {
    if (activeTool !== "pan" || !scenePanStart) {
      return;
    }

    const nextX = scenePanStart.panX + event.clientX - scenePanStart.pointerX;
    const nextY = scenePanStart.panY + event.clientY - scenePanStart.pointerY;

    setScenePan({
      x: nextX,
      y: nextY,
    });
  }

  function handleStopScenePan() {
    setScenePanStart(null);
  }

  function getScenePointFromPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const scale = zoom / 100;

    return {
      x: Math.round((event.clientX - rect.left) / scale),
      y: Math.round((event.clientY - rect.top) / scale),
    };
  }

  function handleStartMeasure(event: PointerEvent<HTMLDivElement>) {
    if (activeTool !== "measure") {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    const point = getScenePointFromPointer(event);

    setMeasureStart(point);
    setMeasureEnd(point);
    setIsMeasuring(true);
  }

  function handleMoveMeasure(event: PointerEvent<HTMLDivElement>) {
    if (activeTool !== "measure" || !isMeasuring || !measureStart) {
      return;
    }

    setMeasureEnd(getScenePointFromPointer(event));
  }

  function handleStopMeasure() {
    if (activeTool !== "measure") {
      return;
    }

    setIsMeasuring(false);
  }

  function handleStartDraw(event: PointerEvent<HTMLDivElement>) {
    if (activeTool !== "draw" || !isGM) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    const point = getScenePointFromPointer(event);

    setCurrentDrawStroke({
      id: createId(),
      points: [point],
    });
  }

  function handleMoveDraw(event: PointerEvent<HTMLDivElement>) {
    if (activeTool !== "draw" || !isGM || !currentDrawStroke) {
      return;
    }

    const point = getScenePointFromPointer(event);

    setCurrentDrawStroke((currentStroke) => {
      if (!currentStroke) {
        return currentStroke;
      }

      return {
        ...currentStroke,
        points: [...currentStroke.points, point],
      };
    });
  }

  function handleStopDraw() {
    if (!currentDrawStroke) {
      return;
    }

    if (currentDrawStroke.points.length > 1) {
      setDrawStrokes((currentStrokes) => [
        ...currentStrokes,
        currentDrawStroke,
      ]);
    }

    setCurrentDrawStroke(null);
  }

  function handleUndoLastDrawing() {
    setDrawStrokes((currentStrokes) => currentStrokes.slice(0, -1));
    setCurrentDrawStroke(null);
  }

  function handleClearDrawings() {
    setDrawStrokes([]);
    setCurrentDrawStroke(null);
  }

  function handleStartFogReveal(event: PointerEvent<HTMLDivElement>) {
    if (activeTool !== "fog" || !isGM) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    const point = getScenePointFromPointer(event);

    setCurrentFogReveal({
      id: createId(),
      start: point,
      end: point,
    });
  }

  function handleMoveFogReveal(event: PointerEvent<HTMLDivElement>) {
    if (activeTool !== "fog" || !isGM || !currentFogReveal) {
      return;
    }

    const point = getScenePointFromPointer(event);

    setCurrentFogReveal((currentReveal) => {
      if (!currentReveal) {
        return currentReveal;
      }

      return {
        ...currentReveal,
        end: point,
      };
    });
  }

  function handleStopFogReveal() {
    if (!currentFogReveal) {
      return;
    }

    const width = Math.abs(currentFogReveal.end.x - currentFogReveal.start.x);
    const height = Math.abs(currentFogReveal.end.y - currentFogReveal.start.y);

    if (width > 8 && height > 8) {
      setFogReveals((currentReveals) => [...currentReveals, currentFogReveal]);
    }

    setCurrentFogReveal(null);
  }

  function handleUndoLastFogReveal() {
    setFogReveals((currentReveals) => currentReveals.slice(0, -1));
    setCurrentFogReveal(null);
  }

  function handleClearFogReveals() {
    setFogReveals([]);
    setCurrentFogReveal(null);
  }

  function increaseZoom() {
    setZoom((currentZoom) => Math.min(currentZoom + 10, 200));
  }

  function decreaseZoom() {
    setZoom((currentZoom) => Math.max(currentZoom - 10, 50));
  }

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = chatInput.trim();

    if (!message || !user) {
      return;
    }

    setChatError("");

    if (chatMode === "whisper") {
      const target = whisperTargets.find(
        (participant) => participant.userId === whisperTargetId,
      );

      if (!target) {
        setChatError("Escolha alguém para receber o sussurro.");
        return;
      }

      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createId(),
          author: getDisplayName(user),
          kind: "whisper",
          content: message,
          recipientId: target.userId,
          recipientName: getParticipantDisplayName(target),
        },
      ]);

      setChatInput("");
      return;
    }

    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createId(),
        author: getDisplayName(user),
        kind: "user",
        content: message,
      },
    ]);

    setChatInput("");
  }

  function publishRollToChat(roll: RollResult, rollLabel?: string) {
    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createId(),
        author: roll.author,
        kind: "roll",
        content: rollLabel ?? `${roll.author} rolou ${roll.expression}`,
        dice: roll.expression,
        result: roll.total,
        displayResult: roll.displayResult,
        breakdown: roll.breakdown,
      },
    ]);
  }

  function handleRoll(
    rollExpression: string,
    visibility: RollVisibility,
    rollLabel?: string,
  ) {
    if (!user) {
      return;
    }

    setRollError("");

    try {
      const author = getDisplayName(user);
      const roll = rollDiceExpression(rollExpression, author);

      if (visibility === "private" && isGM) {
        setPrivateRolls((currentRolls) => [roll, ...currentRolls]);
        return;
      }

      publishRollToChat(roll, rollLabel);
    } catch (error) {
      setRollError(
        error instanceof Error ? error.message : "Não foi possível rolar.",
      );
    }
  }

  function handleRollExpression(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleRoll(diceExpression, isGM ? rollVisibility : "public");
  }

  function handleRollCustomBuilder() {
    handleRoll(customExpression, isGM ? rollVisibility : "public");
  }

  function handleQuickRoll(expression: string) {
    handleRoll(expression, isGM ? rollVisibility : "public");
  }

  function handleRollMassNpcInitiative() {
  if (!user || !isGM) {
    return;
  }

  setRollError("");

  const initiativeActors = visibleTableActors.filter((actor) => {
    return (
      actor.type === "PLAYER_CHARACTER" ||
      actor.type === "NPC" ||
      actor.type === "CREATURE"
    );
  });

  if (initiativeActors.length === 0) {
    setRollError(
      "Não há personagens, NPCs ou criaturas na mesa para rolar iniciativa.",
    );
    return;
  }

  const results = initiativeActors
  .map((actor) => {
    const initiativeBonus = getInitiativeBonusForActor(actor);
    const expression = `1d20${initiativeBonus >= 0 ? "+" : ""}${initiativeBonus}`;
    const roll = rollDiceExpression(expression, actor.name);

    return {
      actor,
      roll,
      initiativeBonus,
      expression,
    };
  })
    .sort((firstResult, secondResult) => {
      if (secondResult.roll.total !== firstResult.roll.total) {
        return secondResult.roll.total - firstResult.roll.total;
      }

      return firstResult.actor.name.localeCompare(
        secondResult.actor.name,
        "pt-BR",
      );
    });

  const ranking = results
  .map((result, index) => {
    const bonusText =
      result.initiativeBonus >= 0
        ? `+${result.initiativeBonus}`
        : String(result.initiativeBonus);

    return `${index + 1}. ${result.actor.name} — ${result.roll.total} (${bonusText})`;
  })
  .join("\n");

  const breakdown = results
  .map((result) => {
    return `${result.actor.name}: ${result.expression} → ${result.roll.breakdown}`;
  })
  .join("\n");

  setChatMessages((currentMessages) => [
    ...currentMessages,
    {
      id: createId(),
      author: getDisplayName(user),
      kind: "roll",
      content: `Ordem de iniciativa\n${ranking}`,
      dice: "Iniciativa da mesa",
      result: results[0]?.roll.total ?? 0,
      displayResult: `${results.length} participantes`,
      breakdown,
    },
  ]);

  setActiveRightTab("chat");
}

  function handleReadySheetRoll(request: CharacterReadySheetRollRequest) {
  if (request.kind === "effect") {
    if (!user) {
      return;
    }

    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createId(),
        author: getDisplayName(user),
        kind: "roll",
        content: `${request.label}\n${request.description}`,
        dice: "Efeito",
        result: 0,
        displayResult: "Efeito",
        breakdown: request.description,
      },
    ]);

    setActiveRightTab("chat");
    return;
  }

  if (request.kind === "damage") {
    handleRoll(request.expression, "public", request.label);
    setActiveRightTab("chat");
    return;
  }

  const modifierExpression =
    request.modifier === 0
      ? ""
      : request.modifier > 0
        ? `+${request.modifier}`
        : `${request.modifier}`;

  handleRoll(`1d20${modifierExpression}`, "public", request.label);
  setActiveRightTab("chat");
}

  function handleRollCustomDice() {
    if (!Number.isInteger(customDiceSides) || customDiceSides < 2) {
      setRollError("O dado personalizado precisa ter pelo menos 2 lados.");
      return;
    }

    if (customDiceSides > 1000) {
      setRollError("O dado personalizado pode ter no máximo 1000 lados.");
      return;
    }

    handleRoll(`1d${customDiceSides}`, isGM ? rollVisibility : "public");
  }

  function handleAddCustomDiceToBuilder() {
    if (!Number.isInteger(customDiceSides) || customDiceSides < 2) {
      setRollError("O dado personalizado precisa ter pelo menos 2 lados.");
      return;
    }

    if (customDiceSides > 1000) {
      setRollError("O dado personalizado pode ter no máximo 1000 lados.");
      return;
    }

    setDiceTerms((currentTerms) => [
      ...currentTerms,
      {
        id: createId(),
        quantity: 1,
        sides: customDiceSides,
      },
    ]);

    setIsDiceBuilderOpen(true);
  }

  function handleAddDiceTerm() {
    setDiceTerms((currentTerms) => [
      ...currentTerms,
      {
        id: createId(),
        quantity: 1,
        sides: 20,
      },
    ]);
  }

  function handleRemoveDiceTerm(id: string) {
    setDiceTerms((currentTerms) => {
      if (currentTerms.length === 1) {
        return currentTerms;
      }

      return currentTerms.filter((term) => term.id !== id);
    });
  }

  function handleChangeDiceTerm(
    id: string,
    field: "quantity" | "sides",
    value: number,
  ) {
    setDiceTerms((currentTerms) =>
      currentTerms.map((term) => {
        if (term.id !== id) {
          return term;
        }

        return {
          ...term,
          [field]: value,
        };
      }),
    );
  }

  function handleRevealPrivateRoll(roll: RollResult) {
    publishRollToChat(roll);

    setPrivateRolls((currentRolls) =>
      currentRolls.filter((privateRoll) => privateRoll.id !== roll.id),
    );
  }

  async function handleAddTokenToScene(actor: CampaignActor) {
    if (!campaign || !canCreateTokenForActor(actor)) {
      return;
    }

    setActionError("");
    setActionMessage("");

    const tokenCount = sceneTokens.length;
    const nextX = 300 + ((tokenCount * 90) % 560);
    const nextY = 340 + Math.floor(tokenCount / 6) * 90;

    const characterSheet = getCharacterSheetByActor(actor);

    const tokenImageUrl =
      actor.type === "PLAYER_CHARACTER"
        ? characterSheet?.tokenImageUrl || actor.portraitUrl
        : actor.portraitUrl;

    const tokenImageFit =
      actor.type === "PLAYER_CHARACTER"
        ? (characterSheet?.tokenImageFit ?? "FILL")
        : "COVER";

    try {
      const createdToken = await createSceneToken(campaign.id, actor.id, {
        x: nextX,
        y: nextY,
        width: 80,
        height: 80,
        imageUrl: tokenImageUrl,
        imageFit: tokenImageFit,
      });

      setSceneTokens((currentTokens) => [...currentTokens, createdToken]);

      setActionMessage(`${createdToken.name} entrou na cena.`);
    } catch (error) {
      console.error(error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o token à cena.",
      );
    }
  }

  function handleStartTokenDrag(
    tokenId: string,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    const token = sceneTokens.find((sceneToken) => sceneToken.id === tokenId);

    if (!token || !canInteractWithToken(token)) {
      return;
    }

    const scale = zoom / 100;
    const tokenRect = event.currentTarget.getBoundingClientRect();

    setDragOffset({
      x: (event.clientX - tokenRect.left) / scale,
      y: (event.clientY - tokenRect.top) / scale,
    });

    setDraggingTokenId(tokenId);
  }

  function handleMoveTokenOnScene(event: PointerEvent<HTMLDivElement>) {
    if (!draggingTokenId) {
      return;
    }

    const draggingToken = sceneTokens.find(
      (sceneToken) => sceneToken.id === draggingTokenId,
    );

    if (!draggingToken || !canInteractWithToken(draggingToken)) {
      return;
    }

    const scene = event.currentTarget.getBoundingClientRect();
    const scale = zoom / 100;

    const x = Math.round((event.clientX - scene.left) / scale);
    const y = Math.round((event.clientY - scene.top) / scale);

    const offsetX = dragOffset?.x ?? draggingToken.width / 2;
    const offsetY = dragOffset?.y ?? draggingToken.height / 2;

    const nextX = Math.max(
      0,
      Math.min(x - offsetX, 1400 - draggingToken.width),
    );
    const nextY = Math.max(
      0,
      Math.min(y - offsetY, 900 - draggingToken.height),
    );

    setPendingTokenPosition({
      tokenId: draggingToken.id,
      x: nextX,
      y: nextY,
    });

    setSceneTokens((currentTokens) =>
      currentTokens.map((token) => {
        if (token.id !== draggingTokenId) {
          return token;
        }

        return {
          ...token,
          x: nextX,
          y: nextY,
        };
      }),
    );
  }

  async function handleStopTokenDrag() {
    if (!campaign || !pendingTokenPosition) {
      setDraggingTokenId(null);
      setDragOffset(null);
      return;
    }

    const positionToSave = pendingTokenPosition;

    setDraggingTokenId(null);
    setDragOffset(null);
    setPendingTokenPosition(null);
    setActionError("");

    try {
      const updatedToken = await updateSceneToken(
        campaign.id,
        positionToSave.tokenId,
        {
          x: Math.round(positionToSave.x),
          y: Math.round(positionToSave.y),
        },
      );

      setSceneTokens((currentTokens) =>
        currentTokens.map((token) => {
          if (token.id !== updatedToken.id) {
            return token;
          }

          return updatedToken;
        }),
      );
    } catch (error) {
      console.error(error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a posição do token.",
      );
    }
  }

  async function handleRemoveTokenFromScene(tokenId: string) {
    if (!campaign || !isGM) {
      return;
    }

    setActionError("");
    setActionMessage("");

    try {
      const deletedTokenId = await deleteSceneToken(campaign.id, tokenId);

      setSceneTokens((currentTokens) =>
        currentTokens.filter((token) => token.id !== deletedTokenId),
      );

      setActionMessage("Token removido da cena.");
    } catch (error) {
      console.error(error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o token da cena.",
      );
    }
  }

  async function handleChangeActorTokenSize(
    actor: CampaignActor,
    gridSize: number,
  ) {
    if (!campaign || !isGM) {
      return;
    }

    const token = sceneTokens.find(
      (sceneToken) => sceneToken.actorId === actor.id,
    );

    if (!token) {
      setActionError("Este ator ainda não possui token na cena.");
      return;
    }

    const tokenSize = getTokenSizeInPixels(gridSize);

    setActionError("");
    setActionMessage("");

    setSceneTokens((currentTokens) =>
      currentTokens.map((currentToken) => {
        if (currentToken.id !== token.id) {
          return currentToken;
        }

        return {
          ...currentToken,
          width: tokenSize,
          height: tokenSize,
        };
      }),
    );

    try {
      const updatedToken = await updateSceneToken(campaign.id, token.id, {
        width: tokenSize,
        height: tokenSize,
      });

      setSceneTokens((currentTokens) =>
        currentTokens.map((currentToken) => {
          if (currentToken.id !== updatedToken.id) {
            return currentToken;
          }

          return updatedToken;
        }),
      );

      setActionMessage(
        `Tamanho do token de ${actor.name} atualizado para ${gridSize}x${gridSize}.`,
      );
    } catch (error) {
      console.error(error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o tamanho do token.",
      );
    }
  }

  async function handleCreateNpcActor() {
    if (!campaign || !isGM) {
      return;
    }

    const name = npcCreationDraft.name.trim();

    if (!name) {
      setNpcCreationError("Informe o nome do NPC.");
      return;
    }

    setIsSavingNpcCreation(true);
    setNpcCreationError(null);

    try {
      const createdActor = await createCampaignActor(campaign.id, {
        name,
        type: "NPC",
        location: npcCreationDraft.location,
        initials: npcCreationDraft.initials.trim() || undefined,
        description: npcCreationDraft.description.trim() || null,
        portraitUrl: npcCreationDraft.portraitUrl.trim() || null,
        ownerId: null,
      });

      setCampaignActors((currentActors) => [...currentActors, createdActor]);
      setNpcCreationDraft(createEmptySimpleActorCreationDraft());
      setIsNpcCreationModalOpen(false);

      if (createdActor.location === "TABLE") {
        setActiveRightTab("characters");
      } else {
        setIsLibraryModalOpen(true);
      }
    } catch (error) {
      console.error(error);

      setNpcCreationError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o NPC.",
      );
    } finally {
      setIsSavingNpcCreation(false);
    }
  }

  async function handleCreateCreatureActor() {
    if (!campaign || !isGM) {
      return;
    }

    const name = creatureCreationDraft.name.trim();

    if (!name) {
      setCreatureCreationError("Informe o nome da criatura.");
      return;
    }

    setIsSavingCreatureCreation(true);
    setCreatureCreationError(null);

    try {
      const createdActor = await createCampaignActor(campaign.id, {
        name,
        type: "CREATURE",
        location: creatureCreationDraft.location,
        initials: creatureCreationDraft.initials.trim() || undefined,
        description: creatureCreationDraft.description.trim() || null,
        portraitUrl: creatureCreationDraft.portraitUrl.trim() || null,
        ownerId: null,
      });

      setCampaignActors((currentActors) => [...currentActors, createdActor]);
      setCreatureCreationDraft(createEmptySimpleActorCreationDraft());
      setIsCreatureCreationModalOpen(false);

      if (createdActor.location === "TABLE") {
        setActiveRightTab("characters");
      } else {
        setIsLibraryModalOpen(true);
      }
    } catch (error) {
      console.error(error);

      setCreatureCreationError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a criatura.",
      );
    } finally {
      setIsSavingCreatureCreation(false);
    }
  }

  async function handleBringActorToTable(actor: CampaignActor) {
    if (!campaign || !isGM || !isLibraryCompatibleActor(actor)) {
      return;
    }

    setActionError("");
    setActionMessage("");

    try {
      const updatedActor = await updateCampaignActor(campaign.id, actor.id, {
        location: "TABLE",
      });

      setCampaignActors((currentActors) =>
        currentActors.map((currentActor) => {
          if (currentActor.id !== updatedActor.id) {
            return currentActor;
          }

          return updatedActor;
        }),
      );

      setIsLibraryModalOpen(false);
      setActionMessage(`${updatedActor.name} voltou para a mesa.`);
    } catch (error) {
      console.error(error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível trazer o ator para a mesa.",
      );
    }
  }

  async function handleReturnActorToLibrary(actor: CampaignActor) {
    if (!campaign || !isGM || !isLibraryCompatibleActor(actor)) {
      return;
    }
    setActionError("");
    setActionMessage("");

    try {
      const updatedActor = await updateCampaignActor(campaign.id, actor.id, {
        location: "LIBRARY",
      });

      setCampaignActors((currentActors) =>
        currentActors.map((currentActor) => {
          if (currentActor.id !== updatedActor.id) {
            return currentActor;
          }

          return updatedActor;
        }),
      );

      setSceneTokens((currentTokens) =>
        currentTokens.filter((token) => token.actorId !== updatedActor.id),
      );

      setActionActor(null);
      setActionMessage(`${updatedActor.name} voltou para a biblioteca.`);
    } catch (error) {
      console.error(error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível devolver o ator para a biblioteca.",
      );
    }
  }

  async function handleAssumeGmRole() {
    if (!campaign || !currentUserParticipant) {
      return;
    }

    setIsAssumingGm(true);
    setActionError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}/participants/${currentUserParticipant.id}/role`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "GM",
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Erro ao assumir papel de GM");
      }

      await reloadParticipants();

      setActionMessage("Você assumiu o papel de Mestre desta mesa.");
    } catch (error) {
      console.error(error);
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível assumir o papel de GM.",
      );
    } finally {
      setIsAssumingGm(false);
    }
  }

  async function handleLoadCharacterBuilderOptions() {
    if (!campaign?.systemId) {
      setCharacterBuilderOptionsError(
        "Esta campanha ainda não possui um sistema definido.",
      );
      return;
    }

    setIsLoadingCharacterBuilderOptions(true);
    setCharacterBuilderOptionsError(null);

    try {
      const response = await fetch(
        `http://localhost:8081/systems/${campaign.systemId}/character-options`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ?? "Não foi possível carregar as opções do sistema.",
        );
      }

      setCharacterBuilderOptions({
        classes: data.classes ?? [],
        ancestries: data.ancestries ?? [],
        backgrounds: data.backgrounds ?? [],
        skills: data.skills ?? [],
        spells: data.spells ?? [],
        equipment: data.equipment ?? [],
      });
    } catch (error) {
      setCharacterBuilderOptionsError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as opções do sistema.",
      );
    } finally {
      setIsLoadingCharacterBuilderOptions(false);
    }
  }

  function startCharacterBuilderCreation() {
    setCharacterBuilderDraft(createEmptyCharacterBuilderDraft());
    setSavedCharacterSheetId(null);
    setSavedCharacterSheetStatus(null);
    setCharacterDraftSaveError(null);
    setCharacterDraftSaveSuccess(null);
    setIsSavingCharacterDraft(false);
    setIsFinalizingCharacterSheet(false);
    setCharacterBuilderOptionsError(null);

    setIsCharacterCreationMenuOpen(false);
    setActiveCharacterBuilderStep("concept");
    setIsCharacterBuilderOpen(true);

    void handleLoadCharacterBuilderOptions();
  }

  function handleOpenCharacterCreationEntryPoint() {
    if (isGM) {
      setIsCharacterCreationMenuOpen(true);
      return;
    }

    startCharacterBuilderCreation();
  }

  function handleSelectCharacterBuilderOption(
    type: "class" | "ancestry" | "background",
    option: {
      id: string;
      name: string;
      skillKeys?: string[];
    },
  ) {
    setCharacterBuilderDraft((currentDraft) => {
      if (type === "class") {
        return {
          ...currentDraft,
          classId: option.id,
          className: option.name,
          spellKeys: [],
        };
      }

      if (type === "ancestry") {
        return {
          ...currentDraft,
          ancestryId: option.id,
          ancestryName: option.name,
        };
      }

      if (type === "background") {
        const isChangingBackground = currentDraft.backgroundId !== option.id;

        return {
          ...currentDraft,
          backgroundId: option.id,
          backgroundName: option.name,
          skillKeys: isChangingBackground ? [] : currentDraft.skillKeys,
        };
      }

      return currentDraft;
    });
  }

  async function handleSaveCharacterBuilderDraft() {
    if (!campaign) {
      setCharacterDraftSaveError("Campanha não encontrada.");
      return;
    }

    if (!campaign.systemId) {
      setCharacterDraftSaveError(
        "Esta campanha ainda não possui um sistema definido.",
      );
      return;
    }

    const trimmedName = characterBuilderDraft.name.trim();

    if (!trimmedName) {
      setCharacterDraftSaveError(
        "Informe o nome do personagem antes de salvar.",
      );
      return;
    }

    setIsSavingCharacterDraft(true);
    setCharacterDraftSaveError(null);
    setCharacterDraftSaveSuccess(null);

    try {
      const requestUrl = savedCharacterSheetId
        ? `http://localhost:8081/campaigns/${campaign.id}/character-sheets/${savedCharacterSheetId}`
        : `http://localhost:8081/campaigns/${campaign.id}/character-sheets`;

      const requestMethod = savedCharacterSheetId ? "PATCH" : "POST";

      const response = await fetch(requestUrl, {
        method: requestMethod,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemId: campaign.systemId,
          name: trimmedName,
          pronouns: characterBuilderDraft.pronouns.trim(),
          concept: characterBuilderDraft.concept.trim(),
          portraitUrl: savedCharacterSheetId
            ? characterBuilderDraft.portraitUrl.trim() || null
            : characterBuilderDraft.portraitUrl.trim(),
          tokenImageUrl: savedCharacterSheetId
            ? characterBuilderDraft.tokenImageUrl.trim() || null
            : characterBuilderDraft.tokenImageUrl.trim(),
          tokenImageFit: characterBuilderDraft.tokenImageFit,
          classId: characterBuilderDraft.classId || null,
          ancestryId: characterBuilderDraft.ancestryId || null,
          backgroundId: characterBuilderDraft.backgroundId || null,
          attributes: getPersistableCharacterAttributes(
            characterBuilderDraft.attributes,
          ),
          skillKeys: characterBuilderDraft.skillKeys,
          spellKeys: characterBuilderDraft.spellKeys,
          equipmentItems: getStartingEquipmentItemsFromDraft(
            characterBuilderDraft,
            characterBuilderOptions,
          ),
          classEquipmentMode: characterBuilderDraft.classEquipmentMode,
          backgroundEquipmentMode:
            characterBuilderDraft.backgroundEquipmentMode,
          startingGold: getStartingGoldFromDraft(
            characterBuilderDraft,
            characterBuilderOptions,
          ),

          alignment: characterBuilderDraft.alignment.trim(),
          faith: characterBuilderDraft.faith.trim(),
          lifestyle: characterBuilderDraft.lifestyle.trim(),

          hair: characterBuilderDraft.hair.trim(),
          skin: characterBuilderDraft.skin.trim(),
          eyes: characterBuilderDraft.eyes.trim(),
          height: characterBuilderDraft.height.trim(),
          weight: characterBuilderDraft.weight.trim(),
          age: characterBuilderDraft.age.trim(),
          gender: characterBuilderDraft.gender.trim(),

          bonds: characterBuilderDraft.bonds.trim(),
          flaws: characterBuilderDraft.flaws.trim(),
          ideals: characterBuilderDraft.ideals.trim(),
          personality: characterBuilderDraft.personality.trim(),
          backstory: characterBuilderDraft.backstory.trim(),
          notes: characterBuilderDraft.notes.trim(),
          gmNotes: characterBuilderDraft.gmNotes.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível salvar o rascunho.");
      }

      setSavedCharacterSheetId(data.characterSheet.id);
      setSavedCharacterSheetStatus(data.characterSheet.status ?? "DRAFT");
      setCharacterSheets((currentSheets) => {
        const nextSheet = data.characterSheet as CharacterReadySheet;
        const alreadyExists = currentSheets.some(
          (sheet) => sheet.id === nextSheet.id,
        );

        if (alreadyExists) {
          return currentSheets.map((sheet) =>
            sheet.id === nextSheet.id ? nextSheet : sheet,
          );
        }

        return [nextSheet, ...currentSheets];
      });
      setCharacterDraftSaveSuccess(
        savedCharacterSheetId
          ? "Rascunho atualizado com sucesso."
          : "Rascunho salvo com sucesso.",
      );
    } catch (error) {
      setCharacterDraftSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o rascunho.",
      );
    } finally {
      setIsSavingCharacterDraft(false);
    }
  }

  async function handleFinalizeCharacterSheet() {
    if (!campaign) {
      setCharacterDraftSaveError("Campanha não encontrada.");
      return;
    }

    if (!savedCharacterSheetId) {
      setCharacterDraftSaveError(
        "Salve o rascunho antes de finalizar a ficha.",
      );
      return;
    }

    setIsFinalizingCharacterSheet(true);
    setCharacterDraftSaveError(null);
    setCharacterDraftSaveSuccess(null);

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}/character-sheets/${savedCharacterSheetId}/finalize`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível finalizar a ficha.");
      }

      const finalizedSheet = data.characterSheet as CharacterReadySheet;

      setSavedCharacterSheetStatus("READY");
      setCharacterSheets((currentSheets) => {
        const alreadyExists = currentSheets.some(
          (sheet) => sheet.id === finalizedSheet.id,
        );

        if (alreadyExists) {
          return currentSheets.map((sheet) =>
            sheet.id === finalizedSheet.id ? finalizedSheet : sheet,
          );
        }

        return [finalizedSheet, ...currentSheets];
      });
      setCharacterDraftSaveSuccess(
        "Ficha finalizada e enviada para Personagens.",
      );
      setActiveRightTab("characters");
      setIsCharacterBuilderOpen(false);

      const refreshedActors = await getCampaignActors(campaign.id);
      setCampaignActors(refreshedActors);
    } catch (error) {
      setCharacterDraftSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar a ficha.",
      );
    } finally {
      setIsFinalizingCharacterSheet(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#120816] px-6 text-white">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-forge-gold">
          Carregando mesa...
        </p>
      </main>
    );
  }

  if (accessDenied || !user || !campaign || !canAccessTable) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#120816] px-6 text-white">
        <div className="max-w-md rounded-2xl border border-forge-gold/40 bg-black/40 p-6 text-center shadow-[-12px_12px_0_rgba(0,0,0,0.35)]">
          <h1 className="text-2xl font-black text-forge-gold">Acesso negado</h1>

          <p className="mt-3 text-sm font-semibold text-white/65">
            Você precisa estar logado e fazer parte desta campanha para acessar
            a mesa.
          </p>

          <Link
            href="/campaigns"
            className="mt-5 inline-flex rounded-lg border border-forge-gold px-4 py-3 text-sm font-black text-forge-gold transition hover:bg-forge-purple"
          >
            Voltar para minhas aventuras
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#120816] text-white">
      <div className="flex h-screen flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-forge-gold/40 bg-[#1a0d20]/95 px-6 shadow-[-0_8px_24px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">
                Mesa de aventura
              </p>

              <h1 className="text-xl font-black text-forge-gold">
                {campaign.name}
              </h1>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-white/60 md:block">
              Cena atual: <span className="text-white">Primeira Vigília</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={decreaseZoom}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-lg font-black text-white/80 transition hover:border-forge-gold hover:text-forge-gold"
              aria-label="Diminuir zoom"
            >
              −
            </button>

            <div className="min-w-[72px] rounded-lg border border-forge-gold/40 bg-black/40 px-3 py-2 text-center text-xs font-black text-forge-gold">
              {zoom}%
            </div>

            <button
              type="button"
              onClick={increaseZoom}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-lg font-black text-white/80 transition hover:border-forge-gold hover:text-forge-gold"
              aria-label="Aumentar zoom"
            >
              +
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-xs font-black text-white">
                  {getDisplayName(user)}
                </p>

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forge-gold/80">
                  {roleLabel}
                </p>
              </div>

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-forge-gold bg-forge-purple text-sm font-black text-forge-gold shadow-[-5px_5px_0_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[-7px_7px_0_rgba(0,0,0,0.35)]"
                aria-label="Abrir menu do usuário"
              >
                {user.image ? (
                  <span
                    className="h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${user.image})`,
                    }}
                    aria-hidden="true"
                  />
                ) : (
                  getInitials(user)
                )}
              </button>
            </div>
          </div>
        </header>

        <div
          className="grid min-h-0 flex-1 transition-all duration-300"
          style={{
            gridTemplateColumns: `${isLeftToolbarOpen ? "72px" : "0px"} 1fr ${
              isRightPanelOpen ? "360px" : "0px"
            }`,
          }}
        >
          <TableLeftToolbar
            isOpen={isLeftToolbarOpen}
            activeTool={activeTool}
            toolbarItems={toolbarItems}
            onClose={() => setIsLeftToolbarOpen(false)}
            onChangeTool={handleChangeTool}
          />

          <TableSceneCanvas
            activeToolLabel={activeToolLabel}
            zoom={zoom}
            scenePan={scenePan}
            isLeftToolbarOpen={isLeftToolbarOpen}
            isRightPanelOpen={isRightPanelOpen}
            isPanToolActive={activeTool === "pan"}
            isPanningScene={Boolean(scenePanStart)}
            isMeasureToolActive={activeTool === "measure"}
            isDrawToolActive={activeTool === "draw" && isGM}
            isFogToolActive={activeTool === "fog" && isGM}
            measureMode={measureMode}
            measureStart={measureStart}
            measureEnd={measureEnd}
            drawStrokes={drawStrokes}
            currentDrawStroke={currentDrawStroke}
            fogReveals={fogReveals}
            currentFogReveal={currentFogReveal}
            sceneTokens={sceneTokens}
            draggingTokenId={draggingTokenId}
            canMoveToken={canInteractWithToken}
            onShowLeftToolbar={() => setIsLeftToolbarOpen(true)}
            onShowRightPanel={() => setIsRightPanelOpen(true)}
            onStartTokenDrag={handleStartTokenDrag}
            onMoveTokenOnScene={handleMoveTokenOnScene}
            onStopTokenDrag={handleStopTokenDrag}
            onStartScenePan={handleStartScenePan}
            onMoveScenePan={handleMoveScenePan}
            onStopScenePan={handleStopScenePan}
            onStartMeasure={handleStartMeasure}
            onMoveMeasure={handleMoveMeasure}
            onStopMeasure={handleStopMeasure}
            onChangeMeasureMode={setMeasureMode}
            onStartDraw={handleStartDraw}
            onMoveDraw={handleMoveDraw}
            onStopDraw={handleStopDraw}
            onUndoLastDrawing={handleUndoLastDrawing}
            onClearDrawings={handleClearDrawings}
            onStartFogReveal={handleStartFogReveal}
            onMoveFogReveal={handleMoveFogReveal}
            onStopFogReveal={handleStopFogReveal}
            onUndoLastFogReveal={handleUndoLastFogReveal}
            onClearFogReveals={handleClearFogReveals}
          />

          <TableRightPanel
            isOpen={isRightPanelOpen}
            activeTab={activeRightTab}
            tabs={rightTabs}
            onChangeTab={setActiveRightTab}
            onClose={() => setIsRightPanelOpen(false)}
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[13px]">
              {activeRightTab === "chat" && user && (
                <TableChatPanel
                  user={user}
                  chatMessages={chatMessages}
                  chatMode={chatMode}
                  whisperTargets={whisperTargets}
                  whisperTargetId={whisperTargetId}
                  chatInput={chatInput}
                  chatError={chatError}
                  onChangeChatMode={setChatMode}
                  onChangeWhisperTargetId={setWhisperTargetId}
                  onChangeChatInput={setChatInput}
                  onSubmitMessage={handleSendMessage}
                />
              )}

              {activeRightTab === "rolls" && (
                <TableRollsPanel
                  isGM={isGM}
                  diceExpression={diceExpression}
                  rollVisibility={rollVisibility}
                  rollError={rollError}
                  customDiceSides={customDiceSides}
                  isCustomDiceOpen={isCustomDiceOpen}
                  isDiceBuilderOpen={isDiceBuilderOpen}
                  isAdvancedRollOpen={isAdvancedRollOpen}
                  diceTerms={diceTerms}
                  privateRolls={privateRolls}
                  customExpression={customExpression}
                  lastRoll={lastRoll}
                  onChangeDiceExpression={setDiceExpression}
                  onChangeRollVisibility={setRollVisibility}
                  onChangeCustomDiceSides={setCustomDiceSides}
                  onToggleCustomDiceOpen={() =>
                    setIsCustomDiceOpen((current) => !current)
                  }
                  onToggleDiceBuilderOpen={() =>
                    setIsDiceBuilderOpen((current) => !current)
                  }
                  onToggleAdvancedRollOpen={() =>
                    setIsAdvancedRollOpen((current) => !current)
                  }
                  onRollExpression={handleRollExpression}
                  onQuickRoll={handleQuickRoll}
                  onRollCustomDice={handleRollCustomDice}
                  onAddCustomDiceToBuilder={handleAddCustomDiceToBuilder}
                  onAddDiceTerm={handleAddDiceTerm}
                  onRemoveDiceTerm={handleRemoveDiceTerm}
                  onChangeDiceTerm={handleChangeDiceTerm}
                  onRollCustomBuilder={handleRollCustomBuilder}
                  onRevealPrivateRoll={handleRevealPrivateRoll}
                  onRollMassNpcInitiative={handleRollMassNpcInitiative}
                  diceOptions={DICE_OPTIONS}
                  quickRolls={QUICK_ROLLS}
                />
              )}

              {activeRightTab === "characters" && (
                <TableCharactersPanel
                  isGM={isGM}
                  myActors={myActors}
                  otherPlayerActors={otherPlayerActors}
                  npcActors={npcActors}
                  creatureActors={creatureActors}
                  canCreateTokenForActor={canCreateTokenForActor}
                  canOpenSheet={canOpenActorSheet}
                  onOpenActions={setActionActor}
                  onOpenLibrary={() => setIsLibraryModalOpen(true)}
                  onOpenCharacterCreationMenu={handleOpenCharacterCreationEntryPoint}
                />
              )}

              {activeRightTab === "journal" && (
                <TableJournalPanel isGM={isGM} />
              )}

              {activeRightTab === "settings" && campaign && user && (
                <TableSettingsPanel
                  campaign={campaign}
                  user={user}
                  approvedParticipants={approvedParticipants}
                  approvedGms={approvedGms}
                  approvedPlayers={approvedPlayers}
                  isOwner={isOwner}
                  isGM={isGM}
                  canManageCampaignInsideTable={canManageCampaignInsideTable}
                  canAssumeGm={canAssumeGm}
                  isAssumingGm={isAssumingGm}
                  onAssumeGm={handleAssumeGmRole}
                  onOpenExitModal={() => setIsExitModalOpen(true)}
                  onOpenCharacterCreationMenu={handleOpenCharacterCreationEntryPoint}
                />
              )}
            </div>
          </TableRightPanel>
        </div>
      </div>

      <CharacterCreationMenuModal
        isOpen={isGM && isCharacterCreationMenuOpen}
        onClose={() => setIsCharacterCreationMenuOpen(false)}
        onStartCharacterBuilder={startCharacterBuilderCreation}
        onStartNpcCreation={() => {
          setNpcCreationDraft(createEmptySimpleActorCreationDraft());
          setNpcCreationError(null);
          setIsCharacterCreationMenuOpen(false);
          setIsNpcCreationModalOpen(true);
        }}
        onStartCreatureCreation={() => {
          setCreatureCreationDraft(createEmptySimpleActorCreationDraft());
          setCreatureCreationError(null);
          setIsCharacterCreationMenuOpen(false);
          setIsCreatureCreationModalOpen(true);
        }}
      />

      <CreatureCreationModal
        isOpen={isCreatureCreationModalOpen}
        draft={creatureCreationDraft}
        isSaving={isSavingCreatureCreation}
        error={creatureCreationError}
        onChangeDraft={setCreatureCreationDraft}
        onSubmit={handleCreateCreatureActor}
        onClose={() => {
          setIsCreatureCreationModalOpen(false);
          setCreatureCreationError(null);
        }}
      />

      <NpcCreationModal
        isOpen={isNpcCreationModalOpen}
        draft={npcCreationDraft}
        isSaving={isSavingNpcCreation}
        error={npcCreationError}
        onChangeDraft={setNpcCreationDraft}
        onSubmit={handleCreateNpcActor}
        onClose={() => {
          setIsNpcCreationModalOpen(false);
          setNpcCreationError(null);
        }}
      />

      <CharacterBuilderModal
        isOpen={isCharacterBuilderOpen}
        activeStepId={activeCharacterBuilderStep}
        draft={characterBuilderDraft}
        options={characterBuilderOptions}
        isLoadingOptions={isLoadingCharacterBuilderOptions}
        optionsError={characterBuilderOptionsError}
        savedCharacterSheetId={savedCharacterSheetId}
        savedCharacterSheetStatus={savedCharacterSheetStatus}
        isSavingDraft={isSavingCharacterDraft}
        isFinalizingSheet={isFinalizingCharacterSheet}
        saveError={characterDraftSaveError}
        saveSuccess={characterDraftSaveSuccess}
        onSaveDraft={handleSaveCharacterBuilderDraft}
        onFinalizeSheet={handleFinalizeCharacterSheet}
        onChangeDraft={setCharacterBuilderDraft}
        onSelectOption={handleSelectCharacterBuilderOption}
        onChangeStep={setActiveCharacterBuilderStep}
        onClose={() => setIsCharacterBuilderOpen(false)}
      />

      {isLibraryModalOpen ? (
        <ActorLibraryModal
          actors={libraryActors}
          onBringToTable={handleBringActorToTable}
          onClose={() => setIsLibraryModalOpen(false)}
        />
      ) : null}

      {actionActor ? (
        <ActorActionModal
          actor={actionActor}
          isGM={isGM}
          canOpenSheet={canOpenActorSheet(actionActor)}
          canCreateToken={canCreateTokenForActor(actionActor)}
          sceneTokens={sceneTokens.filter(
            (token) => token.actorId === actionActor.id,
          )}
          tokenSizeOptions={TOKEN_SIZE_OPTIONS}
          onOpenSheet={() => {
            setSelectedActor(actionActor);
            setActionActor(null);

            if (
              actionActor.type === "PLAYER_CHARACTER" &&
              characterBuilderOptions.skills.length === 0
            ) {
              void handleLoadCharacterBuilderOptions();
            }
          }}
          onAddToken={async () => {
            await handleAddTokenToScene(actionActor);
          }}
          onRemoveToken={handleRemoveTokenFromScene}
          onChangeTokenSize={async (gridSize: number) => {
            await handleChangeActorTokenSize(actionActor, gridSize);
          }}
          onReturnToLibrary={async () => {
            await handleReturnActorToLibrary(actionActor);
          }}
          onClose={() => setActionActor(null)}
        />
      ) : null}

      {selectedActor ? (
        <ActorSheetModal
          actor={selectedActor}
          characterSheet={getCharacterSheetByActor(selectedActor)}
          allSkills={characterBuilderOptions.skills}
          isGM={isGM}
          isSavingCharacterSheetImages={isSavingCharacterSheetImages}
          onUpdateCharacterSheetImages={handleUpdateCharacterSheetImages}
          onRollSheetAction={handleReadySheetRoll}
          onClose={() => setSelectedActor(null)}
        />
      ) : null}

      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-forge-gold/50 bg-[#120816] p-6 shadow-[-16px_16px_0_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/40">
                  Confirmar saída
                </p>

                <h2 className="mt-2 text-2xl font-black text-forge-gold">
                  Sair da mesa?
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsExitModalOpen(false)}
                className="text-xl font-black text-white/50 transition hover:text-forge-gold"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm font-semibold leading-relaxed text-white/65">
              Você está prestes a sair da mesa da aventura. Nenhuma alteração
              será perdida, mas você voltará para suas campanhas.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsExitModalOpen(false)}
                className="rounded-lg border border-white/15 px-4 py-3 text-sm font-black text-white/70 transition hover:border-forge-gold hover:text-forge-gold"
              >
                Continuar na mesa
              </button>

              <Link
                href="/campaigns"
                className="rounded-lg border border-forge-gold bg-forge-purple px-4 py-3 text-sm font-black text-forge-gold transition hover:bg-[#4d0d63]"
              >
                Sair da mesa
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
function ActorSheetModal({
  actor,
  characterSheet,
  allSkills,
  isGM,
  isSavingCharacterSheetImages,
  onUpdateCharacterSheetImages,
  onRollSheetAction,
  onClose,
}: {
  actor: CampaignActor;
  characterSheet: CharacterReadySheet | null;
  allSkills: CharacterBuilderOptions["skills"];
  isGM: boolean;
  isSavingCharacterSheetImages: boolean;
  onUpdateCharacterSheetImages: (
    characterSheetId: string,
    data: {
      portraitUrl: string | null;
      tokenImageUrl: string | null;
      tokenImageFit: CharacterReadySheet["tokenImageFit"];
    },
  ) => Promise<void>;
  onRollSheetAction: (request: CharacterReadySheetRollRequest) => void;
  onClose: () => void;
}) {
  const isPlayerCharacter = actor.type === "PLAYER_CHARACTER";
  const isNpc = actor.type === "NPC";
  const isCreature = actor.type === "CREATURE";

  if (isPlayerCharacter) {
    return (
      <CharacterReadySheetModal
        actor={actor}
        characterSheet={characterSheet}
        allSkills={allSkills}
        isGM={isGM}
        isSavingImages={isSavingCharacterSheetImages}
        onSaveImages={onUpdateCharacterSheetImages}
        onRollSheetAction={onRollSheetAction}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-forge-gold/50 bg-[#120816] shadow-[-18px_18px_0_rgba(0,0,0,0.5)]">
        <div className="flex items-start justify-between gap-4 border-b border-forge-gold/25 bg-[#1a0d20] p-5">
          <div className="flex min-w-0 items-center gap-4">
            {actor.portraitUrl ? (
              <div
                className="h-16 w-16 shrink-0 rounded-xl border border-forge-gold/40 bg-cover bg-center shadow-[-5px_5px_0_rgba(0,0,0,0.35)]"
                style={{
                  backgroundImage: `url(${actor.portraitUrl})`,
                }}
                aria-hidden="true"
              />
            ) : (
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border text-2xl font-black shadow-[-5px_5px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
                  actor.type,
                )}`}
              >
                {actor.initials}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Ficha
              </p>

              <h2 className="mt-1 truncate text-2xl font-black text-forge-gold">
                {actor.name}
              </h2>

              <p className="mt-1 text-xs font-semibold text-white/55">
                {actor.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-2xl font-black text-white/45 transition hover:text-forge-gold"
            aria-label="Fechar ficha"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-[1fr_280px]">
          <section className="rounded-xl border border-white/10 bg-black/25 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
              Resumo
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SheetStat
                label="Tipo"
                value={getCharacterTypeLabel(actor.type)}
              />

              <SheetStat
                label="Dono"
                value={actor.ownerId ? "Vinculado a jogador" : "Sem dono"}
              />

              <SheetStat
                label="Nível"
                value={isPlayerCharacter ? "1" : isCreature ? "?" : "—"}
              />

              <SheetStat
                label="Estado"
                value={isPlayerCharacter ? "Ativo" : "Disponível"}
              />
            </div>

            <div className="mt-5 rounded-xl border border-forge-gold/20 bg-forge-purple/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
                Observação
              </p>

              <p className="mt-2 text-xs font-semibold leading-relaxed text-white/65">
                Esta é uma ficha temporária de layout. Depois ela será ligada ao
                banco, atributos, perícias, magias, inventário e histórico do
                personagem.
              </p>
            </div>
          </section>

          <aside className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                Ações
              </p>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  className="w-full rounded-lg border border-forge-gold/50 px-4 py-3 text-xs font-black text-forge-gold transition hover:bg-forge-purple"
                >
                  Abrir ficha completa
                </button>

                {isGM && (
                  <button
                    type="button"
                    className="w-full rounded-lg border border-white/10 px-4 py-3 text-xs font-black text-white/55 transition hover:border-forge-gold hover:text-forge-gold"
                  >
                    Editar ficha
                  </button>
                )}

                {isGM && (isNpc || isCreature) && (
                  <button
                    type="button"
                    className="w-full rounded-lg border border-red-500/40 px-4 py-3 text-xs font-black text-red-300 transition hover:bg-red-950/40"
                  >
                    Excluir registro
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                IA sugestiva
              </p>

              <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
                Depois: ajuda opcional para magias, truques e sugestões de
                montagem quando o usuário pedir.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SheetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
