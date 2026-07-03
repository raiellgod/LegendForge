/*
  Warnings:

  - You are about to drop the column `createdAt` on the `CharacterClass` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CharacterClass` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CharacterClass" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "classSkillChoiceCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "protectionProficiencyKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "toolProficiencyKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "weaponProficiencyKeys" TEXT[] DEFAULT ARRAY[]::TEXT[];
