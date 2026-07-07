-- DropIndex
DROP INDEX "GameSystem_name_key";

-- AlterTable
ALTER TABLE "Ancestry" ADD COLUMN     "languageKeys" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Background" ADD COLUMN     "languageKeys" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "GameSystem" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "version" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSheetLanguage" (
    "id" TEXT NOT NULL,
    "characterSheetId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "source" TEXT DEFAULT 'builder',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSheetLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Language_systemId_idx" ON "Language"("systemId");

-- CreateIndex
CREATE INDEX "Language_order_idx" ON "Language"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Language_systemId_name_key" ON "Language"("systemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_systemId_key_key" ON "Language"("systemId", "key");

-- CreateIndex
CREATE INDEX "CharacterSheetLanguage_characterSheetId_idx" ON "CharacterSheetLanguage"("characterSheetId");

-- CreateIndex
CREATE INDEX "CharacterSheetLanguage_languageId_idx" ON "CharacterSheetLanguage"("languageId");

-- CreateIndex
CREATE INDEX "CharacterSheetLanguage_source_idx" ON "CharacterSheetLanguage"("source");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheetLanguage_characterSheetId_languageId_key" ON "CharacterSheetLanguage"("characterSheetId", "languageId");

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetLanguage" ADD CONSTRAINT "CharacterSheetLanguage_characterSheetId_fkey" FOREIGN KEY ("characterSheetId") REFERENCES "CharacterSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetLanguage" ADD CONSTRAINT "CharacterSheetLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;
