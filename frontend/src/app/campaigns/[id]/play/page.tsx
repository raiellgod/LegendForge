"use client";

import { FormEvent, PointerEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

type ToolMode = "select" | "pan" | "measure" | "draw" | "fog";

type RightPanelTab = "chat" | "rolls" | "characters" | "journal" | "settings";
type RollVisibility = "public" | "private";
type ChatMode = "public" | "whisper";
type CharacterType = "PLAYER_CHARACTER" | "NPC" | "CREATURE";
type ActorLocation = "TABLE" | "LIBRARY" | "ARCHIVED";

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

type CampaignActor = {
  id: string;
  campaignId: string;
  ownerId: string | null;
  type: CharacterType;
  location: ActorLocation;
  name: string;
  initials: string;
  description: string | null;
  portraitUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type SceneToken = {
  id: string;
  campaignId: string;
  actorId: string;
  name: string;
  initials: string;
  type: CharacterType;
  imageUrl: string | null;
  imageFit: "COVER" | "CONTAIN" | "FILL";
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  actor: {
    id: string;
    ownerId: string | null;
    type: CharacterType;
    location: ActorLocation;
    name: string;
    initials: string;
    portraitUrl: string | null;
  };
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

async function getCampaignActors(campaignId: string): Promise<CampaignActor[]> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/actors`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar atores da campanha");
  }

  const data = await response.json();

  return data.actors;
}

async function getCampaignTokens(campaignId: string): Promise<SceneToken[]> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/tokens`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar tokens da campanha");
  }

  const data = await response.json();

  return data.tokens;
}

async function createSceneToken(
  campaignId: string,
  actorId: string,
  data: {
    name?: string;
    initials?: string;
    imageUrl?: string | null;
    imageFit?: SceneToken["imageFit"];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  } = {},
): Promise<SceneToken> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/tokens`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actorId,
        ...data,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao criar token na cena");
  }

  const responseData = await response.json();

  return responseData.token;
}

async function deleteSceneToken(campaignId: string, tokenId: string) {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/tokens/${tokenId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao remover token da cena");
  }

  const responseData = await response.json();

  return responseData.deletedTokenId as string;
}

async function updateSceneToken(
  campaignId: string,
  tokenId: string,
  data: Partial<
    Pick<
      SceneToken,
      | "name"
      | "initials"
      | "imageUrl"
      | "imageFit"
      | "x"
      | "y"
      | "width"
      | "height"
    >
  >,
): Promise<SceneToken> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/tokens/${tokenId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao atualizar token da cena");
  }

  const responseData = await response.json();

  return responseData.token;
}

async function updateCampaignActor(
  campaignId: string,
  actorId: string,
  data: Partial<
    Pick<
      CampaignActor,
      "location" | "name" | "initials" | "description" | "portraitUrl"
    >
  >,
): Promise<CampaignActor> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/actors/${actorId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao atualizar ator da campanha");
  }

  const responseData = await response.json();

  return responseData.actor;
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
  if (type === "PLAYER_CHARACTER") {
    return "Personagem";
  }

  if (type === "NPC") {
    return "NPC";
  }

  return "Criatura";
}

function getCharacterTypeStyles(type: CharacterType) {
  if (type === "PLAYER_CHARACTER") {
    return "border-forge-gold bg-forge-purple text-forge-gold";
  }

  if (type === "NPC") {
    return "border-purple-300/50 bg-purple-950 text-purple-100";
  }

  return "border-red-400/50 bg-red-950 text-red-100";
}

function getTokenImageFitClass(imageFit: SceneToken["imageFit"]) {
  if (imageFit === "CONTAIN") {
    return "object-contain";
  }

  if (imageFit === "FILL") {
    return "object-fill";
  }

  return "object-cover";
}

function getCharacterTokenImageFitClass(
  imageFit: CharacterBuilderDraft["tokenImageFit"],
) {
  if (imageFit === "CONTAIN") {
    return "object-contain";
  }

  if (imageFit === "FILL") {
    return "object-fill";
  }

  return "object-cover";
}

function normalizeDiceExpression(expression: string) {
  return expression.toLowerCase().replace(/\s+/g, "").replace(/d%/g, "d100");
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

function getVisibleActorsForUser(actors: CampaignActor[], isGM: boolean) {
  if (isGM) {
    return actors;
  }

  return actors.filter(
    (actor) => actor.type === "PLAYER_CHARACTER" && actor.location === "TABLE",
  );
}

type CharacterCreationMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartCharacterBuilder: () => void;
};

function CharacterCreationMenuModal({
  isOpen,
  onClose,
  onStartCharacterBuilder,
}: CharacterCreationMenuModalProps) {
  if (!isOpen) {
    return null;
  }

  const creationOptions = [
    {
      title: "Criar personagem",
      description:
        "Construa uma ficha passo a passo escolhendo ancestralidade, antecedente, classe, atributos, perícias, magias e equipamentos.",
      label: "Recomendado",
      isAvailable: true,
    },
    {
      title: "Criar NPC",
      description:
        "Crie uma ficha mais rápida para aliados, rivais, criaturas importantes ou personagens controlados pelo mestre.",
      label: "Em breve",
      isAvailable: false,
    },
    {
      title: "Editar ficha diretamente",
      description:
        "Abra uma ficha vazia e preencha os campos manualmente, sem passar pelo assistente guiado.",
      label: "Em breve",
      isAvailable: false,
    },
    {
      title: "Personagem pronto",
      description:
        "Escolha um personagem pré-montado para entrar rapidamente na aventura.",
      label: "Em breve",
      isAvailable: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-2xl border border-forge-gold/35 bg-[#18091f] shadow-[-10px_10px_0_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-forge-gold/20 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-forge-gold/70">
              LegendForge
            </p>

            <h2 className="mt-2 text-2xl font-black text-zinc-100">
              Como deseja criar sua ficha?
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
              Escolha um caminho inicial. Nesta fase, estamos preparando a base
              visual da criação de personagem antes de ligar cada etapa às
              regras do sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-red-400/70 hover:text-red-200"
          >
            Fechar
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          {creationOptions.map((option) => (
            <button
              key={option.title}
              type="button"
              disabled={!option.isAvailable}
              onClick={() => {
                if (option.title === "Criar personagem") {
                  onStartCharacterBuilder();
                }
              }}
              className={[
                "group relative min-h-40 rounded-2xl border p-5 text-left transition",
                "shadow-[-6px_6px_0_rgba(0,0,0,0.35)]",
                option.isAvailable
                  ? "border-forge-gold/45 bg-gradient-to-br from-zinc-950/95 to-[#2a1233] hover:-translate-y-0.5 hover:border-forge-gold hover:shadow-[-8px_8px_0_rgba(0,0,0,0.5)]"
                  : "cursor-not-allowed border-zinc-800 bg-zinc-950/50 opacity-55",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-100">
                    {option.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                    {option.description}
                  </p>
                </div>

                <span
                  className={[
                    "shrink-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]",
                    option.isAvailable
                      ? "bg-forge-gold text-zinc-950"
                      : "bg-zinc-800 text-zinc-400",
                  ].join(" ")}
                >
                  {option.label}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                  {option.isAvailable ? "Disponível agora" : "Planejado"}
                </span>

                <span
                  className={[
                    "text-sm font-black",
                    option.isAvailable
                      ? "text-forge-gold group-hover:text-amber-200"
                      : "text-zinc-600",
                  ].join(" ")}
                >
                  Entrar →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type CharacterAttributeKey =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";

type CharacterBuilderAttributes = Record<CharacterAttributeKey, number | null>;

type CharacterBuilderEquipmentMode = "PACKAGE" | "GOLD";

type CharacterSheetStatus = "DRAFT" | "READY" | "ARCHIVED";

type CharacterBuilderEquipmentDraftItem = {
  key: string;
  quantity: number;
  source: "class" | "background";
  notes?: string;
  isEquipped?: boolean;
};

type CharacterBuilderDraft = {
  name: string;
  pronouns: string;
  concept: string;
  portraitUrl: string;
  tokenImageUrl: string;
  tokenImageFit: "FILL" | "CONTAIN" | "COVER";

  classId: string;
  className: string;

  ancestryId: string;
  ancestryName: string;

  backgroundId: string;
  backgroundName: string;

  attributes: CharacterBuilderAttributes;
  skillKeys: string[];
  spellKeys: string[];
  equipmentItems: CharacterBuilderEquipmentDraftItem[];
  classEquipmentMode: CharacterBuilderEquipmentMode;
  backgroundEquipmentMode: CharacterBuilderEquipmentMode;
  startingGold: number;

  alignment: string;
  faith: string;
  lifestyle: string;

  hair: string;
  skin: string;
  eyes: string;
  height: string;
  weight: string;
  age: string;
  gender: string;

  bonds: string;
  flaws: string;
  ideals: string;
  personality: string;
  backstory: string;
  notes: string;
  gmNotes: string;
};

type CharacterBuilderOption = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

type CharacterBuilderClassOption = CharacterBuilderOption & {
  hitDie: number;
};

type CharacterBuilderAncestryOption = CharacterBuilderOption & {
  defaultSizeCategory: string;
};

type CharacterBuilderBackgroundOption = CharacterBuilderOption & {
  skillKeys: string[];
  toolNames: string[];
  languageChoiceCount: number;
  startingGold: number;
};

type CharacterBuilderSkillOption = CharacterBuilderOption & {
  statId: string;
  stat: {
    id: string;
    key: string;
    name: string;
    shortName: string;
  };
};

type CharacterBuilderSpellOption = CharacterBuilderOption & {
  level: number;
  school: string;
  castingTime: string | null;
  range: string | null;
  duration: string | null;
  components: string[];
  isRitual: boolean;
  requiresConcentration: boolean;
};

type CharacterBuilderEquipmentOption = CharacterBuilderOption & {
  category: string;
  damage: string | null;
  defense: number | null;
  cost: string | null;
  weight: number | null;
  properties: string | null;
};

type CharacterBuilderOptions = {
  classes: CharacterBuilderClassOption[];
  ancestries: CharacterBuilderAncestryOption[];
  backgrounds: CharacterBuilderBackgroundOption[];
  skills: CharacterBuilderSkillOption[];
  spells: CharacterBuilderSpellOption[];
  equipment: CharacterBuilderEquipmentOption[];
};

function isCantrip(spell: CharacterBuilderSpellOption) {
  return spell.level === 0;
}

function isLeveledSpell(spell: CharacterBuilderSpellOption) {
  return spell.level > 0;
}

function getSpellLevelLabel(level: number) {
  if (level === 0) {
    return "Truque";
  }

  return `Nível ${level}`;
}

function getCompactSpellDetail(value: string | null) {
  if (!value) {
    return "—";
  }

  return value
    .replace(/\bmetros\b/gi, "m")
    .replace(/\bmetro\b/gi, "m")
    .replace(/\bminutos\b/gi, "min.")
    .replace(/\bminuto\b/gi, "min.")
    .replace(/\binstantâneo\b/gi, "insta")
    .replace(/\binstantanea\b/gi, "insta")
    .replace(/\binstantânea\b/gi, "insta")
    .replace(/\binstantaneo\b/gi, "insta");
}

function getEquipmentCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    WEAPON: "Arma",
    ARMOR: "Armadura",
    SHIELD: "Escudo",
    GEAR: "Item",
    TOOL: "Ferramenta",
    CONSUMABLE: "Consumível",
    RELIC: "Relíquia",
  };

  return labels[category] ?? category;
}

function getEquipmentMainInfo(item: CharacterBuilderEquipmentOption) {
  if (item.damage) {
    return {
      label: "Dano",
      value: item.damage,
    };
  }

  if (item.defense !== null) {
    return {
      label: "Defesa",
      value: `+${item.defense}`,
    };
  }

  if (item.properties) {
    return {
      label: "Propriedades",
      value: item.properties,
    };
  }

  return {
    label: "Tipo",
    value: getEquipmentCategoryLabel(item.category),
  };
}

function formatEquipmentWeight(weight: number | null) {
  if (weight === null) {
    return "—";
  }

  return `${weight} kg`;
}

const EQUIPMENT_CATEGORY_ORDER = [
  "WEAPON",
  "ARMOR",
  "SHIELD",
  "TOOL",
  "GEAR",
  "CONSUMABLE",
  "RELIC",
] as const;

function getEquipmentCategoryDescription(category: string) {
  const descriptions: Record<string, string> = {
    WEAPON: "Armas usadas para ataques corpo a corpo ou à distância.",
    ARMOR: "Proteções vestidas para reduzir risco e aumentar defesa.",
    SHIELD: "Proteções empunhadas para bloquear golpes e proteger posição.",
    TOOL: "Ferramentas usadas em testes, ofícios, reparos ou especialidades.",
    GEAR: "Itens gerais de exploração, sobrevivência e aventura.",
    CONSUMABLE:
      "Itens de uso limitado, como tônicos, poções e recursos gastos.",
    RELIC:
      "Objetos raros, instáveis ou misteriosos ligados a magia e tecnologia antiga.",
  };

  return descriptions[category] ?? "Equipamentos variados deste sistema.";
}

function groupEquipmentByCategory(
  equipment: CharacterBuilderEquipmentOption[],
) {
  const categories = Array.from(
    new Set(equipment.map((item) => item.category)),
  ).sort((firstCategory, secondCategory) => {
    const firstIndex = EQUIPMENT_CATEGORY_ORDER.indexOf(
      firstCategory as (typeof EQUIPMENT_CATEGORY_ORDER)[number],
    );

    const secondIndex = EQUIPMENT_CATEGORY_ORDER.indexOf(
      secondCategory as (typeof EQUIPMENT_CATEGORY_ORDER)[number],
    );

    const normalizedFirstIndex =
      firstIndex === -1 ? EQUIPMENT_CATEGORY_ORDER.length : firstIndex;

    const normalizedSecondIndex =
      secondIndex === -1 ? EQUIPMENT_CATEGORY_ORDER.length : secondIndex;

    return normalizedFirstIndex - normalizedSecondIndex;
  });

  return categories.map((category) => ({
    category,
    label: getEquipmentCategoryLabel(category),
    description: getEquipmentCategoryDescription(category),
    items: equipment.filter((item) => item.category === category),
  }));
}

const STANDARD_ARRAY_ATTRIBUTE_VALUES = [15, 14, 13, 12, 10, 8];

const DEFAULT_CHARACTER_ATTRIBUTES: CharacterBuilderAttributes = {
  strength: null,
  dexterity: null,
  constitution: null,
  intelligence: null,
  wisdom: null,
  charisma: null,
};

const CHARACTER_ATTRIBUTE_DEFINITIONS: Array<{
  key: CharacterAttributeKey;
  name: string;
  shortName: string;
  description: string;
}> = [
  {
    key: "strength",
    name: "Força",
    shortName: "FOR",
    description:
      "Poder físico, empurrões, carga, ataques corpo a corpo e feitos brutos.",
  },
  {
    key: "dexterity",
    name: "Destreza",
    shortName: "DES",
    description:
      "Reflexos, precisão, furtividade, equilíbrio e agilidade em combate.",
  },
  {
    key: "constitution",
    name: "Constituição",
    shortName: "CON",
    description:
      "Resistência, vigor, fôlego, saúde e capacidade de suportar dor.",
  },
  {
    key: "intelligence",
    name: "Inteligência",
    shortName: "INT",
    description:
      "Raciocínio, memória, investigação, conhecimento e lógica arcana.",
  },
  {
    key: "wisdom",
    name: "Sabedoria",
    shortName: "SAB",
    description:
      "Percepção, instinto, intuição, sobrevivência e leitura do ambiente.",
  },
  {
    key: "charisma",
    name: "Carisma",
    shortName: "CAR",
    description:
      "Presença, liderança, influência, expressão artística e força de vontade social.",
  },
];

function calculateAttributeModifier(value: number) {
  return Math.floor((value - 10) / 2);
}

function formatAttributeModifier(value: number | null) {
  if (value === null) {
    return "—";
  }

  const modifier = calculateAttributeModifier(value);

  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function clampAttributeValue(value: number) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(3, Math.min(20, Math.round(value)));
}

function getPersistableCharacterAttributes(
  attributes: CharacterBuilderAttributes,
) {
  return Object.fromEntries(
    Object.entries(attributes).filter(([, value]) => value !== null),
  );
}

type CharacterSheetStatResponse = {
  baseValue: number;
  stat: {
    key: string;
  };
};

function isCharacterAttributeKey(key: string): key is CharacterAttributeKey {
  return CHARACTER_ATTRIBUTE_DEFINITIONS.some(
    (attribute) => attribute.key === key,
  );
}

const CHARACTER_BUILDER_LEVEL = 1;

function formatNumberModifier(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function getProficiencyBonusByLevel(level: number) {
  if (level >= 17) {
    return 6;
  }

  if (level >= 13) {
    return 5;
  }

  if (level >= 9) {
    return 4;
  }

  if (level >= 5) {
    return 3;
  }

  return 2;
}

function getAttributeValueByStatKey(
  attributes: CharacterBuilderAttributes,
  statKey: string,
) {
  if (!isCharacterAttributeKey(statKey)) {
    return null;
  }

  return attributes[statKey];
}

function getSkillCalculation({
  attributes,
  statKey,
  isProficient,
  level,
}: {
  attributes: CharacterBuilderAttributes;
  statKey: string;
  isProficient: boolean;
  level: number;
}) {
  const attributeValue = getAttributeValueByStatKey(attributes, statKey);
  const proficiencyBonus = isProficient ? getProficiencyBonusByLevel(level) : 0;

  if (attributeValue === null) {
    return {
      attributeModifier: null as number | null,
      proficiencyBonus,
      total: null as number | null,
      formattedAttributeModifier: "—",
      formattedProficiencyBonus: isProficient
        ? formatNumberModifier(proficiencyBonus)
        : "—",
      formattedTotal: "—",
    };
  }

  const attributeModifier = calculateAttributeModifier(attributeValue);
  const total = attributeModifier + proficiencyBonus;

  return {
    attributeModifier,
    proficiencyBonus,
    total,
    formattedAttributeModifier: formatNumberModifier(attributeModifier),
    formattedProficiencyBonus: isProficient
      ? formatNumberModifier(proficiencyBonus)
      : "—",
    formattedTotal: formatNumberModifier(total),
  };
}

function getCharacterSkillKeysFromSkills(
  skills?: Array<{
    skill: {
      key: string;
    };
  }> | null,
) {
  return skills?.map((sheetSkill) => sheetSkill.skill.key) ?? [];
}

function getCharacterSpellKeysFromSpells(
  spells?: Array<{
    spell: {
      key: string;
    };
  }> | null,
) {
  return spells?.map((sheetSpell) => sheetSpell.spell.key) ?? [];
}

function normalizeCharacterEquipmentMode(
  value?: string | null,
): CharacterBuilderEquipmentMode {
  return value === "GOLD" ? "GOLD" : "PACKAGE";
}

function getCharacterEquipmentItemsFromEquipment(
  equipment?: Array<{
    quantity: number;
    source: string | null;
    notes: string | null;
    isEquipped: boolean;
    equipment: {
      key: string;
    };
  }> | null,
): CharacterBuilderEquipmentDraftItem[] {
  return (
    equipment?.map((sheetEquipment) => ({
      key: sheetEquipment.equipment.key,
      quantity: sheetEquipment.quantity,
      source: sheetEquipment.source === "background" ? "background" : "class",
      notes: sheetEquipment.notes ?? undefined,
      isEquipped: sheetEquipment.isEquipped,
    })) ?? []
  );
}

type StartingEquipmentPlan = {
  label: string;
  description: string;
  gold: number;
  items: CharacterBuilderEquipmentDraftItem[];
  proficiencies: string[];
};

function getClassStartingEquipmentPlan(
  selectedClass: CharacterBuilderClassOption | undefined,
): StartingEquipmentPlan {
  if (!selectedClass) {
    return {
      label: "Classe não selecionada",
      description:
        "Escolha uma classe para ver o pacote inicial e a alternativa em moedas.",
      gold: 0,
      items: [],
      proficiencies: [],
    };
  }

  const plans: Record<string, StartingEquipmentPlan> = {
    barbarian: {
      label: "Pacote do Bárbaro",
      description:
        "Um conjunto bruto para combate direto e exploração em regiões perigosas.",
      gold: 20,
      proficiencies: ["Armas marciais", "Armaduras leves", "Escudos"],
      items: [
        {
          key: "heavy-axe",
          quantity: 1,
          source: "class",
          notes: "Arma inicial da classe",
          isEquipped: true,
        },
        {
          key: "shortbow",
          quantity: 1,
          source: "class",
          notes: "Opção simples de ataque à distância",
        },
        {
          key: "survival-kit",
          quantity: 1,
          source: "class",
          notes: "Pacote de sobrevivência",
        },
      ],
    },
    bard: {
      label: "Pacote do Bardo",
      description: "Equipamento leve para estrada, atuação e defesa básica.",
      gold: 20,
      proficiencies: ["Armas simples", "Instrumentos musicais", "Atuação"],
      items: [
        {
          key: "dagger",
          quantity: 1,
          source: "class",
          notes: "Arma leve inicial",
          isEquipped: true,
        },
        {
          key: "leather-armor",
          quantity: 1,
          source: "class",
          notes: "Proteção leve",
          isEquipped: true,
        },
        {
          key: "adventurer-pouch",
          quantity: 1,
          source: "class",
          notes: "Bolsa de viagem",
        },
      ],
    },
    rogue: {
      label: "Pacote do Ladino",
      description:
        "Ferramentas discretas para infiltração, mobilidade e sobrevivência urbana.",
      gold: 18,
      proficiencies: ["Armas simples", "Ferramentas de ladrão", "Furtividade"],
      items: [
        {
          key: "dagger",
          quantity: 2,
          source: "class",
          notes: "Armas leves iniciais",
          isEquipped: true,
        },
        {
          key: "leather-armor",
          quantity: 1,
          source: "class",
          notes: "Proteção leve",
          isEquipped: true,
        },
        {
          key: "thieves-tools",
          quantity: 1,
          source: "class",
          notes: "Ferramenta de classe",
        },
      ],
    },
    fighter: {
      label: "Pacote do Guerreiro",
      description: "Equipamento marcial equilibrado para linha de frente.",
      gold: 25,
      proficiencies: ["Armas simples", "Armas marciais", "Armaduras"],
      items: [
        {
          key: "longsword",
          quantity: 1,
          source: "class",
          notes: "Arma marcial inicial",
          isEquipped: true,
        },
        {
          key: "reinforced-mail",
          quantity: 1,
          source: "class",
          notes: "Armadura inicial",
          isEquipped: true,
        },
        {
          key: "simple-shield",
          quantity: 1,
          source: "class",
          notes: "Defesa inicial",
          isEquipped: true,
        },
      ],
    },
    technomancer: {
      label: "Pacote do Tecnomante",
      description:
        "Ferramentas e itens para reparos, improviso e tecnologia antiga.",
      gold: 22,
      proficiencies: ["Ferramentas tecnológicas", "Reparo", "Dispositivos"],
      items: [
        {
          key: "technomancer-tools",
          quantity: 1,
          source: "class",
          notes: "Ferramenta principal da classe",
        },
        {
          key: "field-tonic",
          quantity: 1,
          source: "class",
          notes: "Consumível inicial",
        },
        {
          key: "adventurer-pouch",
          quantity: 1,
          source: "class",
          notes: "Bolsa de componentes",
        },
      ],
    },
    necromancer: {
      label: "Pacote do Necromante",
      description:
        "Recursos sombrios e proteção mínima para um conjurador iniciante.",
      gold: 18,
      proficiencies: ["Armas simples", "Relíquias fúnebres", "Ocultismo"],
      items: [
        {
          key: "dagger",
          quantity: 1,
          source: "class",
          notes: "Arma simples inicial",
          isEquipped: true,
        },
        {
          key: "broken-relic",
          quantity: 1,
          source: "class",
          notes: "Foco narrativo inicial",
        },
        {
          key: "adventurer-pouch",
          quantity: 1,
          source: "class",
          notes: "Bolsa de componentes",
        },
      ],
    },
  };

  return (
    plans[selectedClass.key] ?? {
      label: `Pacote de ${selectedClass.name}`,
      description:
        "Pacote inicial genérico enquanto as regras específicas desta classe são refinadas.",
      gold: 15,
      proficiencies: [
        "Proficiências específicas da classe serão refinadas depois",
      ],
      items: [
        {
          key: "dagger",
          quantity: 1,
          source: "class",
          notes: "Arma simples inicial",
          isEquipped: true,
        },
        {
          key: "adventurer-pouch",
          quantity: 1,
          source: "class",
          notes: "Bolsa inicial",
        },
      ],
    }
  );
}

function getBackgroundStartingEquipmentPlan(
  selectedBackground: CharacterBuilderBackgroundOption | undefined,
): StartingEquipmentPlan {
  if (!selectedBackground) {
    return {
      label: "Antecedente não selecionado",
      description:
        "Escolha um antecedente para ver os itens de origem e a alternativa em moedas.",
      gold: 0,
      items: [],
      proficiencies: [],
    };
  }

  const commonItemsByBackgroundKey: Record<
    string,
    CharacterBuilderEquipmentDraftItem[]
  > = {
    "alley-blade": [
      {
        key: "crowbar",
        quantity: 1,
        source: "background",
        notes: "Item do antecedente",
      },
      {
        key: "dagger",
        quantity: 1,
        source: "background",
        notes: "Item do antecedente",
      },
    ],
    "gutter-child": [
      {
        key: "thieves-tools",
        quantity: 1,
        source: "background",
        notes: "Ferramenta do antecedente",
      },
      {
        key: "dagger",
        quantity: 1,
        source: "background",
        notes: "Item do antecedente",
      },
    ],
    "relic-hunter": [
      {
        key: "crowbar",
        quantity: 1,
        source: "background",
        notes: "Ferramenta de exploração",
      },
      {
        key: "broken-relic",
        quantity: 1,
        source: "background",
        notes: "Relíquia inicial",
      },
    ],
    "frontier-walker": [
      {
        key: "survival-kit",
        quantity: 1,
        source: "background",
        notes: "Kit de fronteira",
      },
      {
        key: "shortbow",
        quantity: 1,
        source: "background",
        notes: "Arma de caça",
      },
    ],
    "collapse-survivor": [
      {
        key: "survival-kit",
        quantity: 1,
        source: "background",
        notes: "Kit de sobrevivente",
      },
      {
        key: "field-tonic",
        quantity: 1,
        source: "background",
        notes: "Consumível inicial",
      },
    ],
  };

  return {
    label: `Origem: ${selectedBackground.name}`,
    description:
      selectedBackground.description ??
      "Itens recebidos pela história do personagem antes da aventura.",
    gold: selectedBackground.startingGold,
    proficiencies: selectedBackground.toolNames,
    items: commonItemsByBackgroundKey[selectedBackground.key] ?? [
      {
        key: "adventurer-pouch",
        quantity: 1,
        source: "background",
        notes: `Item inicial de ${selectedBackground.name}`,
      },
    ],
  };
}

function mergeStartingEquipmentItems(
  items: CharacterBuilderEquipmentDraftItem[],
) {
  const mergedItems = new Map<string, CharacterBuilderEquipmentDraftItem>();

  for (const item of items) {
    const currentItem = mergedItems.get(item.key);

    if (currentItem) {
      mergedItems.set(item.key, {
        ...currentItem,
        quantity: currentItem.quantity + item.quantity,
        isEquipped: currentItem.isEquipped || item.isEquipped,
      });

      continue;
    }

    mergedItems.set(item.key, item);
  }

  return Array.from(mergedItems.values());
}

function getStartingEquipmentItemsFromDraft(
  draft: CharacterBuilderDraft,
  options: CharacterBuilderOptions,
) {
  const selectedClass = options.classes.find(
    (option) => option.id === draft.classId,
  );

  const selectedBackground = options.backgrounds.find(
    (option) => option.id === draft.backgroundId,
  );

  const classPlan = getClassStartingEquipmentPlan(selectedClass);
  const backgroundPlan = getBackgroundStartingEquipmentPlan(selectedBackground);

  return mergeStartingEquipmentItems([
    ...(draft.classEquipmentMode === "PACKAGE" ? classPlan.items : []),
    ...(draft.backgroundEquipmentMode === "PACKAGE"
      ? backgroundPlan.items
      : []),
  ]);
}

function getStartingGoldFromDraft(
  draft: CharacterBuilderDraft,
  options: CharacterBuilderOptions,
) {
  const selectedClass = options.classes.find(
    (option) => option.id === draft.classId,
  );

  const selectedBackground = options.backgrounds.find(
    (option) => option.id === draft.backgroundId,
  );

  const classPlan = getClassStartingEquipmentPlan(selectedClass);
  const backgroundPlan = getBackgroundStartingEquipmentPlan(selectedBackground);

  return (
    (draft.classEquipmentMode === "GOLD" ? classPlan.gold : 0) +
    (draft.backgroundEquipmentMode === "GOLD" ? backgroundPlan.gold : 0)
  );
}

function getCharacterAttributesFromStats(
  stats?: CharacterSheetStatResponse[] | null,
): CharacterBuilderAttributes {
  const attributes = {
    ...DEFAULT_CHARACTER_ATTRIBUTES,
  };

  stats?.forEach((sheetStat) => {
    const key = sheetStat.stat.key;

    if (!isCharacterAttributeKey(key)) {
      return;
    }

    attributes[key] = clampAttributeValue(sheetStat.baseValue);
  });

  return attributes;
}

type CharacterBuilderStep = {
  id: string;
  title: string;
  description: string;
};

const characterBuilderSteps: CharacterBuilderStep[] = [
  {
    id: "concept",
    title: "Conceito",
    description: "Nome, ideia central, imagem e direção inicial do personagem.",
  },
  {
    id: "class",
    title: "Classe",
    description: "Escolha a função principal do personagem na aventura.",
  },
  {
    id: "ancestry",
    title: "Ancestralidade",
    description: "Defina a origem biológica, cultural ou mutada do personagem.",
  },
  {
    id: "background",
    title: "Antecedente",
    description: "Escolha de onde o personagem veio antes da aventura começar.",
  },
  {
    id: "attributes",
    title: "Atributos",
    description: "Distribua os valores principais da ficha.",
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha treinamentos, especialidades e proficiências.",
  },
  {
    id: "spells",
    title: "Magias",
    description: "Selecione truques, magias e poderes conhecidos.",
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "Escolha armas, armaduras, ferramentas e itens iniciais.",
  },
  {
    id: "about",
    title: "Sobre",
    description: "Adicione aparência, personalidade, história e notas.",
  },
  {
    id: "review",
    title: "Revisão",
    description: "Confira tudo antes de finalizar a ficha.",
  },
];

type CharacterBuilderModalProps = {
  isOpen: boolean;
  activeStepId: string;
  draft: CharacterBuilderDraft;
  options: CharacterBuilderOptions;
  isLoadingOptions: boolean;
  optionsError: string | null;
  savedCharacterSheetId: string | null;
  savedCharacterSheetStatus: CharacterSheetStatus | null;
  isSavingDraft: boolean;
  isFinalizingSheet: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  onSaveDraft: () => void;
  onFinalizeSheet: () => void;
  onChangeDraft: (draft: CharacterBuilderDraft) => void;
  onSelectOption: (
    type: "class" | "ancestry" | "background",
    option: {
      id: string;
      name: string;
      skillKeys?: string[];
    },
  ) => void;
  onChangeStep: (stepId: string) => void;
  onClose: () => void;
};

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
    onChangeDraft({
      ...draft,
      [key]: value,
    });
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

  const requiredSkillChoiceCount = selectedBackground?.skillKeys.length ?? 2;

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
      return `Escolha pelo menos ${requiredSkillChoiceCount} perícias. Atualmente você escolheu ${selectedSkillCount}.`;
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
                  {savedCharacterSheetStatus === "READY" ? "Pronta" : savedCharacterSheetId ? "Salvo" : "Rascunho"}
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
                      getOptionTitle={(option) => {
                        const hitDieText = option.hitDie
                          ? `Dado de vida: d${option.hitDie}.`
                          : "Dado de vida: em breve.";

                        return `${option.name}: ${
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
                      getOptionTitle={(option) => {
                        const sizeText = option.defaultSizeCategory
                          ? `Tamanho padrão: ${option.defaultSizeCategory}.`
                          : "Tamanho padrão: em breve.";

                        return `${option.name}: ${
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

                        return `${option.name}: ${
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
                      selectedBackground={selectedBackground}
                      attributes={draft.attributes}
                      selectedSkillKeys={draft.skillKeys}
                      requiredSkillChoiceCount={requiredSkillChoiceCount}
                      isLoading={isLoadingOptions}
                      error={optionsError}
                      onToggleSkill={(skillKey) => {
                        const isSelected = draft.skillKeys.includes(skillKey);

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
                      selectedClass={selectedClass}
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
                      selectedClass={selectedClass}
                      selectedBackground={selectedBackground}
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
                      selectedClass={selectedClass}
                      selectedAncestry={selectedAncestry}
                      selectedBackground={selectedBackground}
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
                      value={
                        (selectedClass?.name ?? draft.className) ||
                        "Não definida"
                      }
                    />

                    <BuilderSummaryRow
                      label="Ancestralidade"
                      value={
                        (selectedAncestry?.name ?? draft.ancestryName) ||
                        "Não definida"
                      }
                    />

                    <BuilderSummaryRow
                      label="Antecedente"
                      value={
                        (selectedBackground?.name ?? draft.backgroundName) ||
                        "Não definido"
                      }
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
                      value={savedCharacterSheetStatus === "READY" ? "Pronta" : savedCharacterSheetId ? "Salvo" : "Rascunho"}
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

type CharacterBuilderSelectableOption = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  hitDie?: number;
  defaultSizeCategory?: string;
  skillKeys?: string[];
};

function CharacterBuilderOptionCards({
  title,
  description,
  options,
  isLoading,
  error,
  emptyMessage,
  selectedId,
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

          const titleText =
            getOptionTitle?.(option) ?? `${option.name}: ${optionDescription}`;

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
                      title={option.name}
                    >
                      {option.name}
                    </h4>

                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                      title={titleText}
                      aria-label={`Informação sobre ${option.name}`}
                    >
                      i
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span
                    className="shrink-0 rounded-full border border-forge-gold bg-forge-gold px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-black"
                    title="Opção selecionada"
                  >
                    Selecionado
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

type CharacterAttributesStepProps = {
  attributes: CharacterBuilderAttributes;
  onChangeAttribute: (
    attributeKey: CharacterAttributeKey,
    value: number | null,
  ) => void;
  onResetAttributes: () => void;
};

function CharacterAttributesStep({
  attributes,
  onChangeAttribute,
  onResetAttributes,
}: CharacterAttributesStepProps) {
  const selectedValues = CHARACTER_ATTRIBUTE_DEFINITIONS.map(
    (attribute) => attributes[attribute.key],
  ).filter((value): value is number => value !== null);

  const remainingValues = STANDARD_ARRAY_ATTRIBUTE_VALUES.filter(
    (value) => !selectedValues.includes(value),
  );

  const isComplete =
    selectedValues.length === STANDARD_ARRAY_ATTRIBUTE_VALUES.length;

  const statusTitle = isComplete
    ? "Distribuição completa. Você já pode seguir para a próxima etapa."
    : remainingValues.length > 0
      ? `Ainda faltam: ${remainingValues.join(", ")}`
      : "Revise a distribuição dos atributos.";

  return (
    <div className="mt-5 space-y-5">
      <div
        className="rounded-2xl border border-forge-gold/25 bg-[#16091d] p-4 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]"
        title="Escolha onde cada valor será usado. Cada número pode entrar em apenas um atributo."
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-forge-gold/80">
                Forja padrão
              </p>

              <span
                className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                title="Distribua 15, 14, 13, 12, 10 e 8 sem repetir valores."
                aria-label="Informação sobre distribuição de atributos"
              >
                i
              </span>
            </div>

            <h3 className="mt-2 text-xl font-black text-zinc-100">
              Distribua seus valores de atributo
            </h3>
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            title={statusTitle}
          >
            {STANDARD_ARRAY_ATTRIBUTE_VALUES.map((value) => {
              const isUsed = selectedValues.includes(value);

              return (
                <span
                  key={value}
                  className={[
                    "rounded-xl border px-3 py-2 text-sm font-black",
                    isUsed
                      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                      : "border-forge-gold/40 bg-forge-gold/10 text-forge-gold",
                  ].join(" ")}
                  title={
                    isUsed
                      ? `Valor ${value} já distribuído.`
                      : `Valor ${value} ainda disponível.`
                  }
                >
                  {value}
                </span>
              );
            })}

            <button
              type="button"
              onClick={onResetAttributes}
              title="Limpar distribuição de atributos"
              className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-red-400/60 hover:text-red-200"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CHARACTER_ATTRIBUTE_DEFINITIONS.map((attribute) => {
          const value = attributes[attribute.key];
          const modifier = formatAttributeModifier(value);

          return (
            <article
              key={attribute.key}
              className={[
                "rounded-2xl border bg-zinc-950/50 p-4 transition shadow-[-4px_4px_0_rgba(0,0,0,0.25)]",
                value === null
                  ? "border-zinc-800"
                  : "border-forge-gold/45 bg-forge-gold/5",
              ].join(" ")}
            >
              <div
                className="grid grid-cols-[minmax(0,1fr)_80px] items-start gap-3"
                title={attribute.description}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-forge-gold/80">
                      {attribute.shortName}
                    </p>

                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                      title={attribute.description}
                      aria-label={`Informação sobre ${attribute.name}`}
                    >
                      i
                    </span>
                  </div>

                  <h4
                    className="mt-1 whitespace-nowrap text-[13px] font-black leading-tight text-zinc-100"
                    title={attribute.name}
                  >
                    {attribute.name}
                  </h4>
                </div>

                <div
                  className="w-20 shrink-0 rounded-2xl border border-forge-gold/30 bg-black/35 px-2 py-2 text-center"
                  title={`${attribute.name}: valor ${
                    value ?? "não definido"
                  }, modificador ${modifier}`}
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Valor
                  </p>

                  <p className="text-xl font-black leading-none text-zinc-100">
                    {value ?? "—"}
                  </p>

                  <p className="mt-1 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.08em] text-forge-gold">
                    Mod. {modifier}
                  </p>
                </div>
              </div>

              <div
                className="mt-4 grid grid-cols-6 gap-2"
                title={`Escolha um valor fixo para ${attribute.name}. Valores já usados em outros atributos ficam bloqueados.`}
              >
                {STANDARD_ARRAY_ATTRIBUTE_VALUES.map((optionValue) => {
                  const usedByOtherAttribute =
                    CHARACTER_ATTRIBUTE_DEFINITIONS.find((definition) => {
                      return (
                        definition.key !== attribute.key &&
                        attributes[definition.key] === optionValue
                      );
                    });

                  const isSelected = value === optionValue;
                  const isUnavailable = Boolean(usedByOtherAttribute);

                  return (
                    <button
                      key={optionValue}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() =>
                        onChangeAttribute(attribute.key, optionValue)
                      }
                      className={[
                        "h-10 rounded-xl border text-sm font-black transition",
                        isSelected
                          ? "border-forge-gold bg-forge-gold text-zinc-950 shadow-[-3px_3px_0_rgba(0,0,0,0.35)]"
                          : isUnavailable
                            ? "cursor-not-allowed border-zinc-800 bg-black/20 text-zinc-700"
                            : "border-zinc-700 bg-black/30 text-zinc-200 hover:border-forge-gold/70 hover:bg-forge-gold/10 hover:text-forge-gold",
                      ].join(" ")}
                      title={
                        usedByOtherAttribute
                          ? `Já usado em ${usedByOtherAttribute.name}`
                          : `Escolher ${optionValue} para ${attribute.name}`
                      }
                    >
                      {optionValue}
                    </button>
                  );
                })}
              </div>

              {value !== null ? (
                <button
                  type="button"
                  onClick={() => onChangeAttribute(attribute.key, null)}
                  title={`Remover valor de ${attribute.name}`}
                  className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600 transition hover:text-red-300"
                >
                  Limpar
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

type CharacterSkillsStepProps = {
  skills: CharacterBuilderSkillOption[];
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
  attributes: CharacterBuilderAttributes;
  selectedSkillKeys: string[];
  requiredSkillChoiceCount: number;
  isLoading: boolean;
  error: string | null;
  onToggleSkill: (skillKey: string) => void;
};

function CharacterSkillsStep({
  skills,
  selectedBackground,
  attributes,
  selectedSkillKeys,
  requiredSkillChoiceCount,
  isLoading,
  error,
  onToggleSkill,
}: CharacterSkillsStepProps) {
  const suggestedSkillKeys = selectedBackground?.skillKeys ?? [];
  const selectedCount = selectedSkillKeys.length;
  const isComplete = selectedCount >= requiredSkillChoiceCount;
  const proficiencyBonus = getProficiencyBonusByLevel(CHARACTER_BUILDER_LEVEL);

  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando perícias...
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

  if (skills.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm font-bold text-zinc-400">
        Nenhuma perícia encontrada para este sistema.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <div
        className="rounded-2xl border border-forge-gold/25 bg-[#16091d] p-4 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]"
        title="Clique nas perícias para marcar seus treinamentos. O total soma o modificador do atributo-base com o bônus de proficiência quando a perícia está selecionada."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-forge-gold/80">
                Treinamentos
              </p>

              <span
                className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                title="As perícias selecionadas recebem bônus de proficiência no total final."
                aria-label="Informação sobre perícias"
              >
                i
              </span>
            </div>

            <h3 className="mt-2 text-xl font-black text-zinc-100">
              Escolha suas perícias
            </h3>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
            <div
              className={[
                "min-w-28 rounded-xl border px-4 py-3",
                isComplete
                  ? "border-emerald-400/30 bg-emerald-500/10"
                  : "border-amber-400/25 bg-amber-300/10",
              ].join(" ")}
              title={`Selecionadas: ${selectedCount}. Necessárias: ${requiredSkillChoiceCount}.`}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                Selecionadas
              </p>

              <p
                className={[
                  "mt-1 text-2xl font-black leading-none",
                  isComplete ? "text-emerald-200" : "text-amber-100",
                ].join(" ")}
              >
                {selectedCount}/{requiredSkillChoiceCount}
              </p>
            </div>

            <div
              className="min-w-28 rounded-xl border border-forge-gold/30 bg-black/25 px-4 py-3"
              title={`Bônus de proficiência atual no nível ${CHARACTER_BUILDER_LEVEL}: ${formatNumberModifier(
                proficiencyBonus,
              )}.`}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                Proficiência
              </p>

              <p className="mt-1 text-2xl font-black leading-none text-forge-gold">
                {formatNumberModifier(proficiencyBonus)}
              </p>
            </div>
          </div>
        </div>

        {selectedBackground ? (
          <div
            className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100"
            title={`Antecedente selecionado: ${selectedBackground.name}. As sugestões iniciais foram aplicadas.`}
          >
            Antecedente selecionado: {selectedBackground.name}
          </div>
        ) : (
          <div
            className="mt-4 rounded-xl border border-amber-400/25 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100"
            title="Escolha um antecedente para receber sugestões automáticas."
          >
            Sem antecedente selecionado
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-1 xl:grid-cols-2">
        {skills.map((skill) => {
          const isSuggestedByBackground = suggestedSkillKeys.includes(
            skill.key,
          );
          const isSelected = selectedSkillKeys.includes(skill.key);

          const skillCalculation = getSkillCalculation({
            attributes,
            statKey: skill.stat.key,
            isProficient: isSelected,
            level: CHARACTER_BUILDER_LEVEL,
          });

          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => onToggleSkill(skill.key)}
              className={[
                "rounded-2xl border p-4 text-left transition shadow-[-4px_4px_0_rgba(0,0,0,0.25)]",
                isSelected
                  ? "border-forge-gold bg-forge-gold/10"
                  : isSuggestedByBackground
                    ? "border-emerald-400/45 bg-emerald-500/10"
                    : "border-zinc-800 bg-zinc-950/50 hover:border-forge-gold/40 hover:bg-forge-gold/5",
              ].join(" ")}
              title={
                skill.description
                  ? `${skill.name}: ${skill.description}`
                  : `${skill.name}. Usa ${skill.stat.name} como atributo-base.`
              }
            >
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold/80"
                      title={`Atributo-base: ${skill.stat.name}`}
                    >
                      {skill.stat.shortName}
                    </p>

                    {skill.description ? (
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                        title={skill.description}
                        aria-label={`Informação sobre ${skill.name}`}
                      >
                        i
                      </span>
                    ) : null}

                    {isSuggestedByBackground ? (
                      <span
                        className="rounded-full border border-emerald-400/50 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-200"
                        title="Sugerida pelo antecedente selecionado"
                      >
                        Sugerida
                      </span>
                    ) : null}

                    {isSelected ? (
                      <span
                        className="rounded-full border border-forge-gold/60 bg-forge-gold/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-forge-gold"
                        title="Perícia selecionada"
                      >
                        Selecionada
                      </span>
                    ) : null}
                  </div>

                  <h4
                    className="mt-2 text-[15px] font-black leading-tight text-zinc-100"
                    title={skill.name}
                  >
                    {skill.name}
                  </h4>
                </div>

                <div
                  className="rounded-xl border border-forge-gold/30 bg-black/35 px-4 py-3"
                  title={`Cálculo: ${skill.stat.shortName} ${skillCalculation.formattedAttributeModifier} + Proficiência ${skillCalculation.formattedProficiencyBonus} = Total ${skillCalculation.formattedTotal}.`}
                >
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        Base
                      </p>
                      <p className="mt-1 text-sm font-black leading-none text-zinc-100">
                        {skill.stat.shortName}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        Mod.
                      </p>
                      <p className="mt-1 text-sm font-black leading-none text-zinc-100">
                        {skillCalculation.formattedAttributeModifier}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        Prof.
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-black leading-none",
                          isSelected ? "text-emerald-200" : "text-zinc-600",
                        ].join(" ")}
                      >
                        {skillCalculation.formattedProficiencyBonus}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        Total
                      </p>
                      <p
                        className={[
                          "mt-1 text-base font-black leading-none",
                          isSelected ? "text-forge-gold" : "text-zinc-400",
                        ].join(" ")}
                      >
                        {skillCalculation.formattedTotal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type CharacterSpellsStepProps = {
  spells: CharacterBuilderSpellOption[];
  selectedClass: CharacterBuilderClassOption | undefined;
  selectedSpellKeys: string[];
  isLoading: boolean;
  error: string | null;
  onToggleSpell: (spellKey: string) => void;
};

type SpellTypeFilter = "all" | "cantrips" | "spells";

function getSpellTitle(spell: CharacterBuilderSpellOption) {
  const description = spell.description ?? "Sem descrição cadastrada.";
  const components =
    spell.components.length > 0 ? spell.components.join(", ") : "não informado";
  const castingTime = spell.castingTime ?? "não informado";
  const range = spell.range ?? "não informado";
  const duration = spell.duration ?? "não informado";
  const ritualText = spell.isRitual ? "Sim" : "Não";
  const concentrationText = spell.requiresConcentration ? "Sim" : "Não";

  return `${spell.name}: ${description} Tipo: ${getSpellLevelLabel(spell.level)}. Escola: ${spell.school}. Tempo de conjuração: ${castingTime}. Alcance: ${range}. Duração: ${duration}. Componentes: ${components}. Ritual: ${ritualText}. Concentração: ${concentrationText}. Features/efeitos avançados da magia: em breve. Filtro por classe e progressão de truques/magias por nível: em breve.`;
}

function getSpellSearchContent(spell: CharacterBuilderSpellOption) {
  return [
    spell.name,
    spell.description,
    spell.school,
    getSpellLevelLabel(spell.level),
    spell.castingTime,
    spell.range,
    spell.duration,
    spell.components.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterSpellByType(
  spell: CharacterBuilderSpellOption,
  typeFilter: SpellTypeFilter,
) {
  if (typeFilter === "cantrips") {
    return isCantrip(spell);
  }

  if (typeFilter === "spells") {
    return isLeveledSpell(spell);
  }

  return true;
}

function CharacterSpellCard({
  spell,
  isSelected,
  onToggleSpell,
}: {
  spell: CharacterBuilderSpellOption;
  isSelected: boolean;
  onToggleSpell: (spellKey: string) => void;
}) {
  const spellTitle = getSpellTitle(spell);
  const componentsText =
    spell.components.length > 0 ? spell.components.join(", ") : "—";

  return (
    <button
      type="button"
      onClick={() => onToggleSpell(spell.key)}
      className={[
        "w-full rounded-2xl border p-4 text-left shadow-[-4px_4px_0_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5",
        isSelected
          ? "border-forge-gold bg-forge-gold/10"
          : "border-zinc-800 bg-zinc-950/50 hover:border-forge-gold/50 hover:bg-forge-purple/15",
      ].join(" ")}
      title={spellTitle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold/80">
              {getSpellLevelLabel(spell.level)}
            </p>

            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
              title={spellTitle}
              aria-label={`Informação sobre ${spell.name}`}
            >
              i
            </span>

            {spell.requiresConcentration ? (
              <span
                className="rounded-full border border-purple-300/40 bg-purple-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-purple-200"
                title="Esta magia exige concentração."
              >
                Concentração
              </span>
            ) : null}

            {spell.isRitual ? (
              <span
                className="rounded-full border border-sky-300/40 bg-sky-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-sky-200"
                title="Esta magia pode ser conjurada como ritual."
              >
                Ritual
              </span>
            ) : null}

            {isSelected ? (
              <span
                className="rounded-full border border-forge-gold bg-forge-gold px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-black"
                title="Magia selecionada para o rascunho."
              >
                Selecionada
              </span>
            ) : null}
          </div>

          <h4
            className="mt-2 break-words text-[15px] font-black leading-tight text-zinc-100"
            title={spell.name}
          >
            {spell.name}
          </h4>
        </div>
      </div>

      <div
        className="mt-4 grid gap-2 rounded-xl border border-forge-gold/25 bg-black/30 p-3 text-xs"
        title={spellTitle}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Escola
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={spell.school}
            >
              {spell.school}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Componentes
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={
                spell.components.length > 0
                  ? spell.components.join(", ")
                  : "Não informado"
              }
            >
              {componentsText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-forge-gold/10 pt-2">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Tempo
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={spell.castingTime ?? "Não informado"}
            >
              {getCompactSpellDetail(spell.castingTime)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Alcance
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={spell.range ?? "Não informado"}
            >
              {getCompactSpellDetail(spell.range)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Duração
            </p>

            <p
              className="mt-1 break-words text-[10px] font-black leading-tight text-zinc-100"
              title={spell.duration ?? "Não informado"}
            >
              {getCompactSpellDetail(spell.duration)}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}


const PRONOUN_OPTIONS = ["ela / dela", "ele / dele", "elu / delu"];

const ALIGNMENT_OPTIONS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
];

const GENDER_OPTIONS = ["Masculino", "Feminino", "Não binário"];

const LIFESTYLE_OPTIONS = [
  "Miserável",
  "Pobre",
  "Modesto",
  "Confortável",
  "Rico",
  "Aristocrático",
  "Nômade",
  "Militar",
  "Clandestino",
];

function hasAboutValue(value: string) {
  return value.trim().length > 0;
}

function countFilledAboutFields(draft: CharacterBuilderDraft) {
  const fields = [
    draft.pronouns,
    draft.concept,
    draft.alignment,
    draft.faith,
    draft.lifestyle,
    draft.hair,
    draft.skin,
    draft.eyes,
    draft.height,
    draft.weight,
    draft.age,
    draft.gender,
    draft.bonds,
    draft.flaws,
    draft.ideals,
    draft.personality,
    draft.backstory,
    draft.notes,
    draft.gmNotes,
  ];

  return fields.filter(hasAboutValue).length;
}

function getPhysicalSummary(draft: CharacterBuilderDraft) {
  const values = [
    draft.hair ? `Cabelo: ${draft.hair}` : "",
    draft.skin ? `Pele: ${draft.skin}` : "",
    draft.eyes ? `Olhos: ${draft.eyes}` : "",
    draft.height ? `Altura: ${draft.height}` : "",
    draft.weight ? `Peso: ${draft.weight}` : "",
    draft.age ? `Idade: ${draft.age}` : "",
    draft.gender ? `Gênero: ${draft.gender}` : "",
  ].filter(Boolean);

  return values.length > 0 ? values.join(" • ") : "Não definida";
}

function getNarrativeSummary(draft: CharacterBuilderDraft) {
  const values = [
    draft.alignment ? `Alinhamento: ${draft.alignment}` : "",
    draft.faith ? `Fé: ${draft.faith}` : "",
    draft.lifestyle ? `Estilo: ${draft.lifestyle}` : "",
  ].filter(Boolean);

  return values.length > 0 ? values.join(" • ") : "Não definida";
}

function CharacterAboutSummaryPanel({
  draft,
}: {
  draft: CharacterBuilderDraft;
}) {
  const filledFieldsCount = countFilledAboutFields(draft);

  return (
    <div className="rounded-2xl border border-forge-gold/25 bg-black/25 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-forge-gold">
          Sobre
        </p>

        <span
          className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold"
          title={`${filledFieldsCount} campos narrativos preenchidos.`}
        >
          {filledFieldsCount} campos
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div
          className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-3"
          title={getNarrativeSummary(draft)}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
            Identidade
          </p>

          <p className="mt-1 text-xs font-bold leading-relaxed text-zinc-200">
            {getNarrativeSummary(draft)}
          </p>
        </div>

        <div
          className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-3"
          title={getPhysicalSummary(draft)}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
            Aparência
          </p>

          <p className="mt-1 text-xs font-bold leading-relaxed text-zinc-200">
            {getPhysicalSummary(draft)}
          </p>
        </div>

        <div
          className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-3"
          title={draft.backstory || "História ainda não preenchida."}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
            História
          </p>

          <p className="mt-1 line-clamp-4 text-xs font-bold leading-relaxed text-zinc-200">
            {draft.backstory || "Ainda sem história."}
          </p>
        </div>
      </div>
    </div>
  );
}

type CharacterAboutInputFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  title: string;
  onChange: (value: string) => void;
};

function CharacterAboutInputField({
  label,
  value,
  placeholder,
  title,
  onChange,
}: CharacterAboutInputFieldProps) {
  return (
    <label className="block" title={title}>
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm font-bold text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-forge-gold/40 focus:border-forge-gold"
      />
    </label>
  );
}

type CharacterAboutTextareaFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  title: string;
  rows?: number;
  onChange: (value: string) => void;
};

function CharacterAboutTextareaField({
  label,
  value,
  placeholder,
  title,
  rows = 4,
  onChange,
}: CharacterAboutTextareaFieldProps) {
  return (
    <label className="block" title={title}>
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm font-bold leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-forge-gold/40 focus:border-forge-gold"
      />
    </label>
  );
}

function CharacterAboutSelectField({
  label,
  value,
  placeholder,
  title,
  options,
  optionTitles,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  title: string;
  options: string[];
  optionTitles?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block" title={title}>
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm font-bold text-zinc-100 outline-none transition hover:border-forge-gold/40 focus:border-forge-gold"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option} title={optionTitles?.[option]}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CharacterAboutSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border border-zinc-800 bg-black/20 p-4 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]"
      title={description}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <h4 className="text-sm font-black uppercase tracking-[0.22em] text-forge-gold">
          {title}
        </h4>

        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
          title={description}
          aria-label={`Informação sobre ${title}`}
        >
          i
        </span>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

type CharacterAboutStepProps = {
  draft: CharacterBuilderDraft;
  onChangeDraftField: <K extends keyof CharacterBuilderDraft>(
    key: K,
    value: CharacterBuilderDraft[K],
  ) => void;
};

function CharacterAboutStep({
  draft,
  onChangeDraftField,
}: CharacterAboutStepProps) {
  return (
    <div className="mt-5 space-y-4">
      <CharacterAboutSection
        title="Identidade"
        description="Campos para definir a identidade social, crenças e modo de vida do personagem."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <CharacterAboutSelectField
            label="Pronomes"
            value={draft.pronouns}
            placeholder="Escolha os pronomes"
            title="Como o personagem prefere ser chamado."
            options={PRONOUN_OPTIONS}
            onChange={(value) => onChangeDraftField("pronouns", value)}
          />

                   <CharacterAboutSelectField
            label="Alinhamento"
            value={draft.alignment}
            placeholder="Choose an alignment"
            title="Tendência moral e ética geral do personagem. Lawful = leal/ordeiro; Neutral = neutro; Chaotic = caótico; Good = bom; Evil = mau."
            options={ALIGNMENT_OPTIONS}
            optionTitles={{
              "Lawful Good": "Leal e Bom: segue códigos, honra e busca fazer o bem.",
              "Neutral Good": "Neutro e Bom: faz o bem sem depender tanto de leis ou caos.",
              "Chaotic Good": "Caótico e Bom: valoriza liberdade e faz o bem fora das regras.",
              "Lawful Neutral": "Leal e Neutro: prioriza ordem, tradição ou código.",
              "True Neutral": "Neutro: busca equilíbrio, pragmatismo ou distância moral.",
              "Chaotic Neutral": "Caótico e Neutro: prioriza liberdade, impulso ou independência.",
              "Lawful Evil": "Leal e Mau: usa ordem, poder e regras para benefício próprio.",
              "Neutral Evil": "Neutro e Mau: age por interesse próprio sem grande código moral.",
              "Chaotic Evil": "Caótico e Mau: destrutivo, cruel ou guiado por impulsos sombrios.",
            }}
            onChange={(value) => onChangeDraftField("alignment", value)}
          />

          <CharacterAboutInputField
            label="Fé"
            value={draft.faith}
            placeholder="Divindade, ideal, ordem ou crença..."
            title="Crença, fé, filosofia ou força simbólica que guia o personagem."
            onChange={(value) => onChangeDraftField("faith", value)}
          />

                    <CharacterAboutSelectField
            label="Estilo de vida"
            value={draft.lifestyle}
            placeholder="Escolha um estilo de vida"
            title="Condição social e modo de vida predominante do personagem. Exemplo: Pobre vive com poucos recursos; Confortável tem rotina estável; Aristocrático circula entre elites."
            options={LIFESTYLE_OPTIONS}
            optionTitles={{
              Miserável: "Vive no limite da sobrevivência, sem moradia ou recursos estáveis.",
              Pobre: "Tem poucos recursos e precisa escolher bem onde gastar.",
              Modesto: "Vida simples, funcional e sem luxo.",
              Confortável: "Rotina estável, abrigo seguro e recursos suficientes.",
              Rico: "Acesso constante a conforto, contatos e recursos.",
              Aristocrático: "Ligado a nobreza, elite, títulos ou círculos de poder.",
              Nômade: "Vive em movimento, sem residência fixa.",
              Militar: "Vida estruturada por hierarquia, disciplina ou serviço armado.",
              Clandestino: "Vive escondido, à margem da lei ou sob identidade discreta.",
            }}
            onChange={(value) => onChangeDraftField("lifestyle", value)}
          />
        </div>
      </CharacterAboutSection>

      <CharacterAboutSection
        title="Aparência"
        description="Características físicas usadas para descrever o personagem na mesa."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <CharacterAboutInputField
            label="Cabelo"
            value={draft.hair}
            placeholder="Cor, corte, textura..."
            title="Descrição do cabelo ou ausência dele."
            onChange={(value) => onChangeDraftField("hair", value)}
          />

          <CharacterAboutInputField
            label="Pele"
            value={draft.skin}
            placeholder="Tom, marcas, cicatrizes..."
            title="Descrição da pele, marcas visíveis ou características de mutação."
            onChange={(value) => onChangeDraftField("skin", value)}
          />

          <CharacterAboutInputField
            label="Olhos"
            value={draft.eyes}
            placeholder="Cor, brilho, anomalias..."
            title="Descrição dos olhos do personagem."
            onChange={(value) => onChangeDraftField("eyes", value)}
          />

          <CharacterAboutInputField
            label="Altura"
            value={draft.height}
            placeholder="Ex.: 1,78 m"
            title="Altura aproximada do personagem."
            onChange={(value) => onChangeDraftField("height", value)}
          />

          <CharacterAboutInputField
            label="Peso"
            value={draft.weight}
            placeholder="Ex.: 78 kg"
            title="Peso aproximado do personagem."
            onChange={(value) => onChangeDraftField("weight", value)}
          />

          <CharacterAboutInputField
            label="Idade"
            value={draft.age}
            placeholder="Ex.: 28 anos"
            title="Idade aparente ou real do personagem."
            onChange={(value) => onChangeDraftField("age", value)}
          />

          <CharacterAboutSelectField
            label="Gênero"
            value={draft.gender}
            placeholder="Escolha um gênero"
            title="Gênero, identidade ou apresentação do personagem."
            options={GENDER_OPTIONS}
            onChange={(value) => onChangeDraftField("gender", value)}
          />
        </div>
      </CharacterAboutSection>

      <CharacterAboutSection
        title="Personalidade"
        description="Traços narrativos usados para interpretar vínculos, ideais, defeitos e comportamento."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <CharacterAboutTextareaField
            label="Vínculos"
            value={draft.bonds}
            placeholder="Pessoas, lugares, promessas ou deveres importantes..."
            title="Laços que conectam o personagem ao mundo."
            rows={3}
            onChange={(value) => onChangeDraftField("bonds", value)}
          />

          <CharacterAboutTextareaField
            label="Defeitos"
            value={draft.flaws}
            placeholder="Medos, vícios, fraquezas ou conflitos internos..."
            title="Falhas que podem gerar conflito dramático."
            rows={3}
            onChange={(value) => onChangeDraftField("flaws", value)}
          />

          <CharacterAboutTextareaField
            label="Ideais"
            value={draft.ideals}
            placeholder="Princípios, sonhos ou causas..."
            title="Valores que guiam as decisões do personagem."
            rows={3}
            onChange={(value) => onChangeDraftField("ideals", value)}
          />

          <CharacterAboutTextareaField
            label="Traços"
            value={draft.personality}
            placeholder="Como o personagem age, fala e reage..."
            title="Traços de personalidade usados na interpretação."
            rows={3}
            onChange={(value) => onChangeDraftField("personality", value)}
          />
        </div>
      </CharacterAboutSection>

      <CharacterAboutSection
        title="História e notas"
        description="Campos narrativos longos para história, observações e anotações reservadas."
      >
        <div className="space-y-4">
          <CharacterAboutTextareaField
            label="História"
            value={draft.backstory}
            placeholder="Conte a origem, perdas, objetivos e conflitos do personagem..."
            title="História principal do personagem antes da campanha."
            rows={5}
            onChange={(value) => onChangeDraftField("backstory", value)}
          />

          <CharacterAboutTextareaField
            label="Notas"
            value={draft.notes}
            placeholder="Anotações públicas ou úteis para jogar..."
            title="Notas gerais da ficha."
            rows={4}
            onChange={(value) => onChangeDraftField("notes", value)}
          />

          <CharacterAboutTextareaField
            label="Notas do mestre"
            value={draft.gmNotes}
            placeholder="Segredos, ganchos ou informações reservadas..."
            title="Notas reservadas para o mestre ou para desenvolvimento futuro."
            rows={4}
            onChange={(value) => onChangeDraftField("gmNotes", value)}
          />
        </div>
      </CharacterAboutSection>
    </div>
  );
}

type CharacterEquipmentStepProps = {
  equipment: CharacterBuilderEquipmentOption[];
  selectedClass: CharacterBuilderClassOption | undefined;
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
  draft: CharacterBuilderDraft;
  isLoading: boolean;
  error: string | null;
  onChangeEquipmentMode: (
    key: "classEquipmentMode" | "backgroundEquipmentMode",
    value: CharacterBuilderEquipmentMode,
  ) => void;
};

function CharacterEquipmentStep({
  equipment,
  selectedClass,
  selectedBackground,
  draft,
  isLoading,
  error,
  onChangeEquipmentMode,
}: CharacterEquipmentStepProps) {
  const equipmentByKey = new Map(equipment.map((item) => [item.key, item]));
  const classPlan = getClassStartingEquipmentPlan(selectedClass);
  const backgroundPlan = getBackgroundStartingEquipmentPlan(selectedBackground);
  const previewItems = getStartingEquipmentItemsFromDraft(draft, {
    classes: selectedClass ? [selectedClass] : [],
    ancestries: [],
    backgrounds: selectedBackground ? [selectedBackground] : [],
    skills: [],
    spells: [],
    equipment,
  });
  const previewGold = getStartingGoldFromDraft(draft, {
    classes: selectedClass ? [selectedClass] : [],
    ancestries: [],
    backgrounds: selectedBackground ? [selectedBackground] : [],
    skills: [],
    spells: [],
    equipment,
  });

  const missingPreviewItemKeys = previewItems
    .map((item) => item.key)
    .filter((key) => !equipmentByKey.has(key));

  const classModeLabel =
    draft.classEquipmentMode === "PACKAGE" ? "Pacote" : "Moedas";

  const backgroundModeLabel =
    draft.backgroundEquipmentMode === "PACKAGE" ? "Pacote" : "Moedas";

  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando equipamento inicial...
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

  if (!selectedClass || !selectedBackground) {
    return (
      <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5 text-sm font-bold text-amber-100">
        Escolha classe e antecedente antes de definir equipamento inicial.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <section
        className="overflow-hidden rounded-2xl border border-forge-gold/25 bg-gradient-to-br from-[#1b0b22] via-[#130719] to-black shadow-[-6px_6px_0_rgba(0,0,0,0.32)]"
        title="Esta etapa não é uma loja nem um catálogo livre. Aqui o personagem escolhe apenas equipamento inicial concedido pela classe e pelo antecedente. Itens gerais da campanha ficam para lojas, recompensas e inventário futuro."
      >
        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-black/30 text-[10px] font-black text-zinc-500"
                title="Você pode aceitar os pacotes iniciais recomendados pela classe e pelo antecedente, ou trocar uma dessas partes por moedas iniciais."
                aria-label="Informação sobre equipamento inicial"
              >
                i
              </span>
            </div>

            <h3 className="mt-3 max-w-2xl text-2xl font-black leading-tight text-zinc-100">
              Defina como {draft.name || "o personagem"} começa a aventura
            </h3>
          </div>

          <div className="grid gap-2">
            <StartingEquipmentMetricCard
              label="Classe"
              value={classModeLabel}
              title={`Escolha atual da classe: ${classModeLabel}.`}
            />

            <StartingEquipmentMetricCard
              label="Antecedente"
              value={backgroundModeLabel}
              title={`Escolha atual do antecedente: ${backgroundModeLabel}.`}
            />

            <StartingEquipmentMetricCard
              label="Moedas iniciais"
              value={previewGold.toString()}
              title={`${previewGold} moedas iniciais serão salvas na ficha.`}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        <StartingEquipmentChoiceCard
          title="Classe"
          subtitle={classPlan.label}
          description={classPlan.description}
          mode={draft.classEquipmentMode}
          packageLabel="Pacote da classe"
          goldLabel={`${classPlan.gold} moedas`}
          onChangeMode={(mode) =>
            onChangeEquipmentMode("classEquipmentMode", mode)
          }
        />

        <StartingEquipmentChoiceCard
          title="Antecedente"
          subtitle={backgroundPlan.label}
          description={backgroundPlan.description}
          mode={draft.backgroundEquipmentMode}
          packageLabel="Pacote do antecedente"
          goldLabel={`${backgroundPlan.gold} moedas`}
          onChangeMode={(mode) =>
            onChangeEquipmentMode("backgroundEquipmentMode", mode)
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <StartingEquipmentReceiveCard
          title="Pacote da classe"
          items={classPlan.items}
          proficiencies={classPlan.proficiencies}
          equipmentByKey={equipmentByKey}
          isMuted={draft.classEquipmentMode === "GOLD"}
        />

        <StartingEquipmentReceiveCard
          title="Pacote do antecedente"
          items={backgroundPlan.items}
          proficiencies={backgroundPlan.proficiencies}
          equipmentByKey={equipmentByKey}
          isMuted={draft.backgroundEquipmentMode === "GOLD"}
        />
      </div>

      {missingPreviewItemKeys.length > 0 ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs font-bold leading-relaxed text-red-200">
          Alguns itens do pacote não foram encontrados no sistema:{" "}
          {missingPreviewItemKeys.join(", ")}. Rode o seed atualizado antes de
          testar a persistência.
        </p>
      ) : null}
    </div>
  );
}

function StartingEquipmentMetricCard({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title: string;
}) {
  return (
    <div
      className="min-w-0 rounded-xl border border-forge-gold/20 bg-black/30 px-4 py-3"
      title={title}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-base font-black leading-tight text-forge-gold">
        {value}
      </p>
    </div>
  );
}

function StartingEquipmentChoiceCard({
  title,
  subtitle,
  description,
  mode,
  packageLabel,
  goldLabel,
  onChangeMode,
}: {
  title: string;
  subtitle: string;
  description: string;
  mode: CharacterBuilderEquipmentMode;
  packageLabel: string;
  goldLabel: string;
  onChangeMode: (mode: CharacterBuilderEquipmentMode) => void;
}) {
  const selectLabel =
    title === "Classe" ? "Escolha da classe" : "Escolha do antecedente";

  return (
    <section
      className="rounded-2xl border border-zinc-800 bg-black/20 p-4 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]"
      title={description}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-forge-gold/80">
              {selectLabel}
            </p>

            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
              title={description}
              aria-label={`Informação sobre ${selectLabel.toLowerCase()}`}
            >
              i
            </span>
          </div>

          <h4 className="mt-2 text-lg font-black leading-tight text-zinc-100">
            {title === "Classe"
              ? "Como receber o pacote da classe"
              : "Como receber o pacote do antecedente"}
          </h4>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Modo de equipamento de {title}</span>

        <select
          value={mode}
          onChange={(event) => {
            onChangeMode(event.target.value as CharacterBuilderEquipmentMode);
          }}
          className="w-full rounded-xl border border-forge-gold/40 bg-zinc-950 px-4 py-3 text-sm font-black text-zinc-100 outline-none transition hover:border-forge-gold/60 focus:border-forge-gold"
          title="Escolha se esta parte será recebida como pacote inicial ou convertida em moedas."
        >
          <option value="PACKAGE">{packageLabel}</option>
          <option value="GOLD">{goldLabel}</option>
        </select>
      </label>
    </section>
  );
}

function StartingEquipmentReceiveCard({
  title,
  items,
  proficiencies,
  equipmentByKey,
  isMuted,
}: {
  title: string;
  items: CharacterBuilderEquipmentDraftItem[];
  proficiencies: string[];
  equipmentByKey: Map<string, CharacterBuilderEquipmentOption>;
  isMuted: boolean;
}) {
  return (
    <section
      className={[
        "overflow-hidden rounded-2xl border shadow-[-4px_4px_0_rgba(0,0,0,0.22)] transition",
        isMuted
          ? "border-zinc-900 bg-black/10 opacity-60"
          : "border-zinc-800 bg-black/20",
      ].join(" ")}
      title={
        isMuted
          ? `${title} não será aplicado porque a opção atual está em moedas.`
          : `${title} será adicionado ao inventário inicial.`
      }
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/35 px-4 py-3">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
          {title}
        </h4>
      </div>

      <div className="p-4">
        {isMuted ? (
          <p className="rounded-xl border border-zinc-800 bg-zinc-950/45 px-4 py-3 text-sm font-bold text-zinc-500">
            Este pacote não será aplicado. A escolha atual converte esta parte
            em moedas iniciais.
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm font-bold text-zinc-500">
            Nenhum item cadastrado para este pacote.
          </p>
        ) : (
          <div className="grid gap-2">
            {items.map((item) => {
              const equipmentItem = equipmentByKey.get(item.key);
              const mainInfo = equipmentItem
                ? getEquipmentMainInfo(equipmentItem)
                : null;
              const itemTitle = `${equipmentItem?.name ?? item.key}. ${
                equipmentItem?.description ??
                item.notes ??
                "Equipamento inicial."
              }${mainInfo ? ` ${mainInfo.label}: ${mainInfo.value}.` : ""}${
                equipmentItem?.weight !== null &&
                equipmentItem?.weight !== undefined
                  ? ` Peso: ${formatEquipmentWeight(equipmentItem.weight)}.`
                  : ""
              }`;

              return (
                <div
                  key={`${item.source}-${item.key}`}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3"
                  title={itemTitle}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-black leading-tight text-zinc-100">
                        {equipmentItem?.name ?? item.key}
                      </p>

                      {mainInfo ? (
                        <p
                          className="mt-1 line-clamp-2 text-[11px] font-bold uppercase tracking-[0.12em] text-forge-gold/80"
                          title={`${mainInfo.label}: ${mainInfo.value}`}
                        >
                          {mainInfo.label}: {mainInfo.value}
                        </p>
                      ) : null}
                    </div>

                    <span className="rounded-full border border-zinc-700 bg-black/40 px-3 py-1 text-xs font-black text-zinc-200">
                      ×{item.quantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isMuted && proficiencies.length > 0 ? (
          <div
            className="mt-4 rounded-xl border border-forge-gold/20 bg-forge-gold/10 px-4 py-3"
            title={proficiencies.join(", ")}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-forge-gold/80">
              Proficiências / observações
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CharacterSpellsStep({
  spells,
  selectedClass,
  selectedSpellKeys,
  isLoading,
  error,
  onToggleSpell,
}: CharacterSpellsStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<SpellTypeFilter>("all");
  const [schoolFilter, setSchoolFilter] = useState("all");

  const spellSchools = useMemo(() => {
    return Array.from(new Set(spells.map((spell) => spell.school))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [spells]);

  const filteredSpells = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return spells.filter((spell) => {
      const matchesType = filterSpellByType(spell, typeFilter);
      const matchesSchool =
        schoolFilter === "all" || spell.school === schoolFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        getSpellSearchContent(spell).includes(normalizedSearch);

      return matchesType && matchesSchool && matchesSearch;
    });
  }, [schoolFilter, searchTerm, spells, typeFilter]);

  const filteredCantrips = filteredSpells.filter(isCantrip);
  const filteredLeveledSpells = filteredSpells.filter(isLeveledSpell);

  const spellsByLevel = filteredLeveledSpells.reduce<
    Record<number, CharacterBuilderSpellOption[]>
  >((groups, spell) => {
    groups[spell.level] = [...(groups[spell.level] ?? []), spell];

    return groups;
  }, {});

  const spellLevels = Object.keys(spellsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  const totalCantrips = spells.filter(isCantrip).length;
  const totalLeveledSpells = spells.filter(isLeveledSpell).length;
  const selectedClassName = selectedClass?.name ?? "classe não selecionada";

  const selectedSpells = spells.filter((spell) =>
    selectedSpellKeys.includes(spell.key),
  );

  const selectedCantrips = selectedSpells.filter(isCantrip);
  const selectedLeveledSpells = selectedSpells.filter(isLeveledSpell);
  const hasSelectedSpells = selectedSpells.length > 0;

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    typeFilter !== "all" ||
    schoolFilter !== "all";

  const temporaryValidationTitle = hasSelectedSpells
    ? "Seleção preparada"
    : "Etapa opcional por enquanto";

  const temporaryValidationDescription = hasSelectedSpells
    ? `Você marcou ${selectedCantrips.length} truque(s) e ${selectedLeveledSpells.length} magia(s). Ao atualizar o rascunho, essas escolhas são gravadas na ficha.`
    : "Nenhuma magia foi escolhida. A etapa continua liberada porque ainda não temos a progressão real por classe.";

  if (isLoading) {
    return (
      <div className="mt-5 rounded-2xl border border-forge-gold/20 bg-black/20 p-5 text-sm font-bold text-zinc-300">
        Carregando magias...
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

  if (spells.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm font-bold text-zinc-400">
        Nenhuma magia encontrada para este sistema.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="space-y-4">
        <div
          className="rounded-2xl border border-forge-gold/25 bg-[#16091d] p-4 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]"
          title="Nesta etapa, truques e magias já aparecem separados. A seleção já pode ser persistida no rascunho; limites por classe e nível entram em uma etapa futura."
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-forge-gold/80">
                  Grimório inicial
                </p>

                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                  title="Truques são magias de nível 0. Magias são poderes de nível 1 ou maior. Seleção por classe vem em breve."
                  aria-label="Informação sobre magias"
                >
                  i
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black text-zinc-100">
                Truques e magias do sistema
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">
                Por enquanto esta lista mostra as magias do sistema. O filtro
                real por classe e a progressão de truques/magias por nível
                entram em uma etapa futura.
              </p>
            </div>
          </div>

          <p
            className="mt-4 rounded-xl border border-amber-400/20 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-100"
            title="Mais tarde, esta etapa deve mostrar apenas magias que a classe selecionada pode aprender/conjurar."
          >
            Classe atual: {selectedClassName}. Filtro por classe: em breve.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div
            className="rounded-2xl border border-forge-gold/30 bg-black/25 p-4"
            title={`Total de truques disponíveis no sistema atual: ${totalCantrips}.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Truques disponíveis
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-forge-gold">
              {totalCantrips}
            </p>
          </div>

          <div
            className="rounded-2xl border border-purple-300/30 bg-purple-500/10 p-4"
            title={`Total de magias disponíveis no sistema atual: ${totalLeveledSpells}.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Magias disponíveis
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-purple-200">
              {totalLeveledSpells}
            </p>
          </div>

          <div
            className="rounded-2xl border border-forge-gold/30 bg-forge-gold/10 p-4"
            title={`Truques escolhidos: ${selectedCantrips.length}. Limites por classe virão depois.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Truques escolhidos
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-forge-gold">
              {selectedCantrips.length}
            </p>
          </div>

          <div
            className="rounded-2xl border border-purple-300/30 bg-purple-500/10 p-4"
            title={`Magias escolhidas: ${selectedLeveledSpells.length}. Limites por classe virão depois.`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Magias escolhidas
            </p>

            <p className="mt-2 text-2xl font-black leading-none text-purple-200">
              {selectedLeveledSpells.length}
            </p>
          </div>
        </div>

        <div
          className={[
            "rounded-2xl border px-4 py-3 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]",
            hasSelectedSpells
              ? "border-emerald-400/30 bg-emerald-500/10"
              : "border-zinc-700 bg-black/25",
          ].join(" ")}
          title="Validação temporária: esta etapa ainda não bloqueia avanço por quantidade de magias. Os limites reais virão da classe e do nível em uma etapa futura."
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Validação temporária
                </p>

                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
                  title="A etapa de Magias continua opcional por enquanto. Depois, a classe vai informar quantos truques e magias podem ser escolhidos por nível."
                  aria-label="Informação sobre validação temporária de magias"
                >
                  i
                </span>
              </div>

              <p
                className={[
                  "mt-1 text-sm font-black",
                  hasSelectedSpells ? "text-emerald-100" : "text-zinc-200",
                ].join(" ")}
              >
                {temporaryValidationTitle}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {temporaryValidationDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-60">
              <div
                className="rounded-xl border border-forge-gold/20 bg-black/25 px-3 py-2 text-center"
                title="Quantidade de truques selecionados."
              >
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                  Truques
                </p>

                <p className="mt-1 text-xl font-black text-forge-gold">
                  {selectedCantrips.length}
                </p>
              </div>

              <div
                className="rounded-xl border border-purple-300/20 bg-black/25 px-3 py-2 text-center"
                title="Quantidade de magias de nível 1 ou maior selecionadas."
              >
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
                  Magias
                </p>

                <p className="mt-1 text-xl font-black text-purple-200">
                  {selectedLeveledSpells.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border border-zinc-800 bg-black/25 p-4"
          title="Use os filtros para encontrar magias por nome, tipo ou escola."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="block md:col-span-2 xl:col-span-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Buscar
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome, escola, nível..."
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-forge-gold/70"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Tipo
              </span>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as SpellTypeFilter)
                }
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-100 outline-none transition focus:border-forge-gold/70"
              >
                <option value="all">Todos</option>
                <option value="cantrips">Truques</option>
                <option value="spells">Magias</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Escola
              </span>

              <select
                value={schoolFilter}
                onChange={(event) => setSchoolFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm font-bold text-zinc-100 outline-none transition focus:border-forge-gold/70"
              >
                <option value="all">Todas</option>
                {spellSchools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p
            className="mt-3 text-xs font-bold text-zinc-500"
            title={`Os filtros atuais exibem ${filteredSpells.length} de ${spells.length} opções totais. Truques visíveis: ${filteredCantrips.length}. Magias visíveis: ${filteredLeveledSpells.length}.`}
          >
            Exibindo {filteredSpells.length} de {spells.length} opção
            {spells.length === 1 ? "" : "ões"}.
            {hasActiveFilters
              ? " Limpe os filtros para ver todas as magias."
              : " Use os filtros para reduzir a lista quando ela crescer."}
          </p>
        </div>
      </div>

      {filteredSpells.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm font-bold text-zinc-400">
          Nenhuma magia encontrada com os filtros atuais.
        </div>
      ) : null}

      {filteredCantrips.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-forge-gold/80">
                Truques
              </p>

              <h4 className="text-lg font-black text-zinc-100">
                Magias de nível 0
              </h4>
            </div>

            <span
              className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-3 py-1 text-xs font-black text-forge-gold"
              title="Quantidade de truques visíveis depois dos filtros."
            >
              {filteredCantrips.length}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredCantrips.map((spell) => (
              <CharacterSpellCard
                key={spell.id}
                spell={spell}
                isSelected={selectedSpellKeys.includes(spell.key)}
                onToggleSpell={onToggleSpell}
              />
            ))}
          </div>
        </section>
      ) : null}

      {spellLevels.map((level) => (
        <section key={level} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-200">
                {getSpellLevelLabel(level)}
              </p>

              <h4 className="text-lg font-black text-zinc-100">
                Magias de {getSpellLevelLabel(level).toLowerCase()}
              </h4>
            </div>

            <span
              className="rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-200"
              title={`Quantidade de magias de nível ${level} visíveis depois dos filtros.`}
            >
              {spellsByLevel[level]?.length ?? 0}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {spellsByLevel[level]?.map((spell) => (
              <CharacterSpellCard
                key={spell.id}
                spell={spell}
                isSelected={selectedSpellKeys.includes(spell.key)}
                onToggleSpell={onToggleSpell}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type CharacterConceptStepProps = {
  draft: CharacterBuilderDraft;
  onChangeDraftField: <K extends keyof CharacterBuilderDraft>(
    key: K,
    value: CharacterBuilderDraft[K],
  ) => void;
};

function CharacterConceptStep({
  draft,
  onChangeDraftField,
}: CharacterConceptStepProps) {
  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
            Nome do personagem
          </span>

          <input
            value={draft.name}
            onChange={(event) => onChangeDraftField("name", event.target.value)}
            placeholder="Ex: Hikari Pendragon"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-300"
          />
        </label>

<label className="block space-y-2">
  <span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
    Pronomes
  </span>

  <select
    value={draft.pronouns}
    onChange={(event) =>
      onChangeDraftField("pronouns", event.target.value)
    }
    title="Como o personagem prefere ser chamado."
    className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none transition hover:border-forge-gold/40 focus:border-amber-300"
  >
    <option value="">Escolha os pronomes</option>

    {PRONOUN_OPTIONS.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
</label>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
          Conceito
        </span>

        <textarea
          value={draft.concept}
          onChange={(event) =>
            onChangeDraftField("concept", event.target.value)
          }
          placeholder="Ex: Barda necromante de Nigrum Alvor que usa música para ouvir ecos dos mortos."
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm font-semibold leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-300"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
            URL do retrato
          </span>

          <input
            value={draft.portraitUrl}
            onChange={(event) =>
              onChangeDraftField("portraitUrl", event.target.value)
            }
            placeholder="Cole uma URL de imagem para o retrato"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-300"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
            URL do token
          </span>

          <input
            value={draft.tokenImageUrl}
            onChange={(event) =>
              onChangeDraftField("tokenImageUrl", event.target.value)
            }
            placeholder="Cole uma URL de imagem para o token"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-300"
          />
        </label>
      </div>

      <div
        className="rounded-2xl border border-amber-400/20 bg-black/25 p-4"
        title="Defina como a imagem do token deve preencher o espaço no tabuleiro."
      >
        <div className="flex items-center gap-2">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
            Encaixe da imagem do token
          </p>

          <span
            className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
            title="Preencher pode distorcer. Conter mostra a imagem inteira. Cobrir corta bordas para preencher sem distorcer."
            aria-label="Informação sobre encaixe da imagem do token"
          >
            i
          </span>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            {
              value: "FILL",
              title: "Preencher",
              description: "Ocupa todo o espaço, podendo distorcer a imagem.",
            },
            {
              value: "CONTAIN",
              title: "Conter",
              description: "Mostra a imagem inteira, podendo sobrar espaço.",
            },
            {
              value: "COVER",
              title: "Cobrir",
              description: "Corta as bordas para preencher sem distorcer.",
            },
          ].map((fitOption) => {
            const isSelected = draft.tokenImageFit === fitOption.value;

            return (
              <button
                key={fitOption.value}
                type="button"
                title={fitOption.description}
                onClick={() =>
                  onChangeDraftField(
                    "tokenImageFit",
                    fitOption.value as CharacterBuilderDraft["tokenImageFit"],
                  )
                }
                className={[
                  "rounded-xl border px-4 py-3 text-left transition",
                  "shadow-[-4px_4px_0_rgba(0,0,0,0.25)]",
                  isSelected
                    ? "border-amber-300 bg-amber-300/10 text-amber-100"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-amber-400/40",
                ].join(" ")}
              >
                <p className="text-sm font-black">{fitOption.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
          Prévia rápida
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-amber-400/30 bg-black/40 text-xs font-black uppercase tracking-[0.16em] text-zinc-600">
            {draft.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.portraitUrl}
                alt="Prévia do retrato"
                className="h-full w-full object-cover"
              />
            ) : (
              "Retrato"
            )}
          </div>

          <div>
            <p className="text-lg font-black text-zinc-100">
              {draft.name || "Personagem sem nome"}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              {draft.pronouns || "Pronomes não definidos"}
            </p>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-300">
              {draft.concept ||
                "O conceito do personagem aparecerá aqui conforme você preencher."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


type CharacterReviewStepProps = {
  draft: CharacterBuilderDraft;
  options: CharacterBuilderOptions;
  selectedClass: CharacterBuilderClassOption | undefined;
  selectedAncestry: CharacterBuilderAncestryOption | undefined;
  selectedBackground: CharacterBuilderBackgroundOption | undefined;
};

function CharacterReviewStep({
  draft,
  options,
  selectedClass,
  selectedAncestry,
  selectedBackground,
}: CharacterReviewStepProps) {
  const selectedSkills = draft.skillKeys
    .map((skillKey) => {
      return options.skills.find((skill) => skill.key === skillKey);
    })
    .filter((skill): skill is CharacterBuilderSkillOption => Boolean(skill));

  const selectedSpells = draft.spellKeys
    .map((spellKey) => {
      return options.spells.find((spell) => spell.key === spellKey);
    })
    .filter((spell): spell is CharacterBuilderSpellOption => Boolean(spell));

  const selectedCantrips = selectedSpells.filter(isCantrip);
  const selectedLeveledSpells = selectedSpells.filter(isLeveledSpell);

  const startingEquipmentItems = getStartingEquipmentItemsFromDraft(
    draft,
    options,
  );

  const startingGold = getStartingGoldFromDraft(draft, options);

  const aboutFieldsCount = countFilledAboutFields(draft);

  const assignedAttributesCount = CHARACTER_ATTRIBUTE_DEFINITIONS.filter(
    (attribute) => draft.attributes[attribute.key] !== null,
  ).length;

  return (
    <div className="mt-5 space-y-5">
      <section className="rounded-2xl border border-forge-gold/25 bg-gradient-to-br from-[#211027] to-black/40 p-5 shadow-[-5px_5px_0_rgba(0,0,0,0.28)]">
        <div className="p-5">
  <div className="flex flex-wrap items-center gap-2">
    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-forge-gold">
      Revisão da ficha
    </p>

    <span
      className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-black/30 text-[10px] font-black text-zinc-500"
      title="Confira os principais dados antes de finalizar a ficha."
      aria-label="Informação sobre revisão da ficha"
    >
      i
    </span>
  </div>

  <h3 className="mt-4 max-w-2xl text-2xl font-black leading-tight text-zinc-100">
    Confira {draft.name || "o personagem"} antes de finalizar
  </h3>
</div>
      </section>

            <CharacterReviewSection
        title="Identidade visual"
        description="Retrato, token, nome, pronomes e conceito do personagem."
      >
        <div className="grid gap-4 2xl:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div
              className="overflow-hidden rounded-2xl border border-forge-gold/25 bg-zinc-950/70 shadow-[-4px_4px_0_rgba(0,0,0,0.28)]"
              title={
                draft.portraitUrl ||
                "Nenhuma URL de retrato foi informada para este personagem."
              }
            >
              <div className="flex aspect-[4/5] items-center justify-center bg-black/40 text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                {draft.portraitUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.portraitUrl}
                    alt={`Retrato de ${draft.name || "personagem"}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "Sem retrato"
                )}
              </div>

              <div className="border-t border-zinc-800 px-4 py-3">
                <p className="text-sm font-black leading-tight text-zinc-100">
                  {draft.name || "Personagem sem nome"}
                </p>

                <p className="mt-1 text-xs font-bold text-zinc-500">
                  {draft.pronouns || "Pronomes não definidos"}
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3"
              title={
                draft.tokenImageUrl ||
                "Nenhuma URL de token foi informada para este personagem."
              }
            >
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-forge-gold/25 bg-black/40 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-600">
                  {draft.tokenImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.tokenImageUrl}
                      alt={`Token de ${draft.name || "personagem"}`}
                      className={`h-full w-full ${getCharacterTokenImageFitClass(
                        draft.tokenImageFit,
                      )}`}
                    />
                  ) : (
                    "Token"
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                    Token de mesa
                  </p>

                  <p className="mt-1 text-sm font-black text-zinc-100">
                    {draft.tokenImageUrl ? "Imagem informada" : "Não informado"}
                  </p>

                  <p className="mt-1 text-xs font-bold text-zinc-500">
                    Encaixe: {draft.tokenImageFit}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <CharacterReviewFact
                label="Nome"
                value={draft.name || "Não definido"}
              />

              <CharacterReviewFact
                label="Pronomes"
                value={draft.pronouns || "Não definido"}
              />
            </div>

            <CharacterReviewTextBlock
              label="Conceito"
              value={draft.concept || "Conceito ainda não preenchido."}
            />

            <div className="grid gap-3">
              <CharacterReviewFact
                label="Classe"
                value={
                  (selectedClass?.name ?? draft.className) || "Não definida"
                }
                title={
                  selectedClass?.description ??
                  "Classe escolhida para o personagem."
                }
              />

              <CharacterReviewFact
                label="Ancestralidade"
                value={
                  (selectedAncestry?.name ?? draft.ancestryName) ||
                  "Não definida"
                }
                title={
                  selectedAncestry?.description ??
                  "Ancestralidade escolhida para o personagem."
                }
              />

              <CharacterReviewFact
                label="Antecedente"
                value={
                  (selectedBackground?.name ?? draft.backgroundName) ||
                  "Não definido"
                }
                title={
                  selectedBackground?.description ??
                  "Antecedente escolhido para o personagem."
                }
              />
            </div>
          </div>
        </div>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Atributos"
        description="Valores distribuídos e modificadores calculados."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CHARACTER_ATTRIBUTE_DEFINITIONS.map((attribute) => {
            const value = draft.attributes[attribute.key];

            return (
              <div
                key={attribute.key}
                className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                title={attribute.description}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                      {attribute.shortName}
                    </p>

                    <p className="mt-1 text-sm font-black text-zinc-100">
                      {attribute.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black leading-none text-forge-gold">
                      {value ?? "—"}
                    </p>

                    <p className="mt-1 text-xs font-bold text-zinc-400">
                      {formatAttributeModifier(value)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs font-bold text-zinc-500">
          {assignedAttributesCount}/6 atributos preenchidos.
        </p>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Perícias"
        description="Perícias treinadas e seus atributos-base."
      >
        {selectedSkills.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {selectedSkills.map((skill) => {
              const calculation = getSkillCalculation({
                attributes: draft.attributes,
                statKey: skill.stat.key,
                isProficient: true,
                level: CHARACTER_BUILDER_LEVEL,
              });

              return (
                <CharacterReviewFact
                  key={skill.key}
                  label={skill.stat.shortName}
                  value={`${skill.name} ${calculation.formattedTotal}`}
                  title={`Atributo: ${skill.stat.name}. Bônus de proficiência: ${calculation.formattedProficiencyBonus}.`}
                />
              );
            })}
          </div>
        ) : (
          <CharacterReviewEmptyText>
            Nenhuma perícia escolhida.
          </CharacterReviewEmptyText>
        )}
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Magias"
        description="Truques e magias selecionadas para o personagem."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <CharacterReviewSpellList
            title="Truques"
            spells={selectedCantrips}
            emptyMessage="Nenhum truque escolhido."
          />

          <CharacterReviewSpellList
            title="Magias"
            spells={selectedLeveledSpells}
            emptyMessage="Nenhuma magia escolhida."
          />
        </div>
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Equipamentos iniciais"
        description="Itens e moedas que serão usados como inventário inicial."
      >
        <div className="rounded-xl border border-forge-gold/25 bg-forge-gold/10 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
            Moedas iniciais
          </p>

          <p className="mt-1 text-xl font-black text-zinc-100">
            {startingGold} moedas
          </p>
        </div>

        {startingEquipmentItems.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {startingEquipmentItems.map((item) => {
              const equipmentItem = options.equipment.find(
                (currentItem) => currentItem.key === item.key,
              );

              const mainInfo = equipmentItem
                ? getEquipmentMainInfo(equipmentItem)
                : null;

              const title = equipmentItem
                ? `${equipmentItem.name}. ${
                    equipmentItem.description ?? "Sem descrição cadastrada."
                  } ${mainInfo ? `${mainInfo.label}: ${mainInfo.value}.` : ""} Peso: ${formatEquipmentWeight(
                    equipmentItem.weight,
                  )}.`
                : item.key;

              return (
                <div
                  key={`${item.source}-${item.key}`}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                  title={title}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-zinc-100">
                        {equipmentItem?.name ?? item.key}
                      </p>

                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                        {item.source === "background"
                          ? "Antecedente"
                          : "Classe"}
                      </p>
                    </div>

                    <span className="rounded-full border border-zinc-700 bg-black/30 px-2 py-1 text-xs font-black text-zinc-200">
                      ×{item.quantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <CharacterReviewEmptyText>
            Nenhum item inicial. O personagem começará apenas com moedas.
          </CharacterReviewEmptyText>
        )}
      </CharacterReviewSection>

      <CharacterReviewSection
        title="Sobre"
        description="Identidade, aparência, personalidade, história e notas."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <CharacterReviewFact
            label="Alinhamento"
            value={draft.alignment || "Não definido"}
          />

          <CharacterReviewFact
            label="Estilo de vida"
            value={draft.lifestyle || "Não definido"}
          />

          <CharacterReviewFact
            label="Gênero"
            value={draft.gender || "Não definido"}
          />

          <CharacterReviewFact
            label="Campos preenchidos"
            value={`${aboutFieldsCount} campos`}
          />
        </div>

        <CharacterReviewTextBlock
          label="Aparência"
          value={getPhysicalSummary(draft)}
        />

        <CharacterReviewTextBlock
          label="Personalidade"
          value={[
            draft.bonds ? `Vínculos: ${draft.bonds}` : "",
            draft.flaws ? `Defeitos: ${draft.flaws}` : "",
            draft.ideals ? `Ideais: ${draft.ideals}` : "",
            draft.personality ? `Traços: ${draft.personality}` : "",
          ]
            .filter(Boolean)
            .join(" • ") || "Personalidade ainda não preenchida."}
        />

        <CharacterReviewTextBlock
          label="História"
          value={draft.backstory || "História ainda não preenchida."}
        />
      </CharacterReviewSection>
    </div>
  );
}

function CharacterReviewMetricCard({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title: string;
}) {
  return (
    <div
      className="rounded-xl border border-forge-gold/20 bg-black/30 px-4 py-3"
      title={title}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-base font-black leading-tight text-forge-gold">
        {value}
      </p>
    </div>
  );
}

function CharacterReviewSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border border-zinc-800 bg-black/20 p-4 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]"
      title={description}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black uppercase tracking-[0.22em] text-forge-gold">
              {title}
            </h4>

            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
              title={description}
              aria-label={`Informação sobre ${title}`}
            >
              i
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function CharacterReviewFact({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
      title={title ?? value}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-black leading-relaxed text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function CharacterReviewTextBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
      title={value}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 line-clamp-4 text-sm font-bold leading-relaxed text-zinc-200">
        {value}
      </p>
    </div>
  );
}

function CharacterReviewSpellList({
  title,
  spells,
  emptyMessage,
}: {
  title: string;
  spells: CharacterBuilderSpellOption[];
  emptyMessage: string;
}) {
  if (spells.length === 0) {
    return (
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
          {title}
        </p>

        <CharacterReviewEmptyText>{emptyMessage}</CharacterReviewEmptyText>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </p>

      <div className="mt-2 space-y-2">
        {spells.map((spell) => (
          <div
            key={spell.key}
            className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
            title={`${spell.name}. ${spell.description ?? "Sem descrição cadastrada."}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-black leading-relaxed text-zinc-100">
                {spell.name}
              </p>

              <span className="shrink-0 rounded-full border border-forge-gold/25 bg-forge-gold/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold">
                {getSpellLevelLabel(spell.level)}
              </span>
            </div>

            <p className="mt-1 text-xs font-bold text-zinc-500">
              {spell.school}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CharacterReviewEmptyText({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 px-4 py-3 text-sm font-bold text-zinc-500">
      {children}
    </p>
  );
}


type BuilderSummaryRowProps = {
  label: string;
  value: string;
};

function BuilderOptionCard({
  title,
  description,
  isSelected,
  onClick,
}: {
  title: string;
  description?: string | null;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full rounded-2xl border p-4 text-left transition",
        "bg-black/25 hover:-translate-y-0.5 hover:bg-white/10",
        "shadow-[-6px_6px_18px_rgba(0,0,0,0.35)]",
        isSelected
          ? "border-yellow-300 bg-yellow-300/10"
          : "border-white/10 hover:border-yellow-300/50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-white">{title}</p>

          {description ? (
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/55">
              {description}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-white/35">
              Sem descrição cadastrada.
            </p>
          )}
        </div>

        <span
          className={[
            "shrink-0 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
            isSelected
              ? "border-yellow-300 bg-yellow-300 text-black"
              : "border-white/10 text-white/35 group-hover:border-yellow-300/50 group-hover:text-yellow-200",
          ].join(" ")}
        >
          {isSelected ? "Escolhido" : "Escolher"}
        </span>
      </div>
    </button>
  );
}

function StartingEquipmentSummaryPanel({
  draft,
  options,
}: {
  draft: CharacterBuilderDraft;
  options: CharacterBuilderOptions;
}) {
  const previewItems = getStartingEquipmentItemsFromDraft(draft, options);
  const previewGold = getStartingGoldFromDraft(draft, options);
  const equipmentByKey = new Map(
    options.equipment.map((item) => [item.key, item]),
  );

  return (
    <div className="rounded-2xl border border-forge-gold/20 bg-black/25 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-forge-gold/80">
            Inventário inicial
          </p>

          <p className="mt-1 text-xs font-bold text-zinc-500">
            {previewGold} moedas
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-forge-gold/25 bg-forge-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-forge-gold">
          {previewItems.length} item{previewItems.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {previewItems.length === 0 ? (
          <p className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs font-bold text-zinc-500">
            Sem itens. O personagem inicia com moedas.
          </p>
        ) : (
          previewItems.slice(0, 5).map((item) => {
            const equipmentItem = equipmentByKey.get(item.key);
            const sourceLabel =
              item.source === "class" ? "Classe" : "Antecedente";

            return (
              <div
                key={`${item.source}-${item.key}`}
                className="rounded-xl border border-zinc-800 bg-zinc-950/55 px-3 py-2"
                title={
                  equipmentItem?.description ??
                  item.notes ??
                  "Equipamento inicial."
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-zinc-100">
                      {equipmentItem?.name ?? item.key}
                    </p>

                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-600">
                      {sourceLabel}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-black text-zinc-200">
                    ×{item.quantity}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {previewItems.length > 5 ? (
          <p className="text-xs font-bold text-zinc-500">
            +{previewItems.length - 5} item
            {previewItems.length - 5 === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BuilderSummaryRow({ label, value }: BuilderSummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>

      <span className="text-right text-sm font-bold text-zinc-200">
        {value}
      </span>
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
  const [isCharacterBuilderOpen, setIsCharacterBuilderOpen] = useState(false);
  const [activeCharacterBuilderStep, setActiveCharacterBuilderStep] =
    useState("concept");
  const [characterBuilderDraft, setCharacterBuilderDraft] =
    useState<CharacterBuilderDraft>({
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

      attributes: DEFAULT_CHARACTER_ATTRIBUTES,
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
    });
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
  const [isLeftToolbarOpen, setIsLeftToolbarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<CampaignActor | null>(
    null,
  );
  const [actionActor, setActionActor] = useState<CampaignActor | null>(null);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

  const [campaignActors, setCampaignActors] = useState<CampaignActor[]>([]);

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
  const [pendingTokenPosition, setPendingTokenPosition] = useState<{
    tokenId: string;
    x: number;
    y: number;
  } | null>(null);

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

        const [campaign, participants, actors, tokens] = await Promise.all([
          getCampaign(params.id),
          getCampaignParticipants(params.id),
          getCampaignActors(params.id),
          getCampaignTokens(params.id),
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
    (actor) =>
      actor.location === "LIBRARY" &&
      (actor.type === "NPC" || actor.type === "CREATURE"),
  );

  function canMoveToken(token: SceneToken) {
    if (isGM) {
      return true;
    }

    if (!user) {
      return false;
    }

    return token.actor.ownerId === user.id;
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

  async function handleAddTokenToScene(actor: CampaignActor) {
    if (!campaign || !canCreateTokenForActor(actor)) {
      return;
    }

    setActionError("");
    setActionMessage("");

    const tokenCount = sceneTokens.length;
    const nextX = 300 + ((tokenCount * 90) % 560);
    const nextY = 340 + Math.floor(tokenCount / 6) * 90;

    try {
      const createdToken = await createSceneToken(campaign.id, actor.id, {
        x: nextX,
        y: nextY,
        width: 80,
        height: 80,
        imageUrl: actor.portraitUrl,
        imageFit: "COVER",
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

  function handleStartTokenDrag(tokenId: string) {
    const token = sceneTokens.find((sceneToken) => sceneToken.id === tokenId);

    if (!token || !canMoveToken(token)) {
      return;
    }

    setDraggingTokenId(tokenId);
  }

  function handleMoveTokenOnScene(event: PointerEvent<HTMLDivElement>) {
    if (!draggingTokenId) {
      return;
    }

    const draggingToken = sceneTokens.find(
      (sceneToken) => sceneToken.id === draggingTokenId,
    );

    if (!draggingToken || !canMoveToken(draggingToken)) {
      return;
    }

    const scene = event.currentTarget.getBoundingClientRect();
    const scale = zoom / 100;

    const x = Math.round((event.clientX - scene.left) / scale);
    const y = Math.round((event.clientY - scene.top) / scale);

    const nextX = Math.max(
      0,
      Math.min(x - draggingToken.width / 2, 1400 - draggingToken.width),
    );
    const nextY = Math.max(
      0,
      Math.min(y - draggingToken.height / 2, 900 - draggingToken.height),
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
      return;
    }

    const positionToSave = pendingTokenPosition;

    setDraggingTokenId(null);
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

  async function handleBringActorToTable(actor: CampaignActor) {
    if (!campaign || !isGM || actor.type === "PLAYER_CHARACTER") {
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
    if (!campaign || !isGM || actor.type === "PLAYER_CHARACTER") {
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

  async function handleLoadCharacterBuilderDraft() {
    if (!campaign) {
      return;
    }

    setCharacterDraftSaveError(null);
    setCharacterDraftSaveSuccess(null);

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}/character-sheets`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ?? "Não foi possível carregar rascunhos.",
        );
      }

      const draftSheet = data.characterSheets
        ?.filter(
          (sheet: {
            id: string;
            status: CharacterSheetStatus;
            name: string;
            pronouns: string | null;
            concept: string | null;
            portraitUrl: string | null;
            tokenImageUrl: string | null;
            tokenImageFit: "FILL" | "CONTAIN" | "COVER";
            classId: string | null;
            ancestryId: string | null;
            backgroundId: string | null;
            characterClass?: {
              name: string;
            } | null;
            ancestry?: {
              name: string;
            } | null;
            background?: {
              name: string;
            } | null;
            stats?: CharacterSheetStatResponse[];
            skills?: Array<{
              skill: {
                key: string;
              };
            }>;
            spells?: Array<{
              spell: {
                key: string;
              };
            }>;
            equipment?: Array<{
              quantity: number;
              source: string | null;
              notes: string | null;
              isEquipped: boolean;
              equipment: {
                key: string;
              };
            }>;
            classEquipmentMode?: string | null;
            backgroundEquipmentMode?: string | null;
            startingGold?: number | null;

            alignment?: string | null;
            faith?: string | null;
            lifestyle?: string | null;

            hair?: string | null;
            skin?: string | null;
            eyes?: string | null;
            height?: string | null;
            weight?: string | null;
            age?: string | null;
            gender?: string | null;

            bonds?: string | null;
            flaws?: string | null;
            ideals?: string | null;
            personality?: string | null;
            backstory?: string | null;
            notes?: string | null;
            gmNotes?: string | null;

            updatedAt?: string;
            createdAt?: string;
          }) => sheet.status === "DRAFT",
        )
        .sort(
          (
            a: {
              updatedAt?: string;
              createdAt?: string;
            },
            b: {
              updatedAt?: string;
              createdAt?: string;
            },
          ) => {
            const dateA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
            const dateB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();

            return dateB - dateA;
          },
        )[0];

      if (!draftSheet) {
        setSavedCharacterSheetId(null);
        setSavedCharacterSheetStatus(null);
        return;
      }

      setSavedCharacterSheetId(draftSheet.id);
      setSavedCharacterSheetStatus(draftSheet.status);

      setCharacterBuilderDraft({
        name: draftSheet.name ?? "",
        pronouns: draftSheet.pronouns ?? "",
        concept: draftSheet.concept ?? "",
        portraitUrl: draftSheet.portraitUrl ?? "",
        tokenImageUrl: draftSheet.tokenImageUrl ?? "",
        tokenImageFit: draftSheet.tokenImageFit ?? "FILL",

        classId: draftSheet.classId ?? "",
        className: draftSheet.characterClass?.name ?? "",

        ancestryId: draftSheet.ancestryId ?? "",
        ancestryName: draftSheet.ancestry?.name ?? "",

        backgroundId: draftSheet.backgroundId ?? "",
        backgroundName: draftSheet.background?.name ?? "",

        attributes: getCharacterAttributesFromStats(draftSheet.stats),
        skillKeys: getCharacterSkillKeysFromSkills(draftSheet.skills),
        spellKeys: getCharacterSpellKeysFromSpells(draftSheet.spells),
        equipmentItems: getCharacterEquipmentItemsFromEquipment(
          draftSheet.equipment,
        ),
        classEquipmentMode: normalizeCharacterEquipmentMode(
          draftSheet.classEquipmentMode,
        ),
        backgroundEquipmentMode: normalizeCharacterEquipmentMode(
          draftSheet.backgroundEquipmentMode,
        ),
        startingGold: draftSheet.startingGold ?? 0,

        alignment: draftSheet.alignment ?? "",
        faith: draftSheet.faith ?? "",
        lifestyle: draftSheet.lifestyle ?? "",

        hair: draftSheet.hair ?? "",
        skin: draftSheet.skin ?? "",
        eyes: draftSheet.eyes ?? "",
        height: draftSheet.height ?? "",
        weight: draftSheet.weight ?? "",
        age: draftSheet.age ?? "",
        gender: draftSheet.gender ?? "",

        bonds: draftSheet.bonds ?? "",
        flaws: draftSheet.flaws ?? "",
        ideals: draftSheet.ideals ?? "",
        personality: draftSheet.personality ?? "",
        backstory: draftSheet.backstory ?? "",
        notes: draftSheet.notes ?? "",
        gmNotes: draftSheet.gmNotes ?? "",
      });

      setCharacterDraftSaveSuccess("Rascunho carregado.");
    } catch (error) {
      setCharacterDraftSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar rascunhos.",
      );
    }
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
        return {
          ...currentDraft,
          backgroundId: option.id,
          backgroundName: option.name,
          skillKeys: option.skillKeys ?? [],
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

      setSavedCharacterSheetStatus("READY");
      setCharacterDraftSaveSuccess("Ficha finalizada e enviada para Personagens.");
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
                        ? "border-forge-gold bg-forge-purple text-forge-gold shadow-[-4px_4px_0_rgba(0,0,0,0.45)]"
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
            <div className="absolute left-5 top-5 z-10 rounded-xl border border-forge-gold/35 bg-black/50 px-4 py-3 shadow-[-6px_6px_0_rgba(0,0,0,0.35)] backdrop-blur">
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
                className="absolute left-3 top-1/2 z-20 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-forge-gold/40 bg-black/55 text-lg font-black text-forge-gold shadow-[-6px_6px_0_rgba(0,0,0,0.35)] transition hover:bg-forge-purple"
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
                className="relative h-[900px] w-[1400px] origin-center overflow-hidden rounded-2xl border border-forge-gold/35 bg-[#e4d0a3] shadow-[-18px_18px_5px_rgba(0,0,0,0.35)] transition-transform"
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
                      title={`${token.name} — ${getCharacterTypeLabel(token.type)}`}
                      onPointerDown={() => handleStartTokenDrag(token.id)}
                      className={`flex items-center justify-center overflow-hidden rounded-full border-2 text-xl font-black shadow-[-6px_6px_12px_rgba(0,0,0,0.42)] transition ${
                        draggingTokenId === token.id
                          ? "scale-105 shadow-[-10px_10px_18px_rgba(0,0,0,0.5)]"
                          : ""
                      } ${
                        canMoveToken(token)
                          ? "cursor-grab active:cursor-grabbing"
                          : "cursor-not-allowed opacity-75"
                      } ${getCharacterTypeStyles(token.type)}`}
                      style={{
                        width: token.width,
                        height: token.height,
                      }}
                    >
                      {token.imageUrl ? (
                        <img
                          src={token.imageUrl}
                          alt={token.name}
                          className={`h-full w-full ${getTokenImageFitClass(token.imageFit)}`}
                          draggable={false}
                        />
                      ) : (
                        token.initials
                      )}
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
                            id="customDiceSides"
                            type="number"
                            min={2}
                            max={1000}
                            value={customDiceSides}
                            onChange={(event) =>
                              setCustomDiceSides(Number(event.target.value))
                            }
                            aria-label="Quantidade de lados do dado personalizado"
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
                                <label
                                  htmlFor={`dice-quantity-${term.id}`}
                                  className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-white/35"
                                >
                                  Qtd.
                                </label>

                                <input
                                  id={`dice-quantity-${term.id}`}
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
                                <label
                                  htmlFor={`dice-sides-${term.id}`}
                                  className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-white/35"
                                >
                                  Dado
                                </label>

                                <select
                                  id={`dice-sides-${term.id}`}
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
                        Fichas ativas da mesa, jogadores, NPCs e criaturas.
                      </p>
                    </div>

                    {isGM && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsLibraryModalOpen(true)}
                          className="rounded-lg border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple"
                        >
                          Biblioteca
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsCharacterCreationMenuOpen(true)}
                          className="rounded-lg border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple"
                        >
                          + Criar
                        </button>
                      </div>
                    )}
                  </div>

                  {(actionMessage || actionError) && (
                    <div className="mt-4 space-y-2">
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
                    </div>
                  )}

                  {visibleTableActors.length === 0 && (
                    <div className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
                      <p className="text-sm font-black text-white">
                        Nenhum personagem visível
                      </p>

                      <p className="mt-1 text-xs font-semibold text-white/55">
                        Quando houver personagens ativos na mesa, eles
                        aparecerão aqui.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 space-y-4">
                    {myActors.length > 0 && (
                      <ActorGroupSection
                        title="Meus personagens"
                        actors={myActors}
                        isGM={isGM}
                        canCreateTokenForActor={canCreateTokenForActor}
                        canOpenSheet={canOpenActorSheet}
                        onOpenActions={setActionActor}
                      />
                    )}

                    {otherPlayerActors.length > 0 && (
                      <ActorGroupSection
                        title="Players"
                        actors={otherPlayerActors}
                        isGM={isGM}
                        canCreateTokenForActor={canCreateTokenForActor}
                        canOpenSheet={canOpenActorSheet}
                        onOpenActions={setActionActor}
                      />
                    )}

                    {isGM && npcActors.length > 0 && (
                      <ActorGroupSection
                        title="NPCs"
                        actors={npcActors}
                        isGM={isGM}
                        canCreateTokenForActor={canCreateTokenForActor}
                        canOpenSheet={canOpenActorSheet}
                        onOpenActions={setActionActor}
                      />
                    )}

                    {isGM && creatureActors.length > 0 && (
                      <ActorGroupSection
                        title="Criaturas"
                        actors={creatureActors}
                        isGM={isGM}
                        canCreateTokenForActor={canCreateTokenForActor}
                        canOpenSheet={canOpenActorSheet}
                        onOpenActions={setActionActor}
                      />
                    )}
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

      <CharacterCreationMenuModal
        isOpen={isCharacterCreationMenuOpen}
        onClose={() => setIsCharacterCreationMenuOpen(false)}
        onStartCharacterBuilder={() => {
          setIsCharacterCreationMenuOpen(false);
          setActiveCharacterBuilderStep("concept");
          setIsCharacterBuilderOpen(true);
          void handleLoadCharacterBuilderDraft();
          void handleLoadCharacterBuilderOptions();
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

      {isLibraryModalOpen && (
        <ActorLibraryModal
          actors={libraryActors}
          onBringToTable={handleBringActorToTable}
          onClose={() => setIsLibraryModalOpen(false)}
        />
      )}

      {actionActor && (
        <ActorActionModal
          actor={actionActor}
          isGM={isGM}
          canOpenSheet={canOpenActorSheet(actionActor)}
          canCreateToken={canCreateTokenForActor(actionActor)}
          sceneTokens={sceneTokens.filter(
            (token) => token.actorId === actionActor.id,
          )}
          onOpenSheet={() => {
            setSelectedActor(actionActor);
            setActionActor(null);
          }}
          onAddToken={async () => {
            await handleAddTokenToScene(actionActor);
          }}
          onRemoveToken={handleRemoveTokenFromScene}
          onReturnToLibrary={async () => {
            await handleReturnActorToLibrary(actionActor);
          }}
          onClose={() => setActionActor(null)}
        />
      )}

      {selectedActor && (
        <ActorSheetModal
          actor={selectedActor}
          isGM={isGM}
          onClose={() => setSelectedActor(null)}
        />
      )}

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

function ActorGroupSection({
  title,
  actors,
  isGM,
  canCreateTokenForActor,
  canOpenSheet,
  onOpenActions,
}: {
  title: string;
  actors: CampaignActor[];
  isGM: boolean;
  canCreateTokenForActor: (actor: CampaignActor) => boolean;
  canOpenSheet: (actor: CampaignActor) => boolean;
  onOpenActions: (actor: CampaignActor) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between px-3 py-3 text-left transition hover:bg-white/5"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-200/70">
          {title}
        </p>

        <span className="text-sm font-black text-forge-gold">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-2 border-t border-white/10 p-3">
          {actors.map((actor) => {
            const canCreateToken = canCreateTokenForActor(actor);
            const canViewSheet = canOpenSheet(actor);

            return (
              <button
                key={actor.id}
                type="button"
                onClick={() => onOpenActions(actor)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-left transition hover:border-forge-gold/50 hover:bg-forge-purple/20"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-sm font-black shadow-[-3px_3px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
                    actor.type,
                  )}`}
                >
                  {actor.portraitUrl ? (
                    <span
                      className="h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${actor.portraitUrl})`,
                      }}
                      aria-hidden="true"
                    />
                  ) : (
                    actor.initials
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-white">
                    {actor.name}
                  </p>

                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                    {isGM
                      ? getCharacterTypeLabel(actor.type)
                      : canViewSheet
                        ? "Seu personagem"
                        : "Outro player"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {canViewSheet && (
                    <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-purple-100/60">
                      Ficha
                    </span>
                  )}

                  {canCreateToken && (
                    <span className="rounded-full border border-forge-gold/30 bg-black/30 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-forge-gold/80">
                      Token
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActorLibraryModal({
  actors,
  onBringToTable,
  onClose,
}: {
  actors: CampaignActor[];
  onBringToTable: (actor: CampaignActor) => void | Promise<void>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 backdrop-blur-sm">
      <div className="flex max-h-[82vh] w-full max-w-md flex-col rounded-2xl border border-forge-gold/40 bg-[#120816] shadow-[-14px_14px_0_rgba(0,0,0,0.45)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
              Biblioteca
            </p>

            <h2 className="mt-1 text-lg font-black text-forge-gold">
              Atores guardados
            </h2>

            <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
              NPCs e criaturas que não estão ativos na mesa agora.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl font-black text-white/45 transition hover:text-forge-gold"
            aria-label="Fechar biblioteca"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
          {actors.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm font-black text-white">Biblioteca vazia</p>

              <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
                Quando o Mestre devolver NPCs ou criaturas para a biblioteca,
                eles aparecerão aqui.
              </p>
            </div>
          ) : (
            actors.map((actor) => (
              <div
                key={actor.id}
                className="rounded-xl border border-white/10 bg-black/30 p-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-sm font-black shadow-[-3px_3px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
                      actor.type,
                    )}`}
                  >
                    {actor.portraitUrl ? (
                      <span
                        className="h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${actor.portraitUrl})`,
                        }}
                        aria-hidden="true"
                      />
                    ) : (
                      actor.initials
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">
                          {actor.name}
                        </p>

                        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                          {getCharacterTypeLabel(actor.type)}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white/45">
                        Biblioteca
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
                      {actor.description || "Sem descrição cadastrada."}
                    </p>

                    <button
                      type="button"
                      onClick={() => onBringToTable(actor)}
                      className="mt-3 w-full rounded-lg border border-forge-gold/50 px-4 py-2 text-[11px] font-black text-forge-gold transition hover:bg-forge-purple"
                    >
                      Trazer para mesa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 p-4">
          <p className="text-[10px] font-semibold leading-relaxed text-white/35">
            A biblioteca agora usa o banco: ao trazer um ator para a mesa, a
            localização dele volta para TABLE.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActorActionModal({
  actor,
  isGM,
  canOpenSheet,
  canCreateToken,
  sceneTokens,
  onOpenSheet,
  onAddToken,
  onRemoveToken,
  onReturnToLibrary,
  onClose,
}: {
  actor: CampaignActor;
  isGM: boolean;
  canOpenSheet: boolean;
  canCreateToken: boolean;
  sceneTokens: SceneToken[];
  onOpenSheet: () => void;
  onAddToken: () => void | Promise<void>;
  onRemoveToken: (tokenId: string) => void | Promise<void>;
  onReturnToLibrary: () => void | Promise<void>;
  onClose: () => void;
}) {
  const hasAnyAction = canOpenSheet || canCreateToken;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-forge-gold/40 bg-[#120816] p-5 shadow-[-14px_14px_0_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-base font-black shadow-[-4px_4px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
                actor.type,
              )}`}
            >
              {actor.portraitUrl ? (
                <span
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${actor.portraitUrl})`,
                  }}
                  aria-hidden="true"
                />
              ) : (
                actor.initials
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-black text-forge-gold">
                {actor.name}
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                {getCharacterTypeLabel(actor.type)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl font-black text-white/45 transition hover:text-forge-gold"
            aria-label="Fechar ações do personagem"
          >
            ×
          </button>
        </div>

        <p className="mt-4 text-xs font-semibold leading-relaxed text-white/55">
          {actor.description ?? "Sem descrição cadastrada."}
        </p>

        <div className="mt-5 space-y-2">
          {canOpenSheet && (
            <button
              type="button"
              onClick={onOpenSheet}
              className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm font-black text-purple-100 transition hover:border-forge-gold hover:text-forge-gold"
            >
              Abrir ficha
            </button>
          )}

          {canCreateToken && (
            <button
              type="button"
              onClick={onAddToken}
              className="w-full rounded-lg border border-forge-gold bg-forge-purple px-4 py-3 text-sm font-black text-forge-gold transition hover:bg-[#4d0d63]"
            >
              Adicionar token à cena
            </button>
          )}

          {isGM && actor.type !== "PLAYER_CHARACTER" && (
            <button
              type="button"
              onClick={onReturnToLibrary}
              className="w-full rounded-lg border border-red-500/40 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-950/40"
            >
              Devolver à biblioteca
            </button>
          )}

          {!hasAnyAction && (
            <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-xs font-semibold text-white/55">
                Você pode ver que este personagem está na mesa, mas não possui
                ações disponíveis para ele.
              </p>
            </div>
          )}
        </div>

        {isGM && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                Tokens na cena
              </p>

              <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black text-white/45">
                {sceneTokens.length}
              </span>
            </div>

            {sceneTokens.length === 0 ? (
              <p className="mt-3 text-xs font-semibold text-white/45">
                Nenhum token deste personagem está na cena.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {sceneTokens.map((token, index) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-white">
                        {token.name} #{index + 1}
                      </p>

                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                        x {token.x} · y {token.y}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        await onRemoveToken(token.id);
                      }}
                      className="shrink-0 rounded-md border border-red-500/40 px-2 py-1 text-[9px] font-black text-red-300 transition hover:bg-red-950/40"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isGM && (
          <p className="mt-4 text-[10px] font-semibold leading-relaxed text-white/35">
            Como Mestre, você pode abrir fichas e adicionar tokens dos
            personagens visíveis nesta mesa.
          </p>
        )}
      </div>
    </div>
  );
}

function ActorSheetModal({
  actor,
  isGM,
  onClose,
}: {
  actor: CampaignActor;
  isGM: boolean;
  onClose: () => void;
}) {
  const isPlayerCharacter = actor.type === "PLAYER_CHARACTER";
  const isNpc = actor.type === "NPC";
  const isCreature = actor.type === "CREATURE";

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
