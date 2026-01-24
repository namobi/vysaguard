"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import VersionSyncBanner from "./components/VersionSyncBanner";

type ChecklistStatus = "todo" | "uploaded" | "verified" | "blocked";

type ChecklistItem = {
  clientKey: string; // stable key like "passport", "photo"
  dbId?: string; // UUID from DB (required for uploads)
  label: string;
  required: boolean;
  status: ChecklistStatus;
  notes?: string;
  category?: string | null;
  sortOrder?: number | null;
};

type UploadRow = {
  id: string;
  checklist_item_id: string; // UUID (FK to checklist_items.id)
  file_path: string;
  file_name: string;
  content_type?: string | null;
  size_bytes?: number | null;
  created_at?: string;
};

type ResolvedRefs = {
  countryId: string;
  visaTypeId: string;
  templateId: string | null;
  templateVersion: number | null;
  changeSummary: string | null;
};

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function humanize(slug: string) {
  return (slug ?? "").replace(/-/g, " ");
}

function pickLatestTemplate(templates: any[]) {
  if (!templates?.length) return null;
  // Prefer highest version, then updated_at
  return [...templates].sort((a, b) => {
    const va = typeof a.version === "number" ? a.version : -1;
    const vb = typeof b.version === "number" ? b.version : -1;
    if (va !== vb) return vb - va;
    const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    return tb - ta;
  })[0];
}

