"use client";

import { FormEvent, PointerEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

type ToolMode = "select" | "pan" | "measure" | "draw" | "fog";

type RightPanelTab = "chat" | "rolls" | "characters" | "journal" | "settings";
type RollVisibility = "public" | "private";
type ChatMode = "public" | "whisper";
type CharacterType = "PLAYER" | "NPC" | "CREATURE";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  ownerId: string;
  systemId: string | null;
  isActive: boolean;
  isPublic: boolean;
  maxPlayers: number;
  inviteCode: string | null;
};

type CampaignParticipant = {
  id: string;
  campaignId: string;
  userId: string;
  role: "GM" | "PLAYER" | string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REMOVED" | string;
  joinedAt: string;
  removedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

type SidebarItem = {
  id: ToolMode;
  label: string;
  icon: string;
  description: string;
  visible: boolean;
};

type RightTabItem = {
  id: RightPanelTab;
  label: string;
  visible: boolean;
};

type ChatMessage = {
  id: string;
  author: string;
  kind: "system" | "user" | "roll" | "whisper";
  content: string;
  dice?: string;
  result?: number;
  displayResult?: string;
  breakdown?: string;
  recipientId?: string;
  recipientName?: string;
};

type RollResult = {
  id: string;
  author: string;
  expression: string;
  total: number;
  displayResult?: string;
  breakdown: string;
  createdAt: Date;
};

type DiceTerm = {
  id: string;
  quantity: number;
  sides: number;
};

type QuickRoll =
  | {
      id: string;
      label: string;
      expression: string;
      kind: "dice";
    }
  | {
      id: string;
      label: string;
      expression: string;
      kind: "tens";
    }
  | {
      id: string;
      label: string;
      expression: string;
      kind: "coin";
    };

type TableCharacter = {
  id: string;
  name: string;
  type: CharacterType;
  initials: string;
  ownerName: string;
  description: string;
  portraitUrl?: string;
};

type SceneToken = {
  id: string;
  characterId: string;
  name: string;
  initials: string;
  type: CharacterType;
  x: number;
  y: number;
};

const DICE_OPTIONS = [4, 6, 8, 10, 12, 20, 100];

const QUICK_ROLLS: QuickRoll[] = [
  {
    id: "d4",
    label: "d4",
    expression: "1d4",
    kind: "dice",
  },
  {
    id: "d6",
    label: "d6",
    expression: "1d6",
    kind: "dice",
  },
  {
    id: "d8",
    label: "d8",
    expression: "1d8",
    kind: "dice",
  },
  {
    id: "d10",
    label: "d10",
    expression: "1d10",
    kind: "dice",
  },
  {
    id: "d10-tens",
    label: "d10 dez.",
    expression: "1d10t",
    kind: "tens",
  },
  {
    id: "d12",
    label: "d12",
    expression: "1d12",
    kind: "dice",
  },
  {
    id: "d20",
    label: "d20",
    expression: "1d20",
    kind: "dice",
  },
  {
    id: "d100",
    label: "d100",
    expression: "1d100",
    kind: "dice",
  },
  {
    id: "coin",
    label: "Moeda",
    expression: "moeda",
    kind: "coin",
  },
];

const MOCK_CHARACTERS: TableCharacter[] = [
  {
    id: "char-raiel",
    name: "Raiel",
    type: "PLAYER",
    initials: "R",
    ownerName: "Jogador",
    description: "Personagem jogável vinculado à mesa.",
    portraitUrl: "",
  },
  {
    id: "char-pendragon",
    name: "Hikari Pendragon",
    type: "PLAYER",
    initials: "P",
    ownerName: "Jogador",
    description: "Herói disponível para cena e testes de token.",
    portraitUrl: "",
  },
  {
    id: "char-corvo",
    name: "Corvo da Vigília",
    type: "NPC",
    initials: "C",
    ownerName: "GM",
    description: "NPC misterioso usado pelo mestre.",
    portraitUrl: "",
  },
  {
    id: "char-sombra",
    name: "Sombra Faminta",
    type: "CREATURE",
    initials: "S",
    ownerName: "GM",
    description: "Criatura hostil para encontros e testes de combate.",
    portraitUrl: "",
  },
];

async function getCampaign(id: string): Promise<Campaign> {
  const response = await fetch(`http://localhost:8081/campaigns/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar campanha");
  }

  const data = await response.json();

  return data.campaign;
}

async function getCampaignParticipants(
  campaignId: string,
): Promise<CampaignParticipant[]> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/participants`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar participantes");
  }

  const data = await response.json();

  return data.participants;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInitials(user: User | null) {
  const name = user?.name?.trim();

  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return user?.email?.slice(0, 2).toUpperCase() ?? "U";
}

function getParticipantInitials(participant: CampaignParticipant) {
  const name = participant.user.name?.trim();

  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return participant.user.email.slice(0, 2).toUpperCase();
}

function getDisplayName(user: User | null) {
  return user?.name ?? user?.email ?? "Usuário";
}

function getParticipantDisplayName(participant: CampaignParticipant) {
  return participant.user.name || participant.user.email || "Usuário";
}

function getCharacterTypeLabel(type: CharacterType) {
  if (type === "PLAYER") {
    return "Personagem";
  }

  if (type === "NPC") {
    return "NPC";
  }

  return "Criatura";
}

function getCharacterTypeStyles(type: CharacterType) {
  if (type === "PLAYER") {
    return "border-forge-gold bg-forge-purple text-forge-gold";
  }

  if (type === "NPC") {
    return "border-purple-300/50 bg-purple-950 text-purple-100";
  }

  return "border-red-400/50 bg-red-950 text-red-100";
}

function normalizeDiceExpression(expression: string) {
  return expression
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/d%/g, "d100");
}

function rollDiceExpression(expression: string, author: string): RollResult {
  const normalizedExpression = normalizeDiceExpression(expression);

  if (!normalizedExpression) {
    throw new Error("Digite uma rolagem. Exemplo: 1d20 + 3d4");
  }

  const terms = normalizedExpression.split("+").filter(Boolean);

  if (terms.length === 0) {
    throw new Error("Digite uma rolagem válida.");
  }

  let total = 0;
  const breakdownParts: string[] = [];
  const displayParts: string[] = [];

  for (const term of terms) {
    if (term === "moeda" || term === "coin" || term === "caraoucoroa") {
      const value = Math.floor(Math.random() * 2);
      const face = value === 1 ? "Cara" : "Coroa";

      total += value;
      breakdownParts.push(`Moeda [${face}]`);
      displayParts.push(face);

      continue;
    }

    const tensMatch = term.match(/^(\d*)d10t$/);

    if (tensMatch) {
      const quantity = tensMatch[1] ? Number(tensMatch[1]) : 1;

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        throw new Error("A quantidade de dados deve estar entre 1 e 100.");
      }

      const rolls = Array.from({ length: quantity }, () => {
        return Math.floor(Math.random() * 10) * 10;
      });

      const subtotal = rolls.reduce((sum, roll) => sum + roll, 0);
      const formattedRolls = rolls.map((roll) =>
        roll.toString().padStart(2, "0"),
      );

      total += subtotal;

      breakdownParts.push(
        `${quantity}d10 dezenas [${formattedRolls.join(", ")}]`,
      );

      displayParts.push(formattedRolls.join(", "));

      continue;
    }

    const match = term.match(/^(\d*)d(\d+)$/);

    if (!match) {
      throw new Error(
        "Use apenas dados no formato XdY. Exemplos: 1d20, 3d4, d100, d10t, moeda.",
      );
    }

    const quantity = match[1] ? Number(match[1]) : 1;
    const sides = Number(match[2]);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new Error("A quantidade de dados deve estar entre 1 e 100.");
    }

    if (!Number.isInteger(sides) || sides < 2 || sides > 1000) {
      throw new Error("O dado precisa ter entre 2 e 1000 lados.");
    }

    const rolls = Array.from({ length: quantity }, () => {
      return Math.floor(Math.random() * sides) + 1;
    });

    const subtotal = rolls.reduce((sum, roll) => sum + roll, 0);

    total += subtotal;

    breakdownParts.push(`${quantity}d${sides} [${rolls.join(", ")}]`);
    displayParts.push(rolls.join(", "));
  }

  return {
    id: createId(),
    author,
    expression: normalizedExpression,
    total,
    displayResult: displayParts.length === 1 ? displayParts[0] : undefined,
    breakdown: breakdownParts.join(" + "),
    createdAt: new Date(),
  };
}

