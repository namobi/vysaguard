# Technical Design: Consulate & Jurisdiction System

**Status**: Draft
**Author**: Engineering
**Last Updated**: 2026-02-07

---

## 1. Problem Statement

VysaGuard currently models visa applications as a function of (destination_country, visa_type). This is incomplete. In reality, **where** an applicant submits their application depends on:

- Their **passport nationality** (determines what visa requirements apply)
- Their **country of residence** (determines which consulates are available)
- Their **region/state within that country** (determines which specific consulate has jurisdiction)
- Their **residence status** (citizen, PR, work visa, student visa, etc.) which can affect supporting documents and consulate-specific instructions

The system currently has no way to answer: *"I'm a Nigerian passport holder living in Texas. Where do I apply for a UK visa, and are there any location-specific requirements?"*

This design introduces consulates as first-class entities and implements jurisdiction-based assignment.

---

## 2. Business Rules (Non-Negotiable)

These rules are product-owner decisions and are not open for engineering debate:

| # | Rule | Implication |
|---|------|-------------|
| 1 | Consulates are first-class entities | Must be explicitly modeled, not derived |
| 2 | No "closest by distance" logic | Jurisdiction is legal/regional, not geographic proximity |
| 3 | Visa requirements are by passport nationality | Template lookup uses nationality, not residence |
| 4 | Residence status is contextual | Affects consulate selection and supporting docs, not core requirements |
| 5 | Consulate assignment must be explainable | System must produce human-readable reasoning |
| 6 | User confirmation allowed in v1 | When ambiguous, suggest + let user pick |
| 7 | MVP scope applies | Lean and shippable. No over-engineering. No shortcuts that force re-architecture. |

---

## 3. Data Model

### 3.1 New Tables

#### `consulates`

Represents embassies, consulates, and visa application centers worldwide.

```prisma
model consulates {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name             String   // "British Embassy Washington DC"
  type             String   // "embassy" | "consulate" | "visa_application_center"
  country_id       String   @db.Uuid  // Destination country this consulate represents (e.g., UK)
  host_country_id  String   @db.Uuid  // Country where physically located (e.g., US)
  city             String   // "Washington DC"
  address          String?
  phone            String?
  email            String?
  website_url      String?
  appointment_url  String?  // Direct link for booking
  operating_hours  String?  // Free text: "Mon-Fri 9am-4pm"
  is_active        Boolean  @default(true)
  notes            String?  // Operational notes, closures, etc.
  created_at       DateTime @default(now()) @db.Timestamptz(6)
  updated_at       DateTime @default(now()) @db.Timestamptz(6)

  // Relationships
  destination_country  countries @relation("consulate_destination", fields: [country_id], references: [id])
  host_country         countries @relation("consulate_host", fields: [host_country_id], references: [id])
  jurisdictions        consulate_jurisdictions[]
  consulate_notes      consulate_notes[]
  checklists           checklists[]

  @@index([country_id, host_country_id])
  @@index([host_country_id])
  @@index([is_active])
  @@schema("public")
}
```

**Design notes:**
- `country_id` = the country whose visas this consulate processes (destination)
- `host_country_id` = the country where the consulate sits (residence country)
- `type` is a plain string rather than a Prisma enum to avoid migration friction when adding types
- VACs (VFS Global, TLScontact) are modeled the same way. A future `parent_consulate_id` self-reference can link VACs to their governing consulate if needed.

#### `consulate_jurisdictions`

Maps which residence regions fall under a consulate's jurisdiction. This is the core of the assignment logic.

```prisma
model consulate_jurisdictions {
  id                   String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  consulate_id         String   @db.Uuid
  residence_country_id String   @db.Uuid  // The country of residence
  region_name          String?  // State/province name. NULL = covers entire country.
  region_code          String?  // ISO 3166-2 subdivision code (e.g., "US-TX", "CA-ON")
  priority             Int      @default(0)  // Higher = preferred when multiple matches
  notes                String?  // "Covers northern districts only"
  is_active            Boolean  @default(true)
  created_at           DateTime @default(now()) @db.Timestamptz(6)

  consulates           consulates @relation(fields: [consulate_id], references: [id], onDelete: Cascade)
  residence_country    countries  @relation("jurisdiction_residence", fields: [residence_country_id], references: [id])

  @@unique([consulate_id, residence_country_id, region_name])
  @@index([residence_country_id, region_name])
  @@index([residence_country_id, region_code])
  @@schema("public")
}
```