export default function ChecklistClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const countrySlug = sp.get("country") ?? "unknown-country";
  const visaSlug = sp.get("visa") ?? "unknown-visa";

  // Fallback generator (only used if we cannot find a requirement template)
  const fallbackItems: ChecklistItem[] = useMemo(() => {
    const base: ChecklistItem[] = [
      { clientKey: "passport", label: "Passport (6+ months validity)", required: true, status: "todo" },
      { clientKey: "photo", label: "Passport photo", required: true, status: "todo" },
      { clientKey: "form", label: "Visa application form confirmation", required: true, status: "todo" },
      { clientKey: "bank", label: "Bank statements (last 3–6 months)", required: true, status: "todo" },
      { clientKey: "employment", label: "Employment letter / proof of income", required: false, status: "todo" },
      { clientKey: "itinerary", label: "Travel itinerary (optional)", required: false, status: "todo" },
      { clientKey: "invite", label: "Invitation letter (if applicable)", required: false, status: "todo" },
    ];

    if (visaSlug.includes("study")) {
      base.unshift({ clientKey: "admission", label: "Admission letter", required: true, status: "todo" });
      base.unshift({ clientKey: "tuition", label: "Proof of tuition payment / sponsor", required: true, status: "todo" });
    }
    if (visaSlug.includes("work")) {
      base.unshift({ clientKey: "offer", label: "Job offer letter", required: true, status: "todo" });
      base.unshift({ clientKey: "resume", label: "Resume / CV", required: true, status: "todo" });
    }

    return base;
  }, [visaSlug]);

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Upload state
  const [uploadingItemDbId, setUploadingItemDbId] = useState<string | null>(null);
  const [uploadsByItem, setUploadsByItem] = useState<Record<string, UploadRow[]>>({});

  // Cached refs for later saves (avoid re-resolving IDs)
  const [refs, setRefs] = useState<ResolvedRefs | null>(null);

  // Version sync state
  const [checklistDbId, setChecklistDbId] = useState<string | null>(null);
  const [storedVersion, setStoredVersion] = useState<number>(0);
  const [latestVersion, setLatestVersion] = useState<number>(0);
  const [changeSummary, setChangeSummary] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const requiredItems = items.filter((i) => i.required);
  const completedRequired = requiredItems.filter((i) => i.status !== "todo").length;
  const progress = pct(completedRequired, requiredItems.length);

  const setStatus = (clientKey: string, status: ChecklistStatus) => {
    setItems((prev) => prev.map((i) => (i.clientKey === clientKey ? { ...i, status } : i)));
  };

  const setNotes = (clientKey: string, notes: string) => {
    setItems((prev) => prev.map((i) => (i.clientKey === clientKey ? { ...i, notes } : i)));
  };

  const refreshUploadsForItems = async (itemDbIds: string[]) => {
    const ids = itemDbIds.filter(Boolean);
    if (!ids.length) return;

    const { data, error } = await supabase
      .from("checklist_uploads")
      .select("id,checklist_item_id,file_path,file_name,content_type,size_bytes,created_at")
      .in("checklist_item_id", ids)
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

  const uploadForItem = async (checklistItemDbId: string, file: File, userId: string) => {
    const safeName = file.name.replace(/[^\w.\- ]/g, "_");
    const path = `${userId}/${countrySlug}/${visaSlug}/${checklistItemDbId}/${uuidv4()}-${safeName}`;

    // 1) Upload to Storage bucket: documents
    const up = await supabase.storage.from("documents").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (up.error) throw up.error;

    // 2) Save metadata row (must include user_id for RLS)
    const ins = await supabase.from("checklist_uploads").insert([
      {
        checklist_item_id: checklistItemDbId,
        file_path: path,
        file_name: file.name,
        content_type: file.type,
        size_bytes: file.size,
        user_id: userId,
      },
    ]);
    if (ins.error) throw ins.error;

    // 3) Refresh
    await refreshUploadsForItems([checklistItemDbId]);
  };

  const resolveRefs = async (): Promise<ResolvedRefs> => {
    const { data: c, error: cErr } = await supabase
      .from("countries")
      .select("id")
      .eq("slug", countrySlug)
      .single();
    if (cErr) throw cErr;

    const { data: v, error: vErr } = await supabase
      .from("visa_types")
      .select("id")
      .eq("slug", visaSlug)
      .single();
    if (vErr) throw vErr;

    // Grab latest active template for this country+visa
    const { data: templates, error: tErr } = await supabase
      .from("requirement_templates")
      .select("id,version,updated_at,is_active,change_summary")
      .eq("country_id", c.id)
      .eq("visa_type_id", v.id)
      .eq("is_active", true);

    if (tErr) throw tErr;

    const latest = pickLatestTemplate(templates ?? []);

    return {
      countryId: c.id,
      visaTypeId: v.id,
      templateId: latest?.id ?? null,
      templateVersion: latest?.version ?? null,
      changeSummary: latest?.change_summary ?? null,
    };
  };

  const fetchTemplateItems = async (templateId: string) => {
    const { data, error } = await supabase
      .from("requirement_template_items")
      .select("client_key,label,required,notes_hint,sort_order")
      .eq("template_id", templateId)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  };

  const ensureChecklist = async (userId: string, r: ResolvedRefs) => {
    // Upsert ONE checklist per (user_id, country, visa)
    const { data: checklist, error } = await supabase
      .from("checklists")
      .upsert(
        [
          {
            country: countrySlug,
            visa: visaSlug,
            title: `Checklist • ${countrySlug} • ${visaSlug}`,
            user_id: userId,
            country_id: r.countryId,
            visa_type_id: r.visaTypeId,
            template_id: r.templateId,
          },
        ],
        {
          onConflict: "user_id,country,visa",
        }
      )
      .select("id,template_id,template_version_used")
      .single();

    if (error) throw error;

    // If this is a brand-new checklist (no version stored yet), stamp the current version
    if (checklist && !checklist.template_version_used && r.templateVersion) {
      await supabase
        .from("checklists")
        .update({ template_version_used: r.templateVersion })
        .eq("id", checklist.id);
      checklist.template_version_used = r.templateVersion;
    }

    return checklist as { id: string; template_id: string | null; template_version_used: number | null };
  };

  const seedMissingChecklistItems = async (
    checklistId: string,
    userId: string,
    templateItems: any[]
  ) => {
    if (!templateItems.length) return;

    // Get existing keys (so seeding never overwrites user progress)
    const { data: existing, error: eExisting } = await supabase
      .from("checklist_items")
      .select("client_key")
      .eq("checklist_id", checklistId);

    if (eExisting) throw eExisting;

    const existingKeys = new Set((existing ?? []).map((r: any) => r.client_key));

    const inserts = templateItems
      .filter((t) => !existingKeys.has(t.client_key))
      .map((t) => ({
        checklist_id: checklistId,
        client_key: t.client_key,
        label: t.label,
        required: !!t.required,
        status: "todo" as ChecklistStatus,
        notes: t.notes_hint ?? "",
        user_id: userId,
        category: "Documents",
        sort_order: typeof t.sort_order === "number" ? t.sort_order : 0,
      }));

    if (!inserts.length) return;

    const { error: eIns } = await supabase.from("checklist_items").insert(inserts);
    if (eIns) throw eIns;
  };

  const loadChecklistItems = async (checklistId: string) => {
    const { data: rows, error } = await supabase
      .from("checklist_items")
      .select("id,client_key,label,required,status,notes,category,sort_order")
      .eq("checklist_id", checklistId)
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    const loadedItems: ChecklistItem[] = (rows ?? []).map((r: any) => ({
      dbId: r.id,
      clientKey: r.client_key,
      label: r.label,
      required: r.required,
      status: (r.status as ChecklistStatus) ?? "todo",
      notes: r.notes ?? "",
      category: r.category ?? null,
      sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
    }));

    setItems(loadedItems);

    const ids = loadedItems.map((i) => i.dbId).filter(Boolean) as string[];
    await refreshUploadsForItems(ids);
  };

  const loadTemplateOnly = async (r: ResolvedRefs) => {
    if (!r.templateId) {
      setItems(fallbackItems);
      return;
    }

    const templateItems = await fetchTemplateItems(r.templateId);
    if (!templateItems.length) {
      setItems(fallbackItems);
      return;
    }

    setItems(
      templateItems.map((t: any) => ({
        clientKey: t.client_key,
        label: t.label,
        required: !!t.required,
        status: "todo",
        notes: "",
        category: "Documents",
        sortOrder: typeof t.sort_order === "number" ? t.sort_order : 0,
      }))
    );
  };

  // Save current in-memory status/notes to DB (for logged-in users)
  const saveItems = async (checklistId: string, userId: string) => {
    const payload = items.map((i) => ({
      checklist_id: checklistId,
      client_key: i.clientKey,
      label: i.label,
      required: i.required,
      status: i.status,
      notes: i.notes ?? "",
      user_id: userId,
      category: i.category ?? "Documents",
      sort_order: typeof i.sortOrder === "number" ? i.sortOrder : 0,
    }));

    const up = await supabase.from("checklist_items").upsert(payload, {
      onConflict: "checklist_id,client_key",
    });
    if (up.error) throw up.error;

    // Fetch back ids so we can upload against UUIDs
    const { data: savedRows, error: eFetch } = await supabase
      .from("checklist_items")
      .select("id,client_key")
      .eq("checklist_id", checklistId);

    if (eFetch) throw eFetch;

    const map = new Map((savedRows ?? []).map((r: any) => [r.client_key, r.id]));

    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        dbId: map.get(i.clientKey) ?? i.dbId,
      }))
    );

    // Cleanup any old keys not present in current UI
    const keep = new Set(items.map((i) => i.clientKey));
    const toDeleteIds = (savedRows ?? [])
      .filter((r: any) => !keep.has(r.client_key))
      .map((r: any) => r.id);

    if (toDeleteIds.length) {
      const del = await supabase.from("checklist_items").delete().in("id", toDeleteIds);
      if (del.error) throw del.error;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        alert("Please login first.");
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      const r = refs ?? (await resolveRefs());
      setRefs(r);

      const checklist = await ensureChecklist(userId, r);
      await saveItems(checklist.id, userId);

      // After saving, refresh uploads using latest dbIds
      const dbIds = items.map((i) => i.dbId).filter(Boolean) as string[];
      await refreshUploadsForItems(dbIds);

      alert("Saved ✅");
    } catch (e) {
      console.error("Save failed:", e);
      alert("Save failed (check console).");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (!checklistDbId) return;
    try {
      setSyncing(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        alert("Please login first.");
        return;
      }

      const res = await fetch("/api/checklist/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ checklist_id: checklistDbId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Sync failed.");
        return;
      }

      // Reload checklist items
      await loadChecklistItems(checklistDbId);
      setStoredVersion(data.new_version);
      setLatestVersion(data.new_version);
    } catch (err) {
      console.error("Sync failed:", err);
      alert("Sync failed (check console).");
    } finally {
      setSyncing(false);
    }
  };

  // Load-on-start: resolve refs, seed checklist if logged in, else show template items
  useEffect(() => {
    const load = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        const userId = session?.user?.id;

        const r = await resolveRefs();
        setRefs(r);

        // Not logged in: show template items (read-only) if possible
        if (!userId) {
          await loadTemplateOnly(r);
          setLoaded(true);
          return;
        }

        // Logged in: ensure checklist exists + seed missing items + load items
        const checklist = await ensureChecklist(userId, r);
        setChecklistDbId(checklist.id);

        // Set version comparison state
        const currentVer = checklist.template_version_used ?? 0;
        const latestVer = r.templateVersion ?? 0;
        setStoredVersion(currentVer);
        setLatestVersion(latestVer);
        setChangeSummary(r.changeSummary);

        // If checklist.template_id is null but r.templateId exists, keep r.templateId
        const effectiveTemplateId = checklist.template_id ?? r.templateId;

        if (effectiveTemplateId) {
          const templateItems = await fetchTemplateItems(effectiveTemplateId);
          await seedMissingChecklistItems(checklist.id, userId, templateItems);
        } else {
          // No template exists for this country+visa
          // Seed nothing; we'll fall back to mock items if checklist has no items.
        }

        // Load final items from DB
        await loadChecklistItems(checklist.id);

        // If DB has zero items (no template), fallback (still allows user save)
        if (items.length === 0) {
          setItems(fallbackItems);
        }

        setLoaded(true);
      } catch (err) {
        console.error("Load failed:", err);
        setItems(fallbackItems);
        setLoaded(true);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            Checklist • {humanize(countrySlug)} • {humanize(visaSlug)}
          </div>
          <h1 className="text-3xl font-bold">Your smart checklist</h1>
          <p className="text-gray-600">
            Your checklist is auto-seeded from the Playbook template (login required to save and upload).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-xl bg-black text-white px-5 py-3 font-medium disabled:opacity-60"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
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

        {/* Version sync banner */}
        <VersionSyncBanner
          currentVersion={storedVersion}
          latestVersion={latestVersion}
          changeSummary={changeSummary}
          onSync={handleSync}
          syncing={syncing}
        />

        <div className="rounded-2xl border overflow-hidden">
          <div className="px-5 py-4 border-b bg-gray-50 flex justify-between text-sm text-gray-600">
            <div>Document</div>
            <div>Status</div>
          </div>

          <ul className="divide-y">
            {items.map((item) => {
              const uploadKey = item.dbId ?? "";
              const uploads = uploadKey ? uploadsByItem[uploadKey] ?? [] : [];

              return (
                <li key={item.clientKey} className="p-5">
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
                          onChange={(e) => setNotes(item.clientKey, e.target.value)}
                        />
                      </div>

                      {/* Upload */}
                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-gray-500">Upload</label>

                          <input
                            type="file"
                            className="text-sm"
                            disabled={uploadingItemDbId === item.dbId || !item.dbId}
                            onChange={async (e) => {
                              const input = e.currentTarget;
                              const file = input.files?.[0];
                              if (!file) return;

                              try {
                                const { data: sessionData } = await supabase.auth.getSession();
                                const session = sessionData.session;

                                if (!session) {
                                  alert("Please login first.");
                                  router.push("/login");
                                  return;
                                }

                                if (!item.dbId) {
                                  alert("Please login and refresh so we can create IDs for uploads.");
                                  return;
                                }

                                setUploadingItemDbId(item.dbId);
                                await uploadForItem(item.dbId, file, session.user.id);

                                // Mark as uploaded
                                setStatus(item.clientKey, "uploaded");

                                // Refresh uploads for this item
                                await refreshUploadsForItems([item.dbId]);

                                alert("Uploaded ✅");
                              } catch (err) {
                                console.error(err);
                                alert("Upload failed (check console).");
                              } finally {
                                setUploadingItemDbId(null);
                                input.value = "";
                              }
                            }}
                          />

                          {!item.dbId && <span className="text-xs text-gray-500">(Login required to upload)</span>}

                          {item.dbId && uploadingItemDbId === item.dbId && (
                            <span className="text-xs text-gray-500">Uploading…</span>
                          )}
                        </div>

                        {item.dbId && uploads.length > 0 && (
                          <div className="rounded-xl border bg-gray-50 p-3">
                            <div className="text-xs text-gray-600 mb-2">Uploaded files</div>
                            <ul className="space-y-2">
                              {uploads.map((u) => (
                                <li key={u.id} className="flex items-center justify-between gap-3">
                                  <div className="text-sm text-gray-800 truncate">{u.file_name}</div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="rounded-lg border px-2 py-1 text-xs"
                                      onClick={() => openUpload(u.file_path)}
                                    >
                                      View
                                    </button>
                                    <button className="rounded-lg border px-2 py-1 text-xs" onClick={() => deleteUpload(u)}>
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
                        className={`rounded-xl border px-3 py-2 text-sm ${item.status === "todo" ? "bg-black text-white" : "bg-white"}`}
                        onClick={() => setStatus(item.clientKey, "todo")}
                      >
                        To-do
                      </button>
                      <button
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          item.status === "uploaded" ? "bg-black text-white" : "bg-white"
                        }`}
                        onClick={() => setStatus(item.clientKey, "uploaded")}
                      >
                        Uploaded
                      </button>
                      <button
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          item.status === "verified" ? "bg-black text-white" : "bg-white"
                        }`}
                        onClick={() => setStatus(item.clientKey, "verified")}
                      >
                        Verified
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm">
          <div className="font-semibold">Safety notice</div>
          <div className="text-gray-700">Never send money via WhatsApp/bank transfers. Use in-app payments for protection.</div>
        </div>
      </section>
    </main>
  );
}
