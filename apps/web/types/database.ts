/**
 * Database types and interfaces for VysaGuard
 */

// Country interface
export interface Country {
  id: string;
  name: string;
  slug: string;
  iso2: string;
  theme_flag_emoji?: string;
}

// Visa Type interface
export interface VisaType {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Language interface
export interface Language {
  id: string;
  name: string;
  code?: string;
  created_at?: string;
}

// Provider Type interface
export interface ProviderType {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

// Requirement Template interface
export interface RequirementTemplate {
  id: string;
  country_id: string;
  visa_type_id: string;
  title: string;
  version: number;
  summary?: string;
  source_url?: string;
  source_org?: string;
  revision_date?: string;
  published_at?: string;
  last_verified_at?: string;
  change_summary?: string;
  is_active?: boolean;
}

// Requirement Template Item interface
export interface RequirementTemplateItem {
  id: string;
  template_id: string;
  label: string;
  required: boolean;
  sort_order: number;
  notes_hint?: string;
  category?: string;
  client_key?: string;
}

// Playbook Section interface
export interface PlaybookSection {
  id: string;
  country_id: string;
  visa_type_id: string;
  section_key: string;
  title: string;
  content_json: Record<string, unknown>;
  sort_order: number;
  is_active?: boolean;
  updated_at?: string;
}

// Playbook Meta interface
export interface PlaybookMeta {
  id: string;
  country_id: string;
  visa_type_id: string;
  processing_time_text?: string;
  typical_cost_text?: string;
  refusal_reasons: string[];
  updated_at?: string;
}

// Playbook Asset interface
export interface PlaybookAsset {
  id: string;
  country_id: string;
  visa_type_id: string;
  asset_type: string;
  title: string;
  description?: string;
  file_path?: string;
  external_url?: string;
  sort_order: number;
  is_active?: boolean;
}

// Checklist interface
export interface Checklist {
  id: string;
  user_id: string;
  template_id?: string;
  country: string;
  visa: string;
  title: string;
  country_id?: string;
  visa_type_id?: string;
  template_version_used?: number;
  template_revision_date_used?: string;
  template_published_at_used?: string;
  consulate_id?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Checklist Item interface
export interface ChecklistItem {
  id: string;
  checklist_id: string;
  user_id: string;
  label: string;
  required: boolean;
  status: "todo" | "uploaded" | "verified";
  category?: string | null;
  notes?: string | null;
  sort_order?: number | null;
  client_key?: string | null;
  template_item_id?: string;
  uploads?: ChecklistUpload[];
}

// Checklist Upload interface
export interface ChecklistUpload {
  id: string;
  checklist_item_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  content_type?: string;
  size_bytes?: number;
  created_at?: string;
}

// Checklist Summary interface
export interface ChecklistSummary {
  id: string;
  template_id: string | null;
  title: string;
  destination_country: string;
  visa_type_name: string;
  version: string;
  revision_date: string | null;
  created_at: string | null;
  last_updated: string | null;
  progress: number;
  items: ChecklistItem[];
  source_org: string | null;
  source_url: string | null;
  country_id: string | null;
  visa_type_id: string | null;
}

// Comment interface
export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  type: "general" | "item";
  itemId?: string;
  user_id?: string;
  created_at?: string;
}

// Profile interface
export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  is_provider: boolean;
  passport_nationality_id?: string | null;
  residence_country_id?: string | null;
  residence_region?: string | null;
  residence_region_code?: string | null;
  residence_status?: string | null;
  created_at: string;
  updated_at: string;
}

// Consulate interface
export interface Consulate {
  id: string;
  name: string;
  type: "embassy" | "consulate" | "visa_application_center";
  country_id: string;
  host_country_id: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website_url?: string | null;
  appointment_url?: string | null;
  operating_hours?: string | null;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Consulate Jurisdiction interface
export interface ConsulateJurisdiction {
  id: string;
  consulate_id: string;
  residence_country_id: string;
  region_name?: string | null;
  region_code?: string | null;
  priority: number;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
}

// Consulate Note interface
export interface ConsulateNote {
  id: string;
  consulate_id: string;
  visa_type_id?: string | null;
  note_type:
    | "additional_document"
    | "special_instruction"
    | "appointment_info"
    | "fee_info"
    | "processing_note";
  title: string;
  content: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Provider interface
export interface Provider {
  id: string;
  user_id: string;
  business_name: string;
  contact_email: string;
  contact_phone?: string;
  bio?: string;
  website_url?: string;
  logo_url?: string;
  years_experience?: number;
  countries_served: string[];
  visa_types_served: string[];
  languages_spoken: string[];
  provider_types: string[];
  status: "pending" | "approved" | "rejected" | "suspended";
  created_at: string;
  updated_at: string;
}