function buildExpressionFromTerms(terms: DiceTerm[]) {
  return terms
    .filter((term) => term.quantity > 0 && term.sides > 1)
    .map((term) => `${term.quantity}d${term.sides}`)
    .join(" + ");
}

function getVisibleCharactersForUser(
  characters: TableCharacter[],
  isGM: boolean,
) {
  if (isGM) {
    return characters;
  }

  const activePlayerCharacter = characters.find(
    (character) => character.type === "PLAYER",
  );

  return activePlayerCharacter ? [activePlayerCharacter] : [];
}

function groupCharactersByType(characters: TableCharacter[]) {
  return {
    players: characters.filter((character) => character.type === "PLAYER"),
    npcs: characters.filter((character) => character.type === "NPC"),
    creatures: characters.filter((character) => character.type === "CREATURE"),
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
  const [zoom, setZoom] = useState(100);
  const [isLeftToolbarOpen, setIsLeftToolbarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] =
    useState<TableCharacter | null>(null);

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

  const [sceneTokens, setSceneTokens] = useState<SceneToken[]>([
    {
      id: "token-raiel-initial",
      characterId: "char-raiel",
      name: "Raiel",
      initials: "R",
      type: "PLAYER",
      x: 320,
      y: 260,
    },
    {
      id: "token-pendragon-initial",
      characterId: "char-pendragon",
      name: "Hikari Pendragon",
      initials: "P",
      type: "PLAYER",
      x: 420,
      y: 260,
    },
  ]);

  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);

  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
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

        const campaign = await getCampaign(params.id);
        const participants = await getCampaignParticipants(params.id);

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
      } catch (error) {
        console.error(error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    }

    loadTable();
  }, [params.id, router]);

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

  const visibleCharacters = getVisibleCharactersForUser(MOCK_CHARACTERS, isGM);
  const visibleCharacterGroups = groupCharactersByType(visibleCharacters);

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

  const toolbarItems: SidebarItem[] = useMemo(
    () => [
      {
        id: "select",
        label: "Selecionar",
        icon: "↖",
        description: "Selecionar e interagir com elementos da mesa.",
        visible: true,
      },
      {
        id: "pan",
        label: "Mover visão",
        icon: "✋",
        description: "Mover a visão pelo mapa.",
        visible: true,
      },
      {
        id: "measure",
        label: "Medir",
        icon: "📏",
        description: "Medir distância no grid.",
        visible: true,
      },
      {
        id: "draw",
        label: "Desenhar",
        icon: "✎",
        description: "Desenhar marcações na cena.",
        visible: canSeeGmTools,
      },
      {
        id: "fog",
        label: "Névoa",
        icon: "◐",
        description: "Ocultar ou revelar áreas do mapa.",
        visible: canSeeGmTools,
      },
    ],
    [canSeeGmTools],
  );

  const rightTabs: RightTabItem[] = useMemo(
    () => [
      {
        id: "chat",
        label: "Chat",
        visible: true,
      },
      {
        id: "rolls",
        label: "Rolagens",
        visible: true,
      },
      {
        id: "characters",
        label: "Personagens",
        visible: true,
      },
      {
        id: "journal",
        label: "Diário",
        visible: true,
      },
      {
        id: "settings",
        label: "Mesa",
        visible: true,
      },
    ],
    [],
  );

  const customExpression = buildExpressionFromTerms(diceTerms);

  const activeToolLabel =
    toolbarItems.find((item) => item.id === activeTool)?.label ?? "Selecionar";

  const lastRoll = [...chatMessages]
    .reverse()
    .find((message) => message.kind === "roll");

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

  function publishRollToChat(roll: RollResult) {
    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createId(),
        author: roll.author,
        kind: "roll",
        content: `${roll.author} rolou ${roll.expression}`,
        dice: roll.expression,
        result: roll.total,
        displayResult: roll.displayResult,
        breakdown: roll.breakdown,
      },
    ]);
  }

  function handleRoll(rollExpression: string, visibility: RollVisibility) {
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

      publishRollToChat(roll);
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

  function handleAddTokenToScene(character: TableCharacter) {
    const tokenCount = sceneTokens.length;
    const nextX = 300 + ((tokenCount * 90) % 560);
    const nextY = 340 + Math.floor(tokenCount / 6) * 90;

    setSceneTokens((currentTokens) => [
      ...currentTokens,
      {
        id: createId(),
        characterId: character.id,
        name: character.name,
        initials: character.initials,
        type: character.type,
        x: nextX,
        y: nextY,
      },
    ]);
  }

  function handleStartTokenDrag(tokenId: string) {
    if (!isGM) {
      return;
    }

    setDraggingTokenId(tokenId);
  }

  function handleMoveTokenOnScene(event: PointerEvent<HTMLDivElement>) {
    if (!draggingTokenId || !isGM) {
      return;
    }

    const scene = event.currentTarget.getBoundingClientRect();
    const scale = zoom / 100;

    const x = Math.round((event.clientX - scene.left) / scale);
    const y = Math.round((event.clientY - scene.top) / scale);

    setSceneTokens((currentTokens) =>
      currentTokens.map((token) => {
        if (token.id !== draggingTokenId) {
          return token;
        }

        return {
          ...token,
          x: Math.max(0, Math.min(x - 32, 1336)),
          y: Math.max(0, Math.min(y - 32, 836)),
        };
      }),
    );
  }

  function handleStopTokenDrag() {
    setDraggingTokenId(null);
  }

  function handleRemoveTokenFromScene(tokenId: string) {
    setSceneTokens((currentTokens) =>
      currentTokens.filter((token) => token.id !== tokenId),
    );
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
        <div className="max-w-md rounded-2xl border border-forge-gold/40 bg-black/40 p-6 text-center shadow-[12px_12px_0_rgba(0,0,0,0.35)]">
          <h1 className="text-2xl font-black text-forge-gold">
            Acesso negado
          </h1>

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
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-forge-gold/40 bg-[#1a0d20]/95 px-6 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
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
              Cena atual:{" "}
              <span className="text-white">Primeira Vigília</span>
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
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-forge-gold bg-forge-purple text-sm font-black text-forge-gold shadow-[5px_5px_0_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgba(0,0,0,0.35)]"
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
          <aside
            className={`relative flex flex-col items-center gap-3 overflow-hidden border-r border-forge-gold/25 bg-[#160a1b] py-4 transition-all duration-300 ${
              isLeftToolbarOpen ? "px-3 opacity-100" : "px-0 opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={() => setIsLeftToolbarOpen(false)}
              title="Ocultar ferramentas"
              className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/25 text-sm font-black text-white/45 transition hover:border-forge-gold/60 hover:text-forge-gold"
              aria-label="Ocultar ferramentas"
            >
              ‹
            </button>

            {toolbarItems
              .filter((item) => item.visible)
              .map((item) => {
                const isActive = activeTool === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTool(item.id)}
                    title={`${item.label} — ${item.description}`}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-black transition ${
                      isActive
                        ? "border-forge-gold bg-forge-purple text-forge-gold shadow-[4px_4px_0_rgba(0,0,0,0.45)]"
                        : "border-white/10 bg-black/30 text-white/65 hover:border-forge-gold/70 hover:text-forge-gold"
                    }`}
                  >
                    {item.icon}
                  </button>
                );
              })}

            <div className="mt-auto flex flex-col items-center gap-2">
              <div className="h-px w-10 bg-white/10" />

              <button
                type="button"
                title="Configurações rápidas"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-lg font-black text-white/65 transition hover:border-forge-gold/70 hover:text-forge-gold"
              >
                ⚙
              </button>
            </div>
          </aside>

          <section className="relative min-h-0 overflow-hidden bg-[#24142a]">
            <div className="absolute left-5 top-5 z-10 rounded-xl border border-forge-gold/35 bg-black/50 px-4 py-3 shadow-[6px_6px_0_rgba(0,0,0,0.35)] backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                Ferramenta ativa
              </p>

              <p className="mt-1 text-xs font-black text-forge-gold">
                {activeToolLabel}
              </p>
            </div>

            {!isLeftToolbarOpen && (
              <button
                type="button"
                onClick={() => setIsLeftToolbarOpen(true)}
                title="Mostrar ferramentas"
                className="absolute left-3 top-1/2 z-20 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-forge-gold/40 bg-black/55 text-lg font-black text-forge-gold shadow-[6px_6px_0_rgba(0,0,0,0.35)] transition hover:bg-forge-purple"
                aria-label="Mostrar ferramentas"
              >
                ›
              </button>
            )}

            {!isRightPanelOpen && (
              <button
                type="button"
                onClick={() => setIsRightPanelOpen(true)}
                title="Mostrar painel"
                className="absolute right-3 top-1/2 z-20 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-forge-gold/40 bg-black/55 text-lg font-black text-forge-gold shadow-[-6px_6px_0_rgba(0,0,0,0.35)] transition hover:bg-forge-purple"
                aria-label="Mostrar painel"
              >
                ‹
              </button>
            )}

            <div className="absolute inset-0 flex items-center justify-center p-10">
              <div
                className="relative h-[900px] w-[1400px] origin-center overflow-hidden rounded-2xl border border-forge-gold/35 bg-[#e4d0a3] shadow-[18px_18px_0_rgba(0,0,0,0.35)] transition-transform"
                style={{
                  transform: `scale(${zoom / 100})`,
                }}
                onPointerMove={handleMoveTokenOnScene}
                onPointerUp={handleStopTokenDrag}
                onPointerLeave={handleStopTokenDrag}
              >
                <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(64,32,75,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(64,32,75,0.18)_1px,transparent_1px)] [background-size:40px_40px]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,214,102,0.22),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(64,0,80,0.18),transparent_32%)]" />

                {sceneTokens.map((token) => (
                  <div
                    key={token.id}
                    className="absolute"
                    style={{
                      left: token.x,
                      top: token.y,
                    }}
                  >
                    <button
                      type="button"
                      title={`${token.name} — ${getCharacterTypeLabel(
                        token.type,
                      )}`}
                      onPointerDown={() => handleStartTokenDrag(token.id)}
                      className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-xl font-black shadow-[6px_6px_0_rgba(0,0,0,0.35)] transition ${
                        isGM
                          ? "cursor-grab active:cursor-grabbing"
                          : "cursor-pointer"
                      } ${getCharacterTypeStyles(token.type)}`}
                    >
                      {token.initials}
                    </button>
                  </div>
                ))}

                <div className="absolute bottom-5 right-5 rounded-lg border border-black/20 bg-black/30 px-3 py-2 text-xs font-bold text-white/80">
                  Grid inicial da cena
                </div>
              </div>
            </div>
          </section>

          <aside
            className={`flex min-h-0 flex-col overflow-hidden border-l border-forge-gold/25 bg-[#160a1b] transition-all duration-300 ${
              isRightPanelOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex shrink-0 items-center border-b border-forge-gold/25">
              <div className="flex min-w-0 flex-1">
                {rightTabs
                  .filter((tab) => tab.visible)
                  .map((tab) => {
                    const isActive = activeRightTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveRightTab(tab.id)}
                        className={`min-w-0 flex-1 border-r border-white/10 px-1.5 py-3 text-[9px] font-black uppercase tracking-[0.06em] transition last:border-r-0 ${
                          isActive
                            ? "bg-forge-purple text-forge-gold"
                            : "bg-black/25 text-white/50 hover:text-forge-gold"
                        }`}
                      >
                        <span className="block truncate">{tab.label}</span>
                      </button>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setIsRightPanelOpen(false)}
                title="Ocultar painel"
                className="flex h-full w-8 shrink-0 items-center justify-center border-l border-white/10 bg-black/25 text-sm font-black text-white/45 transition hover:text-forge-gold"
                aria-label="Ocultar painel"
              >
                ›
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[13px]">
              {activeRightTab === "chat" && (
                <section>
                  <h2 className="text-base font-black text-forge-gold">Chat</h2>

                  <p className="mt-1 text-xs font-semibold text-white/55">
                    Conversas da mesa, avisos do sistema, rolagens públicas e
                    sussurros.
                  </p>

                  <div className="mt-5 space-y-3">
                    {chatMessages.map((message) => {
                      const isSelfWhisper =
                        message.kind === "whisper" &&
                        message.recipientId === user.id;

                      return (
                        <div
                          key={message.id}
                          className={`rounded-xl border p-3 ${
                            message.kind === "roll"
                              ? "border-forge-gold/40 bg-forge-purple/30"
                              : message.kind === "whisper"
                                ? isSelfWhisper
                                  ? "border-forge-gold/35 bg-forge-gold/10"
                                  : "border-purple-300/35 bg-purple-950/30"
                                : "border-white/10 bg-black/35"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-[11px] font-black ${
                                message.kind === "system"
                                  ? "text-forge-gold"
                                  : message.kind === "whisper"
                                    ? isSelfWhisper
                                      ? "text-forge-gold"
                                      : "text-purple-200"
                                    : "text-purple-200"
                              }`}
                            >
                              {message.author}
                            </p>

                            {message.kind === "whisper" && (
                              <span
                                className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                                  isSelfWhisper
                                    ? "border-forge-gold/40 bg-black/30 text-forge-gold"
                                    : "border-purple-300/30 bg-purple-950/50 text-purple-100"
                                }`}
                              >
                                {isSelfWhisper ? "Nota pessoal" : "Sussurro"}
                              </span>
                            )}
                          </div>

                          {message.kind === "roll" ? (
                            <div className="mt-2">
                              <p className="text-xs text-white/75">
                                {message.content}
                              </p>

                              <p className="mt-2 text-4xl font-black text-forge-gold">
                                {message.displayResult ?? message.result}
                              </p>

                              <p className="text-xs font-semibold text-white/55">
                                {message.breakdown}
                              </p>
                            </div>
                          ) : message.kind === "whisper" ? (
                            <div className="mt-2">
                              <p className="text-[11px] font-bold text-purple-100/65">
                                Para: {message.recipientName}
                              </p>

                              <p className="mt-1 text-xs text-white/80">
                                {message.content}
                              </p>
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-white/75">
                              {message.content}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {activeRightTab === "rolls" && (
                <section>
                  <h2 className="text-base font-black text-forge-gold">
                    Rolagens
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-white/55">
                    Role dados simples ou combine múltiplos dados.
                  </p>

                  {isGM && (
                    <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-forge-gold/35 bg-black/25">
                      <button
                        type="button"
                        onClick={() => setRollVisibility("public")}
                        className={`px-3 py-3 text-xs font-black transition ${
                          rollVisibility === "public"
                            ? "bg-forge-purple text-forge-gold"
                            : "text-white/50 hover:text-forge-gold"
                        }`}
                      >
                        Pública
                      </button>

                      <button
                        type="button"
                        onClick={() => setRollVisibility("private")}
                        className={`px-3 py-3 text-xs font-black transition ${
                          rollVisibility === "private"
                            ? "bg-forge-purple text-forge-gold"
                            : "text-white/50 hover:text-forge-gold"
                        }`}
                      >
                        Privada GM
                      </button>
                    </div>
                  )}

                  <div className="mt-5">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      Rolagem rápida
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {QUICK_ROLLS.map((roll) => (
                        <button
                          key={roll.id}
                          type="button"
                          onClick={() => handleQuickRoll(roll.expression)}
                          className="rounded-lg border border-forge-gold/40 bg-black/35 px-3 py-3 text-xs font-black text-forge-gold transition hover:bg-forge-purple"
                        >
                          {roll.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
                    {isGM && rollVisibility === "private" ? (
                      <>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-200/70">
                          Última rolagem privada do GM
                        </p>

                        {privateRolls.length > 0 ? (
                          <div className="mt-3 rounded-lg border border-purple-400/25 bg-purple-950/20 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-black text-white">
                                  {privateRolls[0].expression}
                                </p>

                                <p className="mt-2 text-4xl font-black text-forge-gold">
                                  {privateRolls[0].displayResult ??
                                    privateRolls[0].total}
                                </p>

                                <p className="text-xs font-semibold text-white/55">
                                  {privateRolls[0].breakdown}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRevealPrivateRoll(privateRolls[0])
                                }
                                className="rounded-lg border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple"
                              >
                                Revelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs font-semibold text-white/55">
                            Nenhuma rolagem privada ainda.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                          Última rolagem pública
                        </p>

                        {lastRoll ? (
                          <>
                            <p className="mt-2 text-4xl font-black text-forge-gold">
                              {lastRoll.displayResult ?? lastRoll.result}
                            </p>

                            <p className="text-xs font-semibold text-white/60">
                              {lastRoll.breakdown}
                            </p>
                          </>
                        ) : (
                          <p className="mt-2 text-xs font-semibold text-white/55">
                            Nenhuma rolagem pública ainda.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {rollError && (
                    <p className="mt-4 rounded-lg border border-red-700/60 bg-red-950/40 px-3 py-2 text-[11px] font-bold text-red-200">
                      {rollError}
                    </p>
                  )}

                  <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/25">
                    <button
                      type="button"
                      onClick={() => setIsCustomDiceOpen((current) => !current)}
                      className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-white/5"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                          Dado personalizado
                        </p>

                        <p className="mt-1 text-xs font-semibold text-white/55">
                          d3, d5, d30, d1000...
                        </p>
                      </div>

                      <span className="text-lg font-black text-forge-gold">
                        {isCustomDiceOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isCustomDiceOpen && (
                      <div className="border-t border-white/10 p-4">
                        <p className="text-xs font-semibold text-white/55">
                          Use para sistemas com dados fora do padrão.
                        </p>

                        <div className="mt-3 flex gap-2">
                          <div className="flex h-10 items-center rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-black text-white/40">
                            d
                          </div>

                          <input
                            type="number"
                            min={2}
                            max={1000}
                            value={customDiceSides}
                            onChange={(event) =>
                              setCustomDiceSides(Number(event.target.value))
                            }
                            className="h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-bold text-white outline-none focus:border-forge-gold"
                          />

                          <button
                            type="button"
                            onClick={handleRollCustomDice}
                            className="rounded-lg border border-forge-gold bg-forge-purple px-4 text-xs font-black text-forge-gold transition hover:bg-[#4d0d63]"
                          >
                            Rolar
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddCustomDiceToBuilder}
                          className="mt-3 w-full rounded-lg border border-forge-gold/40 px-4 py-2 text-[11px] font-black text-forge-gold transition hover:bg-forge-purple"
                        >
                          Adicionar ao montador
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/25">
                    <button
                      type="button"
                      onClick={() =>
                        setIsDiceBuilderOpen((current) => !current)
                      }
                      className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-white/5"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                          Montador de dados
                        </p>

                        <p className="mt-1 text-xs font-semibold text-white/55">
                          Monte rolagens como 1d20 + 3d4.
                        </p>
                      </div>

                      <span className="text-lg font-black text-forge-gold">
                        {isDiceBuilderOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isDiceBuilderOpen && (
                      <div className="border-t border-white/10 p-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleAddDiceTerm}
                            className="rounded-lg border border-forge-gold/50 px-3 py-2 text-[11px] font-black text-forge-gold transition hover:bg-forge-purple"
                          >
                            + Dado
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {diceTerms.map((term) => (
                            <div
                              key={term.id}
                              className="grid grid-cols-[1fr_1fr_32px] gap-2"
                            >
                              <div>
                                <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
                                  Qtd.
                                </label>

                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={term.quantity}
                                  onChange={(event) =>
                                    handleChangeDiceTerm(
                                      term.id,
                                      "quantity",
                                      Number(event.target.value),
                                    )
                                  }
                                  className="h-10 w-full rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-bold text-white outline-none focus:border-forge-gold"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
                                  Dado
                                </label>

                                <select
                                  value={term.sides}
                                  onChange={(event) =>
                                    handleChangeDiceTerm(
                                      term.id,
                                      "sides",
                                      Number(event.target.value),
                                    )
                                  }
                                  className="h-10 w-full rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-bold text-white outline-none focus:border-forge-gold"
                                >
                                  {DICE_OPTIONS.map((sides) => (
                                    <option key={sides} value={sides}>
                                      d{sides}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveDiceTerm(term.id)}
                                className="mt-5 flex h-10 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-sm font-black text-white/40 transition hover:border-red-500 hover:text-red-300"
                                aria-label="Remover dado"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 rounded-lg border border-forge-gold/25 bg-black/35 px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
                            Expressão final
                          </p>

                          <p className="mt-1 text-xs font-black text-forge-gold">
                            {customExpression}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleRollCustomBuilder}
                          className="mt-3 w-full rounded-lg border border-forge-gold bg-forge-purple px-4 py-3 text-xs font-black text-forge-gold transition hover:bg-[#4d0d63]"
                        >
                          Rolar expressão montada
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/25">
                    <button
                      type="button"
                      onClick={() =>
                        setIsAdvancedRollOpen((current) => !current)
                      }
                      className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-white/5"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                          Modo avançado
                        </p>

                        <p className="mt-1 text-xs font-semibold text-white/55">
                          Digite fórmulas simples manualmente.
                        </p>
                      </div>

                      <span className="text-lg font-black text-forge-gold">
                        {isAdvancedRollOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isAdvancedRollOpen && (
                      <form
                        onSubmit={handleRollExpression}
                        className="border-t border-white/10 p-4"
                      >
                        <label
                          htmlFor="diceExpression"
                          className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45"
                        >
                          Expressão
                        </label>

                        <div className="flex gap-2">
                          <input
                            id="diceExpression"
                            type="text"
                            value={diceExpression}
                            onChange={(event) =>
                              setDiceExpression(event.target.value)
                            }
                            placeholder="Ex: 1d20 + 3d4 + d10t"
                            className="h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-semibold text-white outline-none placeholder:text-white/35 focus:border-forge-gold"
                          />

                          <button
                            type="submit"
                            className="rounded-lg border border-forge-gold bg-forge-purple px-4 text-xs font-black text-forge-gold transition hover:bg-[#4d0d63]"
                          >
                            Rolar
                          </button>
                        </div>

                        <p className="mt-2 text-[11px] font-semibold text-white/40">
                          Exemplos: 1d20 + 3d4, d10t, moeda, 2d100.
                        </p>
                      </form>
                    )}
                  </div>
                </section>
              )}

              {activeRightTab === "characters" && (
                <section>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black text-forge-gold">
                        Personagens
                      </h2>

                      <p className="mt-1 text-xs font-semibold text-white/55">
                        Fichas, NPCs, criaturas e tokens da cena.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 rounded-lg border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple"
                    >
                      + Criar
                    </button>
                  </div>

                  {visibleCharacters.length === 0 && (
                    <div className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
                      <p className="text-sm font-black text-white">
                        Nenhum personagem ativo
                      </p>

                      <p className="mt-1 text-xs font-semibold text-white/55">
                        Quando sua ficha ativa for criada, ela aparecerá aqui.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 space-y-5">
                    {visibleCharacterGroups.players.length > 0 && (
                      <CharacterGroupSection
                        title={isGM ? "Meus / Players" : "Meu personagem"}
                        characters={visibleCharacterGroups.players}
                        isGM={isGM}
                        onAddToken={handleAddTokenToScene}
                        onOpenSheet={setSelectedCharacter}
                      />
                    )}

                    {isGM && visibleCharacterGroups.npcs.length > 0 && (
                      <CharacterGroupSection
                        title="NPCs"
                        characters={visibleCharacterGroups.npcs}
                        isGM={isGM}
                        onAddToken={handleAddTokenToScene}
                        onOpenSheet={setSelectedCharacter}
                      />
                    )}

                    {isGM && visibleCharacterGroups.creatures.length > 0 && (
                      <CharacterGroupSection
                        title="Criaturas"
                        characters={visibleCharacterGroups.creatures}
                        isGM={isGM}
                        onAddToken={handleAddTokenToScene}
                        onOpenSheet={setSelectedCharacter}
                      />
                    )}

                    <div className="rounded-xl border border-forge-gold/20 bg-black/25 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-forge-gold/80">
                          Tokens na cena
                        </p>

                        <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black text-white/45">
                          {sceneTokens.length}
                        </span>
                      </div>

                      {sceneTokens.length === 0 ? (
                        <p className="mt-3 text-xs font-semibold text-white/45">
                          Nenhum token no grid.
                        </p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {sceneTokens.map((token) => (
                            <div
                              key={token.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/35 px-3 py-2"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-black shadow-[3px_3px_0_rgba(0,0,0,0.3)] ${getCharacterTypeStyles(
                                    token.type,
                                  )}`}
                                >
                                  {token.initials}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-black text-white">
                                    {token.name}
                                  </p>

                                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                                    {getCharacterTypeLabel(token.type)}
                                  </p>
                                </div>
                              </div>

                              {isGM && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveTokenFromScene(token.id)
                                  }
                                  className="shrink-0 rounded-md border border-red-500/40 px-2 py-1 text-[9px] font-black text-red-300 transition hover:bg-red-950/40"
                                >
                                  Remover
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {activeRightTab === "journal" && (
                <section>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black text-forge-gold">
                        Diário
                      </h2>

                      <p className="mt-1 text-xs font-semibold text-white/55">
                        Anotações, locais, pistas e documentos da aventura.
                      </p>
                    </div>

                    {isGM && (
                      <button
                        type="button"
                        className="shrink-0 rounded-lg border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple"
                      >
                        + Criar
                      </button>
                    )}
                  </div>

                  <div className="mt-5 space-y-4">
                    <JournalGroupSection
                      title="Notas da mesa"
                      items={[
                        {
                          id: "journal-note-1",
                          title: "Resumo da última sessão",
                          description:
                            "O grupo chegou à Primeira Vigília e encontrou sinais de atividade estranha perto da muralha.",
                          visibility: "Público",
                        },
                      ]}
                    />

                    <JournalGroupSection
                      title="Locais"
                      items={[
                        {
                          id: "journal-location-1",
                          title: "Primeira Vigília",
                          description:
                            "Fortificação antiga usada como ponto de passagem entre as terras civilizadas e a região selvagem.",
                          visibility: "Público",
                        },
                        {
                          id: "journal-location-2",
                          title: "Cripta sob a torre",
                          description:
                            "Local conhecido pelo mestre. Ainda não revelado aos jogadores.",
                          visibility: isGM ? "GM" : "Oculto",
                          hiddenForPlayer: !isGM,
                        },
                      ]}
                    />

                    <JournalGroupSection
                      title="Pistas"
                      items={[
                        {
                          id: "journal-clue-1",
                          title: "Símbolo queimado",
                          description:
                            "Um símbolo escuro foi encontrado no portão norte. Ninguém reconheceu sua origem.",
                          visibility: "Público",
                        },
                      ]}
                    />

                    <JournalGroupSection
                      title="Documentos / PDFs"
                      items={[
                        {
                          id: "journal-doc-1",
                          title: "Contrato de escolta",
                          description:
                            "Documento entregue ao grupo antes da viagem para a Primeira Vigília.",
                          visibility: "Público",
                        },
                      ]}
                    />

                    <JournalGroupSection
                      title="Registro da sessão"
                      items={[
                        {
                          id: "journal-log-1",
                          title: "Sessão 01",
                          description:
                            "Registro inicial da campanha. Depois poderá guardar resumo, data e acontecimentos importantes.",
                          visibility: "Público",
                        },
                      ]}
                    />
                  </div>
                </section>
              )}

              {activeRightTab === "settings" && (
                <section>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black text-forge-gold">
                        Mesa
                      </h2>

                      
                    </div>

                    <span className="shrink-0 rounded-full border border-forge-gold/30 bg-black/30 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold">
                      {campaign.isPublic ? "Pública" : "Privada"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {actionMessage && (
                      <div className="rounded-lg border border-emerald-600/60 bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-200">
                        {actionMessage}
                      </div>
                    )}

                    {actionError && (
                      <div className="rounded-lg border border-red-600/60 bg-red-950/40 px-3 py-2 text-xs font-bold text-red-200">
                        {actionError}
                      </div>
                    )}

                    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                        Campanha atual
                      </p>

                      <p className="mt-2 text-sm font-black text-white">
                        {campaign.name}
                      </p>

                      <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
                        {campaign.description ||
                          "Sem descrição cadastrada para esta campanha."}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                            Jogadores
                          </p>

                          <p className="mt-1 text-sm font-black text-forge-gold">
                            {approvedPlayers.length}/{campaign.maxPlayers}
                          </p>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                            Mestres
                          </p>

                          <p className="mt-1 text-sm font-black text-forge-gold">
                            {approvedGms.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                        Seu acesso
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-forge-gold/50 bg-forge-purple text-xs font-black text-forge-gold">
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
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-white">
                            {getDisplayName(user)}
                          </p>

                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                            {roleLabel}
                            {isOwner ? " • Owner" : ""}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs font-semibold leading-relaxed text-white/55">
                        {isGM
                          ? "Você está usando a mesa como Mestre."
                          : "Você está usando a mesa como jogador."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                          Participantes
                        </p>

                        <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black text-white/45">
                          {approvedParticipants.length}
                        </span>
                      </div>

                      {approvedParticipants.length === 0 ? (
                        <p className="mt-3 text-xs font-semibold text-white/45">
                          Nenhum participante aprovado encontrado.
                        </p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {approvedParticipants.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-forge-purple text-[10px] font-black text-forge-gold">
                                  {participant.user.image ? (
                                    <span
                                      className="h-full w-full bg-cover bg-center"
                                      style={{
                                        backgroundImage: `url(${participant.user.image})`,
                                      }}
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    getParticipantInitials(participant)
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-black text-white">
                                    {getParticipantDisplayName(participant)}
                                  </p>

                                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                                    {participant.userId === campaign.ownerId
                                      ? "Owner"
                                      : "Participante"}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] ${
                                  participant.role === "GM"
                                    ? "border-forge-gold/40 bg-forge-purple/40 text-forge-gold"
                                    : "border-white/10 bg-black/30 text-white/40"
                                }`}
                              >
                                {participant.role === "GM" ? "GM" : "Player"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                        Ações da mesa
                      </p>

                      <div className="mt-3 space-y-2">
                        <button
                          type="button"
                          onClick={() => setIsExitModalOpen(true)}
                          className="block w-full rounded-lg border border-white/15 px-4 py-3 text-left text-xs font-black text-white/75 transition hover:border-forge-gold hover:text-forge-gold"
                        >
                          Sair da mesa
                        </button>

                        {canAssumeGm && (
                          <button
                            type="button"
                            onClick={handleAssumeGmRole}
                            disabled={isAssumingGm}
                            className="block w-full rounded-lg border border-forge-gold/50 px-4 py-3 text-left text-xs font-black text-forge-gold transition hover:bg-forge-purple disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isAssumingGm
                              ? "Assumindo papel de GM..."
                              : "Assumir papel de GM"}
                          </button>
                        )}

                        {canManageCampaignInsideTable && (
                          <Link
                            href={`/campaigns/${campaign.id}/edit`}
                            className="block w-full rounded-lg border border-forge-gold/40 px-4 py-3 text-left text-xs font-black text-forge-gold transition hover:bg-forge-purple"
                          >
                            Gerenciar campanha
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="shrink-0 border-t border-forge-gold/25 p-4"
            >
              <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-lg border border-forge-gold/25 bg-black/25">
                <button
                  type="button"
                  onClick={() => {
                    setChatMode("public");
                    setChatError("");
                  }}
                  className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${
                    chatMode === "public"
                      ? "bg-forge-purple text-forge-gold"
                      : "text-white/45 hover:text-forge-gold"
                  }`}
                >
                  Público
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChatMode("whisper");
                    setChatError("");
                  }}
                  className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${
                    chatMode === "whisper"
                      ? "bg-forge-purple text-forge-gold"
                      : "text-white/45 hover:text-forge-gold"
                  }`}
                >
                  Sussurro
                </button>
              </div>

              {chatMode === "whisper" && (
                <div className="mb-3">
                  <select
                    aria-label="Selecionar destinatário do sussurro"
                    title="Selecionar destinatário do sussurro"
                    value={whisperTargetId}
                    onChange={(event) => setWhisperTargetId(event.target.value)}
                    className="h-10 w-full rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-bold text-white outline-none focus:border-forge-gold"
                  >
                    <option value="">
                      {isGM
                        ? "Sussurrar ou criar nota pessoal..."
                        : "Sussurrar para GM ou nota pessoal..."}
                    </option>

                    {whisperTargets.map((participant) => (
                      <option key={participant.id} value={participant.userId}>
                        {getParticipantDisplayName(participant)} —{" "}
                        {participant.userId === user.id
                          ? "Nota pessoal"
                          : participant.role === "GM"
                            ? "GM"
                            : "Player"}
                      </option>
                    ))}
                  </select>

                  {whisperTargets.length === 0 && (
                    <p className="mt-2 text-[11px] font-semibold text-white/40">
                      Nenhum destinatário disponível para sussurro agora.
                    </p>
                  )}
                </div>
              )}

              {chatError && (
                <p className="mb-3 rounded-lg border border-red-700/60 bg-red-950/40 px-3 py-2 text-[11px] font-bold text-red-200">
                  {chatError}
                </p>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder={
                    chatMode === "whisper"
                      ? "Enviar sussurro ou nota..."
                      : "Enviar mensagem..."
                  }
                  className="h-11 min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-semibold text-white outline-none placeholder:text-white/35 focus:border-forge-gold"
                />

                <button
                  type="submit"
                  className="rounded-lg border border-forge-gold bg-forge-purple px-4 text-xs font-black text-forge-gold transition hover:bg-[#4d0d63]"
                >
                  Enviar
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>

      {selectedCharacter && (
        <CharacterSheetModal
          character={selectedCharacter}
          isGM={isGM}
          onClose={() => setSelectedCharacter(null)}
        />
      )}

      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-forge-gold/50 bg-[#120816] p-6 shadow-[16px_16px_0_rgba(0,0,0,0.45)]">
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

function CharacterGroupSection({
  title,
  characters,
  isGM,
  onAddToken,
  onOpenSheet,
}: {
  title: string;
  characters: TableCharacter[];
  isGM: boolean;
  onAddToken: (character: TableCharacter) => void;
  onOpenSheet: (character: TableCharacter) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
        {title}
      </p>

      <div className="mt-3 space-y-2">
        {characters.map((character) => (
          <div
            key={character.id}
            className="group rounded-lg border border-white/10 bg-black/35 px-3 py-2 transition hover:border-forge-gold/40 hover:bg-forge-purple/15"
          >
            <div className="flex items-center gap-3">
              {character.portraitUrl ? (
                <div
                  className="h-10 w-10 shrink-0 rounded-lg border border-forge-gold/35 bg-cover bg-center shadow-[3px_3px_0_rgba(0,0,0,0.3)]"
                  style={{
                    backgroundImage: `url(${character.portraitUrl})`,
                  }}
                  aria-hidden="true"
                />
              ) : (
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-black shadow-[3px_3px_0_rgba(0,0,0,0.3)] ${getCharacterTypeStyles(
                    character.type,
                  )}`}
                >
                  {character.initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-white">
                  {character.name}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenSheet(character)}
                className="rounded-md border border-white/10 px-3 py-2 text-[10px] font-black text-white/55 transition hover:border-forge-gold hover:text-forge-gold"
              >
                Ficha
              </button>

              <button
                type="button"
                onClick={() => onAddToken(character)}
                disabled={!isGM}
                className="rounded-md border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/25 disabled:hover:bg-transparent"
              >
                Token
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CharacterSheetModal({
  character,
  isGM,
  onClose,
}: {
  character: TableCharacter;
  isGM: boolean;
  onClose: () => void;
}) {
  const isPlayerCharacter = character.type === "PLAYER";
  const isNpc = character.type === "NPC";
  const isCreature = character.type === "CREATURE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-forge-gold/50 bg-[#120816] shadow-[18px_18px_0_rgba(0,0,0,0.5)]">
        <div className="flex items-start justify-between gap-4 border-b border-forge-gold/25 bg-[#1a0d20] p-5">
          <div className="flex min-w-0 items-center gap-4">
            {character.portraitUrl ? (
              <div
                className="h-16 w-16 shrink-0 rounded-xl border border-forge-gold/40 bg-cover bg-center shadow-[5px_5px_0_rgba(0,0,0,0.35)]"
                style={{
                  backgroundImage: `url(${character.portraitUrl})`,
                }}
                aria-hidden="true"
              />
            ) : (
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border text-2xl font-black shadow-[5px_5px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
                  character.type,
                )}`}
              >
                {character.initials}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Ficha
              </p>

              <h2 className="mt-1 truncate text-2xl font-black text-forge-gold">
                {character.name}
              </h2>

              <p className="mt-1 text-xs font-semibold text-white/55">
                {character.description}
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
                value={getCharacterTypeLabel(character.type)}
              />

              <SheetStat label="Dono" value={character.ownerName} />

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

function JournalGroupSection({
  title,
  items,
}: {
  title: string;
  items: {
    id: string;
    title: string;
    description: string;
    visibility: string;
    hiddenForPlayer?: boolean;
  }[];
}) {
  const visibleItems = items.filter((item) => !item.hiddenForPlayer);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
        {title}
      </p>

      <div className="mt-3 space-y-2">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="group w-full rounded-lg border border-white/10 bg-black/35 px-3 py-3 text-left transition hover:border-forge-gold/40 hover:bg-forge-purple/15"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-white">
                  {item.title}
                </p>

                <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-white/45">
                  {item.description}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white/35">
                {item.visibility}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}