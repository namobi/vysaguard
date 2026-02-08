/**
 * Seed consulate data for priority countries: UK, US, Canada.
 *
 * Seeds consulates, jurisdiction mappings, and sample notes.
 * Idempotent — safe to run multiple times (checks before inserting).
 *
 * Prerequisites:
 *   - Run seed-countries.ts first (countries must exist)
 *   - Run the 015_add_consulates_system.sql migration first
 *
 * Run with: node --env-file=.env.local --import tsx scripts/seed-consulates.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------- Helper ----------

async function getCountryId(iso2: string): Promise<string> {
  const { data } = await supabase
    .from("countries")
    .select("id")
    .eq("iso2", iso2)
    .single();
  if (!data) {
    throw new Error(`Country not found: ${iso2}. Run seed-countries.ts first.`);
  }
  return data.id;
}

async function getVisaTypeId(slug: string): Promise<string | null> {
  const { data } = await supabase
    .from("visa_types")
    .select("id")
    .eq("slug", slug)
    .single();
  return data?.id ?? null;
}

async function upsertConsulate(data: {
  name: string;
  type: string;
  country_id: string;
  host_country_id: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  appointment_url?: string;
  operating_hours?: string;
  notes?: string;
}): Promise<string> {
  const { data: existing } = await supabase
    .from("consulates")
    .select("id")
    .eq("name", data.name)
    .eq("host_country_id", data.host_country_id)
    .single();

  if (existing) {
    console.log(`  Exists: ${data.name}`);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("consulates")
    .insert(data)
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create ${data.name}: ${error.message}`);
  console.log(`  Created: ${data.name}`);
  return created!.id;
}

async function upsertJurisdiction(data: {
  consulate_id: string;
  residence_country_id: string;
  region_name: string | null;
  region_code: string | null;
  priority: number;
  notes?: string;
}) {
  let query = supabase
    .from("consulate_jurisdictions")
    .select("id")
    .eq("consulate_id", data.consulate_id)
    .eq("residence_country_id", data.residence_country_id);

  if (data.region_name === null) {
    query = query.is("region_name", null);
  } else {
    query = query.eq("region_name", data.region_name);
  }

  const { data: existing } = await query.single();
  if (existing) return;

  const { error } = await supabase
    .from("consulate_jurisdictions")
    .insert(data);
  if (error) console.error(`  Jurisdiction insert error: ${error.message}`);
}

async function upsertNote(data: {
  consulate_id: string;
  visa_type_id: string | null;
  note_type: string;
  title: string;
  content: string;
  sort_order?: number;
}) {
  const { data: existing } = await supabase
    .from("consulate_notes")
    .select("id")
    .eq("consulate_id", data.consulate_id)
    .eq("title", data.title)
    .single();

  if (existing) return;

  const { error } = await supabase.from("consulate_notes").insert({
    ...data,
    sort_order: data.sort_order ?? 0,
  });
  if (error) console.error(`  Note insert error: ${error.message}`);
}

// ---------- UK Consulates in the US ----------

async function seedUKConsulatesInUS(ukId: string, usId: string) {
  console.log("\nSeeding UK consulates in the US...");

  const dcId = await upsertConsulate({
    name: "British Embassy Washington DC",
    type: "embassy",
    country_id: ukId,
    host_country_id: usId,
    city: "Washington DC",
    address: "3100 Massachusetts Ave NW, Washington, DC 20008",
    phone: "+1 (202) 588-6500",
    website_url: "https://www.gov.uk/world/organisations/british-embassy-washington",
    appointment_url: "https://www.gov.uk/apply-uk-visa",
    operating_hours: "Mon-Fri 9:00 AM - 5:00 PM",
  });

  const dcStates: [string, string][] = [
    ["District of Columbia", "US-DC"],
    ["Virginia", "US-VA"],
    ["Maryland", "US-MD"],
    ["West Virginia", "US-WV"],
    ["Kentucky", "US-KY"],
    ["Tennessee", "US-TN"],
    ["North Carolina", "US-NC"],
    ["South Carolina", "US-SC"],
  ];
  for (const [name, code] of dcStates) {
    await upsertJurisdiction({
      consulate_id: dcId,
      residence_country_id: usId,
      region_name: name,
      region_code: code,
      priority: name === "District of Columbia" ? 10 : 5,
    });
  }

  const nyId = await upsertConsulate({
    name: "British Consulate General New York",
    type: "consulate",
    country_id: ukId,
    host_country_id: usId,
    city: "New York",
    address: "885 Second Avenue, New York, NY 10017",
    phone: "+1 (212) 745-0200",
    website_url: "https://www.gov.uk/world/organisations/british-consulate-general-new-york",
    appointment_url: "https://www.gov.uk/apply-uk-visa",
    operating_hours: "Mon-Fri 9:00 AM - 5:00 PM",
  });

  const nyStates: [string, string][] = [
    ["New York", "US-NY"],
    ["New Jersey", "US-NJ"],
    ["Connecticut", "US-CT"],
    ["Pennsylvania", "US-PA"],
    ["Massachusetts", "US-MA"],
    ["Maine", "US-ME"],
    ["New Hampshire", "US-NH"],
    ["Vermont", "US-VT"],
    ["Rhode Island", "US-RI"],
    ["Delaware", "US-DE"],
  ];
  for (const [name, code] of nyStates) {
    await upsertJurisdiction({
      consulate_id: nyId,
      residence_country_id: usId,
      region_name: name,
      region_code: code,
      priority: name === "New York" ? 10 : 5,
    });
  }

  const laId = await upsertConsulate({
    name: "British Consulate General Los Angeles",
    type: "consulate",
    country_id: ukId,
    host_country_id: usId,
    city: "Los Angeles",
    address: "2029 Century Park East, Suite 1350, Los Angeles, CA 90067",
    phone: "+1 (310) 789-0031",
    website_url: "https://www.gov.uk/world/organisations/british-consulate-general-los-angeles",
    appointment_url: "https://www.gov.uk/apply-uk-visa",
    operating_hours: "Mon-Fri 8:30 AM - 5:00 PM",
  });

  const laStates: [string, string][] = [
    ["California", "US-CA"],
    ["Nevada", "US-NV"],
    ["Arizona", "US-AZ"],
    ["Hawaii", "US-HI"],
    ["Utah", "US-UT"],
    ["Colorado", "US-CO"],
    ["New Mexico", "US-NM"],
  ];
  for (const [name, code] of laStates) {
    await upsertJurisdiction({
      consulate_id: laId,
      residence_country_id: usId,
      region_name: name,
      region_code: code,
      priority: name === "California" ? 10 : 5,
    });
  }

  const chiId = await upsertConsulate({
    name: "British Consulate General Chicago",
    type: "consulate",
    country_id: ukId,
    host_country_id: usId,
    city: "Chicago",
    address: "625 N Michigan Ave, Suite 2200, Chicago, IL 60611",
    phone: "+1 (312) 970-3800",
    website_url: "https://www.gov.uk/world/organisations/british-consulate-general-chicago",
    appointment_url: "https://www.gov.uk/apply-uk-visa",
    operating_hours: "Mon-Fri 9:00 AM - 5:00 PM",
  });

  const chiStates: [string, string][] = [
    ["Illinois", "US-IL"],
    ["Indiana", "US-IN"],
    ["Iowa", "US-IA"],
    ["Kansas", "US-KS"],
    ["Michigan", "US-MI"],
    ["Minnesota", "US-MN"],
    ["Missouri", "US-MO"],
    ["Nebraska", "US-NE"],
    ["North Dakota", "US-ND"],
    ["Ohio", "US-OH"],
    ["South Dakota", "US-SD"],
    ["Wisconsin", "US-WI"],
  ];
  for (const [name, code] of chiStates) {
    await upsertJurisdiction({
      consulate_id: chiId,
      residence_country_id: usId,
      region_name: name,
      region_code: code,
      priority: name === "Illinois" ? 10 : 5,
    });
  }

  const houId = await upsertConsulate({
    name: "British Consulate General Houston",
    type: "consulate",
    country_id: ukId,
    host_country_id: usId,
    city: "Houston",
    address: "1301 Fannin St, Suite 2400, Houston, TX 77002",
    phone: "+1 (713) 659-6270",
    website_url: "https://www.gov.uk/world/organisations/british-consulate-general-houston",
    appointment_url: "https://www.gov.uk/apply-uk-visa",
    operating_hours: "Mon-Fri 8:30 AM - 12:30 PM",
  });

  const houStates: [string, string][] = [
    ["Texas", "US-TX"],
    ["Louisiana", "US-LA"],
    ["Oklahoma", "US-OK"],
    ["Arkansas", "US-AR"],
    ["Mississippi", "US-MS"],
    ["Alabama", "US-AL"],
    ["Georgia", "US-GA"],
    ["Florida", "US-FL"],
  ];
  for (const [name, code] of houStates) {
    await upsertJurisdiction({
      consulate_id: houId,
      residence_country_id: usId,
      region_name: name,
      region_code: code,
      priority: name === "Texas" ? 10 : 5,
    });
  }

  const vfsId = await upsertConsulate({
    name: "VFS Global New York",
    type: "visa_application_center",
    country_id: ukId,
    host_country_id: usId,
    city: "New York",
    address: "145 W 45th Street, New York, NY 10036",
    phone: "+1 (212) 921-2799",
    website_url: "https://www.vfsglobal.co.uk/us/en",
    appointment_url: "https://www.vfsglobal.co.uk/us/en/book-an-appointment",
    operating_hours: "Mon-Fri 8:00 AM - 3:00 PM",
    notes: "Biometrics collection and document submission center",
  });

  await upsertJurisdiction({
    consulate_id: vfsId,
    residence_country_id: usId,
    region_name: null,
    region_code: null,
    priority: 1,
    notes: "VFS Global serves the entire United States",
  });

  await upsertNote({
    consulate_id: vfsId,
    visa_type_id: null,
    note_type: "fee_info",
    title: "VFS Service Fee",
    content:
      "VFS Global charges an additional service fee on top of the UK visa application fee. Check vfsglobal.co.uk for current pricing.",
    sort_order: 1,
  });

  await upsertNote({
    consulate_id: vfsId,
    visa_type_id: null,
    note_type: "appointment_info",
    title: "Biometrics Appointment Required",
    content:
      "All applicants must attend an in-person appointment at a VFS Global center to provide biometrics (fingerprints and photograph). Book your appointment after submitting your online application.",
    sort_order: 2,
  });
}

// ---------- UK Consulates in Nigeria ----------

async function seedUKConsulatesInNigeria(ukId: string, ngId: string) {
  console.log("\nSeeding UK consulates in Nigeria...");

  const bhcId = await upsertConsulate({
    name: "British High Commission Abuja",
    type: "embassy",
    country_id: ukId,
    host_country_id: ngId,
    city: "Abuja",
    address: "19 Torrens Close, Maitama, Abuja",
    phone: "+234 (9) 462 2200",
    website_url: "https://www.gov.uk/world/organisations/british-high-commission-abuja",
    appointment_url: "https://www.gov.uk/apply-uk-visa",
    operating_hours: "Mon-Thu 7:30 AM - 3:30 PM, Fri 7:30 AM - 12:00 PM",
  });

  await upsertJurisdiction({
    consulate_id: bhcId,
    residence_country_id: ngId,
    region_name: null,
    region_code: null,
    priority: 10,
  });

  const vfsLagosId = await upsertConsulate({
    name: "VFS Global Lagos",
    type: "visa_application_center",
    country_id: ukId,
    host_country_id: ngId,
    city: "Lagos",
    address: "Meadow Hall Way, Ikate-Elegushi, Lekki, Lagos",
    website_url: "https://www.vfsglobal.co.uk/ng/en",
    appointment_url: "https://www.vfsglobal.co.uk/ng/en/book-an-appointment",
    operating_hours: "Mon-Fri 8:00 AM - 3:00 PM",
    notes: "Primary biometrics and document collection center for southern Nigeria",
  });

  await upsertJurisdiction({
    consulate_id: vfsLagosId,
    residence_country_id: ngId,
    region_name: null,
    region_code: null,
    priority: 5,
    notes: "Primarily serves applicants in southern Nigeria",
  });

  await upsertNote({
    consulate_id: vfsLagosId,
    visa_type_id: null,
    note_type: "fee_info",
    title: "VFS Service Fee",
    content:
      "VFS Global Nigeria charges an additional service fee. Premium services (priority processing, SMS tracking) are available at extra cost.",
    sort_order: 1,
  });
}

// ---------- US Consulates in the UK ----------

async function seedUSConsulatesInUK(usId: string, ukId: string) {
  console.log("\nSeeding US consulates in the UK...");

  const embLondonId = await upsertConsulate({
    name: "US Embassy London",
    type: "embassy",
    country_id: usId,
    host_country_id: ukId,
    city: "London",
    address: "33 Nine Elms Lane, London SW11 7US",
    phone: "+44 (0) 20 7499 9000",
    website_url: "https://uk.usembassy.gov",
    appointment_url: "https://www.ustraveldocs.com/gb",
    operating_hours: "Mon-Fri 8:00 AM - 5:00 PM",
  });

  const ukRegions: [string, string][] = [
    ["England", "GB-ENG"],
    ["Wales", "GB-WLS"],
    ["Northern Ireland", "GB-NIR"],
  ];
  for (const [name, code] of ukRegions) {
    await upsertJurisdiction({
      consulate_id: embLondonId,
      residence_country_id: ukId,
      region_name: name,
      region_code: code,
      priority: 10,
    });
  }

  const conEdinburghId = await upsertConsulate({
    name: "US Consulate General Edinburgh",
    type: "consulate",
    country_id: usId,
    host_country_id: ukId,
    city: "Edinburgh",
    address: "3 Regent Terrace, Edinburgh EH7 5BW",
    phone: "+44 (0) 131 556 8315",
    website_url: "https://uk.usembassy.gov/embassy-consulates/edinburgh/",
    appointment_url: "https://www.ustraveldocs.com/gb",
    operating_hours: "Mon-Fri 8:30 AM - 5:00 PM",
  });

  await upsertJurisdiction({
    consulate_id: conEdinburghId,
    residence_country_id: ukId,
    region_name: "Scotland",
    region_code: "GB-SCT",
    priority: 10,
  });

  const touristVisaId = await getVisaTypeId("tourist");
  if (touristVisaId) {
    await upsertNote({
      consulate_id: embLondonId,
      visa_type_id: touristVisaId,
      note_type: "special_instruction",
      title: "DS-160 Required",
      content:
        "Complete Form DS-160 online at ceac.state.gov before your appointment. Print the confirmation page with barcode and bring it to your interview.",
      sort_order: 1,
    });
  }

  await upsertNote({
    consulate_id: embLondonId,
    visa_type_id: null,
    note_type: "appointment_info",
    title: "Interview Scheduling",
    content:
      "Schedule your visa interview through ustraveldocs.com after completing your DS-160 and paying the application fee. Wait times vary by visa category.",
    sort_order: 2,
  });
}

// ---------- Canadian Consulates in the US ----------

async function seedCanadaConsulatesInUS(caId: string, usId: string) {
  console.log("\nSeeding Canadian consulates in the US...");

  const embDcId = await upsertConsulate({
    name: "Embassy of Canada Washington DC",
    type: "embassy",
    country_id: caId,
    host_country_id: usId,
    city: "Washington DC",
    address: "501 Pennsylvania Ave NW, Washington, DC 20001",
    phone: "+1 (202) 682-1740",
    website_url: "https://www.international.gc.ca/country-pays/us-eu/washington.aspx",
    operating_hours: "Mon-Fri 9:00 AM - 5:00 PM",
    notes: "Canadian visa applications are primarily processed online through IRCC",
  });

  await upsertJurisdiction({
    consulate_id: embDcId,
    residence_country_id: usId,
    region_name: null,
    region_code: null,
    priority: 5,
  });

  const conNyId = await upsertConsulate({
    name: "Consulate General of Canada New York",
    type: "consulate",
    country_id: caId,
    host_country_id: usId,
    city: "New York",
    address: "466 Lexington Avenue, 20th Floor, New York, NY 10017",
    phone: "+1 (212) 596-1628",
    website_url: "https://www.international.gc.ca/country-pays/us-eu/new_york.aspx",
    operating_hours: "Mon-Fri 9:00 AM - 5:00 PM",
  });

  const nyStates: [string, string][] = [
    ["New York", "US-NY"],
    ["New Jersey", "US-NJ"],
    ["Connecticut", "US-CT"],
    ["Pennsylvania", "US-PA"],
    ["Massachusetts", "US-MA"],
  ];
  for (const [name, code] of nyStates) {
    await upsertJurisdiction({
      consulate_id: conNyId,
      residence_country_id: usId,
      region_name: name,
      region_code: code,
      priority: name === "New York" ? 10 : 5,
    });
  }

  const conLaId = await upsertConsulate({
    name: "Consulate General of Canada Los Angeles",
    type: "consulate",
    country_id: caId,
    host_country_id: usId,
    city: "Los Angeles",
    address: "550 S Hope St, 9th Floor, Los Angeles, CA 90071",
    phone: "+1 (213) 346-2700",
    website_url: "https://www.international.gc.ca/country-pays/us-eu/los_angeles.aspx",
    operating_hours: "Mon-Fri 8:30 AM - 4:30 PM",
  });

  const laStates: [string, string][] = [
    ["California", "US-CA"],
    ["Nevada", "US-NV"],
    ["Arizona", "US-AZ"],
    ["Hawaii", "US-HI"],
  ];
  for (const [name, code] of laStates) {
    await upsertJurisdiction({
      consulate_id: conLaId,
      residence_country_id: usId,
      region_name: name,
      region_code: code,
      priority: name === "California" ? 10 : 5,
    });
  }

  await upsertNote({
    consulate_id: embDcId,
    visa_type_id: null,
    note_type: "processing_note",
    title: "Online Applications",
    content:
      "Most Canadian immigration and visa applications are submitted online through the IRCC portal at ircc.canada.ca. In-person appointments are generally not required for most visa categories.",
    sort_order: 1,
  });
}

// ---------- Main ----------

async function seedConsulates() {
  try {
    console.log("Seeding consulate data for UK, US, Canada...\n");

    const ukId = await getCountryId("GB");
    const usId = await getCountryId("US");
    const caId = await getCountryId("CA");
    const ngId = await getCountryId("NG");

    console.log(`Resolved countries: UK=${ukId}, US=${usId}, CA=${caId}, NG=${ngId}`);

    await seedUKConsulatesInUS(ukId, usId);
    await seedUKConsulatesInNigeria(ukId, ngId);
    await seedUSConsulatesInUK(usId, ukId);
    await seedCanadaConsulatesInUS(caId, usId);

    console.log("\nConsulate seeding complete!");
  } catch (error) {
    console.error("Error seeding consulates:", error);
    process.exit(1);
  }
}

seedConsulates();
