-- AlterTable
ALTER TABLE "Ancestry" ADD COLUMN     "attributeBonuses" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Background" ADD COLUMN     "attributeBonuses" JSONB NOT NULL DEFAULT '{}';
