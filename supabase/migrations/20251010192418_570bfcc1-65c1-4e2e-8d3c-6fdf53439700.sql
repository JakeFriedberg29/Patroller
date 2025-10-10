-- Drop the old constraint that doesn't support organization_subtype_id
ALTER TABLE public.repository_assignments 
DROP CONSTRAINT IF EXISTS platform_assignments_target_check;

-- Add updated constraint that supports both organization_type enum and organization_subtype_id
ALTER TABLE public.repository_assignments
ADD CONSTRAINT platform_assignments_target_check CHECK (
  (
    -- For organization target: must have organization_id, no type or subtype
    target_type = 'organization' 
    AND target_organization_id IS NOT NULL 
    AND target_organization_type IS NULL
    AND target_organization_subtype_id IS NULL
  )
  OR
  (
    -- For organization_type target: must have EITHER type enum OR subtype_id, but not both
    target_type = 'organization_type' 
    AND target_organization_id IS NULL
    AND (
      -- Option 1: Use the enum (old approach)
      (target_organization_type IS NOT NULL AND target_organization_subtype_id IS NULL)
      OR
      -- Option 2: Use the subtype_id (new approach)
      (target_organization_subtype_id IS NOT NULL AND target_organization_type IS NULL)
    )
  )
);