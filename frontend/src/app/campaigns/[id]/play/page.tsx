"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, PointerEvent, SetStateAction } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import type {
  CharacterAttributeKey,
  CharacterBuilderDraft,
  CharacterBuilderOptions,
  CharacterReadySheet,
  CharacterSheetLevelUpConfirmationPayload,
  CharacterSheetStatus,
} from "@/features/character-builder/types/character-builder-types";

import { DEFAULT_CHARACTER_ATTRIBUTES } from "@/features/character-builder/constants/character-builder-constants";

import { getPersistableCharacterAttributes } from "@/features/character-builder/utils/attributes";

import {
  getRequiredCharacterProgressionChoices,
  synchronizeCharacterProgressionChoices,
} from "@/features/character-builder/utils/progression-choices";

import { getInitiativeBonus } from "@/features/character-builder/utils/character-sheet-calculations";

import {
  getStartingEquipmentItemsFromDraft,
  getStartingGoldFromDraft,
} from "@/features/character-builder/utils/equipment";

import type {
  Campaign,
  CampaignActor,
  CampaignParticipant,
  ChatMessage,
  ChatMode,
  DiceTerm,
  RightPanelTab,
  RollAdvantageState,
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
  confirmCampaignCharacterSheetLevelUp,
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
import { CharacterBuilderModal } from "@/features/character-builder/components/CharacterBuilderModal";

import {
  CharacterReadySheetModal,
  type CharacterReadySheetRollRequest,
} from "@/features/character-builder/components/CharacterReadySheetModal";

type CharacterSheetPopoutMessage = {
  source: "legendforge-sheet-popout";
  type: "ROLL_SHEET_ACTION";
  payload: CharacterReadySheetRollRequest;
};

function isCharacterSheetPopoutMessage(
  value: unknown,
): value is CharacterSheetPopoutMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<CharacterSheetPopoutMessage>;

  return (
    message.source === "legendforge-sheet-popout" &&
    message.type === "ROLL_SHEET_ACTION" &&
    Boolean(message.payload)
  );
}

const DEFAULT_TABLE_CHAT_MESSAGE: ChatMessage = {
  id: "system-welcome",
  author: "Sistema",
  kind: "system",
  content: "A mesa foi aberta. A aventura aguarda os jogadores.",
};

function getTableChatStorageKey(campaignId: string) {
  return `legendforge:campaign:${campaignId}:chat`;
}

function loadStoredTableChatMessages(campaignId: string): ChatMessage[] {
  if (typeof window === "undefined") {
    return [DEFAULT_TABLE_CHAT_MESSAGE];
  }

  const storedMessages = window.sessionStorage.getItem(
    getTableChatStorageKey(campaignId),
  );

  if (!storedMessages) {
    return [DEFAULT_TABLE_CHAT_MESSAGE];
  }

  try {
    const parsedMessages = JSON.parse(storedMessages);

    if (!Array.isArray(parsedMessages)) {
      return [DEFAULT_TABLE_CHAT_MESSAGE];
    }

    const validMessages = parsedMessages.filter(
      (message): message is ChatMessage => {
        if (!message || typeof message !== "object") {
          return false;
        }

        const partialMessage = message as Partial<ChatMessage>;

        return (
          typeof partialMessage.id === "string" &&
          typeof partialMessage.author === "string" &&
          typeof partialMessage.content === "string" &&
          (partialMessage.kind === "system" ||
            partialMessage.kind === "user" ||
            partialMessage.kind === "roll" ||
            partialMessage.kind === "whisper")
        );
      },
    );

    return validMessages.length > 0
      ? validMessages
      : [DEFAULT_TABLE_CHAT_MESSAGE];
  } catch {
    return [DEFAULT_TABLE_CHAT_MESSAGE];
  }
}

const TOKEN_GRID_SIZE_IN_PIXELS = 40;

