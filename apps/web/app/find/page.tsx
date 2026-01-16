"use client";

import { useState } from "react";
import Link from "next/link";

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Schengen", "Australia"];
const VISA_TYPES = ["Tourist", "Work", "Study", "Permanent Residency"];

export default function FindPage() {
  const [country, setCountry] = useState("");
  const [visaType, setVisaType] = useState("");

  const canContinue = country && visaType;

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
          Choose a destination and visa type. Next, we’ll generate your structured playbook + checklist.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-2xl border p-5">
            <label className="text-sm font-medium">Destination</label>
            <select
              className="mt-2 w-full rounded-xl border px-3 py-2"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Select a country/region</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border p-5">
            <label className="text-sm font-medium">Visa type</label>
            <select
              className="mt-2 w-full rounded-xl border px-3 py-2"
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
            >
              <option value="">Select a visa type</option>
              {VISA_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

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
              onClick={() => alert(`Next: ${country} • ${visaType}`)}
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
