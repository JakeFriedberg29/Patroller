-- Rename platform enterprise name and slug from MissionLog to Patroller Console
-- Idempotent updates so re-running is safe.

-- 1) Update enterprises (tenants) name and slug
UPDATE public.enterprises
SET name = 'Patroller Console', slug = 'patroller-console', updated_at = now()
WHERE slug = 'missionlog-platform' OR name = 'MissionLog Platform';

-- 2) Update any notifications seeded with old welcome text
UPDATE public.notifications
SET title = 'Welcome to Patroller Console!'
WHERE title = 'Welcome to MissionLog!';

UPDATE public.notifications
SET message = REPLACE(message, 'Welcome to MissionLog!', 'Welcome to Patroller Console!')
WHERE message ILIKE '%Welcome to MissionLog!%';

-- 3) Ensure enterprise_subtype remains Root Account for platform tenant
UPDATE public.enterprises
SET settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object('enterprise_subtype', 'Root Account')
WHERE slug = 'patroller-console' OR name = 'Patroller Console';


