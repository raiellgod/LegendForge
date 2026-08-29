-- CreateEnum
CREATE TYPE "EquipmentAttackType" AS ENUM ('NONE', 'MELEE', 'RANGED', 'THROWN');

-- CreateEnum
CREATE TYPE "EquipmentWeaponGroup" AS ENUM ('SIMPLE', 'MARTIAL', 'IMPROVISED', 'NATURAL', 'TECH', 'RELIC');

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "alternativeAbilityKey" TEXT,
ADD COLUMN     "attackAbilityKey" TEXT,
ADD COLUMN     "attackBonus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "attackType" "EquipmentAttackType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "damageBonus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "damageFormula" TEXT,
ADD COLUMN     "damageType" TEXT,
ADD COLUMN     "isFinesse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isThrown" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTwoHanded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVersatile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "longRange" INTEGER,
ADD COLUMN     "normalRange" INTEGER,
ADD COLUMN     "versatileDamageFormula" TEXT,
ADD COLUMN     "weaponGroup" "EquipmentWeaponGroup";

-- CreateIndex
CREATE INDEX "Equipment_attackType_idx" ON "Equipment"("attackType");

-- CreateIndex
CREATE INDEX "Equipment_weaponGroup_idx" ON "Equipment"("weaponGroup");
