-- Seed migration for visa data
-- This populates the database with sample countries, visa types, and requirements

-- Insert countries
INSERT INTO public.countries (id, name, slug, iso2, iso3, theme_flag_emoji, theme_primary, theme_secondary, theme_bg)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Portugal', 'portugal', 'PT', 'PRT', '🇵🇹', '#006600', '#FF0000', '#FFFFFF'),
  ('22222222-2222-2222-2222-222222222222', 'United Kingdom', 'united-kingdom', 'GB', 'GBR', '🇬🇧', '#012169', '#C8102E', '#FFFFFF'),
  ('33333333-3333-3333-3333-333333333333', 'Canada', 'canada', 'CA', 'CAN', '🇨🇦', '#FF0000', '#FFFFFF', '#FF0000'),
  ('44444444-4444-4444-4444-444444444444', 'Germany', 'germany', 'DE', 'DEU', '🇩🇪', '#000000', '#DD0000', '#FFCE00'),
  ('55555555-5555-5555-5555-555555555555', 'Australia', 'australia', 'AU', 'AUS', '🇦🇺', '#00008B', '#FFFFFF', '#FF0000')
ON CONFLICT (id) DO NOTHING;

-- Insert visa types
INSERT INTO public.visa_types (id, name, slug, description)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Digital Nomad Visa', 'digital-nomad', 'For remote workers who want to live and work in a foreign country while employed by a company outside that country'),
  ('aaaa2222-2222-2222-2222-222222222222', 'Standard Visitor Visa', 'standard-visitor', 'For short-term visits for tourism, business meetings, or visiting family'),
  ('aaaa3333-3333-3333-3333-333333333333', 'Student Visa', 'student', 'For international students pursuing education at accredited institutions'),
  ('aaaa4444-4444-4444-4444-444444444444', 'Work Permit', 'work-permit', 'For individuals who have a job offer from an employer in the destination country'),
  ('aaaa5555-5555-5555-5555-555555555555', 'Skilled Worker Visa', 'skilled-worker', 'For qualified professionals with skills in demand by the destination country'),
  ('aaaa6666-6666-6666-6666-666666666666', 'Express Entry', 'express-entry', 'Points-based immigration system for skilled workers')
ON CONFLICT (id) DO NOTHING;

