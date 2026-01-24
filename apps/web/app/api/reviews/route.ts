import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

interface ReviewBody {
  provider_id: string;
  rating: number;
  title?: string;
  body?: string;
}

export async function POST(request: NextRequest) {
  try {
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

    const userId = userData.user.id;
    const reqBody: ReviewBody = await request.json();

    if (!reqBody.provider_id || !reqBody.rating || reqBody.rating < 1 || reqBody.rating > 5) {
      return NextResponse.json({ error: "provider_id and rating (1-5) are required" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Prevent self-review
    const { data: provider } = await admin
      .from("providers")
      .select("user_id")
      .eq("id", reqBody.provider_id)
      .single();

    if (provider?.user_id === userId) {
      return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });
    }

    // Upsert review (one per user per provider)
    const { data: review, error } = await admin
      .from("provider_reviews")
      .upsert(
        {
          provider_id: reqBody.provider_id,
          reviewer_id: userId,
          rating: reqBody.rating,
          title: reqBody.title || null,
          body: reqBody.body || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider_id,reviewer_id" }
      )
      .select("id")
      .single();

    if (error) {
      console.error("Review upsert error:", error);
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    // Log activity
    await admin.from("activity_log").insert({
      user_id: userId,
      action: "review_submitted",
      entity_type: "provider_review",
      entity_id: review.id,
      metadata: { provider_id: reqBody.provider_id, rating: reqBody.rating },
    });

    return NextResponse.json({ review_id: review.id });
  } catch (err) {
    console.error("Review submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
