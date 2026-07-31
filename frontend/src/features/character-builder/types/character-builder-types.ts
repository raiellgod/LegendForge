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

export type CharacterAttributeBonusMap = Partial<
  Record<CharacterAttributeKey, number>
>;

export type CharacterBuilderTalentPrerequisites = {
  minimumCharacterLevel?: number;
  minimumAttributes?: CharacterAttributeBonusMap;
  requiredClassKeys?: string[];
  requiredSubclassKeys?: string[];
  requiredAncestryKeys?: string[];
  requiredProficiencyKeys?: string[];
  requiredTalentKeys?: string[];
  requiresSpellcasting?: boolean;
};

export type CharacterBuilderEquipmentMode = "PACKAGE" | "GOLD";

export type CharacterSheetStatus = "DRAFT" | "READY" | "ARCHIVED";

export type CharacterBuilderEquipmentDraftItem = {
  key: string;
  quantity: number;
  source: "class" | "background";
  notes?: string;
  isEquipped?: boolean;
};

export type CharacterBuilderClassDraftEntry = {
  id: string;
  classId: string;
  className: string;
  subclassId: string | null;
  subclassName: string | null;
  level: number;
  isPrimary: boolean;
  order: number;
};

export type CharacterBuilderProgressionChoiceType =
  | "ATTRIBUTE_INCREASE"
  | "TALENT";

export type CharacterBuilderAttributeIncreaseMode = "FOCUSED" | "SPLIT";

export type CharacterBuilderProgressionChoice = {
  classEntryId: string;
  classId: string;
  className: string;
  classLevel: number;
  choiceIndex: number;

  type: CharacterBuilderProgressionChoiceType | null;

  attributeIncreaseMode: CharacterBuilderAttributeIncreaseMode | null;
  attributeIncreases: CharacterAttributeBonusMap;

  talentId: string | null;
};

export type CharacterBuilderDraft = {
  name: string;
  pronouns: string;
  concept: string;
  portraitUrl: string;
  tokenImageUrl: string;
  tokenImageFit: "FILL" | "CONTAIN" | "COVER";
  level: number;

  classId: string;
  className: string;
  classEntries: CharacterBuilderClassDraftEntry[];

  ancestryId: string;
  ancestryName: string;

  backgroundId: string;
  backgroundName: string;
  languageKeys: string[];

  attributes: CharacterBuilderAttributes;
  skillKeys: string[];
  spellKeys: string[];
  featureChoiceSelections: CharacterBuilderFeatureChoiceSelection[];
  progressionChoices: CharacterBuilderProgressionChoice[];
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
  organizations: string;
  allies: string;
  enemies: string;
  notes: string;
  otherNotes: string;
  gmNotes: string;
};

export type CharacterBuilderOption = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

export type CharacterBuilderSpellLimit = {
  spellLevel: number;
  spellsKnown: number;
  spellsPrepared: number;
};

export type CharacterBuilderClassLevelProgression = {
  level: number;
  proficiencyBonus: number | null;
  progressionChoiceCount: number;
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
  spellLimits: CharacterBuilderSpellLimit[];
};

export type CharacterBuilderClassSpellAccess = {
  spellKey: string;
  minimumClassLevel: number;
  isAlwaysKnown: boolean;
};

export type CharacterBuilderSubclassOption = CharacterBuilderOption & {
  classId: string;
  order: number;
};

export type CharacterBuilderClassOption = CharacterBuilderOption & {
  hitDie: number | null;
  spellcastingAbilityKey: CharacterAttributeKey | null;
  subclassSelectionLevel: number | null;
  classSkillChoiceCount: number;
  weaponProficiencyKeys: string[];
  protectionProficiencyKeys: string[];
  toolProficiencyKeys: string[];
  levelProgressions: CharacterBuilderClassLevelProgression[];
  classSpells: CharacterBuilderClassSpellAccess[];
  subclasses: CharacterBuilderSubclassOption[];
};

export type CharacterBuilderAncestryOption = CharacterBuilderOption & {
  defaultSizeCategory: string;
  languageKeys: string[];
  attributeBonuses: CharacterAttributeBonusMap;
};