**Design notes:**
- When `region_name` is `NULL`, the consulate covers the **entire country** (common for small countries with one embassy).
- When populated, it covers that specific state/province.
- `priority` resolves ties: if a user's region matches multiple consulates, the highest-priority match is suggested first.
- `region_code` uses ISO 3166-2 for programmatic lookup. `region_name` is the human-readable form. Both are stored because region_code coverage isn't universal across all countries.

**Example data:**

| consulate | residence_country | region_name | region_code | priority |
|-----------|-------------------|-------------|-------------|----------|
| British Embassy Washington DC | US | District of Columbia | US-DC | 10 |
| British Embassy Washington DC | US | Virginia | US-VA | 5 |
| British Embassy Washington DC | US | Maryland | US-MD | 5 |
| British Consulate New York | US | New York | US-NY | 10 |
| British Consulate New York | US | New Jersey | US-NJ | 5 |
| British Consulate New York | US | Connecticut | US-CT | 5 |
| VFS Global Lagos | NG | NULL | NULL | 10 |

#### `consulate_notes`

Consulate-specific guidance layered on top of base templates and playbooks. This avoids duplicating `requirement_templates` per consulate while still capturing location-specific differences.

```prisma
model consulate_notes {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  consulate_id   String   @db.Uuid
  visa_type_id   String?  @db.Uuid  // NULL = applies to all visa types at this consulate
  note_type      String   // "additional_document" | "special_instruction" | "appointment_info" | "fee_info" | "processing_note"
  title          String   // "Additional photo requirement"
  content        String   // Markdown-safe text
  sort_order     Int      @default(0)
  is_active      Boolean  @default(true)
  created_at     DateTime @default(now()) @db.Timestamptz(6)
  updated_at     DateTime @default(now()) @db.Timestamptz(6)

  consulates     consulates @relation(fields: [consulate_id], references: [id], onDelete: Cascade)
  visa_types     visa_types? @relation(fields: [visa_type_id], references: [id])

  @@index([consulate_id, visa_type_id])
  @@schema("public")
}
```

**Design notes:**
- `note_type` categorizes what kind of addendum this is, enabling structured rendering in the UI.
- `visa_type_id` is nullable: a note with `NULL` visa_type applies to **all** visa types at that consulate (e.g., "This consulate is closed on Nigerian public holidays").
- Content is plain text (Markdown-safe) to keep rendering simple.

**Example data:**

| consulate | visa_type | note_type | title | content |
|-----------|-----------|-----------|-------|---------|
| VFS Global Lagos | Tourist Visa | additional_document | VFS Service Fee | "VFS charges an additional service fee of $50..." |
| British Embassy DC | NULL | appointment_info | Booking | "Appointments must be booked via..." |
| US Embassy London | Work Visa | special_instruction | DS-160 Requirement | "Complete Form DS-160 online before your appointment..." |

### 3.2 Modified Tables

#### `profiles` (add columns)

```prisma
model profiles {
  // ... existing fields ...

  // NEW: Structured nationality and residence data
  passport_nationality_id  String?  @db.Uuid   // FK → countries
  residence_country_id     String?  @db.Uuid   // FK → countries
  residence_region         String?              // State/province (free text)
  residence_region_code    String?              // ISO 3166-2 code (e.g., "US-TX")
  residence_status         String?              // "citizen" | "permanent_resident" | "work_visa" | "student_visa" | "other"

  // NEW: Relationships
  passport_country         countries? @relation("profile_nationality", fields: [passport_nationality_id], references: [id])
  residence_country_rel    countries? @relation("profile_residence", fields: [residence_country_id], references: [id])
}
```

**Design notes:**
- All new fields are nullable for backwards compatibility. Existing users with `country_of_origin` (text) aren't broken.
- `passport_nationality_id` is the canonical field for determining visa requirements. The old `country_of_origin` text field is kept but deprecated.
- `residence_status` is a plain string. No enum, because real-world statuses vary by country and are too numerous to enumerate at this stage.

#### `checklists` (add column)

```prisma
model checklists {
  // ... existing fields ...

  // NEW: Consulate context
  consulate_id  String?  @db.Uuid  // Which consulate this application targets

  consulates    consulates? @relation(fields: [consulate_id], references: [id])
}
```