-- Link countries to visa types (country_visa_types)
INSERT INTO public.country_visa_types (id, country_id, visa_type_id, is_active)
VALUES
  -- Portugal
  ('cc111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', true),
  ('cc111111-1111-1111-1111-222222222222', '11111111-1111-1111-1111-111111111111', 'aaaa2222-2222-2222-2222-222222222222', true),
  ('cc111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaa3333-3333-3333-3333-333333333333', true),
  -- United Kingdom
  ('cc222222-2222-2222-2222-111111111111', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', true),
  ('cc222222-2222-2222-2222-555555555555', '22222222-2222-2222-2222-222222222222', 'aaaa5555-5555-5555-5555-555555555555', true),
  ('cc222222-2222-2222-2222-333333333333', '22222222-2222-2222-2222-222222222222', 'aaaa3333-3333-3333-3333-333333333333', true),
  -- Canada
  ('cc333333-3333-3333-3333-666666666666', '33333333-3333-3333-3333-333333333333', 'aaaa6666-6666-6666-6666-666666666666', true),
  ('cc333333-3333-3333-3333-222222222222', '33333333-3333-3333-3333-333333333333', 'aaaa2222-2222-2222-2222-222222222222', true),
  ('cc333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', true),
  -- Germany
  ('cc444444-4444-4444-4444-111111111111', '44444444-4444-4444-4444-444444444444', 'aaaa1111-1111-1111-1111-111111111111', true),
  ('cc444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'aaaa4444-4444-4444-4444-444444444444', true),
  ('cc444444-4444-4444-4444-333333333333', '44444444-4444-4444-4444-444444444444', 'aaaa3333-3333-3333-3333-333333333333', true),
  -- Australia
  ('cc555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'aaaa5555-5555-5555-5555-555555555555', true),
  ('cc555555-5555-5555-5555-222222222222', '55555555-5555-5555-5555-555555555555', 'aaaa2222-2222-2222-2222-222222222222', true),
  ('cc555555-5555-5555-5555-333333333333', '55555555-5555-5555-5555-555555555555', 'aaaa3333-3333-3333-3333-333333333333', true)
ON CONFLICT (id) DO NOTHING;

-- Insert visa routes (origin_country -> destination_country -> visa_type)
-- This enables the 3-step cascading flow: Origin -> Destination -> Visa Type
INSERT INTO public.visa_routes (id, origin_country_id, destination_country_id, visa_type_id, is_active)
VALUES
  -- Canada -> Portugal
  ('vr111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', true),
  ('vr111111-1111-1111-1111-222222222222', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaa2222-2222-2222-2222-222222222222', true),
  -- Canada -> UK
  ('vr111111-2222-2222-2222-111111111111', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', true),
  ('vr111111-2222-2222-2222-555555555555', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'aaaa5555-5555-5555-5555-555555555555', true),
  -- UK -> Portugal
  ('vr222222-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', true),
  ('vr222222-1111-1111-1111-222222222222', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'aaaa2222-2222-2222-2222-222222222222', true),
  -- UK -> Canada
  ('vr222222-3333-3333-3333-666666666666', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'aaaa6666-6666-6666-6666-666666666666', true),
  ('vr222222-3333-3333-3333-222222222222', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'aaaa2222-2222-2222-2222-222222222222', true),
  -- Germany -> Portugal
  ('vr444444-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', true),
  ('vr444444-1111-1111-1111-222222222222', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'aaaa2222-2222-2222-2222-222222222222', true),
  -- Germany -> UK
  ('vr444444-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', true),
  ('vr444444-2222-2222-2222-555555555555', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'aaaa5555-5555-5555-5555-555555555555', true),
  -- Australia -> UK
  ('vr555555-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', true),
  ('vr555555-2222-2222-2222-555555555555', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'aaaa5555-5555-5555-5555-555555555555', true),
  -- Australia -> Canada
  ('vr555555-3333-3333-3333-666666666666', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'aaaa6666-6666-6666-6666-666666666666', true),
  ('vr555555-3333-3333-3333-222222222222', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'aaaa2222-2222-2222-2222-222222222222', true),
  -- Portugal -> UK (for Portuguese citizens)
  ('vr111111-2222-pt-2222-222222222222', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', true),
  ('vr111111-2222-pt-2222-555555555555', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'aaaa5555-5555-5555-5555-555555555555', true),
  -- Portugal -> Canada
  ('vr111111-3333-pt-3333-666666666666', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'aaaa6666-6666-6666-6666-666666666666', true),
  ('vr111111-3333-pt-3333-222222222222', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'aaaa2222-2222-2222-2222-222222222222', true)
ON CONFLICT (origin_country_id, destination_country_id, visa_type_id) DO NOTHING;

-- Insert requirement templates
-- Portugal Digital Nomad Visa
INSERT INTO public.requirement_templates (id, country_id, visa_type_id, title, version, is_active, summary, source_url, source_org, revision_date, published_at, status)
VALUES
  ('tt111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'aaaa1111-1111-1111-1111-111111111111',
   'Portugal Digital Nomad Visa Requirements',
   1,
   true,
   'The Portugal D7 Digital Nomad Visa allows remote workers to live in Portugal while working for companies outside the country. Valid for 1 year with renewable options.',
   'https://www.sef.pt/',
   'Portuguese Immigration and Borders Service (SEF)',
   '2024-01-15',
   '2024-01-20 00:00:00+00',
   'published')
ON CONFLICT (country_id, visa_type_id) DO NOTHING;

-- UK Standard Visitor Visa
INSERT INTO public.requirement_templates (id, country_id, visa_type_id, title, version, is_active, summary, source_url, source_org, revision_date, published_at, status)
VALUES
  ('tt222222-2222-2222-2222-222222222222',
   '22222222-2222-2222-2222-222222222222',
   'aaaa2222-2222-2222-2222-222222222222',
   'UK Standard Visitor Visa Requirements',
   1,
   true,
   'The Standard Visitor visa lets you visit the UK for tourism, visiting family or friends, business activities, or other permitted activities for up to 6 months.',
   'https://www.gov.uk/standard-visitor',
   'UK Visas and Immigration (UKVI)',
   '2024-02-01',
   '2024-02-05 00:00:00+00',
   'published')
ON CONFLICT (country_id, visa_type_id) DO NOTHING;

-- Canada Express Entry
INSERT INTO public.requirement_templates (id, country_id, visa_type_id, title, version, is_active, summary, source_url, source_org, revision_date, published_at, status)
VALUES
  ('tt333333-3333-3333-3333-333333333333',
   '33333333-3333-3333-3333-333333333333',
   'aaaa6666-6666-6666-6666-666666666666',
   'Canada Express Entry Requirements',
   1,
   true,
   'Express Entry is Canada''s system for managing applications for permanent residence from skilled workers. Candidates are ranked using the Comprehensive Ranking System (CRS).',
   'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html',
   'Immigration, Refugees and Citizenship Canada (IRCC)',
   '2024-01-10',
   '2024-01-15 00:00:00+00',
   'published')
ON CONFLICT (country_id, visa_type_id) DO NOTHING;

-- Insert requirement template items for Portugal Digital Nomad Visa
INSERT INTO public.requirement_template_items (id, template_id, label, required, sort_order, notes_hint, client_key, category)
VALUES
  ('ii111111-0001-0001-0001-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Valid passport', true, 1, 'Must be valid for at least 6 months beyond your intended stay', 'passport', 'Identity Documents'),
  ('ii111111-0002-0002-0002-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Passport-sized photos', true, 2, 'Two recent photos meeting ICAO standards (35x45mm)', 'photos', 'Identity Documents'),
  ('ii111111-0003-0003-0003-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Proof of income', true, 3, 'Bank statements or employment contract showing minimum €3,040/month', 'income_proof', 'Financial Documents'),
  ('ii111111-0004-0004-0004-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Employment contract or client contracts', true, 4, 'Proof of remote work arrangement with employer/clients outside Portugal', 'employment', 'Employment Documents'),
  ('ii111111-0005-0005-0005-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Health insurance', true, 5, 'Valid health insurance coverage for Portugal with minimum €30,000 coverage', 'health_insurance', 'Insurance'),
  ('ii111111-0006-0006-0006-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Criminal record certificate', true, 6, 'From your country of residence, translated and apostilled', 'criminal_record', 'Legal Documents'),
  ('ii111111-0007-0007-0007-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Proof of accommodation', true, 7, 'Rental agreement, hotel booking, or property ownership proof in Portugal', 'accommodation', 'Housing Documents'),
  ('ii111111-0008-0008-0008-111111111111', 'tt111111-1111-1111-1111-111111111111', 'NIF (Portuguese Tax Number)', true, 8, 'Can be obtained before arrival through a fiscal representative', 'nif', 'Tax Documents'),
  ('ii111111-0009-0009-0009-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Visa application form', true, 9, 'Completed and signed official application form', 'application_form', 'Application'),
  ('ii111111-0010-0010-0010-111111111111', 'tt111111-1111-1111-1111-111111111111', 'CV/Resume', false, 10, 'Professional resume showing your work experience', 'cv', 'Supporting Documents'),
  ('ii111111-0011-0011-0011-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Cover letter', false, 11, 'Explaining your reasons for choosing Portugal and your remote work situation', 'cover_letter', 'Supporting Documents'),
  ('ii111111-0012-0012-0012-111111111111', 'tt111111-1111-1111-1111-111111111111', 'Flight itinerary', false, 12, 'Travel plans showing entry into Portugal', 'flight', 'Travel Documents')
ON CONFLICT (template_id, client_key) DO NOTHING;

-- Insert requirement template items for UK Standard Visitor Visa
INSERT INTO public.requirement_template_items (id, template_id, label, required, sort_order, notes_hint, client_key, category)
VALUES
  ('ii222222-0001-0001-0001-222222222222', 'tt222222-2222-2222-2222-222222222222', 'Valid passport', true, 1, 'With at least one blank page and valid for the duration of your stay', 'passport', 'Identity Documents'),
  ('ii222222-0002-0002-0002-222222222222', 'tt222222-2222-2222-2222-222222222222', 'Passport-sized photos', true, 2, 'Recent photos meeting UK specifications (45mm x 35mm)', 'photos', 'Identity Documents'),
  ('ii222222-0003-0003-0003-222222222222', 'tt222222-2222-2222-2222-222222222222', 'Bank statements', true, 3, 'Last 6 months showing sufficient funds for your trip', 'bank_statements', 'Financial Documents'),
  ('ii222222-0004-0004-0004-222222222222', 'tt222222-2222-2222-2222-222222222222', 'Employment letter', true, 4, 'Confirming your job, salary, and approved leave dates', 'employment_letter', 'Employment Documents'),
  ('ii222222-0005-0005-0005-222222222222', 'tt222222-2222-2222-2222-222222222222', 'Travel itinerary', true, 5, 'Including accommodation bookings and return flight', 'itinerary', 'Travel Documents'),
  ('ii222222-0006-0006-0006-222222222222', 'tt222222-2222-2222-2222-222222222222', 'Proof of ties to home country', true, 6, 'Property ownership, family ties, ongoing employment, etc.', 'home_ties', 'Supporting Documents'),
  ('ii222222-0007-0007-0007-222222222222', 'tt222222-2222-2222-2222-222222222222', 'Invitation letter', false, 7, 'If visiting family or friends, include their details and UK status', 'invitation', 'Supporting Documents'),
  ('ii222222-0008-0008-0008-222222222222', 'tt222222-2222-2222-2222-222222222222', 'Travel insurance', false, 8, 'Recommended but not mandatory', 'travel_insurance', 'Insurance'),
  ('ii222222-0009-0009-0009-222222222222', 'tt222222-2222-2222-2222-222222222222', 'Previous travel history', false, 9, 'Copies of visas and stamps from previous international travel', 'travel_history', 'Supporting Documents')
ON CONFLICT (template_id, client_key) DO NOTHING;

-- Insert requirement template items for Canada Express Entry
INSERT INTO public.requirement_template_items (id, template_id, label, required, sort_order, notes_hint, client_key, category)
VALUES
  ('ii333333-0001-0001-0001-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Valid passport', true, 1, 'Must be valid for at least 6 months', 'passport', 'Identity Documents'),
  ('ii333333-0002-0002-0002-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Language test results', true, 2, 'IELTS General Training or CELPIP for English, TEF or TCF for French', 'language_test', 'Language Requirements'),
  ('ii333333-0003-0003-0003-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Educational Credential Assessment (ECA)', true, 3, 'From a designated organization (WES, IQAS, etc.)', 'eca', 'Education Documents'),
  ('ii333333-0004-0004-0004-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Proof of work experience', true, 4, 'Reference letters from employers detailing duties, dates, and hours', 'work_experience', 'Employment Documents'),
  ('ii333333-0005-0005-0005-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Proof of funds', true, 5, 'Bank statements or investment proof showing settlement funds', 'proof_of_funds', 'Financial Documents'),
  ('ii333333-0006-0006-0006-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Police clearance certificates', true, 6, 'From all countries where you lived 6+ months since age 18', 'police_clearance', 'Legal Documents'),
  ('ii333333-0007-0007-0007-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Medical examination', true, 7, 'From a panel physician after ITA (Invitation to Apply)', 'medical_exam', 'Medical Documents'),
  ('ii333333-0008-0008-0008-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Provincial Nomination', false, 8, 'If applying through Provincial Nominee Program (adds 600 CRS points)', 'pnp', 'Provincial Nomination'),
  ('ii333333-0009-0009-0009-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Job offer from Canadian employer', false, 9, 'LMIA-supported job offer adds significant CRS points', 'job_offer', 'Employment Documents'),
  ('ii333333-0010-0010-0010-333333333333', 'tt333333-3333-3333-3333-333333333333', 'Canadian education credentials', false, 10, 'If you studied in Canada', 'canadian_education', 'Education Documents')
ON CONFLICT (template_id, client_key) DO NOTHING;

-- Insert playbook meta
INSERT INTO public.playbook_meta (id, country_id, visa_type_id, processing_time_text, typical_cost_text, refusal_reasons)
VALUES
  ('mm111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'aaaa1111-1111-1111-1111-111111111111',
   '2-4 months',
   '€90 visa fee + €83 SEF appointment',
   '["Insufficient proof of income (below €3,040/month)", "Incomplete documentation", "Invalid or missing health insurance", "No clear proof of remote employment", "Criminal record issues"]'),
  ('mm222222-2222-2222-2222-222222222222',
   '22222222-2222-2222-2222-222222222222',
   'aaaa2222-2222-2222-2222-222222222222',
   '3-8 weeks',
   '£115 for standard, £260 for priority',
   '["Insufficient funds to cover trip expenses", "Lack of strong ties to home country", "Incomplete or inconsistent information", "Previous immigration violations", "Failure to demonstrate genuine intent to visit"]'),
  ('mm333333-3333-3333-3333-333333333333',
   '33333333-3333-3333-3333-333333333333',
   'aaaa6666-6666-6666-6666-666666666666',
   '6-12 months',
   'CAD $1,365 processing fee + $500 right of PR fee',
   '["CRS score below draw cutoff", "Insufficient language test scores", "Unverified work experience", "Missing police clearances", "Failed medical examination", "Misrepresentation in application"]')
ON CONFLICT (country_id, visa_type_id) DO NOTHING;

-- Insert playbook sections for Portugal Digital Nomad Visa
INSERT INTO public.playbook_sections (id, country_id, visa_type_id, section_key, title, content_json, sort_order, is_active)
VALUES
  ('ss111111-0001-0001-0001-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'aaaa1111-1111-1111-1111-111111111111',
   'overview',
   'Overview',
   '{"paragraphs": ["The Portugal D7 Visa, also known as the Digital Nomad or Passive Income Visa, is ideal for remote workers, freelancers, and those with passive income who want to live in Portugal.", "This visa allows you to stay in Portugal for more than 90 days and can be renewed annually. After 5 years, you may apply for permanent residency or citizenship."]}',
   1, true),
  ('ss111111-0002-0002-0002-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'aaaa1111-1111-1111-1111-111111111111',
   'eligibility',
   'Eligibility Requirements',
   '{"bullets": ["Non-EU/EEA/Swiss citizen", "Proof of regular remote income of at least €3,040/month (4x Portuguese minimum wage)", "Valid employment or client contracts with entities outside Portugal", "Clean criminal record", "Valid health insurance covering Portugal"]}',
   2, true),
  ('ss111111-0003-0003-0003-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'aaaa1111-1111-1111-1111-111111111111',
   'process',
   'Application Process',
   '{"paragraphs": ["The application process involves several steps:"], "bullets": ["1. Obtain a Portuguese NIF (tax number) through a fiscal representative", "2. Open a Portuguese bank account (optional but recommended)", "3. Schedule an appointment at your local Portuguese consulate", "4. Submit all required documents with your application", "5. Wait for visa approval (typically 2-4 months)", "6. Travel to Portugal within 4 months of visa issuance", "7. Schedule SEF appointment to obtain residence permit"]}',
   3, true),
  ('ss111111-0004-0004-0004-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'aaaa1111-1111-1111-1111-111111111111',
   'tips',
   'Pro Tips',
   '{"bullets": ["Start gathering documents early - some items like criminal records can take weeks to obtain", "Have all documents apostilled and translated to Portuguese by a certified translator", "Consider hiring a fiscal representative to help with NIF and bank account", "Keep digital copies of all submitted documents", "Join online communities of Portugal digital nomads for current processing times and tips"]}',
   4, true)
ON CONFLICT (country_id, visa_type_id, section_key) DO NOTHING;

-- Insert playbook sections for UK Standard Visitor Visa
INSERT INTO public.playbook_sections (id, country_id, visa_type_id, section_key, title, content_json, sort_order, is_active)
VALUES
  ('ss222222-0001-0001-0001-222222222222',
   '22222222-2222-2222-2222-222222222222',
   'aaaa2222-2222-2222-2222-222222222222',
   'overview',
   'Overview',
   '{"paragraphs": ["The UK Standard Visitor visa allows you to visit the UK for up to 6 months for tourism, business, study (courses up to 6 months), or other permitted activities.", "This is a non-immigration visa, meaning you cannot work, access public funds, or make the UK your main home."]}',
   1, true),
  ('ss222222-0002-0002-0002-222222222222',
   '22222222-2222-2222-2222-222222222222',
   'aaaa2222-2222-2222-2222-222222222222',
   'eligibility',
   'Eligibility Requirements',
   '{"bullets": ["Genuine intention to visit for a permitted purpose", "Sufficient funds to support yourself without working", "Accommodation arrangements for your stay", "Ability to pay for return journey", "Strong ties to home country demonstrating intent to leave UK"]}',
   2, true),
  ('ss222222-0003-0003-0003-222222222222',
   '22222222-2222-2222-2222-222222222222',
   'aaaa2222-2222-2222-2222-222222222222',
   'process',
   'Application Process',
   '{"paragraphs": ["Apply online through the UK government website:"], "bullets": ["1. Complete the online application form", "2. Pay the visa fee online", "3. Book an appointment at a visa application centre", "4. Attend appointment to provide biometrics (photo and fingerprints)", "5. Submit supporting documents", "6. Wait for a decision (usually within 3 weeks)"]}',
   3, true)
ON CONFLICT (country_id, visa_type_id, section_key) DO NOTHING;

-- Insert playbook assets
INSERT INTO public.playbook_assets (id, country_id, visa_type_id, asset_type, title, description, external_url, sort_order, is_active)
VALUES
  ('aa111111-0001-0001-0001-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'aaaa1111-1111-1111-1111-111111111111',
   'link',
   'Official SEF Website',
   'Portuguese Immigration and Borders Service official portal',
   'https://www.sef.pt/',
   1, true),
  ('aa111111-0002-0002-0002-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'aaaa1111-1111-1111-1111-111111111111',
   'link',
   'NIF Application Portal',
   'Apply for your Portuguese tax number online',
   'https://www.portaldasfinancas.gov.pt/',
   2, true),
  ('aa222222-0001-0001-0001-222222222222',
   '22222222-2222-2222-2222-222222222222',
   'aaaa2222-2222-2222-2222-222222222222',
   'link',
   'UK Visa Application',
   'Official UK government visa application portal',
   'https://www.gov.uk/apply-to-come-to-the-uk',
   1, true),
  ('aa222222-0002-0002-0002-222222222222',
   '22222222-2222-2222-2222-222222222222',
   'aaaa2222-2222-2222-2222-222222222222',
   'link',
   'Visa Fee Calculator',
   'Calculate the cost of your UK visa',
   'https://www.gov.uk/visa-fees',
   2, true),
  ('aa333333-0001-0001-0001-333333333333',
   '33333333-3333-3333-3333-333333333333',
   'aaaa6666-6666-6666-6666-666666666666',
   'link',
   'Express Entry Portal',
   'Official IRCC Express Entry application system',
   'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html',
   1, true),
  ('aa333333-0002-0002-0002-333333333333',
   '33333333-3333-3333-3333-333333333333',
   'aaaa6666-6666-6666-6666-666666666666',
   'link',
   'CRS Score Calculator',
   'Calculate your Comprehensive Ranking System score',
   'https://www.cic.gc.ca/english/immigrate/skilled/crs-tool.asp',
   2, true)
ON CONFLICT (id) DO NOTHING;
