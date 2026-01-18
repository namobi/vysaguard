"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RegionKey =
  | "africa"
  | "asia"
  | "europe"
  | "north-america"
  | "south-america"
  | "oceania"
  | "middle-east";

type CountryOption = { value: string; label: string };

function humanize(slug: string) {
  return slug.replace(/-/g, " ");
}

export default function HomePage() {
  const router = useRouter();

  const regions: { value: RegionKey; label: string }[] = [
    { value: "africa", label: "Africa" },
    { value: "asia", label: "Asia" },
    { value: "europe", label: "Europe" },
    { value: "north-america", label: "North America" },
    { value: "south-america", label: "South America" },
    { value: "oceania", label: "Oceania" },
    { value: "middle-east", label: "Middle East" },
  ];

  const regionCountries: Record<RegionKey, CountryOption[]> = {
    africa: [
      { value: "nigeria", label: "Nigeria" },
      { value: "ghana", label: "Ghana" },
      { value: "kenya", label: "Kenya" },
      { value: "south-africa", label: "South Africa" },
      { value: "egypt", label: "Egypt" },
    ],
    asia: [
      { value: "india", label: "India" },
      { value: "china", label: "China" },
      { value: "philippines", label: "Philippines" },
      { value: "japan", label: "Japan" },
      { value: "singapore", label: "Singapore" },
    ],
    europe: [
      { value: "united-kingdom", label: "United Kingdom" },
      { value: "france", label: "France" },
      { value: "germany", label: "Germany" },
      { value: "italy", label: "Italy" },
      { value: "spain", label: "Spain" },
    ],
    "north-america": [
      { value: "united-states", label: "United States" },
      { value: "canada", label: "Canada" },
      { value: "mexico", label: "Mexico" },
    ],
    "south-america": [
      { value: "brazil", label: "Brazil" },
      { value: "argentina", label: "Argentina" },
      { value: "colombia", label: "Colombia" },
      { value: "chile", label: "Chile" },
    ],
    oceania: [
      { value: "australia", label: "Australia" },
      { value: "new-zealand", label: "New Zealand" },
      { value: "fiji", label: "Fiji" },
    ],
    "middle-east": [
      { value: "united-arab-emirates", label: "United Arab Emirates" },
      { value: "saudi-arabia", label: "Saudi Arabia" },
      { value: "qatar", label: "Qatar" },
      { value: "israel", label: "Israel" },
    ],
  };

  const visaTypes = [
    { value: "tourist", label: "Tourist" },
    { value: "business", label: "Business" },
    { value: "study", label: "Study" },
    { value: "work", label: "Work" },
    { value: "transit", label: "Transit" },
    { value: "family", label: "Family / Visit" },
  ];

  const [region, setRegion] = useState<RegionKey>("north-america");
  const [country, setCountry] = useState<string>("united-states");
  const [visa, setVisa] = useState<string>("tourist");
  const [aiQ, setAiQ] = useState<string>("");

  const availableCountries = useMemo(() => regionCountries[region] ?? [], [region]);

  // ensure selected country always valid for region
  useMemo(() => {
    const found = availableCountries.some((c) => c.value === country);
    if (!found && availableCountries.length) setCountry(availableCountries[0].value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const goFind = () => {
    const qs = new URLSearchParams({
      region,
      country,
      visa,
    });
    router.push(`/find?${qs.toString()}`);
  };

  const goAsk = () => {
    const q = aiQ.trim();
    if (!q) return;
    const qs = new URLSearchParams({ q });
    router.push(`/ask?${qs.toString()}`);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Top Nav */}
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-black" />
          <div className="font-semibold text-lg">VysaGuard</div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/find"
            className="hidden sm:inline-flex rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Search Requirements
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Sign up
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="rounded-3xl border bg-gradient-to-b from-gray-50 to-white p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Verified guidance • Anti-scam protection
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Simplify your visa journey.
              </h1>

              <p className="text-gray-600 text-lg">
                Search visa requirements by region, country and visa type — and ask our AI for clear answers
                before you pay any agent.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={goFind}
                  className="rounded-2xl bg-black text-white px-5 py-3 font-semibold hover:opacity-90"
                >
                  Quick Search
                </button>
                <Link
                  href="/signup"
                  className="rounded-2xl border border-gray-300 px-5 py-3 font-semibold hover:bg-gray-50"
                >
                  Create free account
                </Link>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="font-semibold">Requirements</div>
                  <div className="text-gray-600 mt-1">Fast checklist + clarity</div>
                </div>
                <div className="rounded-2xl border bg-white p-4">
                  <div className="font-semibold">Verified Help</div>
                  <div className="text-gray-600 mt-1">Hire safely (later)</div>
                </div>
                <div className="rounded-2xl border bg-white p-4">
                  <div className="font-semibold">Anti-Scam</div>
                  <div className="text-gray-600 mt-1">Avoid WhatsApp traps</div>
                </div>
              </div>
            </div>

            {/* Right column: Quick Search + Ask AI */}
            <div className="space-y-4">
              {/* Quick Visa Search */}
              <div className="rounded-3xl border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">Quick visa search</div>
                  <div className="text-xs text-gray-500">MVP</div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Region</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value as RegionKey)}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    >
                      {regions.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Destination country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    >
                      {availableCountries.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Visa type</label>
                    <select
                      value={visa}
                      onChange={(e) => setVisa(e.target.value)}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    >
                      {visaTypes.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    Showing: <span className="font-semibold">{humanize(region)}</span> •{" "}
                    <span className="font-semibold">{humanize(country)}</span> •{" "}
                    <span className="font-semibold">{humanize(visa)}</span>
                  </div>

                  <button
                    onClick={goFind}
                    className="rounded-2xl bg-black text-white px-5 py-3 text-sm font-semibold hover:opacity-90"
                  >
                    View requirements
                  </button>
                </div>
              </div>

              {/* Ask AI */}
              <div className="rounded-3xl border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">Ask Vysa AI</div>
                  <div className="text-xs text-gray-500">Visa questions</div>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Ask about documents, timelines, costs, interview prep, red flags, and scams.
                </p>

                <div className="mt-4 flex gap-2">
                  <input
                    value={aiQ}
                    onChange={(e) => setAiQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") goAsk();
                    }}
                    className="w-full rounded-2xl border px-4 py-3 text-sm"
                    placeholder="e.g., What documents do I need for a US tourist visa from Nigeria?"
                  />
                  <button
                    onClick={goAsk}
                    className="rounded-2xl bg-black text-white px-5 py-3 text-sm font-semibold hover:opacity-90"
                  >
                    Ask
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Tip: You can also ask for a checklist and we’ll generate one inside your dashboard after signup.
                </div>
              </div>

              {/* Safety Notice */}
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm">
                <div className="font-semibold">Safety notice</div>
                <div className="text-gray-700 mt-1">
                  Never send money via WhatsApp/bank transfers. Use protected payments inside the platform (coming soon).
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-gray-500">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} VysaGuard</div>
          <div className="flex gap-4">
            <Link className="hover:underline" href="/find">
              Requirements
            </Link>
            <Link className="hover:underline" href="/login">
              Login
            </Link>
            <Link className="hover:underline" href="/signup">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
