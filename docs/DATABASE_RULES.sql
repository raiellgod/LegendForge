-- ======================================================
-- DATABASE_RULES.sql
-- LegendForge
-- Regras avançadas de integridade para PostgreSQL
-- ======================================================

-- ======================================================
-- EXTENSIONS
-- ======================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ======================================================
-- DEFAULT UUIDS
-- ======================================================

ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE user_sessions ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE game_systems ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE stats ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE skills ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE races ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE classes ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE subclasses ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE features ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE campaigns ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE participants ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE campaign_invites ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE characters ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE character_classes ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE items ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE item_requirements ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE character_inventory ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE campaign_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ======================================================
-- CHECK CONSTRAINTS - LEVELS / NUMERIC RULES
-- ======================================================

ALTER TABLE game_systems
  ADD CONSTRAINT chk_game_systems_version_positive
  CHECK (version >= 1);

ALTER TABLE classes
  ADD CONSTRAINT chk_classes_hit_die_positive
  CHECK (hit_die > 0);

ALTER TABLE subclasses
  ADD CONSTRAINT chk_subclasses_unlock_level_range
  CHECK (unlock_level BETWEEN 1 AND 20);

ALTER TABLE features
  ADD CONSTRAINT chk_features_required_level_range
  CHECK (required_level BETWEEN 1 AND 20);

ALTER TABLE characters
  ADD CONSTRAINT chk_characters_level_range
  CHECK (level BETWEEN 1 AND 20);

ALTER TABLE character_classes
  ADD CONSTRAINT chk_character_classes_level_range
  CHECK (class_level BETWEEN 1 AND 20);

ALTER TABLE character_stats
  ADD CONSTRAINT chk_character_stats_value_range
  CHECK (value BETWEEN 1 AND 30);

ALTER TABLE character_skills
  ADD CONSTRAINT chk_character_skills_value_non_negative
  CHECK (value >= 0);

ALTER TABLE character_skills
  ADD CONSTRAINT chk_character_skills_proficiency_bonus_non_negative
  CHECK (proficiency_bonus >= 0);

ALTER TABLE items
  ADD CONSTRAINT chk_items_weight_non_negative
  CHECK (weight IS NULL OR weight >= 0);

ALTER TABLE items
  ADD CONSTRAINT chk_items_stack_limit_positive
  CHECK (stack_limit IS NULL OR stack_limit >= 1);

ALTER TABLE character_inventory
  ADD CONSTRAINT chk_character_inventory_quantity_positive
  CHECK (quantity >= 1);

ALTER TABLE characters
  ADD CONSTRAINT chk_characters_hp_current_non_negative
  CHECK (hp_current IS NULL OR hp_current >= 0);

ALTER TABLE characters
  ADD CONSTRAINT chk_characters_hp_max_positive
  CHECK (hp_max IS NULL OR hp_max >= 1);

ALTER TABLE characters
  ADD CONSTRAINT chk_characters_hp_current_lte_hp_max
  CHECK (
    hp_current IS NULL
    OR hp_max IS NULL
    OR hp_current <= hp_max
  );

ALTER TABLE characters
  ADD CONSTRAINT chk_characters_armor_class_non_negative
  CHECK (armor_class IS NULL OR armor_class >= 0);

ALTER TABLE characters
  ADD CONSTRAINT chk_characters_speed_non_negative
  CHECK (speed IS NULL OR speed >= 0);

ALTER TABLE campaigns
  ADD CONSTRAINT chk_campaigns_max_players_positive
  CHECK (max_players IS NULL OR max_players >= 1);

-- ======================================================
-- UNIQUE PARTIAL INDEX
-- Apenas 1 GM ativo por campanha
-- ======================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_one_gm_per_campaign
ON participants (campaign_id)
WHERE role = 'GM' AND removed_at IS NULL;

-- ======================================================
-- FEATURE OWNER CHECK
-- Feature deve pertencer a exatamente 1 contexto:
-- classe OU subclasse OU raça
-- ======================================================

ALTER TABLE features
  ADD CONSTRAINT chk_features_exactly_one_owner
  CHECK (
    (
      CASE WHEN class_id IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN subclass_id IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN race_id IS NOT NULL THEN 1 ELSE 0 END
    ) = 1
  );

-- ======================================================
-- SOURCE / CREATED_BY RULES
-- Se source for USER ou AI, created_by deve existir
-- ======================================================

