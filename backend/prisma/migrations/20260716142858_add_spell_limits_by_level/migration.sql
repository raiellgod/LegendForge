-- AlterTable
ALTER TABLE "CharacterSheetSpell" ADD COLUMN     "classId" TEXT;

-- CreateTable
CREATE TABLE "LevelProgressionSpellLimit" (
    "id" TEXT NOT NULL,
    "levelProgressionId" TEXT NOT NULL,
    "spellLevel" INTEGER NOT NULL,
    "spellsKnown" INTEGER NOT NULL DEFAULT 0,
    "spellsPrepared" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LevelProgressionSpellLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LevelProgressionSpellLimit_levelProgressionId_idx" ON "LevelProgressionSpellLimit"("levelProgressionId");

-- CreateIndex
CREATE INDEX "LevelProgressionSpellLimit_spellLevel_idx" ON "LevelProgressionSpellLimit"("spellLevel");

-- CreateIndex
CREATE UNIQUE INDEX "LevelProgressionSpellLimit_levelProgressionId_spellLevel_key" ON "LevelProgressionSpellLimit"("levelProgressionId", "spellLevel");

-- CreateIndex
CREATE INDEX "CharacterSheetSpell_classId_idx" ON "CharacterSheetSpell"("classId");

-- AddForeignKey
ALTER TABLE "CharacterSheetSpell" ADD CONSTRAINT "CharacterSheetSpell_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelProgressionSpellLimit" ADD CONSTRAINT "LevelProgressionSpellLimit_levelProgressionId_fkey" FOREIGN KEY ("levelProgressionId") REFERENCES "LevelProgression"("id") ON DELETE CASCADE ON UPDATE CASCADE;
