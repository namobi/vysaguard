import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

interface SyncRequestBody {
  checklist_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncRequestBody = await request.json();

    if (!body.checklist_id) {
      return NextResponse.json({ error: "checklist_id is required" }, { status: 400 });
    }

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
    const admin = getSupabaseAdmin();

    // 1) Get the checklist and verify ownership
    const { data: checklist, error: clErr } = await admin
      .from("checklists")
      .select("id,template_id,template_version_used,user_id,country,visa")
      .eq("id", body.checklist_id)
      .single();

    if (clErr || !checklist) {
      return NextResponse.json({ error: "Checklist not found" }, { status: 404 });
    }

    if (checklist.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!checklist.template_id) {
      return NextResponse.json({ error: "No template linked to this checklist" }, { status: 400 });
    }

    // 2) Get the latest active template for this country+visa
    const { data: template, error: tErr } = await admin
      .from("requirement_templates")
      .select("id,version,revision_date,published_at,change_summary")
      .eq("id", checklist.template_id)
      .single();

    if (tErr || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 3) Get template items
    const { data: templateItems, error: tiErr } = await admin
      .from("requirement_template_items")
      .select("id,client_key,label,required,sort_order,notes_hint,category")
      .eq("template_id", template.id)
      .order("sort_order", { ascending: true });

    if (tiErr) {
      return NextResponse.json({ error: "Failed to fetch template items" }, { status: 500 });
    }

    // 4) Get existing checklist items
    const { data: existingItems, error: eiErr } = await admin
      .from("checklist_items")
      .select("id,client_key,template_item_id")
      .eq("checklist_id", checklist.id);

    if (eiErr) {
      return NextResponse.json({ error: "Failed to fetch checklist items" }, { status: 500 });
    }

    const existingKeys = new Set((existingItems ?? []).map((i: any) => i.client_key));

    // 5) Insert new items that don't exist yet
    const newItems = (templateItems ?? [])
      .filter((t: any) => !existingKeys.has(t.client_key))
      .map((t: any) => ({
        checklist_id: checklist.id,
        client_key: t.client_key,
        label: t.label,
        required: !!t.required,
        status: "todo",
        notes: t.notes_hint ?? "",
        user_id: userId,
        category: t.category ?? "Documents",
        sort_order: typeof t.sort_order === "number" ? t.sort_order : 0,
        template_item_id: t.id,
      }));

    let addedCount = 0;
    if (newItems.length > 0) {
      const { error: insErr } = await admin.from("checklist_items").insert(newItems);
      if (insErr) {
        return NextResponse.json({ error: "Failed to insert new items" }, { status: 500 });
      }
      addedCount = newItems.length;
    }

    // 6) Update checklist version snapshot
    const { error: upErr } = await admin
      .from("checklists")
      .update({
        template_version_used: template.version,
        template_revision_date_used: template.revision_date,
        template_published_at_used: template.published_at,
      })
      .eq("id", checklist.id);

    if (upErr) {
      console.error("Failed to update checklist version snapshot:", upErr);
    }

    // 7) Log activity
    await admin.from("activity_log").insert({
      user_id: userId,
      action: "checklist_synced",
      entity_type: "checklist",
      entity_id: checklist.id,
      metadata: {
        from_version: checklist.template_version_used,
        to_version: template.version,
        items_added: addedCount,
      },
    });

    return NextResponse.json({
      synced: true,
      items_added: addedCount,
      new_version: template.version,
    });
  } catch (err) {
    console.error("Checklist sync error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
