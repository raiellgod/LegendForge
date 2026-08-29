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


export type SystemLibraryCharacterTemplate = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  pronouns: string | null;
  concept: string | null;
  portraitUrl: string | null;
  tokenImageUrl: string | null;
  tokenImageFit: string;
  level: number;
  maxHitPoints: number;
  armorClass: number;
  speed: number;
  classEquipmentMode: string;
  backgroundEquipmentMode: string;
  startingGold: number;
  alignment: string | null;
  faith: string | null;
  lifestyle: string | null;
  hair: string | null;
  skin: string | null;
  eyes: string | null;
  height: string | null;
  weight: string | null;
  age: string | null;
  gender: string | null;
  bonds: string | null;
  flaws: string | null;
  ideals: string | null;
  personality: string | null;
  backstory: string | null;
  organizations: string | null;
  allies: string | null;
  enemies: string | null;
  notes: string | null;
  otherNotes: string | null;
  order: number;
  ancestry: {
    id: string;
    key: string;
    name: string;
  } | null;
  subAncestry: {
    id: string;
    key: string;
    name: string;
  } | null;
  background: {
    id: string;
    key: string;
    name: string;
  } | null;
  classes: Array<{
    id: string;
    classId: string;
    subclassId: string | null;
    level: number;
    isPrimary: boolean;
    order: number;
    characterClass: {
      id: string;
      key: string;
      name: string;
      hitDie: number | null;
      spellcastingAbilityKey: string | null;
    };
    subclass: {
      id: string;
      key: string;
      name: string;
    } | null;
  }>;
  stats: Array<{
    id: string;
    baseValue: number;
    bonusValue: number;
    overrideValue: number | null;
    isSavingThrowProficient: boolean;
    stat: {
      id: string;
      key: string;
      name: string;
      shortName: string;
    };
  }>;
  skills: Array<{
    id: string;
    isProficient: boolean;
    expertiseLevel: number;
    bonusValue: number;
    overrideValue: number | null;
    source: string | null;
    skill: {
      id: string;
      key: string;
      name: string;
    };
  }>;
  spells: Array<{
    id: string;
    classId: string | null;
    source: string | null;
    isPrepared: boolean;
    isAlwaysPrepared: boolean;
    uses: number | null;
    maxUses: number | null;
    notes: string | null;
    spell: {
      id: string;
      key: string;
      name: string;
      level: number;
      school: string;
    };
    characterClass: {
      id: string;
      key: string;
      name: string;
    } | null;
  }>;
  equipment: Array<{
    id: string;
    quantity: number;
    isEquipped: boolean;
    isAttuned: boolean;
    source: string | null;
    notes: string | null;
    equipment: {
      id: string;
      key: string;
      name: string;
      category: string;
      imageUrl: string | null;
    };
  }>;
  languages: Array<{
    id: string;
    source: string | null;
    language: {
      id: string;
      key: string;
      name: string;
    };
  }>;
  featureChoices: Array<{
    id: string;
    source: string;
    choiceGroup: {
      id: string;
      key: string;
      name: string;
    };
    feature: {
      id: string;
      key: string;
      name: string;
    };
  }>;
  progressionChoices: Array<{
    id: string;
    classId: string;
    talentId: string | null;
    classLevel: number;
    choiceIndex: number;
    type: string | null;
    attributeIncreaseMode: string | null;
    attributeIncreases: Record<string, number>;
    characterClass: {
      id: string;
      key: string;
      name: string;
    };
    talent: {
      id: string;
      key: string;
      name: string;
    } | null;
  }>;
};

export type SystemLibraryNpcTemplate = Omit<
  NpcSheetReady,
  "campaignId" | "campaignActorId"
> & {
  systemId: string;
  key: string;
  name: string;
  initials: string | null;
  description: string | null;
  ancestryId: string | null;
  subAncestryId: string | null;
  backgroundId: string | null;
  order: number;
};

export type SystemLibraryCreatureTemplate = Omit<
  CreatureSheetReady,
  "campaignId" | "campaignActorId"
> & {
  systemId: string;
  key: string;
  name: string;
  initials: string | null;
  description: string | null;
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
    npcTemplateCount: number;
    creatureTemplateCount: number;
    characterTemplateCount: number;
  };
  equipment: SystemLibraryEquipment[];
  spells: SystemLibrarySpell[];
  npcTemplates: SystemLibraryNpcTemplate[];
  creatureTemplates: SystemLibraryCreatureTemplate[];
  characterTemplates: SystemLibraryCharacterTemplate[];
};