**Design notes:**
- Nullable. Existing checklists continue to work without a consulate.
- This is **contextual metadata**, not a template-selection criterion. The requirement template is still looked up by (country_id, visa_type_id).
- Once set, the consulate_id represents the user's declared application location. If they move, they create a new checklist (or update this one manually).

#### `countries` (expansion)

The existing `countries` table currently holds ~20-30 destination countries with theme data. It needs to also hold countries that appear as **nationalities** and **residence countries** (e.g., Nigeria, India, Philippines may be nationalities even if they aren't visa destinations on the platform).

```
-- No schema change needed. The table structure already supports this.
-- We just need to INSERT additional countries without theme data.
-- UI filters for "destinations" should filter on countries that have active templates/playbooks.
```

The theme fields (`theme_primary`, `hero_image_url`, etc.) are already nullable, so countries added purely as nationality/residence references will simply have null theme data.

### 3.3 Entity Relationship Diagram

```
                                ┌─────────────────┐
                                │    countries     │
                                │─────────────────│
                                │ id, name, slug   │
                                │ iso2, iso3       │
                                │ theme_* (nullable)│
                                └────────┬────────┘
                                         │
              ┌──────────────────────────┬┼─────────────────────────────┐
              │                          ││                             │
              │ passport_nationality_id  ││ residence_country_id        │
              ▼                          ▼│                             ▼
    ┌─────────────────┐     ┌────────────┴────────┐          ┌──────────────────┐
    │    profiles      │     │     consulates      │          │ consulate_        │
    │─────────────────│     │────────────────────│          │ jurisdictions     │
    │ user_id          │     │ id, name, type      │◄────────│──────────────────│
    │ passport_nat_id  │     │ country_id (dest)   │          │ consulate_id      │
    │ residence_co_id  │     │ host_country_id     │          │ residence_co_id   │
    │ residence_region │     │ city, website_url   │          │ region_name       │
    │ residence_status │     │ is_active           │          │ region_code       │
    └─────────────────┘     └─────────┬───────────┘          │ priority          │
                                      │                      └──────────────────┘
                                      │
                            ┌─────────┴───────────┐
                            │  consulate_notes     │
                            │─────────────────────│
                            │ consulate_id         │
                            │ visa_type_id (opt)   │
                            │ note_type, title     │
                            │ content              │
                            └─────────────────────┘

    ┌─────────────────┐          ┌─────────────────────┐
    │   checklists     │          │ requirement_templates │
    │─────────────────│          │─────────────────────│
    │ user_id          │          │ country_id           │
    │ country_id (dest)│          │ visa_type_id         │
    │ visa_type_id     │          │ version              │
    │ template_id ─────┼─────────►│ items[]              │
    │ consulate_id ────┼────┐     └─────────────────────┘
    └─────────────────┘    │
                           │     (consulate is contextual;
                           │      template is by nationality)
                           ▼
                    ┌──────────────┐
                    │  consulates   │
                    └──────────────┘
```

**Key relationship: Template lookup vs. Consulate assignment**

```
Template (what you need):    f(passport_nationality, destination_country, visa_type)
Consulate (where you apply): f(destination_country, residence_country, residence_region)
```

These are independent axes. The template does not vary by consulate. The consulate does not change the template.

---

## 4. Derivation Logic

### 4.1 Consulate Suggestion Algorithm

```
INPUT:
  - destination_country_id   (required)
  - residence_country_id     (required)
  - residence_region         (optional, string)
  - residence_region_code    (optional, string)
  - visa_type_id             (optional, for filtering consulate_notes)

STEP 1: Find all active consulates for this destination in this host country
  SELECT * FROM consulates
  WHERE country_id = destination_country_id
    AND host_country_id = residence_country_id
    AND is_active = true

  → If 0 results: return { suggested: null, alternatives: [], explanation: "..." }

STEP 2: Find jurisdiction matches
  FOR EACH consulate from Step 1:
    SELECT * FROM consulate_jurisdictions
    WHERE consulate_id = consulate.id
      AND residence_country_id = residence_country_id
      AND is_active = true
      AND (
        region_name IS NULL                              -- country-wide coverage
        OR LOWER(region_name) = LOWER(residence_region)  -- exact region match
        OR region_code = residence_region_code            -- code match
      )
    ORDER BY
      CASE WHEN region_name IS NOT NULL THEN 0 ELSE 1 END,  -- specific > country-wide
      priority DESC

STEP 3: Rank results
  - Exact region match (by name or code) → highest confidence
  - Country-wide match (region_name IS NULL) → lower confidence
  - No match → consulate exists but doesn't cover this region

STEP 4: Build response
  - If exactly 1 match with region-level specificity → "suggested" with high confidence
  - If multiple matches → first is "suggested", rest are "alternatives"
  - If only country-wide matches → suggest with note about confirming jurisdiction
  - If no matches → return consulates without jurisdiction data, explain gap

OUTPUT:
{
  suggested: {
    consulate: { id, name, type, city, ... },
    jurisdiction_match: "region" | "country_wide" | "none",
    explanation: "Based on your residence in Texas, USA, you likely apply through
                  the British Consulate in Houston, which covers TX, LA, OK, ..."
  } | null,
  alternatives: [...],
  explanation: "We found 3 consulates that may serve your region. The Houston
               consulate is the most likely match based on your state."
}
```

### 4.2 Where This Logic Lives

```
lib/
  consulate/
    suggestConsulate.ts    ← Pure function, testable, no side effects
    types.ts               ← ConsulateMatch, SuggestionResult types

app/api/
  consulates/
    suggest/route.ts       ← API endpoint wrapping the pure function
```

The suggestion logic is a **pure service-layer function** that takes structured input and returns structured output. It does not touch Supabase auth or make database writes. The API route handles auth, parameter validation, and calls the function.

This makes it:
- Unit-testable without database
- Reusable from server components if needed
- Easy to reason about

### 4.3 Explanation Generation

The system must produce human-readable explanations. These are constructed from templates:

```typescript
function buildExplanation(match: ConsulateMatch): string {
  if (match.jurisdiction_match === "region") {
    return `Based on your residence in ${match.region}, ${match.country},
            you likely apply through the ${match.consulate.name} in
            ${match.consulate.city}. This consulate covers
            ${match.covered_regions.join(", ")}.`;
  }
  if (match.jurisdiction_match === "country_wide") {
    return `The ${match.consulate.name} in ${match.consulate.city}
            serves applicants across ${match.country}. Please verify
            that your specific region falls under their jurisdiction.`;
  }
  return `We found the ${match.consulate.name} in your country of
          residence, but we don't have specific jurisdiction data for
          your region yet. Please verify directly with the consulate.`;
}
```

---

## 5. Checklist & Playbook Integration

### 5.1 Core Principle

> **Templates define WHAT is needed. Consulates define WHERE to apply. These don't intersect in the template layer.**

The `requirement_templates` table continues to be keyed on `(country_id, visa_type_id)`. No duplication per consulate. No consulate_id on templates.

### 5.2 How Consulate Context Influences Checklists

When a user creates or views a checklist that has a `consulate_id`:

1. **Base requirements** come from the `requirement_template` as today (unchanged).
2. **Consulate-specific notes** are fetched from `consulate_notes` and displayed alongside the checklist:
   - `note_type = "additional_document"` → shown as supplementary items (informational, not tracked as checklist_items)
   - `note_type = "special_instruction"` → shown as callout/banner within the checklist
   - `note_type = "appointment_info"` → shown in a sidebar or header section

```
┌──────────────────────────────────────────────────┐
│ Checklist: UK Tourist Visa                        │
│ Consulate: British Consulate Houston              │
├──────────────────────────────────────────────────┤
│ ℹ️ CONSULATE NOTE: Appointments must be booked    │
│    at least 2 weeks in advance via gov.uk/visa    │
├──────────────────────────────────────────────────┤
│ ☐ Valid passport (6+ months validity)             │
│ ☐ Passport-sized photographs                      │
│ ☐ Bank statements (last 3 months)                 │
│ ☐ Travel itinerary                                │
│ ☐ Hotel reservation                               │
│ ...                                               │
├──────────────────────────────────────────────────┤
│ 📌 HOUSTON CONSULATE: Additional requirement      │
│    Bring a printed copy of your DS-160             │
│    confirmation page to your appointment.          │
└──────────────────────────────────────────────────┘
```

### 5.3 How Consulate Context Influences Playbooks

Playbooks remain keyed on `(country_id, visa_type_id)`. When rendered:

1. **Base content** from `playbook_sections`, `playbook_meta`, `playbook_assets` (unchanged).
2. **Consulate addenda** from `consulate_notes` are rendered as supplementary sections at the end or inline where relevant:

```
┌──────────────────────────────────────────────────┐
│ Playbook: UK Tourist Visa                         │
├──────────────────────────────────────────────────┤
│ Processing Time: 2-4 weeks                        │
│ Typical Cost: $160                                │
│                                                   │
│ ## Eligibility                                    │
│ ...                                               │
│                                                   │
│ ## Application Steps                              │
│ ...                                               │
│                                                   │
│ ─────────────────────────────────────────────     │
│ ## Your Consulate: British Consulate Houston       │
│                                                   │
│ 📍 1301 Fannin St, Suite 1500, Houston TX         │
│ 🌐 gov.uk/visa                                   │
│ 📞 +1 (713) 555-0100                             │
│                                                   │
│ ### Location-Specific Notes                       │
│ - VFS service fee of $75 applies                  │
│ - Biometrics collected at appointment              │
│ - Walk-ins not accepted                           │
└──────────────────────────────────────────────────┘
```

### 5.4 Residence Status Influence

The business rules state residence status affects "supporting documents" and "playbook instructions." For v1, this is handled through **content** rather than **schema**:

- Playbook sections can include conditional guidance: *"If applying on a student visa (F1/J1), you may need to provide your I-20/DS-2019 and proof of enrollment."*
- `consulate_notes` can include status-specific notes: *"Green Card holders in this jurisdiction apply at the main embassy, not the satellite office."*

A future v2 could add `residence_status` as a filter on `consulate_notes` to surface status-specific notes programmatically. The schema supports this without re-architecture: just add a nullable `residence_status_filter` column to `consulate_notes`.

---

## 6. API Touchpoints

### 6.1 New Endpoints

#### `GET /api/consulates/suggest`

Suggests a consulate based on user context.

```
Query Parameters:
  destination_country_id: string (required)
  residence_country_id:   string (required)
  residence_region:       string (optional)
  residence_region_code:  string (optional)
  visa_type_id:           string (optional)

Response 200:
{
  suggested: {
    consulate: Consulate,
    match_type: "region" | "country_wide" | "unverified",
    explanation: string
  } | null,
  alternatives: Array<{
    consulate: Consulate,
    match_type: "region" | "country_wide" | "unverified",
    explanation: string
  }>,
  disclaimer: "Consulate jurisdiction is provided as guidance only.
               Please verify with the consulate directly."
}

Response 404 (no consulates found):
{
  suggested: null,
  alternatives: [],
  explanation: "We don't have consulate data for UK visas in Nigeria yet."
}
```

#### `GET /api/consulates/[id]`

Returns full consulate details including notes for a visa type.

```
Query Parameters:
  visa_type_id: string (optional)

Response 200:
{
  consulate: Consulate,
  notes: ConsulateNote[],           // filtered by visa_type_id if provided
  jurisdictions: Jurisdiction[]     // regions this consulate covers
}
```

#### `GET /api/consulates/list`

Lists consulates, filterable.

```
Query Parameters:
  country_id:      string (optional) - filter by destination country
  host_country_id: string (optional) - filter by host country
  type:            string (optional) - "embassy" | "consulate" | "visa_application_center"

Response 200:
{
  consulates: Consulate[]
}
```

### 6.2 Modified Endpoints

#### `POST /api/checklist/sync` (modified)

Add optional `consulate_id` parameter. When provided, the sync response includes consulate-specific notes alongside the checklist data.

```
Request Body (additions):
{
  ...,
  consulate_id: string?   // NEW: optional
}

Response (additions):
{
  ...,
  consulate: Consulate?,          // NEW
  consulate_notes: ConsulateNote[] // NEW
}
```

#### `GET /api/providers/list` (no change needed)

Providers are already filtered by country and visa type. Consulate context doesn't change provider listings - a provider serving "UK Tourist Visas from the US" covers all US consulates.

### 6.3 Profile Update

No new endpoint needed. The existing profile update mechanism (Supabase client-side update to `profiles` table) just needs the UI to include the new fields. RLS already restricts writes to the owning user.

---

## 7. Checklist Creation Flow (Updated)

Updated flow with **hard-gate** on profile completion and **mandatory nationality confirmation**:

```
User arrives at /checklist?country=uk&visa=tourist
  │
  ├─ 1. GATE: Profile completeness check
  │     Check: passport_nationality_id AND residence_country_id set?
  │     ├─ NO → Redirect to profile completion page. BLOCKED.
  │     └─ YES → Continue
  │
  ├─ 2. GATE: Nationality confirmation (EVERY checklist creation)
  │     Display: "You are applying with a [Nigerian] passport. Is this correct?"
  │     ├─ YES → Continue
  │     └─ NO  → Redirect to profile to update nationality, then return here
  │
  ├─ 3. Resolve country slug → country_id, visa slug → visa_type_id
  │
  ├─ 4. Call suggestConsulate(destination, residence_country, residence_region)
  │     └─ Display suggestion, let user confirm or pick alternative
  │
  ├─ 5. Look up requirement_template (by country_id + visa_type_id)
  │     ├─ Template lookup is UNCHANGED - still by destination, not consulate
  │     └─ Passport nationality is used for template selection if
  │        different templates exist per nationality (future consideration)
  │
  ├─ 6. UPSERT checklist with (user_id, country, visa, consulate_id)
  │
  ├─ 7. Seed checklist_items from template (unchanged)
  │
  └─ 8. Fetch consulate_notes for display
        └─ Render alongside checklist items as supplementary information
```

**Why confirm nationality every time?** A user may acquire a new passport (naturalization, dual citizenship) without updating their profile. Since passport nationality determines visa requirements, stale data here silently produces wrong results. The confirmation is a single yes/no — low friction, high safety.

---

## 8. Type Definitions

### New types to add to `types/database.ts`:

```typescript
export interface Consulate {
  id: string;
  name: string;
  type: "embassy" | "consulate" | "visa_application_center";
  country_id: string;       // destination country
  host_country_id: string;  // where it's located
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

export interface ConsulateNote {
  id: string;
  consulate_id: string;
  visa_type_id?: string | null;
  note_type: "additional_document" | "special_instruction" | "appointment_info" | "fee_info" | "processing_note";
  title: string;
  content: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### New types to add to `types/api.ts`:

```typescript
export type ConsulateMatchType = "region" | "country_wide" | "unverified";

export interface ConsulateSuggestion {
  consulate: Consulate;
  match_type: ConsulateMatchType;
  explanation: string;
}

export interface ConsulateSuggestionResponse {
  suggested: ConsulateSuggestion | null;
  alternatives: ConsulateSuggestion[];
  disclaimer: string;
}

export type ResidenceStatus =
  | "citizen"
  | "permanent_resident"
  | "work_visa"
  | "student_visa"
  | "dependent_visa"
  | "refugee"
  | "other";
```

### Updated constants in `lib/constants.ts`:

```typescript
export const CONSULATE_TYPES = {
  EMBASSY: "embassy",
  CONSULATE: "consulate",
  VISA_APPLICATION_CENTER: "visa_application_center",
} as const;

export const CONSULATE_NOTE_TYPES = {
  ADDITIONAL_DOCUMENT: "additional_document",
  SPECIAL_INSTRUCTION: "special_instruction",
  APPOINTMENT_INFO: "appointment_info",
  FEE_INFO: "fee_info",
  PROCESSING_NOTE: "processing_note",
} as const;

export const RESIDENCE_STATUSES = {
  CITIZEN: "citizen",
  PERMANENT_RESIDENT: "permanent_resident",
  WORK_VISA: "work_visa",
  STUDENT_VISA: "student_visa",
  DEPENDENT_VISA: "dependent_visa",
  REFUGEE: "refugee",
  OTHER: "other",
} as const;
```

---

## 9. RLS Policies

```sql
-- consulates: readable by all authenticated users (public reference data)
CREATE POLICY "Consulates are publicly readable"
  ON consulates FOR SELECT
  TO authenticated
  USING (true);

-- consulate_jurisdictions: readable by all authenticated users
CREATE POLICY "Jurisdictions are publicly readable"
  ON consulate_jurisdictions FOR SELECT
  TO authenticated
  USING (true);

-- consulate_notes: readable by all authenticated users
CREATE POLICY "Consulate notes are publicly readable"
  ON consulate_notes FOR SELECT
  TO authenticated
  USING (true);

-- profiles (existing table, new columns follow existing RLS)
-- The existing policy already restricts to auth.uid() = user_id
-- New columns inherit the same policy. No changes needed.

-- checklists (existing table, new column follows existing RLS)
-- The existing policy already restricts to auth.uid() = user_id
-- consulate_id is just another column. No changes needed.

-- All three new tables: admin-only write access
-- INSERT/UPDATE/DELETE restricted to service_role key (admin operations)
CREATE POLICY "Only admins can modify consulates"
  ON consulates FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Only admins can modify jurisdictions"
  ON consulate_jurisdictions FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Only admins can modify consulate notes"
  ON consulate_notes FOR ALL
  TO service_role
  USING (true);
```

---

## 10. Edge Cases & Safeguards

### 10.1 Dual Nationality

**v1**: Single `passport_nationality_id` on profiles. UI label: "Primary passport nationality."

**Future**: Add a `user_passports` junction table:
```
user_passports { user_id, country_id, is_primary, passport_number?, expiry_date? }
```
The suggestion API would then accept `passport_nationality_id` as an explicit parameter rather than reading from profile, allowing per-application nationality selection. The current schema doesn't block this evolution.

### 10.2 Missing Region

If user has `residence_country_id` but no `residence_region`:
- Query jurisdictions with `region_name IS NULL` (country-wide consulates)
- If multiple consulates exist for that country, return all as alternatives
- Explanation: *"We need your state/province to determine the specific consulate. Here are all consulates in {country} that handle {destination} visas."*
- UI prompts user to add region to their profile

### 10.3 Consulate Closures / Inactive Status

- `is_active = false` excludes from suggestion results
- `notes` field can explain: *"Temporarily closed due to renovation. Applications redirected to {other_consulate}."*
- The closure doesn't delete data - historical checklists still reference the consulate

### 10.4 No Consulate Data

When there are no consulates in the database for a given (destination, residence_country) pair:
- Checklist creation proceeds without consulate context (as today)
- A non-blocking info banner: *"We don't have consulate information for {destination} visas from {residence_country} yet. Your checklist requirements are still accurate."*
- No hard failure. The system degrades gracefully.

### 10.5 User Relocates

If a user changes their `residence_country_id` or `residence_region`:
- **Existing checklists** retain their recorded `consulate_id`. The application was started at that consulate.
- **New checklists** use the updated profile data for fresh suggestions.
- If the user wants to change consulate on an existing checklist, they can do so explicitly through the UI.

### 10.6 Countries Not in Database

When a user's nationality or residence country isn't in the `countries` table:
- Profile save fails with a validation error
- Admin must add the country first (insert into `countries` with just name, iso2, iso3 - no theme data needed)
- In practice, the MVP should seed all ~195 UN-recognized countries into the table at migration time, with theme data only for destination countries

### 10.7 VFS / Third-Party Centers

VFS Global, TLScontact, and similar centers are modeled as `type = "visa_application_center"`. They follow the same jurisdiction rules. If the platform later needs to distinguish "where you submit" from "who decides," a `parent_consulate_id` self-reference can be added without schema redesign.

---

## 11. Migration Strategy

### Phase 1: Schema Migration (Non-Breaking)

All changes are additive. Nothing breaks existing functionality.

```
1. Add countries for all nationalities/residence countries (~195 rows)
   - Only populate: id, name, slug, iso2, iso3, created_at
   - Leave theme_* and hero_image_* NULL for non-destination countries

2. Create new tables:
   - consulates
   - consulate_jurisdictions
   - consulate_notes

3. Add nullable columns to existing tables:
   - profiles: passport_nationality_id, residence_country_id,
               residence_region, residence_region_code, residence_status
   - checklists: consulate_id

4. Apply RLS policies on new tables

5. Run prisma db pull + prisma generate to update Prisma client
```

### Phase 2: Data Seeding

```
1. Seed consulate data for 2-3 priority destination countries
   (e.g., UK, US, Canada - wherever VysaGuard has the most users)

2. Seed jurisdiction mappings for 2-3 priority residence countries
   (e.g., US states, Nigerian regions, Indian states)

3. Add consulate_notes for known special requirements

4. This is manual/admin work. Consider building a lightweight admin
   UI or using Supabase Studio for initial data entry.
```

### Phase 3: Profile Enhancement

```
1. Add residence/nationality fields to profile settings UI
2. Backfill: For existing users with country_of_origin text,
   attempt to match against countries table and set passport_nationality_id
3. Display prompt for users to complete their profile
```

### Phase 4: Consulate Integration

```
1. Build /api/consulates/suggest endpoint
2. Integrate suggestion into checklist creation flow
3. Display consulate_notes alongside checklists and playbooks
4. Add consulate info to provider-facing views where relevant
```

### Rollback Safety

- All new columns are nullable → removing them doesn't break queries
- New tables are independent → can be dropped without affecting existing tables
- Feature can be hidden behind a feature flag (check if consulate_id is populated → show consulate UI; otherwise → show current UI)
- No existing API contracts are changed, only extended

---

## 12. Files to Create / Modify

### New Files

| File | Purpose |
|------|---------|
| `prisma/migrations/xxx_add_consulates.sql` | Schema migration |
| `lib/consulate/suggestConsulate.ts` | Suggestion algorithm |
| `lib/consulate/types.ts` | Consulate-specific type helpers |
| `app/api/consulates/suggest/route.ts` | Suggestion API endpoint |
| `app/api/consulates/[id]/route.ts` | Consulate detail endpoint |
| `app/api/consulates/list/route.ts` | Consulate list endpoint |
| `scripts/seed-countries.ts` | Seed all countries |
| `scripts/seed-consulates.ts` | Seed initial consulate data |

### Modified Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add 3 new models, modify profiles + checklists |
| `types/database.ts` | Add Consulate, ConsulateJurisdiction, ConsulateNote interfaces |
| `types/api.ts` | Add ConsulateSuggestionResponse, ResidenceStatus types |
| `lib/constants.ts` | Add CONSULATE_TYPES, CONSULATE_NOTE_TYPES, RESIDENCE_STATUSES |
| `app/checklist/ChecklistClient.tsx` | Integrate consulate suggestion into flow |
| `app/playbook/[country]/[visa]/page.tsx` | Display consulate-specific notes |
| `components/features/ApplicantDashboard.tsx` | Show consulate info on checklist cards |

---

## 13. What This Design Does NOT Do

To keep MVP scope:

| Exclusion | Rationale |
|-----------|-----------|
| No admin UI for consulate data entry | Use Supabase Studio or scripts for v1 |
| No automated consulate data scraping | Manual curation ensures accuracy |
| No per-consulate requirement templates | Business rule: templates are by nationality, not consulate |
| No multi-passport support | Deferred to v2 per business decision |
| No consulate-specific appointment booking | Just link to external booking URL |
| No processing time per consulate | Use base `playbook_meta` + `consulate_notes` for now |
| No residence status filtering on notes | Content-based guidance in v1; structured filtering in v2 |
| No distance/map features | Explicitly excluded by business rules |

---

## 14. Product Owner Decisions (Resolved)

| # | Question | Decision |
|---|----------|----------|
| 1 | **Priority countries** | **UK, US, Canada** - seed consulate data for these three first |
| 2 | **Residence status values** | **Approved as-is**: `citizen`, `permanent_resident`, `work_visa`, `student_visa`, `dependent_visa`, `refugee`, `other` |
| 3 | **Disclaimer language** | **Approved as-is**: *"Consulate jurisdiction information is provided as guidance only and may change. Please verify directly with the relevant consulate or embassy before submitting your application."* |
| 4 | **Profile completion flow** | **Hard block**: Checklist creation is blocked until nationality + residence are set. **AND** nationality must be re-confirmed at every checklist creation — user sees "You are applying with a [X] passport. Is this correct?" even if already on profile, to guard against stale data. |

### Implication of Decision #4 on Checklist Flow

The checklist creation flow (Section 7) must enforce:

```
User arrives at /checklist?country=uk&visa=tourist
  │
  ├─ 1. Check profile: passport_nationality_id AND residence_country_id set?
  │     └─ NO → Redirect to profile completion. Cannot proceed.
  │
  ├─ 2. Nationality confirmation gate (EVERY time, even if set):
  │     "You are applying with a [Nigerian] passport. Is this correct?"
  │     ├─ YES → Continue
  │     └─ NO  → Redirect to profile to update nationality, then return
  │
  ├─ 3. Resolve country/visa slugs → IDs
  │
  ├─ 4. Call suggestConsulate(destination, residence, region)
  │     └─ Display suggestion, let user confirm or pick alternative
  │
  ├─ 5. Look up requirement_template (by country_id + visa_type_id)
  │
  ├─ 6. UPSERT checklist with (user_id, country, visa, consulate_id)
  │
  ├─ 7. Seed checklist_items from template
  │
  └─ 8. Fetch consulate_notes for display
```

This confirmation step is lightweight (single yes/no) but prevents the scenario where a user changed nationality (e.g., acquired new citizenship) without updating their profile, and silently gets wrong consulate suggestions or template lookups.
