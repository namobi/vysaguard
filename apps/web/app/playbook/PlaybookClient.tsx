"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PlaybookSections, { type PlaybookSection } from "./components/PlaybookSections";
import PlaybookMeta, { type PlaybookMetaData } from "./components/PlaybookMeta";
import PlaybookAssets, { type PlaybookAsset } from "./components/PlaybookAssets";

type CountryTheme = {
  id: string;
  name: string;
  slug: string;
  theme_primary: string | null;
  theme_secondary: string | null;
  theme_bg: string | null;
  theme_flag_emoji: string | null;
};

type VisaType = {
  id: string;
  name: string;
  slug: string;
};

type TemplateHeader = {
  id: string;
  title: string | null;
  summary: string | null;
  source_url: string | null;
  last_verified_at: string | null;
};

type TemplateItem = {
  client_key: string;
  label: string;
  required: boolean;
  sort_order: number | null;
  notes_hint: string | null;
};

function humanize(slug: string) {
  return (slug ?? "").replace(/-/g, " ");
}

function formatLastVerified(iso?: string | null) {
  if (!iso) return "Recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PlaybookClient() {
  const sp = useSearchParams();
  const router = useRouter();

  // Example: /playbook?country=united-states&visa=tourist-visa
  const countrySlug = sp.get("country") ?? "united-states";
  const visaParam = sp.get("visa") ?? "tourist-visa";

  // Normalize to your visa_types slugs if someone passes "tourist"
  const visaSlug = useMemo(() => {
    if (visaParam && !visaParam.includes("visa")) return `${visaParam}-visa`;
    return visaParam;
  }, [visaParam]);

  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<CountryTheme | null>(null);
  const [visaType, setVisaType] = useState<VisaType | null>(null);
  const [header, setHeader] = useState<TemplateHeader | null>(null);
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [sections, setSections] = useState<PlaybookSection[]>([]);
  const [meta, setMeta] = useState<PlaybookMetaData | null>(null);
  const [assets, setAssets] = useState<PlaybookAsset[]>([]);

  // Theme fallbacks so UI never breaks
  const theme = useMemo(() => {
    const primary = country?.theme_primary ?? "#0B1B3A";
    const secondary = country?.theme_secondary ?? "#2563EB";
    const bg = country?.theme_bg ?? "#F5F7FB";
    const flag = country?.theme_flag_emoji ?? "🌍";
    return { primary, secondary, bg, flag };
  }, [country]);

  const requiredItems = useMemo(() => items.filter((i) => i.required), [items]);
  const optionalItems = useMemo(() => items.filter((i) => !i.required), [items]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        // 1) Country by slug (includes theme)
        const { data: c, error: e1 } = await supabase
          .from("countries")
          .select("id,name,slug,theme_primary,theme_secondary,theme_bg,theme_flag_emoji")
          .eq("slug", countrySlug)
          .maybeSingle();

        if (e1) throw e1;

        if (!c) {
          // still render with defaults
          setCountry({
            id: "missing",
            name: humanize(countrySlug),
            slug: countrySlug,
            theme_primary: "#0B1B3A",
            theme_secondary: "#2563EB",
            theme_bg: "#F5F7FB",
            theme_flag_emoji: "🌍",
          });
          setHeader({
            id: "missing",
            title: `${humanize(countrySlug)} ${humanize(visaSlug)} Playbook`,
            summary: "Country not found in DB. Please seed countries table for this slug.",
            source_url: null,
            last_verified_at: null,
          });
          setItems([]);
          setLoading(false);
          return;
        }

        setCountry(c as any);

        // 2) Visa type by slug
        const { data: v, error: e2 } = await supabase
          .from("visa_types")
          .select("id,name,slug")
          .eq("slug", visaSlug)
          .maybeSingle();

        if (e2) throw e2;

        if (!v) {
          setVisaType({ id: "missing", name: humanize(visaSlug), slug: visaSlug });
          setHeader({
            id: "missing",
            title: `${c.name} ${humanize(visaSlug)} Playbook`,
            summary: "Visa type not found in DB. Please seed visa_types table for this slug.",
            source_url: null,
            last_verified_at: null,
          });
          setItems([]);
          setLoading(false);
          return;
        }

        setVisaType(v as any);

        // 3) Template header by country_id + visa_type_id
        const { data: t, error: e3 } = await supabase
          .from("requirement_templates")
          .select("id,title,summary,source_url,last_verified_at")
          .eq("country_id", (c as any).id)
          .eq("visa_type_id", (v as any).id)
          .maybeSingle();

        if (e3) throw e3;

        if (!t) {
          setHeader({
            id: "missing",
            title: `${c.name} ${v.name} Playbook`,
            summary: "No playbook found yet for this selection. Seed requirement_templates + items to populate this page.",
            source_url: null,
            last_verified_at: null,
          });
          setItems([]);
          setLoading(false);
          return;
        }

        setHeader(t as any);

        // 4) Template items by template_id
        const { data: rows, error: e4 } = await supabase
          .from("requirement_template_items")
          .select("client_key,label,required,sort_order,notes_hint")
          .eq("template_id", (t as any).id)
          .order("sort_order", { ascending: true });

        if (e4) throw e4;

        setItems((rows ?? []) as any);

        // 5) Fetch playbook_sections, playbook_meta, playbook_assets in parallel
        const countryId = (c as any).id;
        const visaTypeId = (v as any).id;

        const [sectionsRes, metaRes, assetsRes] = await Promise.all([
          supabase
            .from("playbook_sections")
            .select("id,section_key,title,content_json,sort_order")
            .eq("country_id", countryId)
            .eq("visa_type_id", visaTypeId)
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("playbook_meta")
            .select("id,processing_time_text,typical_cost_text,refusal_reasons,updated_at")
            .eq("country_id", countryId)
            .eq("visa_type_id", visaTypeId)
            .maybeSingle(),
          supabase
            .from("playbook_assets")
            .select("id,asset_type,title,description,file_path,external_url,sort_order")
            .eq("country_id", countryId)
            .eq("visa_type_id", visaTypeId)
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        ]);

        if (sectionsRes.data) setSections(sectionsRes.data as PlaybookSection[]);
        if (metaRes.data) {
          const m = metaRes.data as any;
          setMeta({
            ...m,
            refusal_reasons: Array.isArray(m.refusal_reasons) ? m.refusal_reasons : [],
          });
        }
        if (assetsRes.data) setAssets(assetsRes.data as PlaybookAsset[]);

        setLoading(false);
      } catch (err) {
        console.error("Playbook load failed:", err);
        alert("Playbook load failed (check console).");
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStartChecklist = () => {
    router.push(`/checklist?country=${countrySlug}&visa=${visaSlug}`);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl" style={{ color: theme.primary }}>
          VysaGuard
        </Link>
        <Link href="/find" className="text-sm text-gray-600 hover:underline">
          Back to Find
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-14 space-y-6">
        {/* Hero */}
        <div className="rounded-3xl bg-white shadow-sm border p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm text-gray-500">Playbook</div>

              <h1 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: theme.primary }}>
                <span className="mr-2">{theme.flag}</span>
                {country?.name ?? humanize(countrySlug)} • {visaType?.name ?? humanize(visaSlug)}
              </h1>

              <p className="mt-2 text-gray-600">
                {header?.summary ??
                  "Structured visa guidance: requirements, documents, and next steps. This is read-only for now."}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${theme.primary}10`, color: theme.primary }}
                >
                  Last verified: {formatLastVerified(header?.last_verified_at)}
                </span>

                {header?.source_url ? (
                  <a
                    className="text-xs font-semibold underline"
                    href={header.source_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: theme.secondary }}
                  >
                    Official source
                  </a>
                ) : (
                  <span className="text-xs text-gray-500">No source link yet</span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                style={{ backgroundColor: theme.primary }}
              >
                P
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartChecklist}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: theme.primary }}
            >
              Start checklist
            </button>

            <button
              className="rounded-xl border px-5 py-3 text-sm font-semibold bg-white"
              style={{ borderColor: `${theme.primary}30`, color: theme.primary }}
              onClick={() => alert("VysaBot coming soon (AI Q&A).")}
            >
              Ask VysaBot (soon)
            </button>
          </div>
        </div>

        {/* Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Documents</div>
                <div className="text-lg font-semibold" style={{ color: theme.primary }}>
                  Required
                </div>
              </div>
              <span
                className="text-xs font-semibold rounded-full px-3 py-1"
                style={{ backgroundColor: `${theme.primary}10`, color: theme.primary }}
              >
                {requiredItems.length}
              </span>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600">Loading playbook items…</div>
            ) : requiredItems.length === 0 ? (
              <div className="p-6 text-gray-600">No required items found for this playbook yet.</div>
            ) : (
              <ul className="divide-y">
                {requiredItems.map((it) => (
                  <li key={it.client_key} className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900">{it.label}</div>
                        <div className="mt-2 text-sm text-gray-600">{it.notes_hint ?? "—"}</div>
                      </div>
                      <span
                        className="shrink-0 text-xs font-semibold rounded-full px-3 py-1"
                        style={{ backgroundColor: theme.primary, color: "white" }}
                      >
                        Required
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Documents</div>
                <div className="text-lg font-semibold" style={{ color: theme.primary }}>
                  Optional
                </div>
              </div>
              <span
                className="text-xs font-semibold rounded-full px-3 py-1"
                style={{ backgroundColor: `${theme.primary}10`, color: theme.primary }}
              >
                {optionalItems.length}
              </span>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600">Loading playbook items…</div>
            ) : optionalItems.length === 0 ? (
              <div className="p-6 text-gray-600">No optional items found for this playbook yet.</div>
            ) : (
              <ul className="divide-y">
                {optionalItems.map((it) => (
                  <li key={it.client_key} className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900">{it.label}</div>
                        <div className="mt-2 text-sm text-gray-600">{it.notes_hint ?? "—"}</div>
                      </div>
                      <span className="shrink-0 text-xs font-semibold rounded-full bg-gray-100 px-3 py-1">
                        Optional
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Meta: Processing time, cost, refusal reasons */}
        {meta && <PlaybookMeta meta={meta} themeColor={theme.primary} />}

        {/* Sections: Detailed guidance content */}
        {sections.length > 0 && (
          <div className="rounded-3xl bg-white shadow-sm border p-6">
            <PlaybookSections sections={sections} themeColor={theme.primary} />
          </div>
        )}

        {/* Assets: Downloadable resources and links */}
        {assets.length > 0 && <PlaybookAssets assets={assets} themeColor={theme.primary} />}

        {/* Next steps */}
        <div className="rounded-3xl bg-white shadow-sm border p-6">
          <div className="text-sm text-gray-500">Next</div>
          <div className="text-lg font-semibold" style={{ color: theme.primary }}>
            How to use this playbook
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border p-4">
              <div className="text-sm font-semibold" style={{ color: theme.primary }}>
                1) Read
              </div>
              <div className="mt-1 text-sm text-gray-600">Understand required vs optional documents.</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-sm font-semibold" style={{ color: theme.primary }}>
                2) Start checklist
              </div>
              <div className="mt-1 text-sm text-gray-600">Track progress and save notes per document.</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-sm font-semibold" style={{ color: theme.primary }}>
                3) Upload proof
              </div>
              <div className="mt-1 text-sm text-gray-600">Upload files to each checklist item (in your account).</div>
            </div>
          </div>
        </div>

        {/* Safety notice */}
        <div className="rounded-xl border p-4 text-sm" style={{ backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }}>
          <div className="font-semibold" style={{ color: "#9A3412" }}>
            Safety notice
          </div>
          <div className="mt-1" style={{ color: "#7C2D12" }}>
            Never send money via WhatsApp/bank transfers. Use in-app payments for protection.
          </div>
        </div>
      </section>
    </main>
  );
}
