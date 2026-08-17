export type ToolMode = "select" | "pan" | "measure" | "draw" | "fog";

export type RightPanelTab =
  | "chat"
  | "rolls"
  | "characters"
  | "journal"
  | "settings";

export type RollVisibility = "public" | "private";

export type RollAdvantageState = {
  advantages: number;
  disadvantages: number;
};

export type ChatMode = "public" | "whisper";

export type CharacterType = "PLAYER_CHARACTER" | "NPC" | "CREATURE";

export type ActorLocation = "TABLE" | "LIBRARY" | "ARCHIVED";

export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type Campaign = {
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

export type CampaignParticipant = {
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

export type SidebarItem = {
  id: ToolMode;
  label: string;
  icon: string;
  description: string;
  visible: boolean;
};

export type RightTabItem = {
  id: RightPanelTab;
  label: string;
  visible: boolean;
};

export type ChatMessage = {
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

export type RollResult = {
  id: string;
  author: string;
  expression: string;
  total: number;
  displayResult?: string;
  breakdown: string;
  createdAt: Date;
};

export type DiceTerm = {
  id: string;
  quantity: number;
  sides: number;
};

export type QuickRoll =
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

export type CampaignActor = {
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

export type SceneToken = {
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


export type SystemLibraryEquipment = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  damage: string | null;
  damageFormula: string | null;
  damageType: string | null;
  defense: number | null;
  cost: string | null;
  weight: number | null;
  properties: string | null;
  attackType: string;
  attackAbilityKey: string | null;
  alternativeAbilityKey: string | null;
  weaponGroup: string | null;
  normalRange: number | null;
  longRange: number | null;
  isFinesse: boolean;
  isThrown: boolean;
  isTwoHanded: boolean;
  isVersatile: boolean;
  versatileDamageFormula: string | null;
  attackBonus: number;
  damageBonus: number;
  order: number;
};

export type SystemLibrarySpell = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  level: number;
  school: string;
  castingTime: string | null;
  range: string | null;
  duration: string | null;
  components: string[];
  isRitual: boolean;
  requiresConcentration: boolean;
  order: number;
};

export type SystemLibrary = {
  system: {
    id: string;
    name: string;
    slug: string | null;
    version: number;
  };
  summary: {
    equipmentCount: number;
    spellCount: number;
  };
  equipment: SystemLibraryEquipment[];
  spells: SystemLibrarySpell[];
};
