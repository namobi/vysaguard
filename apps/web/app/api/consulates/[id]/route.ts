import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Consulate ID is required" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Fetch consulate with full details
    const { data: consulate, error: cErr } = await admin
      .from("consulates")
      .select(`
        id, name, type, country_id, host_country_id, city, address, phone,
        email, website_url, appointment_url, operating_hours, is_active,
        notes, created_at, updated_at
      `)
      .eq("id", id)
      .single();

    if (cErr || !consulate) {
      return NextResponse.json({ error: "Consulate not found" }, { status: 404 });
    }

    // Fetch jurisdictions
    const { data: jurisdictions } = await admin
      .from("consulate_jurisdictions")
      .select("id, consulate_id, residence_country_id, region_name, region_code, priority, notes, is_active, created_at")
      .eq("consulate_id", id)
      .eq("is_active", true)
      .order("priority", { ascending: false });

    // Fetch notes, optionally filtered by visa_type_id
    const url = new URL(request.url);
    const visaTypeId = url.searchParams.get("visa_type_id");

    let notesQuery = admin
      .from("consulate_notes")
      .select("id, consulate_id, visa_type_id, note_type, title, content, sort_order, is_active, created_at, updated_at")
      .eq("consulate_id", id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (visaTypeId) {
      notesQuery = notesQuery.or(`visa_type_id.is.null,visa_type_id.eq.${visaTypeId}`);
    }

    const { data: notes } = await notesQuery;

    return NextResponse.json({
      consulate,
      notes: notes ?? [],
      jurisdictions: jurisdictions ?? [],
    });
  } catch (err) {
    console.error("Consulate detail error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