export type CharacterBuilderBackgroundOption = CharacterBuilderOption & {
  skillKeys: string[];
  toolNames: string[];
  languageChoiceCount: number;
  languageKeys: string[];
  startingGold: number;
  attributeBonuses: CharacterAttributeBonusMap;
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

export type CharacterBuilderLanguageOption = CharacterBuilderOption;

export type CharacterBuilderTalentOption = CharacterBuilderOption & {
  isRepeatable: boolean;
  prerequisites: CharacterBuilderTalentPrerequisites;
  attributeBonuses: CharacterAttributeBonusMap;
  order: number;
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
  imageUrl: string | null;
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
  features: CharacterBuilderFeatureOption[];
  talents: CharacterBuilderTalentOption[];
  featureChoiceGroups: CharacterBuilderFeatureChoiceGroup[];
  equipment: CharacterBuilderEquipmentOption[];
  languages: CharacterBuilderLanguageOption[];
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

export type CharacterBuilderFeatureOption = {
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

export type CharacterBuilderFeatureChoiceOption = {
  id: string;
  order: number;
  feature: CharacterBuilderFeatureOption;
};

export type CharacterBuilderFeatureChoiceGroup = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  choiceCount: number;
  order: number;
  ancestryId: string | null;
  backgroundId: string | null;
  classId: string | null;
  subclassId: string | null;
  levelProgressionId: string | null;
  options: CharacterBuilderFeatureChoiceOption[];
};

export type CharacterBuilderFeatureChoiceSelection = {
  choiceGroupId: string;
  featureId: string;
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

export type CharacterReadySheetFeatureChoice = {
  id: string;
  characterSheetId: string;
  choiceGroupId: string;
  featureId: string;
  source: string;
  choiceGroup: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    choiceCount: number;
    order: number;
  };
  feature: CharacterBuilderFeatureOption;
};

export type CharacterReadySheetProgressionChoice = {
  id: string;
  characterSheetId: string;
  classId: string;
  talentId: string | null;

  classLevel: number;
  choiceIndex: number;

  type: CharacterBuilderProgressionChoiceType | null;
  attributeIncreaseMode: CharacterBuilderAttributeIncreaseMode | null;
  attributeIncreases: CharacterAttributeBonusMap;

  createdAt: string;
  updatedAt: string;

  characterClass: {
    id: string;
    key: string;
    name: string;
  };

  talent: CharacterBuilderTalentOption | null;
};

export type CharacterReadySheetLevelProgressionPreview = {
  level: number;
  proficiencyBonus: number | null;
  progressionChoiceCount: number;
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
  spellLimits: CharacterBuilderSpellLimit[];
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
    weaponProficiencyKeys: string[];
    protectionProficiencyKeys: string[];
    toolProficiencyKeys: string[];
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

export type CharacterReadySheetClassLevelUpPreview = {
  classEntryId: string;
  classId: string;
  className: string;
  subclass: {
    id: string;
    name: string;
  } | null;
  isPrimary: boolean;

  currentCharacterLevel: number;
  nextCharacterLevel: number;

  currentClassLevel: number;
  nextClassLevel: number;

  currentProgression: CharacterReadySheetLevelProgressionPreview | null;
  nextProgression: CharacterReadySheetLevelProgressionPreview | null;

  newFeatures: CharacterReadySheetFeature[];

  hitPointsPlan: {
    currentHitPoints: number;
    currentMaxHitPoints: number;
    hitDie: number;
    constitutionValue: number | null;
    constitutionModifier: number;
    hitPointGain: number;
    nextHitPoints: number;
    nextMaxHitPoints: number;
  } | null;

  proficiencyPlan: {
    currentCharacterLevel: number;
    nextCharacterLevel: number;
    currentProficiencyBonus: number;
    nextProficiencyBonus: number;
    bonusIncrease: number;
    hasChanged: boolean;
  };

  featuresPlan: {
    currentClassLevel: number;
    nextClassLevel: number;
    unlockedFeatures: CharacterReadySheetFeature[];
    unlockedFeatureCount: number;
    hasUnlockedFeatures: boolean;
  };

  featureChoicesPlan: {
    currentClassLevel: number;
    nextClassLevel: number;
    unlockedChoiceGroups: Array<{
      id: string;
      key: string;
      name: string;
      description: string | null;
      choiceCount: number;
      order: number;
      classId: string | null;
      subclassId: string | null;
      levelProgressionId: string | null;
      options: Array<{
        id: string;
        order: number;
        feature: CharacterReadySheetFeature;
      }>;
    }>;
    unlockedChoiceGroupCount: number;
    pendingChoiceCount: number;
    requiresFeatureChoices: boolean;
  };

  spellcastingPlan: {
    currentClassLevel: number;
    nextClassLevel: number;

    currentCantripsKnown: number;
    nextCantripsKnown: number;
    cantripsKnownIncrease: number;

    currentSpellsKnown: number;
    nextSpellsKnown: number;
    spellsKnownIncrease: number;

    currentSpellsPrepared: number;
    nextSpellsPrepared: number;
    spellsPreparedIncrease: number;

    currentSpellSlots: Array<{
      spellLevel: number;
      total: number;
    }>;

    nextSpellSlots: Array<{
      spellLevel: number;
      total: number;
    }>;

    hasSpellcastingChanges: boolean;
  };

  subclassPlan: {
    currentClassLevel: number;
    nextClassLevel: number;
    subclassSelectionLevel: number | null;
    currentSubclass: {
      id: string;
      name: string;
    } | null;
    isSubclassChoiceAvailable: boolean;
    isSubclassChoicePending: boolean;
    requiresSubclassChoice: boolean;
  };

  progressionChoicesPlan: {
    currentClassLevel: number;
    nextClassLevel: number;
    unlockedChoiceCount: number;
    requiresProgressionChoices: boolean;
    pendingChoices: Array<{
      classEntryId: string;
      classId: string;
      className: string;
      classLevel: number;
      choiceIndex: number;
    }>;
  };

  subclassSelectionLevel: number | null;
  isSubclassChoiceAvailable: boolean;
  isSubclassChoicePending: boolean;

  canPreviewNextLevel: boolean;
};

export type CharacterSheetCombatState = {
  level: number;
  experience: number;
  levelUpAvailable: boolean;
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

export type CharacterReadySheetSpellClass = {
  id: string;
  key: string;
  name: string;
  spellcastingAbilityKey: CharacterAttributeKey | null;
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
  organizations: string | null;
  allies: string | null;
  enemies: string | null;
  notes: string | null;
  otherNotes: string | null;
  gmNotes: string | null;

  characterClass: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    hitDie: number | null;
    spellcastingAbilityKey: CharacterAttributeKey | null;
    subclassSelectionLevel: number | null;
    weaponProficiencyKeys: string[];
    protectionProficiencyKeys: string[];
    toolProficiencyKeys: string[];
    levelProgressions: CharacterBuilderClassLevelProgression[];
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
    languageKeys: string[];
  } | null;

  background: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    skillKeys: string[];
    toolNames: string[];
    languageChoiceCount: number;
    languageKeys: string[];
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
    classId: string | null;
    characterClass: CharacterReadySheetSpellClass | null;
    spell: CharacterBuilderSpellOption;
  }>;

  equipment: Array<{
    quantity: number;
    source: string | null;
    notes: string | null;
    isEquipped: boolean;
    equipment: CharacterBuilderEquipmentOption;
  }>;

  languages: Array<{
    source: string | null;
    language: CharacterBuilderLanguageOption;
  }>;

  features: CharacterReadySheetFeature[];
  featureChoices: CharacterReadySheetFeatureChoice[];
  progressionChoices: CharacterReadySheetProgressionChoice[];
  levelUpPreviews: CharacterReadySheetClassLevelUpPreview[];
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
  languageKeys?: string[];
  classSkillChoiceCount?: number;
  weaponProficiencyKeys?: string[];
  protectionProficiencyKeys?: string[];
  toolProficiencyKeys?: string[];
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
