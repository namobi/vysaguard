"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import NotificationBell from "@/app/components/NotificationBell";

type ChecklistRow = {
  id: string;
  country: string;
  visa: string;
  title: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ChecklistItemRow = {
  checklist_id: string;
  required: boolean;
  status: "todo" | "uploaded" | "verified";
};

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

type MyRequest = {
  id: string;
  subject: string;
  status: string;
  provider_note: string | null;
  created_at: string;
  providers: { business_name: string; provider_type: string } | null;
};

function humanize(slug: string) {
  return (slug ?? "").replace(/-/g, " ");
}

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function formatLastUpdated(iso?: string | null) {
  if (!iso) return "Recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatActivityAction(action: string, entityType: string | null, metadata: any): string {
  switch (action) {
    case "checklist_created":
      return "Created a new checklist";
    case "checklist_synced": {
      const added = metadata?.items_added ?? 0;
      return `Synced checklist to v${metadata?.to_version ?? "?"}${added > 0 ? ` (+${added} items)` : ""}`;
    }
    case "item_uploaded":
      return `Uploaded a document${metadata?.file_name ? `: ${metadata.file_name}` : ""}`;
    case "item_status_changed":
      return `Updated item status to ${metadata?.new_status ?? "unknown"}`;
    default:
      return action.replace(/_/g, " ");
  }
}

export default function ApplicantDashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [userName, setUserName] = useState("Chris");
  const [plan, setPlan] = useState("Free");

  const [activeChecklists, setActiveChecklists] = useState<ChecklistSummary[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);

  // ✅ Auth gate + load data
  useEffect(() => {
    const run = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (!session) {
          router.replace("/login");
          return;
        }

        // Optional: show an email prefix as name
        const email = session.user.email ?? "";
        if (email.includes("@")) setUserName(email.split("@")[0]);
        setPlan("Free");

        setCheckingAuth(false);

        // Load checklists for this user (RLS should enforce user scope)
        const { data: cl, error: e1 } = await supabase
          .from("checklists")
          .select("id,country,visa,title,created_at")
          .order("created_at", { ascending: false });

        if (e1) throw e1;

        const checklistRows = (cl ?? []) as ChecklistRow[];

        if (!checklistRows.length) {
          setActiveChecklists([]);
          setActivity([
            { id: "w1", text: "No checklists yet — start your first one from Visa Search.", time: "Now" },
          ]);
          setLoadingData(false);
          return;
        }

        const ids = checklistRows.map((r) => r.id);

        // Pull required item statuses to compute progress
        const { data: items, error: e2 } = await supabase
          .from("checklist_items")
          .select("checklist_id,required,status")
          .in("checklist_id", ids);

        if (e2) throw e2;

        const itemRows = (items ?? []) as ChecklistItemRow[];

        // Aggregate progress per checklist_id
        const agg: Record<
          string,
          { requiredTotal: number; requiredDone: number }
        > = {};

        for (const it of itemRows) {
          if (!agg[it.checklist_id]) agg[it.checklist_id] = { requiredTotal: 0, requiredDone: 0 };
          if (it.required) {
            agg[it.checklist_id].requiredTotal += 1;
            if (it.status !== "todo") agg[it.checklist_id].requiredDone += 1;
          }
        }

        const summaries: ChecklistSummary[] = checklistRows.map((r) => {
          const a = agg[r.id] ?? { requiredTotal: 0, requiredDone: 0 };
          const progressPct = pct(a.requiredDone, a.requiredTotal);
          return {
            id: r.id,
            country: r.country,
            visa: r.visa,
            title: r.title || `${humanize(r.country)} ${humanize(r.visa)}`,
            requiredDone: a.requiredDone,
            requiredTotal: a.requiredTotal,
            progressPct,
            lastUpdated: formatLastUpdated(r.created_at),
          };
        });

        setActiveChecklists(summaries);

        // Load real activity from activity_log table
        const { data: activityData } = await supabase
          .from("activity_log")
          .select("id,action,entity_type,metadata,created_at")
          .order("created_at", { ascending: false })
          .limit(10);

        if (activityData && activityData.length > 0) {
          setActivity(
            activityData.map((a: any) => ({
              id: a.id,
              text: formatActivityAction(a.action, a.entity_type, a.metadata),
              time: formatLastUpdated(a.created_at),
            }))
          );
        } else {
          // Fallback if no activity yet
          setActivity([
            { id: "a1", text: `You have ${summaries.length} active checklist(s)`, time: "Just now" },
          ]);
        }

        // Load user's assistance requests
        const reqRes = await fetch("/api/assistance-requests?role=applicant", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          setMyRequests(reqData.requests ?? []);
        }

        setLoadingData(false);
      } catch (err) {
        console.error("Dashboard load failed:", err);
        alert("Dashboard load failed (check console).");
        setLoadingData(false);
        setCheckingAuth(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const stats = useMemo(() => {
    const total = activeChecklists.length;
    const completed = activeChecklists.filter((c) => c.requiredTotal > 0 && c.requiredDone === c.requiredTotal).length;
    const inProgress = total - completed;

    const avg = total
      ? Math.round(activeChecklists.reduce((sum, c) => sum + (c.progressPct || 0), 0) / total)
      : 0;

    return { total, completed, inProgress, avg };
  }, [activeChecklists]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#F5F7FB]">
        <div className="mx-auto max-w-7xl px-6 py-10 text-gray-600">Checking session…</div>
      </main>
    );
  }

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
              {plan} Plan
            </div>

            <NotificationBell />

            <button
              onClick={onLogout}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Logout
            </button>

            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-[#0B1B3A]">{userName}</div>
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
              <div className="text-xl font-semibold">{userName}</div>

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
                    href="/find"
                    className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                  >
                    Start / continue checklist
                  </Link>
                </div>
              </div>
            </div>

            <nav className="px-3 py-4 space-y-1">
              <NavItem label="Dashboard" active href="/dashboard" />
              <NavItem label="My Checklists" href="/dashboard#checklists" />
              <NavItem label="Visa Search" href="/find" />
              <NavItem label="Hire Help" href="/providers" />
              <NavItem label="Notifications" href="/notifications" />
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
                    Manage checklists, track progress, and get clear guidance.
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
                    href="/find"
                    className="rounded-xl bg-[#0B1B3A] text-white px-4 py-3 font-semibold text-sm hover:opacity-95"
                  >
                    Start a checklist
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Active checklists" value={`${stats.total}`} sub="Total" />
                <StatCard title="In progress" value={`${stats.inProgress}`} sub="Not completed" />
                <StatCard title="Completed" value={`${stats.completed}`} sub="All required done" />
                <StatCard title="Avg completion" value={`${stats.avg}%`} sub="Across all" />
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

                {loadingData ? (
                  <div className="p-6 text-gray-600">Loading your checklists…</div>
                ) : activeChecklists.length === 0 ? (
                  <div className="p-6 text-gray-600">
                    No checklists yet. Go to{" "}
                    <Link className="underline" href="/find">
                      Visa Search
                    </Link>{" "}
                    to start one.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {activeChecklists.map((c) => (
                      <li key={c.id} className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm text-gray-500">
                              {humanize(c.country)} • {humanize(c.visa)}
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
                )}
              </div>

              {/* Right rail: actions + activity */}
              <div className="space-y-6">
                <div className="rounded-3xl bg-white shadow-sm border p-6">
                  <div className="text-sm text-gray-500">Suggested next</div>
                  <div className="text-lg font-semibold text-[#0B1B3A]">Action Items</div>

                  <div className="mt-4 space-y-3">
                    <ActionItem title="Complete required documents first" desc="Finish required items to unlock readiness." />
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
                  <div className="text-sm font-semibold text-[#9A3412]">Stay safe</div>
                  <div className="mt-2 text-sm text-[#7C2D12]">
                    Only work with verified providers on VysaGuard. Never send payments via WhatsApp or bank transfer.
                  </div>
                </div>
              </div>
            </div>

            {/* My Requests */}
            {myRequests.length > 0 && (
              <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
                <div className="px-6 py-5 border-b flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Help Requests</div>
                    <div className="text-lg font-semibold text-[#0B1B3A]">My Assistance Requests</div>
                  </div>
                  <Link href="/providers" className="text-sm font-semibold text-blue-600 hover:underline">
                    Find providers
                  </Link>
                </div>
                <ul className="divide-y">
                  {myRequests.slice(0, 5).map((r) => (
                    <li key={r.id} className="px-6 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#0B1B3A]">{r.subject}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {r.providers?.business_name ?? "Provider"} • {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </div>
                          {r.provider_note && (
                            <div className="text-xs text-gray-600 mt-1 italic">&quot;{r.provider_note}&quot;</div>
                          )}
                        </div>
                        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 shrink-0 ${
                          r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          r.status === "accepted" ? "bg-green-100 text-green-700" :
                          r.status === "declined" ? "bg-red-100 text-red-700" :
                          r.status === "completed" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
  const base = "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition";
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
