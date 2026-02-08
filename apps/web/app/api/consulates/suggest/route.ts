import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";
import { suggestConsulate } from "@/lib/consulate/suggestConsulate";
import { CONSULATE_DISCLAIMER } from "@/lib/constants";
import type { ConsulateWithJurisdictions } from "@/lib/consulate/types";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const destinationCountryId = url.searchParams.get("destination_country_id");
    const residenceCountryId = url.searchParams.get("residence_country_id");
    const residenceRegion = url.searchParams.get("residence_region");
    const residenceRegionCode = url.searchParams.get("residence_region_code");
    const visaTypeId = url.searchParams.get("visa_type_id");

    if (!destinationCountryId || !residenceCountryId) {
      return NextResponse.json(
        { error: "destination_country_id and residence_country_id are required" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Fetch active consulates for this destination in the user's residence country
    const { data: consulates, error: cErr } = await admin
      .from("consulates")
      .select(`
        id, name, type, country_id, host_country_id, city, address, phone,
        email, website_url, appointment_url, operating_hours, is_active,
        notes, created_at, updated_at,
        consulate_jurisdictions (
          id, consulate_id, residence_country_id, region_name, region_code,
          priority, notes, is_active, created_at
        )
      `)
      .eq("country_id", destinationCountryId)
      .eq("host_country_id", residenceCountryId)
      .eq("is_active", true);

    if (cErr) {
      console.error("Error fetching consulates:", cErr);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // Get residence country name for explanation text
    const { data: residenceCountry } = await admin
      .from("countries")
      .select("name")
      .eq("id", residenceCountryId)
      .single();

    const residenceCountryName = residenceCountry?.name ?? "your country";

    // Map DB rows to typed objects
    const consulatesWithJurisdictions: ConsulateWithJurisdictions[] = (consulates ?? []).map(
      (c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        country_id: c.country_id,
        host_country_id: c.host_country_id,
        city: c.city,
        address: c.address,
        phone: c.phone,
        email: c.email,
        website_url: c.website_url,
        appointment_url: c.appointment_url,
        operating_hours: c.operating_hours,
        is_active: c.is_active,
        notes: c.notes,
        created_at: c.created_at,
        updated_at: c.updated_at,
        jurisdictions: c.consulate_jurisdictions ?? [],
      })
    );

    // Call the pure suggestion algorithm
    const result = suggestConsulate({
      consulates: consulatesWithJurisdictions,
      residenceRegion,
      residenceRegionCode,
      residenceCountryName,
    });

    // If visa_type_id provided, fetch relevant consulate notes for the suggested consulate
    let consulateNotes: any[] = [];
    if (visaTypeId && result.suggested) {
      const { data: notes } = await admin
        .from("consulate_notes")
        .select("id, consulate_id, visa_type_id, note_type, title, content, sort_order, is_active, created_at, updated_at")
        .eq("consulate_id", result.suggested.consulate.id)
        .eq("is_active", true)
        .or(`visa_type_id.is.null,visa_type_id.eq.${visaTypeId}`)
        .order("sort_order", { ascending: true });

      consulateNotes = notes ?? [];
    }

    return NextResponse.json({
      suggested: result.suggested,
      alternatives: result.alternatives,
      consulate_notes: consulateNotes,
      disclaimer: CONSULATE_DISCLAIMER,
    });
  } catch (err) {
    console.error("Consulate suggestion error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