const TOKEN_SIZE_OPTIONS = [
  {
    id: "small-medium",
    label: "Pequeno / Médio",
    description: "1x1",
    gridSize: 1,
  },
  {
    id: "large",
    label: "Grande",
    description: "2x2",
    gridSize: 2,
  },
  {
    id: "huge",
    label: "Enorme",
    description: "3x3",
    gridSize: 3,
  },
  {
    id: "gargantuan",
    label: "Colossal",
    description: "4x4",
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
    level: 1,

    classId: "",
    className: "",
    classEntries: [],

    ancestryId: "",
    ancestryName: "",

    backgroundId: "",
    backgroundName: "",
    languageKeys: [],

    attributes: { ...DEFAULT_CHARACTER_ATTRIBUTES },
    skillKeys: [],
    spellKeys: [],
    featureChoiceSelections: [],
    progressionChoices: [],
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
    organizations: "",
    allies: "",
    enemies: "",
    notes: "",
    otherNotes: "",
    gmNotes: "",
  };
}

function getPersistableCharacterProgressionChoices(
  draft: CharacterBuilderDraft,
) {
  return draft.progressionChoices.map((choice) => {
    const classEntry = draft.classEntries.find((currentClassEntry) => {
      return currentClassEntry.id === choice.classEntryId;
    });

    if (!classEntry) {
      throw new Error(
        `Não foi possível localizar a classe do marco de nível ${choice.classLevel}.`,
      );
    }

    return {
      classId: classEntry.classId,
      classLevel: choice.classLevel,
      choiceIndex: choice.choiceIndex,
      type: choice.type,
      attributeIncreaseMode: choice.attributeIncreaseMode,
      attributeIncreases: {
        ...choice.attributeIncreases,
      },
      talentId: choice.talentId,
    };
  });
}

function getCharacterBuilderClassEntriesFromSheet(
  sheet: CharacterReadySheet,
): CharacterBuilderDraft["classEntries"] {
  if (sheet.classes && sheet.classes.length > 0) {
    return sheet.classes.map((classEntry, index) => ({
      id: classEntry.id,
      classId: classEntry.classId,
      className: classEntry.characterClass.name,
      subclassId: classEntry.subclassId,
      subclassName: classEntry.subclass?.name ?? null,
      level: classEntry.level,
      isPrimary: classEntry.isPrimary,
      order: classEntry.order ?? index,
    }));
  }

  if (!sheet.characterClass) {
    return [];
  }

  return [
    {
      id: "primary",
      classId: sheet.characterClass.id,
      className: sheet.characterClass.name,
      subclassId: sheet.subclass?.id ?? null,
      subclassName: sheet.subclass?.name ?? null,
      level: sheet.level,
      isPrimary: true,
      order: 0,
    },
  ];
}

function getCharacterBuilderProgressionChoicesFromSheet(
  sheet: CharacterReadySheet,
  classEntries: CharacterBuilderDraft["classEntries"],
): CharacterBuilderDraft["progressionChoices"] {
  return (sheet.progressionChoices ?? [])
    .map((progressionChoice) => {
      const classEntry = classEntries.find((currentClassEntry) => {
        return currentClassEntry.classId === progressionChoice.classId;
      });

      if (!classEntry) {
        return null;
      }

      return {
        classEntryId: classEntry.id,
        classId: progressionChoice.classId,
        className:
          progressionChoice.characterClass?.name ?? classEntry.className,
        classLevel: progressionChoice.classLevel,
        choiceIndex: progressionChoice.choiceIndex,

        type: progressionChoice.type,

        attributeIncreaseMode:
          progressionChoice.attributeIncreaseMode,
        attributeIncreases: {
          ...progressionChoice.attributeIncreases,
        },

        talentId: progressionChoice.talentId,
      };
    })
    .filter(
      (
        progressionChoice,
      ): progressionChoice is CharacterBuilderDraft["progressionChoices"][number] => {
        return progressionChoice !== null;
      },
    );
}

