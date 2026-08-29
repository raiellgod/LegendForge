-- CreateTable
CREATE TABLE "CharacterTemplate" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "ancestryId" TEXT,
    "subAncestryId" TEXT,
    "backgroundId" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pronouns" TEXT,
    "concept" TEXT,
    "portraitUrl" TEXT,
    "tokenImageUrl" TEXT,
    "tokenImageFit" TEXT NOT NULL DEFAULT 'COVER',
    "level" INTEGER NOT NULL DEFAULT 1,
    "maxHitPoints" INTEGER NOT NULL DEFAULT 0,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "classEquipmentMode" TEXT NOT NULL DEFAULT 'PACKAGE',
    "backgroundEquipmentMode" TEXT NOT NULL DEFAULT 'PACKAGE',
    "startingGold" INTEGER NOT NULL DEFAULT 0,
    "alignment" TEXT,
    "faith" TEXT,
    "lifestyle" TEXT,
    "hair" TEXT,
    "skin" TEXT,
    "eyes" TEXT,
    "height" TEXT,
    "weight" TEXT,
    "age" TEXT,
    "gender" TEXT,
    "bonds" TEXT,
    "flaws" TEXT,
    "ideals" TEXT,
    "personality" TEXT,
    "backstory" TEXT,
    "organizations" TEXT,
    "allies" TEXT,
    "enemies" TEXT,
    "notes" TEXT,
    "otherNotes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTemplateClass" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subclassId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterTemplateClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTemplateStat" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "statId" TEXT NOT NULL,
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "isSavingThrowProficient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterTemplateStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTemplateSkill" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "expertiseLevel" INTEGER NOT NULL DEFAULT 0,
    "bonusValue" INTEGER NOT NULL DEFAULT 0,
    "overrideValue" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterTemplateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTemplateSpell" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    "classId" TEXT,
    "source" TEXT,
    "isPrepared" BOOLEAN NOT NULL DEFAULT false,
    "isAlwaysPrepared" BOOLEAN NOT NULL DEFAULT false,
    "uses" INTEGER,
    "maxUses" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterTemplateSpell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTemplateEquipment" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "isAttuned" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterTemplateEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTemplateLanguage" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "source" TEXT DEFAULT 'builder',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterTemplateLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTemplateFeatureChoice" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "choiceGroupId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'builder',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterTemplateFeatureChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTemplateProgressionChoice" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "talentId" TEXT,
    "classLevel" INTEGER NOT NULL,
    "choiceIndex" INTEGER NOT NULL,
    "type" "CharacterProgressionChoiceType",
    "attributeIncreaseMode" "CharacterAttributeIncreaseMode",
    "attributeIncreases" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterTemplateProgressionChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterTemplate_systemId_idx" ON "CharacterTemplate"("systemId");

-- CreateIndex
CREATE INDEX "CharacterTemplate_ancestryId_idx" ON "CharacterTemplate"("ancestryId");

-- CreateIndex
CREATE INDEX "CharacterTemplate_subAncestryId_idx" ON "CharacterTemplate"("subAncestryId");

-- CreateIndex
CREATE INDEX "CharacterTemplate_backgroundId_idx" ON "CharacterTemplate"("backgroundId");

-- CreateIndex
CREATE INDEX "CharacterTemplate_order_idx" ON "CharacterTemplate"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplate_systemId_key_key" ON "CharacterTemplate"("systemId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplate_systemId_name_key" ON "CharacterTemplate"("systemId", "name");

-- CreateIndex
CREATE INDEX "CharacterTemplateClass_templateId_idx" ON "CharacterTemplateClass"("templateId");

-- CreateIndex
CREATE INDEX "CharacterTemplateClass_classId_idx" ON "CharacterTemplateClass"("classId");

-- CreateIndex
CREATE INDEX "CharacterTemplateClass_subclassId_idx" ON "CharacterTemplateClass"("subclassId");

-- CreateIndex
CREATE INDEX "CharacterTemplateClass_isPrimary_idx" ON "CharacterTemplateClass"("isPrimary");

-- CreateIndex
CREATE INDEX "CharacterTemplateClass_order_idx" ON "CharacterTemplateClass"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplateClass_templateId_classId_key" ON "CharacterTemplateClass"("templateId", "classId");

-- CreateIndex
CREATE INDEX "CharacterTemplateStat_templateId_idx" ON "CharacterTemplateStat"("templateId");