export type NpcCreatureDefenseDraft = {
  kind: "RESISTANCE" | "IMMUNITY" | "VULNERABILITY";
  damageType: string;
  notes: string;
};

export type NpcCreatureSenseDraft = {
  name: string;
  range: number | null;
  notes: string;
};

export type NpcCreatureTraitDraft = {
  name: string;
  description: string;
};

export type NpcCreatureActionDraft = {
  kind: "ACTION" | "BONUS_ACTION" | "REACTION";
  name: string;
  description: string;
  uses: number | null;
  maxUses: number | null;
  recharge: string;
};

export type NpcCreatureAttackDraft = {
  name: string;
  description: string;
  attackType: "MELEE" | "RANGED" | "THROWN" | "MAGIC" | "OTHER";
  attackAbilityKey: string;
  attackBonus: number;
  damageFormula: string;
  damageBonus: number;
  damageType: string;
  secondaryDamageFormula: string;
  secondaryDamageType: string;
  normalRange: number | null;
  longRange: number | null;
  reach: number | null;
  target: string;
  saveAbilityKey: string;
  saveDc: number | null;
  onHit: string;
  notes: string;
};

export type NpcCreatureMultiattackEntryDraft = {
  targetType: "ATTACK" | "ACTION";
  targetName: string;
  quantity: number;
  notes: string;
};

export type NpcCreatureMultiattackDraft = {
  name: string;
  description: string;
  entries: NpcCreatureMultiattackEntryDraft[];
};

export type NpcCreatureMagicalAbilityDraft = {
  spellKey: string;
  name: string;
  description: string;
  abilityKey: string;
  attackBonus: number | null;
  saveDc: number | null;
  damageFormula: string;
  damageBonus: number;
  damageType: string;
  range: string;
  target: string;
  uses: number | null;
  maxUses: number | null;
  recharge: string;
  isPassive: boolean;
  notes: string;
};

export type NpcSheetClassDraft = {
  classId: string;
  subclassId: string;
  level: number;
  isPrimary: boolean;
};

export type NpcSheetDraft = {
  name: string;
  initials: string;
  description: string;
  location: "TABLE" | "LIBRARY";
  size: "TINY" | "SMALL" | "MEDIUM" | "LARGE" | "HUGE" | "GARGANTUAN";
  ancestryId: string;
  subAncestryId: string;
  backgroundId: string;
  classes: NpcSheetClassDraft[];
  role: string;
  faction: string;
  personality: string;
  motivation: string;
  behavior: string;
  tactics: string;
  lore: string;
  notes: string;
  portraitUrl: string;
  tokenImageUrl: string;
  tokenImageFit: "COVER" | "CONTAIN" | "FILL";
  armorClass: number;
  hitPoints: number;
  maxHitPoints: number;
  temporaryHp: number;
  speed: number;
  climbSpeed: number;
  swimSpeed: number;
  flySpeed: number;
  burrowSpeed: number;
  attributes: Record<string, number>;
  savingThrowKeys: string[];
  skillKeys: string[];
  expertiseSkillKeys: string[];
  skillOverrides: Record<string, number>;
  defenses: NpcCreatureDefenseDraft[];
  senses: NpcCreatureSenseDraft[];
  languageKeys: string[];
  traits: NpcCreatureTraitDraft[];
  actions: NpcCreatureActionDraft[];
  attacks: NpcCreatureAttackDraft[];
  multiattacks: NpcCreatureMultiattackDraft[];
  magicalAbilities: NpcCreatureMagicalAbilityDraft[];
};

export type CreatureSheetDraft = Omit<
  NpcSheetDraft,
  | "ancestryId"
  | "subAncestryId"
  | "backgroundId"
  | "classes"
  | "role"
  | "faction"
  | "personality"
  | "motivation"
> & {
  creatureType: string;
  habitat: string;
  challengeRating: string;
  experienceReward: number;
};

export type NpcCreatureReadyStat = {
  id: string;
  baseValue: number;
  bonusValue: number;
  overrideValue: number | null;
  isSavingThrowProficient: boolean;
  savingThrowBonus: number;
  savingThrowOverride: number | null;
  stat: {
    id: string;
    key: string;
    name: string;
    shortName: string;
  };
};

export type NpcCreatureReadySkill = {
  id: string;
  isProficient: boolean;
  expertiseLevel: number;
  bonusValue: number;
  overrideValue: number | null;
  source: string | null;
  skill: {
    id: string;
    key: string;
    name: string;
    stat: {
      id: string;
      key: string;
      name: string;
      shortName: string;
    };
  };
};

