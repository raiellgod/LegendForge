/*
  Warnings:

  - A unique constraint covering the columns `[systemId,key]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[systemId,key]` on the table `Stat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REMOVED', 'LEAVE_REQUESTED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('CHAT', 'SYSTEM', 'ROLL', 'COMBAT');

-- CreateEnum
CREATE TYPE "SourceOrigin" AS ENUM ('OFFICIAL', 'USER', 'AI');

-- CreateEnum
CREATE TYPE "CampaignActorType" AS ENUM ('PLAYER_CHARACTER', 'NPC', 'CREATURE');

-- CreateEnum
CREATE TYPE "SceneTokenImageFit" AS ENUM ('COVER', 'CONTAIN', 'FILL');

-- CreateEnum
CREATE TYPE "CreatureSize" AS ENUM ('TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE', 'GARGANTUAN');

-- CreateEnum
CREATE TYPE "FeatureSourceType" AS ENUM ('SYSTEM', 'ANCESTRY', 'CLASS', 'SUBCLASS', 'BACKGROUND');

-- CreateEnum
CREATE TYPE "CharacterSheetStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SpellSchool" AS ENUM ('ABJURATION', 'CONJURATION', 'DIVINATION', 'ENCHANTMENT', 'EVOCATION', 'ILLUSION', 'NECROMANCY', 'TRANSMUTATION');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('WEAPON', 'ARMOR', 'SHIELD', 'TOOL', 'GEAR', 'CONSUMABLE', 'RELIC');

-- CreateEnum
CREATE TYPE "CampaignActorLocation" AS ENUM ('TABLE', 'LIBRARY', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_statId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_systemId_fkey";

-- DropForeignKey
ALTER TABLE "Stat" DROP CONSTRAINT "Stat_systemId_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "maxPlayers" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "systemId" TEXT;

-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "characterSheetId" TEXT;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "removedAt" TIMESTAMP(3),
ADD COLUMN     "status" "ParticipantStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "description" TEXT,
ADD COLUMN     "key" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Stat" ADD COLUMN     "description" TEXT,
ADD COLUMN     "key" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shortName" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Ancestry" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "defaultSizeCategory" "CreatureSize" NOT NULL DEFAULT 'MEDIUM',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ancestry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Background" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "skillKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "toolNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languageChoiceCount" INTEGER NOT NULL DEFAULT 0,
    "startingGold" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Background_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSheet" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "campaignActorId" TEXT,
    "ownerId" TEXT,
    "ancestryId" TEXT,
    "backgroundId" TEXT,
    "classId" TEXT,
    "subclassId" TEXT,
    "status" "CharacterSheetStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "pronouns" TEXT,
    "concept" TEXT,
    "portraitUrl" TEXT,
    "tokenImageUrl" TEXT,
    "tokenImageFit" TEXT NOT NULL DEFAULT 'COVER',
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "hitPoints" INTEGER NOT NULL DEFAULT 0,
    "maxHitPoints" INTEGER NOT NULL DEFAULT 0,
    "temporaryHp" INTEGER NOT NULL DEFAULT 0,
    "hitDiceUsed" INTEGER NOT NULL DEFAULT 0,
    "deathSaveSuccesses" INTEGER NOT NULL DEFAULT 0,
    "deathSaveFailures" INTEGER NOT NULL DEFAULT 0,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "inspiration" BOOLEAN NOT NULL DEFAULT false,
    "classEquipmentMode" TEXT NOT NULL DEFAULT 'PACKAGE',
    "backgroundEquipmentMode" TEXT NOT NULL DEFAULT 'PACKAGE',
    "startingGold" INTEGER NOT NULL DEFAULT 0,
    "alignment" TEXT,
    "faith" TEXT,
    "lifestyle" TEXT,
    "hair" TEXT,
    "skin" TEXT,
    "eyes" TEXT,
    "height" TEXT,
    "weight" TEXT,
    "age" TEXT,
    "gender" TEXT,
    "bonds" TEXT,
    "flaws" TEXT,
    "ideals" TEXT,
    "personality" TEXT,
    "backstory" TEXT,
    "notes" TEXT,
    "gmNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSheetStat" (
    "id" TEXT NOT NULL,
    "characterSheetId" TEXT NOT NULL,
    "statId" TEXT NOT NULL,
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "isSavingThrowProficient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSheetStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSheetSkill" (
    "id" TEXT NOT NULL,
    "characterSheetId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "expertiseLevel" INTEGER NOT NULL DEFAULT 0,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSheetSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSheetSpell" (
    "id" TEXT NOT NULL,
    "characterSheetId" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    "source" TEXT,
    "isPrepared" BOOLEAN NOT NULL DEFAULT false,
    "isAlwaysPrepared" BOOLEAN NOT NULL DEFAULT false,
    "uses" INTEGER,
    "maxUses" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSheetSpell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSheetEquipment" (
    "id" TEXT NOT NULL,
    "characterSheetId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "isAttuned" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSheetEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterClass" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "primaryRole" TEXT,
    "hitDie" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSubclass" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSubclass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelProgression" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "proficiencyBonus" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LevelProgression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "ancestryId" TEXT,
    "backgroundId" TEXT,
    "classId" TEXT,
    "subclassId" TEXT,
    "levelProgressionId" TEXT,
    "sourceType" "FeatureSourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spell" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "school" "SpellSchool" NOT NULL,
    "castingTime" TEXT,
    "range" TEXT,
    "duration" TEXT,
    "components" TEXT,
    "isRitual" BOOLEAN NOT NULL DEFAULT false,
    "requiresConcentration" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "description" TEXT,
    "cost" TEXT,
    "weight" DOUBLE PRECISION,
    "damage" TEXT,
    "defense" INTEGER,
    "properties" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignActor" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "ownerId" TEXT,
    "type" "CampaignActorType" NOT NULL,
    "location" "CampaignActorLocation" NOT NULL DEFAULT 'TABLE',
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "description" TEXT,
    "portraitUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignActor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneToken" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "type" "CampaignActorType" NOT NULL,
    "imageUrl" TEXT,
    "imageFit" "SceneTokenImageFit" NOT NULL DEFAULT 'COVER',
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 80,
    "height" INTEGER NOT NULL DEFAULT 80,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SceneToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignInvite" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "email" TEXT,
    "token" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "LogType" NOT NULL DEFAULT 'SYSTEM',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ancestry_systemId_idx" ON "Ancestry"("systemId");

-- CreateIndex
CREATE INDEX "Ancestry_order_idx" ON "Ancestry"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Ancestry_systemId_name_key" ON "Ancestry"("systemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Ancestry_systemId_key_key" ON "Ancestry"("systemId", "key");

-- CreateIndex
CREATE INDEX "Background_systemId_idx" ON "Background"("systemId");

-- CreateIndex
CREATE INDEX "Background_order_idx" ON "Background"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Background_systemId_name_key" ON "Background"("systemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Background_systemId_key_key" ON "Background"("systemId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheet_campaignActorId_key" ON "CharacterSheet"("campaignActorId");

-- CreateIndex
CREATE INDEX "CharacterSheet_campaignId_idx" ON "CharacterSheet"("campaignId");

-- CreateIndex
CREATE INDEX "CharacterSheet_systemId_idx" ON "CharacterSheet"("systemId");

-- CreateIndex
CREATE INDEX "CharacterSheet_campaignActorId_idx" ON "CharacterSheet"("campaignActorId");

-- CreateIndex
CREATE INDEX "CharacterSheet_ownerId_idx" ON "CharacterSheet"("ownerId");

-- CreateIndex
CREATE INDEX "CharacterSheet_ancestryId_idx" ON "CharacterSheet"("ancestryId");

-- CreateIndex
CREATE INDEX "CharacterSheet_backgroundId_idx" ON "CharacterSheet"("backgroundId");

-- CreateIndex
CREATE INDEX "CharacterSheet_classId_idx" ON "CharacterSheet"("classId");

-- CreateIndex
CREATE INDEX "CharacterSheet_subclassId_idx" ON "CharacterSheet"("subclassId");

-- CreateIndex
CREATE INDEX "CharacterSheet_status_idx" ON "CharacterSheet"("status");

-- CreateIndex
CREATE INDEX "CharacterSheetStat_characterSheetId_idx" ON "CharacterSheetStat"("characterSheetId");

-- CreateIndex
CREATE INDEX "CharacterSheetStat_statId_idx" ON "CharacterSheetStat"("statId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheetStat_characterSheetId_statId_key" ON "CharacterSheetStat"("characterSheetId", "statId");

-- CreateIndex
CREATE INDEX "CharacterSheetSkill_characterSheetId_idx" ON "CharacterSheetSkill"("characterSheetId");

-- CreateIndex
CREATE INDEX "CharacterSheetSkill_skillId_idx" ON "CharacterSheetSkill"("skillId");

-- CreateIndex
CREATE INDEX "CharacterSheetSkill_isProficient_idx" ON "CharacterSheetSkill"("isProficient");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheetSkill_characterSheetId_skillId_key" ON "CharacterSheetSkill"("characterSheetId", "skillId");

-- CreateIndex
CREATE INDEX "CharacterSheetSpell_characterSheetId_idx" ON "CharacterSheetSpell"("characterSheetId");

-- CreateIndex
CREATE INDEX "CharacterSheetSpell_spellId_idx" ON "CharacterSheetSpell"("spellId");

-- CreateIndex
CREATE INDEX "CharacterSheetSpell_isPrepared_idx" ON "CharacterSheetSpell"("isPrepared");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheetSpell_characterSheetId_spellId_key" ON "CharacterSheetSpell"("characterSheetId", "spellId");

-- CreateIndex
CREATE INDEX "CharacterSheetEquipment_characterSheetId_idx" ON "CharacterSheetEquipment"("characterSheetId");

-- CreateIndex
CREATE INDEX "CharacterSheetEquipment_equipmentId_idx" ON "CharacterSheetEquipment"("equipmentId");

-- CreateIndex
CREATE INDEX "CharacterSheetEquipment_isEquipped_idx" ON "CharacterSheetEquipment"("isEquipped");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheetEquipment_characterSheetId_equipmentId_key" ON "CharacterSheetEquipment"("characterSheetId", "equipmentId");

-- CreateIndex
CREATE INDEX "CharacterClass_systemId_idx" ON "CharacterClass"("systemId");

-- CreateIndex
CREATE INDEX "CharacterClass_order_idx" ON "CharacterClass"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterClass_systemId_name_key" ON "CharacterClass"("systemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterClass_systemId_key_key" ON "CharacterClass"("systemId", "key");

-- CreateIndex
CREATE INDEX "CharacterSubclass_systemId_idx" ON "CharacterSubclass"("systemId");

-- CreateIndex
CREATE INDEX "CharacterSubclass_classId_idx" ON "CharacterSubclass"("classId");

-- CreateIndex
CREATE INDEX "CharacterSubclass_order_idx" ON "CharacterSubclass"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSubclass_classId_name_key" ON "CharacterSubclass"("classId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSubclass_classId_key_key" ON "CharacterSubclass"("classId", "key");

-- CreateIndex
CREATE INDEX "LevelProgression_systemId_idx" ON "LevelProgression"("systemId");

-- CreateIndex
CREATE INDEX "LevelProgression_classId_idx" ON "LevelProgression"("classId");

-- CreateIndex
CREATE INDEX "LevelProgression_level_idx" ON "LevelProgression"("level");

-- CreateIndex
CREATE UNIQUE INDEX "LevelProgression_classId_level_key" ON "LevelProgression"("classId", "level");

-- CreateIndex
CREATE INDEX "Feature_systemId_idx" ON "Feature"("systemId");

-- CreateIndex
CREATE INDEX "Feature_ancestryId_idx" ON "Feature"("ancestryId");

-- CreateIndex
CREATE INDEX "Feature_backgroundId_idx" ON "Feature"("backgroundId");

-- CreateIndex
CREATE INDEX "Feature_classId_idx" ON "Feature"("classId");

-- CreateIndex
CREATE INDEX "Feature_subclassId_idx" ON "Feature"("subclassId");

-- CreateIndex
CREATE INDEX "Feature_levelProgressionId_idx" ON "Feature"("levelProgressionId");

-- CreateIndex
CREATE INDEX "Feature_sourceType_idx" ON "Feature"("sourceType");

-- CreateIndex
CREATE INDEX "Feature_level_idx" ON "Feature"("level");

-- CreateIndex
CREATE INDEX "Feature_order_idx" ON "Feature"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_systemId_key_key" ON "Feature"("systemId", "key");

-- CreateIndex
CREATE INDEX "Spell_systemId_idx" ON "Spell"("systemId");

-- CreateIndex
CREATE INDEX "Spell_level_idx" ON "Spell"("level");

-- CreateIndex
CREATE INDEX "Spell_school_idx" ON "Spell"("school");

-- CreateIndex
CREATE INDEX "Spell_order_idx" ON "Spell"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Spell_systemId_name_key" ON "Spell"("systemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Spell_systemId_key_key" ON "Spell"("systemId", "key");

-- CreateIndex
CREATE INDEX "Equipment_systemId_idx" ON "Equipment"("systemId");

-- CreateIndex
CREATE INDEX "Equipment_category_idx" ON "Equipment"("category");

-- CreateIndex
CREATE INDEX "Equipment_order_idx" ON "Equipment"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_systemId_name_key" ON "Equipment"("systemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_systemId_key_key" ON "Equipment"("systemId", "key");

-- CreateIndex
CREATE INDEX "CampaignActor_campaignId_idx" ON "CampaignActor"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignActor_ownerId_idx" ON "CampaignActor"("ownerId");

-- CreateIndex
CREATE INDEX "CampaignActor_type_idx" ON "CampaignActor"("type");

-- CreateIndex
CREATE INDEX "CampaignActor_location_idx" ON "CampaignActor"("location");

-- CreateIndex
CREATE INDEX "SceneToken_campaignId_idx" ON "SceneToken"("campaignId");

-- CreateIndex
CREATE INDEX "SceneToken_actorId_idx" ON "SceneToken"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignInvite_token_key" ON "CampaignInvite"("token");

-- CreateIndex
CREATE INDEX "CampaignInvite_campaignId_idx" ON "CampaignInvite"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignInvite_senderId_idx" ON "CampaignInvite"("senderId");

-- CreateIndex
CREATE INDEX "CampaignInvite_recipientUserId_idx" ON "CampaignInvite"("recipientUserId");

-- CreateIndex
CREATE INDEX "CampaignInvite_token_idx" ON "CampaignInvite"("token");

-- CreateIndex
CREATE INDEX "CampaignInvite_status_idx" ON "CampaignInvite"("status");

-- CreateIndex
CREATE INDEX "CampaignLog_campaignId_idx" ON "CampaignLog"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignLog_userId_idx" ON "CampaignLog"("userId");

-- CreateIndex
CREATE INDEX "CampaignLog_type_idx" ON "CampaignLog"("type");

-- CreateIndex
CREATE INDEX "CampaignLog_createdAt_idx" ON "CampaignLog"("createdAt");

-- CreateIndex
CREATE INDEX "Campaign_ownerId_idx" ON "Campaign"("ownerId");

-- CreateIndex
CREATE INDEX "Campaign_systemId_idx" ON "Campaign"("systemId");

-- CreateIndex
CREATE INDEX "Campaign_isPublic_idx" ON "Campaign"("isPublic");

-- CreateIndex
CREATE INDEX "Campaign_isActive_idx" ON "Campaign"("isActive");

-- CreateIndex
CREATE INDEX "GameSession_campaignId_idx" ON "GameSession"("campaignId");

-- CreateIndex
CREATE INDEX "GameSession_scheduledAt_idx" ON "GameSession"("scheduledAt");

-- CreateIndex
CREATE INDEX "Participant_campaignId_idx" ON "Participant"("campaignId");

-- CreateIndex
CREATE INDEX "Participant_userId_idx" ON "Participant"("userId");

-- CreateIndex
CREATE INDEX "Participant_status_idx" ON "Participant"("status");

-- CreateIndex
CREATE INDEX "Skill_systemId_idx" ON "Skill"("systemId");

-- CreateIndex
CREATE INDEX "Skill_statId_idx" ON "Skill"("statId");

-- CreateIndex
CREATE INDEX "Skill_order_idx" ON "Skill"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_systemId_key_key" ON "Skill"("systemId", "key");

-- CreateIndex
CREATE INDEX "Stat_systemId_idx" ON "Stat"("systemId");

-- CreateIndex
CREATE INDEX "Stat_order_idx" ON "Stat"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Stat_systemId_key_key" ON "Stat"("systemId", "key");

-- AddForeignKey
ALTER TABLE "Ancestry" ADD CONSTRAINT "Ancestry_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Background" ADD CONSTRAINT "Background_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheet" ADD CONSTRAINT "CharacterSheet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheet" ADD CONSTRAINT "CharacterSheet_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheet" ADD CONSTRAINT "CharacterSheet_campaignActorId_fkey" FOREIGN KEY ("campaignActorId") REFERENCES "CampaignActor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheet" ADD CONSTRAINT "CharacterSheet_ancestryId_fkey" FOREIGN KEY ("ancestryId") REFERENCES "Ancestry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheet" ADD CONSTRAINT "CharacterSheet_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "Background"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheet" ADD CONSTRAINT "CharacterSheet_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheet" ADD CONSTRAINT "CharacterSheet_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "CharacterSubclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetStat" ADD CONSTRAINT "CharacterSheetStat_characterSheetId_fkey" FOREIGN KEY ("characterSheetId") REFERENCES "CharacterSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetStat" ADD CONSTRAINT "CharacterSheetStat_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetSkill" ADD CONSTRAINT "CharacterSheetSkill_characterSheetId_fkey" FOREIGN KEY ("characterSheetId") REFERENCES "CharacterSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetSkill" ADD CONSTRAINT "CharacterSheetSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetSpell" ADD CONSTRAINT "CharacterSheetSpell_characterSheetId_fkey" FOREIGN KEY ("characterSheetId") REFERENCES "CharacterSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetSpell" ADD CONSTRAINT "CharacterSheetSpell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetEquipment" ADD CONSTRAINT "CharacterSheetEquipment_characterSheetId_fkey" FOREIGN KEY ("characterSheetId") REFERENCES "CharacterSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetEquipment" ADD CONSTRAINT "CharacterSheetEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterClass" ADD CONSTRAINT "CharacterClass_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSubclass" ADD CONSTRAINT "CharacterSubclass_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSubclass" ADD CONSTRAINT "CharacterSubclass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelProgression" ADD CONSTRAINT "LevelProgression_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelProgression" ADD CONSTRAINT "LevelProgression_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_ancestryId_fkey" FOREIGN KEY ("ancestryId") REFERENCES "Ancestry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "Background"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "CharacterSubclass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_levelProgressionId_fkey" FOREIGN KEY ("levelProgressionId") REFERENCES "LevelProgression"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spell" ADD CONSTRAINT "Spell_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stat" ADD CONSTRAINT "Stat_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_characterSheetId_fkey" FOREIGN KEY ("characterSheetId") REFERENCES "CharacterSheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignActor" ADD CONSTRAINT "CampaignActor_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignActor" ADD CONSTRAINT "CampaignActor_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneToken" ADD CONSTRAINT "SceneToken_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneToken" ADD CONSTRAINT "SceneToken_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "CampaignActor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignLog" ADD CONSTRAINT "CampaignLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignLog" ADD CONSTRAINT "CampaignLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
