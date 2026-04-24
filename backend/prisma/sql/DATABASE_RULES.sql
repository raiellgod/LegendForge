-- ======================================================
-- DATABASE_RULES.sql
-- LegendForge
-- Regras manuais do PostgreSQL
-- ======================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_one_gm_per_campaign
ON "Participant" ("campaignId")
WHERE "role" = 'GM';