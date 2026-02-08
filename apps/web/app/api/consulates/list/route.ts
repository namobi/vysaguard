import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

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
    const countryId = url.searchParams.get("country_id");
    const hostCountryId = url.searchParams.get("host_country_id");
    const type = url.searchParams.get("type");

    const admin = getSupabaseAdmin();

    let query = admin
      .from("consulates")
      .select(`
        id, name, type, country_id, host_country_id, city, address, phone,
        email, website_url, appointment_url, operating_hours, is_active,
        notes, created_at, updated_at
      `)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (countryId) {
      query = query.eq("country_id", countryId);
    }
    if (hostCountryId) {
      query = query.eq("host_country_id", hostCountryId);
    }
    if (type) {
      query = query.eq("type", type);
    }

    const { data: consulates, error } = await query;

    if (error) {
      console.error("Error fetching consulates:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({
      consulates: consulates ?? [],
    });
  } catch (err) {
    console.error("Consulate list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
