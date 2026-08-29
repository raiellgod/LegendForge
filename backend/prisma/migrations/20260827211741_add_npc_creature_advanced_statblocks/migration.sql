-- CreateEnum
CREATE TYPE "SheetActionKind" AS ENUM ('ACTION', 'BONUS_ACTION', 'REACTION');

-- CreateEnum
CREATE TYPE "SheetAttackType" AS ENUM ('MELEE', 'RANGED', 'THROWN', 'MAGIC', 'OTHER');

-- AlterTable
ALTER TABLE "CreatureSheet" ADD COLUMN     "behavior" TEXT,
ADD COLUMN     "habitat" TEXT,
ADD COLUMN     "lore" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "portraitUrl" TEXT,
ADD COLUMN     "tactics" TEXT,
ADD COLUMN     "tokenImageFit" "SceneTokenImageFit" NOT NULL DEFAULT 'COVER',
ADD COLUMN     "tokenImageUrl" TEXT;

-- AlterTable
ALTER TABLE "NpcSheet" ADD COLUMN     "behavior" TEXT,
ADD COLUMN     "faction" TEXT,
ADD COLUMN     "lore" TEXT,
ADD COLUMN     "motivation" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "personality" TEXT,
ADD COLUMN     "portraitUrl" TEXT,
ADD COLUMN     "tactics" TEXT,
ADD COLUMN     "tokenImageFit" "SceneTokenImageFit" NOT NULL DEFAULT 'COVER',
ADD COLUMN     "tokenImageUrl" TEXT;