export type NpcCreatureReadyDefense = {
  id: string;
  kind: "RESISTANCE" | "IMMUNITY" | "VULNERABILITY";
  damageType: string;
  notes: string | null;
};

export type NpcCreatureReadySense = {
  id: string;
  name: string;
  range: number | null;
  notes: string | null;
};

export type NpcCreatureReadyLanguage = {
  id: string;
  notes: string | null;
  language: {
    id: string;
    key: string;
    name: string;
  };
};

export type NpcCreatureReadyTrait = {
  id: string;
  name: string;
  description: string;
  order: number;
};

export type NpcCreatureReadyAction = {
  id: string;
  kind: "ACTION" | "BONUS_ACTION" | "REACTION";
  name: string;
  description: string;
  uses: number | null;
  maxUses: number | null;
  recharge: string | null;
  order: number;
};

export type NpcCreatureReadyAttack = {
  id: string;
  name: string;
  description: string | null;
  attackType: "MELEE" | "RANGED" | "THROWN" | "MAGIC" | "OTHER";
  attackAbilityKey: string | null;
  attackBonus: number;
  damageFormula: string | null;
  damageBonus: number;
  damageType: string | null;
  secondaryDamageFormula: string | null;
  secondaryDamageType: string | null;
  normalRange: number | null;
  longRange: number | null;
  reach: number | null;
  target: string | null;
  saveAbilityKey: string | null;
  saveDc: number | null;
  onHit: string | null;
  notes: string | null;
  order: number;
};

export type NpcCreatureReadyMultiattack = {
  id: string;
  name: string;
  description: string | null;
  order: number;
  entries: Array<{
    id: string;
    quantity: number;
    order: number;
    notes: string | null;
    attack: {
      id: string;
      name: string;
    } | null;
    action: {
      id: string;
      name: string;
    } | null;
  }>;
};

export type NpcCreatureReadyMagicalAbility = {
  id: string;
  name: string;
  description: string | null;
  abilityKey: string | null;
  attackBonus: number | null;
  saveDc: number | null;
  damageFormula: string | null;
  damageBonus: number;
  damageType: string | null;
  range: string | null;
  target: string | null;
  uses: number | null;
  maxUses: number | null;
  recharge: string | null;
  isPassive: boolean;
  notes: string | null;
  order: number;
  spell: {
    id: string;
    key: string;
    name: string;
    level: number;
  } | null;
};

export type NpcSheetReadyClass = {
  id: string;
  classId: string;
  subclassId: string | null;
  level: number;
  isPrimary: boolean;
  order: number;
  characterClass: {
    id: string;
    key: string;
    name: string;
  };
  subclass: {
    id: string;
    key: string;
    name: string;
  } | null;
};

export type NpcSheetReady = {
  id: string;
  campaignId: string;
  systemId: string;
  campaignActorId: string;
  size: string;
  ancestry: {
    id: string;
    key: string;
    name: string;
  } | null;
  subAncestry: {
    id: string;
    key: string;
    name: string;
  } | null;
  background: {
    id: string;
    key: string;
    name: string;
  } | null;
  classes: NpcSheetReadyClass[];
  role: string | null;
  faction: string | null;
  personality: string | null;
  motivation: string | null;
  behavior: string | null;
  tactics: string | null;
  lore: string | null;
  notes: string | null;
  portraitUrl: string | null;
  tokenImageUrl: string | null;
  tokenImageFit: "COVER" | "CONTAIN" | "FILL";
  armorClass: number;
  hitPoints: number;
  maxHitPoints: number;
  temporaryHp: number;
  speed: number;
  climbSpeed: number;
  swimSpeed: number;
  flySpeed: number;
  burrowSpeed: number;
  stats: NpcCreatureReadyStat[];
  skills: NpcCreatureReadySkill[];
  defenses: NpcCreatureReadyDefense[];
  senses: NpcCreatureReadySense[];
  languages: NpcCreatureReadyLanguage[];
  traits: NpcCreatureReadyTrait[];
  actions: NpcCreatureReadyAction[];
  attacks: NpcCreatureReadyAttack[];
  multiattacks: NpcCreatureReadyMultiattack[];
  magicalAbilities: NpcCreatureReadyMagicalAbility[];
};

export type CreatureSheetReady = Omit<
  NpcSheetReady,
  | "ancestry"
  | "subAncestry"
  | "background"
  | "classes"
  | "role"
  | "faction"
  | "personality"
  | "motivation"
> & {
  creatureType: string | null;
  habitat: string | null;
  challengeRating: string | null;
  experienceReward: number;
};
