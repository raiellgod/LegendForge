-- CreateEnum
CREATE TYPE "CharacterProgressionChoiceType" AS ENUM ('ATTRIBUTE_INCREASE', 'TALENT');

-- CreateEnum
CREATE TYPE "CharacterAttributeIncreaseMode" AS ENUM ('FOCUSED', 'SPLIT');

-- CreateTable
CREATE TABLE "CharacterSheetProgressionChoice" (
    "id" TEXT NOT NULL,
    "characterSheetId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "talentId" TEXT,
    "classLevel" INTEGER NOT NULL,
    "choiceIndex" INTEGER NOT NULL,
    "type" "CharacterProgressionChoiceType",
    "attributeIncreaseMode" "CharacterAttributeIncreaseMode",
    "attributeIncreases" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSheetProgressionChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterSheetProgressionChoice_characterSheetId_idx" ON "CharacterSheetProgressionChoice"("characterSheetId");

-- CreateIndex
CREATE INDEX "CharacterSheetProgressionChoice_classId_idx" ON "CharacterSheetProgressionChoice"("classId");

-- CreateIndex
CREATE INDEX "CharacterSheetProgressionChoice_talentId_idx" ON "CharacterSheetProgressionChoice"("talentId");

-- CreateIndex
CREATE INDEX "CharacterSheetProgressionChoice_type_idx" ON "CharacterSheetProgressionChoice"("type");

-- CreateIndex
CREATE INDEX "CharacterSheetProgressionChoice_classLevel_idx" ON "CharacterSheetProgressionChoice"("classLevel");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheetProgressionChoice_characterSheetId_classId_cl_key" ON "CharacterSheetProgressionChoice"("characterSheetId", "classId", "classLevel", "choiceIndex");

-- AddForeignKey
ALTER TABLE "CharacterSheetProgressionChoice" ADD CONSTRAINT "CharacterSheetProgressionChoice_characterSheetId_fkey" FOREIGN KEY ("characterSheetId") REFERENCES "CharacterSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetProgressionChoice" ADD CONSTRAINT "CharacterSheetProgressionChoice_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetProgressionChoice" ADD CONSTRAINT "CharacterSheetProgressionChoice_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "Talent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