ALTER TABLE items
  ADD CONSTRAINT chk_items_source_created_by
  CHECK (
    (source = 'OFFICIAL')
    OR
    (source IN ('USER', 'AI') AND created_by IS NOT NULL)
  );

ALTER TABLE features
  ADD CONSTRAINT chk_features_source_created_by
  CHECK (
    (source = 'OFFICIAL')
    OR
    (source IN ('USER', 'AI') AND created_by IS NOT NULL)
  );

-- ======================================================
-- TRIGGER: subclass_id deve pertencer ao class_id
-- em character_classes
-- ======================================================

CREATE OR REPLACE FUNCTION validate_character_class_subclass()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subclass_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM subclasses s
      WHERE s.id = NEW.subclass_id
        AND s.class_id = NEW.class_id
    ) THEN
      RAISE EXCEPTION
        'Invalid subclass_id: subclass does not belong to the provided class_id';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_character_class_subclass ON character_classes;

CREATE TRIGGER trg_validate_character_class_subclass
BEFORE INSERT OR UPDATE ON character_classes
FOR EACH ROW
EXECUTE FUNCTION validate_character_class_subclass();

-- ======================================================
-- TRIGGER: subclass_id em feature deve pertencer ao class_id
-- quando ambos estiverem preenchidos
-- ======================================================

CREATE OR REPLACE FUNCTION validate_feature_subclass_belongs_to_class()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subclass_id IS NOT NULL THEN
    IF NEW.class_id IS NULL THEN
      RAISE EXCEPTION
        'Feature with subclass_id must also define class_id';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM subclasses s
      WHERE s.id = NEW.subclass_id
        AND s.class_id = NEW.class_id
    ) THEN
      RAISE EXCEPTION
        'Invalid feature: subclass does not belong to the provided class';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_feature_subclass_class ON features;

CREATE TRIGGER trg_validate_feature_subclass_class
BEFORE INSERT OR UPDATE ON features
FOR EACH ROW
EXECUTE FUNCTION validate_feature_subclass_belongs_to_class();

-- ======================================================
-- TRIGGER: soma de class_level precisa bater com characters.level
-- ======================================================

CREATE OR REPLACE FUNCTION validate_character_total_level(p_character_id uuid)
RETURNS VOID AS $$
DECLARE
  total_class_level integer;
  character_level integer;
BEGIN
  SELECT COALESCE(SUM(class_level), 0)
    INTO total_class_level
  FROM character_classes
  WHERE character_id = p_character_id;

  SELECT level
    INTO character_level
  FROM characters
  WHERE id = p_character_id;

  IF character_level IS NOT NULL AND total_class_level > 0 AND total_class_level <> character_level THEN
    RAISE EXCEPTION
      'Character total level (%) does not match sum of class levels (%) for character %',
      character_level,
      total_class_level,
      p_character_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_validate_character_total_level_from_character_classes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM validate_character_total_level(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.character_id
      ELSE NEW.character_id
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_character_total_level_on_character_classes ON character_classes;

CREATE CONSTRAINT TRIGGER trg_validate_character_total_level_on_character_classes
AFTER INSERT OR UPDATE OR DELETE ON character_classes
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION trg_validate_character_total_level_from_character_classes();

CREATE OR REPLACE FUNCTION trg_validate_character_total_level_from_characters()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM validate_character_total_level(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_character_total_level_on_characters ON characters;

CREATE CONSTRAINT TRIGGER trg_validate_character_total_level_on_characters
AFTER INSERT OR UPDATE OF level ON characters
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION trg_validate_character_total_level_from_characters();

-- ======================================================
-- TRIGGER: skill.stat_id deve pertencer ao mesmo system_id da skill
-- ======================================================

CREATE OR REPLACE FUNCTION validate_skill_stat_same_system()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM stats st
    WHERE st.id = NEW.stat_id
      AND st.system_id = NEW.system_id
  ) THEN
    RAISE EXCEPTION
      'Invalid skill: stat_id does not belong to the same system_id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_skill_stat_same_system ON skills;

CREATE TRIGGER trg_validate_skill_stat_same_system
BEFORE INSERT OR UPDATE ON skills
FOR EACH ROW
EXECUTE FUNCTION validate_skill_stat_same_system();