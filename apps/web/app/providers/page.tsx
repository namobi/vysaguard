"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProviderListing = {
  id: string;
  business_name: string;
  bio: string | null;
  provider_type: string;
  years_experience: number | null;
  languages: string[];
  avg_rating: number | null;
  review_count: number;
  service_areas: { country_name: string | null; visa_type_name: string | null }[];
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set("provider_type", typeFilter);

      const res = await fetch(`/api/providers/list?${params.toString()}`);
      const data = await res.json();
      if (data.providers) setProviders(data.providers);
      setLoading(false);
    };
    load();
  }, [typeFilter]);

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl text-[#0B1B3A]">VysaGuard</Link>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:underline">Dashboard</Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1B3A]">Find Trusted Providers</h1>
          <p className="mt-2 text-gray-600">Browse verified immigration agents and lawyers.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setTypeFilter("")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold border ${!typeFilter ? "bg-[#0B1B3A] text-white border-[#0B1B3A]" : "bg-white border-gray-300"}`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter("agent")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold border ${typeFilter === "agent" ? "bg-[#0B1B3A] text-white border-[#0B1B3A]" : "bg-white border-gray-300"}`}
          >
            Agents
          </button>
          <button
            onClick={() => setTypeFilter("lawyer")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold border ${typeFilter === "lawyer" ? "bg-[#0B1B3A] text-white border-[#0B1B3A]" : "bg-white border-gray-300"}`}
          >
            Lawyers
          </button>
          <button
            onClick={() => setTypeFilter("consultant")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold border ${typeFilter === "consultant" ? "bg-[#0B1B3A] text-white border-[#0B1B3A]" : "bg-white border-gray-300"}`}
          >
            Consultants
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-gray-600">Loading providers...</div>
        ) : providers.length === 0 ? (
          <div className="rounded-3xl bg-white border p-8 text-center">
            <div className="text-gray-500">No verified providers found.</div>
            <Link href="/provider-onboarding" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
              Become a provider
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <Link
                key={p.id}
                href={`/providers/${p.id}`}
                className="rounded-3xl bg-white shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-[#0B1B3A]">{p.business_name}</div>
                    <div className="text-sm text-gray-500 capitalize mt-0.5">{p.provider_type}</div>
                  </div>
                  {p.avg_rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 rounded-lg px-2 py-1">
                      <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-bold text-yellow-700">{p.avg_rating}</span>
                      <span className="text-xs text-gray-400">({p.review_count})</span>
                    </div>
                  )}
                </div>

                {p.bio && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{p.bio}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.service_areas.slice(0, 3).map((a, i) => (
                    <span key={i} className="text-xs rounded-lg bg-gray-100 px-2 py-1 text-gray-600">
                      {a.country_name}{a.visa_type_name ? ` • ${a.visa_type_name}` : ""}
                    </span>
                  ))}
                  {p.service_areas.length > 3 && (
                    <span className="text-xs rounded-lg bg-gray-100 px-2 py-1 text-gray-500">
                      +{p.service_areas.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  {p.years_experience && (
                    <span className="text-gray-500">{p.years_experience}+ years exp.</span>
                  )}
                  <span className="text-[#0B1B3A] font-semibold">View Profile →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
