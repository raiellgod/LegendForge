-- AlterTable
ALTER TABLE "CreatureTemplate" ADD COLUMN     "armorClass" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "behavior" TEXT,
ADD COLUMN     "burrowSpeed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "challengeRating" TEXT,
ADD COLUMN     "climbSpeed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "creatureType" TEXT,
ADD COLUMN     "experienceReward" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "flySpeed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "habitat" TEXT,
ADD COLUMN     "hitPoints" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lore" TEXT,
ADD COLUMN     "maxHitPoints" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "size" "CreatureSize" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "speed" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "swimSpeed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tactics" TEXT,
ADD COLUMN     "temporaryHp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tokenImageFit" "SceneTokenImageFit" NOT NULL DEFAULT 'COVER',
ADD COLUMN     "tokenImageUrl" TEXT;

-- AlterTable
ALTER TABLE "NpcTemplate" ADD COLUMN     "ancestryId" TEXT,
ADD COLUMN     "armorClass" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "backgroundId" TEXT,
ADD COLUMN     "behavior" TEXT,
ADD COLUMN     "burrowSpeed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "climbSpeed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "faction" TEXT,
ADD COLUMN     "flySpeed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hitPoints" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lore" TEXT,
ADD COLUMN     "maxHitPoints" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "motivation" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "personality" TEXT,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "size" "CreatureSize" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "speed" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "subAncestryId" TEXT,
ADD COLUMN     "swimSpeed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tactics" TEXT,
ADD COLUMN     "temporaryHp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tokenImageFit" "SceneTokenImageFit" NOT NULL DEFAULT 'COVER',
ADD COLUMN     "tokenImageUrl" TEXT;

