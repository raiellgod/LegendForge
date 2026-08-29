-- AlterTable
ALTER TABLE "NpcSheet" ADD COLUMN     "ancestryId" TEXT,
ADD COLUMN     "backgroundId" TEXT,
ADD COLUMN     "subAncestryId" TEXT;

-- CreateTable
CREATE TABLE "NpcSheetClass" (
    "id" TEXT NOT NULL,
    "npcSheetId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subclassId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpcSheetClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NpcSheetClass_npcSheetId_idx" ON "NpcSheetClass"("npcSheetId");

-- CreateIndex
CREATE INDEX "NpcSheetClass_classId_idx" ON "NpcSheetClass"("classId");

-- CreateIndex
CREATE INDEX "NpcSheetClass_subclassId_idx" ON "NpcSheetClass"("subclassId");

-- CreateIndex
CREATE INDEX "NpcSheetClass_isPrimary_idx" ON "NpcSheetClass"("isPrimary");

-- CreateIndex
CREATE INDEX "NpcSheetClass_order_idx" ON "NpcSheetClass"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NpcSheetClass_npcSheetId_classId_key" ON "NpcSheetClass"("npcSheetId", "classId");

-- CreateIndex
CREATE INDEX "NpcSheet_ancestryId_idx" ON "NpcSheet"("ancestryId");

-- CreateIndex
CREATE INDEX "NpcSheet_subAncestryId_idx" ON "NpcSheet"("subAncestryId");

-- CreateIndex
CREATE INDEX "NpcSheet_backgroundId_idx" ON "NpcSheet"("backgroundId");

-- AddForeignKey
ALTER TABLE "NpcSheet" ADD CONSTRAINT "NpcSheet_ancestryId_fkey" FOREIGN KEY ("ancestryId") REFERENCES "Ancestry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheet" ADD CONSTRAINT "NpcSheet_subAncestryId_fkey" FOREIGN KEY ("subAncestryId") REFERENCES "SubAncestry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheet" ADD CONSTRAINT "NpcSheet_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "Background"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetClass" ADD CONSTRAINT "NpcSheetClass_npcSheetId_fkey" FOREIGN KEY ("npcSheetId") REFERENCES "NpcSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetClass" ADD CONSTRAINT "NpcSheetClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcSheetClass" ADD CONSTRAINT "NpcSheetClass_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "CharacterSubclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
