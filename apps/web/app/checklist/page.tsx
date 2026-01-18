"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

type ChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  status: "todo" | "uploaded" | "verified";
  notes?: string;
};

type UploadRow = {
  id: string;
  checklist_item_id: string;
  file_path: string;
  file_name: string;
  content_type?: string | null;
  size_bytes?: number | null;
  created_at?: string;
};

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function humanize(slug: string) {
  return slug.replace(/-/g, " ");
}

export default function ChecklistPage() {
  const sp = useSearchParams();
  const country = sp.get("country") ?? "unknown-country";
  const visa = sp.get("visa") ?? "unknown-visa";

  // Mock generator (fallback if nothing saved yet)
  const initialItems: ChecklistItem[] = useMemo(() => {
    const base: ChecklistItem[] = [
      { id: "passport", label: "Passport (6+ months validity)", required: true, status: "todo" },
      { id: "photo", label: "Passport photo", required: true, status: "todo" },
      { id: "form", label: "Visa application form confirmation", required: true, status: "todo" },
      { id: "bank", label: "Bank statements (last 3–6 months)", required: true, status: "todo" },
      { id: "employment", label: "Employment letter / proof of income", required: false, status: "todo" },
      { id: "itinerary", label: "Travel itinerary (optional)", required: false, status: "todo" },
      { id: "invite", label: "Invitation letter (if applicable)", required: false, status: "todo" },
    ];

    if (visa.includes("study")) {
      base.unshift({ id: "admission", label: "Admission letter", required: true, status: "todo" });
      base.unshift({ id: "tuition", label: "Proof of tuition payment / sponsor", required: true, status: "todo" });
    }
    if (visa.includes("work")) {
      base.unshift({ id: "offer", label: "Job offer letter", required: true, status: "todo" });
      base.unshift({ id: "resume", label: "Resume / CV", required: true, status: "todo" });
    }

    return base;
  }, [visa]);

  // Start empty -> load -> fallback
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Upload state
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [uploadsByItem, setUploadsByItem] = useState<Record<string, UploadRow[]>>({});

  const requiredItems = items.filter((i) => i.required);
  const completedRequired = requiredItems.filter((i) => i.status !== "todo").length;
  const progress = pct(completedRequired, requiredItems.length);

  const setStatus = (id: string, status: ChecklistItem["status"]) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const setNotes = (id: string, notes: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, notes } : i)));
  };

  const refreshUploadsForItems = async (itemIds: string[]) => {
    if (!itemIds.length) return;

    const { data, error } = await supabase
      .from("checklist_uploads")
      .select("id,checklist_item_id,file_path,file_name,content_type,size_bytes,created_at")
      .in("checklist_item_id", itemIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load uploads failed:", error);
      return;
    }

    const grouped: Record<string, UploadRow[]> = {};
    (data ?? []).forEach((row: any) => {
      const k = row.checklist_item_id;
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(row);
    });

    setUploadsByItem(grouped);
  };

  const uploadForItem = async (checklistItemId: string, file: File) => {
    const safeName = file.name.replace(/[^\w.\- ]/g, "_");
    const path = `${country}/${visa}/${checklistItemId}/${uuidv4()}-${safeName}`;

    // 1) Upload to Storage bucket: documents
    const up = await supabase.storage.from("documents").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (up.error) throw up.error;

    // 2) Save metadata row
    const ins = await supabase.from("checklist_uploads").insert([
      {
        checklist_item_id: checklistItemId,
        file_path: path,
        file_name: file.name,
        content_type: file.type,
        size_bytes: file.size,
      },
    ]);
    if (ins.error) throw ins.error;

    // 3) Refresh + set status
    await refreshUploadsForItems([checklistItemId]);
    setStatus(checklistItemId, "uploaded");
  };

  const openUpload = async (file_path: string) => {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(file_path, 60);
    if (error) {
      console.error(error);
      alert("Could not open file (check console).");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const deleteUpload = async (row: UploadRow) => {
    try {
      const rm = await supabase.storage.from("documents").remove([row.file_path]);
      if (rm.error) throw rm.error;

      const del = await supabase.from("checklist_uploads").delete().eq("id", row.id);
      if (del.error) throw del.error;

      await refreshUploadsForItems([row.checklist_item_id]);
    } catch (e) {
      console.error(e);
      alert("Delete failed (check console).");
    }
  };

  // ✅ UPDATED: Upsert instead of delete+insert (prevents duplicates)
  const saveItems = async (checklistId: string) => {
    // Upsert rows by (checklist_id,label)
    const payload = items.map((i) => ({
      checklist_id: checklistId,
      label: i.label,
      required: i.required,
      status: i.status,
      notes: i.notes ?? "",
    }));

    const up = await supabase.from("checklist_items").upsert(payload, {
      onConflict: "checklist_id,label",
    });

    if (up.error) throw up.error;

    // Cleanup any old labels not in current UI
    const { data: existing, error: e1 } = await supabase
      .from("checklist_items")
      .select("id,label")
      .eq("checklist_id", checklistId);

    if (e1) throw e1;

    const keep = new Set(items.map((i) => i.label));
    const toDeleteIds = (existing ?? []).filter((r: any) => !keep.has(r.label)).map((r: any) => r.id);

    if (toDeleteIds.length) {
      const del = await supabase.from("checklist_items").delete().in("id", toDeleteIds);
      if (del.error) throw del.error;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { data: checklist, error } = await supabase
        .from("checklists")
        .upsert([{ country, visa, title: `Checklist • ${country} • ${visa}` }], { onConflict: "country,visa" })
        .select("id")
        .single();

      if (error) throw error;

      await saveItems(checklist.id);
      alert("Saved ✅");
    } catch (e) {
      console.error("Save failed:", e);
      alert("Save failed (check console).");
    } finally {
      setSaving(false);
    }
  };

  // Load-on-start
  useEffect(() => {
    const load = async () => {
      try {
        const { data: existing, error: e1 } = await supabase
          .from("checklists")
          .select("id")
          .eq("country", country)
          .eq("visa", visa)
          .maybeSingle();

        if (e1) throw e1;

        if (!existing) {
          setItems(initialItems);
          setLoaded(true);
          return;
        }

        const { data: rows, error: e2 } = await supabase
          .from("checklist_items")
          .select("id,label,required,status,notes")
          .eq("checklist_id", existing.id)
          .order("created_at", { ascending: true });

        if (e2) throw e2;

        if (rows && rows.length > 0) {
          setItems(
            rows.map((r: any) => ({
              id: r.id,
              label: r.label,
              required: r.required,
              status: r.status,
              notes: r.notes ?? "",
            }))
          );
        } else {
          setItems(initialItems);
        }

        setLoaded(true);
      } catch (err) {
        console.error("Load failed:", err);
        setItems(initialItems);
        setLoaded(true);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh uploads once items are present
  useEffect(() => {
    if (!items.length) return;
    refreshUploadsForItems(items.map((i) => i.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-white">
        <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <Link href="/" className="font-semibold text-xl">
            VysaGuard
          </Link>
          <Link href="/find" className="text-sm text-gray-600 hover:underline">
            Back
          </Link>
        </header>
        <section className="mx-auto max-w-5xl px-6 py-10 text-gray-600">Loading checklist…</section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl">
          VysaGuard
        </Link>
        <Link href="/find" className="text-sm text-gray-600 hover:underline">
          Back
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-14 space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            Checklist • {humanize(country)} • {humanize(visa)}
          </div>
          <h1 className="text-3xl font-bold">Your smart checklist</h1>
          <p className="text-gray-600">Save, reload, and upload documents per item.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-xl bg-black text-white px-5 py-3 font-medium disabled:opacity-60"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save checklist"}
          </button>

          <Link className="rounded-xl border border-gray-300 px-5 py-3 font-medium" href="/providers">
            Hire verified help
          </Link>
        </div>

        <div className="rounded-2xl border p-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Progress</div>
            <div className="text-sm text-gray-600">
              {completedRequired}/{requiredItems.length} required items completed
            </div>
          </div>

          <div className="w-full max-w-sm">
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden border">
              <div className="h-full bg-black" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 text-sm text-gray-600">{progress}%</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600">Ready to submit?</div>
            <div className="font-semibold">{progress === 100 ? "Yes ✅" : "Not yet"}</div>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <div className="px-5 py-4 border-b bg-gray-50 flex justify-between text-sm text-gray-600">
            <div>Document</div>
            <div>Status</div>
          </div>

          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="w-full">
                    <div className="font-semibold">
                      {item.label}{" "}
                      {item.required ? (
                        <span className="ml-2 text-xs rounded-full bg-black text-white px-2 py-1">Required</span>
                      ) : (
                        <span className="ml-2 text-xs rounded-full bg-gray-100 px-2 py-1">Optional</span>
                      )}
                    </div>

                    <div className="mt-2">
                      <label className="text-xs text-gray-500">Notes</label>
                      <input
                        className="mt-1 w-full md:w-[520px] rounded-xl border px-3 py-2 text-sm"
                        placeholder="Add a note (e.g., updated bank statement needed)"
                        value={item.notes ?? ""}
                        onChange={(e) => setNotes(item.id, e.target.value)}
                      />
                    </div>

                    {/* Upload */}
                    <div className="mt-3 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-gray-500">Upload</label>

                        <input
                          type="file"
                          className="text-sm"
                          disabled={uploadingItemId === item.id}
                          onChange={async (e) => {
                            const input = e.currentTarget; // ✅ capture immediately
                            const file = input.files?.[0];
                            if (!file) return;

                            try {
                              setUploadingItemId(item.id);
                              await uploadForItem(item.id, file);
                              alert("Uploaded ✅");
                            } catch (err) {
                              console.error(err);
                              alert("Upload failed (check console).");
                            } finally {
                              setUploadingItemId(null);
                              input.value = ""; // ✅ safe reset
                            }
                          }}
                        />

                        {uploadingItemId === item.id && (
                          <span className="text-xs text-gray-500">Uploading…</span>
                        )}
                      </div>

                      {(uploadsByItem[item.id] ?? []).length > 0 && (
                        <div className="rounded-xl border bg-gray-50 p-3">
                          <div className="text-xs text-gray-600 mb-2">Uploaded files</div>
                          <ul className="space-y-2">
                            {(uploadsByItem[item.id] ?? []).map((u) => (
                              <li key={u.id} className="flex items-center justify-between gap-3">
                                <div className="text-sm text-gray-800 truncate">{u.file_name}</div>
                                <div className="flex items-center gap-2">
                                  <button
                                    className="rounded-lg border px-2 py-1 text-xs"
                                    onClick={() => openUpload(u.file_path)}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="rounded-lg border px-2 py-1 text-xs"
                                    onClick={() => deleteUpload(u)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        item.status === "todo" ? "bg-black text-white" : "bg-white"
                      }`}
                      onClick={() => setStatus(item.id, "todo")}
                    >
                      To-do
                    </button>
                    <button
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        item.status === "uploaded" ? "bg-black text-white" : "bg-white"
                      }`}
                      onClick={() => setStatus(item.id, "uploaded")}
                    >
                      Uploaded
                    </button>
                    <button
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        item.status === "verified" ? "bg-black text-white" : "bg-white"
                      }`}
                      onClick={() => setStatus(item.id, "verified")}
                    >
                      Verified
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm">
          <div className="font-semibold">Safety notice</div>
          <div className="text-gray-700">
            Never send money via WhatsApp/bank transfers. Use in-app payments for protection.
          </div>
        </div>
      </section>
    </main>
  );
}