-- CreateTable
CREATE TABLE "NpcTemplateClass" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subclassId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateStat" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "statId" TEXT NOT NULL,
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "isSavingThrowProficient" BOOLEAN NOT NULL DEFAULT false,
    "savingThrowBonus" INTEGER NOT NULL DEFAULT 0,
    "savingThrowOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateSkill" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "expertiseLevel" INTEGER NOT NULL DEFAULT 0,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateDefense" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "kind" "SheetDefenseKind" NOT NULL,
    "damageType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateDefense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateSense" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "range" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateSense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateLanguage" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateTrait" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateAction" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "kind" "SheetActionKind" NOT NULL DEFAULT 'ACTION',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "uses" INTEGER,
    "maxUses" INTEGER,
    "recharge" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateAttack" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "attackType" "SheetAttackType" NOT NULL DEFAULT 'MELEE',
    "attackAbilityKey" TEXT,
    "attackBonus" INTEGER NOT NULL DEFAULT 0,
    "damageFormula" TEXT,
    "damageBonus" INTEGER NOT NULL DEFAULT 0,
    "damageType" TEXT,
    "secondaryDamageFormula" TEXT,
    "secondaryDamageType" TEXT,
    "normalRange" INTEGER,
    "longRange" INTEGER,
    "reach" INTEGER,
    "target" TEXT,
    "saveAbilityKey" TEXT,
    "saveDc" INTEGER,
    "onHit" TEXT,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateAttack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateMultiattack" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Multiataque',
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateMultiattack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateMultiattackEntry" (
    "id" TEXT NOT NULL,
    "multiattackId" TEXT NOT NULL,
    "attackId" TEXT,
    "actionId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateMultiattackEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcTemplateMagicalAbility" (
    "id" TEXT NOT NULL,
    "npcTemplateId" TEXT NOT NULL,
    "spellId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "abilityKey" TEXT,
    "attackBonus" INTEGER,
    "saveDc" INTEGER,
    "damageFormula" TEXT,
    "damageBonus" INTEGER NOT NULL DEFAULT 0,
    "damageType" TEXT,
    "range" TEXT,
    "target" TEXT,
    "uses" INTEGER,
    "maxUses" INTEGER,
    "recharge" TEXT,
    "isPassive" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcTemplateMagicalAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateStat" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "statId" TEXT NOT NULL,
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "isSavingThrowProficient" BOOLEAN NOT NULL DEFAULT false,
    "savingThrowBonus" INTEGER NOT NULL DEFAULT 0,
    "savingThrowOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateSkill" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "expertiseLevel" INTEGER NOT NULL DEFAULT 0,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateDefense" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "kind" "SheetDefenseKind" NOT NULL,
    "damageType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateDefense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateSense" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "range" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateSense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateLanguage" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateTrait" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateAction" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "kind" "SheetActionKind" NOT NULL DEFAULT 'ACTION',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "uses" INTEGER,
    "maxUses" INTEGER,
    "recharge" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateAttack" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "attackType" "SheetAttackType" NOT NULL DEFAULT 'MELEE',
    "attackAbilityKey" TEXT,
    "attackBonus" INTEGER NOT NULL DEFAULT 0,
    "damageFormula" TEXT,
    "damageBonus" INTEGER NOT NULL DEFAULT 0,
    "damageType" TEXT,
    "secondaryDamageFormula" TEXT,
    "secondaryDamageType" TEXT,
    "normalRange" INTEGER,
    "longRange" INTEGER,
    "reach" INTEGER,
    "target" TEXT,
    "saveAbilityKey" TEXT,
    "saveDc" INTEGER,
    "onHit" TEXT,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateAttack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateMultiattack" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Multiataque',
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateMultiattack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateMultiattackEntry" (
    "id" TEXT NOT NULL,
    "multiattackId" TEXT NOT NULL,
    "attackId" TEXT,
    "actionId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateMultiattackEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureTemplateMagicalAbility" (
    "id" TEXT NOT NULL,
    "creatureTemplateId" TEXT NOT NULL,
    "spellId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "abilityKey" TEXT,
    "attackBonus" INTEGER,
    "saveDc" INTEGER,
    "damageFormula" TEXT,
    "damageBonus" INTEGER NOT NULL DEFAULT 0,
    "damageType" TEXT,
    "range" TEXT,
    "target" TEXT,
    "uses" INTEGER,
    "maxUses" INTEGER,
    "recharge" TEXT,
    "isPassive" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureTemplateMagicalAbility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NpcTemplateClass_npcTemplateId_idx" ON "NpcTemplateClass"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateClass_classId_idx" ON "NpcTemplateClass"("classId");

-- CreateIndex
CREATE INDEX "NpcTemplateClass_subclassId_idx" ON "NpcTemplateClass"("subclassId");

-- CreateIndex
CREATE INDEX "NpcTemplateClass_isPrimary_idx" ON "NpcTemplateClass"("isPrimary");

-- CreateIndex
CREATE INDEX "NpcTemplateClass_order_idx" ON "NpcTemplateClass"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateClass_npcTemplateId_classId_key" ON "NpcTemplateClass"("npcTemplateId", "classId");

-- CreateIndex
CREATE INDEX "NpcTemplateStat_npcTemplateId_idx" ON "NpcTemplateStat"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateStat_statId_idx" ON "NpcTemplateStat"("statId");

-- CreateIndex
CREATE INDEX "NpcTemplateStat_isSavingThrowProficient_idx" ON "NpcTemplateStat"("isSavingThrowProficient");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateStat_npcTemplateId_statId_key" ON "NpcTemplateStat"("npcTemplateId", "statId");

-- CreateIndex
CREATE INDEX "NpcTemplateSkill_npcTemplateId_idx" ON "NpcTemplateSkill"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateSkill_skillId_idx" ON "NpcTemplateSkill"("skillId");

-- CreateIndex
CREATE INDEX "NpcTemplateSkill_isProficient_idx" ON "NpcTemplateSkill"("isProficient");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateSkill_npcTemplateId_skillId_key" ON "NpcTemplateSkill"("npcTemplateId", "skillId");

-- CreateIndex
CREATE INDEX "NpcTemplateDefense_npcTemplateId_idx" ON "NpcTemplateDefense"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateDefense_kind_idx" ON "NpcTemplateDefense"("kind");

-- CreateIndex
CREATE INDEX "NpcTemplateDefense_damageType_idx" ON "NpcTemplateDefense"("damageType");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateDefense_npcTemplateId_kind_damageType_key" ON "NpcTemplateDefense"("npcTemplateId", "kind", "damageType");

-- CreateIndex
CREATE INDEX "NpcTemplateSense_npcTemplateId_idx" ON "NpcTemplateSense"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateSense_name_idx" ON "NpcTemplateSense"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateSense_npcTemplateId_name_key" ON "NpcTemplateSense"("npcTemplateId", "name");

-- CreateIndex
CREATE INDEX "NpcTemplateLanguage_npcTemplateId_idx" ON "NpcTemplateLanguage"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateLanguage_languageId_idx" ON "NpcTemplateLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateLanguage_npcTemplateId_languageId_key" ON "NpcTemplateLanguage"("npcTemplateId", "languageId");

-- CreateIndex
CREATE INDEX "NpcTemplateTrait_npcTemplateId_idx" ON "NpcTemplateTrait"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateTrait_order_idx" ON "NpcTemplateTrait"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateTrait_npcTemplateId_name_key" ON "NpcTemplateTrait"("npcTemplateId", "name");

-- CreateIndex
CREATE INDEX "NpcTemplateAction_npcTemplateId_idx" ON "NpcTemplateAction"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateAction_kind_idx" ON "NpcTemplateAction"("kind");

-- CreateIndex
CREATE INDEX "NpcTemplateAction_order_idx" ON "NpcTemplateAction"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateAction_npcTemplateId_kind_name_key" ON "NpcTemplateAction"("npcTemplateId", "kind", "name");

-- CreateIndex
CREATE INDEX "NpcTemplateAttack_npcTemplateId_idx" ON "NpcTemplateAttack"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateAttack_attackType_idx" ON "NpcTemplateAttack"("attackType");

-- CreateIndex
CREATE INDEX "NpcTemplateAttack_attackAbilityKey_idx" ON "NpcTemplateAttack"("attackAbilityKey");

-- CreateIndex
CREATE INDEX "NpcTemplateAttack_damageType_idx" ON "NpcTemplateAttack"("damageType");

-- CreateIndex
CREATE INDEX "NpcTemplateAttack_order_idx" ON "NpcTemplateAttack"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateAttack_npcTemplateId_name_key" ON "NpcTemplateAttack"("npcTemplateId", "name");

-- CreateIndex
CREATE INDEX "NpcTemplateMultiattack_npcTemplateId_idx" ON "NpcTemplateMultiattack"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateMultiattack_order_idx" ON "NpcTemplateMultiattack"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateMultiattack_npcTemplateId_name_key" ON "NpcTemplateMultiattack"("npcTemplateId", "name");

-- CreateIndex
CREATE INDEX "NpcTemplateMultiattackEntry_multiattackId_idx" ON "NpcTemplateMultiattackEntry"("multiattackId");

-- CreateIndex
CREATE INDEX "NpcTemplateMultiattackEntry_attackId_idx" ON "NpcTemplateMultiattackEntry"("attackId");

-- CreateIndex
CREATE INDEX "NpcTemplateMultiattackEntry_actionId_idx" ON "NpcTemplateMultiattackEntry"("actionId");

-- CreateIndex
CREATE INDEX "NpcTemplateMultiattackEntry_order_idx" ON "NpcTemplateMultiattackEntry"("order");

-- CreateIndex
CREATE INDEX "NpcTemplateMagicalAbility_npcTemplateId_idx" ON "NpcTemplateMagicalAbility"("npcTemplateId");

-- CreateIndex
CREATE INDEX "NpcTemplateMagicalAbility_spellId_idx" ON "NpcTemplateMagicalAbility"("spellId");

-- CreateIndex
CREATE INDEX "NpcTemplateMagicalAbility_abilityKey_idx" ON "NpcTemplateMagicalAbility"("abilityKey");

-- CreateIndex
CREATE INDEX "NpcTemplateMagicalAbility_order_idx" ON "NpcTemplateMagicalAbility"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcTemplateMagicalAbility_npcTemplateId_name_key" ON "NpcTemplateMagicalAbility"("npcTemplateId", "name");

-- CreateIndex
CREATE INDEX "CreatureTemplateStat_creatureTemplateId_idx" ON "CreatureTemplateStat"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateStat_statId_idx" ON "CreatureTemplateStat"("statId");

-- CreateIndex
CREATE INDEX "CreatureTemplateStat_isSavingThrowProficient_idx" ON "CreatureTemplateStat"("isSavingThrowProficient");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateStat_creatureTemplateId_statId_key" ON "CreatureTemplateStat"("creatureTemplateId", "statId");

-- CreateIndex
CREATE INDEX "CreatureTemplateSkill_creatureTemplateId_idx" ON "CreatureTemplateSkill"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateSkill_skillId_idx" ON "CreatureTemplateSkill"("skillId");

-- CreateIndex
CREATE INDEX "CreatureTemplateSkill_isProficient_idx" ON "CreatureTemplateSkill"("isProficient");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateSkill_creatureTemplateId_skillId_key" ON "CreatureTemplateSkill"("creatureTemplateId", "skillId");

-- CreateIndex
CREATE INDEX "CreatureTemplateDefense_creatureTemplateId_idx" ON "CreatureTemplateDefense"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateDefense_kind_idx" ON "CreatureTemplateDefense"("kind");

-- CreateIndex
CREATE INDEX "CreatureTemplateDefense_damageType_idx" ON "CreatureTemplateDefense"("damageType");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateDefense_creatureTemplateId_kind_damageType_key" ON "CreatureTemplateDefense"("creatureTemplateId", "kind", "damageType");

-- CreateIndex
CREATE INDEX "CreatureTemplateSense_creatureTemplateId_idx" ON "CreatureTemplateSense"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateSense_name_idx" ON "CreatureTemplateSense"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateSense_creatureTemplateId_name_key" ON "CreatureTemplateSense"("creatureTemplateId", "name");

-- CreateIndex
CREATE INDEX "CreatureTemplateLanguage_creatureTemplateId_idx" ON "CreatureTemplateLanguage"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateLanguage_languageId_idx" ON "CreatureTemplateLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateLanguage_creatureTemplateId_languageId_key" ON "CreatureTemplateLanguage"("creatureTemplateId", "languageId");

-- CreateIndex
CREATE INDEX "CreatureTemplateTrait_creatureTemplateId_idx" ON "CreatureTemplateTrait"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateTrait_order_idx" ON "CreatureTemplateTrait"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateTrait_creatureTemplateId_name_key" ON "CreatureTemplateTrait"("creatureTemplateId", "name");

-- CreateIndex
CREATE INDEX "CreatureTemplateAction_creatureTemplateId_idx" ON "CreatureTemplateAction"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateAction_kind_idx" ON "CreatureTemplateAction"("kind");

-- CreateIndex
CREATE INDEX "CreatureTemplateAction_order_idx" ON "CreatureTemplateAction"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateAction_creatureTemplateId_kind_name_key" ON "CreatureTemplateAction"("creatureTemplateId", "kind", "name");

-- CreateIndex
CREATE INDEX "CreatureTemplateAttack_creatureTemplateId_idx" ON "CreatureTemplateAttack"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateAttack_attackType_idx" ON "CreatureTemplateAttack"("attackType");

-- CreateIndex
CREATE INDEX "CreatureTemplateAttack_attackAbilityKey_idx" ON "CreatureTemplateAttack"("attackAbilityKey");

-- CreateIndex
CREATE INDEX "CreatureTemplateAttack_damageType_idx" ON "CreatureTemplateAttack"("damageType");

-- CreateIndex
CREATE INDEX "CreatureTemplateAttack_order_idx" ON "CreatureTemplateAttack"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateAttack_creatureTemplateId_name_key" ON "CreatureTemplateAttack"("creatureTemplateId", "name");

-- CreateIndex
CREATE INDEX "CreatureTemplateMultiattack_creatureTemplateId_idx" ON "CreatureTemplateMultiattack"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateMultiattack_order_idx" ON "CreatureTemplateMultiattack"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateMultiattack_creatureTemplateId_name_key" ON "CreatureTemplateMultiattack"("creatureTemplateId", "name");

-- CreateIndex
CREATE INDEX "CreatureTemplateMultiattackEntry_multiattackId_idx" ON "CreatureTemplateMultiattackEntry"("multiattackId");

-- CreateIndex
CREATE INDEX "CreatureTemplateMultiattackEntry_attackId_idx" ON "CreatureTemplateMultiattackEntry"("attackId");

-- CreateIndex
CREATE INDEX "CreatureTemplateMultiattackEntry_actionId_idx" ON "CreatureTemplateMultiattackEntry"("actionId");

-- CreateIndex
CREATE INDEX "CreatureTemplateMultiattackEntry_order_idx" ON "CreatureTemplateMultiattackEntry"("order");

-- CreateIndex
CREATE INDEX "CreatureTemplateMagicalAbility_creatureTemplateId_idx" ON "CreatureTemplateMagicalAbility"("creatureTemplateId");

-- CreateIndex
CREATE INDEX "CreatureTemplateMagicalAbility_spellId_idx" ON "CreatureTemplateMagicalAbility"("spellId");

-- CreateIndex
CREATE INDEX "CreatureTemplateMagicalAbility_abilityKey_idx" ON "CreatureTemplateMagicalAbility"("abilityKey");

-- CreateIndex
CREATE INDEX "CreatureTemplateMagicalAbility_order_idx" ON "CreatureTemplateMagicalAbility"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureTemplateMagicalAbility_creatureTemplateId_name_key" ON "CreatureTemplateMagicalAbility"("creatureTemplateId", "name");

-- CreateIndex
CREATE INDEX "CreatureTemplate_size_idx" ON "CreatureTemplate"("size");

-- CreateIndex
CREATE INDEX "CreatureTemplate_challengeRating_idx" ON "CreatureTemplate"("challengeRating");

-- CreateIndex
CREATE INDEX "NpcTemplate_ancestryId_idx" ON "NpcTemplate"("ancestryId");

-- CreateIndex
CREATE INDEX "NpcTemplate_subAncestryId_idx" ON "NpcTemplate"("subAncestryId");

-- CreateIndex
CREATE INDEX "NpcTemplate_backgroundId_idx" ON "NpcTemplate"("backgroundId");

-- AddForeignKey
ALTER TABLE "NpcTemplate" ADD CONSTRAINT "NpcTemplate_ancestryId_fkey" FOREIGN KEY ("ancestryId") REFERENCES "Ancestry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplate" ADD CONSTRAINT "NpcTemplate_subAncestryId_fkey" FOREIGN KEY ("subAncestryId") REFERENCES "SubAncestry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplate" ADD CONSTRAINT "NpcTemplate_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "Background"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateClass" ADD CONSTRAINT "NpcTemplateClass_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateClass" ADD CONSTRAINT "NpcTemplateClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateClass" ADD CONSTRAINT "NpcTemplateClass_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "CharacterSubclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateStat" ADD CONSTRAINT "NpcTemplateStat_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateStat" ADD CONSTRAINT "NpcTemplateStat_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateSkill" ADD CONSTRAINT "NpcTemplateSkill_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateSkill" ADD CONSTRAINT "NpcTemplateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateDefense" ADD CONSTRAINT "NpcTemplateDefense_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateSense" ADD CONSTRAINT "NpcTemplateSense_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateLanguage" ADD CONSTRAINT "NpcTemplateLanguage_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateLanguage" ADD CONSTRAINT "NpcTemplateLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateTrait" ADD CONSTRAINT "NpcTemplateTrait_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateAction" ADD CONSTRAINT "NpcTemplateAction_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateAttack" ADD CONSTRAINT "NpcTemplateAttack_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateMultiattack" ADD CONSTRAINT "NpcTemplateMultiattack_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateMultiattackEntry" ADD CONSTRAINT "NpcTemplateMultiattackEntry_multiattackId_fkey" FOREIGN KEY ("multiattackId") REFERENCES "NpcTemplateMultiattack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateMultiattackEntry" ADD CONSTRAINT "NpcTemplateMultiattackEntry_attackId_fkey" FOREIGN KEY ("attackId") REFERENCES "NpcTemplateAttack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateMultiattackEntry" ADD CONSTRAINT "NpcTemplateMultiattackEntry_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "NpcTemplateAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateMagicalAbility" ADD CONSTRAINT "NpcTemplateMagicalAbility_npcTemplateId_fkey" FOREIGN KEY ("npcTemplateId") REFERENCES "NpcTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTemplateMagicalAbility" ADD CONSTRAINT "NpcTemplateMagicalAbility_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateStat" ADD CONSTRAINT "CreatureTemplateStat_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateStat" ADD CONSTRAINT "CreatureTemplateStat_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateSkill" ADD CONSTRAINT "CreatureTemplateSkill_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateSkill" ADD CONSTRAINT "CreatureTemplateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateDefense" ADD CONSTRAINT "CreatureTemplateDefense_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateSense" ADD CONSTRAINT "CreatureTemplateSense_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateLanguage" ADD CONSTRAINT "CreatureTemplateLanguage_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateLanguage" ADD CONSTRAINT "CreatureTemplateLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateTrait" ADD CONSTRAINT "CreatureTemplateTrait_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateAction" ADD CONSTRAINT "CreatureTemplateAction_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateAttack" ADD CONSTRAINT "CreatureTemplateAttack_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateMultiattack" ADD CONSTRAINT "CreatureTemplateMultiattack_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateMultiattackEntry" ADD CONSTRAINT "CreatureTemplateMultiattackEntry_multiattackId_fkey" FOREIGN KEY ("multiattackId") REFERENCES "CreatureTemplateMultiattack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateMultiattackEntry" ADD CONSTRAINT "CreatureTemplateMultiattackEntry_attackId_fkey" FOREIGN KEY ("attackId") REFERENCES "CreatureTemplateAttack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateMultiattackEntry" ADD CONSTRAINT "CreatureTemplateMultiattackEntry_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "CreatureTemplateAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateMagicalAbility" ADD CONSTRAINT "CreatureTemplateMagicalAbility_creatureTemplateId_fkey" FOREIGN KEY ("creatureTemplateId") REFERENCES "CreatureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureTemplateMagicalAbility" ADD CONSTRAINT "CreatureTemplateMagicalAbility_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE SET NULL ON UPDATE CASCADE;