-- CreateIndex
CREATE INDEX "CharacterTemplateStat_statId_idx" ON "CharacterTemplateStat"("statId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplateStat_templateId_statId_key" ON "CharacterTemplateStat"("templateId", "statId");

-- CreateIndex
CREATE INDEX "CharacterTemplateSkill_templateId_idx" ON "CharacterTemplateSkill"("templateId");

-- CreateIndex
CREATE INDEX "CharacterTemplateSkill_skillId_idx" ON "CharacterTemplateSkill"("skillId");

-- CreateIndex
CREATE INDEX "CharacterTemplateSkill_isProficient_idx" ON "CharacterTemplateSkill"("isProficient");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplateSkill_templateId_skillId_key" ON "CharacterTemplateSkill"("templateId", "skillId");

-- CreateIndex
CREATE INDEX "CharacterTemplateSpell_templateId_idx" ON "CharacterTemplateSpell"("templateId");

-- CreateIndex
CREATE INDEX "CharacterTemplateSpell_spellId_idx" ON "CharacterTemplateSpell"("spellId");

-- CreateIndex
CREATE INDEX "CharacterTemplateSpell_classId_idx" ON "CharacterTemplateSpell"("classId");

-- CreateIndex
CREATE INDEX "CharacterTemplateSpell_isPrepared_idx" ON "CharacterTemplateSpell"("isPrepared");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplateSpell_templateId_spellId_key" ON "CharacterTemplateSpell"("templateId", "spellId");

-- CreateIndex
CREATE INDEX "CharacterTemplateEquipment_templateId_idx" ON "CharacterTemplateEquipment"("templateId");

-- CreateIndex
CREATE INDEX "CharacterTemplateEquipment_equipmentId_idx" ON "CharacterTemplateEquipment"("equipmentId");

-- CreateIndex
CREATE INDEX "CharacterTemplateEquipment_isEquipped_idx" ON "CharacterTemplateEquipment"("isEquipped");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplateEquipment_templateId_equipmentId_key" ON "CharacterTemplateEquipment"("templateId", "equipmentId");

-- CreateIndex
CREATE INDEX "CharacterTemplateLanguage_templateId_idx" ON "CharacterTemplateLanguage"("templateId");

-- CreateIndex
CREATE INDEX "CharacterTemplateLanguage_languageId_idx" ON "CharacterTemplateLanguage"("languageId");

-- CreateIndex
CREATE INDEX "CharacterTemplateLanguage_source_idx" ON "CharacterTemplateLanguage"("source");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplateLanguage_templateId_languageId_key" ON "CharacterTemplateLanguage"("templateId", "languageId");

-- CreateIndex
CREATE INDEX "CharacterTemplateFeatureChoice_templateId_idx" ON "CharacterTemplateFeatureChoice"("templateId");

-- CreateIndex
CREATE INDEX "CharacterTemplateFeatureChoice_choiceGroupId_idx" ON "CharacterTemplateFeatureChoice"("choiceGroupId");

-- CreateIndex
CREATE INDEX "CharacterTemplateFeatureChoice_featureId_idx" ON "CharacterTemplateFeatureChoice"("featureId");

-- CreateIndex
CREATE INDEX "CharacterTemplateFeatureChoice_source_idx" ON "CharacterTemplateFeatureChoice"("source");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplateFeatureChoice_templateId_choiceGroupId_fea_key" ON "CharacterTemplateFeatureChoice"("templateId", "choiceGroupId", "featureId");

-- CreateIndex
CREATE INDEX "CharacterTemplateProgressionChoice_templateId_idx" ON "CharacterTemplateProgressionChoice"("templateId");

-- CreateIndex
CREATE INDEX "CharacterTemplateProgressionChoice_classId_idx" ON "CharacterTemplateProgressionChoice"("classId");

-- CreateIndex
CREATE INDEX "CharacterTemplateProgressionChoice_talentId_idx" ON "CharacterTemplateProgressionChoice"("talentId");

-- CreateIndex
CREATE INDEX "CharacterTemplateProgressionChoice_type_idx" ON "CharacterTemplateProgressionChoice"("type");

-- CreateIndex
CREATE INDEX "CharacterTemplateProgressionChoice_classLevel_idx" ON "CharacterTemplateProgressionChoice"("classLevel");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTemplateProgressionChoice_templateId_classId_class_key" ON "CharacterTemplateProgressionChoice"("templateId", "classId", "classLevel", "choiceIndex");

-- AddForeignKey
ALTER TABLE "CharacterTemplate" ADD CONSTRAINT "CharacterTemplate_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "GameSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplate" ADD CONSTRAINT "CharacterTemplate_ancestryId_fkey" FOREIGN KEY ("ancestryId") REFERENCES "Ancestry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplate" ADD CONSTRAINT "CharacterTemplate_subAncestryId_fkey" FOREIGN KEY ("subAncestryId") REFERENCES "SubAncestry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplate" ADD CONSTRAINT "CharacterTemplate_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "Background"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateClass" ADD CONSTRAINT "CharacterTemplateClass_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CharacterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateClass" ADD CONSTRAINT "CharacterTemplateClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateClass" ADD CONSTRAINT "CharacterTemplateClass_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "CharacterSubclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateStat" ADD CONSTRAINT "CharacterTemplateStat_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CharacterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateStat" ADD CONSTRAINT "CharacterTemplateStat_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateSkill" ADD CONSTRAINT "CharacterTemplateSkill_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CharacterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateSkill" ADD CONSTRAINT "CharacterTemplateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateSpell" ADD CONSTRAINT "CharacterTemplateSpell_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CharacterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateSpell" ADD CONSTRAINT "CharacterTemplateSpell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateSpell" ADD CONSTRAINT "CharacterTemplateSpell_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateEquipment" ADD CONSTRAINT "CharacterTemplateEquipment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CharacterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateEquipment" ADD CONSTRAINT "CharacterTemplateEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateLanguage" ADD CONSTRAINT "CharacterTemplateLanguage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CharacterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateLanguage" ADD CONSTRAINT "CharacterTemplateLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateFeatureChoice" ADD CONSTRAINT "CharacterTemplateFeatureChoice_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CharacterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateFeatureChoice" ADD CONSTRAINT "CharacterTemplateFeatureChoice_choiceGroupId_fkey" FOREIGN KEY ("choiceGroupId") REFERENCES "FeatureChoiceGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateFeatureChoice" ADD CONSTRAINT "CharacterTemplateFeatureChoice_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateProgressionChoice" ADD CONSTRAINT "CharacterTemplateProgressionChoice_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CharacterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateProgressionChoice" ADD CONSTRAINT "CharacterTemplateProgressionChoice_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTemplateProgressionChoice" ADD CONSTRAINT "CharacterTemplateProgressionChoice_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "Talent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
