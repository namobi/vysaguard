import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

interface RegisterProviderBody {
  business_name: string;
  contact_email: string;
  contact_phone?: string;
  bio?: string;
  website_url?: string;
  provider_type: string;
  years_experience?: number;
  languages?: string[];
  credentials?: {
    credential_type: string;
    issuing_body: string;
    credential_number?: string;
    issued_date?: string;
    expiry_date?: string;
  }[];
  service_areas?: {
    country_id: string;
    visa_type_id?: string;
  }[];
}

export async function POST(request: NextRequest) {
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

    const userId = userData.user.id;
    const body: RegisterProviderBody = await request.json();

    if (!body.business_name || !body.contact_email || !body.provider_type) {
      return NextResponse.json(
        { error: "business_name, contact_email, and provider_type are required" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Check if provider already exists for this user
    const { data: existing } = await admin
      .from("providers")
      .select("id,status")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Provider profile already exists", provider_id: existing.id, status: existing.status },
        { status: 409 }
      );
    }

    // 1) Create provider
    const { data: provider, error: provErr } = await admin
      .from("providers")
      .insert({
        user_id: userId,
        business_name: body.business_name,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone || null,
        bio: body.bio || null,
        website_url: body.website_url || null,
        provider_type: body.provider_type,
        years_experience: body.years_experience || null,
        languages: body.languages || [],
        status: "pending",
      })
      .select("id")
      .single();

    if (provErr) {
      console.error("Provider insert failed:", provErr);
      return NextResponse.json({ error: "Failed to create provider" }, { status: 500 });
    }

    const providerId = provider.id;

    // 2) Insert credentials if provided
    if (body.credentials?.length) {
      const credInserts = body.credentials.map((c) => ({
        provider_id: providerId,
        credential_type: c.credential_type,
        issuing_body: c.issuing_body,
        credential_number: c.credential_number || null,
        issued_date: c.issued_date || null,
        expiry_date: c.expiry_date || null,
      }));

      const { error: credErr } = await admin.from("provider_credentials").insert(credInserts);
      if (credErr) console.error("Credential insert failed:", credErr);
    }

    // 3) Insert service areas if provided
    if (body.service_areas?.length) {
      const areaInserts = body.service_areas.map((a) => ({
        provider_id: providerId,
        country_id: a.country_id,
        visa_type_id: a.visa_type_id || null,
      }));

      const { error: areaErr } = await admin.from("provider_service_areas").insert(areaInserts);
      if (areaErr) console.error("Service area insert failed:", areaErr);
    }

    // 4) Log activity
    await admin.from("activity_log").insert({
      user_id: userId,
      action: "provider_registered",
      entity_type: "provider",
      entity_id: providerId,
      metadata: { provider_type: body.provider_type },
    });

    return NextResponse.json({ provider_id: providerId, status: "pending" });
  } catch (err) {
    console.error("Provider register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
