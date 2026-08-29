-- CreateEnum
CREATE TYPE "SheetDefenseKind" AS ENUM ('RESISTANCE', 'IMMUNITY', 'VULNERABILITY');

-- CreateTable
CREATE TABLE "NpcSheet" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "campaignActorId" TEXT NOT NULL,
    "size" "CreatureSize" NOT NULL DEFAULT 'MEDIUM',
    "role" TEXT,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "hitPoints" INTEGER NOT NULL DEFAULT 1,
    "maxHitPoints" INTEGER NOT NULL DEFAULT 1,
    "temporaryHp" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "climbSpeed" INTEGER NOT NULL DEFAULT 0,
    "swimSpeed" INTEGER NOT NULL DEFAULT 0,
    "flySpeed" INTEGER NOT NULL DEFAULT 0,
    "burrowSpeed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetStat" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
    "statId" TEXT NOT NULL,
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "isSavingThrowProficient" BOOLEAN NOT NULL DEFAULT false,
    "savingThrowBonus" INTEGER NOT NULL DEFAULT 0,
    "savingThrowOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetSkill" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "expertiseLevel" INTEGER NOT NULL DEFAULT 0,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetDefense" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
    "kind" "SheetDefenseKind" NOT NULL,
    "damageType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetDefense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetSense" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "range" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetSense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetLanguage" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheet" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "campaignActorId" TEXT NOT NULL,
    "size" "CreatureSize" NOT NULL DEFAULT 'MEDIUM',
    "creatureType" TEXT,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "hitPoints" INTEGER NOT NULL DEFAULT 1,
    "maxHitPoints" INTEGER NOT NULL DEFAULT 1,
    "temporaryHp" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "climbSpeed" INTEGER NOT NULL DEFAULT 0,
    "swimSpeed" INTEGER NOT NULL DEFAULT 0,
    "flySpeed" INTEGER NOT NULL DEFAULT 0,
    "burrowSpeed" INTEGER NOT NULL DEFAULT 0,
    "challengeRating" TEXT,
    "experienceReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetStat" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
    "statId" TEXT NOT NULL,
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "isSavingThrowProficient" BOOLEAN NOT NULL DEFAULT false,
    "savingThrowBonus" INTEGER NOT NULL DEFAULT 0,
    "savingThrowOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheetStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetSkill" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "expertiseLevel" INTEGER NOT NULL DEFAULT 0,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheetSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetDefense" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
    "kind" "SheetDefenseKind" NOT NULL,
    "damageType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheetDefense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetSense" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "range" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheetSense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetLanguage" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheetLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheet_campaignActorId_key" ON "NpcSheet"("campaignActorId");

-- CreateIndex
CREATE INDEX "NpcSheet_campaignId_idx" ON "NpcSheet"("campaignId");

-- CreateIndex
CREATE INDEX "NpcSheet_systemId_idx" ON "NpcSheet"("systemId");

-- CreateIndex
CREATE INDEX "NpcSheet_campaignActorId_idx" ON "NpcSheet"("campaignActorId");

-- CreateIndex
CREATE INDEX "NpcSheet_size_idx" ON "NpcSheet"("size");

-- CreateIndex
CREATE INDEX "NpcSheetStat_npcSheetId_idx" ON "NpcSheetStat"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetStat_statId_idx" ON "NpcSheetStat"("statId");

-- CreateIndex
CREATE INDEX "NpcSheetStat_isSavingThrowProficient_idx" ON "NpcSheetStat"("isSavingThrowProficient");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetStat_npcSheetId_statId_key" ON "NpcSheetStat"("npcSheetId", "statId");

-- CreateIndex
CREATE INDEX "NpcSheetSkill_npcSheetId_idx" ON "NpcSheetSkill"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetSkill_skillId_idx" ON "NpcSheetSkill"("skillId");

-- CreateIndex
CREATE INDEX "NpcSheetSkill_isProficient_idx" ON "NpcSheetSkill"("isProficient");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetSkill_npcSheetId_skillId_key" ON "NpcSheetSkill"("npcSheetId", "skillId");

-- CreateIndex
CREATE INDEX "NpcSheetDefense_npcSheetId_idx" ON "NpcSheetDefense"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetDefense_kind_idx" ON "NpcSheetDefense"("kind");

-- CreateIndex
CREATE INDEX "NpcSheetDefense_damageType_idx" ON "NpcSheetDefense"("damageType");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetDefense_npcSheetId_kind_damageType_key" ON "NpcSheetDefense"("npcSheetId", "kind", "damageType");

-- CreateIndex
CREATE INDEX "NpcSheetSense_npcSheetId_idx" ON "NpcSheetSense"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetSense_name_idx" ON "NpcSheetSense"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetSense_npcSheetId_name_key" ON "NpcSheetSense"("npcSheetId", "name");

