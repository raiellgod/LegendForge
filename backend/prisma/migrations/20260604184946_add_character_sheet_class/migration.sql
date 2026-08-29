-- CreateTable
CREATE TABLE "CharacterSheetClass" (
    "id" TEXT NOT NULL,
    "characterSheetId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subclassId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSheetClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterSheetClass_characterSheetId_idx" ON "CharacterSheetClass"("characterSheetId");

-- CreateIndex
CREATE INDEX "CharacterSheetClass_classId_idx" ON "CharacterSheetClass"("classId");

-- CreateIndex
CREATE INDEX "CharacterSheetClass_subclassId_idx" ON "CharacterSheetClass"("subclassId");

-- CreateIndex
CREATE INDEX "CharacterSheetClass_isPrimary_idx" ON "CharacterSheetClass"("isPrimary");

-- CreateIndex
CREATE INDEX "CharacterSheetClass_order_idx" ON "CharacterSheetClass"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheetClass_characterSheetId_classId_key" ON "CharacterSheetClass"("characterSheetId", "classId");

-- AddForeignKey
ALTER TABLE "CharacterSheetClass" ADD CONSTRAINT "CharacterSheetClass_characterSheetId_fkey" FOREIGN KEY ("characterSheetId") REFERENCES "CharacterSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetClass" ADD CONSTRAINT "CharacterSheetClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetClass" ADD CONSTRAINT "CharacterSheetClass_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "CharacterSubclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
