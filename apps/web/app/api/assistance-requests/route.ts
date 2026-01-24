import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

interface RequestBody {
  provider_id: string;
  subject: string;
  message?: string;
  checklist_id?: string;
}

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabaseAuth.auth.getUser(token);
  return data.user ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RequestBody = await request.json();

    if (!body.provider_id || !body.subject?.trim()) {
      return NextResponse.json(
        { error: "provider_id and subject are required" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Verify provider exists and is verified
    const { data: provider } = await admin
      .from("providers")
      .select("id, user_id, status")
      .eq("id", body.provider_id)
      .single();

    if (!provider || provider.status !== "verified") {
      return NextResponse.json(
        { error: "Provider not found or not verified" },
        { status: 404 }
      );
    }

    // Prevent self-request
    if (provider.user_id === user.id) {
      return NextResponse.json(
        { error: "Cannot request assistance from yourself" },
        { status: 400 }
      );
    }

    // Create the request
    const { data: req, error } = await admin
      .from("assistance_requests")
      .insert({
        applicant_id: user.id,
        provider_id: body.provider_id,
        checklist_id: body.checklist_id || null,
        subject: body.subject.trim(),
        message: body.message?.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Assistance request create error:", error);
      return NextResponse.json(
        { error: "Failed to create request" },
        { status: 500 }
      );
    }

    // Log activity
    await admin.from("activity_log").insert({
      user_id: user.id,
      action: "assistance_requested",
      entity_type: "assistance_request",
      entity_id: req.id,
      metadata: { provider_id: body.provider_id, subject: body.subject },
    });

    // Create notification for provider
    await admin.from("notifications").insert({
      user_id: provider.user_id,
      type: "new_request",
      title: "New assistance request",
      body: body.subject.trim(),
      entity_type: "assistance_request",
      entity_id: req.id,
    });

    return NextResponse.json({ request_id: req.id });
  } catch (err) {
    console.error("Assistance request error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const role = url.searchParams.get("role"); // "applicant" or "provider"

    const admin = getSupabaseAdmin();

    if (role === "provider") {
      // Get provider's requests
      const { data: provider } = await admin
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!provider) {
        return NextResponse.json({ requests: [] });
      }

      const { data: requests } = await admin
        .from("assistance_requests")
        .select("id, applicant_id, subject, message, status, provider_note, created_at, updated_at, checklist_id")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false });

      return NextResponse.json({ requests: requests ?? [] });
    } else {
      // Get applicant's requests
      const { data: requests } = await admin
        .from("assistance_requests")
        .select(`
          id, subject, message, status, provider_note, created_at, updated_at,
          providers(id, business_name, provider_type)
        `)
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });

      return NextResponse.json({ requests: requests ?? [] });
    }
  } catch (err) {
    console.error("Assistance requests list error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