-- CreateIndex
CREATE INDEX "NpcSheetLanguage_npcSheetId_idx" ON "NpcSheetLanguage"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetLanguage_languageId_idx" ON "NpcSheetLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetLanguage_npcSheetId_languageId_key" ON "NpcSheetLanguage"("npcSheetId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheet_campaignActorId_key" ON "CreatureSheet"("campaignActorId");

-- CreateIndex
CREATE INDEX "CreatureSheet_campaignId_idx" ON "CreatureSheet"("campaignId");

-- CreateIndex
CREATE INDEX "CreatureSheet_systemId_idx" ON "CreatureSheet"("systemId");

-- CreateIndex
CREATE INDEX "CreatureSheet_campaignActorId_idx" ON "CreatureSheet"("campaignActorId");

-- CreateIndex
CREATE INDEX "CreatureSheet_size_idx" ON "CreatureSheet"("size");

-- CreateIndex
CREATE INDEX "CreatureSheet_challengeRating_idx" ON "CreatureSheet"("challengeRating");

-- CreateIndex
CREATE INDEX "CreatureSheetStat_creatureSheetId_idx" ON "CreatureSheetStat"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetStat_statId_idx" ON "CreatureSheetStat"("statId");

-- CreateIndex
CREATE INDEX "CreatureSheetStat_isSavingThrowProficient_idx" ON "CreatureSheetStat"("isSavingThrowProficient");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetStat_creatureSheetId_statId_key" ON "CreatureSheetStat"("creatureSheetId", "statId");

-- CreateIndex
CREATE INDEX "CreatureSheetSkill_creatureSheetId_idx" ON "CreatureSheetSkill"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetSkill_skillId_idx" ON "CreatureSheetSkill"("skillId");

-- CreateIndex
CREATE INDEX "CreatureSheetSkill_isProficient_idx" ON "CreatureSheetSkill"("isProficient");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetSkill_creatureSheetId_skillId_key" ON "CreatureSheetSkill"("creatureSheetId", "skillId");

-- CreateIndex
CREATE INDEX "CreatureSheetDefense_creatureSheetId_idx" ON "CreatureSheetDefense"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetDefense_kind_idx" ON "CreatureSheetDefense"("kind");

-- CreateIndex
CREATE INDEX "CreatureSheetDefense_damageType_idx" ON "CreatureSheetDefense"("damageType");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetDefense_creatureSheetId_kind_damageType_key" ON "CreatureSheetDefense"("creatureSheetId", "kind", "damageType");

-- CreateIndex
CREATE INDEX "CreatureSheetSense_creatureSheetId_idx" ON "CreatureSheetSense"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetSense_name_idx" ON "CreatureSheetSense"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetSense_creatureSheetId_name_key" ON "CreatureSheetSense"("creatureSheetId", "name");

-- CreateIndex
CREATE INDEX "CreatureSheetLanguage_creatureSheetId_idx" ON "CreatureSheetLanguage"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetLanguage_languageId_idx" ON "CreatureSheetLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetLanguage_creatureSheetId_languageId_key" ON "CreatureSheetLanguage"("creatureSheetId", "languageId");

-- AddForeignKey
ALTER TABLE "NpcSheet" ADD CONSTRAINT "NpcSheet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheet" ADD CONSTRAINT "NpcSheet_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheet" ADD CONSTRAINT "NpcSheet_campaignActorId_fkey" FOREIGN KEY ("campaignActorId") REFERENCES "CampaignActor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetStat" ADD CONSTRAINT "NpcSheetStat_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetStat" ADD CONSTRAINT "NpcSheetStat_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetSkill" ADD CONSTRAINT "NpcSheetSkill_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetSkill" ADD CONSTRAINT "NpcSheetSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetDefense" ADD CONSTRAINT "NpcSheetDefense_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetSense" ADD CONSTRAINT "NpcSheetSense_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetLanguage" ADD CONSTRAINT "NpcSheetLanguage_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetLanguage" ADD CONSTRAINT "NpcSheetLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheet" ADD CONSTRAINT "CreatureSheet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheet" ADD CONSTRAINT "CreatureSheet_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheet" ADD CONSTRAINT "CreatureSheet_campaignActorId_fkey" FOREIGN KEY ("campaignActorId") REFERENCES "CampaignActor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetStat" ADD CONSTRAINT "CreatureSheetStat_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetStat" ADD CONSTRAINT "CreatureSheetStat_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetSkill" ADD CONSTRAINT "CreatureSheetSkill_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetSkill" ADD CONSTRAINT "CreatureSheetSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetDefense" ADD CONSTRAINT "CreatureSheetDefense_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetSense" ADD CONSTRAINT "CreatureSheetSense_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetLanguage" ADD CONSTRAINT "CreatureSheetLanguage_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetLanguage" ADD CONSTRAINT "CreatureSheetLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;
