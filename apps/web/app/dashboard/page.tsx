"use client";

import Link from "next/link";
import { useMemo } from "react";

type ChecklistSummary = {
  id: string;
  country: string;
  visa: string;
  title: string;
  progressPct: number;
  requiredDone: number;
  requiredTotal: number;
  lastUpdated: string;
};

type ActivityItem = {
  id: string;
  text: string;
  time: string;
};

export default function ApplicantDashboardPage() {
  // ✅ Mock data for UI (we'll wire to Supabase after UI looks perfect)
  const activeChecklists: ChecklistSummary[] = useMemo(
    () => [
      {
        id: "1",
        country: "united-states",
        visa: "tourist-visa",
        title: "USA Tourist Visa",
        progressPct: 42,
        requiredDone: 5,
        requiredTotal: 12,
        lastUpdated: "Today, 9:12 AM",
      },
      {
        id: "2",
        country: "canada",
        visa: "study-visa",
        title: "Canada Study Visa",
        progressPct: 18,
        requiredDone: 2,
        requiredTotal: 11,
        lastUpdated: "Yesterday, 6:40 PM",
      },
    ],
    []
  );

  const activity: ActivityItem[] = useMemo(
    () => [
      { id: "a1", text: "Updated notes for Bank Statement", time: "10 mins ago" },
      { id: "a2", text: "Marked Passport as Uploaded", time: "1 hour ago" },
      { id: "a3", text: "Created checklist: USA Tourist Visa", time: "Yesterday" },
    ],
    []
  );

  const user = {
    name: "Chris",
    plan: "Free",
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      {/* Top header */}
      <header className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#0B1B3A] shadow-sm flex items-center justify-center text-white font-bold">
              V
            </div>
            <div>
              <div className="text-lg font-semibold text-[#0B1B3A]">VysaGuard</div>
              <div className="text-xs text-gray-500">Applicant Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-gray-600">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              {user.plan} Plan
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-[#0B1B3A]">{user.name}</div>
                <div className="text-xs text-gray-500">Applicant</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left Sidebar */}
          <aside className="rounded-3xl bg-[#0B1B3A] text-white shadow-sm overflow-hidden">
            <div className="px-5 py-5 border-b border-white/10">
              <div className="text-sm text-white/70">Welcome back</div>
              <div className="text-xl font-semibold">{user.name}</div>

              <div className="mt-4 rounded-2xl bg-white/10 p-4">
                <div className="text-sm font-semibold">Quick Actions</div>
                <div className="mt-3 grid gap-2">
                  <Link
                    href="/find"
                    className="rounded-xl bg-white text-[#0B1B3A] px-4 py-2 text-sm font-semibold hover:opacity-90"
                  >
                    Search visa requirements
                  </Link>
                  <Link
                    href="/checklist?country=united-states&visa=tourist-visa"
                    className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                  >
                    Continue checklist
                  </Link>
                </div>
              </div>
            </div>

            <nav className="px-3 py-4 space-y-1">
              <NavItem label="Dashboard" active href="/dashboard" />
              <NavItem label="My Checklists" href="/dashboard#checklists" />
              <NavItem label="Visa Search" href="/find" />
              <NavItem label="Messages (soon)" href="#" disabled />
              <NavItem label="Hire Help (soon)" href="#" disabled />
              <NavItem label="Settings (soon)" href="#" disabled />
            </nav>

            <div className="px-5 py-5 border-t border-white/10">
              <div className="text-xs text-white/70">Safety reminder</div>
              <div className="mt-2 text-sm">
                Never send payments via WhatsApp/bank transfer. Use in-app payments for protection.
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Hero / summary */}
            <div className="rounded-3xl bg-white shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Dashboard</div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#0B1B3A]">
                    Track your visa journey in one place
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Manage checklists, track progress, and get clear guidance. We’ll add uploads & verification next.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/find"
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-sm hover:bg-gray-50"
                  >
                    Find requirements
                  </Link>
                  <Link
                    href="/checklist?country=united-states&visa=tourist-visa"
                    className="rounded-xl bg-[#0B1B3A] text-white px-4 py-3 font-semibold text-sm hover:opacity-95"
                  >
                    Open checklist
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Active checklists" value={`${activeChecklists.length}`} sub="In progress" />
                <StatCard title="Pending tasks" value="8" sub="Mock for now" />
                <StatCard title="Risk alerts" value="0" sub="Good standing" />
              </div>
            </div>

            {/* Active checklists */}
            <div id="checklists" className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
              <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
                <div className="px-6 py-5 border-b flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Your Work</div>
                    <div className="text-lg font-semibold text-[#0B1B3A]">Active Checklists</div>
                  </div>
                  <Link
                    href="/find"
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                  >
                    + New checklist
                  </Link>
                </div>

                <ul className="divide-y">
                  {activeChecklists.map((c) => (
                    <li key={c.id} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm text-gray-500">
                            {c.country.replace(/-/g, " ")} • {c.visa.replace(/-/g, " ")}
                          </div>
                          <div className="mt-1 text-lg font-semibold text-[#0B1B3A]">{c.title}</div>
                          <div className="mt-2 text-sm text-gray-600">
                            {c.requiredDone}/{c.requiredTotal} required docs completed • Updated {c.lastUpdated}
                          </div>

                          <div className="mt-4">
                            <div className="h-3 rounded-full bg-gray-100 border overflow-hidden">
                              <div className="h-full bg-[#0B1B3A]" style={{ width: `${c.progressPct}%` }} />
                            </div>
                            <div className="mt-2 text-sm text-gray-600">{c.progressPct}%</div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <Link
                            href={`/checklist?country=${c.country}&visa=${c.visa}`}
                            className="rounded-xl bg-[#0B1B3A] text-white px-4 py-3 text-sm font-semibold hover:opacity-95"
                          >
                            Continue
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right rail: actions + activity */}
              <div className="space-y-6">
                <div className="rounded-3xl bg-white shadow-sm border p-6">
                  <div className="text-sm text-gray-500">Suggested next</div>
                  <div className="text-lg font-semibold text-[#0B1B3A]">Action Items</div>

                  <div className="mt-4 space-y-3">
                    <ActionItem
                      title="Complete required documents first"
                      desc="Focus on required items to unlock submission readiness."
                    />
                    <ActionItem title="Add notes where needed" desc="Track gaps (e.g., updated statements)." />
                    <ActionItem title="Use only safe payments" desc="Avoid off-platform payment requests." />
                  </div>
                </div>

                <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
                  <div className="px-6 py-5 border-b">
                    <div className="text-sm text-gray-500">Recent</div>
                    <div className="text-lg font-semibold text-[#0B1B3A]">Activity</div>
                  </div>
                  <ul className="divide-y">
                    {activity.map((a) => (
                      <li key={a.id} className="px-6 py-4">
                        <div className="text-sm font-semibold text-[#0B1B3A]">{a.text}</div>
                        <div className="text-xs text-gray-500 mt-1">{a.time}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl bg-[#FFF7ED] border border-[#FED7AA] p-6">
                  <div className="text-sm font-semibold text-[#9A3412]">Don’t fall for scams</div>
                  <div className="mt-2 text-sm text-[#7C2D12]">
                    If any “agent” asks for WhatsApp transfer, refuse. We’ll add in-app escrow + verified providers next.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="text-sm text-gray-500 px-1">
              MVP note: This dashboard is UI-first. Next step is connecting it to Supabase + adding Auth.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function NavItem({
  label,
  href,
  active,
  disabled,
}: {
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
}) {
  const base =
    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition";
  const cls = disabled
    ? `${base} text-white/40 cursor-not-allowed`
    : active
    ? `${base} bg-white/10 text-white`
    : `${base} text-white/80 hover:bg-white/10 hover:text-white`;

  if (disabled) {
    return (
      <div className={cls}>
        <span className="h-2 w-2 rounded-full bg-white/30" />
        {label}
      </div>
    );
  }

  return (
    <Link className={cls} href={href}>
      <span className={`h-2 w-2 rounded-full ${active ? "bg-green-400" : "bg-white/30"}`} />
      {label}
    </Link>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-bold text-[#0B1B3A]">{value}</div>
      <div className="mt-2 text-sm text-gray-600">{sub}</div>
    </div>
  );
}

function ActionItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm font-semibold text-[#0B1B3A]">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{desc}</div>
    </div>
  );
}
