"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Region = { id: string; name: string; slug: string };
type Country = { id: string; name: string; slug: string };
type VisaType = { id: string; name: string; slug: string };

export default function FindPage() {
  const router = useRouter();

  // Dropdown values (slugs)
  const [regionSlug, setRegionSlug] = useState("");
  const [countrySlug, setCountrySlug] = useState("");
  const [visaSlug, setVisaSlug] = useState("");

  // Data from DB
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);

  // Loading states (nice UX)
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingVisaTypes, setLoadingVisaTypes] = useState(false);

  const canContinue = !!(regionSlug && countrySlug && visaSlug);

  // 1) Load regions on page load
  useEffect(() => {
    const loadRegions = async () => {
      setLoadingRegions(true);
      const { data, error } = await supabase
        .from("regions")
        .select("id,name,slug")
        .order("name", { ascending: true });

      if (error) {
        console.error("Load regions failed:", error);
        setRegions([]);
      } else {
        setRegions((data ?? []) as Region[]);
      }
      setLoadingRegions(false);
    };

    loadRegions();
  }, []);

  // 2) When region changes -> load countries for that region
  useEffect(() => {
    const loadCountries = async () => {
      // reset downstream
      setCountries([]);
      setCountrySlug("");
      setVisaSlug("");
      setVisaTypes([]);

      if (!regionSlug) return;

      const regionId = regions.find((r) => r.slug === regionSlug)?.id;
      if (!regionId) return;

      setLoadingCountries(true);

      const { data: mapRows, error: e1 } = await supabase
        .from("country_region_map")
        .select("country_id")
        .eq("region_id", regionId);

      if (e1) {
        console.error("Load country_region_map failed:", e1);
        setLoadingCountries(false);
        return;
      }

      const ids = (mapRows ?? []).map((r: any) => r.country_id);
      if (!ids.length) {
        setLoadingCountries(false);
        return;
      }

      const { data: c, error: e2 } = await supabase
        .from("countries")
        .select("id,name,slug")
        .in("id", ids)
        .order("name", { ascending: true });

      if (e2) {
        console.error("Load countries failed:", e2);
        setCountries([]);
      } else {
        setCountries((c ?? []) as Country[]);
      }

      setLoadingCountries(false);
    };

    loadCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionSlug, regions.length]);

  // 3) When country changes -> load visa types for that country
  useEffect(() => {
    const loadVisaTypes = async () => {
      setVisaSlug("");
      setVisaTypes([]);

      if (!countrySlug) return;

      const countryId = countries.find((c) => c.slug === countrySlug)?.id;
      if (!countryId) return;

      setLoadingVisaTypes(true);

      const { data: cvt, error: e1 } = await supabase
        .from("country_visa_types")
        .select("visa_type_id")
        .eq("country_id", countryId)
        .eq("is_active", true);

      if (e1) {
        console.error("Load country_visa_types failed:", e1);
        setLoadingVisaTypes(false);
        return;
      }

      const visaIds = (cvt ?? []).map((r: any) => r.visa_type_id);
      if (!visaIds.length) {
        setLoadingVisaTypes(false);
        return;
      }

      const { data: vt, error: e2 } = await supabase
        .from("visa_types")
        .select("id,name,slug")
        .in("id", visaIds)
        .order("name", { ascending: true });

      if (e2) {
        console.error("Load visa_types failed:", e2);
        setVisaTypes([]);
      } else {
        setVisaTypes((vt ?? []) as VisaType[]);
      }

      setLoadingVisaTypes(false);
    };

    loadVisaTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countrySlug, countries.length]);

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl">
          VysaGuard
        </Link>
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          Back
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold">Find visa requirements</h1>
        <p className="mt-2 text-gray-600">
          Choose a region, destination, and visa type. Next, we’ll generate your structured playbook + checklist.
        </p>

        <div className="mt-8 grid gap-4">
          {/* Region */}
          <div className="rounded-2xl border p-5">
            <label className="text-sm font-medium">Region</label>
            <select
              className="mt-2 w-full rounded-xl border px-3 py-2"
              value={regionSlug}
              onChange={(e) => setRegionSlug(e.target.value)}
              disabled={loadingRegions}
            >
              <option value="">{loadingRegions ? "Loading regions..." : "Select a region"}</option>
              {regions.map((r) => (
                <option key={r.id} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div className="rounded-2xl border p-5">
            <label className="text-sm font-medium">Destination</label>
            <select
              className="mt-2 w-full rounded-xl border px-3 py-2"
              value={countrySlug}
              onChange={(e) => setCountrySlug(e.target.value)}
              disabled={!regionSlug || loadingCountries}
            >
              <option value="">
                {!regionSlug
                  ? "Select a region first"
                  : loadingCountries
                  ? "Loading destinations..."
                  : "Select a country"}
              </option>
              {countries.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visa Type */}
          <div className="rounded-2xl border p-5">
            <label className="text-sm font-medium">Visa type</label>
            <select
              className="mt-2 w-full rounded-xl border px-3 py-2"
              value={visaSlug}
              onChange={(e) => setVisaSlug(e.target.value)}
              disabled={!countrySlug || loadingVisaTypes}
            >
              <option value="">
                {!countrySlug
                  ? "Select a destination first"
                  : loadingVisaTypes
                  ? "Loading visa types..."
                  : visaTypes.length
                  ? "Select a visa type"
                  : "No visa types available (map them in DB)"}
              </option>
              {visaTypes.map((v) => (
                <option key={v.id} value={v.slug}>
                  {v.name}
                </option>
              ))}
            </select>

            {!countrySlug ? null : (
              <div className="mt-2 text-xs text-gray-500">
                If this shows “No visa types available”, you need rows in <code>country_visa_types</code> for this
                country.
              </div>
            )}
          </div>

          {/* Continue */}
          <div className="rounded-2xl border p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold">Next: View playbook</div>
              <div className="text-sm text-gray-600">
                We’ll show steps, documents, fees, and common rejection reasons.
              </div>
            </div>

            <button
              disabled={!canContinue}
              className="rounded-xl bg-black text-white px-5 py-3 font-medium disabled:opacity-40"
              onClick={() => router.push(`/checklist?country=${countrySlug}&visa=${visaSlug}`)}
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
