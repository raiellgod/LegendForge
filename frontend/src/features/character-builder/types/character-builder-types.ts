export type CharacterAttributeKey =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";

export type CharacterBuilderAttributes = Record<
  CharacterAttributeKey,
  number | null
>;

export type CharacterBuilderEquipmentMode = "PACKAGE" | "GOLD";

export type CharacterSheetStatus = "DRAFT" | "READY" | "ARCHIVED";

export type CharacterBuilderEquipmentDraftItem = {
  key: string;
  quantity: number;
  source: "class" | "background";
  notes?: string;
  isEquipped?: boolean;
};

export type CharacterBuilderDraft = {
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

export type CharacterBuilderOption = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

export type CharacterBuilderClassLevelProgression = {
  level: number;
  proficiencyBonus: number | null;
  cantripsKnown: number;
  spellsKnown: number;
  spellsPrepared: number;
  spellSlotsLevel1: number;
  spellSlotsLevel2: number;
  spellSlotsLevel3: number;
  spellSlotsLevel4: number;
  spellSlotsLevel5: number;
  spellSlotsLevel6: number;
  spellSlotsLevel7: number;
  spellSlotsLevel8: number;
  spellSlotsLevel9: number;
};

export type CharacterBuilderClassSpellAccess = {
  spellKey: string;
  minimumClassLevel: number;
  isAlwaysKnown: boolean;
};

export type CharacterBuilderClassOption = CharacterBuilderOption & {
  hitDie: number | null;
  spellcastingAbilityKey: CharacterAttributeKey | null;
  subclassSelectionLevel: number | null;
  levelProgressions: CharacterBuilderClassLevelProgression[];
  classSpells: CharacterBuilderClassSpellAccess[];
};

export type CharacterBuilderAncestryOption = CharacterBuilderOption & {
  defaultSizeCategory: string;
};

export type CharacterBuilderBackgroundOption = CharacterBuilderOption & {
  skillKeys: string[];
  toolNames: string[];
  languageChoiceCount: number;
  startingGold: number;
};

export type CharacterBuilderSkillOption = CharacterBuilderOption & {
  statId: string;
  stat: {
    id: string;
    key: string;
    name: string;
    shortName: string;
  };
};

export type CharacterBuilderSpellOption = CharacterBuilderOption & {
  level: number;
  school: string;
  castingTime: string | null;
  range: string | null;
  duration: string | null;
  components: string[];
  isRitual: boolean;
  requiresConcentration: boolean;
};

export type EquipmentAttackType = "NONE" | "MELEE" | "RANGED" | "THROWN";

export type EquipmentWeaponGroup =
  | "SIMPLE"
  | "MARTIAL"
  | "IMPROVISED"
  | "NATURAL"
  | "TECH"
  | "RELIC";

export type CharacterBuilderEquipmentOption = CharacterBuilderOption & {
  category: string;
  damage: string | null;
  damageFormula: string | null;
  damageType: string | null;
  defense: number | null;
  cost: string | null;
  weight: number | null;
  properties: string | null;
  attackType: EquipmentAttackType | string;
  attackAbilityKey: CharacterAttributeKey | string | null;
  alternativeAbilityKey: CharacterAttributeKey | string | null;
  weaponGroup: EquipmentWeaponGroup | string | null;
  normalRange: number | null;
  longRange: number | null;
  isFinesse: boolean;
  isThrown: boolean;
  isTwoHanded: boolean;
  isVersatile: boolean;
  versatileDamageFormula: string | null;
  attackBonus: number;
  damageBonus: number;
};

export type CharacterBuilderOptions = {
  classes: CharacterBuilderClassOption[];
  ancestries: CharacterBuilderAncestryOption[];
  backgrounds: CharacterBuilderBackgroundOption[];
  skills: CharacterBuilderSkillOption[];
  spells: CharacterBuilderSpellOption[];
  equipment: CharacterBuilderEquipmentOption[];
};

export type CharacterSheetStatResponse = {
  baseValue: number;
  isSavingThrowProficient?: boolean;
  bonusValue?: number | null;
  overrideValue?: number | null;
  stat: {
    key: string;
    name?: string;
    shortName?: string;
  };
};

export type CharacterReadySheetFeature = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  sourceType: string;
  level: number | null;
  order: number;
  ancestryId: string | null;
  classId: string | null;
  subclassId: string | null;
  levelProgressionId: string | null;
};

