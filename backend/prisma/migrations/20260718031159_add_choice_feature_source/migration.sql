/*
  Warnings:

  - The values [SYSTEM] on the enum `FeatureSourceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeatureSourceType_new" AS ENUM ('ANCESTRY', 'BACKGROUND', 'CLASS', 'SUBCLASS', 'LEVEL', 'CHOICE');
ALTER TABLE "Feature" ALTER COLUMN "sourceType" TYPE "FeatureSourceType_new" USING ("sourceType"::text::"FeatureSourceType_new");
ALTER TYPE "FeatureSourceType" RENAME TO "FeatureSourceType_old";
ALTER TYPE "FeatureSourceType_new" RENAME TO "FeatureSourceType";
DROP TYPE "public"."FeatureSourceType_old";
COMMIT;
