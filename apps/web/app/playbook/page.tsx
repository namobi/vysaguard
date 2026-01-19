"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type RegionRow = { id: string; name: string; slug: string };
type CountryRow = { id: string; name: string; slug: string };
type VisaTypeRow = { id: string; name: string; slug: string; description: string | null };

type TemplateRow = {
  id: string;
  title: string;
  summary: string | null;
  source_url: string | null;
  last_verified_at: string | null;
};

type TemplateItemRow = {
  id: string;
  client_key: string;
  label: string;
  required: boolean;
  sort_order: number;
  notes_hint: string | null;
};

function humanize(slug: string) {
  return (slug ?? "").replace(/-/g, " ");
}

function fmtDate(iso?: string | null) {
  if (!iso) return "Recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function PlaybookPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const countrySlug = sp.get("country") ?? "";
  const visaSlug = sp.get("visa") ?? "";

  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<CountryRow | null>(null);
  const [visaType, setVisaType] = useState<VisaTypeRow | null>(null);
  const [template, setTemplate] = useState<TemplateRow | null>(null);
  const [items, setItems] = useState<TemplateItemRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requiredCount = useMemo(() => items.filter((i) => i.required).length, [items]);
  const optionalCount = useMemo(() => items.filter((i) => !i.required).length, [items]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        if (!countrySlug || !visaSlug) {
          setErrorMsg("Missing country or visa in URL.");
          setLoading(false);
          return;
        }

        // 1) Resolve country by slug
        const { data: c, error: eC } = await supabase
          .from("countries")
          .select("id,name,slug")
          .eq("slug", countrySlug)
          .maybeSingle();

        if (eC) throw eC;
        if (!c) {
          setErrorMsg("Country not found.");
          setLoading(false);
          return;
        }
        setCountry(c as CountryRow);

        // 2) Resolve visa type by slug
        const { data: v, error: eV } = await supabase
          .from("visa_types")
          .select("id,name,slug,description")
          .eq("slug", visaSlug)
          .maybeSingle();

        if (eV) throw eV;
        if (!v) {
          setErrorMsg("Visa type not found.");
          setLoading(false);
          return;
        }
        setVisaType(v as VisaTypeRow);

        // 3) Load template for (country_id, visa_type_id)
        const { data: t, error: eT } = await supabase
          .from("requirement_templates")
          .select("id,title,summary,source_url,last_verified_at")
          .eq("country_id", (c as any).id)
          .eq("visa_type_id", (v as any).id)
          .maybeSingle();

        if (eT) throw eT;
        if (!t) {
          setTemplate(null);
          setItems([]);
          setErrorMsg("No playbook exists yet for this country + visa type.");
          setLoading(false);
          return;
        }
        setTemplate(t as TemplateRow);

        // 4) Load template items
        const { data: ti, error: eTI } = await supabase
          .from("requirement_template_items")
          .select("id,client_key,label,required,sort_order,notes_hint")
          .eq("template_id", (t as any).id)
          .order("sort_order", { ascending: true });

        if (eTI) throw eTI;

        setItems((ti ?? []) as TemplateItemRow[]);
        setLoading(false);
      } catch (err: any) {
        console.error("Playbook load failed:", err);
        setErrorMsg("Playbook load failed (check console).");
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {loading ? (
          <div className="text-gray-600">Loading playbook…</div>
        ) : errorMsg ? (
          <div className="rounded-2xl border p-6">
            <div className="text-lg font-semibold">Playbook</div>
            <div className="mt-2 text-gray-700">{errorMsg}</div>

            <div className="mt-4 flex gap-2">
              <Link href="/find" className="rounded-xl border px-4 py-2 font-semibold">
                Go back
              </Link>
              <Link
                href={`/checklist?country=${countrySlug}&visa=${visaSlug}`}
                className="rounded-xl bg-black text-white px-4 py-2 font-semibold"
              >
                Open checklist anyway
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                Playbook • {country?.name ?? humanize(countrySlug)} • {visaType?.name ?? humanize(visaSlug)}
              </div>
              <h1 className="text-3xl font-bold">{template?.title ?? "Visa Playbook"}</h1>
              <p className="text-gray-600">
                {template?.summary ??
                  "A structured guide for steps and documents. Next we’ll generate your checklist from this playbook."}
              </p>
            </div>

            <div className="rounded-2xl border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="font-semibold">Documents overview</div>
                <div className="text-sm text-gray-600">
                  {requiredCount} required • {optionalCount} optional • Last verified {fmtDate(template?.last_verified_at)}
                </div>
                {template?.source_url ? (
                  <div className="text-sm mt-1">
                    <a className="underline text-gray-700" href={template.source_url} target="_blank" rel="noreferrer">
                      Official source
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-xl bg-black text-white px-5 py-3 font-medium"
                  onClick={() => router.push(`/checklist?country=${countrySlug}&visa=${visaSlug}`)}
                >
                  Generate checklist
                </button>
                <Link className="rounded-xl border px-5 py-3 font-medium" href="/dashboard">
                  Go to dashboard
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border overflow-hidden">
              <div className="px-5 py-4 border-b bg-gray-50 flex justify-between text-sm text-gray-600">
                <div>Document</div>
                <div>Type</div>
              </div>

              <ul className="divide-y">
                {items.map((it) => (
                  <li key={it.id} className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900">
                          {it.label}{" "}
                          {it.required ? (
                            <span className="ml-2 text-xs rounded-full bg-black text-white px-2 py-1">Required</span>
                          ) : (
                            <span className="ml-2 text-xs rounded-full bg-gray-100 px-2 py-1">Optional</span>
                          )}
                        </div>

                        {it.notes_hint ? (
                          <div className="mt-2 text-sm text-gray-600">{it.notes_hint}</div>
                        ) : (
                          <div className="mt-2 text-sm text-gray-500">Key: {it.client_key}</div>
                        )}
                      </div>

                      <div className="shrink-0 text-sm text-gray-600">
                        {it.required ? "Must include" : "Nice to have"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm">
              <div className="font-semibold">Safety notice</div>
              <div className="text-gray-700">
                Only use in-app payments for protection. Avoid WhatsApp or bank transfer requests.
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
