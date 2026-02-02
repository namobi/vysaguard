"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type RegionRow = {
  id: string;
  name: string;
  slug: string;
};

type CountryRow = {
  id: string;
  name: string;
  slug: string;
};

type VisaTypeRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export default function FindPage() {
  const router = useRouter();

  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaTypeRow[]>([]);

  const [regionId, setRegionId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [visaTypeId, setVisaTypeId] = useState("");

  const selectedRegion = useMemo(() => regions.find((r) => r.id === regionId) ?? null, [regions, regionId]);
  const selectedCountry = useMemo(() => countries.find((c) => c.id === countryId) ?? null, [countries, countryId]);
  const selectedVisaType = useMemo(() => visaTypes.find((v) => v.id === visaTypeId) ?? null, [visaTypes, visaTypeId]);

  const canContinue = Boolean(selectedCountry && selectedVisaType);

  // Load regions on start
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("regions").select("id,name,slug").order("name", { ascending: true });
      if (error) {
        console.error("Load regions failed:", error);
        alert("Could not load regions (check console).");
        return;
      }
      setRegions((data ?? []) as RegionRow[]);
    };
    load();
  }, []);

  // When region changes: load countries for that region
  useEffect(() => {
    const loadCountries = async () => {
      setCountries([]);
      setCountryId("");
      setVisaTypes([]);
      setVisaTypeId("");

      if (!regionId) return;

      // country_region_map + countries
      const { data: mapRows, error: e1 } = await supabase
        .from("country_region_map")
        .select("country_id")
        .eq("region_id", regionId);

      if (e1) {
        console.error("Load country map failed:", e1);
        alert("Could not load countries (check console).");
        return;
      }

      const ids = (mapRows ?? []).map((r: any) => r.country_id);
      if (!ids.length) return;

      const { data: c, error: e2 } = await supabase.from("countries").select("id,name,slug").in("id", ids);

      if (e2) {
        console.error("Load countries failed:", e2);
        alert("Could not load countries (check console).");
        return;
      }

      const sorted = (c ?? []).sort((a: any, b: any) => (a.name ?? "").localeCompare(b.name ?? ""));
      setCountries(sorted as CountryRow[]);
    };

    loadCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  // When country changes: load visa types available for that country
  useEffect(() => {
    const loadVisaTypes = async () => {
      setVisaTypes([]);
      setVisaTypeId("");

      if (!countryId) return;

      // country_visa_types -> visa_types
      const { data: cvt, error: e1 } = await supabase
        .from("country_visa_types")
        .select("visa_type_id,is_active")
        .eq("country_id", countryId)
        .eq("is_active", true);

      if (e1) {
        console.error("Load country visa map failed:", e1);
        alert("Could not load visa types (check console).");
        return;
      }

      const ids = (cvt ?? []).map((r: any) => r.visa_type_id);
      if (!ids.length) return;

      const { data: v, error: e2 } = await supabase
        .from("visa_types")
        .select("id,name,slug,description")
        .in("id", ids);

      if (e2) {
        console.error("Load visa types failed:", e2);
        alert("Could not load visa types (check console).");
        return;
      }

      const sorted = (v ?? []).sort((a: any, b: any) => (a.name ?? "").localeCompare(b.name ?? ""));
      setVisaTypes(sorted as VisaTypeRow[]);
    };

    loadVisaTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

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
          Choose a region, destination country, and visa type. Next, we’ll show your structured playbook + checklist.
        </p>

        <div className="mt-8 grid gap-4">
          {/* Region */}
          <div className="rounded-2xl border p-5">
            <label className="text-sm font-medium">Region</label>
            <select
              className="mt-2 w-full rounded-xl border px-3 py-2"
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
            >
              <option value="">Select a region</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div className="rounded-2xl border p-5">
            <label className="text-sm font-medium">Destination</label>
            <select
              className="mt-2 w-full rounded-xl border px-3 py-2"
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              disabled={!regionId}
            >
              <option value="">{regionId ? "Select a country" : "Select a region first"}</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {selectedRegion ? (
              <div className="mt-2 text-xs text-gray-500">Showing countries in {selectedRegion.name}</div>
            ) : null}
          </div>

          {/* Visa type */}
          <div className="rounded-2xl border p-5">
            <label className="text-sm font-medium">Visa type</label>
            <select
              className="mt-2 w-full rounded-xl border px-3 py-2"
              value={visaTypeId}
              onChange={(e) => setVisaTypeId(e.target.value)}
              disabled={!countryId}
            >
              <option value="">{countryId ? "Select a visa type" : "Select a country first"}</option>
              {visaTypes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {selectedCountry ? (
              <div className="mt-2 text-xs text-gray-500">Showing visa types available for {selectedCountry.name}</div>
            ) : null}
          </div>

          {/* Next */}
          <div className="rounded-2xl border p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold">Next: View playbook</div>
              <div className="text-sm text-gray-600">
                We’ll show steps, documents, and then generate your checklist.
              </div>
            </div>

            <button
              disabled={!canContinue}
              className="rounded-xl bg-black text-white px-5 py-3 font-medium disabled:opacity-40"
              onClick={() => {
                if (!selectedCountry || !selectedVisaType) return;
                router.push(`/playbook?country=${selectedCountry.slug}&visa=${selectedVisaType.slug}`);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
