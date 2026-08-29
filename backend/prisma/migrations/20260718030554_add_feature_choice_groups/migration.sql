-- CreateTable
CREATE TABLE "FeatureChoiceGroup" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "ancestryId" TEXT,
    "backgroundId" TEXT,
    "classId" TEXT,
    "subclassId" TEXT,
    "levelProgressionId" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "choiceCount" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureChoiceGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureChoiceOption" (
    "id" TEXT NOT NULL,
    "choiceGroupId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureChoiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSheetFeatureChoice" (
    "id" TEXT NOT NULL,
    "characterSheetId" TEXT NOT NULL,
    "choiceGroupId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'builder',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSheetFeatureChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureChoiceGroup_systemId_idx" ON "FeatureChoiceGroup"("systemId");

-- CreateIndex
CREATE INDEX "FeatureChoiceGroup_ancestryId_idx" ON "FeatureChoiceGroup"("ancestryId");

-- CreateIndex
CREATE INDEX "FeatureChoiceGroup_backgroundId_idx" ON "FeatureChoiceGroup"("backgroundId");

-- CreateIndex
CREATE INDEX "FeatureChoiceGroup_classId_idx" ON "FeatureChoiceGroup"("classId");

-- CreateIndex
CREATE INDEX "FeatureChoiceGroup_subclassId_idx" ON "FeatureChoiceGroup"("subclassId");

-- CreateIndex
CREATE INDEX "FeatureChoiceGroup_levelProgressionId_idx" ON "FeatureChoiceGroup"("levelProgressionId");

-- CreateIndex
CREATE INDEX "FeatureChoiceGroup_order_idx" ON "FeatureChoiceGroup"("order");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureChoiceGroup_systemId_key_key" ON "FeatureChoiceGroup"("systemId", "key");

-- CreateIndex
CREATE INDEX "FeatureChoiceOption_choiceGroupId_idx" ON "FeatureChoiceOption"("choiceGroupId");

-- CreateIndex
CREATE INDEX "FeatureChoiceOption_featureId_idx" ON "FeatureChoiceOption"("featureId");

-- CreateIndex
CREATE INDEX "FeatureChoiceOption_order_idx" ON "FeatureChoiceOption"("order");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureChoiceOption_choiceGroupId_featureId_key" ON "FeatureChoiceOption"("choiceGroupId", "featureId");

-- CreateIndex
CREATE INDEX "CharacterSheetFeatureChoice_characterSheetId_idx" ON "CharacterSheetFeatureChoice"("characterSheetId");

-- CreateIndex
CREATE INDEX "CharacterSheetFeatureChoice_choiceGroupId_idx" ON "CharacterSheetFeatureChoice"("choiceGroupId");

-- CreateIndex
CREATE INDEX "CharacterSheetFeatureChoice_featureId_idx" ON "CharacterSheetFeatureChoice"("featureId");

-- CreateIndex
CREATE INDEX "CharacterSheetFeatureChoice_source_idx" ON "CharacterSheetFeatureChoice"("source");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSheetFeatureChoice_characterSheetId_choiceGroupId__key" ON "CharacterSheetFeatureChoice"("characterSheetId", "choiceGroupId", "featureId");

-- AddForeignKey
ALTER TABLE "FeatureChoiceGroup" ADD CONSTRAINT "FeatureChoiceGroup_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureChoiceGroup" ADD CONSTRAINT "FeatureChoiceGroup_ancestryId_fkey" FOREIGN KEY ("ancestryId") REFERENCES "Ancestry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureChoiceGroup" ADD CONSTRAINT "FeatureChoiceGroup_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "Background"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureChoiceGroup" ADD CONSTRAINT "FeatureChoiceGroup_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureChoiceGroup" ADD CONSTRAINT "FeatureChoiceGroup_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "CharacterSubclass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureChoiceGroup" ADD CONSTRAINT "FeatureChoiceGroup_levelProgressionId_fkey" FOREIGN KEY ("levelProgressionId") REFERENCES "LevelProgression"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureChoiceOption" ADD CONSTRAINT "FeatureChoiceOption_choiceGroupId_fkey" FOREIGN KEY ("choiceGroupId") REFERENCES "FeatureChoiceGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureChoiceOption" ADD CONSTRAINT "FeatureChoiceOption_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetFeatureChoice" ADD CONSTRAINT "CharacterSheetFeatureChoice_characterSheetId_fkey" FOREIGN KEY ("characterSheetId") REFERENCES "CharacterSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetFeatureChoice" ADD CONSTRAINT "CharacterSheetFeatureChoice_choiceGroupId_fkey" FOREIGN KEY ("choiceGroupId") REFERENCES "FeatureChoiceGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSheetFeatureChoice" ADD CONSTRAINT "CharacterSheetFeatureChoice_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
