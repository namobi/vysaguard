"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  status: "todo" | "uploaded" | "verified";
  notes?: string;
};

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export default function ChecklistPage() {
  const sp = useSearchParams();
  const country = sp.get("country") ?? "unknown-country";
  const visa = sp.get("visa") ?? "unknown-visa";

  // Mock generator (we’ll replace with real playbook data later)
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

    // Tiny variation by visa type (just to feel real)
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

  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const requiredItems = items.filter((i) => i.required);
  const completedRequired = requiredItems.filter((i) => i.status !== "todo").length;
  const progress = pct(completedRequired, requiredItems.length);

  const setStatus = (id: string, status: ChecklistItem["status"]) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const setNotes = (id: string, notes: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, notes } : i)));
  };

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
            Checklist • {country.replace(/-/g, " ")} • {visa.replace(/-/g, " ")}
          </div>
          <h1 className="text-3xl font-bold">Your smart checklist</h1>
          <p className="text-gray-600">
            Track required and optional documents. We’ll later add uploads + verification + provider review.
          </p>
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
                  <div>
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