-- CreateTable
CREATE TABLE "NpcSheetTrait" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetAction" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
    "kind" "SheetActionKind" NOT NULL DEFAULT 'ACTION',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "uses" INTEGER,
    "maxUses" INTEGER,
    "recharge" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetAttack" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
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

    CONSTRAINT "NpcSheetAttack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetMultiattack" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Multiataque',
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetMultiattack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetMultiattackEntry" (
    "id" TEXT NOT NULL,
    "multiattackId" TEXT NOT NULL,
    "attackId" TEXT,
    "actionId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetMultiattackEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcSheetMagicalAbility" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
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

    CONSTRAINT "NpcSheetMagicalAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetTrait" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheetTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetAction" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
    "kind" "SheetActionKind" NOT NULL DEFAULT 'ACTION',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "uses" INTEGER,
    "maxUses" INTEGER,
    "recharge" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheetAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetAttack" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
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

    CONSTRAINT "CreatureSheetAttack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetMultiattack" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Multiataque',
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheetMultiattack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetMultiattackEntry" (
    "id" TEXT NOT NULL,
    "multiattackId" TEXT NOT NULL,
    "attackId" TEXT,
    "actionId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatureSheetMultiattackEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatureSheetMagicalAbility" (
    "id" TEXT NOT NULL,
    "creatureSheetId" TEXT NOT NULL,
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

    CONSTRAINT "CreatureSheetMagicalAbility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NpcSheetTrait_npcSheetId_idx" ON "NpcSheetTrait"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetTrait_order_idx" ON "NpcSheetTrait"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetTrait_npcSheetId_name_key" ON "NpcSheetTrait"("npcSheetId", "name");

-- CreateIndex
CREATE INDEX "NpcSheetAction_npcSheetId_idx" ON "NpcSheetAction"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetAction_kind_idx" ON "NpcSheetAction"("kind");

-- CreateIndex
CREATE INDEX "NpcSheetAction_order_idx" ON "NpcSheetAction"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetAction_npcSheetId_kind_name_key" ON "NpcSheetAction"("npcSheetId", "kind", "name");

-- CreateIndex
CREATE INDEX "NpcSheetAttack_npcSheetId_idx" ON "NpcSheetAttack"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetAttack_attackType_idx" ON "NpcSheetAttack"("attackType");

-- CreateIndex
CREATE INDEX "NpcSheetAttack_attackAbilityKey_idx" ON "NpcSheetAttack"("attackAbilityKey");

-- CreateIndex
CREATE INDEX "NpcSheetAttack_damageType_idx" ON "NpcSheetAttack"("damageType");

-- CreateIndex
CREATE INDEX "NpcSheetAttack_order_idx" ON "NpcSheetAttack"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetAttack_npcSheetId_name_key" ON "NpcSheetAttack"("npcSheetId", "name");

-- CreateIndex
CREATE INDEX "NpcSheetMultiattack_npcSheetId_idx" ON "NpcSheetMultiattack"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetMultiattack_order_idx" ON "NpcSheetMultiattack"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetMultiattack_npcSheetId_name_key" ON "NpcSheetMultiattack"("npcSheetId", "name");

-- CreateIndex
CREATE INDEX "NpcSheetMultiattackEntry_multiattackId_idx" ON "NpcSheetMultiattackEntry"("multiattackId");

-- CreateIndex
CREATE INDEX "NpcSheetMultiattackEntry_attackId_idx" ON "NpcSheetMultiattackEntry"("attackId");

-- CreateIndex
CREATE INDEX "NpcSheetMultiattackEntry_actionId_idx" ON "NpcSheetMultiattackEntry"("actionId");

-- CreateIndex
CREATE INDEX "NpcSheetMultiattackEntry_order_idx" ON "NpcSheetMultiattackEntry"("order");

-- CreateIndex
CREATE INDEX "NpcSheetMagicalAbility_npcSheetId_idx" ON "NpcSheetMagicalAbility"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetMagicalAbility_spellId_idx" ON "NpcSheetMagicalAbility"("spellId");

-- CreateIndex
CREATE INDEX "NpcSheetMagicalAbility_abilityKey_idx" ON "NpcSheetMagicalAbility"("abilityKey");

-- CreateIndex
CREATE INDEX "NpcSheetMagicalAbility_order_idx" ON "NpcSheetMagicalAbility"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetMagicalAbility_npcSheetId_name_key" ON "NpcSheetMagicalAbility"("npcSheetId", "name");

-- CreateIndex
CREATE INDEX "CreatureSheetTrait_creatureSheetId_idx" ON "CreatureSheetTrait"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetTrait_order_idx" ON "CreatureSheetTrait"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetTrait_creatureSheetId_name_key" ON "CreatureSheetTrait"("creatureSheetId", "name");

-- CreateIndex
CREATE INDEX "CreatureSheetAction_creatureSheetId_idx" ON "CreatureSheetAction"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetAction_kind_idx" ON "CreatureSheetAction"("kind");

-- CreateIndex
CREATE INDEX "CreatureSheetAction_order_idx" ON "CreatureSheetAction"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetAction_creatureSheetId_kind_name_key" ON "CreatureSheetAction"("creatureSheetId", "kind", "name");

-- CreateIndex
CREATE INDEX "CreatureSheetAttack_creatureSheetId_idx" ON "CreatureSheetAttack"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetAttack_attackType_idx" ON "CreatureSheetAttack"("attackType");

-- CreateIndex
CREATE INDEX "CreatureSheetAttack_attackAbilityKey_idx" ON "CreatureSheetAttack"("attackAbilityKey");

-- CreateIndex
CREATE INDEX "CreatureSheetAttack_damageType_idx" ON "CreatureSheetAttack"("damageType");

-- CreateIndex
CREATE INDEX "CreatureSheetAttack_order_idx" ON "CreatureSheetAttack"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetAttack_creatureSheetId_name_key" ON "CreatureSheetAttack"("creatureSheetId", "name");

-- CreateIndex
CREATE INDEX "CreatureSheetMultiattack_creatureSheetId_idx" ON "CreatureSheetMultiattack"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetMultiattack_order_idx" ON "CreatureSheetMultiattack"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetMultiattack_creatureSheetId_name_key" ON "CreatureSheetMultiattack"("creatureSheetId", "name");

-- CreateIndex
CREATE INDEX "CreatureSheetMultiattackEntry_multiattackId_idx" ON "CreatureSheetMultiattackEntry"("multiattackId");

-- CreateIndex
CREATE INDEX "CreatureSheetMultiattackEntry_attackId_idx" ON "CreatureSheetMultiattackEntry"("attackId");

-- CreateIndex
CREATE INDEX "CreatureSheetMultiattackEntry_actionId_idx" ON "CreatureSheetMultiattackEntry"("actionId");

-- CreateIndex
CREATE INDEX "CreatureSheetMultiattackEntry_order_idx" ON "CreatureSheetMultiattackEntry"("order");

-- CreateIndex
CREATE INDEX "CreatureSheetMagicalAbility_creatureSheetId_idx" ON "CreatureSheetMagicalAbility"("creatureSheetId");

-- CreateIndex
CREATE INDEX "CreatureSheetMagicalAbility_spellId_idx" ON "CreatureSheetMagicalAbility"("spellId");

-- CreateIndex
CREATE INDEX "CreatureSheetMagicalAbility_abilityKey_idx" ON "CreatureSheetMagicalAbility"("abilityKey");

-- CreateIndex
CREATE INDEX "CreatureSheetMagicalAbility_order_idx" ON "CreatureSheetMagicalAbility"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CreatureSheetMagicalAbility_creatureSheetId_name_key" ON "CreatureSheetMagicalAbility"("creatureSheetId", "name");

-- AddForeignKey
ALTER TABLE "NpcSheetTrait" ADD CONSTRAINT "NpcSheetTrait_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetAction" ADD CONSTRAINT "NpcSheetAction_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetAttack" ADD CONSTRAINT "NpcSheetAttack_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetMultiattack" ADD CONSTRAINT "NpcSheetMultiattack_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetMultiattackEntry" ADD CONSTRAINT "NpcSheetMultiattackEntry_multiattackId_fkey" FOREIGN KEY ("multiattackId") REFERENCES "NpcSheetMultiattack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetMultiattackEntry" ADD CONSTRAINT "NpcSheetMultiattackEntry_attackId_fkey" FOREIGN KEY ("attackId") REFERENCES "NpcSheetAttack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetMultiattackEntry" ADD CONSTRAINT "NpcSheetMultiattackEntry_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "NpcSheetAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetMagicalAbility" ADD CONSTRAINT "NpcSheetMagicalAbility_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetMagicalAbility" ADD CONSTRAINT "NpcSheetMagicalAbility_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetTrait" ADD CONSTRAINT "CreatureSheetTrait_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetAction" ADD CONSTRAINT "CreatureSheetAction_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetAttack" ADD CONSTRAINT "CreatureSheetAttack_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetMultiattack" ADD CONSTRAINT "CreatureSheetMultiattack_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetMultiattackEntry" ADD CONSTRAINT "CreatureSheetMultiattackEntry_multiattackId_fkey" FOREIGN KEY ("multiattackId") REFERENCES "CreatureSheetMultiattack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetMultiattackEntry" ADD CONSTRAINT "CreatureSheetMultiattackEntry_attackId_fkey" FOREIGN KEY ("attackId") REFERENCES "CreatureSheetAttack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetMultiattackEntry" ADD CONSTRAINT "CreatureSheetMultiattackEntry_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "CreatureSheetAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetMagicalAbility" ADD CONSTRAINT "CreatureSheetMagicalAbility_creatureSheetId_fkey" FOREIGN KEY ("creatureSheetId") REFERENCES "CreatureSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatureSheetMagicalAbility" ADD CONSTRAINT "CreatureSheetMagicalAbility_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE SET NULL ON UPDATE CASCADE;
