-- Migration: Versioning columns for requirement templates and checklist snapshots
-- Supports template lifecycle tracking + version sync between templates and checklists.

-- 1) Template status enum
DO $$ BEGIN
  CREATE TYPE public.template_status AS ENUM ('draft', 'published', 'superseded', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) Add versioning columns to requirement_templates
ALTER TABLE public.requirement_templates
  ADD COLUMN IF NOT EXISTS revision_date date,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_org text,
  ADD COLUMN IF NOT EXISTS change_summary text,
  ADD COLUMN IF NOT EXISTS status public.template_status NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS supersedes_template_id uuid REFERENCES public.requirement_templates(id) ON DELETE SET NULL;

-- Index for finding superseded templates
CREATE INDEX IF NOT EXISTS idx_requirement_templates_supersedes
  ON public.requirement_templates (supersedes_template_id)
  WHERE supersedes_template_id IS NOT NULL;

-- 3) Add category to requirement_template_items (for grouping items in playbook)
ALTER TABLE public.requirement_template_items
  ADD COLUMN IF NOT EXISTS category text;

-- 4) Add version snapshot columns to checklists
ALTER TABLE public.checklists
  ADD COLUMN IF NOT EXISTS template_version_used int,
  ADD COLUMN IF NOT EXISTS template_revision_date_used date,
  ADD COLUMN IF NOT EXISTS template_published_at_used timestamptz;

-- 5) Add template_item_id FK to checklist_items (link back to source template item)
ALTER TABLE public.checklist_items
  ADD COLUMN IF NOT EXISTS template_item_id uuid REFERENCES public.requirement_template_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_checklist_items_template_item
  ON public.checklist_items (template_item_id)
  WHERE template_item_id IS NOT NULL;

COMMENT ON COLUMN public.requirement_templates.status IS 'Lifecycle state: draft, published, superseded, archived';
COMMENT ON COLUMN public.requirement_templates.supersedes_template_id IS 'Points to the previous version this template replaced';
COMMENT ON COLUMN public.requirement_templates.revision_date IS 'Date the official requirements were last revised by the issuing authority';
COMMENT ON COLUMN public.requirement_templates.published_at IS 'When this template version was published on VysaGuard';
COMMENT ON COLUMN public.requirement_templates.source_org IS 'Name of the issuing authority (e.g. UK Home Office)';
COMMENT ON COLUMN public.requirement_templates.change_summary IS 'Human-readable summary of what changed from the previous version';
COMMENT ON COLUMN public.checklists.template_version_used IS 'Snapshot of template.version at the time checklist was seeded';
COMMENT ON COLUMN public.checklists.template_revision_date_used IS 'Snapshot of template.revision_date at the time checklist was seeded';
COMMENT ON COLUMN public.checklists.template_published_at_used IS 'Snapshot of template.published_at at the time checklist was seeded';
COMMENT ON COLUMN public.checklist_items.template_item_id IS 'FK to the requirement_template_item this checklist item was seeded from';
COMMENT ON COLUMN public.requirement_template_items.category IS 'Grouping category (e.g. Identity, Financial, Travel) for playbook display';
