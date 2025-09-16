-- Set the MissionLog Platform enterprise subtype to a unique, hardcoded value
-- This ensures the root platform account is labeled distinctly in the UI

-- Idempotent update: always force enterprise_subtype to 'Root Account' for the platform tenant
update public.enterprises
set settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object('enterprise_subtype', 'Root Account')
where slug = 'missionlog-platform' or name = 'MissionLog Platform';


