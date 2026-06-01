-- AlterTable
ALTER TABLE "CharacterClass" ADD COLUMN     "spellcastingAbilityKey" TEXT;

-- AlterTable
ALTER TABLE "LevelProgression" ADD COLUMN     "cantripsKnown" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellSlotsLevel1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellSlotsLevel2" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellSlotsLevel3" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellSlotsLevel4" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellSlotsLevel5" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellSlotsLevel6" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellSlotsLevel7" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellSlotsLevel8" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellSlotsLevel9" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellsKnown" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellsPrepared" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ClassSpell" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    "minimumClassLevel" INTEGER NOT NULL DEFAULT 1,
    "isAlwaysKnown" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSpell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassSpell_classId_idx" ON "ClassSpell"("classId");

-- CreateIndex
CREATE INDEX "ClassSpell_spellId_idx" ON "ClassSpell"("spellId");

-- CreateIndex
CREATE INDEX "ClassSpell_minimumClassLevel_idx" ON "ClassSpell"("minimumClassLevel");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSpell_classId_spellId_key" ON "ClassSpell"("classId", "spellId");

-- AddForeignKey
ALTER TABLE "ClassSpell" ADD CONSTRAINT "ClassSpell_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSpell" ADD CONSTRAINT "ClassSpell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