function createCharacterBuilderDraftFromSheet(
  sheet: CharacterReadySheet,
): CharacterBuilderDraft {
  const classEntries = getCharacterBuilderClassEntriesFromSheet(sheet);

  const progressionChoices =
    getCharacterBuilderProgressionChoicesFromSheet(
      sheet,
      classEntries,
    );

  const primaryClassEntry =
    classEntries.find((classEntry) => classEntry.isPrimary) ??
    classEntries[0] ??
    null;

  const totalLevel =
    classEntries.length > 0
      ? Math.max(
          1,
          Math.min(
            20,
            classEntries.reduce(
              (currentTotal, classEntry) => currentTotal + classEntry.level,
              0,
            ),
          ),
        )
      : sheet.level;

  const attributes: CharacterBuilderDraft["attributes"] = {
    ...DEFAULT_CHARACTER_ATTRIBUTES,
  };

  for (const statEntry of sheet.stats) {
    const statKey = statEntry.stat.key;

    if (statKey in attributes) {
      attributes[statKey as CharacterAttributeKey] = statEntry.baseValue;
    }
  }

  return {
    name: sheet.name ?? "",
    pronouns: sheet.pronouns ?? "",
    concept: sheet.concept ?? "",
    portraitUrl: sheet.portraitUrl ?? "",
    tokenImageUrl: sheet.tokenImageUrl ?? "",
    tokenImageFit: sheet.tokenImageFit ?? "FILL",
    level: totalLevel,

    classId: primaryClassEntry?.classId ?? sheet.characterClass?.id ?? "",
    className: primaryClassEntry?.className ?? sheet.characterClass?.name ?? "",
    classEntries,

    ancestryId: sheet.ancestry?.id ?? "",
    ancestryName: sheet.ancestry?.name ?? "",

    backgroundId: sheet.background?.id ?? "",
    backgroundName: sheet.background?.name ?? "",
    languageKeys: sheet.languages
      .filter((languageEntry) => languageEntry.source === "builder")
      .map((languageEntry) => {
        return languageEntry.language.key;
      }),

    attributes,
    skillKeys: sheet.skills
      .filter((skillEntry) => skillEntry.isProficient)
      .map((skillEntry) => skillEntry.skill.key),
    spellKeys: sheet.spells.map((spellEntry) => spellEntry.spell.key),
    featureChoiceSelections: (sheet.featureChoices ?? [])
      .filter((featureChoice) => featureChoice.source === "builder")
      .map((featureChoice) => ({
        choiceGroupId: featureChoice.choiceGroupId,
        featureId: featureChoice.featureId,
      })),
    progressionChoices,
    equipmentItems: sheet.equipment.map((equipmentEntry) => ({
      key: equipmentEntry.equipment.key,
      quantity: equipmentEntry.quantity,
      source: equipmentEntry.source === "background" ? "background" : "class",
      notes: equipmentEntry.notes ?? undefined,
      isEquipped: equipmentEntry.isEquipped,
    })),
    classEquipmentMode: sheet.classEquipmentMode,
    backgroundEquipmentMode: sheet.backgroundEquipmentMode,
    startingGold: sheet.startingGold,

    alignment: sheet.alignment ?? "",
    faith: sheet.faith ?? "",
    lifestyle: sheet.lifestyle ?? "",

    hair: sheet.hair ?? "",
    skin: sheet.skin ?? "",
    eyes: sheet.eyes ?? "",
    height: sheet.height ?? "",
    weight: sheet.weight ?? "",
    age: sheet.age ?? "",
    gender: sheet.gender ?? "",

    bonds: sheet.bonds ?? "",
    flaws: sheet.flaws ?? "",
    ideals: sheet.ideals ?? "",
    personality: sheet.personality ?? "",
    backstory: sheet.backstory ?? "",
    organizations: sheet.organizations ?? "",
    allies: sheet.allies ?? "",
    enemies: sheet.enemies ?? "",
    notes: sheet.notes ?? "",
    otherNotes: sheet.otherNotes ?? "",
    gmNotes: sheet.gmNotes ?? "",
  };
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
      features: [],
      talents: [],
      featureChoiceGroups: [],
      equipment: [],
      languages: [],
    });
  const [
    isLoadingCharacterBuilderOptions,
    setIsLoadingCharacterBuilderOptions,
  ] = useState(false);
  const [characterBuilderOptionsError, setCharacterBuilderOptionsError] =
    useState<string | null>(null);
  function synchronizeProgressionChoicesForDraft(
    draft: CharacterBuilderDraft,
    classes = characterBuilderOptions.classes,
  ): CharacterBuilderDraft {
    const requiredChoices = getRequiredCharacterProgressionChoices({
      classEntries: draft.classEntries,
      classes,
    });

    const progressionChoices = synchronizeCharacterProgressionChoices({
      requiredChoices,
      currentChoices: draft.progressionChoices,
    });

    if (progressionChoices === draft.progressionChoices) {
      return draft;
    }

    return {
      ...draft,
      progressionChoices,
    };
  }

  function handleChangeCharacterBuilderDraft(
    action: SetStateAction<CharacterBuilderDraft>,
  ) {
    setCharacterBuilderDraft((currentDraft) => {
      const nextDraft =
        typeof action === "function" ? action(currentDraft) : action;

      return synchronizeProgressionChoicesForDraft(nextDraft);
    });
  }
  const [zoom, setZoom] = useState(90);
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

  const [isConfirmingLevelUp, setIsConfirmingLevelUp] = useState(false);
  const [levelUpError, setLevelUpError] = useState<string | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<ChatMode>("public");
  const [whisperTargetId, setWhisperTargetId] = useState("");
  const [chatError, setChatError] = useState("");

  const [diceExpression, setDiceExpression] = useState("1d20");
  const [rollVisibility, setRollVisibility] =
    useState<RollVisibility>("private");
  const [rollError, setRollError] = useState("");
  const [customDiceSides, setCustomDiceSides] = useState(30);
  const [rollAdvantages, setRollAdvantages] = useState(0);
  const [rollDisadvantages, setRollDisadvantages] = useState(0);

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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    loadStoredTableChatMessages(params.id),
  );

  useEffect(() => {
    window.sessionStorage.setItem(
      getTableChatStorageKey(params.id),
      JSON.stringify(chatMessages),
    );
  }, [chatMessages, params.id]);

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

  const currentUserCharacterDraft = user
    ? (characterSheets.find(
        (characterSheet) =>
          characterSheet.status === "DRAFT" &&
          characterSheet.ownerId === user.id,
      ) ?? null)
    : null;

  const hasCurrentUserCharacterDraft = currentUserCharacterDraft !== null;

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

  async function handleConfirmCharacterSheetLevelUp(
    data: CharacterSheetLevelUpConfirmationPayload,
  ) {
    const selectedSheet = selectedActor
      ? getCharacterSheetByActor(selectedActor)
      : null;

    if (!selectedSheet) {
      setLevelUpError("Ficha não encontrada para confirmar Level Up.");
      return;
    }

    setIsConfirmingLevelUp(true);
    setLevelUpError(null);

    try {
      const updatedCharacterSheet = await confirmCampaignCharacterSheetLevelUp(
        params.id,
        selectedSheet.id,
        data,
      );

      setCharacterSheets((currentSheets) =>
        currentSheets.map((currentSheet) =>
          currentSheet.id === updatedCharacterSheet.id
            ? updatedCharacterSheet
            : currentSheet,
        ),
      );
    } catch (error) {
      setLevelUpError(
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar Level Up.",
      );
    } finally {
      setIsConfirmingLevelUp(false);
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

  function handleClearChat() {
    setChatError("");
    setChatInput("");
    setChatMessages([DEFAULT_TABLE_CHAT_MESSAGE]);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        getTableChatStorageKey(params.id),
        JSON.stringify([DEFAULT_TABLE_CHAT_MESSAGE]),
      );
    }
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

  const publishRollToChat = useCallback(
    (roll: RollResult, rollLabel?: string) => {
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
    },
    [],
  );

  const handleRoll = useCallback(
    (
      rollExpression: string,
      visibility: RollVisibility,
      rollLabel?: string,
      advantageState?: RollAdvantageState,
    ) => {
      if (!user) {
        return;
      }

      setRollError("");

      try {
        const author = getDisplayName(user);
        const roll = rollDiceExpression(rollExpression, author, advantageState);

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
    },
    [isGM, publishRollToChat, user],
  );

  function getManualRollAdvantageState(): RollAdvantageState {
    return {
      advantages: rollAdvantages,
      disadvantages: rollDisadvantages,
    };
  }

  function resetRollAdvantageState() {
    setRollAdvantages(0);
    setRollDisadvantages(0);
  }

  function getFirstD20RollFromBreakdown(breakdown: string) {
    const d20Match = breakdown.match(/1d20 \[(\d+)\]/);

    if (!d20Match) {
      return null;
    }

    const d20Value = Number(d20Match[1]);

    return Number.isFinite(d20Value) ? d20Value : null;
  }

  function getDeathSaveOutcome(naturalD20: number, total: number) {
    if (naturalD20 === 1) {
      return "Morte.";
    }

    if (naturalD20 === 20) {
      return "Meia vida e Retorno desesperado.";
    }

    if (total <= 5) {
      return "Morte ou consequência grave.";
    }

    if (total <= 9) {
      return "Sobrevive por um fio.";
    }

    if (total <= 14) {
      return "Instável.";
    }

    return "Estável.";
  }

  function getDeathSaveBreakdown(roll: RollResult, naturalD20: number) {
    const advantageModifier = roll.total - naturalD20;

    if (advantageModifier === 0) {
      return `Rolagem: ${naturalD20}`;
    }

    return `Rolagem: ${naturalD20}\nVantagem/desvantagem: ${
      advantageModifier > 0 ? "+" : ""
    }${advantageModifier}`;
  }

  function handleRollExpression(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    handleRoll(
      diceExpression,
      isGM ? rollVisibility : "public",
      undefined,
      getManualRollAdvantageState(),
    );

    resetRollAdvantageState();
  }

  function handleRollCustomBuilder() {
    handleRoll(
      customExpression,
      isGM ? rollVisibility : "public",
      undefined,
      getManualRollAdvantageState(),
    );

    resetRollAdvantageState();
  }

  function handleQuickRoll(expression: string) {
    handleRoll(
      expression,
      isGM ? rollVisibility : "public",
      undefined,
      getManualRollAdvantageState(),
    );

    resetRollAdvantageState();
  }

  function handleRollDeathSave() {
    if (!user) {
      return;
    }

    setRollError("");

    try {
      const author = getDisplayName(user);
      const roll = rollDiceExpression("1d20", author, {
        advantages: rollAdvantages,
        disadvantages: rollDisadvantages,
      });

      const naturalD20 = getFirstD20RollFromBreakdown(roll.breakdown);

      if (naturalD20 === null) {
        throw new Error(
          "Não foi possível interpretar o d20 do teste de morte.",
        );
      }

      const outcome = getDeathSaveOutcome(naturalD20, roll.total);

      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createId(),
          author,
          kind: "roll",
          content: `Teste de Morte — ${outcome}`,
          dice: "1d20 — Teste de Morte",
          result: roll.total,
          displayResult: String(roll.total),
          breakdown: getDeathSaveBreakdown(roll, naturalD20),
        },
      ]);

      resetRollAdvantageState();
      setActiveRightTab("chat");
    } catch (error) {
      setRollError(
        error instanceof Error
          ? error.message
          : "Não foi possível rolar o teste de morte.",
      );
    }
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

  const handleReadySheetRoll = useCallback(
    (request: CharacterReadySheetRollRequest) => {
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

      handleRoll(`1d20${modifierExpression}`, "public", request.label, {
        advantages: rollAdvantages,
        disadvantages: rollDisadvantages,
      });

      resetRollAdvantageState();
      setActiveRightTab("chat");
    },
    [handleRoll, rollAdvantages, rollDisadvantages, user],
  );

  useEffect(() => {
    function handleCharacterSheetPopoutMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (!isCharacterSheetPopoutMessage(event.data)) {
        return;
      }

      handleReadySheetRoll(event.data.payload);
    }

    window.addEventListener("message", handleCharacterSheetPopoutMessage);

    return () => {
      window.removeEventListener("message", handleCharacterSheetPopoutMessage);
    };
  }, [handleReadySheetRoll]);

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

    const defaultTokenSize = getTokenSizeInPixels(1);

    try {
      const createdToken = await createSceneToken(campaign.id, actor.id, {
        x: nextX,
        y: nextY,
        width: defaultTokenSize,
        height: defaultTokenSize,
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

    const tokensFromActor = sceneTokens.filter(
      (sceneToken) => sceneToken.actorId === actor.id,
    );

    try {
      const updatedActor = await updateCampaignActor(campaign.id, actor.id, {
        location: "LIBRARY",
      });

      if (tokensFromActor.length > 0) {
        await Promise.all(
          tokensFromActor.map((token) =>
            deleteSceneToken(campaign.id, token.id),
          ),
        );
      }

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

      setActionMessage(
        tokensFromActor.length > 0
          ? `${updatedActor.name} voltou para a biblioteca e seus tokens foram removidos da cena.`
          : `${updatedActor.name} voltou para a biblioteca.`,
      );
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

      const nextCharacterBuilderOptions: CharacterBuilderOptions = {
        classes: data.classes ?? [],
        ancestries: data.ancestries ?? [],
        backgrounds: data.backgrounds ?? [],
        skills: data.skills ?? [],
        spells: data.spells ?? [],
        features: data.features ?? [],
        talents: data.talents ?? [],
        featureChoiceGroups: data.featureChoiceGroups ?? [],
        equipment: data.equipment ?? [],
        languages: data.languages ?? [],
      };

      setCharacterBuilderOptions(nextCharacterBuilderOptions);

      setCharacterBuilderDraft((currentDraft) => {
        return synchronizeProgressionChoicesForDraft(
          currentDraft,
          nextCharacterBuilderOptions.classes,
        );
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

  function continueCharacterBuilderDraft() {
    if (!currentUserCharacterDraft) {
      setActionError(
        "Nenhum rascunho de personagem foi encontrado para você nesta campanha.",
      );
      return;
    }

    if (currentUserCharacterDraft.status !== "DRAFT") {
      setActionError(
        "A ficha encontrada já foi finalizada e não pode ser aberta como rascunho.",
      );
      return;
    }

    setCharacterBuilderDraft(
      createCharacterBuilderDraftFromSheet(currentUserCharacterDraft),
    );
    setSavedCharacterSheetId(currentUserCharacterDraft.id);
    setSavedCharacterSheetStatus("DRAFT");
    setCharacterDraftSaveError(null);
    setCharacterDraftSaveSuccess(null);
    setIsSavingCharacterDraft(false);
    setIsFinalizingCharacterSheet(false);
    setCharacterBuilderOptionsError(null);
    setActionError("");

    setIsCharacterCreationMenuOpen(false);
    setActiveCharacterBuilderStep("concept");
    setIsCharacterBuilderOpen(true);

    void handleLoadCharacterBuilderOptions();
  }

  function handleOpenCharacterCreationEntryPoint() {
    setIsCharacterCreationMenuOpen(true);
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
        return currentDraft;
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
          languageKeys: isChangingBackground ? [] : currentDraft.languageKeys,
        };
      }

      return currentDraft;
    });
  }

  async function persistCharacterBuilderDraft() {
    if (!campaign) {
      throw new Error("Campanha não encontrada.");
    }

    if (!campaign.systemId) {
      throw new Error("Esta campanha ainda não possui um sistema definido.");
    }

    const trimmedName = characterBuilderDraft.name.trim();

    if (!trimmedName) {
      throw new Error("Informe o nome do personagem antes de salvar.");
    }

    if (savedCharacterSheetStatus === "READY") {
      throw new Error(
        "Esta ficha já foi finalizada e não pode ser aberta ou salva como rascunho.",
      );
    }

    const existingSheetId = savedCharacterSheetId;

    const requestUrl = existingSheetId
      ? `http://localhost:8081/campaigns/${campaign.id}/character-sheets/${existingSheetId}`
      : `http://localhost:8081/campaigns/${campaign.id}/character-sheets`;

    const requestMethod = existingSheetId ? "PATCH" : "POST";

    const progressionChoices = getPersistableCharacterProgressionChoices(
      characterBuilderDraft,
    );

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
        portraitUrl: existingSheetId
          ? characterBuilderDraft.portraitUrl.trim() || null
          : characterBuilderDraft.portraitUrl.trim(),
        tokenImageUrl: existingSheetId
          ? characterBuilderDraft.tokenImageUrl.trim() || null
          : characterBuilderDraft.tokenImageUrl.trim(),
        tokenImageFit: characterBuilderDraft.tokenImageFit,
        level: characterBuilderDraft.level,
        classId: characterBuilderDraft.classId || null,
        classEntries: characterBuilderDraft.classEntries.map(
          (classEntry, index) => ({
            classId: classEntry.classId,
            subclassId: classEntry.subclassId,
            level: classEntry.level,
            isPrimary: classEntry.isPrimary,
            order: index,
          }),
        ),
        ancestryId: characterBuilderDraft.ancestryId || null,
        backgroundId: characterBuilderDraft.backgroundId || null,
        attributes: getPersistableCharacterAttributes(
          characterBuilderDraft.attributes,
        ),
        skillKeys: characterBuilderDraft.skillKeys,
        spellKeys: characterBuilderDraft.spellKeys,
        languageKeys: characterBuilderDraft.languageKeys,
        featureChoiceSelections: characterBuilderDraft.featureChoiceSelections,
        progressionChoices,
        equipmentItems: getStartingEquipmentItemsFromDraft(
          characterBuilderDraft,
          characterBuilderOptions,
        ),
        classEquipmentMode: characterBuilderDraft.classEquipmentMode,
        backgroundEquipmentMode: characterBuilderDraft.backgroundEquipmentMode,
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
        organizations: characterBuilderDraft.organizations.trim(),
        allies: characterBuilderDraft.allies.trim(),
        enemies: characterBuilderDraft.enemies.trim(),
        notes: characterBuilderDraft.notes.trim(),
        otherNotes: characterBuilderDraft.otherNotes.trim(),
        gmNotes: characterBuilderDraft.gmNotes.trim(),
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message ?? "Não foi possível salvar o rascunho.");
    }

    const persistedSheet = data.characterSheet as CharacterReadySheet;

    setSavedCharacterSheetId(persistedSheet.id);
    setSavedCharacterSheetStatus(persistedSheet.status ?? "DRAFT");
    setCharacterBuilderDraft(
      createCharacterBuilderDraftFromSheet(persistedSheet),
    );

    setCharacterSheets((currentSheets) => {
      const alreadyExists = currentSheets.some(
        (sheet) => sheet.id === persistedSheet.id,
      );

      if (alreadyExists) {
        return currentSheets.map((sheet) =>
          sheet.id === persistedSheet.id ? persistedSheet : sheet,
        );
      }

      return [persistedSheet, ...currentSheets];
    });

    return {
      persistedSheet,
      wasExistingDraft: Boolean(existingSheetId),
    };
  }

  async function handleSaveCharacterBuilderDraft() {
    setIsSavingCharacterDraft(true);
    setCharacterDraftSaveError(null);
    setCharacterDraftSaveSuccess(null);

    try {
      const { wasExistingDraft } = await persistCharacterBuilderDraft();

      setCharacterDraftSaveSuccess(
        wasExistingDraft
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

    setIsFinalizingCharacterSheet(true);
    setCharacterDraftSaveError(null);
    setCharacterDraftSaveSuccess(null);

    try {
      const progressionChoices = getPersistableCharacterProgressionChoices(
        characterBuilderDraft,
      );

      const { persistedSheet } = await persistCharacterBuilderDraft();

      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}/character-sheets/${persistedSheet.id}/finalize`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            progressionChoices,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detailedErrors = Array.isArray(data?.errors)
          ? data.errors.join(" ")
          : "";

        throw new Error(
          detailedErrors
            ? `${
                data?.message ?? "Não foi possível finalizar a ficha."
              } ${detailedErrors}`
            : (data?.message ?? "Não foi possível finalizar a ficha."),
        );
      }

      const finalizedSheet = data.characterSheet as CharacterReadySheet;

      setSavedCharacterSheetId(finalizedSheet.id);
      setSavedCharacterSheetStatus("READY");
      setCharacterBuilderDraft(
        createCharacterBuilderDraftFromSheet(finalizedSheet),
      );

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

      setActiveRightTab("characters");
      setIsCharacterBuilderOpen(false);
      setIsCharacterCreationMenuOpen(false);

      setCharacterBuilderDraft(createEmptyCharacterBuilderDraft());
      setSavedCharacterSheetId(null);
      setSavedCharacterSheetStatus(null);
      setActiveCharacterBuilderStep("concept");

      setCharacterDraftSaveError(null);
      setCharacterDraftSaveSuccess(null);
      setIsSavingCharacterDraft(false);

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
            <div
              className={
                activeRightTab === "chat"
                  ? "min-h-0 flex-1 overflow-hidden text-[13px]"
                  : "min-h-0 flex-1 overflow-y-auto p-4 text-[13px]"
              }
            >
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
                  onClearChat={handleClearChat}
                />
              )}

              {activeRightTab === "rolls" && (
                <TableRollsPanel
                  isGM={isGM}
                  diceExpression={diceExpression}
                  rollVisibility={rollVisibility}
                  rollError={rollError}
                  customDiceSides={customDiceSides}
                  rollAdvantages={rollAdvantages}
                  rollDisadvantages={rollDisadvantages}
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
                  onChangeRollAdvantages={setRollAdvantages}
                  onChangeRollDisadvantages={setRollDisadvantages}
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
                  onRollDeathSave={handleRollDeathSave}
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
                  onOpenCharacterCreationMenu={
                    handleOpenCharacterCreationEntryPoint
                  }
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
                  onOpenCharacterCreationMenu={
                    handleOpenCharacterCreationEntryPoint
                  }
                />
              )}
            </div>
          </TableRightPanel>
        </div>
      </div>

      <CharacterCreationMenuModal
        isOpen={isCharacterCreationMenuOpen}
        isGM={isGM}
        hasCharacterDraft={hasCurrentUserCharacterDraft}
        onClose={() => setIsCharacterCreationMenuOpen(false)}
        onStartNewCharacter={startCharacterBuilderCreation}
        onContinueCharacterDraft={continueCharacterBuilderDraft}
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
        onChangeDraft={handleChangeCharacterBuilderDraft}
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
            const actorCharacterSheet = getCharacterSheetByActor(actionActor);

            if (
              actionActor.type === "PLAYER_CHARACTER" &&
              actorCharacterSheet
            ) {
              window.open(
                `/campaigns/${actionActor.campaignId}/sheets/${actorCharacterSheet.id}`,
                `legendforge-sheet-${actorCharacterSheet.id}`,
                "width=1280,height=860",
              );

              setActionActor(null);

              if (characterBuilderOptions.skills.length === 0) {
                void handleLoadCharacterBuilderOptions();
              }

              return;
            }

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
          isConfirmingLevelUp={isConfirmingLevelUp}
          levelUpError={levelUpError}
          onUpdateCharacterSheetImages={handleUpdateCharacterSheetImages}
          onConfirmLevelUp={handleConfirmCharacterSheetLevelUp}
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
  isConfirmingLevelUp,
  levelUpError,
  onUpdateCharacterSheetImages,
  onConfirmLevelUp,
  onRollSheetAction,
  onClose,
}: {
  actor: CampaignActor;
  characterSheet: CharacterReadySheet | null;
  allSkills: CharacterBuilderOptions["skills"];
  isGM: boolean;
  isSavingCharacterSheetImages: boolean;
  isConfirmingLevelUp: boolean;
  levelUpError: string | null;
  onUpdateCharacterSheetImages: (
    characterSheetId: string,
    data: {
      portraitUrl: string | null;
      tokenImageUrl: string | null;
      tokenImageFit: CharacterReadySheet["tokenImageFit"];
    },
  ) => Promise<void>;
  onConfirmLevelUp: (
    data: CharacterSheetLevelUpConfirmationPayload,
  ) => Promise<void>;
  onRollSheetAction: (request: CharacterReadySheetRollRequest) => void;
  onClose: () => void;
}) {
  const isPlayerCharacter = actor.type === "PLAYER_CHARACTER";
  const isNpc = actor.type === "NPC";
  const isCreature = actor.type === "CREATURE";

  const popoutUrl = characterSheet
    ? `/campaigns/${actor.campaignId}/sheets/${characterSheet.id}`
    : undefined;

  if (isPlayerCharacter) {
    return (
      <CharacterReadySheetModal
        actor={actor}
        characterSheet={characterSheet}
        allSkills={allSkills}
        isGM={isGM}
        isSavingImages={isSavingCharacterSheetImages}
        isConfirmingLevelUp={isConfirmingLevelUp}
        levelUpError={levelUpError}
        popoutUrl={popoutUrl}
        onSaveImages={onUpdateCharacterSheetImages}
        onConfirmLevelUp={onConfirmLevelUp}
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