export type CharacterReadySheetLevelProgressionPreview = {
  level: number;
  proficiencyBonus: number | null;
  cantripsKnown: number;
  spellsKnown: number;
  spellsPrepared: number;
  spellSlotsLevel1: number;
  spellSlotsLevel2: number;
  spellSlotsLevel3: number;
  spellSlotsLevel4: number;
  spellSlotsLevel5: number;
  spellSlotsLevel6: number;
  spellSlotsLevel7: number;
  spellSlotsLevel8: number;
  spellSlotsLevel9: number;
};

export type CharacterReadySheetClassEntry = {
  id: string;
  characterSheetId: string;
  classId: string;
  subclassId: string | null;
  level: number;
  isPrimary: boolean;
  order: number;
  characterClass: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    hitDie: number | null;
    spellcastingAbilityKey: CharacterAttributeKey | null;
    subclassSelectionLevel: number | null;
    levelProgressions: CharacterBuilderClassLevelProgression[];
  };
  subclass: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    classId: string;
  } | null;
};

export type CharacterReadySheetLevelUpPreview = {
  currentLevel: number;
  nextLevel: number;
  currentProgression: CharacterReadySheetLevelProgressionPreview | null;
  nextProgression: CharacterReadySheetLevelProgressionPreview | null;
  newFeatures: CharacterReadySheetFeature[];
  subclass: {
    id: string;
    name: string;
  } | null;
  subclassSelectionLevel: number | null;
  isSubclassChoiceAvailable: boolean;
  isSubclassChoicePending: boolean;
  canPreviewNextLevel: boolean;
};

export type CharacterSheetCombatState = {
  level: number;
  experience: number;
  hitPoints: number;
  maxHitPoints: number;
  temporaryHp: number;
  hitDiceUsed: number;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  armorClass: number;
  speed: number;
  inspiration: boolean;
};

export type CharacterReadySheet = CharacterSheetCombatState & {
  id: string;
  campaignId: string;
  campaignActorId: string | null;
  ownerId: string | null;
  systemId: string;

  name: string;
  pronouns: string | null;
  concept: string | null;
  portraitUrl: string | null;
  tokenImageUrl: string | null;
  tokenImageFit: "COVER" | "CONTAIN" | "FILL";

  status: CharacterSheetStatus;

  classEquipmentMode: CharacterBuilderEquipmentMode;
  backgroundEquipmentMode: CharacterBuilderEquipmentMode;
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
  notes: string | null;
  gmNotes: string | null;

  characterClass: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    hitDie: number | null;
    spellcastingAbilityKey: CharacterAttributeKey | null;
    subclassSelectionLevel: number | null;
    levelProgressions: Array<{
      level: number;
      proficiencyBonus: number | null;
      cantripsKnown: number;
      spellsKnown: number;
      spellsPrepared: number;
      spellSlotsLevel1: number;
      spellSlotsLevel2: number;
      spellSlotsLevel3: number;
      spellSlotsLevel4: number;
      spellSlotsLevel5: number;
      spellSlotsLevel6: number;
      spellSlotsLevel7: number;
      spellSlotsLevel8: number;
      spellSlotsLevel9: number;
    }>;
  } | null;

  subclass: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    classId: string;
  } | null;

  classes: CharacterReadySheetClassEntry[];

  ancestry: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    defaultSizeCategory: string;
  } | null;

  background: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    skillKeys: string[];
    toolNames: string[];
    languageChoiceCount: number;
    startingGold: number;
  } | null;

  stats: CharacterSheetStatResponse[];

  skills: Array<{
    isProficient: boolean;
    expertiseLevel: number;
    bonusValue: number;
    overrideValue: number | null;
    skill: {
      id: string;
      key: string;
      name: string;
      description: string | null;
      stat: {
        id: string;
        key: string;
        name: string;
        shortName: string;
      };
    };
  }>;

  spells: Array<{
    source: string | null;
    spell: CharacterBuilderSpellOption;
  }>;

  equipment: Array<{
    quantity: number;
    source: string | null;
    notes: string | null;
    isEquipped: boolean;
    equipment: CharacterBuilderEquipmentOption;
  }>;

  features: CharacterReadySheetFeature[];
  levelUpPreview: CharacterReadySheetLevelUpPreview;
};

export type StartingEquipmentPlan = {
  label: string;
  description: string;
  gold: number;
  items: CharacterBuilderEquipmentDraftItem[];
  proficiencies: string[];
};

export type CharacterBuilderStep = {
  id: string;
  title: string;
  description: string;
};

export type CharacterBuilderSelectableOption = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  hitDie?: number | null;
  defaultSizeCategory?: string;
  skillKeys?: string[];
};

export type CharacterBuilderModalProps = {
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
