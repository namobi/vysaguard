import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

interface RespondBody {
  status: "accepted" | "declined" | "completed";
  provider_note?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;

    // Authenticate
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

    const body: RespondBody = await request.json();

    const validStatuses = ["accepted", "declined", "completed"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "status must be accepted, declined, or completed" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Verify the user owns the provider profile for this request
    const { data: req } = await admin
      .from("assistance_requests")
      .select("id, applicant_id, provider_id, status, providers(user_id)")
      .eq("id", requestId)
      .single();

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const providerUserId = (req.providers as any)?.user_id;
    if (providerUserId !== userData.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the request
    const { error } = await admin
      .from("assistance_requests")
      .update({
        status: body.status,
        provider_note: body.provider_note?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      console.error("Request respond error:", error);
      return NextResponse.json(
        { error: "Failed to update request" },
        { status: 500 }
      );
    }

    // Log activity
    await admin.from("activity_log").insert({
      user_id: userData.user.id,
      action: `request_${body.status}`,
      entity_type: "assistance_request",
      entity_id: requestId,
    });

    // Notify applicant
    const statusMessages: Record<string, string> = {
      accepted: "Your assistance request has been accepted",
      declined: "Your assistance request has been declined",
      completed: "Your assistance request has been marked as completed",
    };

    await admin.from("notifications").insert({
      user_id: req.applicant_id,
      type: `request_${body.status}`,
      title: statusMessages[body.status],
      body: body.provider_note?.trim() || null,
      entity_type: "assistance_request",
      entity_id: requestId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Request respond error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
