-- AlterEnum
ALTER TYPE "FeatureSourceType" ADD VALUE 'SUBANCESTRY';

-- AlterTable
ALTER TABLE "CharacterSheet" ADD COLUMN     "subAncestryId" TEXT;

-- AlterTable
ALTER TABLE "Feature" ADD COLUMN     "subAncestryId" TEXT;

-- AlterTable
ALTER TABLE "FeatureChoiceGroup" ADD COLUMN     "subAncestryId" TEXT;

-- CreateTable
CREATE TABLE "SubAncestry" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "ancestryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "sizeCategoryOverride" "CreatureSize",
    "attributeBonuses" JSONB NOT NULL DEFAULT '{}',
    "languageKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubAncestry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubAncestry_systemId_idx" ON "SubAncestry"("systemId");

-- CreateIndex
CREATE INDEX "SubAncestry_ancestryId_idx" ON "SubAncestry"("ancestryId");

-- CreateIndex
CREATE INDEX "SubAncestry_order_idx" ON "SubAncestry"("order");

-- CreateIndex
CREATE UNIQUE INDEX "SubAncestry_systemId_name_key" ON "SubAncestry"("systemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SubAncestry_systemId_key_key" ON "SubAncestry"("systemId", "key");

-- CreateIndex
CREATE INDEX "CharacterSheet_subAncestryId_idx" ON "CharacterSheet"("subAncestryId");

-- CreateIndex
CREATE INDEX "Feature_subAncestryId_idx" ON "Feature"("subAncestryId");

-- CreateIndex
CREATE INDEX "FeatureChoiceGroup_subAncestryId_idx" ON "FeatureChoiceGroup"("subAncestryId");

-- AddForeignKey
ALTER TABLE "SubAncestry" ADD CONSTRAINT "SubAncestry_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubAncestry" ADD CONSTRAINT "SubAncestry_ancestryId_fkey" FOREIGN KEY ("ancestryId") REFERENCES "Ancestry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheet" ADD CONSTRAINT "CharacterSheet_subAncestryId_fkey" FOREIGN KEY ("subAncestryId") REFERENCES "SubAncestry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_subAncestryId_fkey" FOREIGN KEY ("subAncestryId") REFERENCES "SubAncestry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureChoiceGroup" ADD CONSTRAINT "FeatureChoiceGroup_subAncestryId_fkey" FOREIGN KEY ("subAncestryId") REFERENCES "SubAncestry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
